import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';

const AddEditResumeModal = ({ isOpen, onClose, onSave, resumeToEdit }) => {
    const [resume, setResume] = useState({ role: '', link: '' });
    const isNew = !resumeToEdit;

    useEffect(() => {
        if (isOpen) {
            setResume(resumeToEdit || { role: '', link: '' });
        }
    }, [isOpen, resumeToEdit]);

    const handleChange = (field, value) => {
        setResume(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (resume.role.trim() && resume.link.trim()) {
            onSave(resume, resumeToEdit?.id || null);
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title={isNew ? "Add Resume Link" : "Edit Resume Link"}>
            <form onSubmit={handleSubmit} className="space-y-4 w-80 md:w-96">
                <div>
                    <label htmlFor="resumeRole" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Role</label>
                    <input
                        id="resumeRole"
                        type="text"
                        value={resume.role}
                        onChange={(e) => handleChange('role', e.target.value)}
                        placeholder="e.g., Software Engineer"
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900 dark:text-white"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="resumeLink" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Resume Link</label>
                    <input
                        id="resumeLink"
                        type="url"
                        value={resume.link}
                        onChange={(e) => handleChange('link', e.target.value)}
                        placeholder="https://example.com/resume.pdf"
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900 dark:text-white"
                        required
                    />
                </div>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors !mt-6"
                >
                    Save Resume
                </motion.button>
            </form>
        </GlassyModal>
    );
};

export default AddEditResumeModal;