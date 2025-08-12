import React from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';

const CoinReward = ({ amount, onComplete }) => (
    <motion.div
        initial={{ opacity: 1, y: 0, scale: 1 }}
        animate={{ opacity: 0, y: -50, scale: 0.8 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        onAnimationComplete={onComplete}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-yellow-400/20 border border-yellow-400 text-yellow-300 px-3 py-1 rounded-full text-sm font-bold"
    >
        <Coins size={16} /> +{amount}
    </motion.div>
);

export default CoinReward;
