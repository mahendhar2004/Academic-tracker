import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';
import { Calendar, Clock } from 'lucide-react';

const AddEditTaskModal = ({ isOpen, onClose, onSave, taskToEdit, defaultType }) => {
    const [task, setTask] = useState({ title: '', description: '', dueDate: '', dueTime: '', type: 'Short-term' });
    const isNew = !taskToEdit;

    useEffect(() => {
        if (isOpen) {
            const today = new Date().toISOString().split('T')[0];
            if (taskToEdit) {
                setTask({
                    ...taskToEdit,
                    dueDate: taskToEdit.dueDate || today,
                    dueTime: taskToEdit.dueTime || '23:59',
                });
            } else {
                setTask({
                    title: '',
                    description: '',
                    type: defaultType || 'Short-term',
                    dueDate: today,
                    dueTime: '23:59',
                });
            }
        }
    }, [isOpen, taskToEdit, defaultType]);

    const handleChange = (field, value) => setTask(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (task.title && task.type) {
            onSave({
                ...task,
                dueDate: task.type === 'Long-term' ? task.dueDate : null,
                dueTime: task.dueTime || '23:59'
            }, taskToEdit?.id || null);
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title={isNew ? "Create a New Plan" : "Edit Plan"}>
            <form onSubmit={handleSubmit} className="space-y-4 w-80 md:w-96">
                <div>
                    <label htmlFor="taskTitle" className="block text-sm font-medium text-slate-300 mb-2">Task Title</label>
                    <input
                        id="taskTitle"
                        type="text"
                        value={task.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="e.g., Revise Chapter 5"
                        className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="taskDescription" className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
                    <textarea
                        id="taskDescription"
                        value={task.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="e.g., Focus on key formulas and examples."
                        className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 h-24 resize-none"
                    />
                </div>
                <div>
                    <label htmlFor="taskType" className="block text-sm font-medium text-slate-300 mb-2">Plan Type</label>
                    <select
                        id="taskType"
                        value={task.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                        className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                        <option value="Short-term" className="bg-slate-800">Short-term</option>
                        <option value="Long-term" className="bg-slate-800">Long-term</option>
                    </select>
                </div>
                
                {/* UPDATED: Conditionally render separate date and time inputs */}
                {task.type === 'Long-term' ? (
                    <div className="flex gap-4">
                        <div className="w-2/3">
                            <label htmlFor="taskDate" className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                <input
                                    id="taskDate"
                                    type="date"
                                    value={task.dueDate}
                                    onChange={(e) => handleChange('dueDate', e.target.value)}
                                    className="w-full bg-black/20 border border-white/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    required
                                />
                            </div>
                        </div>
                        <div className="w-1/3">
                            <label htmlFor="taskTime" className="block text-sm font-medium text-slate-300 mb-2">Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                <input
                                    id="taskTime"
                                    type="time"
                                    value={task.dueTime}
                                    onChange={(e) => handleChange('dueTime', e.target.value)}
                                    className="w-full bg-black/20 border border-white/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <label htmlFor="taskTimeShort" className="block text-sm font-medium text-slate-300 mb-2">Due Time</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                            <input
                                id="taskTimeShort"
                                type="time"
                                value={task.dueTime}
                                onChange={(e) => handleChange('dueTime', e.target.value)}
                                className="w-full bg-black/20 border border-white/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                required
                            />
                        </div>
                    </div>
                )}

                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors !mt-6">Save Plan</motion.button>
            </form>
        </GlassyModal>
    );
};

export default AddEditTaskModal;