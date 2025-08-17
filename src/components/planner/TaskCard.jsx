import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit, Check } from 'lucide-react';

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete }) => {
    const cardVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9 }
    };

    return (
        <motion.div 
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
            className={`relative group bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-4 rounded-xl shadow-lg flex items-center gap-4 ${task.isCompleted ? 'opacity-50' : ''}`}
        >
            <motion.button 
                whileTap={{ scale: 0.9 }} 
                onClick={() => onToggleComplete(task.id, !task.isCompleted)}
                className={`w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-green-500/50 border-green-400' : 'border-slate-400 hover:border-cyan-400'}`}
            >
                {task.isCompleted && <Check className="text-white" />}
            </motion.button>
            <div className="flex-1">
                <p className={`font-bold text-lg text-white ${task.isCompleted ? 'line-through text-slate-400' : ''}`}>{task.title}</p>
                <p className={`text-sm text-slate-300 ${task.isCompleted ? 'line-through' : ''}`}>{task.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-cyan-300">
                    <span>Due: {task.dueTime}</span>
                    {task.type === 'Long-term' && task.dueDate && (
                         <span className="bg-purple-500/20 px-2 py-0.5 rounded-full">
                            Due Date: {new Date(task.dueDate).toLocaleDateString('en-GB')}
                         </span>
                    )}
                </div>
            </div>
            <div className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(task)} className="text-slate-400 hover:text-cyan-300"><Edit size={16} /></button>
                <button onClick={() => onDelete(task.id)} className="text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
            </div>
        </motion.div>
    );
};

export default TaskCard;
