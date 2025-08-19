import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ClipboardList, GraduationCap, ListTodo, Calendar, Users, CreditCard } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import authService from '../services/authService';

// --- A custom, Neumorphic Input Field ---
const NeumorphicInput = ({ icon: Icon, ...props }) => (
    <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} />
        <input 
            {...props}
            className="w-full bg-[#1A1A1A] border-none text-white placeholder-slate-500 pl-12 pr-4 py-4 rounded-xl shadow-neumorphic-inset focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
        />
    </div>
);

// --- A custom, Neumorphic Button ---
const NeumorphicButton = ({ children, onClick, type = "button", isPrimary = false }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98, boxShadow: 'inset 5px 5px 12px #1c1c1c, inset -5px -5px 12px #3a3a3a' }}
        onClick={onClick}
        type={type}
        className={`w-full font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-neumorphic-outset ${
            isPrimary 
            ? 'text-white bg-gradient-to-br from-cyan-600 to-blue-700' 
            : 'text-slate-300 bg-[#2e2e2e] hover:text-white'
        }`}
    >
        {children}
    </motion.button>
);

// --- An animated, Neumorphic Feature Tile ---
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
        className="w-full h-32 p-4 rounded-2xl shadow-neumorphic-outset bg-[#2e2e2e] flex flex-col items-center justify-center text-center cursor-default"
    >
        <Icon size={32} className={color} />
        <p className="mt-2 font-semibold text-sm text-slate-300">{title}</p>
    </motion.div>
);

// --- The Main Login Page Component ---
const LoginPage = ({ onLogin, onLoginWithEmail, onSignUpWithEmail }) => {
    const [formState, setFormState] = useState('login');
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    
    const features = [
        { icon: ClipboardList, title: "Attendance", color: "text-cyan-400" },
        { icon: GraduationCap, title: "Performance", color: "text-purple-400" },
        { icon: ListTodo, title: "Planner", color: "text-emerald-400" },
        { icon: Calendar, title: "Calendar", color: "text-rose-400" },
        { icon: Users, title: "Contacts", color: "text-yellow-400" },
        { icon: CreditCard, title: "Expenditure", color: "text-orange-400" },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');
        if (formState === 'signup') {
            onSignUpWithEmail(email, password, name, phone);
        } else if (formState === 'login') {
            onLoginWithEmail(email, password);
        } else if (formState === 'forgotPassword') {
            authService.sendResetPasswordLink(email)
                .then(() => {
                    setMessage(`Password reset link sent to ${email}.`);
                    setFormState('login');
                })
                .catch(err => alert(err.message));
        }
    };

    return (
        <div className="min-h-screen bg-black flex justify-center items-center p-4">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* --- LEFT PANEL: FEATURE SHOWCASE --- */}
                <div className="space-y-8">
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl lg:text-4xl font-bold text-slate-200 text-center"
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

                {/* --- RIGHT PANEL: LOGIN/SIGNUP FORM --- */}
                <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="w-full max-w-md mx-auto p-8 rounded-2xl shadow-neumorphic-outset bg-[#242424]"
                >
                    <div className="text-center mb-8">
                        <motion.h1 key={formState + 'h1'} initial={{opacity: 0}} animate={{opacity: 1}} className="text-3xl font-bold text-white mb-2">
                            {formState === 'login' && 'Welcome Back'}
                            {formState === 'signup' && 'Create Account'}
                            {formState === 'forgotPassword' && 'Reset Password'}
                        </motion.h1>
                    </div>

                    {message && <p className="text-green-400 text-center text-sm mb-4">{message}</p>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence>
                            {formState === 'signup' && (
                                <motion.div key="name-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                    <NeumorphicInput icon={User} type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                                </motion.div>
                            )}
                             {formState === 'signup' && (
                                <motion.div key="phone-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                    <NeumorphicInput icon={Phone} type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <NeumorphicInput icon={Mail} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />

                        {formState !== 'forgotPassword' && (
                            <NeumorphicInput icon={Lock} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        )}
                        
                        {formState === 'login' && (
                            <div className="text-right">
                                <button type="button" onClick={() => setFormState('forgotPassword')} className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        <NeumorphicButton type="submit" isPrimary={true}>
                            {formState === 'login' && 'Sign In'}
                            {formState === 'signup' && 'Create Account'}
                            {formState === 'forgotPassword' && 'Send Reset Link'}
                        </NeumorphicButton>
                    </form>
                    
                    <div className="flex items-center gap-4 my-6">
                        <hr className="w-full border-slate-700/50" />
                        <span className="text-slate-500 text-xs font-semibold">OR</span>
                        <hr className="w-full border-slate-700/50" />
                    </div>

                    <NeumorphicButton onClick={() => onLogin('google')}>
                        <span className="flex items-center justify-center gap-3">
                            <FaGoogle /> Continue with Google
                        </span>
                    </NeumorphicButton>

                    <div className="text-center mt-6">
                        <p className="text-sm text-slate-400">
                            {formState === 'login' && "Don't have an account?"}
                            {formState === 'signup' && 'Already have an account?'}
                            {formState === 'forgotPassword' && 'Remember your password?'}
                            <button onClick={() => setFormState(formState === 'login' ? 'signup' : 'login')} className="font-semibold text-cyan-400 hover:text-cyan-300 ml-2">
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
