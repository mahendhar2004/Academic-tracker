import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';
import { Calendar, Clock } from 'lucide-react';

const AddEditDeadlineModal = ({ isOpen, onClose, onSave, currentCourses, deadlineToEdit }) => {
    const [courseId, setCourseId] = useState('');
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const isNew = !deadlineToEdit;

    // UPDATED: Create a memoized, sorted list of courses
    const sortedCourses = useMemo(() => {
        return [...currentCourses].sort((a, b) => a.name.localeCompare(b.name));
    }, [currentCourses]);

    useEffect(() => {
        if (isOpen) {
            if (deadlineToEdit) {
                setCourseId(deadlineToEdit.courseId || '');
                setTitle(deadlineToEdit.title || '');

                const deadlineDateObj = deadlineToEdit.date?.toDate ? deadlineToEdit.date.toDate() : new Date(deadlineToEdit.date);

                const year = deadlineDateObj.getFullYear();
                const month = String(deadlineDateObj.getMonth() + 1).padStart(2, '0');
                const day = String(deadlineDateObj.getDate()).padStart(2, '0');

                setDate(`${year}-${month}-${day}`);
                setTime(deadlineToEdit.time || '23:59');

            } else {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');

                setCourseId('');
                setTitle('');
                setDate(`${year}-${month}-${day}`);
                setTime('23:59');
            }
        }
    }, [isOpen, deadlineToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (courseId && title && date && time) {
            const dataToSave = {
                courseId,
                title,
                date,
                time,
            };
            onSave(dataToSave, deadlineToEdit?.id || null);
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title={isNew ? "Add New Deadline" : "Edit Deadline"}>
            <form onSubmit={handleSubmit} className="space-y-4 w-80 md:w-96">
                <div>
                    <label htmlFor="deadlineCourse" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                    <select
                        id="deadlineCourse"
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900 dark:text-white"
                        required
                    >
                        <option value="">Select Subject</option>
                        {/* UPDATED: Map over the new sortedCourses array */}
                        {sortedCourses.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800">{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="deadlineTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Deadline Title</label>
                    <input
                        id="deadlineTitle"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Assignment 1 Submission"
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900 dark:text-white"
                        required
                    />
                </div>

                <div className="flex gap-4">
                    <div className="w-2/3">
                        <label htmlFor="deadlineDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Due Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-white" size={18} />
                            <input
                                id="deadlineDate"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900 dark:text-white"
                                required
                            />
                        </div>
                    </div>
                    <div className="w-1/3">
                        <label htmlFor="deadlineTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Time</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-white" size={18} />
                            <input
                                id="deadlineTime"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900 dark:text-white"
                                required
                            />
                        </div>
                    </div>
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors !mt-6"
                >
                    Save Deadline
                </motion.button>
            </form>
        </GlassyModal>
    );
};

export default AddEditDeadlineModal;