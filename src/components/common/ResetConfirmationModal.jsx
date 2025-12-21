import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import GlassyModal from './GlassyModal';

const ResetConfirmationModal = ({ isOpen, onClose, onConfirm }) => (
     <GlassyModal isOpen={isOpen} onClose={onClose} title="Reset All Data" customClasses="border-red-500/50 bg-red-900/10">
          {/* FIX: Added max-w-sm to constrain the width and force text to wrap */}
          <div className="space-y-6 text-center max-w-sm">
               <AlertTriangle size={48} className="mx-auto text-red-500 dark:text-red-400" />
               <p className="text-slate-700 dark:text-slate-200">Are you sure you want to reset everything? All your courses, grades, and coins will be permanently deleted. This action cannot be undone.</p>
               <div className="flex justify-center gap-4">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={onClose} className="bg-slate-200 hover:bg-slate-300 dark:bg-black/20 dark:hover:bg-black/40 border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={onConfirm} className="bg-red-500 hover:bg-red-600 dark:bg-red-500/50 dark:hover:bg-red-500/80 border border-red-500 dark:border-red-400/50 text-white font-bold py-2 px-6 rounded-lg transition-colors">Yes, Reset</motion.button>
               </div>
          </div>
     </GlassyModal>
);

export default ResetConfirmationModal;