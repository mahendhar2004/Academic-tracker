import { create } from 'zustand';
import { onSnapshot, doc, collection, query } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import { getCollectionPath, getProfilePath, getPerformanceTargetPath } from '../constants/dbPaths';

import { createCourseSlice } from './slices/courseSlice';
import { createUserSlice } from './slices/userSlice';
import { createDataSlice } from './slices/dataSlice';

// This array holds all our listener unsubscribe functions
let listeners = [];

// Helper functions for listeners
const getCollectionListener = (userId, collectionName, callback) => {
    const path = getCollectionPath(userId, collectionName);
    const q = query(collection(db, path));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
    });
};

const getDocumentListener = (path, callback) => {
    return onSnapshot(doc(db, path), (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        } else {
            callback(null);
        }
    });
};

const getProfileListener = (userId, user, callback) => {
    const profileRef = doc(db, getProfilePath(userId));
    return onSnapshot(profileRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        } else {
            const newProfile = {
                name: user.displayName || 'User',
                email: user.email || '',
                imageUrl: user.photoURL || '',
                coins: 0,
            };
            callback(newProfile);
        }
    });
};

export const useStore = create((set, get) => ({
    // Combined State Slices
    ...createCourseSlice(set, get),
    ...createUserSlice(set, get),
    ...createDataSlice(set, get),

    isDataLoaded: false,

    // === ACTIONS ===
    initializeListeners: (user) => {
        if (get().isDataLoaded || !user) return;

        // Use setters from slices
        const setters = {
            courses: get().setCourses,
            schedule: get().setSchedule,
            deadlines: get().setDeadlines,
            examMarks: get().setExamMarks,
            tasks: get().setTasks,
            contacts: get().setContacts,
            expenditures: get().setExpenditures,
            scenarios: get().setScenarios,
        };

        const unsubProfile = getProfileListener(user.uid, user, get().setProfileData);
        listeners.push(unsubProfile);

        // ADDED: Listener for the performance target document
        const targetPath = getPerformanceTargetPath(user.uid);
        const unsubTarget = getDocumentListener(targetPath, get().setPerformanceTarget);
        listeners.push(unsubTarget);

        Object.keys(setters).forEach(name => {
            const unsub = getCollectionListener(user.uid, name, setters[name]);
            listeners.push(unsub);
        });

        set({ isDataLoaded: true });
    },

    cleanupListeners: () => {
        listeners.forEach(unsub => unsub());
        listeners = [];

        // Reset all state using setters or manual reset
        get().setCourses([]);
        get().setSchedule([]);
        get().setDeadlines([]);
        get().setExamMarks([]);
        get().setTasks([]);
        get().setContacts([]);
        get().setExpenditures([]);
        get().setScenarios([]);
        get().setProfileData({ name: '', imageUrl: '', coins: 0 });
        get().setPerformanceTarget(null);

        set({ isDataLoaded: false });
    },
}));