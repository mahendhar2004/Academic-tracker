import React, { useState, useEffect } from 'react';
import { Edit, Check, X } from 'lucide-react';

const EditableField = ({ label, value, onSave, large = false }) => {
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

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 w-full">
                <input 
                    type="text"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className={`w-full bg-slate-700/50 border border-cyan-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400 ${large ? 'text-2xl font-bold' : 'text-base'}`}
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                    }}
                />
                <button onClick={handleSave} className="p-2 text-slate-400 hover:text-green-400"><Check size={18} /></button>
                <button onClick={handleCancel} className="p-2 text-slate-400 hover:text-red-400"><X size={18} /></button>
            </div>
        );
    }

    return (
        <div className="group relative flex items-center gap-2 w-full">
            <p className={`truncate ${large ? 'text-2xl font-bold text-white' : 'text-base text-slate-300'}`}>
                {value || <span className="text-slate-500">{`Set your ${label}`}</span>}
            </p>
            <button onClick={() => setIsEditing(true)} className="absolute -right-2 -top-2 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit size={14} />
            </button>
        </div>
    );
};

export default EditableField;