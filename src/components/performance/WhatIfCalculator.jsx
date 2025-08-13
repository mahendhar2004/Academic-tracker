import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';

const GRADE_POINTS = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D+': 4, 'D': 3, 'F': 2 };
const GRADES = Object.keys(GRADE_POINTS);

const WhatIfCalculator = ({ allCourses }) => {
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
        if (hypotheticalCourses.length === 0) {
            setPredictedSPI('0.0');
            setPredictedCPI((existingData.cumulativeCredits > 0 ? existingData.cumulativeWeightedPoints / existingData.cumulativeCredits : 0).toFixed(1));
            return;
        }

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
        <div className="bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center bg-black/20 p-4 rounded-lg mb-4">
                <div>
                    <p className="text-slate-200">Predicted SPI</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{predictedSPI}</p>
                </div>
                <div className="text-right">
                    <p className="text-slate-200">Predicted Overall CPI</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{predictedCPI}</p>
                </div>
            </div>
            
            <div className="space-y-2 mb-4">
                {hypotheticalCourses.map(course => (
                    <div key={course.id} className="bg-black/20 p-2 rounded-lg flex justify-between items-center">
                        <p className="font-semibold">{course.name} ({course.credits} Cr)</p>
                        <div className="flex items-center gap-4">
                            <p className="font-mono text-cyan-300">{course.grade}</p>
                            <button onClick={() => handleDeleteCourse(course.id)} className="text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleAddCourse} className="flex flex-col md:flex-row gap-2">
                <input type="text" value={newCourse.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Course Name" className="flex-1 bg-black/20 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400" required />
                <input type="number" value={newCourse.credits} onChange={(e) => handleChange('credits', e.target.value)} placeholder="Credits" className="w-24 bg-black/20 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400" required min="0.5" step="0.5" />
                <select value={newCourse.grade} onChange={(e) => handleChange('grade', e.target.value)} className="w-28 bg-slate-800/50 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                    {GRADES.map(g => <option key={g} value={g} className="bg-slate-800">{g}</option>)}
                </select>
                <motion.button whileTap={{scale:0.95}} type="submit" className="bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold p-2 rounded-lg"><Plus size={20} /></motion.button>
            </form>
        </div>
    );
};

export default WhatIfCalculator;
