import React, { useState, useEffect } from 'react';
import { Edit, Check, X } from 'lucide-react';

const EditableField = ({ label, value, onSave, large = false, placeholder }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value || '');

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

    const placeholderText = placeholder || `Set your ${label}`;

    // --- In-place Editing UI ---
    if (isEditing) {
        // This layout is wrapped in a flex container to align with the display mode
        return (
            <div className="flex items-center gap-2 w-full py-2">
                <span className="w-44 flex-shrink-0 text-slate-400 font-medium">{label}:</span>
                <div className="flex-1 flex items-center gap-2">
                    <input 
                        type="text"
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        placeholder={placeholderText}
                        className={`w-full bg-slate-700/50 border border-cyan-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400 text-base`}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave();
                            if (e.key === 'Escape') handleCancel();
                        }}
                    />
                    <button onClick={handleSave} className="p-2 text-slate-400 hover:text-green-400"><Check size={18} /></button>
                    <button onClick={handleCancel} className="p-2 text-slate-400 hover:text-red-400"><X size={18} /></button>
                </div>
            </div>
        );
    }

    // --- Large Variant (for Name/Branch in Hero) ---
    if (large) {
        return (
            <div className="group relative flex items-center justify-center gap-2 w-full">
                <p className="truncate text-2xl font-bold text-white">
                    {value || <span className="text-slate-500">{placeholderText}</span>}
                </p>
                <button onClick={() => setIsEditing(true)} className="absolute -right-2 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit size={14} />
                </button>
            </div>
        )
    }

    // --- Default Inline Variant (Label: Value) ---
    return (
        <div className="group relative flex items-center w-full py-2">
            <span className="w-44 flex-shrink-0 text-slate-400 font-medium">{label}:</span>
            
            <div className="flex-1 flex justify-start items-center gap-2 pl-4">
                <p className="text-white font-semibold text-left truncate">
                    {value || <span className="text-slate-500">{placeholderText}</span>}
                </p>
                <div className="absolute right-0">
                    <button onClick={() => setIsEditing(true)} className="flex-shrink-0 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditableField;