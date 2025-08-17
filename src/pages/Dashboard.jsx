import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { increment } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import { useModalStore } from '../store/useModalStore';
import firestoreService from '../services/firebaseService';

// Import all your components
import SideNav from '../components/dashboard/SideNav';
import Header from '../components/dashboard/Header';
import AttendancePage from './AttendancePage';
import PerformancePage from './PerformancePage';
import ProfilePage from './ProfilePage';
import CalendarPage from './CalendarPage';
import PlannerPage from './PlannerPage';
import HomePage from './HomePage';
import ContactsPage from './ContactsPage';
import ExpenditurePage from './ExpenditurePage';
import FloatingAddButton from '../components/dashboard/FloatingAddButton';
import AddCourseModal from '../components/modals/AddCourseModal';
import AddGradeModal from '../components/modals/AddGradeModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import ResetConfirmationModal from '../components/common/ResetConfirmationModal';
import AddEditClassModal from '../components/modals/AddEditClassModal';
import AddEditDeadlineModal from '../components/modals/AddEditDeadlineModal';
import AddEditMarksModal from '../components/modals/AddEditMarksModal';
import AddEditTaskModal from '../components/modals/AddEditTaskModal';
import AddEditContactModal from '../components/modals/AddEditContactModal';
import AddExpenditureModal from '../components/modals/AddExpenditureModal';
import SetBalanceModal from '../components/modals/SetBalanceModal';
import TimetableModal from '../components/modals/TimetableModal';
import PomodoroModal from '../components/modals/PomodoroModal';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
import WhatIfModal from '../components/modals/WhatIfModal';
import EditProfileModal from '../components/modals/EditProfileModal';
import { GRADE_POINTS, COIN_VALUES } from '../constants'; // Import constants

const Dashboard = ({ user, onSignOut }) => {
    const {
        allCourses, profileData, schedule, deadlines,
        examMarks, tasks, contacts, expenditures, isDataLoaded
    } = useStore();

    const { modal, props: modalProps, openModal, closeModal } = useModalStore();

    const [currentPage, setCurrentPage] = useState('home');
    const [isCpiVisible, setIsCpiVisible] = useState(true);
    const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, message: '', onConfirm: () => {} });
    const [pomodoroConfig, setPomodoroConfig] = useState({ isActive: false, duration: 0 });

    useEffect(() => {
        const savedCpiVisibility = localStorage.getItem('cpiVisible');
        if (savedCpiVisibility !== null) {
            setIsCpiVisible(JSON.parse(savedCpiVisibility));
        }
    }, []);

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

    // ... (All handler functions remain unchanged) ...
    const handleSaveCourse = (courseData) => firestoreService.saveCourse(user.uid, courseData);
    const handleSaveGrade = (courseId, grade) => firestoreService.saveGrade(user.uid, courseId, grade);
    const handleSaveClass = (data, id) => firestoreService.saveClass(user.uid, data, id);
    const handleSaveDeadline = (data, id) => firestoreService.saveDeadline(user.uid, data, id);
    const handleSaveExamMark = (data, id) => firestoreService.saveExamMark(user.uid, data, id);
    const handleSaveTask = (data, id) => firestoreService.saveTask(user.uid, data, id);
    const handleSaveContact = (data, id) => firestoreService.saveContact(user.uid, data, id);
    const handleSaveProfileField = (field, value) => firestoreService.saveProfileField(user.uid, field, value);
    const handleDeleteClass = (id) => firestoreService.deleteClass(user.uid, id);
    const handleDeleteDeadline = (id) => firestoreService.deleteDeadline(user.uid, id);
    const handleDeleteExamMark = (id) => firestoreService.deleteExamMark(user.uid, id);
    const handleDeleteTask = (id) => firestoreService.deleteTask(user.uid, id);
    const handleDeleteContact = (id) => firestoreService.deleteContact(user.uid, id);
    const handleDeleteExpenditure = (id) => firestoreService.deleteExpenditure(user.uid, id);
    const handleMarkAttendance = async (course) => {
        await firestoreService.updateCourse(user.uid, course.id, { attended: increment(1), total: increment(1) });
        await firestoreService.updateCoins(user.uid, COIN_VALUES.MARK_ATTENDANCE);
    };
    const handleDecrementAttendance = async (course) => {
        if ((course.attended || 0) <= 0) return;
        await firestoreService.updateCourse(user.uid, course.id, { attended: increment(-1) });
        await firestoreService.updateCoins(user.uid, COIN_VALUES.DECREMENT_ATTENDANCE);
    };
    const handleTotalChange = (course, change) => {
        const newTotal = (course.total || 0) + change;
        if (newTotal < course.attended || newTotal < 0) return;
        firestoreService.updateCourse(user.uid, course.id, { total: newTotal });
    };
    const handleToggleCourseVisibility = (id, isHidden) => firestoreService.toggleCourseVisibility(user.uid, id, isHidden);
    const handleToggleTaskComplete = async (taskId, isCompleted) => {
        await firestoreService.toggleTaskComplete(user.uid, taskId, isCompleted);
        await firestoreService.updateCoins(user.uid, isCompleted ? COIN_VALUES.COMPLETE_TASK : COIN_VALUES.UNCOMPLETE_TASK);
    };
    const handleDeleteCourse = (courseId, courseName) => {
        setConfirmationModal({
            isOpen: true,
            message: `Are you sure you want to delete all data for "${courseName}"?`,
            onConfirm: async () => {
                await firestoreService.deleteCourse(user.uid, courseId);
                setConfirmationModal({ isOpen: false, message: '', onConfirm: () => {} });
            }
        });
    };
    const handleResetData = async () => {
        await firestoreService.resetAllData(user.uid, user);
        closeModal();
        setCurrentPage('attendance');
    };
    const handleToggleCpiVisibility = () => {
        const newVisibility = !isCpiVisible;
        setIsCpiVisible(newVisibility);
        localStorage.setItem('cpiVisible', JSON.stringify(newVisibility));
    };
    const handleStartPomodoro = (duration) => {
        closeModal();
        setPomodoroConfig({ isActive: true, duration });
    };
    const handleClosePomodoro = ({ completed }) => {
        setPomodoroConfig({ isActive: false, duration: 0 });
        if (completed) {
            firestoreService.updateCoins(user.uid, COIN_VALUES.FINISH_POMODORO);
        }
    };
    const handleSaveExpenditure = async (expenditureData) => {
        const result = await firestoreService.saveExpenditure(user.uid, expenditureData, profileData.expenditureBalance);
        if (result === 'INSUFFICIENT_FUNDS') {
             setConfirmationModal({
                 isOpen: true,
                 message: "Insufficient balance to record this expense.",
                 onConfirm: () => setConfirmationModal({ isOpen: false, message: '', onConfirm: () => {} })
             });
        }
    };
    const handleSetExpenditureBalance = (newBalance) => firestoreService.setExpenditureBalance(user.uid, newBalance);
    const handleToggleBalanceVisibility = () => firestoreService.toggleBalanceVisibility(user.uid, profileData.isBalanceVisible);
    const handleResetExpenditures = () => {
        setConfirmationModal({
            isOpen: true,
            message: 'Are you sure you want to delete all expenditure data? This will also reset your balance to zero.',
            onConfirm: async () => {
                await firestoreService.resetExpenditures(user.uid);
                setConfirmationModal({ isOpen: false, message: '', onConfirm: () => {} });
            }
        });
    };
    // MODAL OPEN/EDIT HANDLERS
    const handleAddNewCourse = () => openModal('addCourse');
    const handleEditGradeClick = (course) => openModal('addGrade', { courseToGrade: course });
    const handleAddGradeClick = () => openModal('addGrade');
    const handleAddDeadlineClick = () => openModal('addDeadline');
    const handleEditDeadlineClick = (deadline) => openModal('addDeadline', { deadlineToEdit: deadline });
    const handleAddExamMarksClick = () => openModal('addMarks');
    const handleEditExamMarkClick = (mark) => openModal('addMarks', { markToEdit: mark });
    const handleAddMarksForCourseClick = (course) => openModal('addMarks', { markToEdit: { courseId: course.id } });
    const handleAddTaskClick = () => openModal('addTask');
    const handleEditTaskClick = (task) => openModal('addTask', { taskToEdit: task });
    const handleAddClassClick = () => openModal('addClass');
    const handleEditClassClick = (classItem) => openModal('addClass', { classToEdit: classItem });
    const handleAddContactClick = () => openModal('addContact');
    const handleEditContactClick = (contact) => openModal('addContact', { contactToEdit: contact });
    const handleAddExpenditureClick = () => openModal('addExpenditure');
    const pageVariants = { initial: { opacity: 0 }, in: { opacity: 1 }, out: { opacity: 0 } };
    const pageTransition = { type: 'tween', ease: 'linear', duration: 0.15 };

    if (!isDataLoaded) {
        return <div className="bg-black min-h-screen flex justify-center items-center text-white"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div></div>;
    }

    return (
        <>
            <div className="min-h-screen bg-black text-white font-sans flex">
                <SideNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
                <div className="flex-1 pl-28 overflow-hidden">
                    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 pb-10">
                        <Header 
                            currentPage={currentPage} 
                            profileData={profileData} 
                            onAddNewCourse={handleAddNewCourse} 
                            onOpenTimetable={() => openModal('timetable')}
                            onOpenPomodoro={() => openModal('pomodoro')}
                        />
                        <main>
                            <AnimatePresence mode="wait">
                                <motion.div key={currentPage} initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                    {currentPage === 'home' && <HomePage 
                                        schedule={schedule} deadlines={deadlines} tasks={tasks} courses={allCourses}
                                        performanceData={performanceData} isCpiVisible={isCpiVisible}
                                        onToggleCpiVisibility={handleToggleCpiVisibility} expenditures={expenditures}
                                    />}
                                    {currentPage === 'attendance' && <AttendancePage 
                                        allCourses={allCourses} onAddNew={handleAddNewCourse} 
                                        onMarkAttendance={handleMarkAttendance} onTotalChange={handleTotalChange} 
                                        onDecrementAttendance={handleDecrementAttendance} onDeleteCourse={handleDeleteCourse} 
                                        onToggleVisibility={handleToggleCourseVisibility}
                                    />}
                                    {currentPage === 'performance' && <PerformancePage 
                                        performanceData={performanceData} allCourses={allCourses} examMarks={examMarks} 
                                        onDeleteCourse={handleDeleteCourse} onEditGrade={handleEditGradeClick}
                                        onAddGrade={handleAddGradeClick} onAddExamMarks={handleAddExamMarksClick} 
                                        onEditExamMark={handleEditExamMarkClick} onDeleteExamMark={handleDeleteExamMark} 
                                        onAddMarksForCourse={handleAddMarksForCourseClick}
                                    />}
                                    {currentPage === 'calendar' && <CalendarPage 
                                        schedule={schedule} deadlines={deadlines} onAddClass={handleAddClassClick} 
                                        onEditClass={handleEditClassClick} onDeleteClass={handleDeleteClass}
                                        onAddDeadline={handleAddDeadlineClick} onDeleteDeadline={handleDeleteDeadline} 
                                        onEditDeadline={handleEditDeadlineClick} courses={allCourses} 
                                    />}
                                    {currentPage === 'planner' && <PlannerPage 
                                        tasks={tasks} onAddTask={handleAddTaskClick} onEditTask={handleEditTaskClick} 
                                        onDeleteTask={handleDeleteTask} onToggleComplete={handleToggleTaskComplete} 
                                    />}
                                    {currentPage === 'contacts' && <ContactsPage 
                                        contacts={contacts} onAddContact={handleAddContactClick}
                                        onEditContact={handleEditContactClick} onDeleteContact={handleDeleteContact}
                                    />}
                                    {currentPage === 'expenditure' && <ExpenditurePage 
                                        expenditures={expenditures} balance={profileData.expenditureBalance}
                                        isBalanceVisible={profileData.isBalanceVisible} onAddExpenditure={handleAddExpenditureClick}
                                        onDeleteExpenditure={handleDeleteExpenditure} onSetBalance={() => openModal('setBalance')}
                                        onToggleBalanceVisibility={handleToggleBalanceVisibility} onResetExpenditures={handleResetExpenditures}
                                    />}
                                    {currentPage === 'profile' && <ProfilePage 
                                        profileData={profileData} 
                                        onSaveField={handleSaveProfileField} 
                                        onResetData={() => openModal('resetConfirmation')} 
                                        onSignOut={onSignOut}
                                        // FIX: Pass the missing props to the redesigned ProfilePage
                                        performanceData={performanceData}
                                        currentSemester={currentSemester}
                                    />}
                                </motion.div>
                            </AnimatePresence>
                        </main>
                    </div>
                </div>
            </div>
            
            {currentPage !== 'profile' && (
                <FloatingAddButton 
                    onAddCourse={handleAddNewCourse} onAddExamMarks={handleAddExamMarksClick}
                    onAddGrade={handleAddGradeClick} onAddDeadline={handleAddDeadlineClick}
                    onAddTask={handleAddTaskClick} onAddContact={handleAddContactClick}
                    onAddExpenditure={handleAddExpenditureClick}
                />
            )}
            
            {/* ... (All modals remain unchanged) ... */}
            <AddCourseModal isOpen={modal === 'addCourse'} onClose={closeModal} onSave={handleSaveCourse} currentSemester={currentSemester} />
            <AddGradeModal isOpen={modal === 'addGrade'} onClose={closeModal} onSave={handleSaveGrade} allCourses={allCourses} courseToEdit={modalProps.courseToGrade} currentSemester={currentSemester} />
            <AddEditClassModal isOpen={modal === 'addClass'} onClose={closeModal} onSave={handleSaveClass} currentCourses={currentSemesterCourses} classToEdit={modalProps.classToEdit} />
            <AddEditDeadlineModal isOpen={modal === 'addDeadline'} onClose={closeModal} onSave={handleSaveDeadline} currentCourses={currentSemesterCourses} deadlineToEdit={modalProps.deadlineToEdit} />
            <AddEditMarksModal isOpen={modal === 'addMarks'} onClose={closeModal} onSave={handleSaveExamMark} allCourses={allCourses} markToEdit={modalProps.markToEdit} currentSemester={currentSemester} />
            <AddEditTaskModal isOpen={modal === 'addTask'} onClose={closeModal} onSave={handleSaveTask} taskToEdit={modalProps.taskToEdit} />
            <AddEditContactModal isOpen={modal === 'addContact'} onClose={closeModal} onSave={handleSaveContact} contactToEdit={modalProps.contactToEdit} />
            <AddExpenditureModal isOpen={modal === 'addExpenditure'} onClose={closeModal} onSave={handleSaveExpenditure} />
            <SetBalanceModal isOpen={modal === 'setBalance'} onClose={closeModal} onSave={handleSetExpenditureBalance} currentBalance={profileData.expenditureBalance} />
            <TimetableModal isOpen={modal === 'timetable'} onClose={closeModal} schedule={schedule} courses={allCourses} />
            <PomodoroModal isOpen={modal === 'pomodoro'} onClose={closeModal} onStart={handleStartPomodoro} />
            <WhatIfModal isOpen={modal === 'whatIf'} onClose={closeModal} allCourses={allCourses} />
            <EditProfileModal isOpen={modal === 'editProfile'} onClose={closeModal} onSave={(data) => console.log(data)} profileData={profileData} />
            <ConfirmationModal 
                isOpen={confirmationModal.isOpen} 
                onClose={() => setConfirmationModal({ isOpen: false, message: '', onConfirm: () => {} })} 
                onConfirm={confirmationModal.onConfirm} 
                message={confirmationModal.message} 
            />
            <ResetConfirmationModal
                isOpen={modal === 'resetConfirmation'}
                onClose={closeModal}
                onConfirm={handleResetData}
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