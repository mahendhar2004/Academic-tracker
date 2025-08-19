import React from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';

const CoinReward = ({ amount, onComplete }) => (
    <motion.div
        initial={{ opacity: 1, y: 0, scale: 1 }}
        animate={{ opacity: 0, y: 50, scale: 0.8 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        onAnimationComplete={onComplete}
        className="absolute top-full mt-2 right-0 flex items-center gap-2 bg-yellow-400/20 border border-yellow-400 text-yellow-300 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap"
    >
        <Coins size={16} /> +{amount} Coins
    </motion.div>
);

export default CoinReward;