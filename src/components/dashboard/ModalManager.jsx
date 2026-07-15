import React, { useMemo, useState } from 'react';

import { useStore } from '../../store/useStore';
import { useModalStore } from '../../store/useModalStore';
import firestoreService from '../../services/firebaseService';
import authService from '../../services/authService';


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

const ModalManager = ({ user, triggerReward, onStartPomodoro }) => {
    const {
        allCourses, profileData, schedule, expenditures
    } = useStore();

    const { modal, props: modalProps, closeModal, openModal } = useModalStore();

    // Local State for specific modals not yet in global store


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
    const handleSaveCourse = async (courseData) => {
        if (modalProps.courseToEdit) {
            await firestoreService.updateCourse(user.uid, modalProps.courseToEdit.id, courseData);
        } else {
            await firestoreService.saveCourse(user.uid, courseData);
        }
        closeModal();
    };
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
    // Firestore data is wiped before the auth user is deleted (client-side security rules
    // require an authenticated match on uid, so data deletion must happen while the user's
    // token is still valid). If Firebase then requires a recent login to finish deleting the
    // auth user, we DON'T re-wipe data on retry -- we just re-authenticate and finish deleting
    // the now-already-emptied account.
    const [reauthState, setReauthState] = useState({ isSubmitting: false, error: '' });

    const confirmDeleteAccount = async () => {
        try {
            await firestoreService.resetAllData(user.uid, user);
            await authService.deleteCurrentUser();
            closeModal();
        } catch (error) {
            if (error.code === 'auth/requires-recent-login') {
                setReauthState({ isSubmitting: false, error: '' });
                openModal('reauth');
            } else {
                closeModal();
                alert(`Failed to delete account: ${error.message}`);
            }
        }
    };

    const handleReauthenticateAndDelete = async (password) => {
        setReauthState({ isSubmitting: true, error: '' });
        try {
            const providerId = authService.getAuthProviderId();
            if (providerId === 'google.com') {
                await authService.reauthenticateWithGoogle();
            } else {
                await authService.reauthenticateWithPassword(password);
            }
            await authService.deleteCurrentUser();
            closeModal();
        } catch (error) {
            setReauthState({ isSubmitting: false, error: error.message || 'Re-authentication failed. Please try again.' });
        }
    };

    return (
        <>
            <AddCourseModal
                isOpen={modal === 'addCourse'}
                onClose={closeModal}
                onSave={handleSaveCourse}
                currentSemester={currentSemester}
                initialData={modalProps.courseToEdit}
            />
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
                onReauthenticate={handleReauthenticateAndDelete}
                provider={user?.providerData?.[0]?.providerId || 'password'}
                isSubmitting={reauthState.isSubmitting}
                errorMessage={reauthState.error}
            />
        </>
    );
};

export default ModalManager;
