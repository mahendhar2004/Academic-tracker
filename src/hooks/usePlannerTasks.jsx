import { useMemo } from 'react';

export const usePlannerTasks = (tasks, activeTab) => {
  return useMemo(() => {
    const currentTasks = tasks.filter(task => task.type === activeTab);
    
    const activeTasks = currentTasks
      .filter(task => !task.isCompleted)
      .sort((a, b) => a.dueTime.localeCompare(b.dueTime));
      
    const completedTasks = currentTasks.filter(task => task.isCompleted);

    return { activeTasks, completedTasks };
  }, [tasks, activeTab]);
};