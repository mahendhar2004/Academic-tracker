import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Coins, CalendarDays, Timer } from 'lucide-react';

// NEW: A custom hook for the live clock
const useLiveTime = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return time;
};

const Header = ({ currentPage, profileData, onAddNewCourse, onOpenTimetable, onOpenPomodoro }) => {
    const currentTime = useLiveTime();

    const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
                <h1 className="text-3xl font-bold text-white">
                    {currentPage === 'home' ? `Welcome, ${profileData.name || 'User'}` : `${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}`}
                </h1>
                 {/* NEW: Live time and date display */}
                <p className="text-slate-400 mt-1">{formattedDate} | {formattedTime}</p>
                 
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-yellow-400 bg-black/20 px-3 py-2 rounded-lg border border-white/20">
                    <Coins size={20} />
                    <span className="font-bold text-lg">{profileData.coins || 0}</span>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onOpenPomodoro} title="Pomodoro Timer" className="flex-shrink-0 flex items-center justify-center bg-white/15 backdrop-blur-xl border border-white/25 text-white w-10 h-10 rounded-lg transition-colors hover:bg-white/25">
                    <Timer size={20} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onOpenTimetable} title="Weekly Timetable" className="flex-shrink-0 flex items-center justify-center bg-white/15 backdrop-blur-xl border border-white/25 text-white w-10 h-10 rounded-lg transition-colors hover:bg-white/25">
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