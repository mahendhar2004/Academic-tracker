import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useStore } from '../../store/useStore';

const PomodoroModal = ({ isOpen, onClose, onStart }) => {
    const { toast } = useStore();
    const [duration, setDuration] = useState(25);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Full Screen Helpers
    const enterFullScreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log(err));
        }
    };

    const exitFullScreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.log(err));
        }
    };

    const handleClose = useCallback(() => {
        exitFullScreen();
        onClose();
    }, [onClose]);

    // Reset State on Open
    useEffect(() => {
        if (isOpen) {
            const validDuration = (duration > 0 && !isNaN(duration)) ? duration : 25;
            setDuration(validDuration);
            setTimeLeft(validDuration * 60);
            setIsActive(false);
            setIsPaused(false);
        }
    }, [isOpen, duration]);

    // Timer Interval
    useEffect(() => {
        let interval = null;
        if (isActive && !isPaused && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            onStart(duration);
            exitFullScreen();
        }
        return () => clearInterval(interval);
    }, [isActive, isPaused, timeLeft, duration, onStart]);

    // Keyboard (ESC) Listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isOpen && e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleClose]);

    const handleStartTimer = () => {
        setIsActive(true);
        setIsPaused(false);
        enterFullScreen();
        toast.info('Press ESC to cancel focus mode');
    };

    const handleDurationSelect = (mins) => {
        if (!isActive) {
            setDuration(mins);
            setTimeLeft(mins * 60);
        }
    };

    const toggleTimer = () => {
        if (!isActive) {
            handleStartTimer();
        } else {
            setIsPaused(!isPaused);
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        setIsPaused(false);
        setTimeLeft(duration * 60);
        exitFullScreen();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // --- Visuals & Math ---
    const totalSeconds = duration * 60;
    const safeTotal = totalSeconds > 0 ? totalSeconds : 1;
    const pct = timeLeft / safeTotal;

    // Radius config
    const r = 180;
    const circumference = 2 * Math.PI * r;
    const strokeDashoffset = circumference * (1 - pct);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-[#050505] text-white overflow-hidden flex flex-col items-center justify-center font-sans">

                    {/* --- Ambient Background --- */}
                    <div className="absolute inset-0 bg-black"></div>
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        {/* --- Timer Display --- */}
                        <div className="relative mb-16 group cursor-default">
                            {/* SVG Ring */}
                            <svg className="transform -rotate-90 w-[500px] h-[500px] drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>
                                <circle
                                    cx="250"
                                    cy="250"
                                    r={r}
                                    stroke="#1e1e2e"
                                    strokeWidth="4"
                                    fill="transparent"
                                />
                                <circle
                                    cx="250"
                                    cy="250"
                                    r={r}
                                    stroke="url(#gradient)"
                                    strokeWidth="6"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-linear"
                                />
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span
                                    className="text-[7rem] font-bold tabular-nums tracking-tighter leading-none bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl"
                                >
                                    {formatTime(timeLeft)}
                                </motion.span>

                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 text-sm font-medium tracking-[0.3em] uppercase text-slate-500"
                                >
                                    {isActive ? (isPaused ? 'Paused' : 'Focus Mode') : 'Ready'}
                                </motion.span>
                            </div>
                        </div>

                        {/* --- Interactions --- */}
                        <div className="flex flex-col items-center gap-10">

                            <motion.div
                                animate={{ opacity: isActive ? 0 : 1, y: isActive ? 20 : 0, pointerEvents: isActive ? 'none' : 'auto' }}
                                className="flex gap-4 p-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10"
                            >
                                {[15, 25, 45, 60].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => handleDurationSelect(m)}
                                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${duration === m ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </motion.div>

                            <div className="flex items-center gap-8">
                                <AnimatePresence>
                                    {(isActive || isPaused) && (
                                        <motion.button
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            onClick={resetTimer}
                                            className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
                                        >
                                            <RotateCcw size={24} />
                                        </motion.button>
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleTimer}
                                    className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-white flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(6,182,212,0.6)] transition-all duration-500"
                                >
                                    {(isActive && !isPaused) ? (
                                        <Pause size={40} fill="currentColor" />
                                    ) : (
                                        <Play size={40} fill="currentColor" className="ml-2" />
                                    )}
                                </motion.button>
                            </div>
                        </div>

                        <div className="absolute bottom-[-80px] text-white/20 text-xs tracking-widest uppercase">
                            Press ESC to exit
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PomodoroModal;