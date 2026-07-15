import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Loader2 } from 'lucide-react';
import GlassyModal from '../common/GlassyModal';

const ReauthModal = ({ isOpen, onClose, onReauthenticate, provider, isSubmitting, errorMessage }) => {
    const [password, setPassword] = useState('');
    const isGoogleProvider = provider === 'google.com';

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        onReauthenticate(password);
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title="Security Check Required" customClasses="border-orange-500/50 bg-orange-900/10">
            <div className="space-y-6 text-center max-w-sm">
                <ShieldAlert size={48} className="mx-auto text-orange-400" />
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Action Requires Recent Sign-In</h3>
                    <p className="text-slate-600 dark:text-slate-300 mt-2">
                        For your security, please confirm it's you so we can finish deleting your account.
                    </p>
                </div>

                {errorMessage && (
                    <p className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm p-3 rounded-lg">
                        {errorMessage}
                    </p>
                )}

                {isGoogleProvider ? (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onReauthenticate()}
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-orange-500/50 hover:bg-orange-500/80 border border-orange-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Continue with Google'}
                    </motion.button>
                ) : (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            autoFocus
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-orange-400 text-slate-900 dark:text-white"
                        />
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={isSubmitting || !password}
                            className="w-full flex items-center justify-center gap-2 bg-orange-500/50 hover:bg-orange-500/80 border border-orange-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Confirm & Delete Account'}
                        </motion.button>
                    </form>
                )}

                <button onClick={onClose} disabled={isSubmitting} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50">
                    Cancel
                </button>
            </div>
        </GlassyModal>
    );
};

export default ReauthModal;
