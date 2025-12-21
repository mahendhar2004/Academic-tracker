import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const GlassyModal = ({ isOpen, onClose, children, title, customClasses = "" }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    // FIX: Replaced the old gradient with the new, darker glass background
                    className={`bg-white/95 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-2xl text-slate-900 dark:text-white ${customClasses}`}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">{title}</h2>
                        <button onClick={onClose} className="text-slate-400 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={24} /></button>
                    </div>
                    {children}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default GlassyModal;
