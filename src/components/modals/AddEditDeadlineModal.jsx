import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';

const AddEditDeadlineModal = ({ isOpen, onClose, onSave, currentCourses, deadlineToEdit }) => {
    const [deadline, setDeadline] = useState({ courseId: '', title: '', date: '', time: '' });
    const isNew = !deadlineToEdit;

    useEffect(() => {
        if (isOpen) {
            if (deadlineToEdit) {
                setDeadline(deadlineToEdit);
            } else {
                setDeadline({ courseId: '', title: '', date: new Date().toISOString().split('T')[0], time: '23:59' });
            }
        }
    }, [isOpen, deadlineToEdit]);

    const handleChange = (field, value) => setDeadline(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (deadline.courseId && deadline.title && deadline.date && deadline.time) {
            onSave(deadline, deadlineToEdit?.id || null);
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title={isNew ? "Add New Deadline" : "Edit Deadline"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <select value={deadline.courseId} onChange={(e) => handleChange('courseId', e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                    <option value="">Select Course</option>
                    {currentCourses.map(c => <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>)}
                </select>
                <input type="text" value={deadline.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Deadline Title (e.g., Quiz 1)" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
                <div className="flex gap-4">
                    <input type="date" value={deadline.date} onChange={(e) => handleChange('date', e.target.value)} className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                    <input type="time" value={deadline.time} onChange={(e) => handleChange('time', e.target.value)} className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                </div>
                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors">Save Deadline</motion.button>
            </form>
        </GlassyModal>
    );
};

export default AddEditDeadlineModal;
