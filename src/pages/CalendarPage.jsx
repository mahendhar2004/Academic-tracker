import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Clock, Bell, ChevronDown } from 'lucide-react';
import DeadlineCard from '../components/calendar/DeadlineCard';

const CalendarPage = ({ schedule, deadlines, onAddClass, onAddDeadline, onDeleteDeadline, onEditDeadline, courses }) => {
    const [isTimetableVisible, setIsTimetableVisible] = useState(false);
    
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    const getCourseName = (courseId) => {
        const course = courses.find(c => c.id === courseId);
        return course ? course.name : 'Unknown Course';
    };

    const todaysSchedule = schedule
        .filter(s => s.day === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const upcomingDeadlines = deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <div className="space-y-8">
                {/* Today's Schedule Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Clock className="text-cyan-400" />Today's Schedule</h2>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={onAddClass} className="flex-shrink-0 flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/25 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-white/25">
                            <Plus size={18} /> Add Class
                        </motion.button>
                    </div>
                    <div className="bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-6 rounded-xl shadow-lg">
                        <div className="space-y-2">
                            {todaysSchedule.length > 0 ? todaysSchedule.map(item => (
                                <div key={item.id} className="bg-black/20 p-3 rounded-lg flex justify-between items-center">
                                    <p className="font-semibold text-white">{getCourseName(item.courseId)}</p>
                                    <p className="text-sm text-slate-300">{item.startTime} - {item.endTime}</p>
                                </div>
                            )) : <p className="text-slate-300 text-center py-4">No classes scheduled for today.</p>}
                        </div>
                    </div>
                </div>

                {/* Full Timetable Section */}
                <div>
                     <div className="flex justify-between items-center mb-4 cursor-pointer hover:bg-black/20 p-2 rounded-lg transition-colors" onClick={() => setIsTimetableVisible(!isTimetableVisible)}>
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">Full Timetable</h2>
                        <ChevronDown size={24} className={`text-slate-300 transition-transform duration-300 ${isTimetableVisible ? 'rotate-180' : ''}`} />
                    </div>
                    <AnimatePresence>
                    {isTimetableVisible && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
                            <div className="bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-6 rounded-xl shadow-lg">
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {daysOfWeek.map(day => (
                                        <div key={day}>
                                            <h3 className="font-bold text-lg mb-2 text-center">{day}</h3>
                                            <div className="space-y-2">
                                                {schedule.filter(s => s.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime)).map(item => (
                                                    <div key={item.id} className="bg-black/20 p-2 rounded-lg text-center">
                                                        <p className="font-semibold text-sm truncate">{getCourseName(item.courseId)}</p>
                                                        <p className="text-xs text-slate-400">{item.startTime} - {item.endTime}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>

                {/* Deadlines Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Bell className="text-cyan-400" />Upcoming Deadlines</h2>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={onAddDeadline} className="flex-shrink-0 flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/25 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-white/25">
                            <Plus size={18} /> Add Deadline
                        </motion.button>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(deadline => (
                            <DeadlineCard key={deadline.id} deadline={deadline} getCourseName={getCourseName} onDelete={onDeleteDeadline} onEdit={onEditDeadline} />
                        )) : <p className="text-slate-300 text-center py-4 md:col-span-2">No upcoming deadlines.</p>}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CalendarPage;
