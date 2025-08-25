import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, RotateCcw, BrainCircuit } from 'lucide-react';
import GlassyModal from '../common/GlassyModal';

const GRADE_POINTS = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D+': 4, 'D': 3, 'F': 2 };
const GRADES = Object.keys(GRADE_POINTS);

const WhatIfModal = ({ isOpen, onClose, allCourses }) => {
    const [hypotheticalCourses, setHypotheticalCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({ name: '', credits: '', grade: 'A+' });
    const [predictedSPI, setPredictedSPI] = useState('0.0');
    const [predictedCPI, setPredictedCPI] = useState('0.0');

    const existingData = useMemo(() => {
        const gradedCourses = allCourses.filter(c => c.grade && c.grade !== 'Not Published' && c.credits > 0);
        
        let cumulativeWeightedPoints = 0;
        let cumulativeCredits = 0;

        gradedCourses.forEach(course => {
            cumulativeWeightedPoints += course.credits * (GRADE_POINTS[course.grade] || 0);
            cumulativeCredits += course.credits;
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

        const spi = (hypoCredits > 0 ? hypoWeightedPoints / hypoCredits : 0).toFixed(1);
        setPredictedSPI(spi);

        const totalWeightedPoints = existingData.cumulativeWeightedPoints + hypoWeightedPoints;
        const totalCredits = existingData.cumulativeCredits + hypoCredits;
        
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
        <GlassyModal isOpen={isOpen} onClose={onClose} title="What If? Calculator" customClasses="max-w-xl w-full">
            {/* NEW: Single-column layout with clear sections */}
            <div className="space-y-6">
                
                {/* Section 1: Results */}
                <div className="text-center">
                    <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-xl border border-white/10">
                        <div>
                            <p className="text-slate-300 text-sm font-semibold">PREDICTED SPI</p>
                            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{predictedSPI}</p>
                        </div>
                        <div>
                            <p className="text-slate-300 text-sm font-semibold">PREDICTED OVERALL CPI</p>
                            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{predictedCPI}</p>
                        </div>
                    </div>
                </div>

                {/* Section 2: Hypothetical Course List */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-white">Hypothetical Subjects</h3>
                        <motion.button 
                            whileTap={{scale:0.95}}
                            onClick={() => setHypotheticalCourses([])}
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                        >
                            <RotateCcw size={14}/>
                            Reset List
                        </motion.button>
                    </div>
                    <div className="space-y-2 h-40 overflow-y-auto no-scrollbar bg-black/20 p-3 rounded-lg border border-white/10">
                        <AnimatePresence>
                            {hypotheticalCourses.map(course => (
                                <motion.div 
                                    key={course.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="group flex items-center justify-between bg-slate-800/50 p-3 rounded-lg"
                                >
                                    <p className="font-semibold text-white">{course.name} ({course.credits} Cr)</p>
                                    <div className="flex items-center gap-4">
                                        <p className="font-mono text-cyan-300">{course.grade}</p>
                                        <button onClick={() => handleDeleteCourse(course.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-opacity">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {hypotheticalCourses.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <BrainCircuit size={32} className="text-slate-600 mb-2"/>
                                <p className="text-slate-500 text-sm">Add a subject below to start predicting.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 3: Input Form */}
                <form onSubmit={handleAddCourse} className="space-y-4 pt-4 border-t border-white/10">
                     <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3">
                        <input type="text" value={newCourse.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="New Subject Name" className="flex-1 bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
                        <input type="number" value={newCourse.credits} onChange={(e) => handleChange('credits', e.target.value)} placeholder="Credits" className="w-full sm:w-28 bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" required min="0.5" step="0.5" />
                        <select value={newCourse.grade} onChange={(e) => handleChange('grade', e.target.value)} className="w-full sm:w-28 bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                            {GRADES.map(g => <option key={g} value={g} className="bg-slate-800">{g}</option>)}
                        </select>
                    </div>
                    <motion.button whileTap={{scale:0.95}} type="submit" className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Plus size={20} /> Add to Calculation
                    </motion.button>
                </form>
            </div>
        </GlassyModal>
    );
};

export default WhatIfModal;