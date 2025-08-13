import React, { useState } from 'react';
import { Edit, Check, X } from 'lucide-react';

const EditableField = ({ label, value, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value || '');

    const handleSave = () => {
        onSave(currentValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setCurrentValue(value);
        setIsEditing(false);
    };

    return (
        <div className="py-4 border-b border-white/10 group">
            <div className="flex justify-between items-center">
                <div>
                    <span className="text-sm text-slate-400">{label}</span>
                    {!isEditing ? (
                        <p className="text-white font-semibold text-lg">{value || '-'}</p>
                    ) : (
                        <input 
                            type="text" 
                            value={currentValue}
                            onChange={(e) => setCurrentValue(e.target.value)}
                            className="w-full bg-black/20 border border-white/20 rounded-lg px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400"
                        />
                    )}
                </div>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit size={16} />
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="text-slate-400 hover:text-green-400"><Check size={20} /></button>
                        <button onClick={handleCancel} className="text-slate-400 hover:text-red-400"><X size={20} /></button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditableField;
