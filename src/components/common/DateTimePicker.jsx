import {React, useState,useEffect,useRef} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const DateTimePicker = ({ value, onChange, type = 'datetime' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date(value || new Date()));
    const pickerRef = useRef(null);

    const selectedDate = new Date(value || Date.now());

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

    const handleTimeChange = (part, val) => {
        const newDate = new Date(selectedDate);
        const numVal = parseInt(val, 10);
        if (isNaN(numVal)) return;

        if (part === 'hours' && numVal >= 0 && numVal < 24) {
            newDate.setHours(numVal);
        } else if (part === 'minutes' && numVal >= 0 && numVal < 60) {
            newDate.setMinutes(numVal);
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
                    {type !== 'date' && <span>{String(selectedDate.getHours()).padStart(2, '0')}:{String(selectedDate.getMinutes()).padStart(2, '0')}</span>}
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
                                    <input 
                                        type="text"
                                        maxLength="2"
                                        value={String(selectedDate.getHours()).padStart(2, '0')}
                                        onChange={(e) => handleTimeChange('hours', e.target.value)}
                                        className="w-20 h-20 text-5xl text-center font-bold bg-black/20 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    />
                                    <span className="text-5xl font-bold text-slate-500">:</span>
                                    <input 
                                        type="text"
                                        maxLength="2"
                                        value={String(selectedDate.getMinutes()).padStart(2, '0')}
                                        onChange={(e) => handleTimeChange('minutes', e.target.value)}
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