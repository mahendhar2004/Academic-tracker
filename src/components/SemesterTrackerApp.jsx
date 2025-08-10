import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc, collection, addDoc, query, deleteDoc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Plus, Trash2, X, Edit, ChevronDown, PackageOpen, UserCircle2, ClipboardList, GraduationCap, Flame, Coins, UploadCloud, AlertTriangle, LogOut } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// --- Firebase Configuration ---
// Your provided Firebase credentials
const firebaseConfig = {
    apiKey: "AIzaSyDb026Tf_OjFwg1hVCkWCRpjUJ8CJ84y5o",
    authDomain: "my-academic-tracker.firebaseapp.com",
    projectId: "my-academic-tracker",
    storageBucket: "my-academic-tracker.appspot.com",
    messagingSenderId: "665502100040",
    appId: "1:665502100040:web:b0d05cfa35887baf88c67d",
    measurementId: "G-SF32Q4KGHX"
};
const appId = 'default-app-id';

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- Constants ---
const GRADE_POINTS = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D+': 4, 'D': 3, 'F': 2 };
const GRADES = Object.keys(GRADE_POINTS);

// --- Helper Components ---
const GlassyModal = ({ isOpen, onClose, children, title, customClasses = "" }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`bg-gradient-to-br from-white/20 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 text-white ${customClasses}`}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">{title}</h2>
                        <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors"><X size={24} /></button>
                    </div>
                    {children}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => (
     <GlassyModal isOpen={isOpen} onClose={onClose} title="Confirm Action">
        <div className="space-y-6">
            <p className="text-slate-200 text-center">{message}</p>
            <div className="flex justify-center gap-4">
                <motion.button whileTap={{scale: 0.95}} onClick={onClose} className="bg-black/20 hover:bg-black/40 border border-white/20 text-white font-bold py-2 px-6 rounded-lg transition-colors">No</motion.button>
                <motion.button whileTap={{scale: 0.95}} onClick={onConfirm} className="bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-2 px-6 rounded-lg transition-colors">Yes</motion.button>
            </div>
        </div>
     </GlassyModal>
);

const ResetConfirmationModal = ({ isOpen, onClose, onConfirm }) => (
     <GlassyModal isOpen={isOpen} onClose={onClose} title="Reset All Data" customClasses="border-red-500/50 bg-red-900/10">
        <div className="space-y-6 text-center">
            <AlertTriangle size={48} className="mx-auto text-red-400" />
            <p className="text-slate-200">Are you sure you want to reset everything? All your courses, grades, and coins will be permanently deleted. This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
                <motion.button whileTap={{scale: 0.95}} onClick={onClose} className="bg-black/20 hover:bg-black/40 border border-white/20 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</motion.button>
                <motion.button whileTap={{scale: 0.95}} onClick={onConfirm} className="bg-red-500/50 hover:bg-red-500/80 border border-red-400/50 text-white font-bold py-2 px-6 rounded-lg transition-colors">Yes, Reset</motion.button>
            </div>
        </div>
     </GlassyModal>
);


const CoinReward = ({ amount, onComplete }) => (
    <motion.div
        initial={{ opacity: 1, y: 0, scale: 1 }}
        animate={{ opacity: 0, y: -50, scale: 0.8 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        onAnimationComplete={onComplete}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-yellow-400/20 border border-yellow-400 text-yellow-300 px-3 py-1 rounded-full text-sm font-bold"
    >
        <Coins size={16} /> +{amount}
    </motion.div>
);

// --- Modals ---
const AddCourseModal = ({ isOpen, onClose, onSave }) => {
    const [course, setCourse] = useState({ name: '', credits: '', semester: '' });

    useEffect(() => {
        if (isOpen) {
            setCourse({ name: '', credits: '', semester: '' });
        }
    }, [isOpen]);

    const handleChange = (field, value) => setCourse(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const creditsNum = parseFloat(course.credits);
        const semesterNum = parseInt(course.semester, 10);
        if (course.name.trim() && !isNaN(creditsNum) && creditsNum > 0 && !isNaN(semesterNum) && semesterNum > 0) {
            onSave({ ...course, credits: creditsNum, semester: semesterNum });
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title="Add New Course">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={course.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Course Name" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400" required />
                <div className="flex gap-4">
                    <input type="number" value={course.semester} onChange={(e) => handleChange('semester', e.target.value)} placeholder="Semester" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400" required min="1" />
                    <input type="number" value={course.credits} onChange={(e) => handleChange('credits', e.target.value)} placeholder="Credits" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400" required min="0.5" step="0.5" />
                </div>
                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors">Save Course</motion.button>
            </form>
        </GlassyModal>
    );
};

const AddGradeModal = ({ isOpen, onClose, onSave, allCourses }) => {
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('A+');

    const semesters = useMemo(() => [...new Set(allCourses.map(c => c.semester))].sort((a,b) => a-b), [allCourses]);
    const coursesInSemester = useMemo(() => allCourses.filter(c => c.semester === Number(selectedSemester)), [allCourses, selectedSemester]);

    useEffect(() => {
        if(isOpen) {
            setSelectedSemester('');
            setSelectedCourseId('');
            setSelectedGrade('A+');
        }
    }, [isOpen]);
    
    useEffect(() => {
        setSelectedCourseId('');
    }, [selectedSemester]);

    const handleSave = () => {
        if (selectedCourseId && selectedGrade) {
            onSave(selectedCourseId, selectedGrade);
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title="Add/Update Grade">
            <div className="space-y-4">
                <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                    <option value="">Select Semester</option>
                    {semesters.map(s => <option key={s} value={s} className="bg-slate-800">Semester {s}</option>)}
                </select>

                {selectedSemester && (
                    <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                        <option value="">Select Course</option>
                        {coursesInSemester.map(c => <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>)}
                    </select>
                )}

                {selectedCourseId && (
                    <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                        {GRADES.map(g => <option key={g} value={g} className="bg-slate-800">{g} ({GRADE_POINTS[g]})</option>)}
                    </select>
                )}
                
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={!selectedCourseId} className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Save Grade</motion.button>
            </div>
        </GlassyModal>
    );
};


// --- Page Components ---
const AttendancePage = ({ allCourses, onUpdate, onAddNew, onMarkAttendance, onTotalChange }) => {
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
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3"><ClipboardList className="text-cyan-400" />Current Semester Attendance (Sem {currentSemester || 'N/A'})</h2>
            {currentCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentCourses.map(course => <AttendanceCard key={course.id} course={course} onUpdate={onUpdate} onMarkAttendance={onMarkAttendance} onTotalChange={onTotalChange} isCurrentSemester={true} />)}
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
                                                    {courses.map(course => <AttendanceCard key={course.id} course={course} onUpdate={onUpdate} onMarkAttendance={onMarkAttendance} onTotalChange={onTotalChange} isCurrentSemester={false} />)}
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

const PerformancePage = ({ performanceData, onDeleteCourse, onAddGrade, expandedSemesters, toggleSemester }) => {
    const { cpi, semesters } = performanceData;
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><GraduationCap className="text-cyan-400" />Academic Performance</h2>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onAddGrade} className="flex-shrink-0 flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/25 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-white/25">
                    <Plus size={18} /> Add Grades
                </motion.button>
            </div>
            <div className="bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center bg-black/20 p-4 rounded-lg mb-4">
                    <p className="text-slate-200">Overall CPI</p><p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">{cpi}</p>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                    {semesters.length > 0 ? semesters.map(sem => {
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
                                                    <p className="col-span-3 text-center text-sm text-slate-400">{course.credits} Credits</p>
                                                    <p className="col-span-1 text-lg font-mono text-cyan-300 text-center">{course.grade || '-'}</p>
                                                    <div className="col-span-2 flex justify-end">
                                                        <button onClick={() => onDeleteCourse(course.id)} className="text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.section>
                                )}
                            </AnimatePresence>
                        </div>
                    )}) : <p className="text-slate-300 text-center py-4">No course data to calculate performance.</p>}
                </div>
            </div>
        </motion.div>
    );
};

const ProfilePage = ({ profileData, onSaveProfile, onResetData, onSignOut }) => {
    const [name, setName] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        setName(profileData.name || '');
        setImagePreview(profileData.imageUrl || '');
    }, [profileData]);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!auth.currentUser) return;
        setIsUploading(true);
        try {
            let newImageUrl = profileData.imageUrl;

            if (imageFile) {
                const storageRef = ref(storage, `profiles/${auth.currentUser.uid}/${imageFile.name}`);
                await uploadBytes(storageRef, imageFile);
                newImageUrl = await getDownloadURL(storageRef);
            }

            await onSaveProfile({ name, imageUrl: newImageUrl });

        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3"><UserCircle2 className="text-cyan-400" />Edit Profile</h2>
            <div className="bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-6 rounded-xl shadow-lg flex flex-col items-center gap-6">
                <div className="relative">
                    <img src={imagePreview || `https://placehold.co/128x128/111827/9ca3af?text=${name ? name.charAt(0).toUpperCase() : 'P'}`} alt="Profile Preview" className="w-32 h-32 rounded-full object-cover border-2 border-white/30" />
                    <label htmlFor="file-upload" className="absolute -bottom-2 -right-2 bg-cyan-500/80 hover:bg-cyan-500 text-white p-2 rounded-full cursor-pointer transition-colors">
                        <UploadCloud size={20} />
                    </label>
                    <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="w-full max-w-sm bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400 text-center" />
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={isUploading} className="w-full max-w-sm bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isUploading ? 'Saving...' : 'Save Profile'}
                </motion.button>
            </div>
            <div className="mt-8 flex flex-col items-center gap-4">
                 <motion.button whileTap={{ scale: 0.95 }} onClick={onSignOut} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <LogOut size={18} /> Sign Out
                </motion.button>
                 <motion.button whileTap={{ scale: 0.95 }} onClick={onResetData} className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-300 font-bold py-2 px-4 rounded-lg transition-colors">
                    <AlertTriangle size={18} /> Reset All Data
                </motion.button>
            </div>
        </motion.div>
    );
};

const AttendanceCard = ({ course, onUpdate, onMarkAttendance, onTotalChange, isCurrentSemester }) => {
    const { name, attended = 0, total = 0, streak = 0, lastAttended, attendanceCountToday = 0 } = course;
    const percentage = total > 0 ? ((attended / total) * 100).toFixed(1) : 0;
    const [reward, setReward] = useState(0);

    const today = new Date().toISOString().split('T')[0];
    const isAttendedTwiceToday = lastAttended === today && attendanceCountToday >= 2;

    const handleAttendClick = () => {
        const coinsEarned = onMarkAttendance(course);
        if (coinsEarned > 0) {
            setReward(coinsEarned);
        }
    };
    
    return (
        <div className="relative bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-4 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-white truncate pr-4">{name}</h3>
                <div className="flex items-center gap-1 text-orange-400" style={{ textShadow: '0 0 10px #f97316' }}>
                    <Flame size={18} />
                    <span className="font-bold text-lg">{streak}</span>
                </div>
            </div>
            <div className="flex justify-around items-center mb-3">
                <div className="text-center"><p className="text-slate-300 text-sm">Attended</p><div className="flex items-center gap-2 mt-1"><motion.button whileTap={{scale:0.9}} onClick={() => onUpdate(course.id, { attended: attended - 1 })} disabled={!isCurrentSemester || attended <= 0} className="bg-black/20 rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">-</motion.button><p className="text-white font-semibold text-xl w-10 text-center">{attended}</p><motion.button whileTap={{scale:0.9}} onClick={handleAttendClick} disabled={!isCurrentSemester || isAttendedTwiceToday} className="bg-black/20 rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">+</motion.button></div></div>
                <div className="text-center"><p className="text-slate-300 text-sm">Total</p><div className="flex items-center gap-2 mt-1"><motion.button whileTap={{scale:0.9}} onClick={() => onTotalChange(course, -1)} disabled={!isCurrentSemester || total <= attended} className="bg-black/20 rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">-</motion.button><p className="text-white font-semibold text-xl w-10 text-center">{total}</p><motion.button whileTap={{scale:0.9}} onClick={() => onTotalChange(course, 1)} disabled={!isCurrentSemester} className="bg-black/20 rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">+</motion.button></div></div>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2.5"><div className={`bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div></div>
            <p className={`text-right text-sm font-bold mt-2 ${percentage >= 75 ? 'text-green-300' : percentage >= 50 ? 'text-yellow-300' : 'text-red-400'}`}>{percentage}%</p>
            <AnimatePresence>
                {reward > 0 && <CoinReward amount={reward} onComplete={() => setReward(0)} />}
            </AnimatePresence>
        </div>
    );
};

const LoginPage = ({ onLogin }) => {
    return (
        <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full max-w-sm"
            >
                <div className="bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-8 rounded-2xl shadow-2xl text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Academic Tracker</h1>
                    <p className="text-slate-300 mb-8">Sign in to continue</p>
                    <div className="space-y-4">
                        <motion.button whileTap={{scale:0.95}} onClick={() => onLogin('google')} className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                            <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                            Sign in with Google
                        </motion.button>
                        <motion.button whileTap={{scale:0.95}} onClick={() => onLogin('facebook')} className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                            <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="currentColor" d="M22,12c0-5.52-4.48-10-10-10S2,6.48,2,12c0,4.84,3.44,8.87,8,9.8V15H8v-3h2V9.5C10,7.57,11.57,6,13.5,6H16v3h-2c-0.55,0-1,0.45-1,1v2h3v3h-3v6.95C18.05,21.45,22,17.19,22,12z"></path></svg>
                            Sign in with Facebook
                        </motion.button>
                         <motion.button whileTap={{scale:0.95}} onClick={() => onLogin('apple')} className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                            <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="currentColor" d="M17.2,2.8c-1.2-0.1-2.4,0.5-3.2,1.3c-0.8,0.9-1.5,2.3-1.9,3.7c-0.6-1.1-1-2.2-1-3.4c0-1.6,0.7-3.1,1.9-4.1C13.5,0,14.1,0,14.6,0c0.1,0,0.1,0,0.2,0c0.1,0,0.2,0,0.3,0c0.6,0.1,1.2,0.3,1.8,0.7c0.2,0.1,0.3,0.2,0.4,0.4c-0.1,0-0.2,0-0.3,0.1c-0.3,0.1-0.6,0.2-0.9,0.4c-0.8,0.4-1.5,1-1.9,1.8c-0.1,0.2,0,0.4,0.2,0.5c0.3,0.2,0.6,0.3,1,0.4c1.1,0.3,2.2,0.1,3.2-0.5c0.2-0.1,0.3-0.1,0.5-0.1c0.1,0,0.2,0,0.3,0C20.4,4.2,20.8,2,17.2,2.8z M12.3,10.6c-0.1-2.1,1.2-4.1,3-5c0.9-0.5,2-0.7,3-0.6c0.1,0,0.3-0.1,0.4-0.2c-0.7-0.5-1.5-0.8-2.4-0.8c-1.3-0.1-2.6,0.5-3.5,1.4c-1.5,1.5-2.2,3.6-2,5.7c0.1,1.2,0.5,2.4,1.2,3.4c0.7,1,1.6,1.8,2.8,2.2c1.1,0.4,2.3,0.3,3.4-0.2c0.3-0.1,0.6-0.3,0.8-0.5c0.1-0.1,0.1-0.2,0.1-0.4c-0.1,0-0.1,0-0.2,0c-1.4-0.2-2.7-0.9-3.7-2C12.7,12.9,12.3,11.8,12.3,10.6z M11.6,23.5c1.4,0,2.8-0.5,3.9-1.3c1.1-0.8,2-1.9,2.5-3.2c-0.1,0-0.2,0-0.4,0.1c-1.3,0.4-2.7,0.4-4-0.1c-2-0.8-3.5-2.4-4.2-4.4c-1.1-3,0.4-6.3,3.4-7.4c0.5-0.2,1-0.3,1.5-0.3c0.6,0,1.1,0.1,1.7,0.3c0.1,0,0.2,0,0.3-0.1c-0.1-0.1-0.2-0.1-0.2-0.2c-0.8-0.6-1.8-0.9-2.8-0.9c-3.2,0-6,2.5-6.3,5.7c-0.3,3.6,2.3,6.8,5.8,7.2C10.9,23.5,11.2,23.5,11.6,23.5z"></path></svg>
                            Sign in with Apple
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const Dashboard = ({ user, onSignOut }) => {
    const [allCourses, setAllCourses] = useState([]);
    const [profileData, setProfileData] = useState({ name: '', imageUrl: '', coins: 0 });
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState('attendance');
    const [expandedSemesters, setExpandedSemesters] = useState(new Set());
    const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, message: '', onConfirm: () => {} });

    useEffect(() => {
        if (!user) return;
        const unsubCourses = onSnapshot(query(collection(db, `artifacts/${appId}/users/${user.uid}/courses`)), (snapshot) => {
            setAllCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubProfile = onSnapshot(doc(db, `artifacts/${appId}/users/${user.uid}/profile/data`), (doc) => {
            if (doc.exists()) {
                setProfileData(doc.data());
            } else { // Set initial profile from auth provider
                setDoc(doc.ref, {
                    name: user.displayName || 'User',
                    imageUrl: user.photoURL || '',
                    coins: 0
                });
            }
        });
        return () => { unsubCourses(); unsubProfile(); };
    }, [user]);
    
    useEffect(() => {
        if (allCourses.length > 0 && expandedSemesters.size === 0) {
            const maxSemester = Math.max(...allCourses.map(c => c.semester).filter(Boolean), 0);
            if (maxSemester > 0) setExpandedSemesters(new Set([maxSemester]));
        }
    }, [allCourses, expandedSemesters.size]);

    const performanceData = useMemo(() => {
        const gradedCourses = allCourses.filter(c => c.grade && c.credits > 0);
        if (gradedCourses.length === 0) return { cpi: '0.0', semesters: [] };
        let cumulativeWeightedPoints = 0, cumulativeCredits = 0;
        const semestersMap = new Map();
        gradedCourses.forEach(course => {
            const weightedPoints = course.credits * (GRADE_POINTS[course.grade] || 0);
            cumulativeWeightedPoints += weightedPoints;
            cumulativeCredits += course.credits;
            if (!semestersMap.has(course.semester)) semestersMap.set(course.semester, { totalWeightedPoints: 0, totalCredits: 0, courses: [] });
            const semData = semestersMap.get(course.semester);
            semData.totalWeightedPoints += weightedPoints;
            semData.totalCredits += course.credits;
            semData.courses.push(course);
        });
        const cpi = (cumulativeCredits > 0 ? cumulativeWeightedPoints / cumulativeCredits : 0).toFixed(1);
        const semesters = Array.from(semestersMap.entries()).map(([semNum, data]) => ({
            semester: semNum,
            spi: (data.totalCredits > 0 ? data.totalWeightedPoints / data.totalCredits : 0).toFixed(1),
            courses: data.courses.sort((a, b) => a.name.localeCompare(b.name))
        })).sort((a, b) => b.semester - a.semester);
        return { cpi, semesters };
    }, [allCourses]);

    const handleSaveCourse = async (courseData) => {
        if (!user) return;
        const path = `artifacts/${appId}/users/${user.uid}/courses`;
        const dataToSave = { ...courseData, streak: 0, lastAttended: null, attended: 0, total: 0, attendanceCountToday: 0, grade: null };
        await addDoc(collection(db, path), dataToSave);
    };
    
    const handleSaveProfile = async (newProfileData) => {
        if (!user) return;
        await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/profile/data`), newProfileData, { merge: true });
    };

    const handleSaveGrade = async (courseId, grade) => {
        if (!user) return;
        const courseRef = doc(db, `artifacts/${appId}/users/${user.uid}/courses`, courseId);
        await updateDoc(courseRef, { grade });
    };

    const handleUpdateAttendance = async (courseId, updatedData) => {
        if (!user) return;
        await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/courses`, courseId), updatedData);
    };

    const handleTotalChange = (course, change) => {
        const newTotal = (course.total || 0) + change;
        if (newTotal < course.attended || newTotal < 0) return;

        const today = new Date().toISOString().split('T')[0];
        const attendedToday = course.lastAttended === today;

        let updateData = { total: newTotal };
        if (change > 0 && !attendedToday) {
            updateData.streak = 0;
        }
        handleUpdateAttendance(course.id, updateData);
    };

    const handleMarkAttendance = (course) => {
        if (!user) return 0;
        const today = new Date().toISOString().split('T')[0];
        const attendanceCountToday = course.lastAttended === today ? (course.attendanceCountToday || 0) : 0;

        if (attendanceCountToday >= 2) return 0;

        const performUpdate = (isDouble = false) => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toISOString().split('T')[0];

            const currentStreak = course.streak || 0;
            let newStreak = 1;
            if (attendanceCountToday === 0 && course.lastAttended === yesterdayString) {
                newStreak = currentStreak + 1;
            } else if (attendanceCountToday > 0) {
                newStreak = currentStreak;
            }
            
            const coinsToAdd = 10;

            const courseRef = doc(db, `artifacts/${appId}/users/${user.uid}/courses`, course.id);
            updateDoc(courseRef, {
                attended: (course.attended || 0) + 1,
                total: isDouble ? (course.total || 0) : (course.total || 0) + 1,
                streak: newStreak,
                lastAttended: today,
                attendanceCountToday: attendanceCountToday + 1
            });

            const profileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/data`);
            updateDoc(profileRef, {
                coins: (profileData.coins || 0) + coinsToAdd
            });

            return coinsToAdd;
        };

        if (attendanceCountToday === 1) {
            setConfirmationModal({
                isOpen: true,
                message: "Did you attend the class twice today?",
                onConfirm: () => {
                    performUpdate(true);
                    setConfirmationModal({ isOpen: false, message: '', onConfirm: () => {} });
                }
            });
            return 0;
        } else {
            return performUpdate(false);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!user) return;
        await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/courses`, courseId));
    };
    
    const handleResetData = async () => {
        if (!user) return;
        
        const coursesRef = collection(db, `artifacts/${appId}/users/${user.uid}/courses`);
        const coursesSnapshot = await getDocs(coursesRef);
        const batch = writeBatch(db);
        coursesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        const profileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/data`);
        await setDoc(profileRef, { name: user.displayName || 'User', coins: 0, imageUrl: user.photoURL || '' });

        setIsResetModalOpen(false);
        setCurrentPage('attendance');
    };

    const handleAddGradeClick = () => { setIsGradeModalOpen(true); };
    const handleAddNewCourse = () => { setIsCourseModalOpen(true); };
    const toggleSemester = (semester) => {
        setExpandedSemesters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(semester)) newSet.delete(semester);
            else newSet.add(semester);
            return newSet;
        });
    };

    const navItems = ['attendance', 'performance', 'profile'];

    return (
        <>
            <div className="min-h-screen bg-black text-white font-sans">
                <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-32">
                    <header className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCurrentPage('profile')} className="group">
                                {profileData.imageUrl ? (
                                    <img src={profileData.imageUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-white/20 group-hover:border-cyan-400 transition-colors" onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/64x64/111827/9ca3af?text=${profileData.name ? profileData.name.charAt(0).toUpperCase() : 'P'}`}} />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20 group-hover:border-cyan-400 transition-colors"><UserCircle2 className="w-8 h-8 text-slate-400" /></div>
                                )}
                            </motion.button>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome, {profileData.name || 'User'}</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-yellow-400 bg-black/20 px-3 py-2 rounded-lg border border-white/20">
                                <Coins size={20} />
                                <span className="font-bold text-lg">{profileData.coins || 0}</span>
                            </div>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddNewCourse} className="flex-shrink-0 flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/25 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-white/25">
                                <Plus size={18} /> <span className="hidden sm:inline">Add Course</span>
                            </motion.button>
                        </div>
                    </header>
                    
                    <main>
                        <AnimatePresence mode="wait">
                            <motion.div key={currentPage}>
                                {currentPage === 'attendance' && <AttendancePage allCourses={allCourses} onUpdate={handleUpdateAttendance} onAddNew={handleAddNewCourse} onMarkAttendance={handleMarkAttendance} onTotalChange={handleTotalChange} />}
                                {currentPage === 'performance' && <PerformancePage performanceData={performanceData} onDeleteCourse={handleDeleteCourse} onAddGrade={handleAddGradeClick} expandedSemesters={expandedSemesters} toggleSemester={toggleSemester} />}
                                {currentPage === 'profile' && <ProfilePage profileData={profileData} onSaveProfile={handleSaveProfile} setCurrentPage={setCurrentPage} onResetData={() => setIsResetModalOpen(true)} onSignOut={onSignOut} />}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>

                {/* Bottom Navigation */}
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm h-16 bg-black/50 saturate-150 backdrop-blur-xl border border-white/20 rounded-2xl flex justify-around items-center z-40">
                    <LayoutGroup>
                        {navItems.map(item => (
                            <motion.button key={item} onClick={() => setCurrentPage(item)} className={`relative flex flex-col items-center justify-center gap-1 transition-colors w-full h-full rounded-lg ${currentPage === item ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                                {item === 'attendance' && <ClipboardList size={22} />}
                                {item === 'performance' && <GraduationCap size={22} />}
                                {item === 'profile' && <UserCircle2 size={22} />}
                                <span className="text-xs font-medium capitalize">{item}</span>
                                {currentPage === item && (
                                    <motion.div className="absolute inset-0 bg-cyan-400/10 rounded-lg" layoutId="underline" />
                                )}
                            </motion.button>
                        ))}
                    </LayoutGroup>
                </div>
            </div>
            <AddCourseModal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} onSave={handleSaveCourse} />
            <AddGradeModal isOpen={isGradeModalOpen} onClose={() => setIsGradeModalOpen(false)} onSave={handleSaveGrade} allCourses={allCourses} />
            <ConfirmationModal 
                isOpen={confirmationModal.isOpen} 
                onClose={() => setConfirmationModal({ isOpen: false, message: '', onConfirm: () => {} })} 
                onConfirm={confirmationModal.onConfirm} 
                message={confirmationModal.message} 
            />
            <ResetConfirmationModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={handleResetData}
            />
        </>
    );
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async (providerName) => {
        let provider;
        if (providerName === 'google') provider = new GoogleAuthProvider();
        if (providerName === 'facebook') provider = new FacebookAuthProvider();
        if (providerName === 'apple') provider = new OAuthProvider('apple.com');
        
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Authentication failed:", error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    };

    if (loading) {
        return <div className="bg-black min-h-screen flex justify-center items-center text-white"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div></div>;
    }

    return (
        <>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            {user ? <Dashboard user={user} onSignOut={handleSignOut} /> : <LoginPage onLogin={handleLogin} />}
        </>
    );
}
