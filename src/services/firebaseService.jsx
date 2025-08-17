import {
    doc, setDoc, collection, addDoc, deleteDoc,
    updateDoc, writeBatch, getDocs, Timestamp, increment
} from 'firebase/firestore';
import { db, appId } from '../firebase/config';

// NOTE: We don't need onSnapshot here because that's part of state listening,
// which is now handled by the store.

const firestoreService = {

    // === PROFILE & COINS ===
    updateCoins: async (userId, amount) => {
        if (!userId || amount === 0) return;
        const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
        await updateDoc(profileRef, { coins: increment(amount) });
    },

    saveProfileField: async (userId, field, value) => {
        const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
        await updateDoc(profileRef, { [field]: value });
    },

    // === COURSES & GRADES ===
    saveCourse: async (userId, courseData) => {
        // UPDATED: This function is now simpler and correctly saves all provided data.
        const dataToSave = {
            ...courseData, // This includes name, credits, semester, attended, total
            grade: courseData.grade === "Not Published" ? null : courseData.grade,
            lastAttended: null,
            attendanceCountToday: 0,
            isHidden: false
        };
        const path = `artifacts/${appId}/users/${userId}/courses`;
        await addDoc(collection(db, path), dataToSave);
    },

    saveGrade: async (userId, courseId, grade) => {
        const courseRef = doc(db, `artifacts/${appId}/users/${userId}/courses`, courseId);
        await updateDoc(courseRef, { grade });
    },
    
    deleteCourse: async (userId, courseId) => {
        const path = `artifacts/${appId}/users/${userId}/courses`;
        await deleteDoc(doc(db, path, courseId));
    },

    updateCourse: async (userId, courseId, updatedData) => {
        const path = `artifacts/${appId}/users/${userId}/courses`;
        await updateDoc(doc(db, path, courseId), updatedData);
    },

    toggleCourseVisibility: async (userId, courseId, isHidden) => {
        const courseRef = doc(db, `artifacts/${appId}/users/${userId}/courses`, courseId);
        await updateDoc(courseRef, { isHidden: !isHidden });
    },

    // === SCHEDULE (CLASSES) ===
    saveClass: async (userId, scheduleData, classId) => {
        const path = `artifacts/${appId}/users/${userId}/schedule`;
        if (classId) {
            await updateDoc(doc(db, path, classId), scheduleData);
        } else {
            await addDoc(collection(db, path), scheduleData);
        }
    },

    deleteClass: async (userId, classId) => {
        const path = `artifacts/${appId}/users/${userId}/schedule`;
        await deleteDoc(doc(db, path, classId));
    },

    // === DEADLINES ===
    saveDeadline: async (userId, deadlineData, deadlineId) => {
        const dataToSave = {
            ...deadlineData,
            date: Timestamp.fromDate(new Date(deadlineData.date))
        };
        const path = `artifacts/${appId}/users/${userId}/deadlines`;
        if (deadlineId) {
            await updateDoc(doc(db, path, deadlineId), dataToSave);
        } else {
            await addDoc(collection(db, path), dataToSave);
        }
    },

    deleteDeadline: async (userId, deadlineId) => {
        const path = `artifacts/${appId}/users/${userId}/deadlines`;
        await deleteDoc(doc(db, path, deadlineId));
    },

    // === EXAM MARKS ===
    saveExamMark: async (userId, markData, markId) => {
        const path = `artifacts/${appId}/users/${userId}/examMarks`;
        if (markId) {
            await updateDoc(doc(db, path, markId), markData);
        } else {
            await addDoc(collection(db, path), markData);
        }
    },
    deleteExamMark: async (userId, markId) => {
        const path = `artifacts/${appId}/users/${userId}/examMarks`;
        await deleteDoc(doc(db, path, markId));
    },

    // === TASKS ===
    saveTask: async (userId, taskData, taskId) => {
        const path = `artifacts/${appId}/users/${userId}/tasks`;
        const dataToSave = { ...taskData };
        if (taskData.type === 'Short-term') {
            dataToSave.dueDate = null;
        }
        if (taskId) {
            await updateDoc(doc(db, path, taskId), dataToSave);
        } else {
            await addDoc(collection(db, path), { ...dataToSave, isCompleted: false, completedAt: null });
        }
    },

    toggleTaskComplete: async (userId, taskId, isCompleted) => {
        const taskRef = doc(db, `artifacts/${appId}/users/${userId}/tasks`, taskId);
        await updateDoc(taskRef, {
            isCompleted,
            completedAt: isCompleted ? Timestamp.now() : null
        });
    },

    deleteTask: async (userId, taskId) => {
        const path = `artifacts/${appId}/users/${userId}/tasks`;
        await deleteDoc(doc(db, path, taskId));
    },

    // === CONTACTS ===
    saveContact: async (userId, contactData, contactId) => {
        const path = `artifacts/${appId}/users/${userId}/contacts`;
        if (contactId) {
            await updateDoc(doc(db, path, contactId), contactData);
        } else {
            await addDoc(collection(db, path), contactData);
        }
    },
    deleteContact: async (userId, contactId) => {
        const path = `artifacts/${appId}/users/${userId}/contacts`;
        await deleteDoc(doc(db, path, contactId));
    },

    // === EXPENDITURES ===
    saveExpenditure: async (userId, expenditureData, currentBalance) => {
        if (currentBalance < expenditureData.amount) {
            return 'INSUFFICIENT_FUNDS'; 
        }
        const path = `artifacts/${appId}/users/${userId}/expenditures`;
        await addDoc(collection(db, path), expenditureData);
        const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
        await updateDoc(profileRef, { expenditureBalance: increment(-expenditureData.amount) });
        return 'SUCCESS';
    },

    deleteExpenditure: async (userId, expenditureId) => {
        const path = `artifacts/${appId}/users/${userId}/expenditures`;
        await deleteDoc(doc(db, path, expenditureId));
    },

    setExpenditureBalance: async (userId, newBalance) => {
        const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
        await updateDoc(profileRef, { expenditureBalance: newBalance });
    },
    
    toggleBalanceVisibility: async (userId, currentVisibility) => {
        const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
        await updateDoc(profileRef, { isBalanceVisible: !currentVisibility });
    },

    resetExpenditures: async (userId) => {
        const ref = collection(db, `artifacts/${appId}/users/${userId}/expenditures`);
        const snapshot = await getDocs(ref);
        const batch = writeBatch(db);
        snapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
        await updateDoc(profileRef, { expenditureBalance: 0 });
    },

    // === GLOBAL ACTIONS ===
    resetAllData: async (userId, user) => {
        const collectionsToDelete = ['courses', 'schedule', 'deadlines', 'examMarks', 'tasks', 'contacts', 'expenditures'];
        for (const coll of collectionsToDelete) {
            const ref = collection(db, `artifacts/${appId}/users/${userId}/${coll}`);
            const snapshot = await getDocs(ref);
            const batch = writeBatch(db);
            snapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }
        const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
        await setDoc(profileRef, { name: user.displayName || 'User', coins: 0, imageUrl: user.photoURL || '', expenditureBalance: 0, isBalanceVisible: true });
    },
};

export default firestoreService;