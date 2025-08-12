import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

// Your provided Firebase credentials
const firebaseConfig = {
    apiKey: "AIzaSyDb026Tf_OjFwg1hVCkWCRpjUJ8CJ84y5o",
    authDomain: "my-academic-tracker.firebaseapp.com",
    projectId: "my-academic-tracker",
    storageBucket: "my-academic-tracker.appspot.com",
    messagingSenderId: "665502100040",
    appId: "1:665502100040:web:b0d05cfa35887baf88c67d",
    measurementId: "G-SF32Q4KGHX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const appId = 'default-app-id';

export { auth, db, storage, appId };
