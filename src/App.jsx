import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, appId } from './firebase/config';
import { useStore } from './store/useStore';
import authService from './services/authService';
import firebaseService from './services/firebaseService';
import { COIN_VALUES } from './constants';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import PublicProfilePage from './pages/PublicProfilePage';
import LandingPage from './pages/LandingPage';

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('landing'); 
    const { initializeListeners, cleanupListeners } = useStore();
    const [reward, setReward] = useState({ key: 0, amount: 0 });
    const [publicProfileId, setPublicProfileId] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const shareId = queryParams.get('profile');
        if (shareId) {
            setPublicProfileId(shareId);
        }
    }, []);

    useEffect(() => {
        const session = JSON.parse(localStorage.getItem('user_session'));
        if (session) {
            const now = new Date().getTime();
            const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000; 
            if (now - session.loginTime > sevenDaysInMillis) {
                authService.signOutUser();
                localStorage.removeItem('user_session');
            }
        }
    }, []);

    const triggerReward = useCallback((amount) => {
        if (amount > 0) {
            setReward(prev => ({ key: prev.key + 1, amount }));
        }
    }, []);

    const runDailyCheckIn = useCallback(async (userId) => {
        const coinsAwarded = await firebaseService.handleDailyCheckIn(userId, COIN_VALUES.DAILY_CHECK_IN);
        if (coinsAwarded > 0) {
            setTimeout(() => {
                triggerReward(coinsAwarded);
            }, 2000);
        }
    }, [triggerReward]);

    useEffect(() => {
        if (publicProfileId) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const session = JSON.parse(localStorage.getItem('user_session'));
                if (!session || session.uid !== currentUser.uid) {
                    localStorage.setItem('user_session', JSON.stringify({
                        uid: currentUser.uid,
                        loginTime: new Date().getTime()
                    }));
                }

                const profileRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profile/data`);
                const profileSnap = await getDoc(profileRef);
                
                if (!profileSnap.exists()) {
                    await setDoc(profileRef, {
                        name: currentUser.displayName || 'New User',
                        email: currentUser.email || '',
                        imageUrl: currentUser.photoURL || '',
                        coins: 0,
                        personal: {
                            phone: currentUser.phoneNumber || '',
                            isPhoneVerified: false,
                            email: currentUser.email || ''
                        },
                        lastCheckIn: null,
                        rewardedFields: {}
                    });
                }
                setUser(currentUser);
                initializeListeners(currentUser);
                await runDailyCheckIn(currentUser.uid);
                setView('dashboard'); 
            } else {
                localStorage.removeItem('user_session');
                setUser(null);
                cleanupListeners();
                setView('landing'); 
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [publicProfileId, initializeListeners, cleanupListeners, runDailyCheckIn]);

    const handleLogin = (providerName) => {
        if (providerName === 'google') {
            return authService.signInWithGoogle();
        }
    };

    const handleLoginWithEmail = (email, password) => {
        return authService.signInWithEmail(email, password);
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
                personal: {
                    phone: phone || '',
                    isPhoneVerified: false,
                    email: user.email || ''
                },
                lastCheckIn: null,
                rewardedFields: {}
            });
        } catch (error) {
            throw error;
        }
    };

    const handleSignOut = () => {
        authService.signOutUser().catch(err => console.error("Sign out failed:", err));
    };

    if (loading) {
        return <div className="bg-black min-h-screen flex justify-center items-center text-white"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div></div>;
    }

    if (publicProfileId) {
        return <PublicProfilePage shareId={publicProfileId} />;
    }

    const renderContent = () => {
        switch (view) {
            case 'login':
                return <LoginPage 
                    onLogin={handleLogin} 
                    onLoginWithEmail={handleLoginWithEmail}
                    onSignUpWithEmail={handleSignUpWithEmail}
                    onNavigateToLanding={() => setView('landing')}
                />;
            case 'dashboard':
                if (user) {
                    return <Dashboard 
                        user={user} 
                        onSignOut={handleSignOut}
                        reward={reward}
                        setReward={setReward}
                        triggerReward={triggerReward}
                    />;
                }
                setView('login');
                return null;
            case 'landing':
            default:
                return <LandingPage onNavigate={() => setView('login')} />;
        }
    };

    return (
        <>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            {renderContent()}
        </>
    );
}
