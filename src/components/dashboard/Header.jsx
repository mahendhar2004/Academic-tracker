import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, CalendarDays, Timer, Bug, Search } from 'lucide-react';
import CoinReward from '../common/CoinReward';

const useLiveTime = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);
    return time;
};

const Header = ({ currentPage, profileData, onOpenTimetable, onOpenPomodoro, onOpenBugReport, onOpenSearch, reward, setReward }) => {
    const currentTime = useLiveTime();
    const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
                <h1 className="text-3xl font-bold text-white">
                    {currentPage === 'home' ? 'Dashboard' : `${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}`}
                </h1>
                <p className="text-slate-400 mt-1">{formattedDate} | {formattedTime}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative group">
                    <div className="flex items-center gap-2 text-yellow-400 bg-black/20 px-3 py-2 rounded-lg border border-white/20">
                        <Coins size={20} />
                        <span className="font-bold text-lg">{profileData.coins || 0}</span>
                    </div>
                    <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-white/10 p-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <h4 className="font-bold text-white mb-2">How to earn coins?</h4>
                        <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                            <li>Daily Check-in: +5</li>
                            <li>Complete a Task: +10</li>
                            <li>Finish Pomodoro: +25</li>
                            <li>Fill Profile Details: +10 to +100</li>
                        </ul>
                        <p className="text-xs text-cyan-300 mt-2">Rewards coming soon!</p>
                    </div>

                    <AnimatePresence>
                        {reward.amount > 0 && (
                            <CoinReward
                                key={reward.key}
                                amount={reward.amount}
                                onComplete={() => setReward({ key: 0, amount: 0 })}
                            />
                        )}
                    </AnimatePresence>
                </div>

                <motion.button whileTap={{ scale: 0.95 }} onClick={onOpenSearch} title="Search (Ctrl+K)" className="hidden md:flex flex-shrink-0 items-center justify-center bg-white/15 backdrop-blur-xl border border-white/25 text-white w-10 h-10 rounded-lg transition-colors hover:bg-white/25">
                    <Search size={20} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onOpenPomodoro} title="Pomodoro Timer" className="flex-shrink-0 flex items-center justify-center bg-white/15 backdrop-blur-xl border border-white/25 text-white w-10 h-10 rounded-lg transition-colors hover:bg-white/25">
                    <Timer size={20} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onOpenTimetable} title="Weekly Timetable" className="flex-shrink-0 flex items-center justify-center bg-white/15 backdrop-blur-xl border border-white/25 text-white w-10 h-10 rounded-lg transition-colors hover:bg-white/25">
                    <CalendarDays size={20} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onOpenBugReport} title="Report an Issue" className="flex-shrink-0 flex items-center justify-center bg-red-500/20 backdrop-blur-xl border border-red-500/30 text-red-300 w-10 h-10 rounded-lg transition-colors hover:bg-red-500/30">
                    <Bug size={20} />
                </motion.button>
            </div>
        </header>
    );
};

export default Header;