import React from 'react';
import { motion } from 'framer-motion';
import GlassyModal from './GlassyModal';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => (
     <GlassyModal isOpen={isOpen} onClose={onClose} title="Confirm Action">
        <div className="space-y-6">
            <p className="text-slate-200 text-center">{message}</p>
            <div className="flex justify-center gap-4">
                <motion.button whileTap={{scale: 0.95}} onClick={onClose} className="bg-black/20 hover:bg-black/40 border border-white/20 text-white font-bold py-2 px-6 rounded-lg transition-colors">No</motion.button>
                <motion.button whileTap={{scale: 0.95}} onClick={onConfirm} className="bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-2 px-6 rounded-lg transition-colors">Yes</motion.button>
            </div>
        </div>
     </GlassyModal>
);

export default ConfirmationModal;
