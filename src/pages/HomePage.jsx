import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Calendar, CheckCircle2, AlertTriangle, Sparkles, Wind, Bell, Clock } from 'lucide-react';
import MiniExpenditureBarChart from '../components/dashboard/MiniExpenditureBarChart';
import InfoCard from '../components/dashboard/InfoCard';
import { quotes } from '../data/quotes';
import { startOfDay } from 'date-fns';
import { useDashboardSummary } from '../hooks/useDashboardSummary';

// --- Child Components defined within HomePage for clarity ---

const AtAGlance = ({ 
    todaysSchedule = [], 
    upcomingDeadlines = [], 
    todaysTasks = [], 
    attendanceWarnings = [],
    courses = [],
    cardClassName 
}) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const getCourseName = (courseId) => {
        const course = courses?.find(c => c.id === courseId);
        return course ? course.name : 'Unknown';
    };
    
    const oneDayInMs = 24 * 60 * 60 * 1000;

    const normalizeDate = (dateValue) => {
        if (!dateValue) return null;
        if (typeof dateValue.toDate === 'function') return dateValue.toDate();
        return new Date(dateValue);
    };

    const sections = [
        {
            condition: attendanceWarnings.length > 0,
            icon: AlertTriangle,
            title: "Attendance Warnings",
            content: attendanceWarnings.map(course => (
                <div key={course.id} className="bg-red-900/30 p-2 rounded-lg flex justify-between items-center text-sm">
                    <span className="font-semibold truncate">{course.name}</span>
                    <span className="text-red-400 font-bold">{((course.attended / course.total) * 100).toFixed(1)}%</span>
                </div>
            ))
        },
        {
            condition: todaysSchedule.length > 0,
            icon: Clock,
            title: "Today's Schedule",
            content: todaysSchedule.map(item => {
                const todayStr = now.toDateString();
                const startTime = new Date(`${todayStr} ${item.startTime}`);
                const endTime = new Date(`${todayStr} ${item.endTime}`);
                const isCurrent = now >= startTime && now <= endTime;
                return (
                    <div key={item.id} className="bg-black/20 p-2 rounded-lg flex justify-between items-center text-sm transition-all duration-300">
                        <span className={`truncate ${isCurrent ? 'text-yellow-400 font-bold' : 'font-semibold'}`}>{getCourseName(item.courseId)}</span>
                        <span className={isCurrent ? 'font-bold text-yellow-400' : 'text-slate-400'}>{item.startTime}</span>
                    </div>
                );
            })
        },
        {
            condition: upcomingDeadlines.length > 0,
            icon: Bell,
            title: "Upcoming Deadlines",
            content: upcomingDeadlines.map(deadline => {
                const deadlineDate = normalizeDate(deadline.date);
                const isUrgent = (deadlineDate.getTime() - now.getTime()) < oneDayInMs;
                return (
                       <div key={deadline.id} className="bg-black/20 p-2 rounded-lg flex justify-between items-center text-sm">
                           <span className="font-semibold truncate">{deadline.title}</span>
                           <span className={isUrgent ? 'text-red-400 font-bold' : 'text-slate-400'}>{deadlineDate.toLocaleDateString('en-GB')}</span>
                       </div>
                );
            })
        },
        {
            condition: todaysTasks.length > 0,
            icon: CheckCircle2,
            title: "Today's Plans",
            content: todaysTasks.map(task => (
                   <div key={task.id} className="bg-black/20 p-2 rounded-lg flex justify-between items-center text-sm">
                       <span className="font-semibold truncate">{task.title}</span>
                       <span className="text-slate-400">{task.dueTime}</span>
                   </div>
            ))
        }
    ];

    const hasContent = sections.some(s => s.condition);

    return (
        <>
            {hasContent ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sections.filter(s => s.condition).map(section => (
                        <InfoCard 
                            key={section.title}
                            icon={section.icon} 
                            title={section.title}
                            className={cardClassName} 
                        >
                            {section.content}
                        </InfoCard>
                    ))}
                </div>
            ) : (
                <div className={cardClassName}>
                       <div className="text-center py-10">
                           <Wind size={48} className="mx-auto text-slate-500 mb-4" />
                           <h3 className="font-bold text-white text-lg">All Clear for Now!</h3>
                           <p className="text-slate-400 mt-1">You have no immediate tasks or warnings. <br/> A perfect chance to plan ahead or take a break.</p>
                       </div>
                </div>
            )}
        </>
    );
};

const DailyFocus = ({ schedule, deadlines, tasks, cardStyles }) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaysScheduleCount = schedule?.filter(s => s.day === today).length || 0;
    const upcomingDeadlinesCount = deadlines?.filter(d => (d.date?.toDate ? d.date.toDate() : new Date(d.date)) >= startOfDay(new Date())).length || 0;
    const activeTasksCount = tasks?.filter(t => !t.isCompleted).length || 0;

    const focusItems = [
        { count: todaysScheduleCount, label: 'Classes Today', icon: Calendar },
        { count: upcomingDeadlinesCount, label: 'Deadlines', icon: AlertTriangle },
        { count: activeTasksCount, label: 'Active Tasks', icon: CheckCircle2 },
    ];

    return (
        <div className={cardStyles}>
            <div className="absolute -top-1 -left-1 w-32 h-32 bg-white/10 rounded-full blur-[80px] opacity-50"></div>
            <h3 className="font-bold text-white text-lg mb-4">Today's Focus</h3>
            {/* UPDATED: Changed grid-cols-1 to grid-cols-3 and removed the md breakpoint */}
            <div className="grid grid-cols-3 gap-4 text-center">
                {focusItems.map(item => (
                    <div key={item.label} className="bg-black/20 p-4 rounded-lg border border-white/10">
                        <item.icon className="mx-auto text-cyan-400 mb-2" size={24} />
                        <p className="text-2xl font-bold text-white">{item.count}</p>
                        <p className="text-xs text-slate-400">{item.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MotivationalQuote = () => {
    const quote = useMemo(() => {
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        return quotes[dayOfYear % quotes.length];
    }, []);
    
    return (
        <div className="flex items-center justify-center gap-3">
            <Sparkles className="text-slate-500 flex-shrink-0" size={18} />
            <p className="text-slate-500 italic text-sm text-center">"{quote}"</p>
        </div>
    );
};


// --- Main HomePage Component ---
const HomePage = ({ 
    schedule, deadlines, tasks, courses, expenditures = []
}) => {
    
    const glassyCardStyles = "relative overflow-hidden bg-black/50 bg-gradient-to-b from-black/10 via-transparent to-black/50 backdrop-blur-2xl border border-gray-800 p-6 rounded-2xl shadow-2xl";
    
    const neumorphicCardStyles = "relative bg-[#181818] p-6 rounded-2xl shadow-[5px_5px_12px_rgba(0,0,0,0.5),-5px_-5px_12px_rgba(255,255,255,0.05)]";

    const {
        todaysSchedule,
        upcomingDeadlines,
        todaysTasks,
        attendanceWarnings,
        expenditureCategoryData
    } = useDashboardSummary({ schedule, deadlines, tasks, courses, expenditures });

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.4 }}
            className="relative"
        >
            <div className="grid grid-cols-1 lg:grid-cols-5 lg:items-start gap-8 pb-20 pt-8">
                <div className="lg:col-span-3">
                    <AtAGlance 
                        todaysSchedule={todaysSchedule} 
                        upcomingDeadlines={upcomingDeadlines} 
                        todaysTasks={todaysTasks} 
                        attendanceWarnings={attendanceWarnings}
                        courses={courses}
                        cardClassName={neumorphicCardStyles}
                    />
                </div>
                
                <div className="lg:col-span-2 space-y-8">
                    <DailyFocus 
                        schedule={schedule} 
                        deadlines={deadlines} 
                        tasks={tasks}
                        cardStyles={glassyCardStyles}
                    />
                    <div className={glassyCardStyles}>
                        <div className="absolute -top-1 -left-1 w-32 h-32 bg-white/10 rounded-full blur-[80px] opacity-50"></div>
                        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                            <BarChart2 size={20} className="text-cyan-400"/>
                            Monthly Spending
                        </h3>
                        <div className="min-h-[12rem] flex items-center justify-center">
                            {expenditureCategoryData.length > 0 ? (
                                <MiniExpenditureBarChart data={expenditureCategoryData} />
                            ) : (
                                <p className="text-slate-400 text-center">No spending data for this month yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-4 pointer-events-none">
                <MotivationalQuote />
            </div>
        </motion.div>
    );
};

export default HomePage;
