import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, Eye, EyeOff, Plus, Minus, Info, X } from 'lucide-react';
import { COURSE_THEMES } from '../../constants';

const AttendanceCard = ({ course, onMarkAttendance, onTotalChange, onDecrementAttendance, onDelete, onEdit, onToggleVisibility, isCurrentSemester }) => {
    const { name, attended = 0, total = 0, isHidden = false, color = 'cyan', professor, timings, credits } = course;
    const percentage = total > 0 ? ((attended / total) * 100).toFixed(1) : 0;
    const [showInfo, setShowInfo] = useState(false);

    // Find theme object (default to Cyan if not found)
    const theme = COURSE_THEMES.find(t => t.value === color) || COURSE_THEMES.find(t => t.value === 'cyan');
    const accentColor = theme.hex;

    const handleAttendClick = () => {
        onMarkAttendance(course);
    };

    // Smart Attendance Logic
    const calculateStatus = (attended, total) => {
        if (total === 0) return { type: 'neutral', message: 'No classes yet' };

        const threshold = 0.75;
        const currentPercentage = attended / total;

        if (currentPercentage >= threshold) {
            // Calculate safe bunks: (attended) / (total + x) >= 0.75
            // x <= (attended / 0.75) - total
            const safeBunks = Math.floor((attended / 0.75) - total);
            if (safeBunks > 0) return { type: 'safe', message: `Safe to Bunk: ${safeBunks}`, count: safeBunks };
            return { type: 'warning', message: 'On the Edge (0 Safe Bunks)', count: 0 };
        } else {
            // Calculate classes needed: (attended + x) / (total + x) >= 0.75
            // x >= (0.75 * total - attended) / 0.25
            const needed = Math.ceil((threshold * total - attended) / 0.25);
            return { type: 'danger', message: `Attend Next: ${needed}`, count: needed };
        }
    };

    const status = calculateStatus(attended, total);

    return (
        <div
            className="relative group bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:border-white/20 overflow-hidden"
            style={{
                borderColor: showInfo ? accentColor : undefined
            }}
        >
            {/* Background Accent Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-white/5 dark:to-white/5 rounded-bl-full pointer-events-none opacity-50"
                style={{ background: `linear-gradient(to bottom left, ${accentColor}22, transparent)` }} />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-lg md:text-xl text-slate-900 dark:text-white truncate" title={name}>{name}</h3>
                    {/* Status Badge */}
                    {status.type !== 'neutral' && isCurrentSemester && (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold mt-2 border ${status.type === 'safe' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' :
                            status.type === 'danger' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' :
                                'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
                            }`}>
                            <span>{status.message}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowInfo(!showInfo)}
                        className={`p-2 rounded-full transition-colors ${showInfo ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-brand-secondary dark:text-slate-500 dark:hover:text-cyan-400'}`}
                    >
                        {showInfo ? <X size={18} /> : <Info size={18} />}
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onToggleVisibility(course.id, isHidden)}
                        className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors"
                        title={isHidden ? "Show Card" : "Hide Card"}
                    >
                        {isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                    </motion.button>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onEdit(course)} className="p-2 rounded-full text-slate-400 hover:text-brand-secondary dark:text-slate-500 dark:hover:text-cyan-400 transition-colors">
                            <Edit size={18} />
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={onDelete} className="p-2 rounded-full text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors">
                            <Trash2 size={18} />
                        </motion.button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {showInfo ? (
                    <motion.div
                        key="info"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 mb-4 text-sm"
                    >
                        <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Credits</span>
                                <span className="font-semibold text-slate-900 dark:text-white">{credits}</span>
                            </div>
                            {professor && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Professor</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{professor}</span>
                                </div>
                            )}
                            {timings && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Timings</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{timings}</span>
                                </div>
                            )}
                            {!professor && !timings && (
                                <p className="text-center text-slate-400 dark:text-slate-500 italic text-xs py-1">No additional details added.</p>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="stats"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Attended</span>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">{attended}</span>
                                <div className="flex items-center gap-1 mt-2 absolute bottom-0 w-full">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDecrementAttendance(course); }}
                                        disabled={!isCurrentSemester || attended <= 0}
                                        className="flex-1 h-8 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Decrement"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleAttendClick(); }}
                                        disabled={!isCurrentSemester}
                                        className="flex-1 h-8 flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                                        style={{ backgroundColor: accentColor }}
                                        title="Mark Present"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <div className="h-8 w-full mt-2"></div> {/* Spacer for buttons */}
                            </div>

                            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total</span>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">{total}</span>
                                <div className="flex items-center gap-1 mt-2 absolute bottom-0 w-full">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onTotalChange(course, -1); }}
                                        disabled={!isCurrentSemester || total <= attended}
                                        className="flex-1 h-8 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Decrease Total"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onTotalChange(course, 1); }}
                                        disabled={!isCurrentSemester}
                                        className="flex-1 h-8 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Increase Total"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <div className="h-8 w-full mt-2"></div> {/* Spacer for buttons */}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative pt-1">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Attendance</span>
                                <span className={`text-sm font-bold ${status.type === 'safe' ? 'text-green-500 dark:text-green-400' : status.type === 'danger' ? 'text-red-500 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                    {percentage}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, ease: "circOut" }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: accentColor }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AttendanceCard;
