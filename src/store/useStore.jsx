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

// ADDED: A new listener for a single document, perfect for the performance target
const getDocumentListener = (path, callback) => {
    return onSnapshot(doc(db, path), (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        } else {
            callback(null); // Explicitly handle the case where the document doesn't exist
        }
    });
};

const getProfileListener = (userId, user, callback) => {
    const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
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
    // === STATE ===
    allCourses: [],
    profileData: { name: '', imageUrl: '', coins: 0 },
    schedule: [],
    deadlines: [],
    examMarks: [],
    tasks: [],
    contacts: [],
    expenditures: [],
    // ADDED: New state to hold the performance target data
    performanceTarget: null,
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

        // ADDED: Listener for the performance target document
        const targetPath = `artifacts/${appId}/users/${user.uid}/performanceTarget/target`;
        const unsubTarget = getDocumentListener(targetPath, (data) => set({ performanceTarget: data }));
        listeners.push(unsubTarget);

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
            profileData: { name: '', imageUrl: '', coins: 0 },
            schedule: [],
            deadlines: [],
            examMarks: [],
            tasks: [],
            contacts: [],
            expenditures: [],
            // ADDED: Reset performance target on cleanup
            performanceTarget: null,
            isDataLoaded: false,
        });
    },
}));