import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { COURSE_THEMES } from '../../constants';

const AttendanceCard = ({ course, onMarkAttendance, onTotalChange, onDecrementAttendance, onDelete, onToggleVisibility, isCurrentSemester }) => {
    const { name, attended = 0, total = 0, isHidden = false, color = 'cyan' } = course;
    const percentage = total > 0 ? ((attended / total) * 100).toFixed(1) : 0;

    // Find theme object (default to Cyan if not found)
    const theme = COURSE_THEMES.find(t => t.value === color) || COURSE_THEMES.find(t => t.value === 'cyan');
    const accentColor = theme.hex;

    const handleAttendClick = () => {
        onMarkAttendance(course);
    };

    return (
        <div
            className="relative group bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-white/40"
            style={{
                boxShadow: `0 10px 40px -10px ${accentColor}33`, // Soft colored glow
                borderColor: `${accentColor}44` // Subtle colored border
            }}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl text-white truncate pr-4">{name}</h3>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onToggleVisibility(course.id, isHidden)}
                            className="text-slate-500 hover:text-white"
                            style={{ color: isHidden ? accentColor : undefined }}
                        >
                            {isHidden ? <Eye size={18} /> : <EyeOff size={18} />}
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={onDelete} className="text-slate-500 hover:text-red-400">
                            <Trash2 size={18} />
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="flex justify-around items-center pt-4 mb-4">
                <div className="text-center">
                    <p className="text-slate-300 text-base">Attended</p>
                    <div className="flex items-center gap-3 mt-1">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDecrementAttendance(course)}
                            disabled={!isCurrentSemester || attended <= 0}
                            className="bg-black/20 rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            -
                        </motion.button>
                        <p className="text-white font-semibold text-2xl w-12 text-center">{attended}</p>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleAttendClick}
                            disabled={!isCurrentSemester}
                            className="bg-black/20 rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
                        >
                            +
                        </motion.button>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-slate-300 text-base">Total</p>
                    <div className="flex items-center gap-3 mt-1">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onTotalChange(course, -1)}
                            disabled={!isCurrentSemester || total <= attended}
                            className="bg-black/20 rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            -
                        </motion.button>
                        <p className="text-white font-semibold text-2xl w-12 text-center">{total}</p>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onTotalChange(course, 1)}
                            disabled={!isCurrentSemester}
                            className="bg-black/20 rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            +
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className="h-3 rounded-full"
                    style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}66` }}
                />
            </div>

            <p className={`text-right text-base font-bold mt-2 ${percentage >= 75 ? 'text-green-300' : percentage >= 50 ? 'text-yellow-300' : 'text-red-400'}`}>
                {percentage}%
            </p>
        </div>
    );
};

export default AttendanceCard;
