import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit } from 'lucide-react';

const DeadlineCard = ({ deadline, getCourseName, onDelete, onEdit }) => {
    const [timeLeftText, setTimeLeftText] = useState('');
    const [urgencyColor, setUrgencyColor] = useState('text-cyan-300');
    const [cardUrgencyClass, setCardUrgencyClass] = useState('from-white/15 to-white/0 border-white/25');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const deadlineDate = new Date(`${deadline.date}T${deadline.time || '00:00'}`);
            const now = new Date();
            const minutesUntil = (deadlineDate - now) / (1000 * 60);
            const hoursUntil = minutesUntil / 60;
            const daysUntil = hoursUntil / 24;

            if (minutesUntil < 0) {
                setTimeLeftText('Past Due');
                setUrgencyColor('text-slate-400');
                setCardUrgencyClass('from-slate-500/20 to-slate-500/0 border-slate-500/50 opacity-60');
            } else if (minutesUntil < 60) {
                setTimeLeftText(`${Math.floor(minutesUntil)}m left`);
                setUrgencyColor('text-red-400');
                setCardUrgencyClass('from-red-500/20 to-red-500/0 border-red-500/50');
            } else if (hoursUntil < 24) {
                setTimeLeftText(`${Math.floor(hoursUntil)}h left`);
                setUrgencyColor('text-red-400');
                setCardUrgencyClass('from-red-500/20 to-red-500/0 border-red-500/50');
            } else {
                const days = Math.floor(daysUntil);
                const hours = Math.floor(hoursUntil % 24);
                setTimeLeftText(`${days}d ${hours}h left`);
                if (days <= 3) {
                    setUrgencyColor('text-yellow-400');
                } else {
                    setUrgencyColor('text-cyan-300');
                }
                setCardUrgencyClass('from-white/15 to-white/0 border-white/25');
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [deadline]);

    const formattedDate = new Date(deadline.date).toLocaleDateString('en-GB'); // DD/MM/YYYY format

    return (
        <div className={`bg-gradient-to-br ${cardUrgencyClass} bg-white/10 saturate-150 backdrop-blur-2xl border p-4 rounded-xl shadow-lg flex flex-col justify-between`}>
            <div className="flex justify-between items-start">
                <p className="font-bold text-white text-lg mb-1 truncate pr-4">{getCourseName(deadline.courseId)}</p>
                <div className="flex items-center gap-3">
                    <motion.button whileTap={{scale: 0.9}} onClick={() => onEdit(deadline)} className="text-slate-500 hover:text-cyan-400 transition-colors flex-shrink-0"><Edit size={16} /></motion.button>
                    <motion.button whileTap={{scale: 0.9}} onClick={() => onDelete(deadline.id)} className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"><Trash2 size={16} /></motion.button>
                </div>
            </div>
            
            <div className="flex justify-between items-end mt-2">
                <div>
                    <p className="text-xl text-slate-200 truncate font-semibold">{deadline.title}</p>
                    <p className="text-base text-slate-400 mt-1">{formattedDate} {deadline.time}</p>
                </div>
                <p className={`font-bold text-lg ${urgencyColor}`}>{timeLeftText}</p>
            </div>
        </div>
    );
};

export default DeadlineCard;
