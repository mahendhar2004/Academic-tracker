import React from 'react';
import { motion } from 'framer-motion';

const LoginPage = ({ onLogin }) => {
    return (
        <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full max-w-sm"
            >
                <div className="bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-8 rounded-2xl shadow-2xl text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Academic Tracker</h1>
                    <p className="text-slate-300 mb-8">Sign in to continue</p>
                    <div className="space-y-4">
                        <motion.button whileTap={{scale:0.95}} onClick={() => onLogin('google')} className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                            <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                            Sign in with Google
                        </motion.button>
                        <motion.button whileTap={{scale:0.95}} onClick={() => onLogin('facebook')} className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                            <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="currentColor" d="M22,12c0-5.52-4.48-10-10-10S2,6.48,2,12c0,4.84,3.44,8.87,8,9.8V15H8v-3h2V9.5C10,7.57,11.57,6,13.5,6H16v3h-2c-0.55,0-1,0.45-1,1v2h3v3h-3v6.95C18.05,21.45,22,17.19,22,12z"></path></svg>
                            Sign in with Facebook
                        </motion.button>
                         <motion.button whileTap={{scale:0.95}} onClick={() => onLogin('apple')} className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                            <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="currentColor" d="M17.2,2.8c-1.2-0.1-2.4,0.5-3.2,1.3c-0.8,0.9-1.5,2.3-1.9,3.7c-0.6-1.1-1-2.2-1-3.4c0-1.6,0.7-3.1,1.9-4.1C13.5,0,14.1,0,14.6,0c0.1,0,0.1,0,0.2,0c0.1,0,0.2,0,0.3,0c0.6,0.1,1.2,0.3,1.8,0.7c0.2,0.1,0.3,0.2,0.4,0.4c-0.1,0-0.2,0-0.3,0.1c-0.3,0.1-0.6,0.2-0.9,0.4c-0.8,0.4-1.5,1-1.9,1.8c-0.1,0.2,0,0.4,0.2,0.5c0.3,0.2,0.6,0.3,1,0.4c1.1,0.3,2.2,0.1,3.2-0.5c0.2-0.1,0.3-0.1,0.5-0.1c0.1,0,0.2,0,0.3,0C20.4,4.2,20.8,2,17.2,2.8z M12.3,10.6c-0.1-2.1,1.2-4.1,3-5c0.9-0.5,2-0.7,3-0.6c0.1,0,0.3-0.1,0.4-0.2c-0.7-0.5-1.5-0.8-2.4-0.8c-1.3-0.1-2.6,0.5-3.5,1.4c-1.5,1.5-2.2,3.6-2,5.7c0.1,1.2,0.5,2.4,1.2,3.4c0.7,1,1.6,1.8,2.8,2.2c1.1,0.4,2.3,0.3,3.4-0.2c0.3-0.1,0.6-0.3,0.8-0.5c0.1-0.1,0.1-0.2,0.1-0.4c-0.1,0-0.1,0-0.2,0c-1.4-0.2-2.7-0.9-3.7-2C12.7,12.9,12.3,11.8,12.3,10.6z M11.6,23.5c1.4,0,2.8-0.5,3.9-1.3c1.1-0.8,2-1.9,2.5-3.2c-0.1,0-0.2,0-0.4,0.1c-1.3,0.4-2.7,0.4-4-0.1c-2-0.8-3.5-2.4-4.2-4.4c-1.1-3,0.4-6.3,3.4-7.4c0.5-0.2,1-0.3,1.5-0.3c0.6,0,1.1,0.1,1.7,0.3c0.1,0,0.2,0,0.3-0.1c-0.1-0.1-0.2-0.1-0.2-0.2c-0.8-0.6-1.8-0.9-2.8-0.9c-3.2,0-6,2.5-6.3,5.7c-0.3,3.6,2.3,6.8,5.8,7.2C10.9,23.5,11.2,23.5,11.6,23.5z"></path></svg>
                            Sign in with Apple
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
