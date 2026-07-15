import { useMemo } from 'react';

export const usePlannerTasks = (tasks, activeTab) => {
  return useMemo(() => {
    const currentTasks = tasks.filter(task => task.type === activeTab);
    
    const activeTasks = currentTasks
      .filter(task => !task.isCompleted)
      .sort((a, b) => {
        // Long-term tasks carry a dueDate ("YYYY-MM-DD", lexicographically sortable) --
        // sort by that first so multi-day plans order correctly, then by time-of-day.
        // Short-term tasks have no dueDate, so this falls through to dueTime as before.
        if (a.dueDate !== b.dueDate) {
          return (a.dueDate || '').localeCompare(b.dueDate || '');
        }
        return (a.dueTime || '').localeCompare(b.dueTime || '');
      });
      
    const completedTasks = currentTasks.filter(task => task.isCompleted);

    return { activeTasks, completedTasks };
  }, [tasks, activeTab]);
};