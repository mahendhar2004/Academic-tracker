import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, PackageOpen, Plus, ChevronDown } from 'lucide-react';
import AttendanceCard from '../components/attendance/AttendanceCard';
import { useAttendanceData } from '../hooks/useAttendanceData'; // Import the hook

const AttendancePage = ({ allCourses = [], onAddNew, onMarkAttendance, onTotalChange, onDecrementAttendance, onDeleteCourse, onToggleVisibility }) => {
    const [isHiddenVisible, setIsHiddenVisible] = useState(false);
    const [isPreviousVisible, setIsPreviousVisible] = useState(false);
    
    // The complex useMemo is replaced with our clean custom hook
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
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <ClipboardList className="text-cyan-400" />
                    Current Semester ({currentSemester || 'N/A'})
                </h2>
            </div>

            {visibleCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleCourses.map(course => <AttendanceCard key={course.id} course={course} onMarkAttendance={onMarkAttendance} onTotalChange={onTotalChange} onDecrementAttendance={onDecrementAttendance} onDelete={() => onDeleteCourse(course.id, course.name)} onToggleVisibility={onToggleVisibility} isCurrentSemester={true} />)}
                </div>
            ) : (
                <div className="text-center py-16 bg-white/10 saturate-150 backdrop-blur-xl rounded-xl border border-white/20 flex flex-col items-center justify-center">
                    <PackageOpen size={48} className="text-slate-400 mb-4" /><h3 className="text-lg font-semibold text-slate-200">No Courses Found</h3>
                    <p className="text-slate-300 mb-4">Add course data to see your dashboard.</p>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={onAddNew} className="flex items-center gap-2 mx-auto bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-2 px-4 rounded-lg"><Plus size={18} /> Add Your First Course</motion.button>
                </div>
            )}

            {hiddenCourses.length > 0 && (
                 <div className="mt-8">
                      <button className="w-full flex justify-between items-center text-left mb-4 hover:bg-black/20 p-2 rounded-lg transition-colors" onClick={() => setIsHiddenVisible(!isHiddenVisible)} aria-expanded={isHiddenVisible}>
                          <h2 className="text-xl font-bold text-white flex items-center gap-3">Hidden Subjects</h2>
                          <ChevronDown size={24} className={`text-slate-300 transition-transform duration-300 ${isHiddenVisible ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                      {isHiddenVisible && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {hiddenCourses.map(course => <AttendanceCard key={course.id} course={course} onMarkAttendance={onMarkAttendance} onTotalChange={onTotalChange} onDecrementAttendance={onDecrementAttendance} onDelete={() => onDeleteCourse(course.id, course.name)} onToggleVisibility={onToggleVisibility} isCurrentSemester={true} />)}
                              </div>
                          </motion.div>
                      )}
                      </AnimatePresence>
                 </div>
            )}

            {previousSemesters.length > 0 && (
                 <div className="mt-12">
                      <button className="w-full flex justify-between items-center text-left mb-4 hover:bg-black/20 p-2 rounded-lg transition-colors" onClick={() => setIsPreviousVisible(!isPreviousVisible)} aria-expanded={isPreviousVisible}>
                          <h2 className="text-xl font-bold text-white flex items-center gap-3">Previous Semesters</h2>
                          <ChevronDown size={24} className={`text-slate-300 transition-transform duration-300 ${isPreviousVisible ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                      {isPreviousVisible && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
                              <div className="space-y-4">
                                  {previousSemesters.map(([sem, courses]) => {
                                      const isExpanded = expandedSemesters.has(sem);
                                      return (
                                          <div key={sem} className="bg-black/20 rounded-md overflow-hidden">
                                                <button className="w-full flex justify-between items-center p-3 text-left hover:bg-black/30 transition-colors" onClick={() => toggleSemester(sem)}>
                                                    <p className="text-slate-200 font-medium">Semester {sem}</p>
                                                    <ChevronDown size={20} className={`text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                </button>
                                              <AnimatePresence initial={false}>
                                                  {isExpanded && (
                                                      <motion.section key="content" initial="collapsed" animate="open" exit="collapsed" variants={{ open: { opacity: 1, height: "auto" }, collapsed: { opacity: 0, height: 0 } }} transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}>
                                                          <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-white/10">
                                                              {courses.map(course => <AttendanceCard key={course.id} course={course} onMarkAttendance={onMarkAttendance} onTotalChange={onTotalChange} onDecrementAttendance={onDecrementAttendance} onDelete={() => onDeleteCourse(course.id, course.name)} onToggleVisibility={onToggleVisibility} isCurrentSemester={false} />)}
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
        </motion.div>
    );
};

export default AttendancePage;