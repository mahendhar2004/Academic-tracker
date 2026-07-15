import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, Check, FileText } from 'lucide-react';

const EditableResumeList = ({ items = [], onSave }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ title: '', link: '' });

    const handleAddItem = (e) => {
        e.preventDefault();
        if (newItem.title.trim() && newItem.link.trim()) {
            const updatedItems = [...items, { ...newItem, id: Date.now() }];
            onSave(updatedItems);
            setNewItem({ title: '', link: '' });
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
                    <FileText size={18} className="text-brand-secondary dark:text-cyan-400" />
                    Resumes
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
                            key={item.id || index}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="group flex items-center justify-between bg-slate-100 dark:bg-black/30 p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-black/50 transition-colors"
                        >
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="truncate pr-4">
                                <span className="font-semibold text-slate-900 dark:text-white">{item.title}</span>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.link}</p>
                            </a>
                            <button onClick={() => handleDeleteItem(index)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-opacity">
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    )) : !isAdding && (
                        <p className="text-slate-500 text-sm py-2">No resumes added yet.</p>
                    )}
                </AnimatePresence>

                {isAdding && (
                    <motion.form
                        onSubmit={handleAddItem}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 bg-slate-100 dark:bg-black/20 p-3 rounded-lg"
                    >
                        <input
                            type="text"
                            value={newItem.title}
                            onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Role Title (e.g., Software Engineer)"
                            className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-cyan-400 text-slate-900 dark:text-white"
                            autoFocus
                            required
                        />
                        <input
                            type="url"
                            value={newItem.link}
                            onChange={(e) => setNewItem(prev => ({ ...prev, link: e.target.value }))}
                            placeholder="https://link-to-your-resume.pdf"
                            className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-cyan-400 text-slate-900 dark:text-white"
                            required
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400"><X size={18} /></button>
                            <button type="submit" className="p-2 rounded-lg text-slate-400 hover:text-green-500 dark:hover:text-green-400"><Check size={18} /></button>
                        </div>
                    </motion.form>
                )}
            </div>
        </div>
    );
};

export default EditableResumeList;