import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trash2 } from 'lucide-react';
import CoinReward from '../common/CoinReward';

const AttendanceCard = ({ course, onUpdate, onMarkAttendance, onTotalChange, onDecrementAttendance, onDelete, isCurrentSemester }) => {
    const { name, attended = 0, total = 0, streak = 0, lastAttended, attendanceCountToday = 0 } = course;
    const percentage = total > 0 ? ((attended / total) * 100).toFixed(1) : 0;
    const [reward, setReward] = useState(0);

    const today = new Date().toISOString().split('T')[0];
    const isAttendedTwiceToday = lastAttended === today && attendanceCountToday >= 2;

    const handleAttendClick = () => {
        const coinsEarned = onMarkAttendance(course);
        if (coinsEarned > 0) {
            setReward(coinsEarned);
        }
    };
    
    return (
        <div className="relative group bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-4 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-white truncate pr-4">{name}</h3>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-orange-400" style={{ textShadow: '0 0 10px #f97316' }}>
                        <Flame size={18} />
                        <span className="font-bold text-lg">{streak}</span>
                    </div>
                    <motion.button whileTap={{scale: 0.9}} onClick={onDelete} className="text-slate-500 hover:text-red-400 transition-opacity duration-200 opacity-0 group-hover:opacity-100 z-10">
                        <Trash2 size={16} />
                    </motion.button>
                </div>
            </div>
            <div className="flex justify-around items-center mb-3">
                <div className="text-center"><p className="text-slate-300 text-sm">Attended</p><div className="flex items-center gap-2 mt-1"><motion.button whileTap={{scale:0.9}} onClick={() => onDecrementAttendance(course)} disabled={!isCurrentSemester || attended <= 0} className="bg-black/20 rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">-</motion.button><p className="text-white font-semibold text-xl w-10 text-center">{attended}</p><motion.button whileTap={{scale:0.9}} onClick={handleAttendClick} disabled={!isCurrentSemester || isAttendedTwiceToday} className="bg-black/20 rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">+</motion.button></div></div>
                <div className="text-center"><p className="text-slate-300 text-sm">Total</p><div className="flex items-center gap-2 mt-1"><motion.button whileTap={{scale:0.9}} onClick={() => onTotalChange(course, -1)} disabled={!isCurrentSemester || total <= attended} className="bg-black/20 rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">-</motion.button><p className="text-white font-semibold text-xl w-10 text-center">{total}</p><motion.button whileTap={{scale:0.9}} onClick={() => onTotalChange(course, 1)} disabled={!isCurrentSemester} className="bg-black/20 rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">+</motion.button></div></div>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2.5"><div className={`bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div></div>
            <p className={`text-right text-sm font-bold mt-2 ${percentage >= 75 ? 'text-green-300' : percentage >= 50 ? 'text-yellow-300' : 'text-red-400'}`}>{percentage}%</p>
            <AnimatePresence>
                {reward > 0 && <CoinReward amount={reward} onComplete={() => setReward(0)} />}
            </AnimatePresence>
        </div>
    );
};

export default AttendanceCard;
