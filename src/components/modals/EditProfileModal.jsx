import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';

const EditProfileModal = ({ isOpen, onClose, onSave, profileData }) => {
    const [details, setDetails] = useState({});

    useEffect(() => {
        if (isOpen) {
            setDetails(profileData || {});
        }
    }, [isOpen, profileData]);

    const handleChange = (field, value) => {
        setDetails(prev => ({ ...prev, [field]: value }));
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title="Edit Personal Details">
            <div className="space-y-4">
                <input type="text" value={details.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="Name" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400" />
                <input type="text" value={details.collegeName || ''} onChange={(e) => handleChange('collegeName', e.target.value)} placeholder="College Name" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400" />
                <input type="email" value={details.personalEmail || ''} onChange={(e) => handleChange('personalEmail', e.target.value)} placeholder="Personal Email" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400" />
                <input type="email" value={details.collegeEmail || ''} onChange={(e) => handleChange('collegeEmail', e.target.value)} placeholder="College Email" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400" />
                <input type="tel" value={details.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} placeholder="Phone Number" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400" />
                <select value={details.gender || ''} onChange={(e) => handleChange('gender', e.target.value)} className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                    <option value="">Select Gender</option>
                    <option value="Male" className="bg-slate-800">Male</option>
                    <option value="Female" className="bg-slate-800">Female</option>
                    <option value="Other" className="bg-slate-800">Other</option>
                </select>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => { onSave(details); onClose(); }} className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                    Save Details
                </motion.button>
            </div>
        </GlassyModal>
    );
};

export default EditProfileModal;
