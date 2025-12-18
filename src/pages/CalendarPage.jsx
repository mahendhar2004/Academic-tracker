import { useOutletContext } from 'react-router-dom';
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Bell, ChevronDown } from 'lucide-react';
import CalendarComponent from '../components/calendar/Calendar';
import EventCard from '../components/calendar/EventCard';
import { isSameDay, startOfDay, addDays } from 'date-fns';
import { getColorForCourse } from '../constants'; // Import the new function


const CalendarPage = () => {
    const {
        schedule, deadlines, allCourses: courses,
        handleAddClassClick: onAddClass,
        handleEditClassClick: onEditClass,
        handleDeleteClass: onDeleteClass,
        handleAddDeadlineClick: onAddDeadline,
        handleDeleteDeadline: onDeleteDeadline,
        handleEditDeadlineClick: onEditDeadline
    } = useOutletContext();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isFutureWeekVisible, setIsFutureWeekVisible] = useState(false);

    const dayRefs = useRef({});
    const targetDayRef = useRef(null);

    const getCourseDetails = useCallback((courseId) => {
        const course = courses.find(c => c.id === courseId);
        // The old, fragile logic is replaced by the new robust function call
        const color = getColorForCourse(courseId);
        return course ? { name: course.name, color } : { name: 'Unknown', color };
    }, [courses]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const { todayAgenda, futureAgenda, eventsByDate } = useMemo(() => {
        const agenda = [];
        const today = startOfDay(new Date());

        for (let i = 0; i < 7; i++) {
            const date = addDays(today, i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

            const classesToday = schedule.filter(s => s.day === dayName).map(s => ({ ...s, type: 'class', date, courseDetails: getCourseDetails(s.courseId) }));
            const deadlinesToday = deadlines.filter(d => {
                const deadlineDate = d.date?.toDate ? d.date.toDate() : new Date(d.date);
                return isSameDay(deadlineDate, date);
            }).map(d => ({ ...d, type: 'deadline', startTime: d.time, date, courseDetails: getCourseDetails(d.courseId) }));

            const events = [...classesToday, ...deadlinesToday].sort((a, b) => a.startTime.localeCompare(b.startTime));
            agenda.push({ date, dayName, events });
        }

        const eventsMap = agenda.reduce((acc, day) => {
            if (day.events.length > 0) {
                const key = `${day.date.getFullYear()}-${day.date.getMonth() + 1}-${day.date.getDate()}`;
                acc[key] = true;
            }
            return acc;
        }, {});

        return {
            todayAgenda: agenda[0],
            futureAgenda: agenda.slice(1),
            eventsByDate: eventsMap
        };
    }, [schedule, deadlines, getCourseDetails]);

    const handleDateClick = (day) => {
        const dateKey = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
        const dayElement = dayRefs.current[dateKey];

        if (dayElement) {
            if (!isFutureWeekVisible && !isSameDay(day, new Date())) {
                targetDayRef.current = dayElement;
                setIsFutureWeekVisible(true);
            } else {
                dayElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    const onFutureWeekAnimationComplete = () => {
        if (targetDayRef.current) {
            targetDayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            targetDayRef.current = null;
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-1">{getGreeting()}</h2>
                    <p className="text-slate-400">Here's what's on your agenda.</p>
                </div>
                <div className="flex gap-4">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={onAddDeadline} className="flex-shrink-0 flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/25 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-white/25">
                        <Bell size={16} /> <span className="hidden sm:inline">Add Deadline</span>
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={onAddClass} className="flex-shrink-0 flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/25 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-white/25">
                        <Clock size={16} /> <span className="hidden sm:inline">Add Class</span>
                    </motion.button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <div className="space-y-8">
                        {/* Today's Section */}
                        <div ref={el => {
                            const dateKey = `${todayAgenda.date.getFullYear()}-${todayAgenda.date.getMonth() + 1}-${todayAgenda.date.getDate()}`;
                            dayRefs.current[dateKey] = el;
                        }}>
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                                <div className="flex items-baseline gap-4">
                                    <h3 className="text-2xl font-bold text-cyan-300">Today</h3>
                                    <p className="text-sm text-slate-400">{todayAgenda.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {todayAgenda.events.length > 0 ? todayAgenda.events.map(event => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onEdit={() => event.type === 'class' ? onEditClass(event) : onEditDeadline(event)}
                                        onDelete={() => event.type === 'class' ? onDeleteClass(event.id) : onDeleteDeadline(event.id)}
                                    />
                                )) : <p className="text-slate-500 pl-4">No events scheduled for today.</p>}
                            </div>
                        </div>

                        {/* Future Week Toggle */}
                        <div className="text-center pt-4">
                            <motion.button
                                onClick={() => setIsFutureWeekVisible(!isFutureWeekVisible)}
                                className="flex items-center gap-2 mx-auto text-slate-400 hover:text-white transition-colors"
                            >
                                <span>{isFutureWeekVisible ? 'Hide Future Days' : 'Show Full Week'}</span>
                                <motion.div animate={{ rotate: isFutureWeekVisible ? 180 : 0 }}>
                                    <ChevronDown size={20} />
                                </motion.div>
                            </motion.button>
                        </div>

                        {/* Future Week Section */}
                        <AnimatePresence>
                            {isFutureWeekVisible && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                    onAnimationComplete={onFutureWeekAnimationComplete}
                                >
                                    <div className="space-y-8 pt-8">
                                        {futureAgenda.map(({ date, dayName, events }) => (
                                            <div key={date.toISOString()} ref={el => {
                                                const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                                                dayRefs.current[dateKey] = el;
                                            }}>
                                                <div className="flex items-baseline gap-4 mb-4">
                                                    <h3 className="text-2xl font-bold text-white">{dayName}</h3>
                                                    <p className="text-sm text-slate-400">{date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                                </div>
                                                <div className="space-y-4">
                                                    {events.length > 0 ? events.map(event => (
                                                        <EventCard
                                                            key={event.id}
                                                            event={event}
                                                            onEdit={() => event.type === 'class' ? onEditClass(event) : onEditDeadline(event)}
                                                            onDelete={() => event.type === 'class' ? onDeleteClass(event.id) : onDeleteDeadline(event.id)}
                                                        />
                                                    )) : <p className="text-slate-500 pl-4">No events scheduled.</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="lg:col-span-1 sticky top-28">
                    <CalendarComponent
                        currentDate={selectedDate}
                        onDateClick={handleDateClick}
                        eventsByDate={eventsByDate}
                        onPrevMonth={() => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                        onNextMonth={() => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                        selectedDate={new Date()}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default CalendarPage;