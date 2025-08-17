import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Edit, Trash2 } from 'lucide-react';

const ContactCard = ({ contact, onEdit, onDelete }) => {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative bg-slate-900/70 saturate-150 backdrop-blur-3xl border border-white/25 p-6 rounded-xl shadow-lg flex flex-col gap-4"
        >
            <div className="flex items-center gap-3">
                <User size={18} className="text-cyan-400 flex-shrink-0" />
                <p className="font-bold text-lg text-white truncate">{contact.name}</p>
            </div>
            
            {contact.phone && (
                 <div className="flex items-center gap-3">
                    <Phone size={16} className="text-slate-400 flex-shrink-0" />
                    <a href={`tel:${contact.phone}`} className="text-slate-300 hover:text-white truncate">{contact.phone}</a>
                </div>
            )}

            {contact.email && (
                 <div className="flex items-center gap-3">
                    <Mail size={16} className="text-slate-400 flex-shrink-0" />
                    <a href={`mailto:${contact.email}`} className="text-slate-300 hover:text-white truncate">{contact.email}</a>
                </div>
            )}

            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={onEdit} className="p-2 rounded-md hover:bg-white/10 text-slate-400 hover:text-cyan-300">
                    <Edit size={16} />
                </button>
                <button onClick={onDelete} className="p-2 rounded-md hover:bg-white/10 text-slate-400 hover:text-red-400">
                    <Trash2 size={16} />
                </button>
            </div>
        </motion.div>
    );
};

export default ContactCard;