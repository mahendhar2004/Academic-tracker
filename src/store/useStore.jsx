import { create } from 'zustand';
import { onSnapshot, doc, collection, query } from 'firebase/firestore';
import { db, appId } from '../firebase/config';

// This array holds all our listener unsubscribe functions
let listeners = [];

// Helper functions for listeners, kept inside the store file for co-location
const getCollectionListener = (userId, collectionName, callback) => {
    const path = `artifacts/${appId}/users/${userId}/${collectionName}`;
    const q = query(collection(db, path));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
    });
};

const getProfileListener = (userId, user, callback) => {
    const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
    return onSnapshot(profileRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        } else {
            // This is a fallback, App.jsx now handles initial profile creation
            // but it's good to have it here just in case.
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
    // === STATE ===
    allCourses: [],
    // UPDATED: Removed expenditureBalance and isBalanceVisible from default state
    profileData: { name: '', imageUrl: '', coins: 0 },
    schedule: [],
    deadlines: [],
    examMarks: [],
    tasks: [],
    contacts: [],
    expenditures: [],
    isDataLoaded: false,

    // === ACTIONS ===
    initializeListeners: (user) => {
        if (get().isDataLoaded || !user) return; 

        const collections = ['courses', 'schedule', 'deadlines', 'examMarks', 'tasks', 'contacts', 'expenditures'];
        const setters = {
            courses: (data) => set({ allCourses: data }),
            schedule: (data) => set({ schedule: data }),
            deadlines: (data) => set({ deadlines: data }),
            examMarks: (data) => set({ examMarks: data }),
            tasks: (data) => set({ tasks: data }),
            contacts: (data) => set({ contacts: data.sort((a, b) => a.name.localeCompare(b.name)) }),
            expenditures: (data) => set({ expenditures: data }),
        };

        const unsubProfile = getProfileListener(user.uid, user, (data) => set({ profileData: data }));
        listeners.push(unsubProfile);

        collections.forEach(name => {
            const unsub = getCollectionListener(user.uid, name, setters[name]);
            listeners.push(unsub);
        });

        set({ isDataLoaded: true });
    },

    cleanupListeners: () => {
        listeners.forEach(unsub => unsub());
        listeners = [];
        set({
            allCourses: [],
            // UPDATED: Removed expenditureBalance and isBalanceVisible from cleanup
            profileData: { name: '', imageUrl: '', coins: 0 },
            schedule: [],
            deadlines: [],
            examMarks: [],
            tasks: [],
            contacts: [],
            expenditures: [],
            isDataLoaded: false,
        });
    },
}));
