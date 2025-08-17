import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';

const AddEditContactModal = ({ isOpen, onClose, onSave, contactToEdit }) => {
    const [contact, setContact] = useState({ name: '', phone: '', email: '' });
    const isNew = !contactToEdit;

    useEffect(() => {
        if (isOpen) {
            setContact(contactToEdit || { name: '', phone: '', email: '' });
        }
    }, [isOpen, contactToEdit]);

    const handleChange = (field, value) => {
        setContact(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (contact.name.trim()) {
            onSave(contact, contactToEdit?.id || null);
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title={isNew ? "Add New Contact" : "Edit Contact"}>
            <form onSubmit={handleSubmit} className="space-y-4 w-80 md:w-96">
                <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                    <input
                        id="contactName"
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g., John Doe"
                        className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400"
                        required
                        autoFocus
                    />
                </div>
                <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-300 mb-2">Phone Number (Optional)</label>
                    <input
                        id="contactPhone"
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="e.g., +91 12345 67890"
                        className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400"
                    />
                </div>
                <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-300 mb-2">Email Address (Optional)</label>
                    <input
                        id="contactEmail"
                        type="email"
                        value={contact.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="e.g., john.doe@example.com"
                        className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400"
                    />
                </div>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors !mt-6"
                >
                    Save Contact
                </motion.button>
            </form>
        </GlassyModal>
    );
};

export default AddEditContactModal;