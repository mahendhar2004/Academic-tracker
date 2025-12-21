import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit, Check, Calendar } from 'lucide-react';

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete }) => {
    const cardVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    };

    const isCompleted = task.isCompleted;

    return (
        <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
            className={`group relative bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors duration-300 flex items-start gap-4 shadow-sm dark:shadow-none ${isCompleted ? 'opacity-60' : ''}`}
        >
            {/* Accent Border */}
            <div className={`w-1.5 h-full absolute left-0 top-0 rounded-l-xl transition-colors ${isCompleted ? 'bg-green-500' : 'bg-brand-secondary dark:bg-cyan-500'}`}></div>

            <div className="flex-1 p-4 pl-6">
                <div className="flex items-start justify-between">
                    <div className="pr-4">
                        <p className={`font-bold text-lg text-slate-900 dark:text-white break-words ${isCompleted ? 'line-through text-slate-400' : ''}`}>{task.title}</p>
                        {task.description && (
                            <p className={`text-sm text-slate-500 dark:text-slate-400 mt-1 break-words ${isCompleted ? 'line-through' : ''}`}>{task.description}</p>
                        )}
                    </div>

                    {/* UPDATED: Grouped all buttons together to prevent overlap */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {!isCompleted && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button onClick={() => onEdit(task)} className="p-1.5 rounded-md text-slate-400 hover:text-brand-secondary dark:hover:text-cyan-300"><Edit size={16} /></button>
                                <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-500 dark:hover:text-red-400"><Trash2 size={16} /></button>
                            </div>
                        )}

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onToggleComplete(task.id, !isCompleted)}
                            className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-green-500 border-green-400' : 'border-slate-300 dark:border-slate-400 group-hover:border-brand-secondary dark:group-hover:border-cyan-400'}`}
                            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                            {isCompleted && <Check className="text-white" />}
                        </motion.button>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="bg-slate-100 dark:bg-black/30 px-2 py-1 rounded-full">
                        Due: {task.dueTime}
                    </span>
                    {task.type === 'Long-term' && task.dueDate && (
                        <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-black/30 px-2 py-1 rounded-full">
                            <Calendar size={12} />
                            {new Date(task.dueDate).toLocaleDateString('en-GB')}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default TaskCard;