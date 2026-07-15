import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';
import { COURSE_THEMES } from '../../constants';

const GRADE_POINTS = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D+': 4, 'D': 3, 'F': 2 };
const GRADES = Object.keys(GRADE_POINTS);

const AddCourseModal = ({ isOpen, onClose, onSave, currentSemester, initialData = null }) => {
    // Default to 'Rose' if nothing selected, or just the first one
    const [course, setCourse] = useState({ name: '', credits: '', semester: '', grade: 'Not Published', attended: '', total: '', color: COURSE_THEMES[14].value, professor: '', timings: '' });
    const [error, setError] = useState('');
    const nameInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setCourse({
                    ...initialData,
                    credits: initialData.credits.toString(),
                    semester: initialData.semester.toString(),
                    attended: initialData.attended ? initialData.attended.toString() : '',
                    total: initialData.total ? initialData.total.toString() : '',
                    grade: initialData.grade || 'Not Published',
                    color: initialData.color || COURSE_THEMES[14].value,
                    professor: initialData.professor || '',
                    timings: initialData.timings || ''
                });
            } else {
                setCourse({ name: '', credits: '', semester: currentSemester || '', grade: 'Not Published', attended: '', total: '', color: COURSE_THEMES[14].value, professor: '', timings: '' });
            }
            setError('');
            setTimeout(() => { nameInputRef.current?.focus(); }, 100);
        }
    }, [isOpen, currentSemester, initialData]);

    const handleChange = (field, value) => {
        setCourse(prev => ({ ...prev, [field]: value }));
        if (error) {
            setError('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const creditsNum = parseFloat(course.credits);
        const semesterNum = parseInt(course.semester, 10);
        const attendedNum = parseInt(course.attended, 10) || 0;
        const totalNum = parseInt(course.total, 10) || 0;

        if (attendedNum < 0 || totalNum < 0) {
            setError("Attended and total classes cannot be negative.");
            return;
        }

        if (totalNum < attendedNum) {
            setError("Total classes cannot be less than attended classes.");
            return;
        }

        if (course.name.trim() && !isNaN(creditsNum) && creditsNum > 0 && creditsNum <= 30 && !isNaN(semesterNum) && semesterNum > 0) {
            const courseToSave = {
                name: course.name,
                credits: creditsNum,
                semester: semesterNum,
                grade: course.grade,
                attended: attendedNum,
                total: totalNum,

                color: course.color, // Save variable color name ('rose', 'blue') not hex
                professor: course.professor,
                timings: course.timings
            };
            onSave(courseToSave);
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Subject" : "Add New Subject"}>
            <form onSubmit={handleSubmit} className="space-y-4 w-80 md:w-96">
                <div>
                    <label htmlFor="courseName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject Name</label>
                    <input ref={nameInputRef} id="courseName" type="text" value={course.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g., Data Structures" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400 text-slate-900 dark:text-white" required />
                </div>

                {/* Color Picker */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Theme Color</label>
                    <div className="flex flex-wrap gap-2">
                        {COURSE_THEMES.map((theme) => (
                            <button
                                key={theme.value}
                                type="button"
                                onClick={() => handleChange('color', theme.value)}
                                className={`w-6 h-6 rounded-full transition-all border-2 ${course.color === theme.value ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                style={{ backgroundColor: theme.hex }}
                                title={theme.label}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label htmlFor="semester" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Semester</label>
                        <input id="semester" type="number" value={course.semester} onChange={(e) => handleChange('semester', e.target.value)} placeholder="e.g., 3" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400 text-slate-900 dark:text-white" required min="1" />
                    </div>
                    <div className="w-1/2">
                        <label htmlFor="credits" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Credits</label>
                        <input id="credits" type="number" value={course.credits} onChange={(e) => handleChange('credits', e.target.value)} placeholder="e.g., 4" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400 text-slate-900 dark:text-white" required min="0.5" max="30" step="0.5" />
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label htmlFor="professor" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Professor (Optional)</label>
                        <input id="professor" type="text" value={course.professor} onChange={(e) => handleChange('professor', e.target.value)} placeholder="e.g., Prof. Smith" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400 text-slate-900 dark:text-white" />
                    </div>
                    <div className="w-1/2">
                        <label htmlFor="timings" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Timings (Optional)</label>
                        <input id="timings" type="text" value={course.timings} onChange={(e) => handleChange('timings', e.target.value)} placeholder="e.g., Mon 10am" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400 text-slate-900 dark:text-white" />
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label htmlFor="attended" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 text-xs">Attended (Override)</label>
                        <input id="attended" type="number" value={course.attended} onChange={(e) => handleChange('attended', e.target.value)} placeholder="e.g., 10" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400 text-slate-900 dark:text-white" min="0" />
                    </div>
                    <div className="w-1/2">
                        <label htmlFor="total" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 text-xs">Total (Override)</label>
                        <input id="total" type="number" value={course.total} onChange={(e) => handleChange('total', e.target.value)} placeholder="e.g., 12" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400 text-slate-900 dark:text-white" min="0" />
                    </div>
                </div>

                {error && (
                    <p className="text-red-400 text-sm text-center -my-2">{error}</p>
                )}

                <div>
                    <label htmlFor="grade" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Grade (Optional)</label>
                    <select id="grade" value={course.grade} onChange={(e) => handleChange('grade', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900 dark:text-white">
                        <option value="Not Published" className="bg-white dark:bg-slate-800">Not Published</option>
                        {GRADES.map(g => <option key={g} value={g} className="bg-white dark:bg-slate-800">{g} ({GRADE_POINTS[g]})</option>)}
                    </select>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors !mt-6">
                    {initialData ? "Update Subject" : "Save Subject"}
                </motion.button>
            </form>
        </GlassyModal>
    );
};

export default AddCourseModal;