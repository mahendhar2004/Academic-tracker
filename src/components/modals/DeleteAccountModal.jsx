import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import GlassyModal from '../common/GlassyModal';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm }) => {
    const [confirmationText, setConfirmationText] = useState('');
    const isConfirmed = confirmationText === 'DELETE';

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title="Delete Account" customClasses="border-red-500/50 bg-red-900/10">
            <div className="space-y-6 text-center max-w-sm">
                <AlertTriangle size={48} className="mx-auto text-red-400" />
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Are you absolutely sure?</h3>
                    <p className="text-slate-600 dark:text-slate-300 mt-2">
                        This action cannot be undone. This will permanently delete your account, courses, profile, and all other associated data.
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 mt-4">
                        Please type <strong className="text-red-400">DELETE</strong> to confirm.
                    </p>
                </div>
                <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 text-center text-lg tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-red-400 text-slate-900 dark:text-white"
                />
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onConfirm}
                    disabled={!isConfirmed}
                    className="w-full bg-red-500/50 hover:bg-red-500/80 border border-red-400/50 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    I understand the consequences, delete my account
                </motion.button>
            </div>
        </GlassyModal>
    );
};

export default DeleteAccountModal;