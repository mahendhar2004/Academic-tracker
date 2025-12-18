import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { increment } from 'firebase/firestore';
import { Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useModalStore } from '../store/useModalStore';
import firestoreService from '../services/firebaseService';
import { GRADE_POINTS, COIN_VALUES } from '../constants';
import { AnimatePresence } from 'framer-motion';

// Import all page and component assets
import SideNav from '../components/dashboard/SideNav';
import Header from '../components/dashboard/Header';
import FloatingAddButton from '../components/dashboard/FloatingAddButton';
import { DashboardSkeleton } from '../components/common/Skeleton';
import GlobalSearch from '../components/common/GlobalSearch';
import ModalManager from '../components/dashboard/ModalManager';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';

const Dashboard = ({ user, onSignOut, reward, setReward, triggerReward }) => {
    const {
        allCourses, profileData, schedule, deadlines,
        examMarks, tasks, contacts, expenditures, scenarios, isDataLoaded
    } = useStore();

    const { openModal, closeModal } = useModalStore();

    const location = useLocation();
    const currentPath = location.pathname.split('/').pop();
    const currentPage = location.pathname === '/dashboard' ? 'home' : currentPath;

    const [pomodoroConfig, setPomodoroConfig] = useState({ isActive: false, duration: 0 });
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

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

    const expenditureCategories = useMemo(() => {
        const allCategories = expenditures.map(e => e.category);
        const defaultCategories = ['Food', 'Transport', 'Subscriptions', 'Entertainment', 'Study', 'Utilities', 'Other'];
        return [...new Set([...defaultCategories, ...allCategories])].sort();
    }, [expenditures]);

    // Handlers
    // Many handlers were simple wrappers. We can direct pages to use firestoreService directly or keep these wrappers.
    // To preserve the context contract with pages, we keep the wrappers.

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
        if (isCompleted) triggerReward(rewardAmount);
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
        openModal('resetConfirmation');
    };

    // Pomodoro Logic
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
    const handleSaveScenario = (data) => firestoreService.saveScenario(user.uid, data);
    const handleDeleteScenario = (id) => firestoreService.deleteScenario(user.uid, id);

    const handleResetExpenditures = () => {
        openModal('confirmation', {
            message: "Are you sure you want to delete all transactions? This action cannot be undone.",
            onConfirm: () => firestoreService.resetExpenditures(user.uid)
        });
    };

    // Migrating to useModalStore for these
    const handleDeleteAccountClick = () => openModal('deleteAccount');

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
    const handleOpenWhatIf = (scenario) => openModal('whatIf', { scenarioToLoad: scenario });

    if (!isDataLoaded) {
        return <div className="bg-black min-h-screen flex justify-center items-center text-white"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div></div>;
    }

    const contextValue = {
        user,
        onSignOut,
        allCourses,
        profileData,
        schedule,
        deadlines,
        examMarks,
        tasks,
        contacts,
        expenditures,
        performanceData,
        currentSemester,
        currentSemesterCourses,
        currentSemesterSchedule,
        expenditureCategories,
        handleAddNewCourse,
        handleSaveCourse,
        handleSaveGrade,
        handleDeleteGrade,
        handleSaveNewCourseWithGrade,
        handleSaveClass,
        handleSaveDeadline,
        handleSaveExamMark,
        handleSaveTask,
        handleSaveContact,
        handleSaveProfileField,
        handleDeleteClass,
        handleDeleteDeadline,
        handleDeleteExamMark,
        handleDeleteTask,
        handleDeleteContact,
        handleDeleteExpenditure,
        handleMarkAttendance,
        handleDecrementAttendance,
        handleTotalChange,
        handleToggleCourseVisibility,
        handleToggleTaskComplete,
        handleDeleteCourse,
        handleResetData,
        handleStartPomodoro,
        handleSaveExpenditure,
        handleResetExpenditures,
        handleDeleteAccountClick,
        handleEditGradeClick,
        handleAddGradeClick,
        handleAddDeadlineClick,
        handleEditDeadlineClick,
        handleAddExamMarksClick,
        handleEditExamMarkClick,
        handleAddMarksForCourseClick,
        handleAddTaskClick,
        handleEditTaskClick,
        handleAddClassClick,
        handleEditClassClick,
        handleAddContactClick,
        handleEditContactClick,
        handleAddExpenditureClick,
        handleEditExpenditureClick,
        scenarios: scenarios || [],
        handleSaveScenario,
        handleDeleteScenario,
        handleOpenWhatIf
    };

    return (
        <>
            <div className="min-h-screen bg-black text-white font-sans flex">
                <SideNav />
                <div className="flex-1 md:pl-28 overflow-hidden">
                    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-10">
                        {currentPage !== 'profile' && (
                            <Header
                                currentPage={currentPage}
                                profileData={profileData}
                                onOpenTimetable={() => openModal('timetable')}
                                onOpenPomodoro={() => openModal('pomodoro')}
                                onOpenBugReport={() => openModal('bugReport')}
                                onOpenSearch={() => setIsSearchOpen(true)}
                                reward={reward}
                                setReward={setReward}
                            />
                        )}
                        <Suspense fallback={<DashboardSkeleton />}>
                            <Outlet context={contextValue} />
                        </Suspense>
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

            <ModalManager
                user={user}
                triggerReward={triggerReward}
                onSignOut={onSignOut}
                onStartPomodoro={handleStartPomodoro}
            />

            <AnimatePresence>
                {pomodoroConfig.isActive && (
                    <PomodoroTimer
                        duration={pomodoroConfig.duration}
                        onClose={handleClosePomodoro}
                    />
                )}
            </AnimatePresence>
            <GlobalSearch
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                allCourses={allCourses}
                tasks={tasks}
                contacts={contacts}
            />
        </>
    );
};

export default Dashboard;
