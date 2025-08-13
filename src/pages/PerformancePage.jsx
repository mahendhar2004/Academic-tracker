import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Plus, ChevronDown, Trash2, Edit, HelpCircle, PackageOpen, BrainCircuit } from 'lucide-react';
import WhatIfCalculator from '../components/performance/WhatIfCalculator';
import CpiGraph from '../components/performance/CpiGraph';

const GRADE_POINTS = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D+': 4, 'D': 3, 'F': 2 };

const ExamMarkCircle = ({ mark, onEdit, onDelete }) => {
    const percentage = (mark.marksSecured / mark.maxMarks) * 100;
    const strokeDashoffset = 283 - (283 * percentage) / 100;

    return (
        <div className="flex flex-col items-center gap-2 group">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-black/20" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                    <motion.circle 
                        className="text-cyan-400"
                        strokeWidth="10" 
                        strokeDasharray="283"
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="45" 
                        cx="50" 
                        cy="50"
                        transform="rotate(-90 50 50)"
                        initial={{ strokeDashoffset: 283 }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{mark.marksSecured}</span>
                    <span className="text-sm text-slate-400">/ {mark.maxMarks}</span>
                </div>
            </div>
            <p className="font-semibold text-sm text-center truncate w-24 mt-2">{mark.examName}</p>
            <p className="text-xs text-slate-400">{mark.weightage}%</p>
            <div className="flex gap-4 mt-1 h-8 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button onClick={onEdit} className="text-slate-400 hover:text-cyan-300 transition-colors"><Edit size={14}/></button>
                <button onClick={onDelete} className="text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
            </div>
        </div>
    );
};

const TotalMarkCircle = ({ total }) => {
    const percentage = parseFloat(total);
    const strokeDashoffset = 283 - (283 * percentage) / 100;

    let colorClass = 'text-green-500';
    if (percentage < 30) {
        colorClass = 'text-red-500';
    } else if (percentage < 50) {
        colorClass = 'text-orange-500';
    } else if (percentage < 75) {
        colorClass = 'text-yellow-500';
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-black/20" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                    <motion.circle
                        className={colorClass}
                        strokeWidth="10"
                        strokeDasharray="283"
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                        transform="rotate(-90 50 50)"
                        initial={{ strokeDashoffset: 283 }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{total}</span>
                    <span className="text-sm text-slate-400">/ 100</span>
                </div>
            </div>
            <p className="font-semibold text-sm text-center truncate w-24 mt-2">Total Marks</p>
            <div className="h-8"></div> {/* Placeholder for alignment */}
        </div>
    );
};

const PerformancePage = ({ performanceData, allCourses, examMarks, onDeleteCourse, onEditGrade, onAddExamMarks, onEditExamMark, onDeleteExamMark }) => {
    const { cpi, semesters } = performanceData;
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const [expandedSemesters, setExpandedSemesters] = useState(new Set());

    useEffect(() => {
        if (semesters.length > 0 && expandedSemesters.size === 0) {
            setExpandedSemesters(new Set([semesters[0].semester]));
        }
    }, [semesters, expandedSemesters.size]);

    const toggleSemester = (semester) => {
        setExpandedSemesters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(semester)) newSet.delete(semester);
            else newSet.add(semester);
            return newSet;
        });
    };

    const marksByCourse = useMemo(() => {
        return examMarks.reduce((acc, mark) => {
            (acc[mark.courseId] = acc[mark.courseId] || []).push(mark);
            return acc;
        }, {});
    }, [examMarks]);

    const getCourseName = (courseId) => {
        const course = allCourses.find(c => c.id === courseId);
        return course ? course.name : 'Unknown Course';
    };

    const calculateTotalMarks = (courseId) => {
        const marks = marksByCourse[courseId] || [];
        const total = marks.reduce((acc, mark) => {
            return acc + (mark.marksSecured / mark.maxMarks) * mark.weightage;
        }, 0);
        return total.toFixed(1);
    };

    const cpiGraphData = useMemo(() => {
        let cumulativeWeightedPoints = 0;
        let cumulativeCredits = 0;
        return semesters
            .sort((a, b) => a.semester - b.semester)
            .map(sem => {
                let semWeightedPoints = 0;
                let semCredits = 0;
                sem.courses.forEach(course => {
                    semWeightedPoints += course.credits * (GRADE_POINTS[course.grade] || 0);
                    semCredits += course.credits;
                });
                cumulativeWeightedPoints += semWeightedPoints;
                cumulativeCredits += semCredits;
                return {
                    semester: sem.semester,
                    cpi: (cumulativeCredits > 0 ? cumulativeWeightedPoints / cumulativeCredits : 0).toFixed(2)
                };
            });
    }, [semesters]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
                <div className="flex-1 space-y-8">
                    {/* Exam Marks Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Edit className="text-cyan-400" />Exam Marks</h2>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={onAddExamMarks} className="flex-shrink-0 flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/25 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-white/25">
                                <Plus size={18} /> Add Marks
                            </motion.button>
                        </div>
                        <div className="space-y-4">
                            {Object.keys(marksByCourse).length > 0 ? (
                                Object.keys(marksByCourse).map(courseId => (
                                    <div key={courseId} className="bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-6 rounded-xl shadow-lg">
                                        <h3 className="text-xl font-bold text-white mb-6">{getCourseName(courseId)}</h3>
                                        <motion.div layout className="flex flex-wrap gap-8 items-start">
                                            {marksByCourse[courseId]
                                                .sort((a, b) => b.weightage - a.weightage)
                                                .map(mark => (
                                                    <ExamMarkCircle 
                                                        key={mark.id} 
                                                        mark={mark} 
                                                        onEdit={() => onEditExamMark(mark)}
                                                        onDelete={() => onDeleteExamMark(mark.id)}
                                                    />
                                            ))}
                                            <div className="pl-8 border-l border-white/10">
                                                <TotalMarkCircle total={calculateTotalMarks(courseId)} />
                                            </div>
                                        </motion.div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 bg-white/10 saturate-150 backdrop-blur-xl rounded-xl border border-white/20 flex flex-col items-center justify-center">
                                    <PackageOpen size={48} className="text-slate-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-200">No Exam Marks Found</h3>
                                    <p className="text-slate-300">Add marks to see your performance breakdown.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* What If Calculator */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3"><BrainCircuit className="text-cyan-400" />What If? Calculator</h2>
                        </div>
                        <WhatIfCalculator allCourses={allCourses} />
                    </div>

                    {/* Academic Performance */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div 
                                className="relative flex items-center gap-2"
                                onMouseEnter={() => setIsTooltipVisible(true)}
                                onMouseLeave={() => setIsTooltipVisible(false)}
                            >
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><GraduationCap className="text-cyan-400" />Academic Performance</h2>
                                <HelpCircle size={18} className="text-slate-400 cursor-pointer" />
                                <AnimatePresence>
                                    {isTooltipVisible && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 mt-2 w-64 bg-black/50 saturate-150 backdrop-blur-xl border border-white/20 p-3 rounded-lg shadow-lg z-10"
                                        >
                                            <p className="font-bold text-white">SPI Calculation:</p>
                                            <p className="text-xs text-slate-300">Sum of (Course Credits × Grade Points) / Total Credits in a semester.</p>
                                            <p className="font-bold text-white mt-2">CPI Calculation:</p>
                                            <p className="text-xs text-slate-300">Sum of (All SPIs × Semester Credits) / Total Credits of all semesters.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-6 rounded-xl shadow-lg">
                            <div className="flex justify-between items-center bg-black/20 p-4 rounded-lg mb-4">
                                <p className="text-slate-200">Overall CPI</p><p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">{cpi}</p>
                            </div>
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                                {semesters.map(sem => {
                                    const isExpanded = expandedSemesters.has(sem.semester);
                                    return (
                                    <div key={sem.semester} className="bg-black/20 rounded-md overflow-hidden">
                                        <div className="flex justify-between items-center p-3 cursor-pointer hover:bg-black/30 transition-colors" onClick={() => toggleSemester(sem.semester)}>
                                            <p className="text-slate-200 font-medium">Semester {sem.semester}</p>
                                            <div className="flex items-center gap-3"><p className="text-white font-semibold">{sem.spi} SPI</p><ChevronDown size={20} className={`text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} /></div>
                                        </div>
                                        <AnimatePresence initial={false}>
                                            {isExpanded && (
                                                <motion.section key="content" initial="collapsed" animate="open" exit="collapsed" variants={{ open: { opacity: 1, height: "auto" }, collapsed: { opacity: 0, height: 0 } }} transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}>
                                                    <div className="p-3 space-y-2 border-t border-white/10">
                                                        {sem.courses.map(course => (
                                                            <div key={course.id} className="bg-black/20 p-3 rounded-lg grid grid-cols-12 items-center gap-4">
                                                                <p className="col-span-6 font-semibold text-white text-lg truncate">{course.name}</p>
                                                                <p className="col-span-2 text-center text-sm text-slate-400">{course.credits} Credits</p>
                                                                <p className="col-span-2 text-lg font-mono text-cyan-300 text-center">{course.grade || 'N/A'}</p>
                                                                <div className="col-span-2 flex justify-end gap-3">
                                                                    <button onClick={() => onEditGrade(course)} className="text-slate-400 hover:text-cyan-300 transition-colors"><Edit size={16} /></button>
                                                                    <button onClick={() => onDeleteCourse(course.id)} className="text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.section>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )})}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-96 flex-shrink-0">
                    <CpiGraph data={cpiGraphData} />
                </div>
            </div>
        </motion.div>
    );
};

export default PerformancePage;
