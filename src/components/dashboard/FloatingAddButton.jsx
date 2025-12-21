import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ClipboardList, Edit, GraduationCap, Bell, CheckCircle2, Users, CreditCard } from 'lucide-react';

const FloatingAddButton = ({
    onAddCourse,
    onAddExamMarks,
    onAddGrade,
    onAddDeadline,
    onAddTask,
    onAddContact,
    onAddExpenditure
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const menuItems = [
        { label: 'Subject', icon: ClipboardList, action: onAddCourse },
        { label: 'Marks', icon: Edit, action: onAddExamMarks },
        { label: 'Grade', icon: GraduationCap, action: onAddGrade },
        { label: 'Deadline', icon: Bell, action: onAddDeadline },
        { label: 'Planner', icon: CheckCircle2, action: onAddTask },
        // FIX: Added new menu items
        { label: 'Contact', icon: Users, action: onAddContact },
        { label: 'Expense', icon: CreditCard, action: onAddExpenditure },
    ];

    const menuVariants = {
        closed: {
            opacity: 0,
            transition: { when: "afterChildren", staggerChildren: 0.05, staggerDirection: -1 }
        },
        open: {
            opacity: 1,
            transition: { when: "beforeChildren", staggerChildren: 0.07, delayChildren: 0.2 }
        },
    };

    const itemVariants = {
        closed: { y: 20, opacity: 0, transition: { duration: 0.2 } },
        open: { y: 0, opacity: 1, transition: { duration: 0.2 } },
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50" ref={menuRef}>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            variants={menuVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="absolute bottom-full right-0 mb-4 w-48 bg-white/90 dark:bg-black/50 saturate-150 backdrop-blur-xl border border-slate-200 dark:border-white/20 rounded-xl shadow-xl dark:shadow-2xl p-2"
                        >
                            {menuItems.map((item) => (
                                <motion.button
                                    key={item.label}
                                    variants={itemVariants}
                                    onClick={() => {
                                        item.action();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                >
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative z-20 flex-shrink-0 flex items-center justify-center bg-brand-primary dark:bg-cyan-500/80 backdrop-blur-xl border border-brand-primary/50 dark:border-cyan-400/50 text-white w-16 h-16 rounded-full shadow-lg transition-colors hover:bg-brand-primary/90 dark:hover:bg-cyan-500"
                >
                    <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                        <Plus size={28} />
                    </motion.div>
                </motion.button>
            </div>
        </>
    );
};

export default FloatingAddButton;