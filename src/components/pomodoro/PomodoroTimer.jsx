import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const PomodoroTimer = ({ duration, onClose }) => {
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const timerRef = useRef(null);

    const handleClose = (completed = false) => {
        // Clear any running interval to prevent memory leaks
        clearInterval(timerRef.current);
        onClose({ completed });
    };

    useEffect(() => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        }

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                handleClose(false);
            }
        };
        
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen();
            }
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // One interval for the whole session instead of tearing down/recreating it every tick.
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) {
            handleClose(true); // Timer finished successfully
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100] flex flex-col justify-center items-center text-white"
        >
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleClose(false)} // Manually closed
                className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors"
            >
                <X size={40} />
            </motion.button>

            <div className="font-mono text-[20vw] tracking-tighter">
                <span>{String(minutes).padStart(2, '0')}</span>
                <span className="animate-pulse">:</span>
                <span>{String(seconds).padStart(2, '0')}</span>
            </div>
            
            <p className="text-2xl text-slate-300">Stay focused...</p>
        </motion.div>
    );
};

export default PomodoroTimer;