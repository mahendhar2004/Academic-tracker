import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase/config';
import { getProfilePath } from './constants/dbPaths';
import { useStore } from './store/useStore';
import authService from './services/authService';
import firebaseService from './services/firebaseService';
import { COIN_VALUES } from './constants';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ToastNotification from './components/common/ToastNotification';

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
const PredictorPage = lazy(() => import('./pages/PredictorPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
// ... existing lazy loads ...



const LoadingSpinner = () => (
    <div className="bg-black min-h-screen flex justify-center items-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div>
    </div>
);

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // Removed 'view' state, using Router
    const { initializeListeners, cleanupListeners, theme, toast, hideToast, setUser: setGlobalUser } = useStore();
    const [reward, setReward] = useState({ key: 0, amount: 0 });
    const navigate = useNavigate();
    const location = useLocation();

    // Theme Effect
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

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

    // /public/:id renders PublicProfilePage standalone -- don't leave it stuck behind the
    // global loading spinner while the (irrelevant to it) auth check below resolves.
    useEffect(() => {
        if (location.pathname.startsWith('/public/')) {
            setLoading(false);
        }
    }, [location.pathname]);

    // Handle Auth State Changes. The auth listener still sets up in the background even on
    // /public/:id routes, so a logged-in user's session/listeners stay initialized while
    // viewing a public profile link.

    // Tracks which uid we've already initialized listeners for, so the effect doesn't need
    // `user` as a dependency (which would make it tear down and resubscribe on every auth
    // transition, since the callback itself calls setUser).
    const initializedUidRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                if (initializedUidRef.current !== currentUser.uid) {
                    initializedUidRef.current = currentUser.uid;
                    setUser(currentUser);
                    setGlobalUser(currentUser); // Update global store
                    initializeListeners(currentUser);

                    // Save session
                    const sessionData = {
                        uid: currentUser.uid,
                        loginTime: new Date().getTime()
                    };
                    localStorage.setItem('user_session', JSON.stringify(sessionData));

                    await runDailyCheckIn(currentUser.uid);

                    // Navigation logic
                    if (location.pathname === '/' || location.pathname === '/login') {
                        navigate('/dashboard');
                    }
                }
            } else {
                // User is signed out
                initializedUidRef.current = null;
                setUser(null);
                setGlobalUser(null);
                cleanupListeners();
                localStorage.removeItem('user_session');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [initializeListeners, cleanupListeners, runDailyCheckIn, navigate, location.pathname, setGlobalUser]);

    const ensureProfileDocument = async (currentUser) => {
        const profileRef = doc(db, getProfilePath(currentUser.uid));
        const profileSnap = await getDoc(profileRef);
        if (!profileSnap.exists()) {
            await setDoc(profileRef, {
                name: currentUser.displayName || 'User',
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
    };

    const handleLogin = async (providerName) => {
        if (providerName === 'google') {
            const userCredential = await authService.signInWithGoogle();
            // Google sign-in can be a brand-new account -- unlike email sign-up, there's no
            // separate "create account" step, so the profile doc may not exist yet.
            await ensureProfileDocument(userCredential.user);
            return userCredential;
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

            const profileRef = doc(db, getProfilePath(user.uid));
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
                        <Route path="predictor" element={<PredictorPage />} />
                    </Route>
                </Routes>

                {/* Global Toast Notification */}
                <ToastNotification
                    show={toast?.show}
                    message={toast?.message}
                    type={toast?.type}
                    onHide={hideToast}
                />
            </Suspense>
        </>
    );
}
