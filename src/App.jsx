import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, appId } from './firebase/config';
import { useStore } from './store/useStore';
import authService from './services/authService';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { initializeListeners, cleanupListeners } = useStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const profileRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profile/data`);
                const profileSnap = await getDoc(profileRef);
                
                if (!profileSnap.exists()) {
                    await setDoc(profileRef, {
                        name: currentUser.displayName || 'New User',
                        email: currentUser.email || '',
                        imageUrl: currentUser.photoURL || '',
                        coins: 0,
                        expenditureBalance: 0,
                        isBalanceVisible: true,
                        personal: {
                            phone: currentUser.phoneNumber || '',
                            isPhoneVerified: false,
                            email: currentUser.email || ''
                        }
                    });
                }
                setUser(currentUser);
                initializeListeners(currentUser);
            } else {
                setUser(null);
                cleanupListeners();
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [initializeListeners, cleanupListeners]);

    const handleLogin = (providerName) => {
        if (providerName === 'google') {
            authService.signInWithGoogle().catch(err => alert(err.message));
        }
    };

    const handleLoginWithEmail = (email, password) => {
        authService.signInWithEmail(email, password).catch(err => alert(err.message));
    };
    
    const handleSignUpWithEmail = async (email, password, name, phone) => {
        try {
            const userCredential = await authService.signUpWithEmail(email, password);
            const user = userCredential.user;
            await authService.updateUserProfile(user, { displayName: name });

            const profileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/data`);
            await setDoc(profileRef, {
                name: name,
                email: user.email,
                imageUrl: user.photoURL || '',
                coins: 0,
                expenditureBalance: 0,
                isBalanceVisible: true,
                personal: {
                    phone: phone || '',
                    isPhoneVerified: false,
                    email: user.email || ''
                }
            });
        } catch (error) {
            alert("Sign up failed: " + error.message);
        }
    };

    const handleSignOut = () => {
        authService.signOutUser().catch(err => console.error("Sign out failed:", err));
    };

    if (loading) {
        return <div className="bg-black min-h-screen flex justify-center items-center text-white"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div></div>;
    }

    return (
        <>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            {user ? (
                <Dashboard user={user} onSignOut={handleSignOut} />
            ) : (
                <LoginPage 
                    onLogin={handleLogin} 
                    onLoginWithEmail={handleLoginWithEmail}
                    onSignUpWithEmail={handleSignUpWithEmail}
                />
            )}
            {/* REMOVED: The reCAPTCHA container div is no longer needed */}
        </>
    );
}