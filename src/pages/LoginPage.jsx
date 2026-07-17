import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// UPDATED: Added ArrowLeft icon
import { Mail, Lock, User, Phone, ClipboardList, GraduationCap, ListTodo, Calendar, Users, CreditCard, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const NeumorphicInput = ({ icon: Icon, label, id, ...props }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordField = props.type === 'password';

    const toggleVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{label}</label>
            <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10" size={18} />
                <input 
                    id={id}
                    {...props}
                    type={isPasswordField ? (isPasswordVisible ? 'text' : 'password') : props.type}
                    className="w-full bg-[#F0F2F5] dark:bg-[#1A1A1A] border-none text-slate-800 dark:text-white placeholder-slate-500 pl-12 pr-12 py-4 rounded-xl shadow-neumorphic-inset dark:shadow-neumorphic-inset-dark focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                />
                {isPasswordField && (
                    <button 
                        type="button" 
                        onClick={toggleVisibility} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                    >
                        {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
};

const NeumorphicButton = ({ children, onClick, type = "button", isPrimary = false, disabled = false }) => (
    <motion.button
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98, boxShadow: 'inset 5px 5px 12px #d1d5db, inset -5px -5px 12px #ffffff' }}
        onClick={onClick}
        type={type}
        disabled={disabled}
        className={`w-full font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-neumorphic-outset dark:shadow-neumorphic-outset-dark ${
            isPrimary 
            ? 'text-white bg-gradient-to-br from-cyan-500 to-blue-600' 
            : 'text-slate-700 dark:text-slate-300 bg-[#E0E5EC] dark:bg-[#2e2e2e] hover:text-slate-900 dark:hover:text-white'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
        {children}
    </motion.button>
);

const FeatureTile = ({ icon: Icon, title, color, index }) => (
    <motion.div
        variants={{ 
            hidden: { opacity: 0, y: 20 }, 
            visible: { opacity: 1, y: 0 } 
        }}
        animate={{ y: [-8, 8, -8] }}
        transition={{
            duration: 6 + index * 0.5,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut'
        }}
        className="w-full h-32 p-4 rounded-2xl shadow-neumorphic-outset dark:shadow-neumorphic-outset-dark bg-[#E0E5EC] dark:bg-[#2e2e2e] flex flex-col items-center justify-center text-center cursor-default"
    >
        <Icon size={32} className={color} />
        <p className="mt-2 font-semibold text-sm text-slate-600 dark:text-slate-300">{title}</p>
    </motion.div>
);

const LoginPage = ({ onLogin, onLoginWithEmail, onSignUpWithEmail }) => {
    const navigate = useNavigate();
    const [formState, setFormState] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const features = [
        { icon: ClipboardList, title: "Attendance", color: "text-cyan-500" },
        { icon: GraduationCap, title: "Performance", color: "text-purple-500" },
        { icon: ListTodo, title: "Planner", color: "text-emerald-500" },
        { icon: Calendar, title: "Calendar", color: "text-rose-500" },
        { icon: Users, title: "Contacts", color: "text-yellow-500" },
        { icon: CreditCard, title: "Expenditure", color: "text-orange-500" },
    ];
    
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            await onLogin('google');
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in process was cancelled.');
            } else {
                setError('Google sign-in failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            if (formState === 'signup') {
                await onSignUpWithEmail(email, password, name, phone);
            } else if (formState === 'login') {
                await onLoginWithEmail(email, password);
            } else if (formState === 'forgotPassword') {
                await authService.sendResetPasswordLink(email);
                alert(`Password reset link sent to ${email}.`);
                setFormState('login');
            }
        } catch (err) {
            switch (err.code) {
                case 'auth/invalid-credential':
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    setError('Invalid email or password. Please try again.');
                    break;
                case 'auth/email-already-in-use':
                    setError('This email is already registered. Please sign in.');
                    break;
                default:
                    setError('An error occurred. Please try again later.');
                    break;
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#E0E5EC] dark:bg-black flex justify-center items-center p-4">
            <button
                type="button"
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-semibold z-10"
            >
                <ArrowLeft size={18} />
                Back to Home
            </button>
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                <div className="space-y-8 hidden lg:block">
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl lg:text-4xl font-bold text-slate-700 dark:text-slate-200 text-center"
                    >
                        Your Entire Academic Life, Organized.
                    </motion.h1>
                    <motion.div 
                        className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.1 } }
                        }}
                    >
                        {features.map((feature, index) => (
                           <FeatureTile key={feature.title} {...feature} index={index} />
                        ))}
                    </motion.div>
                </div>

                <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-[#1e1e1e] shadow-lg dark:shadow-2xl dark:shadow-black/50"
                >
                    <div className="text-center mb-6">
                        <motion.h1 key={formState + 'h1'} initial={{opacity: 0}} animate={{opacity: 1}} className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                            {formState === 'login' && 'Welcome Back'}
                            {formState === 'signup' && 'Create Account'}
                            {formState === 'forgotPassword' && 'Reset Password'}
                        </motion.h1>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-red-500/10 border border-red-500/30 text-red-500 text-center text-sm p-3 rounded-lg"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {formState === 'signup' && (
                                <motion.div key="signup-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-5 overflow-hidden">
                                    <NeumorphicInput id="name" label="Full Name" icon={User} type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
                                    <NeumorphicInput id="phone" label="Phone Number (Optional)" icon={Phone} type="tel" placeholder="Your Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <NeumorphicInput id="email" label="Email Address" icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />

                        {formState !== 'forgotPassword' && (
                            <NeumorphicInput id="password" label="Password" icon={Lock} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        )}
                        
                        {formState === 'login' && (
                            <div className="text-right -mt-2">
                                <button type="button" onClick={() => { setFormState('forgotPassword'); setError(''); }} className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        <NeumorphicButton type="submit" isPrimary={true} disabled={isLoading}>
                             {isLoading && (formState === 'login' || formState === 'signup') ? (
                                 <span className="flex items-center justify-center gap-2">
                                     <Loader2 className="animate-spin" size={20} />
                                     {formState === 'login' ? 'Signing In...' : 'Creating Account...'}
                                 </span>
                             ) : (
                                 <>
                                     {formState === 'login' && 'Sign In'}
                                     {formState === 'signup' && 'Create Account'}
                                     {formState === 'forgotPassword' && 'Send Reset Link'}
                                 </>
                             )}
                        </NeumorphicButton>
                    </form>
                    
                    <div className="flex items-center gap-4 my-6">
                        <hr className="w-full border-slate-200 dark:border-slate-700/50" />
                        <span className="text-slate-500 text-xs font-semibold">OR</span>
                        <hr className="w-full border-slate-200 dark:border-slate-700/50" />
                    </div>

                    <NeumorphicButton onClick={handleGoogleLogin} disabled={isLoading}>
                        <span className="flex items-center justify-center gap-3">
                            <FaGoogle /> Continue with Google
                        </span>
                    </NeumorphicButton>

                    <div className="text-center mt-6">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {formState === 'login' && "Don't have an account?"}
                            {formState === 'signup' && 'Already have an account?'}
                            {formState === 'forgotPassword' && 'Remember your password?'}
                            <button onClick={() => { setFormState(formState === 'login' ? 'signup' : 'login'); setError(''); }} className="font-semibold text-cyan-600 dark:text-cyan-400 hover:underline ml-2">
                                {formState === 'login' ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};


export default LoginPage;