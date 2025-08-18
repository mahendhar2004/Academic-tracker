import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';
import DateTimePicker from '../common/DateTimePicker';
import { AlertTriangle } from 'lucide-react';

const timeToMinutes = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const AddEditClassModal = ({ isOpen, onClose, onSave, currentCourses, classToEdit, schedule, allCourses }) => {
    const [scheduleState, setScheduleState] = useState({ courseId: '', day: '', startTime: '', endTime: '', venue: '' });
    const [conflictWarning, setConflictWarning] = useState('');
    const isNew = !classToEdit;

    const sortedCourses = useMemo(() => {
        return [...currentCourses].sort((a, b) => a.name.localeCompare(b.name));
    }, [currentCourses]);

    // Create a memoized, unique list of previously used venues
    const previousVenues = useMemo(() => {
        if (!schedule) return [];
        const venues = schedule.map(item => item.venue).filter(Boolean); // Filter out any empty/null venues
        return [...new Set(venues)]; // Get only unique values
    }, [schedule]);

    useEffect(() => {
        if (isOpen) {
            setConflictWarning('');
            if (classToEdit) {
                const today = new Date().toISOString().split('T')[0];
                setScheduleState({
                    ...classToEdit,
                    startTime: `${today}T${classToEdit.startTime}`,
                    endTime: `${today}T${classToEdit.endTime}`,
                    venue: classToEdit.venue || '' // Ensure venue is initialized
                });
            } else {
                const defaultStart = new Date();
                defaultStart.setHours(9, 0, 0, 0);
                const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000);
                setScheduleState({ courseId: '', day: 'Monday', startTime: defaultStart.toISOString(), endTime: defaultEnd.toISOString(), venue: '' });
            }
        }
    }, [isOpen, classToEdit]);

    useEffect(() => {
        if (!isOpen || !scheduleState.startTime || !scheduleState.endTime || !scheduleState.day || !schedule) {
            setConflictWarning('');
            return;
        }
    
        const formatTime = (isoString) => new Date(isoString).toTimeString().slice(0, 5);
        const newClassStart = timeToMinutes(formatTime(scheduleState.startTime));
        const newClassEnd = timeToMinutes(formatTime(scheduleState.endTime));
    
        const conflictingClass = schedule.find(existingClass => {
            if (classToEdit && existingClass.id === classToEdit.id) return false;
            if (existingClass.day !== scheduleState.day) return false;
    
            const existingStart = timeToMinutes(existingClass.startTime);
            const existingEnd = timeToMinutes(existingClass.endTime);
    
            return newClassStart < existingEnd && newClassEnd > existingStart;
        });
        
        if (conflictingClass) {
            const courseName = allCourses.find(c => c.id === conflictingClass.courseId)?.name || 'another class';
            setConflictWarning(`This will overlap with ${courseName} (${conflictingClass.startTime} - ${conflictingClass.endTime}). Saving will create a conflicting entry.`);
        } else {
            setConflictWarning('');
        }
    }, [scheduleState, schedule, classToEdit, isOpen, allCourses]);
    

    const handleChange = (field, value) => {
        if (field === 'startTime') {
            const startDate = new Date(value);
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
            setScheduleState(prev => ({ ...prev, startTime: value, endTime: endDate.toISOString() }));
        } else {
            setScheduleState(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (scheduleState.courseId && scheduleState.day && scheduleState.startTime && scheduleState.endTime) {
            const formatTime = (isoString) => new Date(isoString).toTimeString().slice(0, 5);
            onSave({
                courseId: scheduleState.courseId,
                day: scheduleState.day,
                startTime: formatTime(scheduleState.startTime),
                endTime: formatTime(scheduleState.endTime),
                venue: scheduleState.venue.trim() // Add venue to the saved data
            }, classToEdit?.id || null);
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title={isNew ? "Add Class to Schedule" : "Edit Class Schedule"}>
            <form onSubmit={handleSubmit} className="space-y-4 w-80 md:w-96">
                <div>
                    <label htmlFor="classCourse" className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                    <select id="classCourse" value={scheduleState.courseId} onChange={(e) => handleChange('courseId', e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                        <option value="">Select Subject</option>
                        {sortedCourses.map(c => <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="classDay" className="block text-sm font-medium text-slate-300 mb-2">Day of the Week</label>
                    <select id="classDay" value={scheduleState.day} onChange={(e) => handleChange('day', e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                            <option key={day} value={day} className="bg-slate-800">{day}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="venue" className="block text-sm font-medium text-slate-300 mb-2">Venue</label>
                    <input
                        id="venue"
                        type="text"
                        value={scheduleState.venue}
                        onChange={(e) => handleChange('venue', e.target.value)}
                        placeholder="e.g., LHTC-1, Room 204"
                        className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        list="previous-venues"
                    />
                    <datalist id="previous-venues">
                        {previousVenues.map(venue => <option key={venue} value={venue} />)}
                    </datalist>
                </div>
                <div>
                     <label className="block text-sm font-medium text-slate-300 mb-2">Start Time</label>
                    <DateTimePicker type="time" value={scheduleState.startTime} onChange={(val) => handleChange('startTime', val)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">End Time</label>
                    <DateTimePicker type="time" value={scheduleState.endTime} onChange={(val) => handleChange('endTime', val)} />
                </div>

                <AnimatePresence>
                    {conflictWarning && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                        >
                            <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
                            <p className="text-yellow-300 text-sm">{conflictWarning}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors !mt-6">Save Class</motion.button>
            </form>
        </GlassyModal>
    );
};

export default AddEditClassModal;