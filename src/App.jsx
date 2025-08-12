import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signOut } from 'firebase/auth';
import { auth } from './firebase/config';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

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
