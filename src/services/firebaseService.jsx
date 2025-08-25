import {
    doc, setDoc, collection, addDoc, deleteDoc,
    updateDoc, writeBatch, getDocs, Timestamp, increment, runTransaction,
    query, where
} from 'firebase/firestore';
import { db, appId } from '../firebase/config';

const firestoreService = {

    // === PROFILE & COINS ===
    updateCoins: async (userId, amount) => {
        if (!userId || amount === 0) return;
        const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
        await updateDoc(profileRef, { coins: increment(amount) });
    },

    updateProfileDetails: async (userId, details) => {
        const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
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
        const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
        
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

    // ADDED: Function to save the performance target
    savePerformanceTarget: async (userId, targetData) => {
        const path = `artifacts/${appId}/users/${userId}/performanceTarget/target`;
        await setDoc(doc(db, path), targetData);
    },

    handleDailyCheckIn: async (userId, rewardAmount) => {
        const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
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
        const path = `artifacts/${appId}/users/${userId}/courses`;
        await addDoc(collection(db, path), dataToSave);
    },

    saveGrade: async (userId, courseId, grade) => {
        const courseRef = doc(db, `artifacts/${appId}/users/${userId}/courses`, courseId);
        await updateDoc(courseRef, { grade });
    },
    
    deleteCourseAndRelatedData: async (userId, courseId) => {
        const batch = writeBatch(db);

        const courseRef = doc(db, `artifacts/${appId}/users/${userId}/courses`, courseId);
        batch.delete(courseRef);

        const schedulePath = `artifacts/${appId}/users/${userId}/schedule`;
        const scheduleQuery = query(collection(db, schedulePath), where("courseId", "==", courseId));
        const scheduleSnapshot = await getDocs(scheduleQuery);
        scheduleSnapshot.forEach(doc => batch.delete(doc.ref));

        const marksPath = `artifacts/${appId}/users/${userId}/examMarks`;
        const marksQuery = query(collection(db, marksPath), where("courseId", "==", courseId));
        const marksSnapshot = await getDocs(marksQuery);
        marksSnapshot.forEach(doc => batch.delete(doc.ref));
        
        const deadlinesPath = `artifacts/${appId}/users/${userId}/deadlines`;
        const deadlinesQuery = query(collection(db, deadlinesPath), where("courseId", "==", courseId));
        const deadlinesSnapshot = await getDocs(deadlinesQuery);
        deadlinesSnapshot.forEach(doc => batch.delete(doc.ref));

        await batch.commit();
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
    saveExpenditure: async (userId, expenditureData, expenditureId) => {
        const path = `artifacts/${appId}/users/${userId}/expenditures`;
        if (expenditureId) {
            await updateDoc(doc(db, path, expenditureId), expenditureData);
        } else {
            await addDoc(collection(db, path), expenditureData);
        }
        return 'SUCCESS';
    },

    deleteExpenditure: async (userId, expenditureToDelete) => {
        const path = `artifacts/${appId}/users/${userId}/expenditures`;
        await deleteDoc(doc(db, path, expenditureToDelete.id));
    },
    
    resetExpenditures: async (userId) => {
        const ref = collection(db, `artifacts/${appId}/users/${userId}/expenditures`);
        const snapshot = await getDocs(ref);
        const batch = writeBatch(db);
        snapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    },

    // === GLOBAL ACTIONS ===
    resetAllData: async (userId, user) => {
        // ADDED: Also delete the performance target when resetting all data
        const collectionsToDelete = ['courses', 'schedule', 'deadlines', 'examMarks', 'tasks', 'contacts', 'expenditures', 'performanceTarget'];
        for (const coll of collectionsToDelete) {
            const ref = collection(db, `artifacts/${appId}/users/${userId}/${coll}`);
            const snapshot = await getDocs(ref);
            const batch = writeBatch(db);
            snapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }
        const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
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