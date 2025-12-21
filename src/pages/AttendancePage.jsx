import { useOutletContext } from 'react-router-dom';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, PackageOpen, Plus, ChevronDown } from 'lucide-react';
import AttendanceCard from '../components/attendance/AttendanceCard';
import { useAttendanceData } from '../hooks/useAttendanceData';

const AttendancePage = () => {
    const {
        allCourses = [],
        handleAddNewCourse: onAddNew,
        handleEditCourseClick: onEditCourse,
        handleMarkAttendance: onMarkAttendance,
        handleTotalChange: onTotalChange,
        handleDecrementAttendance: onDecrementAttendance,
        handleDeleteCourse: onDeleteCourse,
        handleToggleCourseVisibility: onToggleVisibility
    } = useOutletContext();
    const [isHiddenVisible, setIsHiddenVisible] = useState(false);
    const [isPreviousVisible, setIsPreviousVisible] = useState(false);

    const { currentSemester, visibleCourses, hiddenCourses, previousSemesters } = useAttendanceData(allCourses);

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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <ClipboardList className="text-brand-secondary dark:text-cyan-400" />
                    Current Semester ({currentSemester || 'N/A'})
                </h2>
                {/* UPDATED: This button now adds a Subject, not a Class */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onAddNew}
                    className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-white/15 backdrop-blur-xl border border-slate-200 dark:border-white/25 text-brand-primary dark:text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-white/25 shadow-sm dark:shadow-none"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add Subject</span>
                </motion.button>
            </div>

            {allCourses.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleCourses.map(course => <AttendanceCard key={course.id} course={course} onMarkAttendance={onMarkAttendance} onTotalChange={onTotalChange} onDecrementAttendance={onDecrementAttendance} onDelete={() => onDeleteCourse(course.id, course.name)} onEdit={onEditCourse} onToggleVisibility={onToggleVisibility} isCurrentSemester={true} />)}
                    </div>

                    {hiddenCourses.length > 0 && (
                        <div className="mt-8">
                            <button className="w-full flex justify-between items-center text-left mb-4 hover:bg-black/5 dark:hover:bg-black/20 p-2 rounded-lg transition-colors group" onClick={() => setIsHiddenVisible(!isHiddenVisible)} aria-expanded={isHiddenVisible}>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Hidden Subjects</h2>
                                <ChevronDown size={24} className={`text-slate-400 dark:text-slate-300 transition-transform duration-300 group-hover:text-slate-600 dark:group-hover:text-white ${isHiddenVisible ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {isHiddenVisible && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {hiddenCourses.map(course => <AttendanceCard key={course.id} course={course} onMarkAttendance={onMarkAttendance} onTotalChange={onTotalChange} onDecrementAttendance={onDecrementAttendance} onDelete={() => onDeleteCourse(course.id, course.name)} onEdit={onEditCourse} onToggleVisibility={onToggleVisibility} isCurrentSemester={true} />)}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {previousSemesters.length > 0 && (
                        <div className="mt-12">
                            <button className="w-full flex justify-between items-center text-left mb-4 hover:bg-black/5 dark:hover:bg-black/20 p-2 rounded-lg transition-colors group" onClick={() => setIsPreviousVisible(!isPreviousVisible)} aria-expanded={isPreviousVisible}>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Previous Semesters</h2>
                                <ChevronDown size={24} className={`text-slate-400 dark:text-slate-300 transition-transform duration-300 group-hover:text-slate-600 dark:group-hover:text-white ${isPreviousVisible ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {isPreviousVisible && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
                                        <div className="space-y-4">
                                            {previousSemesters.map(([sem, courses]) => {
                                                const isExpanded = expandedSemesters.has(sem);
                                                return (
                                                    <div key={sem} className="bg-white dark:bg-black/20 border border-slate-200 dark:border-transparent rounded-md overflow-hidden shadow-sm dark:shadow-none">
                                                        <button className="w-full flex justify-between items-center p-3 text-left hover:bg-slate-50 dark:hover:bg-black/30 transition-colors" onClick={() => toggleSemester(sem)}>
                                                            <p className="text-slate-700 dark:text-slate-200 font-medium">Semester {sem}</p>
                                                            <ChevronDown size={20} className={`text-slate-400 dark:text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        <AnimatePresence initial={false}>
                                                            {isExpanded && (
                                                                <motion.section key="content" initial="collapsed" animate="open" exit="collapsed" variants={{ open: { opacity: 1, height: "auto" }, collapsed: { opacity: 0, height: 0 } }} transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}>
                                                                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-slate-100 dark:border-white/10">
                                                                        {courses.map(course => <AttendanceCard key={course.id} course={course} onMarkAttendance={onMarkAttendance} onTotalChange={onTotalChange} onDecrementAttendance={onDecrementAttendance} onDelete={() => onDeleteCourse(course.id, course.name)} onEdit={onEditCourse} onToggleVisibility={onToggleVisibility} isCurrentSemester={false} />)}
                                                                    </div>
                                                                </motion.section>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-24">
                    <PackageOpen size={64} className="mx-auto text-slate-400 dark:text-slate-600" />
                    <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">No Subjects Added Yet</h3>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Your journey begins here. Add your first subject to start tracking.</p>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onAddNew}
                        className="mt-6 flex items-center gap-2 mx-auto bg-cyan-500/80 hover:bg-cyan-500 border border-cyan-400/50 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        <Plus size={18} /> Add First Subject
                    </motion.button>
                </div>
            )}
        </motion.div>
    );
};

export default AttendancePage;