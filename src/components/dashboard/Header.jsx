import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Coins, CalendarDays } from 'lucide-react';

const Header = ({ currentPage, profileData, onAddNewCourse, onSetCurrentPage, onOpenTimetable }) => {
    return (
        <header className="flex justify-between items-center mb-12">
            <h1 className="text-3xl font-bold text-white">
                {currentPage === 'attendance' ? `Welcome, ${profileData.name || 'User'}` : `${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}`}
            </h1>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-yellow-400 bg-black/20 px-3 py-2 rounded-lg border border-white/20">
                    <Coins size={20} />
                    <span className="font-bold text-lg">{profileData.coins || 0}</span>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onOpenTimetable} className="flex-shrink-0 flex items-center justify-center bg-white/15 backdrop-blur-xl border border-white/25 text-white w-10 h-10 rounded-lg transition-colors hover:bg-white/25">
                    <CalendarDays size={20} />
                </motion.button>
                {currentPage === 'attendance' && (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={onAddNewCourse} className="flex-shrink-0 flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/25 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-white/25">
                        <Plus size={18} /> <span className="hidden sm:inline">Add Course</span>
                    </motion.button>
                )}
            </div>
        </header>
    );
};

export default Header;
