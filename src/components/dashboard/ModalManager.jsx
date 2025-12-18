import React, { useMemo, useState } from 'react';
import { increment } from 'firebase/firestore';
import { useStore } from '../../store/useStore';
import { useModalStore } from '../../store/useModalStore';
import firestoreService from '../../services/firebaseService';
import authService from '../../services/authService';
import { GRADE_POINTS, COIN_VALUES } from '../../constants';

// Import all modals
import AddCourseModal from '../modals/AddCourseModal';
import AddGradeModal from '../modals/AddGradeModal';
import ConfirmationModal from '../common/ConfirmationModal';
import ResetConfirmationModal from '../common/ResetConfirmationModal';
import AddEditClassModal from '../modals/AddEditClassModal';
import AddEditDeadlineModal from '../modals/AddEditDeadlineModal';
import AddEditMarksModal from '../modals/AddEditMarksModal';
import AddEditTaskModal from '../modals/AddEditTaskModal';
import AddEditContactModal from '../modals/AddEditContactModal';
import AddEditExpenditureModal from '../modals/AddEditExpenditureModal';
import TimetableModal from '../modals/TimetableModal';
import PomodoroModal from '../modals/PomodoroModal';
import WhatIfModal from '../modals/WhatIfModal';
import EditProfileModal from '../modals/EditProfileModal';
import DeleteAccountModal from '../modals/DeleteAccountModal';
import ReauthModal from '../modals/ReauthModal';
import BugReportModal from '../modals/BugReportModal';

const ModalManager = ({ user, onSignOut, triggerReward, onStartPomodoro }) => {
    const {
        allCourses, profileData, schedule, deadlines,
        examMarks, tasks, contacts, expenditures
    } = useStore();

    const { modal, props: modalProps, closeModal, openModal } = useModalStore();

    // Local State for specific modals not yet in global store
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
    const [isReauthModalOpen, setIsReauthModalOpen] = useState(false);

    // Derived State (Copied from Dashboard to ensure modals have correct context)
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
    const handleSaveCourse = (courseData) => firestoreService.saveCourse(user.uid, courseData);
    const handleSaveGrade = (courseId, grade) => firestoreService.saveGrade(user.uid, courseId, grade);
    const handleSaveNewCourseWithGrade = async (newCourseData) => {
        await firestoreService.saveCourse(user.uid, newCourseData);
    };
    const handleSaveClass = (data, id) => firestoreService.saveClass(user.uid, data, id);
    const handleSaveDeadline = (data, id) => firestoreService.saveDeadline(user.uid, data, id);
    const handleSaveExamMark = (data, id) => firestoreService.saveExamMark(user.uid, data, id);
    const handleSaveTask = (data, id) => firestoreService.saveTask(user.uid, data, id);
    const handleSaveContact = (data, id) => firestoreService.saveContact(user.uid, data, id);
    const handleSaveExpenditure = (expenditureData, expenditureId) => {
        firestoreService.saveExpenditure(user.uid, expenditureData, expenditureId);
    };
    const handleSaveScenario = async (data) => {
        await firestoreService.saveScenario(user.uid, data);
        closeModal();
    };
    const handleResetData = async () => {
        await firestoreService.resetAllData(user.uid, user);
        closeModal();
    };

    // Account Deletion Logic
    // Note: We expose a way to open this from the context, but the logic lives here.
    // Dashboard passed handleDeleteAccountClick via context. 
    // We might need to listen to a global 'deleteAccount' modal state if we want to remove the local state here.
    // For now, let's keep it consistent with the existing 'modal' store approach where possible.
    // But DeleteAccount was using local state in Dashboard. Let's move it to "modal === 'deleteAccount'" later.
    // For this refactor, we will rely on this component rendering it if the logic is triggered.
    // However, the trigger comes from ProfilePage -> context -> Dashboard. 
    // We should move `isDeleteAccountModalOpen` to useModalStore eventually. 
    // For now, I will add a `useEffect` or similar if I need to trigger it, 
    // OR we just accept that we need to migrate DeleteAccount to `useModalStore` NOW to make this work.
    // Let's migrate DeleteAccount to usage of `useModalStore` ('deleteAccount') to clean this up.

    const confirmDeleteAccount = async () => {
        try {
            await firestoreService.resetAllData(user.uid, user);
            await authService.deleteCurrentUser();
            // Modal closing handled by unmount or store
        } catch (error) {
            closeModal(); // using global assume
            if (error.code === 'auth/requires-recent-login') {
                openModal('reauth'); // Migrating reauth to store too
            } else {
                alert(`Failed to delete account: ${error.message}`);
            }
        }
    };

    return (
        <>
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
            <AddEditExpenditureModal
                isOpen={modal === 'addExpenditure'}
                onClose={closeModal}
                onSave={handleSaveExpenditure}
                expenditureToEdit={modalProps.expenditureToEdit}
                categories={expenditureCategories}
            />
            <TimetableModal isOpen={modal === 'timetable'} onClose={closeModal} schedule={schedule} courses={allCourses} />
            <PomodoroModal isOpen={modal === 'pomodoro'} onClose={closeModal} onStart={onStartPomodoro} />
            <WhatIfModal
                isOpen={modal === 'whatIf'}
                onClose={closeModal}
                allCourses={allCourses}
                onSave={handleSaveScenario}
                initialData={modalProps.scenarioToLoad}
            />
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

            {/* Migrated local modals to store-based checks */}
            <DeleteAccountModal
                isOpen={modal === 'deleteAccount'}
                onClose={closeModal}
                onConfirm={confirmDeleteAccount}
            />
            <ReauthModal
                isOpen={modal === 'reauth'}
                onClose={closeModal}
                onConfirm={onSignOut}
            />
        </>
    );
};

export default ModalManager;
