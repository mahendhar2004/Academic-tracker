import { useMemo } from 'react';
import { startOfDay } from 'date-fns';

const normalizeDate = (dateValue) => {
    if (!dateValue) return null;
    if (typeof dateValue.toDate === 'function') return dateValue.toDate();
    return new Date(dateValue);
};

export const useDashboardSummary = ({ schedule, deadlines, tasks, courses, expenditures }) => {
    return useMemo(() => {
        const now = new Date();
        const todayWeekday = now.toLocaleDateString('en-US', { weekday: 'long' });
        const startOfToday = startOfDay(now);

        // UPDATED: This now correctly gets today's date in YYYY-MM-DD format
        // without being affected by timezones.
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayDateString = `${year}-${month}-${day}`;

        const todaysSchedule = schedule?.filter(s => s.day === todayWeekday)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        const upcomingDeadlines = deadlines
            ?.filter(d => {
                const deadlineDate = normalizeDate(d.date);
                return deadlineDate && deadlineDate >= startOfToday;
            })
            .sort((a, b) => normalizeDate(a.date) - normalizeDate(b.date));

        const todaysTasks = tasks
            ?.filter(t => 
                !t.isCompleted && 
                (t.type === 'Short-term' || (t.type === 'Long-term' && t.dueDate === todayDateString))
            )
            .sort((a, b) => a.dueTime.localeCompare(b.dueTime));
        
        const attendanceWarnings = courses?.filter(c => c.total > 0 && (c.attended / c.total) * 100 < 75);

        const categoryMap = (expenditures || []).reduce((acc, item) => {
            const currentAmount = acc[item.category] || 0;
            acc[item.category] = currentAmount + (Number(item.amount) || 0);
            return acc;
        }, {});
        const expenditureCategoryData = Object.entries(categoryMap).map(([name, value]) => ({
            name, value
        })).sort((a, b) => a.value - b.value);
        
        return { todaysSchedule, upcomingDeadlines, todaysTasks, attendanceWarnings, expenditureCategoryData };

    }, [schedule, deadlines, tasks, courses, expenditures]);
};