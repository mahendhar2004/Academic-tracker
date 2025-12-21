import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';
import { ChevronLeft } from 'lucide-react';

const GRADE_POINTS = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D+': 4, 'D': 3, 'F': 2 };
const GRADES = Object.keys(GRADE_POINTS);

const AddGradeModal = ({ isOpen, onClose, onSave, onSaveNewCourse, allCourses, courseToEdit, currentSemester }) => {
    // --- State Management ---
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState('select'); // 'select' or 'create'

    // State for selecting an existing course
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');

    // State for creating a new course
    const [newCourseName, setNewCourseName] = useState('');
    const [newCourseCredits, setNewCourseCredits] = useState('');

    // State for the final grade selection
    const [selectedGrade, setSelectedGrade] = useState('Not Published');

    // --- Memoized Data ---
    const semesters = useMemo(() => [...new Set(allCourses.map(c => c.semester))].sort((a, b) => a - b), [allCourses]);
    const coursesInSemester = useMemo(() => allCourses.filter(c => c.semester === Number(selectedSemester)), [allCourses, selectedSemester]);
    const selectedCourseForSummary = useMemo(() => allCourses.find(c => c.id === selectedCourseId), [allCourses, selectedCourseId]);

    // --- Effects ---
    // Reset state when the modal is opened
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setMode(courseToEdit ? 'select' : 'select');
            setSelectedGrade('Not Published');
            setNewCourseName('');
            setNewCourseCredits('');

            if (courseToEdit) {
                const course = allCourses.find(c => c.id === courseToEdit.id);
                setSelectedSemester(course?.semester || '');
                setSelectedCourseId(courseToEdit.id);
                setSelectedGrade(course?.grade || 'Not Published');
            } else {
                setSelectedSemester(currentSemester || '');
                setSelectedCourseId('');
            }
        }
    }, [isOpen, courseToEdit, allCourses, currentSemester]);

    // Reset course selection if semester changes
    useEffect(() => {
        if (!courseToEdit) {
            setSelectedCourseId('');
        }
    }, [selectedSemester, courseToEdit]);


    // --- Handlers ---
    const handleNextStep = () => {
        if ((mode === 'select' && selectedCourseId) || (mode === 'create' && newCourseName.trim() && newCourseCredits > 0 && selectedSemester >= 1)) {
            setStep(2);
        }
    };

    const handleSave = () => {
        if (mode === 'create') {
            const newCourseData = {
                name: newCourseName,
                credits: parseFloat(newCourseCredits),
                semester: Number(selectedSemester),
                grade: selectedGrade,
                attended: 0,
                total: 0
            };
            onSaveNewCourse(newCourseData);
        } else {
            onSave(selectedCourseId, selectedGrade);
        }
        onClose();
    };

    // --- Animation Variants ---
    const variants = {
        enter: { opacity: 0, scale: 0.95 },
        center: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
    };

    // UPDATED: Validation logic now checks if semester is 1 or greater
    const isNextDisabled = mode === 'select'
        ? !selectedCourseId
        : !(newCourseName.trim() && newCourseCredits > 0 && selectedSemester >= 1);

    return (
        <GlassyModal
            isOpen={isOpen}
            onClose={onClose}
            title={courseToEdit ? "Edit Grade" : "Add Grade"}
            customClasses="max-w-md w-full"
        >
            <div className="relative">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key={1}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="w-full space-y-4"
                        >
                            <h3 className="font-semibold text-slate-900 dark:text-white">Step 1: Find or Create a Subject</h3>

                            {!courseToEdit && (
                                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-black/20 rounded-lg">
                                    <button onClick={() => setMode('select')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'select' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Select Existing</button>
                                    <button onClick={() => setMode('create')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'create' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Create New</button>
                                </div>
                            )}

                            {mode === 'select' ? (
                                <>
                                    <select
                                        value={selectedSemester}
                                        onChange={(e) => setSelectedSemester(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900 dark:text-white"
                                    >
                                        <option value="">Select Semester</option>
                                        {semesters.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-800">Semester {s}</option>)}
                                    </select>
                                    <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} disabled={!selectedSemester} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 text-slate-900 dark:text-white">
                                        <option value="">Select Course</option>
                                        {coursesInSemester.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800">{c.name}</option>)}
                                    </select>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <input
                                        type="number"
                                        placeholder="Semester Number (e.g., 7)"
                                        value={selectedSemester}
                                        onChange={(e) => setSelectedSemester(e.target.value)}
                                        // UPDATED: Added min="1" to the input field
                                        min="1"
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900 dark:text-white"
                                    />
                                    <input type="text" placeholder="New Subject Name" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900 dark:text-white" />
                                    <input type="number" placeholder="Credits (e.g., 4)" value={newCourseCredits} onChange={(e) => setNewCourseCredits(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900 dark:text-white" />
                                </div>
                            )}

                            <motion.button whileTap={{ scale: 0.95 }} onClick={handleNextStep} disabled={isNextDisabled} className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed !mt-8">Next</motion.button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key={2}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="w-full space-y-4"
                        >
                            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                                <ChevronLeft size={16} /> Back
                            </button>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Step 2: Assign a Grade for:</h3>
                            <div className="bg-slate-100 dark:bg-black/20 p-3 rounded-lg text-center">
                                <p className="font-bold text-lg text-brand-primary dark:text-cyan-300">
                                    {mode === 'select' ? selectedCourseForSummary?.name : newCourseName}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Semester {selectedSemester}
                                </p>
                            </div>

                            <div className="grid grid-cols-4 gap-2 pt-2">
                                {GRADES.map(grade => (
                                    <button
                                        key={grade}
                                        onClick={() => setSelectedGrade(grade)}
                                        className={`py-3 text-center font-bold rounded-lg transition-colors ${selectedGrade === grade ? 'bg-cyan-500/80 text-white ring-2 ring-cyan-400' : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700/60'}`}
                                    >
                                        {grade}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setSelectedGrade('Not Published')}
                                className={`w-full py-3 text-center font-semibold rounded-lg transition-colors ${selectedGrade === 'Not Published' ? 'bg-slate-600/80 text-white ring-2 ring-slate-500' : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-700/60'}`}
                            >
                                Not Published Yet
                            </button>

                            <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors !mt-8">
                                Save Grade
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GlassyModal>
    );
};

export default AddGradeModal;