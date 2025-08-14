import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';

const PomodoroModal = ({ isOpen, onClose, onStart }) => {
    const [duration, setDuration] = useState(25);

    const handleStart = () => {
        if (duration > 0) {
            onStart(duration);
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title="Start a Pomodoro Session">
            <div className="w-80 text-center space-y-6">
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-slate-300 mb-2">
                        Focus Duration (minutes)
                    </label>
                    <input
                        type="number"
                        id="duration"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                        className="w-32 text-center bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400"
                        min="1"
                    />
                </div>
                <div className="flex justify-center gap-2">
                    {[15, 25, 50].map(time => (
                        <button
                            key={time}
                            onClick={() => setDuration(time)}
                            className={`px-4 py-2 rounded-lg transition-colors text-sm ${duration === time ? 'bg-cyan-500/80 text-white font-bold' : 'bg-black/20 hover:bg-black/40'}`}
                        >
                            {time} min
                        </button>
                    ))}
                </div>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStart}
                    className="w-full bg-red-500/80 hover:bg-red-500 border border-red-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    Start Session
                </motion.button>
            </div>
        </GlassyModal>
    );
};

export default PomodoroModal;