import React, { useState, useEffect } from 'react';
import { Clock, Bell, AlertTriangle, CheckCircle2 } from 'lucide-react';
import InfoCard from './InfoCard';

const AtAGlance = ({ 
    todaysSchedule = [], 
    upcomingDeadlines = [], 
    todaysTasks = [], 
    attendanceWarnings = [],
    courses = [],
    cardClassName // UPDATED: Accept the new style as a prop
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

    return (
        // UPDATED: Use a standard div container instead of columns for better control
        <div className="space-y-8">
            {sections.filter(s => s.condition).map(section => (
                <InfoCard 
                    key={section.title}
                    icon={section.icon} 
                    title={section.title}
                    // Pass the new class string down to the InfoCard
                    className={cardClassName} 
                >
                    {section.content}
                </InfoCard>
            ))}
        </div>
    );
};

export default AtAGlance;