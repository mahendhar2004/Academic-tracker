import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Plus, Trash2, Edit, BrainCircuit, ChevronLeft, ChevronRight } from 'lucide-react';
import CpiGraph from '../components/performance/CpiGraph';
import SpiGraph from '../components/performance/SpiGraph';
import WhatIfModal from '../components/modals/WhatIfModal';
import { useStore } from '../store/useStore';
import { usePerformanceGraphs } from '../hooks/usePerformanceGraphs';

// --- Reusable Child Components ---

const ExamMarkCard = ({ mark, onEdit, onDelete }) => {
    return (
        <div className="bg-black/30 p-3 rounded-lg flex items-center gap-4 group">
            <div className="flex-1">
                <p className="font-semibold text-white truncate">{mark.examName}</p>
                <p className="text-xs text-slate-400">{mark.weightage}% Weightage</p>
            </div>
            <div className="flex items-center gap-3">
                <p className="font-mono text-lg text-cyan-300">{mark.marksSecured}<span className="text-sm text-slate-500">/{mark.maxMarks}</span></p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-cyan-300"><Edit size={14} /></button>
                    <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
            </div>
        </div>
    );
};

const SemesterCardSkeleton = () => (
    <div className="flex-shrink-0 w-48 p-4 rounded-xl bg-slate-800/50 border border-white/10 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-3/4 mb-3"></div>
        <div className="h-8 bg-slate-700 rounded w-1/2"></div>
    </div>
);


// --- Main Performance Page Component ---

const PerformancePage = ({ 
    performanceData, allCourses, examMarks, onDeleteCourse, onEditGrade, onAddGrade, 
    onAddExamMarks, onEditExamMark, onDeleteExamMark, currentSemester 
}) => {
    const { cpi, semesters } = performanceData;
    const { profileData, isDataLoaded } = useStore();
    
    const [isComponentLoading, setIsComponentLoading] = useState(true);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState(false);
    
    const timelineRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const { cpiGraphData, spiGraphData } = usePerformanceGraphs(semesters);

    const maxSemester = useMemo(() => {
        const highestCourseSem = allCourses.length > 0 ? Math.max(...allCourses.map(c => c.semester)) : 0;
        const profileSem = profileData.academic?.currentSemester || 0;
        return Math.max(highestCourseSem, profileSem, 1);
    }, [allCourses, profileData]);

    const allSemesterNumbers = useMemo(() => Array.from({ length: maxSemester }, (_, i) => i + 1), [maxSemester]);
    
    useEffect(() => {
        if (isDataLoaded) {
            const timer = setTimeout(() => setIsComponentLoading(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isDataLoaded]);

    useEffect(() => {
        if (selectedSemester || isComponentLoading) return;

        const currentSemData = semesters.find(s => s.semester === currentSemester);
        if (currentSemData) {
            setSelectedSemester(currentSemData);
        } else {
            setSelectedSemester({ semester: currentSemester, spi: "N/A", courses: [] });
        }
    }, [isComponentLoading, semesters, currentSemester, selectedSemester]);

    const semesterDetails = useMemo(() => {
        if (!selectedSemester) return { courses: [], marksByCourse: {} };

        const coursesForSemester = allCourses.filter(c => c.semester === selectedSemester.semester);
        const courseIds = coursesForSemester.map(c => c.id);
        const marksForSemester = examMarks.filter(m => courseIds.includes(m.courseId));

        const marksByCourse = marksForSemester.reduce((acc, mark) => {
            const course = coursesForSemester.find(c => c.id === mark.courseId);
            if (course) {
                (acc[course.name] = acc[course.name] || []).push(mark);
            }
            return acc;
        }, {});

        return { courses: coursesForSemester, marksByCourse };
    }, [selectedSemester, allCourses, examMarks]);
    
    const handleScroll = () => {
        if (timelineRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = timelineRef.current;
            setCanScrollLeft(scrollLeft > 5);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    const scroll = (direction) => {
        if (timelineRef.current) {
            const scrollAmount = timelineRef.current.clientWidth * 0.8;
            timelineRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };
    
    useEffect(() => {
        const timeline = timelineRef.current;
        if (timeline) {
            handleScroll();
            timeline.addEventListener('scroll', handleScroll);
            window.addEventListener('resize', handleScroll);
            return () => {
                timeline.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', handleScroll);
            };
        }
    }, [allSemesterNumbers]);

    const cardStyles = "relative overflow-hidden bg-black/50 backdrop-blur-2xl border border-white/10 p-6 rounded-2xl shadow-2xl";

    return (
        <>
            <WhatIfModal isOpen={isWhatIfModalOpen} onClose={() => setIsWhatIfModalOpen(false)} allCourses={allCourses} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-8">
                
                <div className={`${cardStyles} flex flex-col md:flex-row items-center justify-between gap-6`}>
                    <div className="absolute -top-1 -left-1 w-48 h-48 bg-cyan-500/10 rounded-full blur-[100px]"></div>
                    <div>
                        <p className="text-slate-300">Overall Cumulative Performance</p>
                        <h1 className="text-6xl font-bold text-white tracking-tighter">{cpi} <span className="text-4xl text-slate-400">CPI</span></h1>
                    </div>
                    <div className="flex gap-2">
                        <motion.button whileTap={{scale:0.95}} onClick={() => setIsWhatIfModalOpen(true)} className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold py-3 px-5 rounded-lg transition-colors hover:bg-white/20">
                            <BrainCircuit size={18} /> What If?
                        </motion.button>
                        <motion.button whileTap={{scale:0.95}} onClick={onAddGrade} className="flex items-center gap-2 bg-cyan-500/80 backdrop-blur-xl border border-cyan-400/50 text-white font-bold py-3 px-5 rounded-lg transition-colors hover:bg-cyan-500">
                            <Plus size={18} /> Add Grade
                        </motion.button>
                    </div>
                </div>

                <div className="relative pt-8">
                    <div className="absolute inset-x-0 top-0 h-full bg-radial-gradient(ellipse_at_top,_var(--tw-gradient-stops)) from-slate-900/80 via-black to-black pointer-events-none"></div>
                    <h2 className="text-xl font-bold text-white mb-4 px-4 lg:px-0">Your Academic Journey</h2>
                    
                    <div className="relative group">
                        <AnimatePresence>
                            {canScrollLeft && !isComponentLoading && (
                                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-24 bg-black/50 backdrop-blur-md rounded-r-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronLeft size={24} className="mx-auto" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                        <div ref={timelineRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-4 lg:px-0">
                            {isComponentLoading ? (
                                <>
                                    <SemesterCardSkeleton />
                                    <SemesterCardSkeleton />
                                    <SemesterCardSkeleton />
                                    <SemesterCardSkeleton />
                                </>
                            ) : (
                                allSemesterNumbers.map(semNum => {
                                    const semData = semesters.find(s => s.semester === semNum);
                                    const hasData = !!semData;
                                    return (
                                        <motion.div
                                            key={semNum}
                                            onClick={() => setSelectedSemester(semData || { semester: semNum, spi: "N/A" })}
                                            className={`relative cursor-pointer flex-shrink-0 w-48 p-4 rounded-xl border transition-all duration-300 ${selectedSemester?.semester === semNum ? 'border-cyan-400/80 bg-cyan-900/40' : (hasData ? 'border-white/10 bg-black/30 hover:bg-white/5' : 'border-dashed border-slate-700 bg-transparent hover:bg-slate-800/50')}`}
                                            layoutId={`semester-card-${semNum}`}
                                        >
                                            <p className="text-sm text-slate-400">Semester {semNum}</p>
                                            {hasData ? (
                                                <p className="text-3xl font-bold text-white">{semData.spi} <span className="text-xl text-slate-300">SPI</span></p>
                                            ) : (
                                                <p className="text-lg font-semibold text-slate-600 mt-2">No Data</p>
                                            )}
                                            {selectedSemester?.semester === semNum && (
                                                <motion.div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-400 rounded-full" layoutId="active-semester-indicator"></motion.div>
                                            )}
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                        <AnimatePresence>
                            {canScrollRight && !isComponentLoading && (
                                 <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-24 bg-black/50 backdrop-blur-md rounded-l-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                     <ChevronRight size={24} className="mx-auto" />
                                 </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                
                <div className="h-[420px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedSemester ? selectedSemester.semester : 'empty'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            {selectedSemester && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                                    <div className={`${cardStyles} flex flex-col`}>
                                        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2 flex-shrink-0"><GraduationCap size={20} className="text-cyan-400"/> Courses & Grades</h3>
                                        <div className="space-y-2 overflow-y-auto no-scrollbar flex-1 pr-2 -mr-2 min-h-0">
                                            {semesterDetails.courses.length > 0 ? semesterDetails.courses.map(course => (
                                                <div key={course.id} className="bg-black/30 p-3 rounded-lg flex justify-between items-center group">
                                                    <div>
                                                        <p className="font-semibold text-white truncate">{course.name}</p>
                                                        <p className="text-xs text-slate-400">{course.credits} Credits</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <p className="font-mono text-xl text-cyan-300">{course.grade || 'N/A'}</p>
                                                        <button onClick={() => onEditGrade(course)} className="p-1.5 rounded-md hover:bg-white/10 text-slate-500 hover:text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity"><Edit size={14} /></button>
                                                    </div>
                                                </div>
                                            )) : <p className="text-slate-500 text-center py-8">No courses with grades found for this semester.</p>}
                                        </div>
                                    </div>
                                    <div className={`${cardStyles} flex flex-col`}>
                                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                                            <h3 className="font-bold text-white text-lg flex items-center gap-2"><Edit size={20} className="text-cyan-400"/> Exam Marks</h3>
                                            <motion.button whileTap={{scale:0.95}} onClick={onAddExamMarks} className="text-sm flex items-center gap-1 text-slate-400 hover:text-white"><Plus size={14}/> Add Mark</motion.button>
                                        </div>
                                        <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-2 -mr-2 min-h-0">
                                            {Object.keys(semesterDetails.marksByCourse).length > 0 ? (
                                                Object.entries(semesterDetails.marksByCourse).map(([courseName, marks], index) => (
                                                    <div key={courseName}>
                                                        {index > 0 && <hr className="my-4 border-slate-800" />}
                                                        <h4 className="font-semibold text-cyan-300 mb-2">{courseName}</h4>
                                                        <div className="space-y-2">
                                                            {marks.map(mark => (
                                                                <ExamMarkCard key={mark.id} mark={mark} onEdit={() => onEditExamMark(mark)} onDelete={() => onDeleteExamMark(mark.id)} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <p className="text-slate-500 text-center py-8">No marks added for this semester.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {cpiGraphData && cpiGraphData.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-white/10">
                        <CpiGraph data={cpiGraphData} />
                        <SpiGraph data={spiGraphData} />
                    </div>
                ) : (
                    <div className="pt-8 border-t border-white/10 text-center">
                        <p className="text-slate-400 mt-8 py-16">
                            Add grades for at least one semester to see your performance trends.
                        </p>
                    </div>
                )}
            </motion.div>
        </>
    );
};
export default PerformancePage;