import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react'; // Added imports
import AtAGlance from '../components/dashboard/AtAGlance';

// Added performanceData, isCpiVisible, and onToggleCpiVisibility props
const HomePage = ({ schedule, deadlines, tasks, courses, performanceData, isCpiVisible, onToggleCpiVisibility }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.4 }}
        >
            {/* New CPI Display Section */}
            <div className="flex justify-end mb-8">
                <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg border border-white/20">
                    <span className="font-semibold text-slate-300 text-sm">CPI:</span>
                    <span className="font-bold text-lg text-cyan-300 w-12 text-center">
                        {isCpiVisible ? (performanceData?.cpi || '0.0') : '–.–'}
                    </span>
                    <button onClick={onToggleCpiVisibility} className="text-slate-400 hover:text-white">
                        {isCpiVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className="max-w-4xl">
                <AtAGlance schedule={schedule} deadlines={deadlines} tasks={tasks} courses={courses} />
            </div>
        </motion.div>
    );
};

export default HomePage;