import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';
import { MapPin } from 'lucide-react';
import { getColorForCourse } from '../../constants';

const TimetableModal = ({ isOpen, onClose, schedule, courses }) => {
    const [now, setNow] = useState(new Date());
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const timer = setInterval(() => setNow(new Date()), 60000);
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

    const { timeSlots, minHour, maxHour } = useMemo(() => {
        if (schedule.length === 0) {
            return { timeSlots: Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`), minHour: 8, maxHour: 18 };
        }
        let min = 24 * 60, max = 0;
        schedule.forEach(item => {
            min = Math.min(min, timeToMinutes(item.startTime));
            max = Math.max(max, timeToMinutes(item.endTime));
        });

        const minH = Math.max(0, Math.floor(min / 60) -1);
        const maxH = Math.min(23, Math.ceil(max / 60));
        const slots = [];
        for (let i = minH; i < maxH; i++) {
            slots.push(`${String(i).padStart(2, '0')}:00`);
        }
        return { timeSlots: slots, minHour: minH, maxHour: maxH };
    }, [schedule]);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const pixelsPerHour = 96;
    const pixelsPerMinute = pixelsPerHour / 60;
    const totalPixelHeight = (maxHour - minHour) * pixelsPerHour;
    const currentTimePosition = (currentMinutes - minHour * 60) * pixelsPerMinute;

    useEffect(() => {
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        const isAnyClassNow = schedule.some(item => 
            item.day === currentDay &&
            currentMinutes >= timeToMinutes(item.startTime) &&
            currentMinutes < timeToMinutes(item.endTime)
        );

        if (isOpen && scrollContainerRef.current && currentTimePosition > 0 && isAnyClassNow) {
            setTimeout(() => {
                const scrollToPosition = currentTimePosition - (pixelsPerHour / 2);
                scrollContainerRef.current.scrollTo({
                    top: scrollToPosition,
                    behavior: 'smooth'
                });
            }, 200);
        }
    }, [isOpen, currentTimePosition, schedule, now, currentMinutes, pixelsPerHour]);


    return (
        <GlassyModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Weekly Timetable" 
            customClasses="max-w-screen-xl w-full bg-black/95 backdrop-blur-xl border-white/10"
        >
            <div ref={scrollContainerRef} className="relative h-[70vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr] gap-x-1">
                    <div className="sticky top-0 z-20 bg-black">
                        <div className="h-12"></div>
                        {timeSlots.map(time => (
                            <div key={time} style={{ height: `${pixelsPerHour}px` }} className="flex items-start justify-end pr-4">
                                <span className="text-xs text-slate-400 -mt-2">{time}</span>
                            </div>
                        ))}
                    </div>

                    {daysOfWeek.map((day, dayIndex) => (
                        <div key={day} className="relative border-l border-white/10">
                            <div className="sticky top-0 z-20 bg-black text-center h-12 flex items-center justify-center">
                                <h3 className="font-bold text-cyan-300">{day}</h3>
                            </div>
                            <div className="relative px-2" style={{ height: `${totalPixelHeight}px` }}>
                                {timeSlots.map((_, index) => (
                                    <div key={index} style={{ height: `${pixelsPerHour}px` }} className="border-t border-white/5"></div>
                                ))}
                                {schedule.filter(s => s.day === day).map(item => {
                                    const startMinutes = timeToMinutes(item.startTime) - minHour * 60;
                                    const endMinutes = timeToMinutes(item.endTime) - minHour * 60;
                                    const top = startMinutes * pixelsPerMinute;
                                    const height = (endMinutes - startMinutes) * pixelsPerMinute;
                                    const details = getCourseDetails(item.courseId);
                                    
                                    const isCurrent = now.toLocaleDateString('en-US', { weekday: 'long' }) === day &&
                                                        currentMinutes >= timeToMinutes(item.startTime) &&
                                                        currentMinutes < timeToMinutes(item.endTime);

                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + (dayIndex * 0.05) }}
                                            className={`absolute w-full p-2.5 rounded-lg text-white transition-all duration-300 bg-black/60 backdrop-blur-md ${isCurrent ? 'shadow-2xl shadow-cyan-500/50' : ''}`}
                                            style={{
                                                top: `${top}px`,
                                                height: `calc(${height}px - 4px)`,
                                                borderLeft: `4px solid ${details.color}`
                                            }}
                                        >
                                            <p className="font-bold text-sm leading-tight">{details.name}</p>
                                            <p className="text-xs opacity-80 mt-1">{item.startTime} - {item.endTime}</p>
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
                    
                    {currentTimePosition >= 0 && currentTimePosition <= totalPixelHeight && now.getDay() > 0 && now.getDay() < 6 && (
                        <div 
                            className="absolute h-0.5 bg-red-500 w-full z-10"
                            style={{ top: `calc(3rem + ${currentTimePosition}px)`}}
                        >
                            <div className="absolute -left-1.5 -top-1 w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                    )}
                </div>
            </div>
        </GlassyModal>
    );
};

export default TimetableModal;