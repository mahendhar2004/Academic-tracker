import React, { useState, useEffect } from 'react';
import { Edit, Check, X } from 'lucide-react';

const EditableField = ({ label, value, onSave, inputType = 'text', options = [] }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value || '');

    // FIX: This effect ensures the component's value updates if the prop changes after initial render.
    useEffect(() => {
        setCurrentValue(value || '');
    }, [value]);

    const handleSave = () => {
        onSave(currentValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setCurrentValue(value || '');
        setIsEditing(false);
    };

    const handleEditClick = () => {
        setCurrentValue(value || (inputType === 'select' ? options[0] : ''));
        setIsEditing(true);
    };

    return (
        <div className="py-4 border-b border-white/10 group">
            <div className="flex justify-between items-end">
                <div>
                    <span className="text-sm text-slate-400">{label}</span>
                    {!isEditing ? (
                        <p className="text-white font-semibold text-lg">{value || '-'}</p>
                    ) : (
                        inputType === 'select' ? (
                            <select
                                value={currentValue}
                                onChange={(e) => setCurrentValue(e.target.value)}
                                className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                autoFocus
                            >
                                {options.map(opt => <option key={opt} value={opt} className="bg-slate-800">{opt}</option>)}
                            </select>
                        ) : (
                            <input 
                                type={label.toLowerCase().includes('age') || label.toLowerCase().includes('semester') ? 'number' : 'text'}
                                value={currentValue}
                                onChange={(e) => setCurrentValue(e.target.value)}
                                className="w-full bg-black/20 border border-white/20 rounded-lg px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400"
                                autoFocus
                            />
                        )
                    )}
                </div>
                {!isEditing ? (
                    <button onClick={handleEditClick} className="text-slate-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity pb-1">
                        <Edit size={16} />
                    </button>
                ) : (
                    <div className="flex gap-3 mb-1 flex-shrink-0">
                        <button onClick={handleSave} className="text-slate-400 hover:text-green-400"><Check size={20} /></button>
                        <button onClick={handleCancel} className="text-slate-400 hover:text-red-400"><X size={20} /></button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditableField;