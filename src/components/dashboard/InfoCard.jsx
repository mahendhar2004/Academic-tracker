import React from 'react';
import { motion } from 'framer-motion';

// UPDATED: Accept a 'className' prop and provide a default style
const InfoCard = ({ icon: Icon, title, children, delay = 0.1, className = "bg-white/50 dark:bg-slate-800/50 backdrop-blur-3xl border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-lg h-full" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={className} // Use the passed-in or default className
        >
            {/* NEW: Add the subtle shine effect */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-slate-200/50 dark:bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                <Icon size={18} className="text-brand-secondary dark:text-cyan-400" />
                {title}
            </h3>
            <div className="space-y-3">
                {children}
            </div>
        </motion.div>
    );
};

export default InfoCard;