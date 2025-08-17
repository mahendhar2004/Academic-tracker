import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';
import { BrainCircuit } from 'lucide-react'; // Import a new icon for focus

const PomodoroModal = ({ isOpen, onClose, onStart }) => {
    const [duration, setDuration] = useState(25);

    const handleStart = () => {
        if (duration > 0) {
            onStart(duration);
        }
    };

    return (
        <GlassyModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Start a Focus Session"
            // UPDATED: Increased modal width for a more spacious feel
            customClasses="max-w-md w-full" 
        >
            <div className="text-center space-y-8 p-4">
                {/* NEW: Added a prominent, themed icon */}
                <BrainCircuit size={48} className="text-red-400 mx-auto" strokeWidth={1.5} />
                
                {/* NEW: Added a motivational subtitle */}
                <p className="text-slate-300 -mt-6">Choose your duration and lock in for a productive session.</p>

                <div>
                    <label htmlFor="duration" className="block text-lg font-medium text-slate-300 mb-2">
                        Focus Time
                    </label>
                    {/* UPDATED: Made the input much larger and more central */}
                    <div className="flex items-center justify-center gap-2">
                         <input
                            type="number"
                            id="duration"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                            className="w-48 text-center bg-transparent text-white text-7xl font-bold focus:outline-none"
                            min="1"
                        />
                        <span className="text-2xl text-slate-400 font-medium pt-4">min</span>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    {[15, 25, 50, 60].map(time => (
                        <motion.button
                            key={time}
                            onClick={() => setDuration(time)}
                            className={`px-4 py-2 rounded-lg transition-colors text-base font-semibold ${duration === time ? 'bg-cyan-500/80 text-white' : 'bg-black/20 hover:bg-black/40 text-slate-300'}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {time}
                        </motion.button>
                    ))}
                </div>

                {/* UPDATED: Enhanced the primary action button */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={handleStart}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:shadow-lg hover:shadow-red-500/30 text-white font-bold py-3 px-4 text-lg rounded-lg transition-all duration-300"
                >
                    Begin Focus
                </motion.button>
            </div>
        </GlassyModal>
    );
};

export default PomodoroModal;