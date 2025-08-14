import React, { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot, setDoc, collection, addDoc, query, deleteDoc, updateDoc, writeBatch, getDocs, Timestamp, increment } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import { motion, AnimatePresence } from 'framer-motion';

// FIX: Added missing component imports
import SideNav from '../components/dashboard/SideNav';
import Header from '../components/dashboard/Header';
import AttendancePage from './AttendancePage';
import PerformancePage from './PerformancePage';
import ProfilePage from './ProfilePage';
import CalendarPage from './CalendarPage';
import StudyPage from './StudyPage';
import HomePage from './HomePage';
import FloatingAddButton from '../components/dashboard/FloatingAddButton';
import AddCourseModal from '../components/modals/AddCourseModal';
import AddGradeModal from '../components/modals/AddGradeModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import ResetConfirmationModal from '../components/common/ResetConfirmationModal';
import AddEditClassModal from '../components/modals/AddEditClassModal';
import AddEditDeadlineModal from '../components/modals/AddEditDeadlineModal';
import AddEditMarksModal from '../components/modals/AddEditMarksModal';
import AddEditTaskModal from '../components/modals/AddEditTaskModal';
import TimetableModal from '../components/modals/TimetableModal';
import PomodoroModal from '../components/modals/PomodoroModal';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';

const GRADE_POINTS = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D+': 4, 'D': 3, 'F': 2 };

const COIN_VALUES = {
    MARK_ATTENDANCE: 5,
    DECREMENT_ATTENDANCE: -5,
    COMPLETE_TASK: 10,
    UNCOMPLETE_TASK: -10,
    FINISH_POMODORO: 25,
};

const Dashboard = ({ user, onSignOut }) => {
    const [allCourses, setAllCourses] = useState([]);
    const [profileData, setProfileData] = useState({ name: '', imageUrl: '' });
    const [schedule, setSchedule] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [examMarks, setExamMarks] = useState([]);
    const [tasks, setTasks] = useState([]);

    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
    const [isAddDeadlineModalOpen, setIsAddDeadlineModalOpen] = useState(false);
    const [isAddMarksModalOpen, setIsAddMarksModalOpen] = useState(false);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
    const [isPomodoroModalOpen, setIsPomodoroModalOpen] = useState(false);
    
    const [deadlineToEdit, setDeadlineToEdit] = useState(null);
    const [markToEdit, setMarkToEdit] = useState(null);
    const [courseToGrade, setCourseToGrade] = useState(null);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [classToEdit, setClassToEdit] = useState(null);

    const [currentPage, setCurrentPage] = useState('home');
    const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, message: '', onConfirm: () => {} });
    const [isCpiVisible, setIsCpiVisible] = useState(true);
    const [pomodoroConfig, setPomodoroConfig] = useState({ isActive: false, duration: 0 });

    useEffect(() => {
        const savedCpiVisibility = localStorage.getItem('cpiVisible');
        if (savedCpiVisibility !== null) {
            setIsCpiVisible(JSON.parse(savedCpiVisibility));
        }

        if (!user) return;
        const unsubCourses = onSnapshot(query(collection(db, `artifacts/${appId}/users/${user.uid}/courses`)), (snapshot) => {
            setAllCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubProfile = onSnapshot(doc(db, `artifacts/${appId}/users/${user.uid}/profile/data`), (doc) => {
            if (doc.exists()) {
                setProfileData(doc.data());
            } else { 
                setDoc(doc.ref, { name: user.displayName || 'User', email: user.email || '', imageUrl: user.photoURL || '', coins: 0 });
            }
        });
        const unsubSchedule = onSnapshot(query(collection(db, `artifacts/${appId}/users/${user.uid}/schedule`)), (snapshot) => {
            setSchedule(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubDeadlines = onSnapshot(query(collection(db, `artifacts/${appId}/users/${user.uid}/deadlines`)), (snapshot) => {
            setDeadlines(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubExamMarks = onSnapshot(query(collection(db, `artifacts/${appId}/users/${user.uid}/examMarks`)), (snapshot) => {
            setExamMarks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubTasks = onSnapshot(query(collection(db, `artifacts/${appId}/users/${user.uid}/tasks`)), (snapshot) => {
            setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => { unsubCourses(); unsubProfile(); unsubSchedule(); unsubDeadlines(); unsubExamMarks(); unsubTasks(); };
    }, [user]);

    const performanceData = useMemo(() => {
        const gradedCourses = allCourses.filter(c => c.grade && c.credits > 0);
        if (gradedCourses.length === 0) return { cpi: '0.0', semesters: [] };
        let cumulativeWeightedPoints = 0, cumulativeCredits = 0;
        const semestersMap = new Map();
        gradedCourses.forEach(course => {
            const weightedPoints = course.credits * (GRADE_POINTS[course.grade] || 0);
            cumulativeWeightedPoints += weightedPoints;
            cumulativeCredits += course.credits;
            if (!semestersMap.has(course.semester)) semestersMap.set(course.semester, { totalWeightedPoints: 0, totalCredits: 0, courses: [] });
            const semData = semestersMap.get(course.semester);
            semData.totalWeightedPoints += weightedPoints;
            semData.totalCredits += course.credits;
            semData.courses.push(course);
        });
        const cpi = (cumulativeCredits > 0 ? cumulativeWeightedPoints / cumulativeCredits : 0).toFixed(1);
        const semesters = Array.from(semestersMap.entries()).map(([semNum, data]) => ({
            semester: semNum,
            spi: (data.totalCredits > 0 ? data.totalWeightedPoints / data.totalCredits : 0).toFixed(1),
            courses: data.courses.sort((a, b) => a.name.localeCompare(b.name))
        })).sort((a, b) => b.semester - a.semester);
        return { cpi, semesters };
    }, [allCourses]);

    const currentSemester = useMemo(() => {
        if (allCourses.length === 0) return 1;
        return Math.max(...allCourses.map(c => c.semester).filter(Boolean), 1);
    }, [allCourses]);

    const currentSemesterCourses = useMemo(() => {
        if (allCourses.length === 0) return [];
        return allCourses.filter(c => c.semester === currentSemester);
    }, [allCourses, currentSemester]);

    const updateCoins = async (amount) => {
        if (!user || amount === 0) return;
        const profileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/data`);
        await updateDoc(profileRef, {
            coins: increment(amount)
        });
    };

    const handleSaveCourse = async (courseData) => {
        if (!user) return;
        const { grade, ...restOfCourseData } = courseData;
        const path = `artifacts/${appId}/users/${user.uid}/courses`;
        const dataToSave = { 
            ...restOfCourseData, 
            grade: grade === "Not Published" ? null : grade,
            lastAttended: null, 
            attended: 0, 
            total: 0, 
            attendanceCountToday: 0,
            isHidden: false
        };
        await addDoc(collection(db, path), dataToSave);
    };
    
    const handleSaveProfileField = async (field, value) => {
        if (!user) return;
        const profileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/data`);
        await updateDoc(profileRef, { [field]: value });
    };

    const handleSaveGrade = async (courseId, grade) => {
        if (!user) return;
        const courseRef = doc(db, `artifacts/${appId}/users/${user.uid}/courses`, courseId);
        await updateDoc(courseRef, { grade });
    };

    const handleSaveClass = async (scheduleData, classId) => {
        if (!user) return;
        const path = `artifacts/${appId}/users/${user.uid}/schedule`;
        if (classId) {
            await updateDoc(doc(db, path, classId), scheduleData);
        } else {
            await addDoc(collection(db, path), scheduleData);
        }
    };

    const handleSaveDeadline = async (deadlineData, deadlineId) => {
        if (!user) return;
        const path = `artifacts/${appId}/users/${user.uid}/deadlines`;
        if (deadlineId) {
            await updateDoc(doc(db, path, deadlineId), deadlineData);
        } else {
            await addDoc(collection(db, path), deadlineData);
        }
    };
    
    const handleSaveExamMark = async (markData, markId) => {
        if (!user) return;
        const path = `artifacts/${appId}/users/${user.uid}/examMarks`;
        if (markId) {
            await updateDoc(doc(db, path, markId), markData);
        } else {
            await addDoc(collection(db, path), markData);
        }
    };

    const handleSaveTask = async (taskData, taskId) => {
        if (!user) return;
        const path = `artifacts/${appId}/users/${user.uid}/tasks`;
        const dataToSave = { ...taskData };
        if (taskData.type === 'Short-term') {
            dataToSave.dueDate = null;
        }
        if (taskId) {
            await updateDoc(doc(db, path, taskId), dataToSave);
        } else {
            await addDoc(collection(db, path), { ...dataToSave, isCompleted: false, completedAt: null });
        }
    };

    const handleToggleTaskComplete = async (taskId, isCompleted) => {
        if (!user) return;
        const taskRef = doc(db, `artifacts/${appId}/users/${user.uid}/tasks`, taskId);
        await updateDoc(taskRef, {
            isCompleted,
            completedAt: isCompleted ? Timestamp.now() : null
        });
        updateCoins(isCompleted ? COIN_VALUES.COMPLETE_TASK : COIN_VALUES.UNCOMPLETE_TASK);
    };

    const handleUpdateAttendance = async (courseId, updatedData) => {
        if (!user) return;
        await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/courses`, courseId), updatedData);
    };

    const handleToggleCourseVisibility = async (courseId, isHidden) => {
        if (!user) return;
        const courseRef = doc(db, `artifacts/${appId}/users/${user.uid}/courses`, courseId);
        await updateDoc(courseRef, { isHidden: !isHidden });
    };

    const handleDecrementAttendance = async (course) => {
        if (!user || (course.attended || 0) <= 0) return;
        const courseRef = doc(db, `artifacts/${appId}/users/${user.uid}/courses`, course.id);
        await updateDoc(courseRef, {
            attended: increment(-1),
        });
        updateCoins(COIN_VALUES.DECREMENT_ATTENDANCE);
    };

    const handleTotalChange = (course, change) => {
        const newTotal = (course.total || 0) + change;
        if (newTotal < course.attended || newTotal < 0) return;
        handleUpdateAttendance(course.id, { total: newTotal });
    };

    const handleMarkAttendance = (course) => {
        if (!user) return;
        const courseRef = doc(db, `artifacts/${appId}/users/${user.uid}/courses`, course.id);
        updateDoc(courseRef, {
            attended: increment(1),
            total: increment(1),
        });
        updateCoins(COIN_VALUES.MARK_ATTENDANCE);
    };

    const handleDeleteCourse = (courseId, courseName) => {
        setConfirmationModal({
            isOpen: true,
            message: `Are you sure you want to delete all data for "${courseName}"?`,
            onConfirm: async () => {
                if (!user) return;
                await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/courses`, courseId));
                setConfirmationModal({ isOpen: false, message: '', onConfirm: () => {} });
            }
        });
    };
    
    const handleDeleteDeadline = async (deadlineId) => {
        if (!user) return;
        await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/deadlines`, deadlineId));
    };

    const handleDeleteExamMark = async (markId) => {
        if (!user) return;
        await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/examMarks`, markId));
    };

    const handleDeleteTask = async (taskId) => {
        if (!user) return;
        await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/tasks`, taskId));
    };

    const handleResetData = async () => {
        if (!user) return;
        
        const collectionsToDelete = ['courses', 'schedule', 'deadlines', 'examMarks', 'tasks'];
        for (const coll of collectionsToDelete) {
            const ref = collection(db, `artifacts/${appId}/users/${user.uid}/${coll}`);
            const snapshot = await getDocs(ref);
            const batch = writeBatch(db);
            snapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }

        const profileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/data`);
        await setDoc(profileRef, { name: user.displayName || 'User', coins: 0, imageUrl: user.photoURL || '' });

        setIsResetModalOpen(false);
        setCurrentPage('attendance');
    };

    const handleToggleCpiVisibility = () => {
        const newVisibility = !isCpiVisible;
        setIsCpiVisible(newVisibility);
        localStorage.setItem('cpiVisible', JSON.stringify(newVisibility));
    };

    const handleStartPomodoro = (duration) => {
        setIsPomodoroModalOpen(false);
        setPomodoroConfig({ isActive: true, duration });
    };

    const handleClosePomodoro = ({ completed }) => {
        setPomodoroConfig({ isActive: false, duration: 0 });
        if (completed) {
            updateCoins(COIN_VALUES.FINISH_POMODORO);
        }
    };

    const handleEditGradeClick = (course) => { 
        setCourseToGrade(course);
        setIsGradeModalOpen(true); 
    };
    const handleAddNewCourse = () => { setIsCourseModalOpen(true); };
    const handleAddDeadlineClick = () => { setDeadlineToEdit(null); setIsAddDeadlineModalOpen(true); };
    const handleEditDeadlineClick = (deadline) => { setDeadlineToEdit(deadline); setIsAddDeadlineModalOpen(true); };
    
    const handleAddExamMarksClick = () => { 
        setMarkToEdit(null); 
        setIsAddMarksModalOpen(true); 
    };

    const handleEditExamMarkClick = (mark) => { 
        setMarkToEdit(mark); 
        setIsAddMarksModalOpen(true); 
    };

    const handleAddMarksForCourseClick = (course) => {
        setMarkToEdit({ courseId: course.id });
        setIsAddMarksModalOpen(true);
    };

    const handleAddTaskClick = () => { setTaskToEdit(null); setIsAddTaskModalOpen(true); };
    const handleEditTaskClick = (task) => { setTaskToEdit(task); setIsAddTaskModalOpen(true); };
    const handleAddClassClick = () => { setClassToEdit(null); setIsAddClassModalOpen(true); };
    const handleEditClassClick = (classItem) => { setClassToEdit(classItem); setIsAddClassModalOpen(true); };

    const pageVariants = {
        initial: { opacity: 0 },
        in: { opacity: 1 },
        out: { opacity: 0 },
    };

    const pageTransition = {
        type: 'tween',
        ease: 'linear',
        duration: 0.1,
    };

    return (
        <>
            <div className="min-h-screen bg-black text-white font-sans flex">
                <SideNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
                <div className="flex-1 pl-28">
                    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 pb-10">
                        <Header 
                            currentPage={currentPage} 
                            profileData={profileData} 
                            onAddNewCourse={handleAddNewCourse} 
                            onOpenTimetable={() => setIsTimetableModalOpen(true)}
                            onOpenPomodoro={() => setIsPomodoroModalOpen(true)}
                        />
                        <main>
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={currentPage} 
                                    initial="initial"
                                    animate="in"
                                    exit="out"
                                    variants={pageVariants}
                                    transition={pageTransition}
                                >
                                    {currentPage === 'home' && <HomePage 
                                        profileData={profileData} 
                                        schedule={schedule} 
                                        deadlines={deadlines} 
                                        tasks={tasks} 
                                        courses={allCourses}
                                        performanceData={performanceData}
                                        isCpiVisible={isCpiVisible}
                                        onToggleCpiVisibility={handleToggleCpiVisibility}
                                    />}
                                    {currentPage === 'attendance' && <AttendancePage 
                                        allCourses={allCourses} 
                                        onAddNew={handleAddNewCourse} 
                                        onMarkAttendance={handleMarkAttendance} 
                                        onTotalChange={handleTotalChange} 
                                        onDecrementAttendance={handleDecrementAttendance} 
                                        onDeleteCourse={handleDeleteCourse} 
                                        onToggleVisibility={handleToggleCourseVisibility}
                                    />}
                                    {currentPage === 'performance' && <PerformancePage 
                                        performanceData={performanceData} 
                                        allCourses={allCourses} 
                                        examMarks={examMarks} 
                                        onDeleteCourse={handleDeleteCourse} 
                                        onEditGrade={handleEditGradeClick} 
                                        onAddExamMarks={handleAddExamMarksClick} 
                                        onEditExamMark={handleEditExamMarkClick} 
                                        onDeleteExamMark={handleDeleteExamMark} 
                                        onAddMarksForCourse={handleAddMarksForCourseClick}
                                    />}
                                    {currentPage === 'calendar' && <CalendarPage schedule={schedule} deadlines={deadlines} onAddClass={handleAddClassClick} onEditClass={handleEditClassClick} onAddDeadline={handleAddDeadlineClick} onDeleteDeadline={handleDeleteDeadline} onEditDeadline={handleEditDeadlineClick} courses={allCourses} />}
                                    {currentPage === 'study' && <StudyPage tasks={tasks} onAddTask={handleAddTaskClick} onEditTask={handleEditTaskClick} onDeleteTask={handleDeleteTask} onToggleComplete={handleToggleTaskComplete} />}
                                    {currentPage === 'profile' && <ProfilePage 
                                        profileData={profileData} 
                                        onSaveField={handleSaveProfileField} 
                                        onResetData={() => setIsResetModalOpen(true)} 
                                        onSignOut={onSignOut} 
                                        currentSemester={currentSemester}
                                        currentSemesterCourses={currentSemesterCourses}
                                        onAddNewCourse={handleAddNewCourse}
                                    />}
                                </motion.div>
                            </AnimatePresence>
                        </main>
                    </div>
                </div>
            </div>
            
            {currentPage !== 'profile' && (
                <FloatingAddButton 
                    onAddCourse={handleAddNewCourse}
                    onAddExamMarks={handleAddExamMarksClick}
                    onAddGrade={() => setIsGradeModalOpen(true)}
                    onAddDeadline={handleAddDeadlineClick}
                    onAddTask={handleAddTaskClick}
                />
            )}
            
            <AddCourseModal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} onSave={handleSaveCourse} currentSemester={currentSemester} />
            <AddGradeModal isOpen={isGradeModalOpen} onClose={() => setIsGradeModalOpen(false)} onSave={handleSaveGrade} allCourses={allCourses} courseToEdit={courseToGrade} />
            <AddEditClassModal isOpen={isAddClassModalOpen} onClose={() => setIsAddClassModalOpen(false)} onSave={handleSaveClass} currentCourses={currentSemesterCourses} classToEdit={classToEdit} />
            <AddEditDeadlineModal isOpen={isAddDeadlineModalOpen} onClose={() => setIsAddDeadlineModalOpen(false)} onSave={handleSaveDeadline} currentCourses={currentSemesterCourses} deadlineToEdit={deadlineToEdit} />
            <AddEditMarksModal isOpen={isAddMarksModalOpen} onClose={() => setIsAddMarksModalOpen(false)} onSave={handleSaveExamMark} allCourses={allCourses} markToEdit={markToEdit} currentSemester={currentSemester} />
            <AddEditTaskModal isOpen={isAddTaskModalOpen} onClose={() => setIsAddTaskModalOpen(false)} onSave={handleSaveTask} taskToEdit={taskToEdit} />
            <TimetableModal isOpen={isTimetableModalOpen} onClose={() => setIsTimetableModalOpen(false)} schedule={schedule} courses={allCourses} />
            <ConfirmationModal 
                isOpen={confirmationModal.isOpen} 
                onClose={() => setConfirmationModal({ isOpen: false, message: '', onConfirm: () => {} })} 
                onConfirm={confirmationModal.onConfirm} 
                message={confirmationModal.message} 
            />
            <ResetConfirmationModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={handleResetData}
            />
            <PomodoroModal 
                isOpen={isPomodoroModalOpen} 
                onClose={() => setIsPomodoroModalOpen(false)} 
                onStart={handleStartPomodoro} 
            />
            <AnimatePresence>
                {pomodoroConfig.isActive && (
                    <PomodoroTimer 
                        duration={pomodoroConfig.duration} 
                        onClose={handleClosePomodoro} 
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Dashboard;