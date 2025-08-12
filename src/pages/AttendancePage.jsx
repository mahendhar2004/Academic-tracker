import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, PackageOpen, Plus, ChevronDown, Eye, EyeOff } from 'lucide-react';
import AttendanceCard from '../components/attendance/AttendanceCard';

const AttendancePage = ({ allCourses, onUpdate, onAddNew, onMarkAttendance, onTotalChange, onDecrementAttendance, onDeleteCourse, performanceData }) => {
    const [isCpiVisible, setIsCpiVisible] = useState(true);

    const { currentSemester, currentCourses, previousSemesters } = useMemo(() => {
        if (allCourses.length === 0) {
            return { currentSemester: null, currentCourses: [], previousSemesters: [] };
        }
        const maxSemester = Math.max(...allCourses.map(c => c.semester).filter(Boolean), 0);
        const groupedBySem = allCourses.reduce((acc, course) => {
            (acc[course.semester] = acc[course.semester] || []).push(course);
            return acc;
        }, {});

        const sortedSemesters = Object.entries(groupedBySem).sort(([a], [b]) => b - a);
        
        const current = sortedSemesters.find(([sem]) => Number(sem) === maxSemester);
        const previous = sortedSemesters.filter(([sem]) => Number(sem) !== maxSemester);

        return {
            currentSemester: current ? current[0] : null,
            currentCourses: current ? current[1] : [],
            previousSemesters: previous,
        };
    }, [allCourses]);

    const [expandedSemesters, setExpandedSemesters] = useState(new Set());
    const toggleSemester = (semester) => {
        setExpandedSemesters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(semester)) newSet.delete(semester);
            else newSet.add(semester);
            return newSet;
        });
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <ClipboardList className="text-cyan-400" />
                    Current Semester ({currentSemester || 'N/A'})
                </h2>
                <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg border border-white/20">
                    <span className="font-semibold text-slate-300 text-sm">CPI:</span>
                    <span className="font-bold text-lg text-cyan-300 w-12 text-center">
                        {isCpiVisible ? (performanceData?.cpi || '0.0') : '–.–'}
                    </span>
                    <button onClick={() => setIsCpiVisible(!isCpiVisible)} className="text-slate-400 hover:text-white">
                        {isCpiVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            {currentCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentCourses.map(course => <AttendanceCard key={course.id} course={course} onUpdate={onUpdate} onMarkAttendance={onMarkAttendance} onTotalChange={onTotalChange} onDecrementAttendance={onDecrementAttendance} onDelete={() => onDeleteCourse(course.id, course.name)} isCurrentSemester={true} />)}
                </div>
            ) : (
                <div className="text-center py-16 bg-white/10 saturate-150 backdrop-blur-xl rounded-xl border border-white/20 flex flex-col items-center justify-center">
                    <PackageOpen size={48} className="text-slate-400 mb-4" /><h3 className="text-lg font-semibold text-slate-200">No Courses Found</h3>
                    <p className="text-slate-300 mb-4">Add course data to see your dashboard.</p>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={onAddNew} className="flex items-center gap-2 mx-auto bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-2 px-4 rounded-lg"><Plus size={18} /> Add Your First Course</motion.button>
                </div>
            )}

            {previousSemesters.length > 0 && (
                <div className="mt-12">
                     <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">Previous Semesters</h2>
                     <div className="space-y-4">
                        {previousSemesters.map(([sem, courses]) => {
                            const isExpanded = expandedSemesters.has(sem);
                            return (
                                <div key={sem} className="bg-black/20 rounded-md overflow-hidden">
                                    <div className="flex justify-between items-center p-3 cursor-pointer hover:bg-black/30 transition-colors" onClick={() => toggleSemester(sem)}>
                                        <p className="text-slate-200 font-medium">Semester {sem}</p>
                                        <ChevronDown size={20} className={`text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                    <AnimatePresence initial={false}>
                                        {isExpanded && (
                                            <motion.section key="content" initial="collapsed" animate="open" exit="collapsed" variants={{ open: { opacity: 1, height: "auto" }, collapsed: { opacity: 0, height: 0 } }} transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}>
                                                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/10">
                                                    {courses.map(course => <AttendanceCard key={course.id} course={course} onUpdate={onUpdate} onMarkAttendance={onMarkAttendance} onTotalChange={onTotalChange} onDecrementAttendance={onDecrementAttendance} onDelete={() => onDeleteCourse(course.id, course.name)} isCurrentSemester={false} />)}
                                                </div>
                                            </motion.section>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )
                        })}
                     </div>
                </div>
            )}
        </motion.div>
    );
};

export default AttendancePage;
