import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';
import { MapPin } from 'lucide-react';
import { getColorForCourse } from '../../constants';

// MOVED: Defined daysOfWeek outside the component to prevent re-creation on every render.
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimetableModal = ({ isOpen, onClose, schedule, courses }) => {
    const [now, setNow] = useState(new Date());
    const scrollContainerRef = useRef(null);
    const currentDayRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const timer = setInterval(() => setNow(new Date()), 60000);
            // Scroll to the current day on mobile when the modal opens
            setTimeout(() => {
                currentDayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 200);
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    const getCourseDetails = (courseId) => {
        const course = courses.find(c => c.id === courseId);
        const color = getColorForCourse(courseId);
        if (!course) return { name: 'Unknown', color };
        return { name: course.name, color };
    };

    const timeToMinutes = (timeStr) => {
        if (!timeStr || !timeStr.includes(':')) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const { timeSlots, minHour, maxHour, scheduleByDay } = useMemo(() => {
        if (schedule.length === 0) {
            const defaultSlots = Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
            return { timeSlots: defaultSlots, minHour: 8, maxHour: 18, scheduleByDay: {} };
        }
        let min = 24 * 60, max = 0;
        const byDay = {};
        
        daysOfWeek.forEach(day => {
            byDay[day] = schedule
                .filter(item => item.day === day)
                .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
        });

        schedule.forEach(item => {
            min = Math.min(min, timeToMinutes(item.startTime));
            max = Math.max(max, timeToMinutes(item.endTime));
        });

        const minH = Math.max(0, Math.floor(min / 60));
        const maxH = Math.min(23, Math.ceil(max / 60));
        const slots = [];
        for (let i = minH; i < maxH; i++) {
            slots.push(`${String(i).padStart(2, '0')}:00`);
        }
        return { timeSlots: slots, minHour: minH, maxHour: maxH, scheduleByDay: byDay };
    }, [schedule]); // UPDATED: Removed daysOfWeek from dependency array as it's now a constant

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const pixelsPerHour = 96;
    const pixelsPerMinute = pixelsPerHour / 60;
    const totalPixelHeight = (maxHour - minHour) * pixelsPerHour;
    const currentTimePosition = (currentMinutes - minHour * 60) * pixelsPerMinute;
    const currentDayName = now.toLocaleDateString('en-US', { weekday: 'long' });

    return (
        <GlassyModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Weekly Timetable" 
            customClasses="max-w-screen-xl w-full bg-gradient-to-br from-black to-slate-900 border border-slate-800"
        >
            <div ref={scrollContainerRef} className="relative h-[70vh] overflow-y-auto no-scrollbar">
                
                {/* --- Desktop View (Grid) --- */}
                <div className="hidden md:grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr] gap-x-1">
                    <div className="sticky top-0 z-20 bg-black/50 backdrop-blur-sm">
                        <div className="h-12"></div>
                        {timeSlots.map(time => (
                            <div key={time} style={{ height: `${pixelsPerHour}px` }} className="flex items-start justify-end pr-4">
                                <span className="font-medium text-sm text-slate-400 -mt-2">{time}</span>
                            </div>
                        ))}
                    </div>

                    {daysOfWeek.map((day, dayIndex) => (
                        <div key={day} className="relative border-l border-slate-800">
                            <div className="sticky top-0 z-20 bg-black/50 backdrop-blur-sm text-center h-12 flex items-center justify-center">
                                <h3 className={`font-bold ${day === currentDayName ? 'text-cyan-300' : 'text-slate-300'}`}>{day}</h3>
                            </div>
                            <div className="relative px-2" style={{ height: `${totalPixelHeight}px` }}>
                                {timeSlots.map((_, index) => (
                                    <div key={index} style={{ height: `${pixelsPerHour}px` }} className="border-t border-slate-800"></div>
                                ))}
                                {schedule.filter(s => s.day === day).map(item => {
                                    const startMinutes = timeToMinutes(item.startTime) - minHour * 60;
                                    const endMinutes = timeToMinutes(item.endTime) - minHour * 60;
                                    const top = startMinutes * pixelsPerMinute;
                                    const height = (endMinutes - startMinutes) * pixelsPerMinute;
                                    const details = getCourseDetails(item.courseId);
                                    
                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + (dayIndex * 0.05) }}
                                            className="absolute w-full p-2.5 rounded-lg text-white transition-all duration-300 bg-slate-900/70 shadow-lg shadow-black/30"
                                            style={{
                                                top: `${top}px`,
                                                height: `calc(${height}px - 4px)`,
                                                borderLeft: `4px solid ${details.color}`
                                            }}
                                        >
                                            <p className="font-semibold text-sm leading-tight text-white">{details.name}</p>
                                            <p className="text-xs text-slate-400 mt-1">{item.startTime} - {item.endTime}</p>
                                            {item.venue && (
                                                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
                                                    <MapPin size={12} />
                                                    <span className="truncate">{item.venue}</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {/* Current Time Indicator Line for Desktop */}
                    {currentTimePosition > 0 && currentTimePosition < totalPixelHeight && currentDayName && daysOfWeek.includes(currentDayName) && (
                         <div 
                            className="absolute z-10 w-full h-0.5 bg-red-500"
                            style={{ top: `${currentTimePosition + 48}px` }}
                         >
                            <div className="w-2 h-2 rounded-full bg-red-500 absolute -left-1 -top-[3px]"></div>
                         </div>
                    )}
                </div>

                {/* --- Mobile View (Flex Col) --- */}
                <div className="md:hidden flex flex-col gap-6 p-2">
                    {daysOfWeek.map(day => {
                        const isToday = day === currentDayName;
                        return (
                            <div key={day} ref={isToday ? currentDayRef : null} className={`p-4 rounded-lg ${isToday ? 'bg-slate-800/50 border border-cyan-500/50' : 'bg-slate-900/50'}`}>
                                <h3 className={`font-bold text-lg mb-4 ${isToday ? 'text-cyan-300' : 'text-white'}`}>{day}</h3>
                                <div className="space-y-3">
                                    {scheduleByDay[day] && scheduleByDay[day].length > 0 ? (
                                        scheduleByDay[day].map(item => {
                                            const details = getCourseDetails(item.courseId);
                                            const isCurrent = isToday && currentMinutes >= timeToMinutes(item.startTime) && currentMinutes < timeToMinutes(item.endTime);
                                            return (
                                                <div key={item.id} className={`flex gap-3 p-3 rounded-lg bg-black/30 ${isCurrent ? 'ring-2 ring-cyan-500' : ''}`} style={{ borderLeft: `4px solid ${details.color}` }}>
                                                    <div className="w-20 flex-shrink-0 text-sm text-slate-300">
                                                        <p>{item.startTime}</p>
                                                        <p>{item.endTime}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">{details.name}</p>
                                                        {item.venue && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5"><MapPin size={12}/>{item.venue}</p>}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-slate-500">No classes scheduled.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </GlassyModal>
    );
};

export default TimetableModal;
