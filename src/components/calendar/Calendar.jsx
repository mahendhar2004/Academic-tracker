import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

const Calendar = ({ currentDate, onDateClick, eventsByDate, onPrevMonth, onNextMonth, selectedDate }) => {
    // Access theme
    const { theme } = useStore();
    const isDark = theme !== 'light';

    const { monthName, year, daysInMonth } = useMemo(() => {
        const monthName = currentDate.toLocaleString('default', { month: 'long' });
        const year = currentDate.getFullYear();
        const firstDay = new Date(year, currentDate.getMonth(), 1).getDay();
        const daysInCurrentMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();

        const days = [];
        // Monday is 1, Sunday is 0. Adjust for a Monday start.
        const paddingDays = (firstDay === 0) ? 6 : firstDay - 1;
        for (let i = 0; i < paddingDays; i++) {
            days.push({ day: null, isPadding: true });
        }

        for (let i = 1; i <= daysInCurrentMonth; i++) {
            days.push({ day: i, isPadding: false });
        }
        return { monthName, year, daysInMonth: days };
    }, [currentDate]);

    const today = new Date();

    return (
        <div className="bg-white/60 dark:bg-slate-900/70 backdrop-blur-3xl border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <motion.button whileTap={{ scale: 0.9 }} onClick={onPrevMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-white"><ChevronLeft size={20} /></motion.button>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">{monthName} {year}</h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={onNextMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-white"><ChevronRight size={20} /></motion.button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 dark:text-slate-400 mb-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {daysInMonth.map((dayObj, index) => {
                    const dateKey = dayObj.day ? `${year}-${currentDate.getMonth() + 1}-${dayObj.day}` : `pad-${index}`;
                    const hasEvents = eventsByDate[dateKey];
                    const isToday = dayObj.day === today.getDate() && currentDate.getMonth() === today.getMonth() && year === today.getFullYear();
                    const isSelected = selectedDate && (dayObj.day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth() && year === selectedDate.getFullYear());

                    const fullDate = dayObj.day ? new Date(year, currentDate.getMonth(), dayObj.day) : null;

                    return (
                        <motion.button
                            key={index}
                            onClick={() => !dayObj.isPadding && onDateClick(fullDate)}
                            className={`relative w-10 h-10 rounded-full transition-colors duration-300 ${dayObj.isPadding ? 'cursor-default' : 'hover:bg-slate-100 dark:hover:bg-white/10'}`}
                            animate={{
                                backgroundColor: isSelected ? (isDark ? 'rgba(34, 211, 238, 0.5)' : 'rgba(56, 189, 248, 0.4)') : isToday ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
                                color: isSelected || isToday ? (isDark ? '#FFFFFF' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b')
                            }}
                        >
                            {dayObj.day}
                            {hasEvents && <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-secondary dark:bg-cyan-400 rounded-full"></div>}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default Calendar;