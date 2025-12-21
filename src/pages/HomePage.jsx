import { useOutletContext } from 'react-router-dom';
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
                <div key={course.id} className="bg-red-50 text-red-900 border border-red-200 dark:bg-red-900/30 dark:text-white dark:border-transparent p-2 rounded-lg flex justify-between items-center text-sm">
                    <span className="font-semibold truncate">{course.name}</span>
                    <span className="text-red-500 dark:text-red-400 font-bold">{((course.attended / course.total) * 100).toFixed(1)}%</span>
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
                    <div key={item.id} className="bg-slate-50 border border-slate-100 dark:bg-white/5 dark:border-transparent p-2 rounded-lg flex justify-between items-center text-sm transition-all duration-300">
                        <span className={`truncate ${isCurrent ? 'text-brand-primary dark:text-yellow-400 font-bold' : 'font-semibold text-slate-700 dark:text-white'}`}>{getCourseName(item.courseId)}</span>
                        <span className={isCurrent ? 'font-bold text-brand-primary dark:text-yellow-400' : 'text-slate-500 dark:text-slate-400'}>{item.startTime}</span>
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
                    <div key={deadline.id} className="bg-slate-50 border border-slate-100 dark:bg-white/5 dark:border-transparent p-2 rounded-lg flex justify-between items-center text-sm">
                        <span className="font-semibold truncate text-slate-700 dark:text-white">{deadline.title}</span>
                        <span className={isUrgent ? 'text-red-500 dark:text-red-400 font-bold' : 'text-slate-500 dark:text-slate-400'}>{deadlineDate.toLocaleDateString('en-GB')}</span>
                    </div>
                );
            })
        },
        {
            condition: todaysTasks.length > 0,
            icon: CheckCircle2,
            title: "Today's Plans",
            content: todaysTasks.map(task => (
                <div key={task.id} className="bg-slate-50 border border-slate-100 dark:bg-white/5 dark:border-transparent p-2 rounded-lg flex justify-between items-center text-sm">
                    <span className="font-semibold truncate text-slate-700 dark:text-white">{task.title}</span>
                    <span className="text-slate-500 dark:text-slate-400">{task.dueTime}</span>
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
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">All Clear for Now!</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">You have no immediate tasks or warnings. <br /> A perfect chance to plan ahead or take a break.</p>
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
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Today's Focus</h3>
            {/* UPDATED: Changed grid-cols-1 to grid-cols-3 and removed the md breakpoint */}
            <div className="grid grid-cols-3 gap-4 text-center">
                {focusItems.map(item => (
                    <div key={item.label} className="bg-white dark:bg-white/5 p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
                        <item.icon className="mx-auto text-brand-secondary dark:text-cyan-400 mb-2" size={24} />
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.count}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ... (imports remain the same)

const HeroSection = ({ profileData, todaysSchedule, tasks }) => {
    const hours = new Date().getHours();
    const greeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening';
    const name = profileData?.name?.split(' ')[0] || 'Scholar';

    // Logic for "Coming Up"
    const now = new Date();
    const currentClass = todaysSchedule.find(item => {
        const start = new Date(now.toDateString() + ' ' + item.startTime);
        const end = new Date(now.toDateString() + ' ' + item.endTime);
        return now >= start && now <= end;
    });

    const nextClass = todaysSchedule.find(item => {
        const start = new Date(now.toDateString() + ' ' + item.startTime);
        return start > now;
    });

    let statusMessage = "You're all clear for the rest of the day!";
    let StatusIcon = Sparkles;
    let statusColor = "text-green-400";

    if (currentClass) {
        statusMessage = `You should be in ${currentClass.courseId} right now.`;
        StatusIcon = Clock;
        statusColor = "text-yellow-400";
    } else if (nextClass) {
        statusMessage = `Next up: ${nextClass.courseId} at ${nextClass.startTime}.`;
        StatusIcon = Calendar;
        statusColor = "text-cyan-400";
    } else if (tasks.length > 0) {
        const pending = tasks.filter(t => !t.isCompleted).length;
        if (pending > 0) {
            statusMessage = `You have ${pending} tasks pending. Time to focus?`;
            StatusIcon = CheckCircle2;
            statusColor = "text-orange-400";
        }
    }

    return (
        <div className="mb-10 relative overflow-hidden rounded-3xl p-8 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 dark:bg-gradient-to-r dark:from-cyan-500/10 dark:via-purple-500/10 dark:to-transparent shadow-xl dark:shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-primary dark:from-cyan-400 dark:to-purple-400">{name}</span>
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-300 flex items-center gap-2">
                        <StatusIcon className={statusColor} size={24} />
                        {statusMessage}
                    </p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 border border-slate-100 dark:border-white/10 shadow-sm dark:shadow-none">
                    <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mb-1">Current Focus</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{currentClass ? 'In Class' : nextClass ? 'Up Next: Class' : 'Self Study'}</p>
                </div>
            </div>
            {/* Abstract Background Shapes - Only visible in dark mode or subtle in light */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-secondary/10 dark:bg-cyan-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-primary/10 dark:bg-purple-500/20 rounded-full blur-[100px]"></div>
        </div>
    );
};

// ... (Rest of components: AtAGlance, DailyFocus, MotivationalQuote) -> I will assume replace_file keeps them if I target correctly or I need to include them. 
// Use StartLine/EndLine carefully.

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


const HomePage = () => {
    const {
        schedule, deadlines, tasks, allCourses: courses, expenditures = []
    } = useOutletContext();

    const glassyCardStyles = "relative overflow-hidden bg-white/60 dark:bg-black/50 dark:bg-gradient-to-b dark:from-black/10 dark:via-transparent dark:to-black/50 backdrop-blur-2xl border border-slate-200 dark:border-gray-800 p-6 rounded-2xl shadow-xl dark:shadow-2xl";

    const neumorphicCardStyles = "relative bg-white dark:bg-[#181818] p-6 rounded-2xl shadow-lg dark:shadow-[5px_5px_12px_rgba(0,0,0,0.5),-5px_-5px_12px_rgba(255,255,255,0.05)] border border-slate-100 dark:border-transparent";

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
            <HeroSection profileData={useOutletContext().profileData} todaysSchedule={todaysSchedule} tasks={tasks} />

            <div className="grid grid-cols-1 lg:grid-cols-5 lg:items-start gap-8 pb-20">
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
                        <div className="absolute -top-1 -left-1 w-32 h-32 bg-slate-200/50 dark:bg-white/10 rounded-full blur-[80px] opacity-50"></div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                            <BarChart2 size={20} className="text-brand-secondary dark:text-cyan-400" />
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
