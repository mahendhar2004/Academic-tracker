import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';
import DateTimePicker from '../common/DateTimePicker';

const AddEditTaskModal = ({ isOpen, onClose, onSave, taskToEdit }) => {
    const [task, setTask] = useState({ title: '', description: '', datetime: '', type: 'Short-term' });
    const isNew = !taskToEdit;

    useEffect(() => {
        if (isOpen) {
            if (taskToEdit) {
                const date = taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : new Date();
                const [hours, minutes] = taskToEdit.dueTime.split(':');
                date.setHours(hours, minutes);
                setTask({ ...taskToEdit, datetime: date.toISOString() });
            } else {
                const defaultDate = new Date();
                defaultDate.setHours(23, 59, 0, 0);
                setTask({ title: '', description: '', datetime: defaultDate.toISOString(), type: 'Short-term' });
            }
        }
    }, [isOpen, taskToEdit]);

    const handleChange = (field, value) => setTask(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (task.title && task.datetime && task.type) {
            const dateObj = new Date(task.datetime);
            onSave({
                ...task,
                dueDate: task.type === 'Long-term' ? dateObj.toISOString().split('T')[0] : null,
                dueTime: dateObj.toTimeString().slice(0, 5)
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
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        {task.type === 'Long-term' ? 'Due Date & Time' : 'Due Time'}
                    </label>
                    <DateTimePicker
                        value={task.datetime}
                        onChange={(val) => handleChange('datetime', val)}
                        type={task.type === 'Long-term' ? 'datetime' : 'time'}
                    />
                </div>
                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors !mt-6">Save Plan</motion.button>
            </form>
        </GlassyModal>
    );
};

export default AddEditTaskModal;