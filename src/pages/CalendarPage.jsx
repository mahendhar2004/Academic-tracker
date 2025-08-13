import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, Bell, Edit } from 'lucide-react';
import DeadlineCard from '../components/calendar/DeadlineCard';

const CalendarPage = ({ schedule, deadlines, onAddClass, onEditClass, onAddDeadline, onDeleteDeadline, onEditDeadline, courses }) => {
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
            <div className="space-y-12">
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
                                <div key={item.id} className="bg-black/20 p-3 rounded-lg flex justify-between items-center group">
                                    <p className="font-semibold text-white">{getCourseName(item.courseId)}</p>
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm text-slate-300">{item.startTime} - {item.endTime}</p>
                                        <button onClick={() => onEditClass(item)} className="text-slate-500 hover:text-cyan-400 transition-opacity opacity-0 group-hover:opacity-100"><Edit size={16} /></button>
                                    </div>
                                </div>
                            )) : <p className="text-slate-300 text-center py-4">No classes scheduled for today.</p>}
                        </div>
                    </div>
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
