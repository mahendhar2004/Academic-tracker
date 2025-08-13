import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';

const GRADE_POINTS = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D+': 4, 'D': 3, 'F': 2 };
const GRADES = Object.keys(GRADE_POINTS);

const AddCourseModal = ({ isOpen, onClose, onSave, currentSemester }) => {
    const [course, setCourse] = useState({ name: '', credits: '', semester: '', grade: 'Not Published' });
    const nameInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Auto-populate the semester and reset other fields
            setCourse({ name: '', credits: '', semester: currentSemester || '', grade: 'Not Published' });
            
            // Auto-focus the name input field
            setTimeout(() => {
                nameInputRef.current?.focus();
            }, 100); // Small delay to ensure modal is rendered
        }
    }, [isOpen, currentSemester]);

    const handleChange = (field, value) => setCourse(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const creditsNum = parseFloat(course.credits);
        const semesterNum = parseInt(course.semester, 10);
        if (course.name.trim() && !isNaN(creditsNum) && creditsNum > 0 && !isNaN(semesterNum) && semesterNum > 0) {
            onSave({ ...course, credits: creditsNum, semester: semesterNum });
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title="Add New Course">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input ref={nameInputRef} type="text" value={course.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Course Name" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400" required />
                <div className="flex gap-4">
                    <input type="number" value={course.semester} onChange={(e) => handleChange('semester', e.target.value)} placeholder="Semester" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400" required min="1" />
                    <input type="number" value={course.credits} onChange={(e) => handleChange('credits', e.target.value)} placeholder="Credits" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400" required min="0.5" step="0.5" />
                </div>
                <select value={course.grade} onChange={(e) => handleChange('grade', e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                    <option value="Not Published" className="bg-slate-800">Not Published</option>
                    {GRADES.map(g => <option key={g} value={g} className="bg-slate-800">{g} ({GRADE_POINTS[g]})</option>)}
                </select>
                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors">Save Course</motion.button>
            </form>
        </GlassyModal>
    );
};

export default AddCourseModal;
