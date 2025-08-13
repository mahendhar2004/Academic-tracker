import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';

const AddEditTaskModal = ({ isOpen, onClose, onSave, taskToEdit }) => {
    const [task, setTask] = useState({ title: '', description: '', dueTime: '', type: 'Short-term', dueDate: '' });
    const isNew = !taskToEdit;

    useEffect(() => {
        if (isOpen) {
            const todayString = new Date().toISOString().split('T')[0];
            if (taskToEdit) {
                setTask(taskToEdit);
            } else {
                setTask({ title: '', description: '', dueTime: '23:59', type: 'Short-term', dueDate: todayString });
            }
        }
    }, [isOpen, taskToEdit]);

    const handleChange = (field, value) => setTask(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (task.title && task.dueTime && task.type) {
            onSave(task, taskToEdit?.id || null);
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title={isNew ? "Create a New Study Plan" : "Edit Study Plan"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={task.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Task Title (e.g., Revise Chapter 5)" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400" required />
                <textarea value={task.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Description..." className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400 h-24 resize-none"></textarea>
                <div className="flex gap-4">
                    <select value={task.type} onChange={(e) => handleChange('type', e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                        <option value="Short-term" className="bg-slate-800">Short-term</option>
                        <option value="Long-term" className="bg-slate-800">Long-term</option>
                    </select>
                    <input type="time" value={task.dueTime} onChange={(e) => handleChange('dueTime', e.target.value)} className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                </div>
                {task.type === 'Long-term' && (
                     <input type="date" value={task.dueDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => handleChange('dueDate', e.target.value)} className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                )}
                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors">Save Plan</motion.button>
            </form>
        </GlassyModal>
    );
};

export default AddEditTaskModal;
