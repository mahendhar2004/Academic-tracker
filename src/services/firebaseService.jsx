import {
    doc, setDoc, collection, addDoc, deleteDoc,
    updateDoc, writeBatch, getDocs, Timestamp, increment, runTransaction,
    query, where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    getProfilePath, getCollectionPath, getDocPath,
    getPerformanceTargetPath, COLLECTIONS
} from '../constants/dbPaths';

const firestoreService = {

    // === PROFILE & COINS ===
    updateCoins: async (userId, amount) => {
        if (!userId || amount === 0) return;
        const profileRef = doc(db, getProfilePath(userId));
        await updateDoc(profileRef, { coins: increment(amount) });
    },

    updateProfileDetails: async (userId, details) => {
        const profileRef = doc(db, getProfilePath(userId));
        const updatePayload = {
            name: details.name,
            imageUrl: details.imageUrl,
            personal: {
                age: details.personal?.age || '',
                location: details.personal?.location || '',
                phone: details.personal?.phone || '',
                email: details.personal?.email || '',
                achievements: details.personal?.achievements || [],
            }
        };
        await updateDoc(profileRef, updatePayload);
    },

    saveProfileFieldWithReward: async (userId, field, value, rewardAmount) => {
        const profileRef = doc(db, getProfilePath(userId));

        try {
            const newCoins = await runTransaction(db, async (transaction) => {
                const profileDoc = await transaction.get(profileRef);
                if (!profileDoc.exists()) {
                    throw new Error("Document does not exist!");
                }

                const profileData = profileDoc.data();
                const rewardedFields = profileData.rewardedFields || {};

                const isList = Array.isArray(value);
                const oldListLength = Array.isArray(profileData[field]) ? profileData[field].length : 0;

                let coinsToAward = 0;

                if (isList) {
                    const itemsAdded = value.length - oldListLength;
                    if (itemsAdded > 0) {
                        coinsToAward = itemsAdded * rewardAmount;
                    }
                } else {
                    if (!rewardedFields[field] && value) {
                        coinsToAward = rewardAmount;
                        rewardedFields[field] = true;
                    }
                }

                const updatePayload = {
                    [field]: value,
                    rewardedFields: rewardedFields,
                };

                if (coinsToAward > 0) {
                    updatePayload.coins = increment(coinsToAward);
                }

                transaction.update(profileRef, updatePayload);
                return coinsToAward;
            });

            return newCoins;

        } catch (e) {
            console.error("Transaction failed: ", e);
            await updateDoc(profileRef, { [field]: value });
            return 0;
        }
    },

    // === SCENARIOS (WHAT IF) ===
    saveScenario: async (userId, scenarioData) => {
        const path = getCollectionPath(userId, COLLECTIONS.SCENARIOS);
        await addDoc(collection(db, path), { ...scenarioData, createdAt: Timestamp.now() });
    },

    deleteScenario: async (userId, scenarioId) => {
        const path = getDocPath(userId, COLLECTIONS.SCENARIOS, scenarioId);
        await deleteDoc(doc(db, path));
    },

    // ADDED: Function to save the performance target
    savePerformanceTarget: async (userId, targetData) => {
        const path = getPerformanceTargetPath(userId);
        await setDoc(doc(db, path), targetData);
    },

    handleDailyCheckIn: async (userId, rewardAmount) => {
        const profileRef = doc(db, getProfilePath(userId));
        try {
            const success = await runTransaction(db, async (transaction) => {
                const profileDoc = await transaction.get(profileRef);
                if (!profileDoc.exists()) throw new Error("Profile not found");

                const data = profileDoc.data();
                const lastCheckIn = data.lastCheckIn?.toDate();
                const today = new Date();

                if (!lastCheckIn || lastCheckIn.toDateString() !== today.toDateString()) {
                    transaction.update(profileRef, {
                        coins: increment(rewardAmount),
                        lastCheckIn: Timestamp.now()
                    });
                    return true;
                }
                return false;
            });
            return success ? rewardAmount : 0;
        } catch (e) {
            console.error("Check-in transaction failed: ", e);
            return 0;
        }
    },

    // === COURSES & GRADES ===
    saveCourse: async (userId, courseData) => {
        const dataToSave = {
            ...courseData,
            grade: courseData.grade === "Not Published" ? null : courseData.grade,
            lastAttended: null,
            attendanceCountToday: 0,
            isHidden: false
        };
        const path = getCollectionPath(userId, COLLECTIONS.COURSES);
        await addDoc(collection(db, path), dataToSave);
    },

    saveGrade: async (userId, courseId, grade) => {
        const courseRef = doc(db, getDocPath(userId, COLLECTIONS.COURSES, courseId));
        await updateDoc(courseRef, { grade });
    },

    deleteCourseAndRelatedData: async (userId, courseId) => {
        const batch = writeBatch(db);

        const courseRef = doc(db, getDocPath(userId, COLLECTIONS.COURSES, courseId));
        batch.delete(courseRef);

        const schedulePath = getCollectionPath(userId, COLLECTIONS.SCHEDULE);
        const scheduleQuery = query(collection(db, schedulePath), where("courseId", "==", courseId));
        const scheduleSnapshot = await getDocs(scheduleQuery);
        scheduleSnapshot.forEach(doc => batch.delete(doc.ref));

        const marksPath = getCollectionPath(userId, COLLECTIONS.EXAM_MARKS);
        const marksQuery = query(collection(db, marksPath), where("courseId", "==", courseId));
        const marksSnapshot = await getDocs(marksQuery);
        marksSnapshot.forEach(doc => batch.delete(doc.ref));

        const deadlinesPath = getCollectionPath(userId, COLLECTIONS.DEADLINES);
        const deadlinesQuery = query(collection(db, deadlinesPath), where("courseId", "==", courseId));
        const deadlinesSnapshot = await getDocs(deadlinesQuery);
        deadlinesSnapshot.forEach(doc => batch.delete(doc.ref));

        await batch.commit();
    },

    updateCourse: async (userId, courseId, updatedData) => {
        const path = getDocPath(userId, COLLECTIONS.COURSES, courseId);
        await updateDoc(doc(db, path), updatedData);
    },

    toggleCourseVisibility: async (userId, courseId, isHidden) => {
        const courseRef = doc(db, getDocPath(userId, COLLECTIONS.COURSES, courseId));
        await updateDoc(courseRef, { isHidden: !isHidden });
    },

    // === SCHEDULE (CLASSES) ===
    saveClass: async (userId, scheduleData, classId) => {
        const path = getCollectionPath(userId, COLLECTIONS.SCHEDULE);
        if (classId) {
            await updateDoc(doc(db, path, classId), scheduleData);
        } else {
            await addDoc(collection(db, path), scheduleData);
        }
    },

    deleteClass: async (userId, classId) => {
        const path = getDocPath(userId, COLLECTIONS.SCHEDULE, classId);
        await deleteDoc(doc(db, path));
    },

    // === DEADLINES ===
    saveDeadline: async (userId, deadlineData, deadlineId) => {
        const dataToSave = {
            ...deadlineData,
            date: Timestamp.fromDate(new Date(deadlineData.date))
        };
        const path = getCollectionPath(userId, COLLECTIONS.DEADLINES);
        if (deadlineId) {
            await updateDoc(doc(db, path, deadlineId), dataToSave);
        } else {
            await addDoc(collection(db, path), dataToSave);
        }
    },

    deleteDeadline: async (userId, deadlineId) => {
        const path = getDocPath(userId, COLLECTIONS.DEADLINES, deadlineId);
        await deleteDoc(doc(db, path));
    },

    // === EXAM MARKS ===
    saveExamMark: async (userId, markData, markId) => {
        const path = getCollectionPath(userId, COLLECTIONS.EXAM_MARKS);
        if (markId) {
            await updateDoc(doc(db, path, markId), markData);
        } else {
            await addDoc(collection(db, path), markData);
        }
    },
    deleteExamMark: async (userId, markId) => {
        const path = getDocPath(userId, COLLECTIONS.EXAM_MARKS, markId);
        await deleteDoc(doc(db, path));
    },

    // === TASKS ===
    saveTask: async (userId, taskData, taskId) => {
        const path = getCollectionPath(userId, COLLECTIONS.TASKS);
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
        const taskRef = doc(db, getDocPath(userId, COLLECTIONS.TASKS, taskId));
        await updateDoc(taskRef, {
            isCompleted,
            completedAt: isCompleted ? Timestamp.now() : null
        });
    },

    deleteTask: async (userId, taskId) => {
        const path = getDocPath(userId, COLLECTIONS.TASKS, taskId);
        await deleteDoc(doc(db, path));
    },

    // === CONTACTS ===
    saveContact: async (userId, contactData, contactId) => {
        const path = getCollectionPath(userId, COLLECTIONS.CONTACTS);
        if (contactId) {
            await updateDoc(doc(db, path, contactId), contactData);
        } else {
            await addDoc(collection(db, path), contactData);
        }
    },
    deleteContact: async (userId, contactId) => {
        const path = getDocPath(userId, COLLECTIONS.CONTACTS, contactId);
        await deleteDoc(doc(db, path));
    },

    // === EXPENDITURES ===
    saveExpenditure: async (userId, expenditureData, expenditureId) => {
        const path = getCollectionPath(userId, COLLECTIONS.EXPENDITURES);
        if (expenditureId) {
            await updateDoc(doc(db, path, expenditureId), expenditureData);
        } else {
            await addDoc(collection(db, path), expenditureData);
        }
        return 'SUCCESS';
    },

    deleteExpenditure: async (userId, expenditureToDelete) => {
        const path = getDocPath(userId, COLLECTIONS.EXPENDITURES, expenditureToDelete.id);
        await deleteDoc(doc(db, path));
    },

    resetExpenditures: async (userId) => {
        const ref = collection(db, getCollectionPath(userId, COLLECTIONS.EXPENDITURES));
        const snapshot = await getDocs(ref);
        const batch = writeBatch(db);
        snapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    },

    // === GLOBAL ACTIONS ===
    resetAllData: async (userId, user) => {
        // ADDED: Also delete the performance target when resetting all data
        const collectionsToDelete = Object.values(COLLECTIONS);
        for (const coll of collectionsToDelete) {
            const ref = collection(db, getCollectionPath(userId, coll));
            const snapshot = await getDocs(ref);
            const batch = writeBatch(db);
            snapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }
        const profileRef = doc(db, getProfilePath(userId));
        await setDoc(profileRef, {
            name: user.displayName || 'User',
            email: user.email || '',
            imageUrl: user.photoURL || '',
            coins: 0,
            personal: {
                phone: user.phoneNumber || '',
                isPhoneVerified: false,
                email: user.email || ''
            },
            lastCheckIn: null,
            rewardedFields: {}
        });
    },
};

export default firestoreService;