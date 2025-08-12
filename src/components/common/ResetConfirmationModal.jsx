import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import GlassyModal from './GlassyModal';

const ResetConfirmationModal = ({ isOpen, onClose, onConfirm }) => (
     <GlassyModal isOpen={isOpen} onClose={onClose} title="Reset All Data" customClasses="border-red-500/50 bg-red-900/10">
        <div className="space-y-6 text-center">
            <AlertTriangle size={48} className="mx-auto text-red-400" />
            <p className="text-slate-200">Are you sure you want to reset everything? All your courses, grades, and coins will be permanently deleted. This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
                <motion.button whileTap={{scale: 0.95}} onClick={onClose} className="bg-black/20 hover:bg-black/40 border border-white/20 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</motion.button>
                <motion.button whileTap={{scale: 0.95}} onClick={onConfirm} className="bg-red-500/50 hover:bg-red-500/80 border border-red-400/50 text-white font-bold py-2 px-6 rounded-lg transition-colors">Yes, Reset</motion.button>
            </div>
        </div>
     </GlassyModal>
);

export default ResetConfirmationModal;
