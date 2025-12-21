import { useOutletContext } from 'react-router-dom';
import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import ContactCard from '../components/contacts/ContactCard';

const ContactsPage = () => {
    const {
        contacts,
        handleAddContactClick: onAddContact,
        handleEditContactClick: onEditContact,
        handleDeleteContact: onDeleteContact
    } = useOutletContext();
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <div className="flex justify-end items-center mb-10">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onAddContact}
                    title="Add Contact"
                    className="flex-shrink-0 flex items-center justify-center bg-white dark:bg-white/15 backdrop-blur-xl border border-slate-200 dark:border-white/25 text-brand-primary dark:text-white w-10 h-10 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-white/25 shadow-sm dark:shadow-none"
                >
                    <Plus size={20} />
                </motion.button>
            </div>

            {contacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {contacts.map(contact => (
                        <ContactCard
                            key={contact.id}
                            contact={contact}
                            onEdit={() => onEditContact(contact)}
                            onDelete={() => onDeleteContact(contact.id)}
                        />
                    ))}
                </div>
            ) : (
                // FIX: Replaced the large box with a simple paragraph
                <p className="text-center text-slate-500 dark:text-slate-400 mt-16">
                    No contacts found. Click the '+' icon to add your first contact.
                </p>
            )}
        </motion.div>
    );
};

export default ContactsPage;