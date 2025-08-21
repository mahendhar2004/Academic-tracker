import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { increment } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import { useModalStore } from '../store/useModalStore';
import firestoreService from '../services/firebaseService';
import authService from '../services/authService';
import { GRADE_POINTS, COIN_VALUES } from '../constants';

// Import all page and component assets
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
import AddEditExpenditureModal from '../components/modals/AddEditExpenditureModal';
import TimetableModal from '../components/modals/TimetableModal';
import PomodoroModal from '../components/modals/PomodoroModal';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
import WhatIfModal from '../components/modals/WhatIfModal';
import EditProfileModal from '../components/modals/EditProfileModal';
import DeleteAccountModal from '../components/modals/DeleteAccountModal';
import ReauthModal from '../components/modals/ReauthModal';
import BugReportModal from '../components/modals/BugReportModal';

const Dashboard = ({ user, onSignOut, reward, setReward, triggerReward }) => {
    const {
        allCourses, profileData, schedule, deadlines,
        examMarks, tasks, contacts, expenditures, isDataLoaded
    } = useStore();

    const { modal, props: modalProps, openModal, closeModal } = useModalStore();

    const [currentPage, setCurrentPage] = useState('home');
    const [pomodoroConfig, setPomodoroConfig] = useState({ isActive: false, duration: 0 });
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
    const [isReauthModalOpen, setIsReauthModalOpen] = useState(false);
    
    const performanceData = useMemo(() => {
        const gradedCourses = allCourses.filter(c => c.grade && c.grade !== 'Not Published' && c.credits > 0);
        
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
    
    const currentSemesterSchedule = useMemo(() => {
        const currentSemesterCourseIds = new Set(currentSemesterCourses.map(c => c.id));
        return schedule.filter(classItem => currentSemesterCourseIds.has(classItem.courseId));
    }, [schedule, currentSemesterCourses]);

    // ADDED: Memoized calculation for unique expenditure categories
    const expenditureCategories = useMemo(() => {
        const allCategories = expenditures.map(e => e.category);
        // Add default categories to ensure they are always available
        const defaultCategories = ['Food', 'Transport', 'Subscriptions', 'Entertainment', 'Study', 'Utilities', 'Other'];
        return [...new Set([...defaultCategories, ...allCategories])].sort();
    }, [expenditures]);

    const handleSaveCourse = (courseData) => firestoreService.saveCourse(user.uid, courseData);
    const handleSaveGrade = (courseId, grade) => firestoreService.saveGrade(user.uid, courseId, grade);

    const handleDeleteGrade = (courseId, courseName) => {
        openModal('confirmation', {
            message: `Are you sure you want to delete the grade for "${courseName}"? This will set it back to "Not Published".`,
            onConfirm: () => {
                firestoreService.saveGrade(user.uid, courseId, 'Not Published');
            }
        });
    };

    const handleSaveNewCourseWithGrade = async (newCourseData) => {
        await firestoreService.saveCourse(user.uid, newCourseData);
    };
    const handleSaveClass = (data, id) => firestoreService.saveClass(user.uid, data, id);
    const handleSaveDeadline = (data, id) => firestoreService.saveDeadline(user.uid, data, id);
    const handleSaveExamMark = (data, id) => firestoreService.saveExamMark(user.uid, data, id);
    const handleSaveTask = (data, id) => firestoreService.saveTask(user.uid, data, id);
    const handleSaveContact = (data, id) => firestoreService.saveContact(user.uid, data, id);
    
    const handleSaveProfileField = async (field, value, rewardAmount) => {
        const coinsAwarded = await firestoreService.saveProfileFieldWithReward(user.uid, field, value, rewardAmount);
        triggerReward(coinsAwarded);
    };
    
    const handleDeleteClass = (id) => firestoreService.deleteClass(user.uid, id);
    const handleDeleteDeadline = (id) => firestoreService.deleteDeadline(user.uid, id);
    const handleDeleteExamMark = (id) => firestoreService.deleteExamMark(user.uid, id);
    const handleDeleteTask = (id) => firestoreService.deleteTask(user.uid, id);
    const handleDeleteContact = (id) => firestoreService.deleteContact(user.uid, id);
    const handleDeleteExpenditure = (expenditureToDelete) => firestoreService.deleteExpenditure(user.uid, expenditureToDelete);
    
    const handleMarkAttendance = async (course) => {
        await firestoreService.updateCourse(user.uid, course.id, { attended: increment(1), total: increment(1) });
        await firestoreService.updateCoins(user.uid, COIN_VALUES.MARK_ATTENDANCE);
        triggerReward(COIN_VALUES.MARK_ATTENDANCE);
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
        const rewardAmount = isCompleted ? COIN_VALUES.COMPLETE_TASK : COIN_VALUES.UNCOMPLETE_TASK;
        await firestoreService.updateCoins(user.uid, rewardAmount);
        if(isCompleted) triggerReward(rewardAmount);
    };
    const handleDeleteCourse = (courseId, courseName) => {
        openModal('confirmation', {
            message: `This will permanently delete the subject "${courseName}" and all its associated data. This action cannot be undone.`,
            onConfirm: async () => {
                await firestoreService.deleteCourseAndRelatedData(user.uid, courseId);
            }
        });
    };
    const handleResetData = async () => {
        await firestoreService.resetAllData(user.uid, user);
        closeModal();
        setCurrentPage('attendance');
    };
    const handleStartPomodoro = (duration) => {
        closeModal();
        setPomodoroConfig({ isActive: true, duration });
    };
    const handleClosePomodoro = ({ completed }) => {
        setPomodoroConfig({ isActive: false, duration: 0 });
        if (completed) {
            firestoreService.updateCoins(user.uid, COIN_VALUES.FINISH_POMODORO);
            triggerReward(COIN_VALUES.FINISH_POMODORO);
        }
    };
    const handleSaveExpenditure = (expenditureData, expenditureId) => {
        firestoreService.saveExpenditure(user.uid, expenditureData, expenditureId);
    };

    const handleResetExpenditures = () => {
        openModal('confirmation', {
            message: "Are you sure you want to delete all transactions? This action cannot be undone.",
            onConfirm: () => firestoreService.resetExpenditures(user.uid)
        });
    };

    const handleDeleteAccountClick = () => setIsDeleteAccountModalOpen(true);
    const confirmDeleteAccount = async () => {
        try {
            await firestoreService.resetAllData(user.uid, user);
            await authService.deleteCurrentUser();
            setIsDeleteAccountModalOpen(false);
        } catch (error) {
            setIsDeleteAccountModalOpen(false);
            if (error.code === 'auth/requires-recent-login') {
                setIsReauthModalOpen(true);
            } else {
                alert(`Failed to delete account: ${error.message}`);
            }
        }
    };

    const handleAddNewCourse = () => openModal('addCourse');
    const handleEditGradeClick = (course) => openModal('addGrade', { courseToGrade: course });
    const handleAddGradeClick = () => openModal('addGrade');
    const handleAddDeadlineClick = () => openModal('addDeadline');
    const handleEditDeadlineClick = (deadline) => openModal('addDeadline', { deadlineToEdit: deadline });
    const handleAddExamMarksClick = () => openModal('addMarks');
    const handleEditExamMarkClick = (mark) => openModal('addMarks', { markToEdit: mark });
    const handleAddMarksForCourseClick = (course) => openModal('addMarks', { markToEdit: { courseId: course.id } });
    const handleAddTaskClick = (planType = 'Short-term') => {
        openModal('addTask', { defaultType: planType });
    };
    const handleEditTaskClick = (task) => openModal('addTask', { taskToEdit: task });
    const handleAddClassClick = () => openModal('addClass');
    const handleEditClassClick = (classItem) => openModal('addClass', { classToEdit: classItem });
    const handleAddContactClick = () => openModal('addContact');
    const handleEditContactClick = (contact) => openModal('addContact', { contactToEdit: contact });
    const handleAddExpenditureClick = () => openModal('addExpenditure');
    const handleEditExpenditureClick = (expenditure) => openModal('addExpenditure', { expenditureToEdit: expenditure });
    const pageVariants = { initial: { opacity: 0 }, in: { opacity: 1 }, out: { opacity: 0 } };
    const pageTransition = { type: 'tween', ease: 'linear', duration: 0.15 };

    if (!isDataLoaded) {
        return <div className="bg-black min-h-screen flex justify-center items-center text-white"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div></div>;
    }

    return (
        <>
             <div className="min-h-screen bg-black text-white font-sans flex">
                 <SideNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
                 <div className="flex-1 md:pl-28 overflow-hidden">
                     <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-10">
                         {currentPage !== 'profile' && (
                             <Header 
                                 currentPage={currentPage} 
                                 profileData={profileData} 
                                 onOpenTimetable={() => openModal('timetable')}
                                 onOpenPomodoro={() => openModal('pomodoro')}
                                 onOpenBugReport={() => openModal('bugReport')}
                                 reward={reward}
                                 setReward={setReward}
                             />
                         )}
                         <main>
                             <AnimatePresence mode="wait">
                                 <motion.div key={currentPage} initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                                     {currentPage === 'home' && <HomePage 
                                         schedule={schedule} 
                                         deadlines={deadlines} 
                                         tasks={tasks} 
                                         courses={allCourses}
                                         expenditures={expenditures}
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
                                         onAddGrade={handleAddGradeClick} 
                                         onAddExamMarks={handleAddExamMarksClick} 
                                         onEditExamMark={handleEditExamMarkClick} 
                                         onDeleteExamMark={handleDeleteExamMark} 
                                         onAddMarksForCourse={handleAddMarksForCourseClick}
                                         onDeleteGrade={handleDeleteGrade}
                                         currentSemester={currentSemester}
                                     />}
                                     {currentPage === 'calendar' && <CalendarPage 
                                         schedule={schedule} deadlines={deadlines} onAddClass={handleAddClassClick} 
                                         onEditClass={handleEditClassClick} onDeleteClass={handleDeleteClass}
                                         onAddDeadline={handleAddDeadlineClick} onDeleteDeadline={handleDeleteDeadline} 
                                         onEditDeadline={handleEditDeadlineClick} courses={allCourses} 
                                     />}
                                     {currentPage === 'planner' && <PlannerPage 
                                         tasks={tasks} 
                                         onAddTask={handleAddTaskClick}
                                         onEditTask={handleEditTaskClick} 
                                         onDeleteTask={handleDeleteTask} 
                                         onToggleComplete={handleToggleTaskComplete} 
                                     />}
                                     {currentPage === 'contacts' && <ContactsPage 
                                         contacts={contacts} onAddContact={handleAddContactClick}
                                         onEditContact={handleEditContactClick} onDeleteContact={handleDeleteContact}
                                     />}
                                     {currentPage === 'expenditure' && <ExpenditurePage 
                                         expenditures={expenditures} 
                                         onAddExpenditure={handleAddExpenditureClick}
                                         onDeleteExpenditure={handleDeleteExpenditure} 
                                         onEditExpenditure={handleEditExpenditureClick}
                                         onResetExpenditures={handleResetExpenditures}
                                     />}
                                     {currentPage === 'profile' && <ProfilePage 
                                         user={user}
                                         profileData={profileData} 
                                         onSaveField={handleSaveProfileField} 
                                         onResetData={() => openModal('resetConfirmation')} 
                                         onSignOut={onSignOut}
                                         onDeleteAccount={handleDeleteAccountClick}
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
            
            <AddCourseModal isOpen={modal === 'addCourse'} onClose={closeModal} onSave={handleSaveCourse} currentSemester={currentSemester} />
            <AddGradeModal 
                isOpen={modal === 'addGrade'} 
                onClose={closeModal} 
                onSave={handleSaveGrade}
                onSaveNewCourse={handleSaveNewCourseWithGrade}
                allCourses={allCourses} 
                courseToEdit={modalProps.courseToGrade} 
                currentSemester={currentSemester} 
            />
            <AddEditClassModal 
                isOpen={modal === 'addClass'} 
                onClose={closeModal} 
                onSave={handleSaveClass} 
                currentCourses={currentSemesterCourses} 
                classToEdit={modalProps.classToEdit}
                schedule={currentSemesterSchedule}
                allCourses={allCourses}
            />
            <AddEditDeadlineModal isOpen={modal === 'addDeadline'} onClose={closeModal} onSave={handleSaveDeadline} currentCourses={currentSemesterCourses} deadlineToEdit={modalProps.deadlineToEdit} />
            <AddEditMarksModal isOpen={modal === 'addMarks'} onClose={closeModal} onSave={handleSaveExamMark} allCourses={allCourses} markToEdit={modalProps.markToEdit} currentSemester={currentSemester} />
            <AddEditTaskModal 
                isOpen={modal === 'addTask'} 
                onClose={closeModal} 
                onSave={handleSaveTask} 
                taskToEdit={modalProps.taskToEdit}
                defaultType={modalProps.defaultType}
            />
            <AddEditContactModal isOpen={modal === 'addContact'} onClose={closeModal} onSave={handleSaveContact} contactToEdit={modalProps.contactToEdit} />
            {/* UPDATED: Pass the dynamic categories to the modal */}
            <AddEditExpenditureModal 
                isOpen={modal === 'addExpenditure'} 
                onClose={closeModal} 
                onSave={handleSaveExpenditure} 
                expenditureToEdit={modalProps.expenditureToEdit}
                categories={expenditureCategories}
            />
            <TimetableModal isOpen={modal === 'timetable'} onClose={closeModal} schedule={schedule} courses={allCourses} />
            <PomodoroModal isOpen={modal === 'pomodoro'} onClose={closeModal} onStart={handleStartPomodoro} />
            <WhatIfModal isOpen={modal === 'whatIf'} onClose={closeModal} allCourses={allCourses} />
            <EditProfileModal isOpen={modal === 'editProfile'} onClose={closeModal} onSave={(data) => console.log(data)} profileData={profileData} />
            <BugReportModal isOpen={modal === 'bugReport'} onClose={closeModal} />
            <ConfirmationModal 
                isOpen={modal === 'confirmation'} 
                onClose={closeModal} 
                onConfirm={() => {
                    modalProps.onConfirm?.();
                    closeModal();
                }} 
                message={modalProps.message} 
            />
            <ResetConfirmationModal
                isOpen={modal === 'resetConfirmation'}
                onClose={closeModal}
                onConfirm={handleResetData}
            />
            <DeleteAccountModal
                isOpen={isDeleteAccountModalOpen}
                onClose={() => setIsDeleteAccountModalOpen(false)}
                onConfirm={confirmDeleteAccount}
            />
            <ReauthModal
                isOpen={isReauthModalOpen}
                onClose={() => setIsReauthModalOpen(false)}
                onConfirm={onSignOut}
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
