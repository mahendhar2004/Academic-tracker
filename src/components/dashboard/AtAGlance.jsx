import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Bell, AlertTriangle, CheckCircle2 } from 'lucide-react';

const AtAGlance = ({ schedule = [], deadlines = [], tasks = [], courses = [] }) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    const getCourseName = (courseId) => {
        const course = courses.find(c => c.id === courseId);
        return course ? course.name : 'Unknown';
    };

    const todaysSchedule = schedule
        .filter(s => s.day === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const upcomingDeadlines = deadlines
        .filter(d => new Date(d.date) >= new Date(new Date().toDateString()))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    const todaysTasks = tasks
        .filter(t => !t.isCompleted && t.type === 'Short-term')
        .sort((a, b) => a.dueTime.localeCompare(b.dueTime));

    const attendanceWarnings = courses.filter(c => {
        if (!c.total || c.total === 0) return false;
        const percentage = (c.attended / c.total) * 100;
        return percentage < 75;
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Attendance Warnings (Prioritized) */}
            {attendanceWarnings.length > 0 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <div className="bg-gradient-to-br from-red-500/20 to-red-500/0 bg-red-900/10 saturate-150 backdrop-blur-2xl border border-red-500/50 p-6 rounded-xl shadow-lg h-full">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-red-400" /> Attendance Warnings</h3>
                        <div className="space-y-3">
                            {attendanceWarnings.map(course => (
                                <div key={course.id} className="bg-black/20 p-2 rounded-lg flex justify-between items-center text-sm">
                                    <span className="font-semibold truncate">{course.name}</span>
                                    <span className="text-red-400 font-bold">{((course.attended / course.total) * 100).toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
            
            {/* Today's Schedule */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <div className="bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-6 rounded-xl shadow-lg h-full">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Clock size={18} className="text-cyan-400" /> Today's Schedule</h3>
                    <div className="space-y-3">
                        {todaysSchedule.length > 0 ? todaysSchedule.map(item => (
                            <div key={item.id} className="bg-black/20 p-2 rounded-lg flex justify-between items-center text-sm">
                                <span className="font-semibold truncate">{getCourseName(item.courseId)}</span>
                                <span className="text-slate-400">{item.startTime}</span>
                            </div>
                        )) : <p className="text-slate-400 text-center text-sm py-2">No classes today.</p>}
                    </div>
                </div>
            </motion.div>

            {/* Upcoming Deadlines */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <div className="bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-6 rounded-xl shadow-lg h-full">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Bell size={18} className="text-cyan-400" /> Upcoming Deadlines</h3>
                    <div className="space-y-3">
                        {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(deadline => (
                             <div key={deadline.id} className="bg-black/20 p-2 rounded-lg flex justify-between items-center text-sm">
                                <span className="font-semibold truncate">{deadline.title}</span>
                                <span className="text-slate-400">{new Date(deadline.date).toLocaleDateString('en-GB')}</span>
                            </div>
                        )) : <p className="text-slate-400 text-center text-sm py-2">No upcoming deadlines.</p>}
                    </div>
                </div>
            </motion.div>

             {/* Today's Plans */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <div className="bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-6 rounded-xl shadow-lg h-full">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><CheckCircle2 size={18} className="text-cyan-400" /> Today's Plans</h3>
                    <div className="space-y-3">
                        {todaysTasks.length > 0 ? todaysTasks.map(task => (
                             <div key={task.id} className="bg-black/20 p-2 rounded-lg flex justify-between items-center text-sm">
                                <span className="font-semibold truncate">{task.title}</span>
                                <span className="text-slate-400">{task.dueTime}</span>
                            </div>
                        )) : <p className="text-slate-400 text-center text-sm py-2">No short-term plans for today.</p>}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AtAGlance;
