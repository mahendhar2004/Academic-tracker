import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';

const AddEditClassModal = ({ isOpen, onClose, onSave, currentCourses, classToEdit }) => {
    const [schedule, setSchedule] = useState({ courseId: '', day: '', startTime: '', endTime: '' });
    const isNew = !classToEdit;

    useEffect(() => {
        if (isOpen) {
            if (classToEdit) {
                setSchedule(classToEdit);
            } else {
                setSchedule({ courseId: '', day: 'Monday', startTime: '09:00', endTime: '10:00' });
            }
        }
    }, [isOpen, classToEdit]);

    const handleChange = (field, value) => setSchedule(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (schedule.courseId && schedule.day && schedule.startTime && schedule.endTime) {
            onSave(schedule, classToEdit?.id || null);
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title={isNew ? "Add Class to Schedule" : "Edit Class Schedule"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <select value={schedule.courseId} onChange={(e) => handleChange('courseId', e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                    <option value="">Select Course</option>
                    {currentCourses.map(c => <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>)}
                </select>
                <select value={schedule.day} onChange={(e) => handleChange('day', e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <option key={day} value={day} className="bg-slate-800">{day}</option>
                    ))}
                </select>
                <div className="flex gap-4">
                    <input type="time" value={schedule.startTime} onChange={(e) => handleChange('startTime', e.target.value)} className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                    <input type="time" value={schedule.endTime} onChange={(e) => handleChange('endTime', e.target.value)} className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                </div>
                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors">Save Class</motion.button>
            </form>
        </GlassyModal>
    );
};

export default AddEditClassModal;
