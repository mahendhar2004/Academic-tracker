import { 
    signInWithPopup, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    deleteUser,
    sendEmailVerification // Import the new function
} from 'firebase/auth';
import { auth } from '../firebase/config';

const authService = {
    signInWithGoogle: () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    },

    signInWithEmail: (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    },

    signUpWithEmail: (email, password) => {
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

    // NEW: Function to send a verification email to the current user
    sendVerificationEmail: () => {
        const user = auth.currentUser;
        if (user) {
            return sendEmailVerification(user);
        }
        return Promise.reject(new Error("No user is currently signed in."));
    }
};

export default authService;