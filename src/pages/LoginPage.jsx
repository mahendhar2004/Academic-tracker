import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import authService from '../services/authService';

const LoginPage = ({ onLogin, onLoginWithEmail, onSignUpWithEmail }) => {
    // Can be 'login', 'signup', or 'forgotPassword'
    const [formState, setFormState] = useState('login'); 
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState(''); // For success messages

    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        if (formState === 'signup') {
            onSignUpWithEmail(email, password, name, phone);
        } else if (formState === 'login') {
            onLoginWithEmail(email, password);
        } else if (formState === 'forgotPassword') {
            authService.sendResetPasswordLink(email)
                .then(() => {
                    setMessage(`Password reset link sent to ${email}. Please check your inbox.`);
                    setFormState('login'); // Go back to login form
                })
                .catch(err => alert(err.message));
        }
    };

    const formVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    return (
        <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4 overflow-hidden">
            <div className="absolute inset-0 z-0 aurora-background" />

            <motion.div
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative z-10 w-full max-w-md bg-slate-900/50 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl shadow-2xl"
            >
                <div className="text-center mb-8">
                    <motion.h1 key={formState} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-white mb-2">
                        {formState === 'login' && 'Welcome Back'}
                        {formState === 'signup' && 'Create Your Account'}
                        {formState === 'forgotPassword' && 'Reset Password'}
                    </motion.h1>
                    <p className="text-slate-400">
                        {formState === 'login' && 'Sign in to continue your journey.'}
                        {formState === 'signup' && 'Let’s get you started.'}
                        {formState === 'forgotPassword' && 'Enter your email to receive a reset link.'}
                    </p>
                </div>

                {message && <p className="text-green-400 text-center text-sm mb-4">{message}</p>}

                <motion.form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence>
                        {formState === 'signup' && (
                            <motion.div key="name-field" {...formVariants} className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all text-white" required />
                            </motion.div>
                        )}
                        {formState !== 'login' && (
                            <motion.div key="phone-field" {...formVariants} className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all text-white" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all text-white" required />
                    </div>

                    {formState !== 'forgotPassword' && (
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all text-white" required={formState !== 'forgotPassword'} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    )}
                    
                    {formState === 'login' && (
                        <div className="text-right">
                            <button type="button" onClick={() => setFormState('forgotPassword')} className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all hover:shadow-lg hover:shadow-cyan-500/30">
                        {formState === 'login' && 'Sign In'}
                        {formState === 'signup' && 'Create Account'}
                        {formState === 'forgotPassword' && 'Send Reset Link'}
                    </motion.button>
                </motion.form>

                <div className="flex items-center gap-4 my-6">
                    <hr className="w-full border-slate-700" />
                    <span className="text-slate-500 text-xs font-semibold">OR</span>
                    <hr className="w-full border-slate-700" />
                </div>

                <motion.button whileTap={{ scale: 0.98 }} onClick={() => onLogin('google')} className="w-full flex items-center justify-center gap-3 bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                    <FaGoogle />
                    Sign in with Google
                </motion.button>

                <div className="text-center mt-6">
                    <p className="text-sm text-slate-400">
                        {formState === 'login' && "Don't have an account?"}
                        {formState === 'signup' && 'Already have an account?'}
                        {formState === 'forgotPassword' && 'Remembered your password?'}
                        <button onClick={() => setFormState(formState === 'login' ? 'signup' : 'login')} className="font-semibold text-cyan-400 hover:text-cyan-300 ml-2">
                            {formState === 'login' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;