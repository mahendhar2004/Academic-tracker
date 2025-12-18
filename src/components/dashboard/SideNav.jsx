import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Home, ClipboardList, TrendingUp, Calendar, ListTodo, UserCircle2, Users, CreditCard, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const SideNav = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredId, setHoveredId] = useState(null);
    const location = useLocation();

    // Extract current section from path, e.g., /dashboard/attendance -> attendance
    const currentPath = location.pathname.split('/').pop();
    // Handle root dashboard path or specific paths
    const currentPage = location.pathname === '/dashboard' ? 'home' : currentPath;

    const navItems = [
        { id: 'home', icon: Home, path: '/dashboard/home' },
        { id: 'attendance', icon: ClipboardList, path: '/dashboard/attendance' },
        { id: 'performance', icon: TrendingUp, path: '/dashboard/performance' },
        { id: 'calendar', icon: Calendar, path: '/dashboard/calendar' },
        { id: 'planner', icon: ListTodo, path: '/dashboard/planner' },
        { id: 'contacts', icon: Users, path: '/dashboard/contacts' },
        { id: 'expenditure', icon: CreditCard, path: '/dashboard/expenditure' },
        { id: 'profile', icon: UserCircle2, path: '/dashboard/profile' }
    ];

    const tooltipVariants = {
        hidden: { opacity: 0, x: 10, transition: { duration: 0.2 } },
        visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 400, damping: 25, delay: 0.1 } }
    };

    const mobileMenuContainerVariants = {
        open: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
        closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
    };

    const mobileMenuItemVariants = {
        open: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
        closed: { x: -20, opacity: 0, transition: { duration: 0.2 } }
    };

    return (
        <>
            {/* --- Desktop Navbar Wrapper --- */}
            <div className="hidden md:flex fixed left-4 top-14 flex-col items-center gap-6 z-40">
                <div
                    onMouseLeave={() => setHoveredId(null)}
                    className="relative w-20 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full flex flex-col justify-center items-center gap-4 p-4"
                >
                    <LayoutGroup>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.id;
                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    onMouseEnter={() => setHoveredId(item.id)}
                                    className={`relative z-10 flex flex-col items-center justify-center transition-colors w-14 h-14 rounded-full ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    {(isActive || hoveredId === item.id) && (
                                        <motion.div
                                            layoutId="desktop-highlight"
                                            className="absolute inset-0 bg-white/10 rounded-full"
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <motion.div whileHover={{ scale: 1.1 }}>
                                        <Icon size={24} />
                                    </motion.div>
                                    <motion.span
                                        variants={tooltipVariants}
                                        initial="hidden"
                                        animate={hoveredId === item.id ? "visible" : "hidden"}
                                        className="absolute left-full ml-4 px-3 py-1 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg text-sm capitalize whitespace-nowrap pointer-events-none"
                                    >
                                        {item.id}
                                    </motion.span>
                                </Link>
                            );
                        })}
                    </LayoutGroup>
                </div>
            </div>

            {/* --- Mobile Menu --- */}
            <div className="md:hidden">
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed top-6 right-6 z-50 p-2 rounded-full bg-black/50 backdrop-blur-md text-white"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                            />
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                                className="fixed top-0 left-0 bottom-0 w-64 bg-slate-900/90 backdrop-blur-lg border-r border-white/10 p-6 z-50"
                            >
                                <div className="flex justify-between items-center mb-10">
                                    <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-white">
                                        <X size={24} />
                                    </button>
                                </div>
                                <motion.div
                                    className="flex flex-col gap-2"
                                    variants={mobileMenuContainerVariants}
                                    initial="closed"
                                    animate="open"
                                    exit="closed"
                                >
                                    {navItems.map(item => {
                                        const Icon = item.icon;
                                        const isActive = currentPage === item.id;
                                        return (
                                            <Link
                                                key={item.id}
                                                variants={mobileMenuItemVariants}
                                                to={item.path}
                                                onClick={() => setIsOpen(false)}
                                                className={`flex items-center gap-4 text-left p-3 rounded-lg w-full transition-colors ${isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-white/10'}`}
                                            >
                                                <Icon size={20} />
                                                <span className="font-semibold capitalize">{item.id}</span>
                                            </Link>
                                        )
                                    })}
                                </motion.div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};
export default SideNav;