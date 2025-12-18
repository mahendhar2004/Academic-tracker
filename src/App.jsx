import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, appId } from './firebase/config';
import { useStore } from './store/useStore';
import authService from './services/authService';
import firebaseService from './services/firebaseService';
import { COIN_VALUES } from './constants';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const AttendancePage = lazy(() => import('./pages/AttendancePage'));
const PerformancePage = lazy(() => import('./pages/PerformancePage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const PlannerPage = lazy(() => import('./pages/PlannerPage'));
const ContactsPage = lazy(() => import('./pages/ContactsPage'));
const ExpenditurePage = lazy(() => import('./pages/ExpenditurePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

const LoadingSpinner = () => (
    <div className="bg-black min-h-screen flex justify-center items-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div>
    </div>
);

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // Removed 'view' state, using Router
    const { initializeListeners, cleanupListeners } = useStore();
    const [reward, setReward] = useState({ key: 0, amount: 0 });
    const navigate = useNavigate();
    const location = useLocation();

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

    // Handle Auth State Changes
    useEffect(() => {
        // If viewing a public profile, we might skip full auth flow logic or handle it differently
        // But the original code handled publicProfileId separately.
        // With router, /public/:id is a route.
        if (location.pathname.startsWith('/public/')) {
            setLoading(false);
            // We still want to check auth if user is logged in, but not block rendering?
            // Original code: if publicProfileId -> setLoading(false) and return.
            // This means if acting as public viewer, we don't init listeners for "me"
            // But if I am logged in AND viewing a public profile?
            // Let's stick to original logic: if public profile, just show it.
            // But wait, if I am logged in, I want to see "me" in header? public profile page might not have header.
            // Let's allow auth check to proceed in background or parallel?
            // Original code explicitly returned. I will replicate that behavior for safety.
            // return; 
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

                // Navigation logic
                if (location.pathname === '/' || location.pathname === '/login') {
                    navigate('/dashboard');
                }
            } else {
                localStorage.removeItem('user_session');
                setUser(null);
                cleanupListeners();
                // If on protected route, redirect to login is handled by Routes
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [initializeListeners, cleanupListeners, runDailyCheckIn, navigate, location.pathname]);

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
        authService.signOutUser()
            .then(() => navigate('/'))
            .catch(err => console.error("Sign out failed:", err));
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    <Route path="/" element={<LandingPage onNavigate={() => navigate('/login')} />} />
                    <Route path="/login" element={
                        user ? <Navigate to="/dashboard" /> :
                            <LoginPage
                                onLogin={handleLogin}
                                onLoginWithEmail={handleLoginWithEmail}
                                onSignUpWithEmail={handleSignUpWithEmail}
                                onNavigateToLanding={() => navigate('/')}
                            />
                    } />
                    <Route path="/public/:profileId" element={<PublicProfilePage />} />

                    <Route path="/dashboard" element={
                        user ?
                            <Dashboard
                                user={user}
                                onSignOut={handleSignOut}
                                reward={reward}
                                setReward={setReward}
                                triggerReward={triggerReward}
                            /> : <Navigate to="/login" />
                    }>
                        <Route index element={<Navigate to="home" replace />} />
                        <Route path="home" element={<HomePage />} />
                        <Route path="attendance" element={<AttendancePage />} />
                        <Route path="performance" element={<PerformancePage />} />
                        <Route path="calendar" element={<CalendarPage />} />
                        <Route path="planner" element={<PlannerPage />} />
                        <Route path="contacts" element={<ContactsPage />} />
                        <Route path="expenditure" element={<ExpenditurePage />} />
                        <Route path="profile" element={<ProfilePage />} />
                    </Route>
                </Routes>
            </Suspense>
        </>
    );
}
