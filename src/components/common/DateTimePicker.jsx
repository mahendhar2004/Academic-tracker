import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const DateTimePicker = ({ value, onChange, type = 'datetime' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date(value || new Date()));
    const pickerRef = useRef(null);

    // NEW: Internal state for handling time inputs smoothly
    const [hourStr, setHourStr] = useState('');
    const [minuteStr, setMinuteStr] = useState('');

    const selectedDate = new Date(value || Date.now());

    // NEW: Sync internal time state when the main value prop changes
    useEffect(() => {
        const date = new Date(value || Date.now());
        setHourStr(String(date.getHours()).padStart(2, '0'));
        setMinuteStr(String(date.getMinutes()).padStart(2, '0'));
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    useEffect(() => {
        if (isOpen) {
            setCurrentMonth(new Date(value || new Date()));
        }
    }, [isOpen, value]);

    const handleDateChange = (day) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, selectedDate.getHours(), selectedDate.getMinutes());
        onChange(newDate.toISOString());
        if (type === 'date') {
            setIsOpen(false);
        }
    };
    
    // UPDATED: This now only handles the local string input
    const handleLocalTimeChange = (part, val) => {
        const numericVal = val.replace(/[^0-9]/g, '').slice(0, 2);
        if (part === 'hours') {
            setHourStr(numericVal);
        } else {
            setMinuteStr(numericVal);
        }
    };

    // NEW: This function validates the time and updates the parent state on blur
    const handleTimeBlur = (part) => {
        let currentVal = part === 'hours' ? hourStr : minuteStr;
        let numericVal = parseInt(currentVal, 10);

        if (isNaN(numericVal)) numericVal = 0;

        const max = part === 'hours' ? 23 : 59;
        if (numericVal > max) numericVal = max;

        const newDate = new Date(selectedDate);
        if (part === 'hours') {
            newDate.setHours(numericVal);
        } else {
            newDate.setMinutes(numericVal);
        }
        
        onChange(newDate.toISOString());
    };

    const daysInMonth = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();
        const padding = Array((firstDay === 0 ? 6 : firstDay - 1)).fill(null);
        const dates = Array.from({ length: days }, (_, i) => i + 1);
        return [...padding, ...dates];
    };

    return (
        <div className="relative w-full" ref={pickerRef}>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                <span className="flex items-center gap-2 text-white">
                    {type !== 'time' && <Calendar size={16} className="text-slate-400" />}
                    {type !== 'time' && <span>{selectedDate.toLocaleDateString('en-GB')}</span>}
                    {type === 'datetime' && <span className="text-slate-500">|</span>}
                    {type !== 'date' && <Clock size={16} className="text-slate-400" />}
                    {type !== 'date' && <span>{hourStr}:{minuteStr}</span>}
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full mt-2 w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg z-10 p-4"
                    >
                        {type !== 'time' && (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-1.5 rounded-full hover:bg-white/10"><ChevronLeft size={18} /></button>
                                    <span className="font-bold">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                                    <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-1.5 rounded-full hover:bg-white/10"><ChevronRight size={18} /></button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <div key={d}>{d}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {daysInMonth().map((day, i) => (
                                        <button 
                                            key={i} 
                                            type="button"
                                            onClick={() => day && handleDateChange(day)}
                                            className={`h-8 rounded-full text-sm transition-colors ${!day ? 'cursor-default' : 'hover:bg-white/10'} ${day === selectedDate.getDate() && currentMonth.getMonth() === selectedDate.getMonth() ? 'bg-cyan-500 text-white font-bold' : ''}`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {type !== 'date' && (
                            <div className={`flex flex-col items-center ${type === 'datetime' ? 'mt-4 pt-4 border-t border-white/10' : ''}`}>
                                <div className="flex items-center gap-2">
                                    {/* UPDATED: Inputs now use local state and update on blur */}
                                    <input 
                                        type="text"
                                        value={hourStr}
                                        onChange={(e) => handleLocalTimeChange('hours', e.target.value)}
                                        onBlur={() => handleTimeBlur('hours')}
                                        className="w-20 h-20 text-5xl text-center font-bold bg-black/20 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    />
                                    <span className="text-5xl font-bold text-slate-500">:</span>
                                    <input 
                                        type="text"
                                        value={minuteStr}
                                        onChange={(e) => handleLocalTimeChange('minutes', e.target.value)}
                                        onBlur={() => handleTimeBlur('minutes')}
                                        className="w-20 h-20 text-5xl text-center font-bold bg-black/20 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    />
                                </div>
                                <button type="button" onClick={() => setIsOpen(false)} className="mt-4 bg-cyan-500/80 text-white font-bold py-2 px-6 rounded-lg w-full">Done</button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DateTimePicker;