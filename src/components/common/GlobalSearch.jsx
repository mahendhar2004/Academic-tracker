import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, BookOpen, CheckSquare, Users, ArrowRight, Zap, PlusCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModalStore } from '../../store/useModalStore';

const GlobalSearch = ({ isOpen, onClose, allCourses = [], tasks = [], contacts = [] }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const navigate = useNavigate();
    const { openModal } = useModalStore();

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();

        // 1. Pages
        const pages = [
            { id: 'page-home', type: 'Page', title: 'Home', path: '/dashboard/home', icon: Command },
            { id: 'page-calendar', type: 'Page', title: 'Calendar', path: '/dashboard/calendar', icon: Command },
            { id: 'page-performance', type: 'Page', title: 'Performance', path: '/dashboard/performance', icon: Command },
            { id: 'page-attendance', type: 'Page', title: 'Attendance', path: '/dashboard/attendance', icon: Command },
            { id: 'page-planner', type: 'Page', title: 'Planner', path: '/dashboard/planner', icon: Command },
            { id: 'page-contacts', type: 'Page', title: 'Contacts', path: '/dashboard/contacts', icon: Command },
            { id: 'page-expenditure', type: 'Page', title: 'Expenditure', path: '/dashboard/expenditure', icon: Command },
            { id: 'page-profile', type: 'Page', title: 'Profile', path: '/dashboard/profile', icon: Command },
        ].filter(p => p.title.toLowerCase().includes(lowerQuery));

        // 2. Actions (Smart Commands)
        const actions = [
            { id: 'action-task', type: 'Action', title: 'Create New Task', modal: 'addTask', icon: PlusCircle },
            { id: 'action-course', type: 'Action', title: 'Add New Subject', modal: 'addCourse', icon: BookOpen },
            { id: 'action-grade', type: 'Action', title: 'Add Grade', modal: 'addGrade', icon: PlusCircle },
            { id: 'action-pomodoro', type: 'Action', title: 'Start Focus Timer', modal: 'pomodoro', icon: Clock },
            { id: 'action-expenditure', type: 'Action', title: 'Add Expenditure', modal: 'addExpenditure', icon: Zap },
        ].filter(a => a.title.toLowerCase().includes(lowerQuery) || (lowerQuery.includes('add') && a.title.toLowerCase().includes(lowerQuery.replace('add', '').trim())));

        // 3. Data Items
        const matchedCourses = allCourses
            .filter(c => (c.name || '').toLowerCase().includes(lowerQuery))
            .map(c => ({ id: `course-${c.id}`, type: 'Course', title: c.name, path: '/dashboard/performance', icon: BookOpen }));

        const matchedTasks = tasks
            .filter(t => (t.title || '').toLowerCase().includes(lowerQuery))
            .map(t => ({ id: `task-${t.id}`, type: 'Task', title: t.title, path: '/dashboard/planner', icon: CheckSquare }));

        const matchedContacts = contacts
            .filter(c => (c.name || '').toLowerCase().includes(lowerQuery))
            .map(c => ({ id: `contact-${c.id}`, type: 'Contact', title: c.name, path: '/dashboard/contacts', icon: Users }));

        // Priority Order: Actions -> Pages -> Current Data
        setResults([...actions, ...pages, ...matchedCourses, ...matchedTasks, ...matchedContacts]);
        setSelectedIndex(0);
    }, [query, allCourses, tasks, contacts]);

    const handleSelect = (item) => {
        if (item) {
            if (item.type === 'Action') {
                openModal(item.modal);
            } else {
                navigate(item.path);
            }
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results.length > 0) {
                handleSelect(results[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    };

    // Auto-scroll to selected item
    useEffect(() => {
        if (listRef.current && listRef.current.children[selectedIndex]) {
            listRef.current.children[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]"
                    >
                        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-200 dark:border-white/10">
                            <Search className="text-slate-400" size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type 'Task', 'Timer', or search..."
                                className="flex-1 bg-transparent text-slate-900 dark:text-white text-lg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                            />
                            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                                <span className="bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">esc</span> to close
                            </div>
                        </div>

                        <div ref={listRef} className="overflow-y-auto p-2 no-scrollbar">
                            {results.length > 0 ? (
                                <div className="space-y-1">
                                    {results.map((item, index) => {
                                        const Icon = item.icon;
                                        const isSelected = index === selectedIndex;
                                        return (
                                            <motion.div
                                                key={item.id}
                                                onClick={() => handleSelect(item)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-slate-100 dark:bg-cyan-500/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                            >
                                                <div className={`p-2 rounded-lg ${isSelected ? 'bg-white dark:bg-cyan-500/20 text-brand-secondary dark:text-cyan-300' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}>
                                                    <Icon size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`font-semibold ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>{item.title}</p>
                                                        {item.type === 'Action' && (
                                                            <span className="text-[10px] bg-brand-primary/10 dark:bg-cyan-500/20 text-brand-primary dark:text-cyan-400 px-1.5 py-0.5 rounded border border-brand-primary/30 dark:border-cyan-500/30 uppercase tracking-wider font-bold">Action</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500">{item.type}</p>
                                                </div>
                                                {isSelected && (
                                                    <ArrowRight size={18} className="text-brand-secondary dark:text-cyan-400" />
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                query.trim() && (
                                    <div className="py-12 text-center text-slate-500">
                                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No results found for "{query}"</p>
                                    </div>
                                )
                            )}
                            {!query.trim() && (
                                <div className="py-8 text-center text-slate-500">
                                    <p>Type to search or perform actions...</p>
                                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                                        <span className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded text-xs">New Task</span>
                                        <span className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded text-xs">Timer</span>
                                        <span className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded text-xs">Add Grade</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GlobalSearch;
