import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calculator, Target, Plus, Trash2,
    RotateCcw, Sparkles, CheckCircle2,
    AlertCircle, Save, X, Lightbulb, ArrowRight, FolderOpen
} from 'lucide-react';
import { useStore } from '../store/useStore';
import firestoreService from '../services/firebaseService';

const GRADE_POINTS = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D+': 4, 'D': 3, 'F': 2 };
const GRADES = Object.keys(GRADE_POINTS);

const PredictorPage = () => {
    const { allCourses, user, scenarios, showToast } = useStore();

    const [activeTab, setActiveTab] = useState('predict'); // 'predict' | 'target' | 'strategy'

    // Core Data State
    const [hypotheticalCourses, setHypotheticalCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({ name: '', credits: '', grade: 'A+' });

    // Target & Strategy State
    const [targetCGPA, setTargetCGPA] = useState('');
    const [futureCredits, setFutureCredits] = useState('');
    const [selectedImprovements, setSelectedImprovements] = useState(new Set());

    // Results State
    const [predictedSPI, setPredictedSPI] = useState('0.0');
    const [predictedCPI, setPredictedCPI] = useState('0.0');
    const [requiredSPI, setRequiredSPI] = useState(null);
    const [strategyResult, setStrategyResult] = useState(null);

    // Save State
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [isLoadOpen, setIsLoadOpen] = useState(false);
    const [scenarioName, setScenarioName] = useState('');

    const existingData = useMemo(() => {
        const gradedCourses = allCourses.filter(c => c.grade && c.grade !== 'Not Published' && c.grade !== 'F' && c.credits > 0);
        let cumulativeWeightedPoints = 0;
        let cumulativeCredits = 0;
        gradedCourses.forEach(course => {
            cumulativeWeightedPoints += course.credits * (GRADE_POINTS[course.grade] || 0);
            cumulativeCredits += parseFloat(course.credits);
        });
        return { cumulativeWeightedPoints, cumulativeCredits };
    }, [allCourses]);

    const improvementCandidates = useMemo(() => {
        return allCourses.filter(c =>
            c.grade &&
            ['C', 'D+', 'D', 'F'].includes(c.grade) &&
            c.credits > 0
        ).sort((a, b) => GRADE_POINTS[a.grade] - GRADE_POINTS[b.grade]);
    }, [allCourses]);

    useEffect(() => {
        let hypoWeightedPoints = 0;
        let hypoCredits = 0;

        hypotheticalCourses.forEach(course => {
            const gradeVal = activeTab === 'predict' ? GRADE_POINTS[course.grade] : 0;
            const creds = parseFloat(course.credits) || 0;
            hypoWeightedPoints += creds * (activeTab === 'predict' ? gradeVal : 0);
            hypoCredits += creds;
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
            if (!targetCGPA) {
                setRequiredSPI(null);
                setStrategyResult(null);
                return;
            }
            const target = parseFloat(targetCGPA);
            const totalFinalCredits = existingData.cumulativeCredits + hypoCredits;
            const requiredTotalPoints = target * totalFinalCredits;

            const pointsNeededFromHypo = requiredTotalPoints - existingData.cumulativeWeightedPoints;

            if (hypoCredits > 0) {
                const reqSPI = (pointsNeededFromHypo / hypoCredits).toFixed(2);
                setRequiredSPI(reqSPI);
            } else {
                setRequiredSPI(null);
            }
            setStrategyResult(null);

        } else if (activeTab === 'strategy') {
            setPredictedSPI('0.0');
            setPredictedCPI('0.0');
            setRequiredSPI(null);

            if (!targetCGPA) {
                setStrategyResult(null);
                return;
            }

            const target = parseFloat(targetCGPA);
            const futureCreds = parseFloat(futureCredits) || 0;

            let adjustedCurrentPoints = existingData.cumulativeWeightedPoints;
            let retakeCredits = 0;

            improvementCandidates.forEach(course => {
                if (selectedImprovements.has(course.id)) {
                    adjustedCurrentPoints -= course.credits * (GRADE_POINTS[course.grade] || 0);
                    retakeCredits += parseFloat(course.credits);
                }
            });

            const totalFinalCredits = existingData.cumulativeCredits + futureCreds;
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
                futureCredits: futureCreds,
                type: 'success'
            });
        }
    }, [hypotheticalCourses, existingData, activeTab, targetCGPA, futureCredits, selectedImprovements, improvementCandidates]);

    const handleAddCourse = (e) => {
        e.preventDefault();
        if (newCourse.name && newCourse.credits > 0) {
            setHypotheticalCourses([...hypotheticalCourses, { ...newCourse, id: Date.now() }]);
            setNewCourse({ name: '', credits: '', grade: 'A+' });
        }
    };

    const handleDeleteCourse = (id) => {
        setHypotheticalCourses(hypotheticalCourses.filter(c => c.id !== id));
        showToast('Course removed', 'info');
    };

    const toggleImprovement = (id) => {
        const newSet = new Set(selectedImprovements);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedImprovements(newSet);
    };

    const handleSaveScenario = async () => {
        if (!scenarioName.trim()) return;

        const data = {
            name: scenarioName,
            type: activeTab,
            targetCGPA,
            futureCredits,
            selectedImprovements: Array.from(selectedImprovements),
            hypotheticalCourses,
            result: activeTab === 'strategy' ? strategyResult : { predictedSPI, predictedCPI, requiredSPI }
        };

        if (user) {
            try {
                await firestoreService.saveScenario(user.uid, data);
                setScenarioName('');
                setIsSaveOpen(false);
                showToast('Scenario saved successfully!', 'success');
            } catch (error) {
                console.error("Error saving scenario:", error);
                showToast('Failed to save scenario', 'error');
            }
        }
    };

    const handleLoadScenario = (scenario) => {
        setActiveTab(scenario.type);
        setScenarioName(scenario.name); // Optional: keep name?

        if (scenario.type === 'strategy') {
            setTargetCGPA(scenario.targetCGPA || '');
            setFutureCredits(scenario.futureCredits || '');
            setSelectedImprovements(new Set(scenario.selectedImprovements || []));
        } else {
            // For predict/target
            setHypotheticalCourses(scenario.hypotheticalCourses || []);
            if (scenario.type === 'target') {
                setTargetCGPA(scenario.targetCGPA || '');
            }
        }

        setIsLoadOpen(false);
        showToast(`Loaded scenario: ${scenario.name}`, 'success');
    };

    const handleDeleteScenario = async (id) => {
        if (user) {
            try {
                await firestoreService.deleteScenario(user.uid, id);
                showToast('Scenario deleted', 'info');
            } catch (error) {
                console.error("Error deleting scenario:", error);
                showToast('Failed to delete scenario', 'error');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 md:p-8 pb-24 md:pb-8 relative transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
                            Predictor
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Map your academic future with precision.</p>
                    </div>

                    <div className="flex items-center gap-4 self-start md:self-auto">
                        {/* Segmented Control */}
                        <div className="flex bg-white dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative">
                            {/* Animated Background Pill */}
                            {['predict', 'target', 'strategy'].map((tab) => {
                                if (activeTab === tab) {
                                    return (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bg-slate-900 dark:bg-white rounded-xl shadow-md z-0"
                                            style={{
                                                top: '0.375rem',
                                                bottom: '0.375rem',
                                                left: tab === 'predict' ? '0.375rem' : tab === 'target' ? 'calc(33.33% + 0.125rem)' : 'calc(66.66% - 0.125rem)',
                                                width: 'calc(33.33% - 0.25rem)'
                                            }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    );
                                }
                                return null;
                            })}

                            {[
                                { id: 'predict', label: 'Predict', icon: Calculator },
                                { id: 'target', label: 'Target', icon: Target },
                                { id: 'strategy', label: 'Strategy', icon: Lightbulb },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all w-32 ${activeTab === tab.id
                                        ? 'text-white dark:text-black'
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                        }`}
                                >
                                    <tab.icon size={16} strokeWidth={2.5} />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsSaveOpen(true)}
                            className="p-3.5 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-brand-primary dark:text-slate-400 dark:hover:text-cyan-400 transition-colors shadow-sm"
                            title="Save Scenario"
                        >
                            <Save size={20} />
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsLoadOpen(true)}
                            className="p-3.5 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-brand-primary dark:text-slate-400 dark:hover:text-cyan-400 transition-colors shadow-sm"
                            title="Load Scenario"
                        >
                            <FolderOpen size={20} />
                        </motion.button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                    {/* Left Column: Configuration */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-none relative overflow-hidden">
                            {/* Decorative gradient */}
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${activeTab === 'predict' ? 'from-cyan-400 to-blue-500' :
                                activeTab === 'target' ? 'from-purple-400 to-pink-500' :
                                    'from-amber-400 to-orange-500'
                                }`} />

                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className={`p-2 rounded-lg ${activeTab === 'predict' ? 'bg-cyan-500/10 text-cyan-500' :
                                    activeTab === 'target' ? 'bg-purple-500/10 text-purple-500' :
                                        'bg-amber-500/10 text-amber-500'
                                    }`}>
                                    {activeTab === 'predict' ? <Calculator size={20} /> : activeTab === 'target' ? <Target size={20} /> : <Lightbulb size={20} />}
                                </span>
                                {activeTab === 'strategy' ? 'Strategy Inputs' : 'Configuration'}
                            </h2>

                            {activeTab === 'strategy' ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase font-bold text-slate-500 tracking-wider ml-1">Dream CGPA</label>
                                        <input
                                            type="number"
                                            value={targetCGPA}
                                            onChange={(e) => setTargetCGPA(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                                            placeholder="9.0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase font-bold text-slate-500 tracking-wider ml-1">Next Sem Credits</label>
                                        <input
                                            type="number"
                                            value={futureCredits}
                                            onChange={(e) => setFutureCredits(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                                            placeholder="22"
                                        />
                                    </div>
                                </div>
                            ) : activeTab === 'target' ? (
                                <div className="space-y-4">
                                    <label className="text-xs uppercase font-bold text-slate-500 tracking-wider ml-1">Desired CGPA</label>
                                    <input
                                        type="number"
                                        value={targetCGPA}
                                        onChange={(e) => setTargetCGPA(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-4xl font-black text-center text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-300 dark:placeholder-slate-700"
                                        placeholder="8.5"
                                    />
                                    <p className="text-center text-slate-400 text-sm font-medium">Enter your goal to calculate the required SPI.</p>
                                </div>
                            ) : (
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-center">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                        Add your upcoming courses below to instantly predict your semester (SPI) and overall (CPI) performance.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Add Course (Predict/Target) */}
                        {activeTab !== 'strategy' && (
                            <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-none">
                                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Add Course</h3>
                                <form onSubmit={handleAddCourse} className="space-y-3">
                                    <input
                                        type="text"
                                        value={newCourse.name}
                                        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                        placeholder="Subject Name"
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 dark:focus:ring-cyan-500/50 transition-all font-medium placeholder-slate-400"
                                        required
                                    />
                                    <div className="flex gap-3">
                                        <input
                                            type="number"
                                            value={newCourse.credits}
                                            onChange={(e) => setNewCourse({ ...newCourse, credits: e.target.value })}
                                            placeholder="Cr"
                                            className="w-24 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 dark:focus:ring-cyan-500/50 transition-all font-medium placeholder-slate-400"
                                            required min="1" step="0.5"
                                        />
                                        {activeTab === 'predict' && (
                                            <div className="relative flex-1">
                                                <select
                                                    value={newCourse.grade}
                                                    onChange={(e) => setNewCourse({ ...newCourse, grade: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 dark:focus:ring-cyan-500/50 transition-all font-bold appearance-none cursor-pointer"
                                                >
                                                    {GRADES.map(g => <option key={g} value={g} className="bg-white dark:bg-slate-900">{g}</option>)}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <ArrowRight size={14} className="rotate-90" />
                                                </div>
                                            </div>
                                        )}
                                        <motion.button whileTap={{ scale: 0.95 }} type="submit" className="bg-brand-primary hover:bg-brand-secondary dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black rounded-xl px-4 transition-colors shadow-lg shadow-brand-primary/20 dark:shadow-white/10 flex items-center justify-center">
                                            <Plus size={24} />
                                        </motion.button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Strategy Improvement List */}
                        {activeTab === 'strategy' && (
                            <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-none max-h-[500px] flex flex-col">
                                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                                    Retake Candidates
                                    <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-extrabold">{improvementCandidates.length} Found</span>
                                </h3>
                                <div className="overflow-y-auto pr-2 space-y-2 custom-scrollbar flex-1 -mr-2">
                                    {improvementCandidates.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-40 text-center">
                                            <CheckCircle2 size={32} className="text-green-500 mb-2" />
                                            <p className="text-slate-900 dark:text-white font-medium">All Clear!</p>
                                            <p className="text-slate-500 text-xs">No grades C or below found.</p>
                                        </div>
                                    ) : (
                                        improvementCandidates.map(course => (
                                            <div
                                                key={course.id}
                                                onClick={() => toggleImprovement(course.id)}
                                                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${selectedImprovements.has(course.id)
                                                    ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-500/30'
                                                    : 'bg-slate-50 dark:bg-black/20 border-transparent hover:bg-slate-100 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                <div>
                                                    <p className={`font-bold text-sm ${selectedImprovements.has(course.id) ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>{course.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-slate-500 font-medium">{course.credits} Cr</span>
                                                        <span className="font-mono text-[10px] font-bold text-white bg-slate-900 dark:bg-white/10 px-1.5 py-0.5 rounded">{course.grade}</span>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedImprovements.has(course.id) ? 'bg-amber-500 border-amber-500 scale-110' : 'border-slate-200 dark:border-white/20 group-hover:border-slate-300 dark:group-hover:border-white/40'}`}>
                                                    {selectedImprovements.has(course.id) && <CheckCircle2 size={14} className="text-white" />}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Visualization & Lists */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Results Hero Card */}
                        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-8 md:p-12 shadow-2xl dark:shadow-none min-h-[350px] flex items-center justify-center">

                            {/* Background Effects */}
                            <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
                            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-gradient-to-br from-brand-primary/20 to-purple-500/20 blur-3xl opacity-50 rounded-full pointer-events-none" />
                            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-500/20 blur-3xl opacity-50 rounded-full pointer-events-none" />

                            {activeTab === 'strategy' ? (
                                <div className="relative z-10 w-full text-center">
                                    {strategyResult ? (
                                        strategyResult.type === 'error' ? (
                                            <div className="text-red-500 dark:text-red-400 font-bold text-lg bg-red-50 dark:bg-red-500/10 px-6 py-4 rounded-2xl border border-red-100 dark:border-red-500/20 inline-block">
                                                {strategyResult.message}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                                <div className="mb-8">
                                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-3">Target Average Grade</p>
                                                    <h2 className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                        {strategyResult.requiredAvg}
                                                    </h2>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                                    <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/5 flex flex-col items-center">
                                                        <span className="text-xs text-slate-500 uppercase font-bold mb-1">Future Credits</span>
                                                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{strategyResult.futureCredits}</span>
                                                    </div>
                                                    <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-5 border border-amber-100 dark:border-amber-500/20 flex flex-col items-center">
                                                        <span className="text-xs text-amber-600 dark:text-amber-400 uppercase font-bold mb-1">Retake Credits</span>
                                                        <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">{strategyResult.retakeCredits}</span>
                                                    </div>
                                                </div>

                                                {parseFloat(strategyResult.requiredAvg) > 10 ? (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                        className="mt-8 flex items-center gap-3 px-5 py-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-sm border border-red-500/20"
                                                    >
                                                        <AlertCircle size={20} />
                                                        Impossible (Avg &gt; 10.0)
                                                    </motion.div>
                                                ) : (
                                                    <p className="mt-8 text-slate-500 dark:text-slate-400 text-sm max-w-sm leading-relaxed">
                                                        You need to average <b>{strategyResult.requiredAvg}</b> grade points across your future and retake exams to hit <b>{targetCGPA}</b> CGPA.
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    ) : (
                                        <div className="opacity-40 flex flex-col items-center">
                                            <Sparkles size={64} className="mb-4 text-slate-400 dark:text-slate-600" />
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">Enter inputs to generate a strategy.</p>
                                        </div>
                                    )}
                                </div>

                            ) : requiredSPI !== null ? (
                                <div className="relative z-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-6">Required SPI</p>
                                    <div className="flex items-baseline justify-center">
                                        <span className={`text-8xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r ${parseFloat(requiredSPI) > 10 ? 'from-red-500 to-pink-600' : 'from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400'}`}>
                                            {requiredSPI}
                                        </span>
                                    </div>
                                    {parseFloat(requiredSPI) > 10 && <span className="text-red-500 font-bold text-sm mt-2">Impossible (&gt;10)</span>}
                                    <p className="mt-6 text-slate-500 dark:text-slate-400 font-medium text-lg">to reach a CGPA of <b className="text-slate-900 dark:text-white">{targetCGPA}</b></p>
                                </div>

                            ) : (
                                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 w-full animate-in fade-in zoom-in duration-300">
                                    <div className="flex flex-col items-center">
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Estimated SPI</p>
                                        <div className="text-7xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                                            {predictedSPI}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center md:border-l md:border-slate-200 dark:md:border-white/10">
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Projected CGPA</p>
                                        <div className="text-7xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-b from-brand-primary to-brand-secondary dark:from-cyan-400 dark:to-blue-500">
                                            {predictedCPI}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Hypothetical Course List */}
                        {activeTab !== 'strategy' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Hypothetical Courses</h3>
                                    {hypotheticalCourses.length > 0 && (
                                        <button onClick={() => setHypotheticalCourses([])} className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                                            <RotateCcw size={12} /> RESET
                                        </button>
                                    )}
                                </div>
                                {hypotheticalCourses.length === 0 ? (
                                    <div className="h-32 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/5">
                                        <p className="text-sm font-medium">No courses added yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <AnimatePresence>
                                            {hypotheticalCourses.map(course => (
                                                <motion.div
                                                    key={course.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex items-center justify-between group hover:shadow-md transition-all"
                                                >
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white leading-tight">{course.name}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{course.credits} Credits</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {activeTab === 'predict' && (
                                                            <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-lg">
                                                                {course.grade}
                                                            </span>
                                                        )}
                                                        <button onClick={() => handleDeleteCourse(course.id)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400 transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Save Modal */}
                <AnimatePresence>
                    {isSaveOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white/95 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl text-slate-900 dark:text-white"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Save Scenario</h3>
                                    <button onClick={() => setIsSaveOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Scenario Name</label>
                                        <input
                                            type="text"
                                            value={scenarioName}
                                            onChange={(e) => setScenarioName(e.target.value)}
                                            placeholder="e.g. Dean's List Plan"
                                            className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-cyan-500 transition-all font-medium"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => setIsSaveOpen(false)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-slate-600 dark:text-slate-300 font-bold transition-colors">Cancel</button>
                                        <button onClick={handleSaveScenario} className="flex-1 py-3.5 bg-brand-primary hover:bg-brand-secondary dark:bg-white dark:hover:bg-slate-200 rounded-xl text-white dark:text-black font-bold transition-colors">Save Scenario</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Load Modal */}
                <AnimatePresence>
                    {isLoadOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white/95 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col text-slate-900 dark:text-white"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Load Scenario</h3>
                                    <button onClick={() => setIsLoadOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3">
                                    {scenarios.length === 0 ? (
                                        <div className="text-center py-10 text-slate-500">
                                            <FolderOpen className="mx-auto mb-3 opacity-50" size={40} />
                                            <p>No saved scenarios found.</p>
                                        </div>
                                    ) : (
                                        scenarios.map(scenario => (
                                            <div key={scenario.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-brand-primary/50 transition-all group">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white">{scenario.name}</h4>
                                                        <p className="text-xs text-slate-500 uppercase font-bold mt-1">{scenario.type}</p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {scenario.createdAt?.seconds ? new Date(scenario.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleLoadScenario(scenario)}
                                                            className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-colors"
                                                            title="Load"
                                                        >
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteScenario(scenario.id)}
                                                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default PredictorPage;
