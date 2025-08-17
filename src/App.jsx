import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, appId } from './firebase/config';
import { useStore } from './store/useStore';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { initializeListeners, cleanupListeners } = useStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Ensure user profile exists before initializing listeners
                const profileRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profile/data`);
                const profileSnap = await getDoc(profileRef);
                if (!profileSnap.exists()) {
                    await setDoc(profileRef, {
                        name: currentUser.displayName || 'User',
                        email: currentUser.email || '',
                        imageUrl: currentUser.photoURL || '',
                        coins: 0,
                        expenditureBalance: 0,
                        isBalanceVisible: true
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

    const handleLogin = async (providerName) => {
        let provider;
        if (providerName === 'google') provider = new GoogleAuthProvider();
        if (providerName === 'facebook') provider = new FacebookAuthProvider();
        if (providerName === 'apple') provider = new OAuthProvider('apple.com');
        
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Authentication failed:", error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    };

    if (loading) {
        return <div className="bg-black min-h-screen flex justify-center items-center text-white"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div></div>;
    }

    return (
        <>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            {user ? <Dashboard user={user} onSignOut={handleSignOut} /> : <LoginPage onLogin={handleLogin} />}
        </>
    );
}