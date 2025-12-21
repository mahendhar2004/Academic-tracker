import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, Check } from 'lucide-react';

const EditableList = ({ label, icon: Icon, items = [], onSave, placeholder }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState('');

    const handleAddItem = () => {
        if (newItem.trim()) {
            const updatedItems = [...items, newItem.trim()];
            onSave(updatedItems);
            setNewItem('');
            setIsAdding(false);
        }
    };

    const handleDeleteItem = (index) => {
        const updatedItems = items.filter((_, i) => i !== index);
        onSave(updatedItems);
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-3">
                    <Icon size={18} className="text-brand-secondary dark:text-cyan-400" />
                    {label}
                </h3>
                {!isAdding && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1 text-sm font-semibold text-brand-secondary dark:text-cyan-400 hover:text-brand-primary dark:hover:text-white transition-colors"
                    >
                        <Plus size={16} /> Add New
                    </motion.button>
                )}
            </div>

            <div className="space-y-2">
                <AnimatePresence>
                    {items.length > 0 ? items.map((item, index) => (
                        <motion.div
                            key={index}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="group flex items-center justify-between bg-slate-100 dark:bg-black/30 p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-black/50 transition-colors"
                        >
                            <span className="text-slate-700 dark:text-slate-200 truncate pr-4">{item}</span>
                            <button onClick={() => handleDeleteItem(index)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-opacity">
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    )) : !isAdding && (
                        <p className="text-slate-500 dark:text-slate-500 text-sm py-2">No {label.toLowerCase()} added yet.</p>
                    )}
                </AnimatePresence>

                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2 items-center"
                    >
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-cyan-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-cyan-400 text-slate-900 dark:text-white"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                        />
                        <button onClick={handleAddItem} className="p-2 rounded-lg text-slate-400 hover:text-green-500 dark:hover:text-green-400"><Check size={18} /></button>
                        <button onClick={() => setIsAdding(false)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400"><X size={18} /></button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default EditableList;