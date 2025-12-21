import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import GlassyModal from '../common/GlassyModal';

const ResetExpendituresModal = ({ isOpen, onClose, onConfirm }) => (
    <GlassyModal isOpen={isOpen} onClose={onClose} title="Reset Expenditures" customClasses="border-red-500/50 bg-red-900/10">
        <div className="space-y-6 text-center max-w-sm">
            <AlertTriangle size={48} className="mx-auto text-red-400" />
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Are you absolutely sure?</h3>
                <p className="text-slate-600 dark:text-slate-300 mt-2">
                    This will permanently delete all transaction history and reset your balance to zero.
                    <strong className="text-red-400 block mt-2">This action cannot be undone.</strong>
                </p>
            </div>
            <div className="flex justify-center gap-4">
                <motion.button whileTap={{ scale: 0.95 }} onClick={onClose} className="bg-slate-100 hover:bg-slate-200 dark:bg-black/20 dark:hover:bg-black/40 border border-slate-200 dark:border-white/20 text-slate-700 dark:text-white font-bold py-2 px-6 rounded-lg transition-colors">
                    Cancel
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onConfirm} className="bg-red-500/50 hover:bg-red-500/80 border border-red-400/50 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                    Yes, Reset
                </motion.button>
            </div>
        </div>
    </GlassyModal>
);

export default ResetExpendituresModal;