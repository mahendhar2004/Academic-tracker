import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, Check, FileText } from 'lucide-react';

const EditableResumeList = ({ items = [], onSave }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ title: '', link: '' });

    const handleAddItem = () => {
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
                <h3 className="font-bold text-lg text-white flex items-center gap-3">
                    <FileText size={18} className="text-cyan-400" />
                    Resumes
                </h3>
                {!isAdding && (
                    <motion.button 
                        whileTap={{scale:0.95}} 
                        onClick={() => setIsAdding(true)} 
                        className="flex items-center gap-1 text-sm font-semibold text-cyan-400 hover:text-white transition-colors"
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
                            className="group flex items-center justify-between bg-black/30 p-3 rounded-lg hover:bg-black/50 transition-colors"
                        >
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="truncate pr-4">
                                <span className="font-semibold text-white">{item.title}</span>
                                <p className="text-xs text-slate-400 truncate">{item.link}</p>
                            </a>
                            <button onClick={() => handleDeleteItem(index)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-opacity">
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    )) : !isAdding && (
                        <p className="text-slate-500 text-sm py-2">No resumes added yet.</p>
                    )}
                </AnimatePresence>

                {isAdding && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 bg-black/20 p-3 rounded-lg"
                    >
                        <input
                            type="text"
                            value={newItem.title}
                            onChange={(e) => setNewItem(prev => ({...prev, title: e.target.value}))}
                            placeholder="Role Title (e.g., Software Engineer)"
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            autoFocus
                        />
                        <input
                            type="url"
                            value={newItem.link}
                            onChange={(e) => setNewItem(prev => ({...prev, link: e.target.value}))}
                            placeholder="https://link-to-your-resume.pdf"
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setIsAdding(false)} className="p-2 rounded-lg text-slate-400 hover:text-red-400"><X size={18} /></button>
                            <button onClick={handleAddItem} className="p-2 rounded-lg text-slate-400 hover:text-green-400"><Check size={18} /></button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default EditableResumeList;