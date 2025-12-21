import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, RotateCcw, BrainCircuit, Target, Calculator, TrendingUp, CheckCircle2 } from 'lucide-react';
import GlassyModal from '../common/GlassyModal';

const GRADE_POINTS = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D+': 4, 'D': 3, 'F': 2 };
const GRADES = Object.keys(GRADE_POINTS);

const WhatIfModal = ({ isOpen, onClose, allCourses, onSave, initialData }) => {
    const [activeTab, setActiveTab] = useState('predict'); // 'predict' | 'target' | 'strategy'
    const [hypotheticalCourses, setHypotheticalCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({ name: '', credits: '', grade: 'A+' });
    const [scenarioName, setScenarioName] = useState('');
    const [targetCGPA, setTargetCGPA] = useState('');

    // Strategy Mode Inputs
    const [futureCredits, setFutureCredits] = useState('');
    const [selectedImprovements, setSelectedImprovements] = useState(new Set()); // Set of course IDs

    // Outputs
    const [predictedSPI, setPredictedSPI] = useState('0.0');
    const [predictedCPI, setPredictedCPI] = useState('0.0');
    const [requiredSPI, setRequiredSPI] = useState(null);
    const [strategyResult, setStrategyResult] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setHypotheticalCourses([]);
            setScenarioName('');
            setTargetCGPA('');
            setFutureCredits('');
            setSelectedImprovements(new Set());
            setActiveTab('predict');

            if (initialData) {
                setHypotheticalCourses(initialData.hypotheticalCourses || []);
                setScenarioName(initialData.name || '');
                if (initialData.type === 'strategy') {
                    setActiveTab('strategy');
                    setTargetCGPA(initialData.targetCGPA || '');
                    setFutureCredits(initialData.futureCredits || '');
                    setSelectedImprovements(new Set(initialData.selectedImprovements || []));
                } else if (initialData.type === 'target' || initialData.targetCGPA) {
                    setActiveTab('target');
                    setTargetCGPA(initialData.targetCGPA);
                }
            }
            setNewCourse({ name: '', credits: '', grade: 'A+' });
        }
    }, [isOpen, initialData]);

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

    const improvementCandidates = useMemo(() => {
        return allCourses.filter(c =>
            c.grade &&
            ['C', 'D+', 'D', 'F'].includes(c.grade) &&
            c.credits > 0
        ).sort((a, b) => GRADE_POINTS[a.grade] - GRADE_POINTS[b.grade]); // Worst grades first
    }, [allCourses]);

    // Calculation Effect
    useEffect(() => {
        let hypoWeightedPoints = 0;
        let hypoCredits = 0;

        // Common for Predict & Target
        hypotheticalCourses.forEach(course => {
            const gradeVal = activeTab === 'predict' ? GRADE_POINTS[course.grade] : 0;
            hypoWeightedPoints += parseFloat(course.credits) * (activeTab === 'predict' ? gradeVal : 0);
            hypoCredits += parseFloat(course.credits);
        });

        if (activeTab === 'predict') {
            const spi = (hypoCredits > 0 ? hypoWeightedPoints / hypoCredits : 0).toFixed(2);
            setPredictedSPI(spi);
            const totalWeightedPoints = existingData.cumulativeWeightedPoints + hypoWeightedPoints;
            const totalCredits = existingData.cumulativeCredits + hypoCredits;
            const cpi = (totalCredits > 0 ? totalWeightedPoints / totalCredits : 0).toFixed(2);
            setPredictedCPI(cpi);
            setRequiredSPI(null);
            setStrategyResult(null);
        } else if (activeTab === 'target') {
            if (!targetCGPA || hypoCredits === 0) {
                setRequiredSPI(null);
                setStrategyResult(null);
                return;
            }
            const target = parseFloat(targetCGPA);
            const totalCredits = existingData.cumulativeCredits + hypoCredits;
            const requiredTotalPoints = target * totalCredits;
            const requiredHypoPoints = requiredTotalPoints - existingData.cumulativeWeightedPoints;
            const reqSPI = (requiredHypoPoints / hypoCredits).toFixed(2);
            setRequiredSPI(reqSPI);
            setStrategyResult(null);
        } else if (activeTab === 'strategy') {
            // Strategy Calc
            setPredictedSPI('0.0');
            setPredictedCPI('0.0');
            setRequiredSPI(null);

            if (!targetCGPA) {
                setStrategyResult(null);
                return;
            }

            const target = parseFloat(targetCGPA);
            const futureCreds = parseFloat(futureCredits) || 0;

            // 1. Calculate base points (Current - points removed from retakes)
            let adjustedCurrentPoints = existingData.cumulativeWeightedPoints;
            // Wait, standard CGPA: if you retake, the old grade is gone, replaced by new? Or both appear?
            // Usually, for "Backlog/Improvement", the old grade is replaced in calculation or averaged.
            // Assuming REPLACEMENT for this calculation (Optimistic).

            // Calculate points to REMOVE (old grades of selected improvements)
            let retakeCredits = 0;
            improvementCandidates.forEach(course => {
                if (selectedImprovements.has(course.id)) {
                    adjustedCurrentPoints -= course.credits * GRADE_POINTS[course.grade];
                    // Credits remain in the "Current" bucket because they are completed courses, just grade changes?
                    // No, if we treat them as "New" courses effectively for the semester, we add them to "Future" load
                    // and keep total credits same.
                    // Actually, easiest mental model:
                    // Target * Total_Credits_Final = (Current_Points - Old_Retake_Points) + (Required_Avg * (Future_Credits + Retake_Credits))

                    retakeCredits += course.credits;
                }
            });

            // If we have F grades, they might not have contributed to cumulativeCredits yet if logic says passed only?
            // Implementation detail: existingData sums ALL graded credits. F is 2 points.

            const totalFinalCredits = existingData.cumulativeCredits + futureCreds; // Improvements don't add credits, just replace quality.

            const requiredTotalPoints = target * totalFinalCredits;
            const pointsAlreadyHave = adjustedCurrentPoints;
            const pointsNeeded = requiredTotalPoints - pointsAlreadyHave;

            const creditsToEarnPointsOn = futureCreds + retakeCredits;

            if (creditsToEarnPointsOn === 0) {
                setStrategyResult({ type: 'error', message: "Add future credits or select improvements." });
                return;
            }

            const requiredAvg = (pointsNeeded / creditsToEarnPointsOn).toFixed(2);
            setStrategyResult({
                requiredAvg,
                retakeCredits,
                futureCredits: futureCreds
            });
        }

    }, [hypotheticalCourses, existingData, activeTab, targetCGPA, futureCredits, selectedImprovements, improvementCandidates]);

    const handleSaveScenario = () => {
        if (!scenarioName.trim()) {
            alert("Please enter a name for this scenario.");
            return;
        }

        const dataToSave = {
            name: scenarioName,
            type: activeTab
        };

        if (activeTab === 'predict') {
            if (hypotheticalCourses.length === 0) {
                alert("Add at least one hypothetical course to save.");
                return;
            }
            dataToSave.hypotheticalCourses = hypotheticalCourses;
            dataToSave.predictedCPI = predictedCPI;
            dataToSave.predictedSPI = predictedSPI;
        } else if (activeTab === 'target') {
            if (hypotheticalCourses.length === 0) {
                alert("Add at least one hypothetical course to save.");
                return;
            }
            dataToSave.hypotheticalCourses = hypotheticalCourses;
            dataToSave.targetCGPA = targetCGPA;
            dataToSave.requiredSPI = requiredSPI;
        } else {
            // Strategy
            if (!targetCGPA || (!futureCredits && selectedImprovements.size === 0)) {
                alert("Please enter a target CGPA and either future credits or select improvement courses.");
                return;
            }
            dataToSave.targetCGPA = targetCGPA;
            dataToSave.futureCredits = futureCredits;
            dataToSave.selectedImprovements = Array.from(selectedImprovements);
            dataToSave.strategyResult = strategyResult;
        }

        onSave(dataToSave);
    };

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

    const toggleImprovement = (id) => {
        const newSet = new Set(selectedImprovements);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedImprovements(newSet);
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title="Academic Predictor" customClasses="max-w-xl w-full">
            <div className="space-y-6">

                {/* Tabs */}
                {/* Tabs */}
                <div className="flex bg-slate-200 dark:bg-black/40 p-1 rounded-xl">
                    <button onClick={() => setActiveTab('predict')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${activeTab === 'predict' ? 'bg-white dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        <Calculator size={16} /> Predict
                    </button>
                    <button onClick={() => setActiveTab('target')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${activeTab === 'target' ? 'bg-white dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        <Target size={16} /> Target
                    </button>
                    <button onClick={() => setActiveTab('strategy')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${activeTab === 'strategy' ? 'bg-white dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        <TrendingUp size={16} /> Strategy
                    </button>
                </div>

                {/* Content Area */}
                <div className="min-h-[200px]">
                    {activeTab === 'strategy' ? (
                        <div className="space-y-4">
                            {/* Strategy Inputs */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Target CGPA</label>
                                    <input type="number" value={targetCGPA} onChange={(e) => setTargetCGPA(e.target.value)} className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="9.0" step="0.01" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Next Sem Credits</label>
                                    <input type="number" value={futureCredits} onChange={(e) => setFutureCredits(e.target.value)} className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="e.g. 22" />
                                </div>
                            </div>

                            {/* Strategy Result */}
                            {strategyResult && (
                                <div className={`p-4 rounded-xl border ${strategyResult.requiredAvg > 10 ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                                    {strategyResult.type === 'error' ? (
                                        <p className="text-red-400 text-center text-sm">{strategyResult.message}</p>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-slate-600 dark:text-slate-300 text-xs uppercase font-bold tracking-wider mb-1">Required Average Grade</p>
                                            <p className={`text-5xl font-bold ${strategyResult.requiredAvg > 10 ? 'text-red-500 dark:text-red-400' : 'text-amber-500 dark:text-amber-400'}`}>{strategyResult.requiredAvg}</p>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
                                                Across {strategyResult.futureCredits} future credits + {strategyResult.retakeCredits} retake credits.
                                            </p>
                                            {strategyResult.requiredAvg > 10 && <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-bold">Impossible (Max 10.0)</p>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Improvement List */}
                            <div className="pt-2">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Improvement Opportunities</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar bg-slate-50 dark:bg-black/20 p-2 rounded-lg border border-slate-200 dark:border-white/10">
                                    {improvementCandidates.length === 0 ? (
                                        <p className="text-center text-slate-500 text-sm py-4">No subjects with grade C or below found. Great job!</p>
                                    ) : (
                                        improvementCandidates.map(course => (
                                            <div key={course.id} onClick={() => toggleImprovement(course.id)} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedImprovements.has(course.id) ? 'bg-amber-500/20 border-amber-500/50' : 'bg-white dark:bg-slate-800/50 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{course.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{course.credits} Credits • Current: <span className="text-red-500 dark:text-red-300 font-mono">{course.grade}</span></p>
                                                </div>
                                                {selectedImprovements.has(course.id) && <CheckCircle2 size={18} className="text-amber-500 dark:text-amber-400" />}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // PREDICT & TARGET MODES (Existing Layout reused)
                        <div className="space-y-6">
                            {/* Results */}
                            <div className="text-center">
                                {activeTab === 'predict' ? (
                                    <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                        <div><p className="text-slate-500 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider">Estimated SPI</p><p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-500">{predictedSPI}</p></div>
                                        <div><p className="text-slate-500 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider">Estimated CPI</p><p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-500">{predictedCPI}</p></div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-xl border border-slate-200 dark:border-white/10 space-y-4">
                                        <div className="flex items-center justify-center gap-4">
                                            <label className="text-slate-700 dark:text-slate-300 font-medium">Target CGPA:</label>
                                            <input type="number" value={targetCGPA} onChange={(e) => setTargetCGPA(e.target.value)} className="w-24 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 text-center text-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none" placeholder="8.5" step="0.01" max="10" />
                                        </div>
                                        {requiredSPI ? (
                                            <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Required SPI over selected subjects</p>
                                                <p className={`text-5xl font-bold ${requiredSPI > 10 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>{requiredSPI}</p>
                                                {requiredSPI > 10 && <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-bold">⚠️ Impossible (Max 10.0)</p>}
                                            </div>
                                        ) : <p className="text-slate-500 text-sm">Add subjects below.</p>}
                                    </div>
                                )}
                            </div>

                            {/* List */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center"><h3 className="font-semibold text-slate-900 dark:text-white">Hypothetical Subjects</h3><motion.button whileTap={{ scale: 0.95 }} onClick={() => setHypotheticalCourses([])} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"><RotateCcw size={14} />Reset List</motion.button></div>
                                <div className="space-y-2 h-40 overflow-y-auto no-scrollbar bg-slate-50 dark:bg-black/20 p-3 rounded-lg border border-slate-200 dark:border-white/10">
                                    <AnimatePresence>
                                        {hypotheticalCourses.map(course => (
                                            <motion.div key={course.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="group flex items-center justify-between bg-white dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-transparent">
                                                <p className="font-semibold text-slate-900 dark:text-white">{course.name} ({course.credits} Cr)</p>
                                                <div className="flex items-center gap-4">{activeTab === 'predict' && <p className="font-mono text-cyan-600 dark:text-cyan-300">{course.grade}</p>}<button onClick={() => handleDeleteCourse(course.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-opacity"><Trash2 size={16} /></button></div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {hypotheticalCourses.length === 0 && <div className="flex flex-col items-center justify-center h-full text-center"><BrainCircuit size={32} className="text-slate-400 dark:text-slate-600 mb-2" /><p className="text-slate-500 text-sm">Add a subject to calculated.</p></div>}
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleAddCourse} className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3">
                                    <input type="text" value={newCourse.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Subject Name" className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900 dark:text-white" required />
                                    <input type="number" value={newCourse.credits} onChange={(e) => handleChange('credits', e.target.value)} placeholder="Credits" className="w-full sm:w-28 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900 dark:text-white" required min="0.5" step="0.5" />
                                    {activeTab === 'predict' && <select value={newCourse.grade} onChange={(e) => handleChange('grade', e.target.value)} className="w-full sm:w-28 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900 dark:text-white">{GRADES.map(g => <option key={g} value={g} className="bg-white dark:bg-slate-800">{g}</option>)}</select>}
                                </div>
                                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"><Plus size={20} /> Add to Calculation</motion.button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Footer Save */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                    <div className="flex gap-3">
                        <input type="text" value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} placeholder="Scenario Name" className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-slate-900 dark:text-white" />
                        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSaveScenario} className="bg-green-600/50 hover:bg-green-600/80 border border-green-500/50 text-white font-bold px-6 py-3 rounded-lg transition-colors">
                            Save {activeTab === 'predict' ? 'Prediction' : activeTab === 'target' ? 'Goal' : 'Strategy'}
                        </motion.button>
                    </div>
                </div>

            </div>
        </GlassyModal>
    );
};

export default WhatIfModal;