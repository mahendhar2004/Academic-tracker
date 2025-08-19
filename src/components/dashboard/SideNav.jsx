import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Home, ClipboardList, TrendingUp, Calendar, ListTodo, UserCircle2, Users, CreditCard, Menu, X } from 'lucide-react';
import Logo from '../../assets/Logo.png'; // Make sure this path is correct

const SideNav = ({ currentPage, setCurrentPage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredId, setHoveredId] = useState(null);

    const navItems = [
        { id: 'home', icon: Home },
        { id: 'attendance', icon: ClipboardList },
        { id: 'performance', icon: TrendingUp },
        { id: 'calendar', icon: Calendar },
        { id: 'planner', icon: ListTodo },
        { id: 'contacts', icon: Users },
        { id: 'expenditure', icon: CreditCard },
        { id: 'profile', icon: UserCircle2 }
    ];

    const handleNavClick = (item) => {
        setCurrentPage(item);
        setIsOpen(false);
    };

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
            {/* --- Mobile Logo --- */}
            <div className="md:hidden fixed top-6 left-6 z-30">
                <img src={Logo} alt="App Logo" className="w-12 h-12" />
            </div>

            {/* --- Desktop Navbar Wrapper --- */}
            <div className="hidden md:flex fixed left-4 top-14 flex-col items-center gap-6 z-40">
                <div 
                    onMouseLeave={() => setHoveredId(null)}
                    className="relative w-20 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full flex flex-col justify-center items-center gap-4 p-4"
                >
                    <LayoutGroup>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <motion.button 
                                    key={item.id} 
                                    onClick={() => handleNavClick(item.id)}
                                    onMouseEnter={() => setHoveredId(item.id)}
                                    className={`relative z-10 flex flex-col items-center justify-center transition-colors w-14 h-14 rounded-full ${currentPage === item.id ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    {(currentPage === item.id || hoveredId === item.id) && (
                                        <motion.div
                                            layoutId="desktop-highlight"
                                            className="absolute inset-0 bg-white/10 rounded-full"
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <motion.div whileHover={{ scale: 1.1 }}>
                                        <Icon size={24} />
                                    </motion.div>
                                    {/* UPDATED: Tooltip animation is now controlled by the 'animate' prop */}
                                    <motion.span
                                        variants={tooltipVariants}
                                        initial="hidden"
                                        animate={hoveredId === item.id ? "visible" : "hidden"}
                                        className="absolute left-full ml-4 px-3 py-1 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg text-sm capitalize whitespace-nowrap pointer-events-none"
                                    >
                                        {item.id}
                                    </motion.span>
                                </motion.button>
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
                                    <img src={Logo} alt="App Logo" className="w-10 h-10" />
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
                                        return(
                                            <motion.button 
                                                key={item.id}
                                                variants={mobileMenuItemVariants}
                                                onClick={() => handleNavClick(item.id)}
                                                className={`flex items-center gap-4 text-left p-3 rounded-lg w-full transition-colors ${currentPage === item.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-white/10'}`}
                                            >
                                                <Icon size={20} />
                                                <span className="font-semibold capitalize">{item.id}</span>
                                            </motion.button>
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