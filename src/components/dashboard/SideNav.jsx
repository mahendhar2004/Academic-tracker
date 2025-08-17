import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
// UPDATED: Removed BookOpen, added ListTodo
import { Home, ClipboardList, GraduationCap, Calendar, ListTodo, UserCircle2, Users, CreditCard } from 'lucide-react';

const SideNav = ({ currentPage, setCurrentPage }) => {
    const navItems = ['home', 'attendance', 'performance', 'calendar', 'planner', 'contacts', 'expenditure', 'profile'];

    const icons = {
        home: Home,
        attendance: ClipboardList,
        performance: GraduationCap,
        calendar: Calendar,
        planner: ListTodo, // UPDATED: Correct icon is now used here
        contacts: Users,
        expenditure: CreditCard,
        profile: UserCircle2
    };

    return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 w-20 bg-black/50 saturate-150 backdrop-blur-xl border border-white/20 rounded-full flex flex-col justify-center items-center gap-4 p-4 z-40">
            <LayoutGroup>
                {navItems.map(item => {
                    const Icon = icons[item];
                    return (
                        <motion.button 
                            key={item} 
                            onClick={() => setCurrentPage(item)} 
                            className={`relative flex flex-col items-center justify-center gap-1 transition-colors w-14 h-14 rounded-full group ${currentPage === item ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Icon size={24} />
                            {currentPage === item && (
                                <motion.div 
                                    className="absolute inset-0 bg-cyan-500/20 border border-cyan-500/30 rounded-full" 
                                    layoutId="active-indicator" 
                                />
                            )}
                            <span className="absolute left-full ml-4 px-3 py-1 bg-black/50 border border-white/20 rounded-lg text-sm capitalize opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {item}
                            </span>
                        </motion.button>
                    )
                })}
            </LayoutGroup>
        </div>
    );
};

export default SideNav;