import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, ListTodo } from 'lucide-react';
import { usePlannerTasks } from '../hooks/usePlannerTasks';

// FIX: Update this path to match the actual location of your TaskCard.jsx file.
// For example, if TaskCard.jsx is in 'src/components/', use: import TaskCard from '../components/TaskCard';
import TaskCard from '../components/planner/TaskCard';

const PlannerPage = ({ tasks, onAddTask, onEditTask, onDeleteTask, onToggleComplete }) => {
    const [activeTab, setActiveTab] = useState('Short-term');
    const [completedVisible, setCompletedVisible] = useState(false);

    const { activeTasks, completedTasks } = usePlannerTasks(tasks, activeTab);
    
    useEffect(() => {
        setCompletedVisible(false);
    }, [activeTab]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <ListTodo className="text-cyan-400" /> 
                    Planner
                </h2>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onAddTask} title="Add New Plan" className="flex-shrink-0 flex items-center justify-center bg-white/15 backdrop-blur-xl border border-white/25 text-white w-10 h-10 rounded-lg transition-colors hover:bg-white/25">
                    <Plus size={20} />
                </motion.button>
            </div>
            
            <div className="flex border-b border-white/10 mb-6">
                {['Short-term', 'Long-term'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative px-4 py-2 text-sm font-semibold transition-colors ${activeTab === tab ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        {tab}
                        {activeTab === tab && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" layoutId="planner-tab-indicator" />}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="wait">
                    {activeTasks.length > 0 ? (
                        activeTasks.map(task => (
                            <TaskCard key={task.id} task={task} onToggleComplete={onToggleComplete} onEdit={onEditTask} onDelete={onDeleteTask} />
                        ))
                    ) : (
                        <motion.p 
                            key="empty-message" // Add a key for AnimatePresence
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-slate-500 text-center py-16"
                        >
                            No active {activeTab.toLowerCase()} plans.
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
            
            {completedTasks.length > 0 && (
                <div className="pt-4 mt-8 border-t border-white/10">
                    <button 
                        onClick={() => setCompletedVisible(!completedVisible)}
                        className="w-full flex justify-between items-center hover:bg-black/20 p-2 rounded-lg transition-colors"
                    >
                        <h4 className="font-semibold text-white">Completed ({completedTasks.length})</h4>
                        <ChevronDown size={20} className={`text-slate-300 transition-transform duration-300 ${completedVisible ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                        {completedVisible && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: 'auto', opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }} 
                                className="overflow-hidden"
                            >
                                <div className="space-y-4 pt-4">
                                    {completedTasks.map(task => 
                                        <TaskCard key={task.id} task={task} onToggleComplete={onToggleComplete} onEdit={onEditTask} onDelete={onDeleteTask} />
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default PlannerPage;