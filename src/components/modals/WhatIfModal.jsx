import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import GlassyModal from '../common/GlassyModal';

const GRADE_POINTS = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D+': 4, 'D': 3, 'F': 2 };
const GRADES = Object.keys(GRADE_POINTS);

const WhatIfModal = ({ isOpen, onClose, allCourses }) => {
    const [hypotheticalCourses, setHypotheticalCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({ name: '', credits: '', grade: 'A+' });
    const [predictedSPI, setPredictedSPI] = useState('0.0');
    const [predictedCPI, setPredictedCPI] = useState('0.0');

    const existingData = useMemo(() => {
        let cumulativeWeightedPoints = 0;
        let cumulativeCredits = 0;
        allCourses.forEach(course => {
            if (course.grade && course.credits > 0) {
                cumulativeWeightedPoints += course.credits * (GRADE_POINTS[course.grade] || 0);
                cumulativeCredits += course.credits;
            }
        });
        return { cumulativeWeightedPoints, cumulativeCredits };
    }, [allCourses]);

    useEffect(() => {
        let hypoWeightedPoints = 0;
        let hypoCredits = 0;
        hypotheticalCourses.forEach(course => {
            hypoWeightedPoints += parseFloat(course.credits) * GRADE_POINTS[course.grade];
            hypoCredits += parseFloat(course.credits);
        });

        // UPDATED: Changed .toFixed(2) to .toFixed(1)
        const spi = (hypoCredits > 0 ? hypoWeightedPoints / hypoCredits : 0).toFixed(1);
        setPredictedSPI(spi);

        const totalWeightedPoints = existingData.cumulativeWeightedPoints + hypoWeightedPoints;
        const totalCredits = existingData.cumulativeCredits + hypoCredits;
        
        // UPDATED: Changed .toFixed(2) to .toFixed(1)
        const cpi = (totalCredits > 0 ? totalWeightedPoints / totalCredits : 0).toFixed(1);
        setPredictedCPI(cpi);

    }, [hypotheticalCourses, existingData]);
    
    useEffect(() => {
        if(isOpen) {
            setHypotheticalCourses([]);
            setNewCourse({ name: '', credits: '', grade: 'A+' });
        }
    }, [isOpen]);

    const handleAddCourse = (e) => {
        e.preventDefault();
        if (newCourse.name && newCourse.credits > 0) {
            setHypotheticalCourses([...hypotheticalCourses, { ...newCourse, id: Date.now() }]);
            setNewCourse({ name: '', credits: '', grade: 'A+' });
        }
    };

    const handleDeleteCourse = (id) => {
        setHypotheticalCourses(hypotheticalCourses.filter(c => c.id !== id));
    };

    const handleChange = (field, value) => {
        setNewCourse(prev => ({ ...prev, [field]: value }));
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title="What If? Calculator" customClasses="max-w-2xl w-full">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center bg-black/20 p-4 rounded-xl border border-white/10">
                    <div>
                        <p className="text-slate-300 text-sm">Predicted SPI (for these courses)</p>
                        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{predictedSPI}</p>
                    </div>
                    <div>
                        <p className="text-slate-300 text-sm">Predicted Overall CPI</p>
                        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{predictedCPI}</p>
                    </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-2">
                    <AnimatePresence>
                        {hypotheticalCourses.map(course => (
                             <motion.div 
                                key={course.id}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-black/20 p-3 rounded-lg flex justify-between items-center"
                            >
                                <p className="font-semibold text-white">{course.name} ({course.credits} Cr)</p>
                                <div className="flex items-center gap-4">
                                    <p className="font-mono text-cyan-300">{course.grade}</p>
                                    <button onClick={() => handleDeleteCourse(course.id)} className="text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {hypotheticalCourses.length === 0 && (
                        <p className="text-slate-500 text-center py-4">Add a hypothetical course below to see your predicted grades.</p>
                    )}
                </div>

                <form onSubmit={handleAddCourse} className="flex flex-col md:flex-row gap-2 bg-black/20 p-3 rounded-lg">
                    <input type="text" value={newCourse.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Hypothetical Course Name" className="flex-1 bg-slate-800/50 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400" required />
                    <input type="number" value={newCourse.credits} onChange={(e) => handleChange('credits', e.target.value)} placeholder="Credits" className="w-full md:w-24 bg-slate-800/50 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400" required min="0.5" step="0.5" />
                    <select value={newCourse.grade} onChange={(e) => handleChange('grade', e.target.value)} className="w-full md:w-28 bg-slate-800/50 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                        {GRADES.map(g => <option key={g} value={g} className="bg-slate-800">{g}</option>)}
                    </select>
                    <motion.button whileTap={{scale:0.95}} type="submit" className="bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold p-2 rounded-lg"><Plus size={20} /></motion.button>
                </form>

                <div className="flex gap-4 pt-4 border-t border-white/10">
                    <button 
                        onClick={() => setHypotheticalCourses([])}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                    >
                        <RotateCcw size={14}/>
                        Reset
                    </button>
                    <button 
                        onClick={onClose}
                        className="ml-auto bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </GlassyModal>
    );
};

export default WhatIfModal;