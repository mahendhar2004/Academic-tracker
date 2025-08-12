import React, { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot, setDoc, collection, addDoc, query, deleteDoc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import { Plus, UserCircle2, ClipboardList, GraduationCap, Coins, Calendar } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

import AttendancePage from './AttendancePage';
import PerformancePage from './PerformancePage';
import ProfilePage from './ProfilePage';
import CalendarPage from './CalendarPage';
import AddCourseModal from '../components/modals/AddCourseModal';
import AddGradeModal from '../components/modals/AddGradeModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import ResetConfirmationModal from '../components/common/ResetConfirmationModal';
import AddClassModal from '../components/modals/AddClassModal';
import AddEditDeadlineModal from '../components/modals/AddEditDeadlineModal';
import EditProfileModal from '../components/modals/EditProfileModal';
import AddEditMarksModal from '../components/modals/AddEditMarksModal';

const GRADE_POINTS = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D+': 4, 'D': 3, 'F': 2 };

const Dashboard = ({ user, onSignOut }) => {
    const [allCourses, setAllCourses] = useState([]);
    const [profileData, setProfileData] = useState({ name: '', imageUrl: '', coins: 0 });
    const [schedule, setSchedule] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [examMarks, setExamMarks] = useState([]);

    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
    const [isAddDeadlineModalOpen, setIsAddDeadlineModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [isAddMarksModalOpen, setIsAddMarksModalOpen] = useState(false);
    
    const [deadlineToEdit, setDeadlineToEdit] = useState(null);
    const [markToEdit, setMarkToEdit] = useState(null);
    const [courseToGrade, setCourseToGrade] = useState(null);

    const [currentPage, setCurrentPage] = useState('attendance');
    const [expandedSemesters, setExpandedSemesters] = useState(new Set());
    const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, message: '', onConfirm: () => {} });

    useEffect(() => {
        if (!user) return;
        const unsubCourses = onSnapshot(query(collection(db, `artifacts/${appId}/users/${user.uid}/courses`)), (snapshot) => {
            setAllCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubProfile = onSnapshot(doc(db, `artifacts/${appId}/users/${user.uid}/profile/data`), (doc) => {
            if (doc.exists()) {
                setProfileData(doc.data());
            } else { 
                setDoc(doc.ref, { name: user.displayName || 'User', imageUrl: user.photoURL || '', coins: 0 });
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

        return () => { unsubCourses(); unsubProfile(); unsubSchedule(); unsubDeadlines(); unsubExamMarks(); };
    }, [user]);
    
    useEffect(() => {
        if (allCourses.length > 0 && expandedSemesters.size === 0) {
            const maxSemester = Math.max(...allCourses.map(c => c.semester).filter(Boolean), 0);
            if (maxSemester > 0) setExpandedSemesters(new Set([maxSemester]));
        }
    }, [allCourses, expandedSemesters.size]);

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

    const currentSemesterCourses = useMemo(() => {
        if (allCourses.length === 0) return [];
        const maxSemester = Math.max(...allCourses.map(c => c.semester).filter(Boolean), 0);
        return allCourses.filter(c => c.semester === maxSemester);
    }, [allCourses]);

    const handleSaveCourse = async (courseData) => {
        if (!user) return;
        const { grade, ...restOfCourseData } = courseData;
        const path = `artifacts/${appId}/users/${user.uid}/courses`;
        const dataToSave = { 
            ...restOfCourseData, 
            grade: grade === "Not Published" ? null : grade,
            streak: 0, 
            lastAttended: null, 
            attended: 0, 
            total: 0, 
            attendanceCountToday: 0 
        };
        await addDoc(collection(db, path), dataToSave);
    };
    
    const handleSaveProfile = async (newProfileData) => {
        if (!user) return;
        await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/profile/data`), newProfileData, { merge: true });
    };

    const handleSaveGrade = async (courseId, grade) => {
        if (!user) return;
        const courseRef = doc(db, `artifacts/${appId}/users/${user.uid}/courses`, courseId);
        await updateDoc(courseRef, { grade });
    };

    const handleSaveClass = async (scheduleData) => {
        if (!user) return;
        await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/schedule`), scheduleData);
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

    const handleUpdateAttendance = async (courseId, updatedData) => {
        if (!user) return;
        await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/courses`, courseId), updatedData);
    };

    const handleDecrementAttendance = async (course) => {
        if (!user || (course.attended || 0) <= 0) return;

        const today = new Date().toISOString().split('T')[0];
        const attendanceCountToday = course.lastAttended === today ? (course.attendanceCountToday || 0) : 0;

        const courseRef = doc(db, `artifacts/${appId}/users/${user.uid}/courses`, course.id);
        await updateDoc(courseRef, {
            attended: (course.attended || 0) - 1,
            attendanceCountToday: attendanceCountToday > 0 ? attendanceCountToday - 1 : 0
        });
    };

    const handleTotalChange = (course, change) => {
        const newTotal = (course.total || 0) + change;
        if (newTotal < course.attended || newTotal < 0) return;

        const today = new Date().toISOString().split('T')[0];
        const attendedToday = course.lastAttended === today;

        let updateData = { total: newTotal };
        if (change > 0 && !attendedToday) {
            updateData.streak = 0;
        }
        handleUpdateAttendance(course.id, updateData);
    };

    const handleMarkAttendance = (course) => {
        if (!user) return 0;
        const today = new Date().toISOString().split('T')[0];
        const attendanceCountToday = course.lastAttended === today ? (course.attendanceCountToday || 0) : 0;

        if (attendanceCountToday >= 2) return 0;

        const performUpdate = (isDouble = false) => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toISOString().split('T')[0];

            const currentStreak = course.streak || 0;
            let newStreak = 1;
            if (attendanceCountToday === 0 && course.lastAttended === yesterdayString) {
                newStreak = currentStreak + 1;
            } else if (attendanceCountToday > 0) {
                newStreak = currentStreak;
            }
            
            const coinsToAdd = 10;

            const courseRef = doc(db, `artifacts/${appId}/users/${user.uid}/courses`, course.id);
            updateDoc(courseRef, {
                attended: (course.attended || 0) + 1,
                total: (course.total || 0) + 1,
                streak: newStreak,
                lastAttended: today,
                attendanceCountToday: attendanceCountToday + 1
            });

            const profileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/data`);
            updateDoc(profileRef, {
                coins: (profileData.coins || 0) + coinsToAdd
            });

            return coinsToAdd;
        };

        if (attendanceCountToday === 1) {
            setConfirmationModal({
                isOpen: true,
                message: "Did you attend the class twice today?",
                onConfirm: () => {
                    performUpdate(true);
                    setConfirmationModal({ isOpen: false, message: '', onConfirm: () => {} });
                }
            });
            return 0;
        } else {
            return performUpdate(false);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!user) return;
        await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/courses`, courseId));
    };
    
    const handleDeleteDeadline = async (deadlineId) => {
        if (!user) return;
        await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/deadlines`, deadlineId));
    };

    const handleDeleteExamMark = async (markId) => {
        if (!user) return;
        await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/examMarks`, markId));
    };

    const handleResetData = async () => {
        if (!user) return;
        
        const collectionsToDelete = ['courses', 'schedule', 'deadlines', 'examMarks'];
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

    const handleEditGradeClick = (course) => { 
        setCourseToGrade(course);
        setIsGradeModalOpen(true); 
    };
    const handleAddNewCourse = () => { setIsCourseModalOpen(true); };
    const handleEditProfileClick = () => { setIsEditProfileModalOpen(true); };
    const handleAddDeadlineClick = () => { setDeadlineToEdit(null); setIsAddDeadlineModalOpen(true); };
    const handleEditDeadlineClick = (deadline) => { setDeadlineToEdit(deadline); setIsAddDeadlineModalOpen(true); };
    const handleAddExamMarksClick = () => { setMarkToEdit(null); setIsAddMarksModalOpen(true); };
    const handleEditExamMarkClick = (mark) => { setMarkToEdit(mark); setIsAddMarksModalOpen(true); };

    const toggleSemester = (semester) => {
        setExpandedSemesters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(semester)) newSet.delete(semester);
            else newSet.add(semester);
            return newSet;
        });
    };

    const navItems = ['attendance', 'performance', 'calendar', 'profile'];

    return (
        <>
            <div className="min-h-screen bg-black text-white font-sans">
                <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-40">
                    <header className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCurrentPage('profile')} className="group">
                                {profileData.imageUrl ? (
                                    <img src={profileData.imageUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-white/20 group-hover:border-cyan-400 transition-colors" onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/64x64/111827/9ca3af?text=${profileData.name ? profileData.name.charAt(0).toUpperCase() : 'P'}`}} />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20 group-hover:border-cyan-400 transition-colors"><UserCircle2 className="w-8 h-8 text-slate-400" /></div>
                                )}
                            </motion.button>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome, {profileData.name || 'User'}</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-yellow-400 bg-black/20 px-3 py-2 rounded-lg border border-white/20">
                                <Coins size={20} />
                                <span className="font-bold text-lg">{profileData.coins || 0}</span>
                            </div>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddNewCourse} className="flex-shrink-0 flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/25 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-white/25">
                                <Plus size={18} /> <span className="hidden sm:inline">Add Course</span>
                            </motion.button>
                        </div>
                    </header>
                    
                    <main>
                        <AnimatePresence mode="wait">
                            <motion.div key={currentPage}>
                                {currentPage === 'attendance' && <AttendancePage allCourses={allCourses} onUpdate={handleUpdateAttendance} onAddNew={handleAddNewCourse} onMarkAttendance={handleMarkAttendance} onTotalChange={handleTotalChange} onDecrementAttendance={handleDecrementAttendance} onDeleteCourse={handleDeleteCourse} performanceData={performanceData} />}
                                {currentPage === 'performance' && <PerformancePage performanceData={performanceData} allCourses={allCourses} examMarks={examMarks} onDeleteCourse={handleDeleteCourse} onEditGrade={handleEditGradeClick} onAddExamMarks={handleAddExamMarksClick} onEditExamMark={handleEditExamMarkClick} onDeleteExamMark={handleDeleteExamMark} expandedSemesters={expandedSemesters} toggleSemester={toggleSemester} />}
                                {currentPage === 'calendar' && <CalendarPage schedule={schedule} deadlines={deadlines} onAddClass={() => setIsAddClassModalOpen(true)} onAddDeadline={handleAddDeadlineClick} onDeleteDeadline={handleDeleteDeadline} onEditDeadline={handleEditDeadlineClick} courses={allCourses} />}
                                {currentPage === 'profile' && <ProfilePage profileData={profileData} onEditProfile={handleEditProfileClick} onResetData={() => setIsResetModalOpen(true)} onSignOut={onSignOut} />}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>

                {/* Bottom Navigation */}
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm h-16 bg-black/50 saturate-150 backdrop-blur-xl border border-white/20 rounded-2xl flex justify-around items-center z-40">
                    <LayoutGroup>
                        {navItems.map(item => (
                            <motion.button key={item} onClick={() => setCurrentPage(item)} className={`relative flex flex-col items-center justify-center gap-1 transition-colors w-full h-full rounded-lg ${currentPage === item ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                                {item === 'attendance' && <ClipboardList size={22} />}
                                {item === 'performance' && <GraduationCap size={22} />}
                                {item === 'calendar' && <Calendar size={22} />}
                                {item === 'profile' && <UserCircle2 size={22} />}
                                <span className="text-xs font-medium capitalize">{item}</span>
                                {currentPage === item && (
                                    <motion.div className="absolute inset-0 bg-cyan-400/10 rounded-lg" layoutId="underline" />
                                )}
                            </motion.button>
                        ))}
                    </LayoutGroup>
                </div>
            </div>
            <AddCourseModal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} onSave={handleSaveCourse} />
            <AddGradeModal isOpen={isGradeModalOpen} onClose={() => setIsGradeModalOpen(false)} onSave={handleSaveGrade} allCourses={allCourses} courseToEdit={courseToGrade} />
            <AddClassModal isOpen={isAddClassModalOpen} onClose={() => setIsAddClassModalOpen(false)} onSave={handleSaveClass} currentCourses={currentSemesterCourses} />
            <AddEditDeadlineModal isOpen={isAddDeadlineModalOpen} onClose={() => setIsAddDeadlineModalOpen(false)} onSave={handleSaveDeadline} currentCourses={currentSemesterCourses} deadlineToEdit={deadlineToEdit} />
            <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} onSave={(details) => handleSaveProfile({ ...profileData, personal: details })} profileData={profileData.personal} />
            <AddEditMarksModal isOpen={isAddMarksModalOpen} onClose={() => setIsAddMarksModalOpen(false)} onSave={handleSaveExamMark} allCourses={allCourses} markToEdit={markToEdit} />
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
        </>
    );
};

export default Dashboard;
