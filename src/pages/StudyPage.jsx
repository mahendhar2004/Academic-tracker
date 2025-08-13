import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, ChevronDown } from 'lucide-react';
import TaskCard from '../components/study/TaskCard';

const StudyPage = ({ tasks, onAddTask, onEditTask, onDeleteTask, onToggleComplete }) => {
    const [isCompletedVisible, setIsCompletedVisible] = useState(true);

    const { shortTermTasks, longTermTasks, completedTasks } = useMemo(() => {
        const now = new Date();
        const twentyFourHoursAgo = now.getTime() - (24 * 60 * 60 * 1000);

        const active = tasks.filter(task => !task.isCompleted);
        
        const shortTerm = active
            .filter(task => task.type === 'Short-term')
            .sort((a, b) => a.dueTime.localeCompare(b.dueTime));

        const longTerm = active
            .filter(task => task.type === 'Long-term')
            .sort((a, b) => {
                const dateA = new Date(`${a.dueDate || '1970-01-01'}T${a.dueTime}`);
                const dateB = new Date(`${b.dueDate || '1970-01-01'}T${b.dueTime}`);
                return dateA - dateB;
            });
        
        const completed = tasks.filter(task => {
            if (!task.isCompleted) return false;
            return task.completedAt?.toMillis() > twentyFourHoursAgo;
        });

        return { shortTermTasks: shortTerm, longTermTasks: longTerm, completedTasks: completed };
    }, [tasks]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><BookOpen className="text-cyan-400" />Study Planner</h2>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onAddTask} className="flex-shrink-0 flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/25 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-white/25">
                    <Plus size={18} /> Add Plan
                </motion.button>
            </div>
            
            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Short-term Plans</h3>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {shortTermTasks.length > 0 ? shortTermTasks.map(task => (
                                <TaskCard key={task.id} task={task} onToggleComplete={onToggleComplete} onEdit={onEditTask} onDelete={onDeleteTask} />
                            )) : <p className="text-slate-400 text-center py-8">No short-term plans for today.</p>}
                        </AnimatePresence>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Long-term Plans</h3>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {longTermTasks.length > 0 ? longTermTasks.map(task => (
                                <TaskCard key={task.id} task={task} onToggleComplete={onToggleComplete} onEdit={onEditTask} onDelete={onDeleteTask} />
                            )) : <p className="text-slate-400 text-center py-8">No long-term plans active.</p>}
                        </AnimatePresence>
                    </div>
                </div>

                {completedTasks.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-4 cursor-pointer hover:bg-black/20 p-2 rounded-lg transition-colors" onClick={() => setIsCompletedVisible(!isCompletedVisible)}>
                            <h3 className="text-xl font-semibold text-white">Completed Today</h3>
                            <ChevronDown size={24} className={`text-slate-300 transition-transform duration-300 ${isCompletedVisible ? 'rotate-180' : ''}`} />
                        </div>
                        <AnimatePresence>
                        {isCompletedVisible && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
                                <div className="space-y-4">
                                    {completedTasks.map(task => (
                                        <TaskCard key={task.id} task={task} onToggleComplete={onToggleComplete} onEdit={onEditTask} onDelete={onDeleteTask} />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StudyPage;
