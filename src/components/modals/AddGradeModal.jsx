import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';

const GRADE_POINTS = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D+': 4, 'D': 3, 'F': 2 };
const GRADES = Object.keys(GRADE_POINTS);

const AddGradeModal = ({ isOpen, onClose, onSave, allCourses }) => {
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('A+');

    const semesters = useMemo(() => [...new Set(allCourses.map(c => c.semester))].sort((a,b) => a-b), [allCourses]);
    const coursesInSemester = useMemo(() => allCourses.filter(c => c.semester === Number(selectedSemester)), [allCourses, selectedSemester]);

    useEffect(() => {
        if(isOpen) {
            setSelectedSemester('');
            setSelectedCourseId('');
            setSelectedGrade('A+');
        }
    }, [isOpen]);
    
    useEffect(() => {
        setSelectedCourseId('');
    }, [selectedSemester]);

    const handleSave = () => {
        if (selectedCourseId && selectedGrade) {
            onSave(selectedCourseId, selectedGrade);
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title="Add/Update Grade">
            <div className="space-y-4">
                <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                    <option value="">Select Semester</option>
                    {semesters.map(s => <option key={s} value={s} className="bg-slate-800">Semester {s}</option>)}
                </select>

                {selectedSemester && (
                    <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                        <option value="">Select Course</option>
                        {coursesInSemester.map(c => <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>)}
                    </select>
                )}

                {selectedCourseId && (
                    <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                        {GRADES.map(g => <option key={g} value={g} className="bg-slate-800">{g} ({GRADE_POINTS[g]})</option>)}
                    </select>
                )}
                
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={!selectedCourseId} className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Save Grade</motion.button>
            </div>
        </GlassyModal>
    );
};

export default AddGradeModal;

