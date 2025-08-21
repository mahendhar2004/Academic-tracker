import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, ArrowDownUp, Edit, RefreshCw, Trash2 } from 'lucide-react';
import ExpenditureChart from '../components/expenditure/ExpenditureChart';

const TransactionItem = ({ item, onEdit, onDelete, formatCurrency }) => {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="group flex justify-between items-center bg-black/20 hover:bg-black/40 p-3 rounded-lg transition-colors"
        >
            <div>
                <p className="font-semibold text-white">{item.title}</p>
                {item.reason && <p className="text-xs text-slate-500 italic mt-0.5">{item.reason}</p>}
                <p className="text-sm text-slate-400 mt-1">{item.category}</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-bold text-red-400">{formatCurrency(item.amount)}</p>
                    <p className="text-xs text-slate-500">{item.date.toDate().toLocaleDateString('en-GB')}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-1.5 rounded-md text-slate-400 hover:text-cyan-300"><Edit size={16} /></button>
                    <button onClick={onDelete} className="p-1.5 rounded-md text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
                </div>
            </div>
        </motion.div>
    );
};

const ExpenditurePage = ({ 
    expenditures = [], 
    onAddExpenditure, 
    onDeleteExpenditure,
    onEditExpenditure,
    // ADDED: Prop for the reset handler
    onResetExpenditures
}) => {
    const [sortBy, setSortBy] = useState('date_desc');

    const { total, byCategory, sortedTransactions } = useMemo(() => {
        const totalAmount = expenditures.reduce((sum, item) => sum + item.amount, 0);
        
        const categoryMap = expenditures.reduce((acc, item) => {
            const existing = acc[item.category] || { value: 0 };
            acc[item.category] = { value: existing.value + item.amount };
            return acc;
        }, {});

        const categoryData = Object.entries(categoryMap).map(([name, data]) => ({ name, value: data.value }))
            .sort((a, b) => b.value - a.value);

        const allSorted = [...expenditures].sort((a, b) => {
            switch (sortBy) {
                case 'date_asc': return a.date.toMillis() - b.date.toMillis();
                case 'amount_desc': return b.amount - a.amount;
                case 'amount_asc': return a.amount - b.amount;
                default: return b.date.toMillis() - a.date.toMillis();
            }
        });

        return { total: totalAmount, byCategory: categoryData, sortedTransactions: allSorted };
    }, [expenditures, sortBy]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><CreditCard className="text-cyan-400" />Expenditure</h2>
                
                {/* ADDED: Container for action buttons */}
                <div className="flex items-center gap-4">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={onResetExpenditures} title="Reset All Expenses" className="flex-shrink-0 flex items-center justify-center bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-300 w-10 h-10 rounded-lg transition-colors"><RefreshCw size={18} /></motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={onAddExpenditure} title="Add Expenditure" className="flex-shrink-0 flex items-center justify-center bg-white/15 backdrop-blur-xl border border-white/25 text-white w-10 h-10 rounded-lg transition-colors hover:bg-white/25"><Plus size={20} /></motion.button>
                </div>
            </div>

            {expenditures.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 h-[500px]">
                        <ExpenditureChart data={byCategory} total={total} />
                    </div>
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white text-lg">All Transactions</h3>
                            <div className="relative">
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-black/20 text-white text-sm rounded-md pl-3 pr-8 py-1 appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                    <option value="date_desc" className="bg-slate-800">Date (Newest)</option>
                                    <option value="date_asc" className="bg-slate-800">Date (Oldest)</option>
                                    <option value="amount_desc" className="bg-slate-800">Amount (High-Low)</option>
                                    <option value="amount_asc" className="bg-slate-800">Amount (Low-High)</option>
                                </select>
                                <ArrowDownUp size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-3 h-[450px] overflow-y-auto no-scrollbar pr-2">
                            <AnimatePresence>
                                {sortedTransactions.map(item => (
                                    <TransactionItem 
                                        key={item.id}
                                        item={item}
                                        onEdit={() => onEditExpenditure(item)}
                                        onDelete={() => onDeleteExpenditure(item)}
                                        formatCurrency={formatCurrency}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-center text-slate-400 mt-24">
                    No expenses logged yet. Click the '+' icon to add your first one.
                </p>
            )}
        </motion.div>
    );
};

export default ExpenditurePage;
