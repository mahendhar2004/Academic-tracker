import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';

const SetBalanceModal = ({ isOpen, onClose, onSave, currentBalance }) => {
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setBalance(currentBalance || 0);
        }
    }, [isOpen, currentBalance]);

    const handleSave = () => {
        const newBalance = parseFloat(balance);
        if (!isNaN(newBalance)) {
            onSave(newBalance);
            onClose();
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title="Set Current Balance">
            <div className="w-80 text-center space-y-6">
                <div>
                    <label htmlFor="balance" className="block text-sm font-medium text-slate-300 mb-2">
                        Enter your total available balance
                    </label>
                    <input
                        type="number"
                        id="balance"
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                        className="w-48 text-center bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        step="any"
                        autoFocus
                    />
                </div>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    Save Balance
                </motion.button>
            </div>
        </GlassyModal>
    );
};

export default SetBalanceModal;