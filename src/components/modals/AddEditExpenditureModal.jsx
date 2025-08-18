import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';
import DateTimePicker from '../common/DateTimePicker';
import { Timestamp } from 'firebase/firestore';

const CATEGORIES = ['Food', 'Transport', 'Subscriptions', 'Entertainment', 'Study', 'Utilities', 'Other'];

const AddEditExpenditureModal = ({ isOpen, onClose, onSave, expenditureToEdit }) => {
    const [expense, setExpense] = useState({ title: '', amount: '', category: 'Food', date: new Date().toISOString() });
    const isNew = !expenditureToEdit;

    useEffect(() => {
        if (isOpen) {
            if (expenditureToEdit) {
                setExpense({
                    ...expenditureToEdit,
                    date: expenditureToEdit.date.toDate().toISOString(), // Convert Firestore Timestamp to ISO string
                    amount: expenditureToEdit.amount.toString() // Convert number to string for input
                });
            } else {
                setExpense({ title: '', amount: '', category: 'Food', date: new Date().toISOString() });
            }
        }
    }, [isOpen, expenditureToEdit]);

    const handleChange = (field, value) => setExpense(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const amountNum = parseFloat(expense.amount);
        if (expense.title.trim() && !isNaN(amountNum) && amountNum > 0 && expense.date) {
            onSave({ 
                ...expense, 
                amount: amountNum, 
                date: Timestamp.fromDate(new Date(expense.date)) 
            }, expenditureToEdit?.id || null);
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title={isNew ? "Add New Expense" : "Edit Expense"}>
            <form onSubmit={handleSubmit} className="space-y-4 w-80 md:w-96">
                <div>
                    <label htmlFor="expenseTitle" className="block text-sm font-medium text-slate-300 mb-2">Expense Title</label>
                    <input id="expenseTitle" type="text" value={expense.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="e.g., Lunch with friends" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
                </div>
                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label htmlFor="expenseAmount" className="block text-sm font-medium text-slate-300 mb-2">Amount (₹)</label>
                        <input id="expenseAmount" type="number" value={expense.amount} onChange={(e) => handleChange('amount', e.target.value)} placeholder="e.g., 500" className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" required min="0" step="any" />
                    </div>
                    <div className="w-1/2">
                        <label htmlFor="expenseCategory" className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                        <select id="expenseCategory" value={expense.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full h-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                            {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-slate-800">{cat}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Date of Expense</label>
                    <DateTimePicker type="date" value={expense.date} onChange={(val) => handleChange('date', val)} />
                </div>
                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors !mt-6">
                    {isNew ? 'Add Expense' : 'Save Changes'}
                </motion.button>
            </form>
        </GlassyModal>
    );
};

export default AddEditExpenditureModal;