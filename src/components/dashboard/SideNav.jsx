import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Home, ClipboardList, GraduationCap, Calendar, ListTodo, UserCircle2, Users, CreditCard, Menu, X } from 'lucide-react';

const SideNav = ({ currentPage, setCurrentPage }) => {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { id: 'home', icon: Home },
        { id: 'attendance', icon: ClipboardList },
        { id: 'performance', icon: GraduationCap },
        { id: 'calendar', icon: Calendar },
        { id: 'planner', icon: ListTodo },
        { id: 'contacts', icon: Users },
        { id: 'expenditure', icon: CreditCard },
        { id: 'profile', icon: UserCircle2 }
    ];

    const handleNavClick = (item) => {
        setCurrentPage(item);
        setIsOpen(false); // Close mobile menu on selection
    };

    return (
        <>
            {/* --- Desktop Navbar (Visible on medium screens and up) --- */}
            <div className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 w-20 bg-black/50 saturate-150 backdrop-blur-xl border border-white/20 rounded-full flex-col justify-center items-center gap-4 p-4 z-40">
                <LayoutGroup>
                    {navItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <motion.button 
                                key={item.id} 
                                onClick={() => handleNavClick(item.id)} 
                                className={`relative flex flex-col items-center justify-center gap-1 transition-colors w-14 h-14 rounded-full group ${currentPage === item.id ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Icon size={24} />
                                {currentPage === item.id && (
                                    <motion.div 
                                        className="absolute inset-0 bg-cyan-500/20 border border-cyan-500/30 rounded-full" 
                                        layoutId="desktop-active-indicator" 
                                    />
                                )}
                                <span className="absolute left-full ml-4 px-3 py-1 bg-black/50 border border-white/20 rounded-lg text-sm capitalize opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {item.id}
                                </span>
                            </motion.button>
                        )
                    })}
                </LayoutGroup>
            </div>

            {/* --- Mobile Menu (Visible on small screens) --- */}
            <div className="md:hidden">
                {/* --- Hamburger Menu Button --- */}
                <button 
                    onClick={() => setIsOpen(true)}
                    className="fixed top-6 left-6 z-50 p-2 rounded-full bg-black/50 backdrop-blur-md text-white"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* --- Overlay --- */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                                className="fixed inset-0 bg-black/60 z-40"
                            />

                            {/* --- Menu Panel --- */}
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="fixed top-0 left-0 bottom-0 w-64 bg-slate-900/80 backdrop-blur-lg border-r border-white/10 p-6 z-50"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-xl font-bold text-white">Menu</h2>
                                    <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-white">
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {navItems.map(item => {
                                        const Icon = item.icon;
                                        return(
                                            <button 
                                                key={item.id}
                                                onClick={() => handleNavClick(item.id)}
                                                className={`flex items-center gap-4 text-left p-3 rounded-lg w-full transition-colors ${currentPage === item.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-white/10'}`}
                                            >
                                                <Icon size={20} />
                                                <span className="font-semibold capitalize">{item.id}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default SideNav;