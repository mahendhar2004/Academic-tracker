import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, Check } from 'lucide-react';

const EditableList = ({ label, icon: Icon, items = [], onSave, placeholder, renderItem }) => {
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
        <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                    <Icon size={18} className="text-cyan-400" />
                    {label}
                </h4>
                {!isAdding && (
                    <motion.button whileTap={{scale:0.95}} onClick={() => setIsAdding(true)} className="flex items-center gap-1 text-sm text-slate-300 hover:text-white">
                        <Plus size={16} /> Add
                    </motion.button>
                )}
            </div>
            
            <div className="space-y-2">
                <AnimatePresence>
                    {items.map((item, index) => (
                        <motion.div 
                            key={index}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="group flex items-center justify-between bg-black/20 p-2 rounded-lg"
                        >
                            {/* FIX: Use the custom renderItem function if provided, otherwise default to a span */}
                            {renderItem ? renderItem(item, index) : <span className="text-slate-200 truncate">{item}</span>}
                            
                            <button onClick={() => handleDeleteItem(index)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-opacity">
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isAdding && (
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                        />
                        <button onClick={handleAddItem} className="bg-cyan-500/50 p-2 rounded-lg"><Check size={18} /></button>
                        <button onClick={() => setIsAdding(false)} className="bg-red-500/50 p-2 rounded-lg"><X size={18} /></button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditableList;