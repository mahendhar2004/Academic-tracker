import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const AccordionSection = ({ icon: Icon, title, children, isOpen, onToggle }) => {
    return (
        <div className="border-b border-white/10">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center py-4 text-left"
            >
                <h3 className="font-bold text-white flex items-center gap-3">
                    <Icon size={20} className="text-cyan-400" />
                    {title}
                </h3>
                <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// UPDATED: Corrected the export syntax
export default AccordionSection;