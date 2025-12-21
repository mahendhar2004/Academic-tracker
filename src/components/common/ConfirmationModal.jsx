import React from 'react';
import { motion } from 'framer-motion';
import GlassyModal from './GlassyModal';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => (
    <GlassyModal isOpen={isOpen} onClose={onClose} title="Confirm Action">
        <div className="space-y-6">
            <p className="text-slate-700 dark:text-slate-200 text-center">{message}</p>
            <div className="flex justify-center gap-4">
                <motion.button whileTap={{ scale: 0.95 }} onClick={onClose} className="bg-slate-200 hover:bg-slate-300 dark:bg-black/20 dark:hover:bg-black/40 border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-bold py-2 px-6 rounded-lg transition-colors">No</motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onConfirm} className="bg-brand-primary hover:bg-brand-primary/90 dark:bg-cyan-500/50 dark:hover:bg-cyan-500/80 border border-brand-primary/50 dark:border-cyan-400/50 text-white font-bold py-2 px-6 rounded-lg transition-colors">Yes</motion.button>
            </div>
        </div>
    </GlassyModal>
);

export default ConfirmationModal;
