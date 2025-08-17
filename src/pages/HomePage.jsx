import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, BarChart2, Calendar, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import AtAGlance from '../components/dashboard/AtAGlance';
import MiniExpenditureBarChart from '../components/dashboard/MiniExpenditureBarChart';
import { quotes } from '../data/quotes';
import { useDashboardSummary } from '../hooks/useDashboardSummary'; // Import the hook

// --- Child Components can remain in this file as they are specific to HomePage ---

const DailyFocus = ({ schedule, deadlines, tasks, cardStyles }) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaysScheduleCount = schedule?.filter(s => s.day === today).length || 0;
    const upcomingDeadlinesCount = deadlines?.filter(d => (d.date?.toDate ? d.date.toDate() : new Date(d.date)) >= new Date()).length || 0;
    const activeTasksCount = tasks?.filter(t => !t.isCompleted).length || 0;

    const focusItems = [
        { count: todaysScheduleCount, label: 'Classes Today', icon: Calendar },
        { count: upcomingDeadlinesCount, label: 'Deadlines', icon: AlertTriangle },
        { count: activeTasksCount, label: 'Active Tasks', icon: CheckCircle },
    ];

    return (
        <div className={cardStyles}>
            <div className="absolute -top-1 -left-1 w-32 h-32 bg-white/10 rounded-full blur-[80px] opacity-50"></div>
            <h3 className="font-bold text-white text-lg mb-4">Today's Focus</h3>
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
    schedule, deadlines, tasks, courses, 
    performanceData, isCpiVisible, onToggleCpiVisibility, expenditures = []
}) => {
    
    const cardStyles = "relative overflow-hidden bg-black/50 bg-gradient-to-b from-black/10 via-transparent to-black/50 backdrop-blur-2xl border border-gray-800 p-6 rounded-2xl shadow-2xl";
    
    // The complex useMemo is now replaced by our clean custom hook
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
            <div className="flex justify-end mb-8">
                <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg border border-white/20">
                    <span className="font-semibold text-slate-300 text-sm">CPI:</span>
                    <span className="font-bold text-lg text-cyan-300 w-12 text-center">
                        {isCpiVisible ? (performanceData?.cpi || '0.0') : '–.–'}
                    </span>
                    <button onClick={onToggleCpiVisibility} className="text-slate-400 hover:text-white">
                        {isCpiVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pb-20">
                <div className="lg:col-span-3 space-y-8">
                    <AtAGlance 
                        todaysSchedule={todaysSchedule} 
                        upcomingDeadlines={upcomingDeadlines} 
                        todaysTasks={todaysTasks} 
                        attendanceWarnings={attendanceWarnings}
                        courses={courses}
                        cardClassName={cardStyles}
                    />
                </div>
                
                <div className="lg:col-span-2 space-y-8">
                    <DailyFocus 
                        schedule={schedule} 
                        deadlines={deadlines} 
                        tasks={tasks}
                        cardStyles={cardStyles}
                    />
                    <div className={cardStyles}>
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