import { 
    signInWithPopup, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    deleteUser,
    sendEmailVerification,
    // ADDED: Imports for session persistence
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../firebase/config';

// ADDED: Helper function to set persistence before any sign-in action
const setAuthPersistence = async () => {
    try {
        await setPersistence(auth, browserLocalPersistence);
    } catch (error) {
        console.error("Error setting auth persistence:", error);
    }
};

const authService = {
    signInWithGoogle: async () => {
        await setAuthPersistence(); // Set persistence before sign-in
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    },

    signInWithEmail: async (email, password) => {
        await setAuthPersistence(); // Set persistence before sign-in
        return signInWithEmailAndPassword(auth, email, password);
    },

    signUpWithEmail: async (email, password) => {
        await setAuthPersistence(); // Set persistence for new sign-ups
        return createUserWithEmailAndPassword(auth, email, password);
    },
    
    updateUserProfile: (user, profileInfo) => {
        return updateProfile(user, profileInfo);
    },

    sendResetPasswordLink: (email) => {
        return sendPasswordResetEmail(auth, email);
    },

    signOutUser: () => {
        return signOut(auth);
    },

    deleteCurrentUser: () => {
        const user = auth.currentUser;
        if (user) {
            return deleteUser(user);
        }
        return Promise.reject(new Error("No user is currently signed in."));
    },

    sendVerificationEmail: () => {
        const user = auth.currentUser;
        if (user) {
            return sendEmailVerification(user);
        }
        return Promise.reject(new Error("No user is currently signed in."));
    }
};

export default authService;
