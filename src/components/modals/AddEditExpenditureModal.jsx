import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';
import { Timestamp } from 'firebase/firestore';
import { X } from 'lucide-react';

const AddEditExpenditureModal = ({ isOpen, onClose, onSave, expenditureToEdit, categories = [] }) => {
    const [expense, setExpense] = useState({ title: '', amount: '', category: 'Other', date: new Date().toISOString(), reason: '' });
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    const isNew = !expenditureToEdit;

    useEffect(() => {
        if (isOpen) {
            setIsAddingNewCategory(false);
            if (expenditureToEdit) {
                setExpense({
                    ...expenditureToEdit,
                    date: expenditureToEdit.date.toDate().toISOString(),
                    amount: expenditureToEdit.amount.toString(),
                    reason: expenditureToEdit.reason || '' 
                });
            } else {
                setExpense({ title: '', amount: '', category: 'Other', date: new Date().toISOString(), reason: '' });
            }
        }
    }, [isOpen, expenditureToEdit]);

    const handleChange = (field, value) => setExpense(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const amountNum = parseFloat(expense.amount);
        if (expense.title.trim() && expense.category.trim() && !isNaN(amountNum) && amountNum > 0 && expense.date) {
            onSave({ 
                ...expense, 
                amount: amountNum, 
                date: Timestamp.fromDate(new Date(expense.date)),
                category: expense.category.charAt(0).toUpperCase() + expense.category.slice(1)
            }, expenditureToEdit?.id || null);
            onClose();
        }
    };

    const handleAmountKeyDown = (e) => {
        if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', '.'].includes(e.key)) {
            return;
        }
        if (e.key.length === 1 && (isNaN(e.key) || e.key === ' ')) {
            e.preventDefault();
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
                        <input 
                            id="expenseAmount" 
                            type="number" 
                            value={expense.amount} 
                            onChange={(e) => handleChange('amount', e.target.value)} 
                            onKeyDown={handleAmountKeyDown}
                            placeholder="e.g., 500" 
                            className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" 
                            required 
                            min="0" 
                            step="any" 
                        />
                    </div>
                    <div className="w-1/2">
                        <label htmlFor="expenseCategory" className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                        {isAddingNewCategory ? (
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text"
                                    value={expense.category}
                                    onChange={(e) => handleChange('category', e.target.value)}
                                    className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    placeholder="New Category"
                                    autoFocus
                                    required
                                />
                                <button type="button" onClick={() => { setIsAddingNewCategory(false); handleChange('category', 'Other'); }} className="p-2 text-slate-400 hover:text-white transition-colors"><X size={18}/></button>
                            </div>
                        ) : (
                            <select 
                                id="expenseCategory" 
                                value={expense.category} 
                                onChange={(e) => {
                                    if (e.target.value === '__add_new__') {
                                        setIsAddingNewCategory(true);
                                        handleChange('category', '');
                                    } else {
                                        handleChange('category', e.target.value);
                                    }
                                }} 
                                className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            >
                                {categories.map(cat => <option key={cat} value={cat} className="bg-slate-800">{cat}</option>)}
                                <option value="__add_new__" className="bg-slate-700 text-cyan-400 font-semibold">Add New...</option>
                            </select>
                        )}
                    </div>
                </div>
                <div>
                    <label htmlFor="expenseReason" className="block text-sm font-medium text-slate-300 mb-2">Reason (Optional)</label>
                    <textarea 
                        id="expenseReason" 
                        value={expense.reason} 
                        onChange={(e) => handleChange('reason', e.target.value)} 
                        placeholder="e.g., Celebrated end of exams" 
                        className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none h-20"
                    />
                </div>
                <div>
                    <label htmlFor="expenseDate" className="block text-sm font-medium text-slate-300 mb-2">Date of Expense</label>
                    {/* UPDATED: Replaced DateTimePicker with standard input type="date" */}
                    <input
                        id="expenseDate"
                        type="date"
                        value={new Date(expense.date).toISOString().split('T')[0]}
                        onChange={(e) => {
                            // Create a new date object from the input value (YYYY-MM-DD)
                            // This ensures the time is set to the beginning of the day in UTC
                            const [year, month, day] = e.target.value.split('-').map(Number);
                            const newDate = new Date(Date.UTC(year, month - 1, day));
                            handleChange('date', newDate.toISOString());
                        }}
                        className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        required
                    />
                </div>
                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors !mt-6">
                    {isNew ? 'Add Expense' : 'Save Changes'}
                </motion.button>
            </form>
        </GlassyModal>
    );
};

export default AddEditExpenditureModal;
