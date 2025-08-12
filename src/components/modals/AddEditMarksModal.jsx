import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';

const AddEditMarksModal = ({ isOpen, onClose, onSave, allCourses, markToEdit }) => {
    const [mark, setMark] = useState({ courseId: '', examName: '', marksSecured: '', maxMarks: '', weightage: '' });
    const [selectedSemester, setSelectedSemester] = useState('');
    const isNew = !markToEdit;

    const semesters = useMemo(() => [...new Set(allCourses.map(c => c.semester))].sort((a, b) => a - b), [allCourses]);
    const coursesInSemester = useMemo(() => allCourses.filter(c => c.semester === Number(selectedSemester)), [allCourses, selectedSemester]);

    useEffect(() => {
        if (isOpen) {
            if (markToEdit) {
                const course = allCourses.find(c => c.id === markToEdit.courseId);
                setSelectedSemester(course?.semester || '');
                setMark(markToEdit);
            } else {
                setSelectedSemester('');
                setMark({ courseId: '', examName: '', marksSecured: '', maxMarks: '', weightage: '' });
            }
        }
    }, [isOpen, markToEdit, allCourses]);

    const handleChange = (field, value) => setMark(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mark.courseId && mark.examName && mark.marksSecured && mark.maxMarks && mark.weightage) {
            onSave(mark, markToEdit?.id || null);
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title={isNew ? "Add Exam Marks" : "Edit Exam Marks"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                    <option value="">Select Semester</option>
                    {semesters.map(s => <option key={s} value={s} className="bg-slate-800">Semester {s}</option>)}
                </select>

                {selectedSemester && (
                    <select value={mark.courseId} onChange={(e) => handleChange('courseId', e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                        <option value="">Select Course</option>
                        {coursesInSemester.map(c => <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>)}
                    </select>
                )}

                <input type="text" value={mark.examName} onChange={(e) => handleChange('examName', e.target.value)} placeholder="Exam Name (e.g., Mid Term 1)" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
                <div className="flex gap-4">
                    <input type="number" value={mark.marksSecured} onChange={(e) => handleChange('marksSecured', e.target.value)} placeholder="Marks Secured" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
                    <input type="number" value={mark.maxMarks} onChange={(e) => handleChange('maxMarks', e.target.value)} placeholder="Max Marks" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
                </div>
                <input type="number" value={mark.weightage} onChange={(e) => handleChange('weightage', e.target.value)} placeholder="Weightage (%)" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
                
                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors">Save Marks</motion.button>
            </form>
        </GlassyModal>
    );
};

export default AddEditMarksModal;