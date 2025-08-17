import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';
import DateTimePicker from '../common/DateTimePicker';

const AddEditClassModal = ({ isOpen, onClose, onSave, currentCourses, classToEdit }) => {
    const [schedule, setSchedule] = useState({ courseId: '', day: '', startTime: '', endTime: '' });
    const isNew = !classToEdit;

    useEffect(() => {
        if (isOpen) {
            if (classToEdit) {
                const today = new Date().toISOString().split('T')[0];
                setSchedule({
                    ...classToEdit,
                    startTime: `${today}T${classToEdit.startTime}`,
                    endTime: `${today}T${classToEdit.endTime}`
                });
            } else {
                const defaultStart = new Date();
                defaultStart.setHours(9, 0, 0, 0);
                const defaultEnd = new Date();
                defaultEnd.setHours(10, 0, 0, 0);
                setSchedule({ courseId: '', day: 'Monday', startTime: defaultStart.toISOString(), endTime: defaultEnd.toISOString() });
            }
        }
    }, [isOpen, classToEdit]);

    const handleChange = (field, value) => setSchedule(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (schedule.courseId && schedule.day && schedule.startTime && schedule.endTime) {
            const formatTime = (isoString) => new Date(isoString).toTimeString().slice(0, 5);
            onSave({
                courseId: schedule.courseId,
                day: schedule.day,
                startTime: formatTime(schedule.startTime),
                endTime: formatTime(schedule.endTime)
            }, classToEdit?.id || null);
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title={isNew ? "Add Class to Schedule" : "Edit Class Schedule"}>
            <form onSubmit={handleSubmit} className="space-y-4 w-80 md:w-96">
                <div>
                    <label htmlFor="classCourse" className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                    <select id="classCourse" value={schedule.courseId} onChange={(e) => handleChange('courseId', e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                        <option value="">Select Subject</option>
                        {/* UPDATED: Sort the courses alphabetically before mapping */}
                        {[...currentCourses]
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(c => <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="classDay" className="block text-sm font-medium text-slate-300 mb-2">Day of the Week</label>
                    <select id="classDay" value={schedule.day} onChange={(e) => handleChange('day', e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <option key={day} value={day} className="bg-slate-800">{day}</option>
                        ))}
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-medium text-slate-300 mb-2">Start Time</label>
                    <DateTimePicker type="time" value={schedule.startTime} onChange={(val) => handleChange('startTime', val)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">End Time</label>
                    <DateTimePicker type="time" value={schedule.endTime} onChange={(val) => handleChange('endTime', val)} />
                </div>
                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors !mt-6">Save Class</motion.button>
            </form>
        </GlassyModal>
    );
};

export default AddEditClassModal;