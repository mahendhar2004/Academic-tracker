import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Bell, Edit, Trash2, MapPin } from 'lucide-react';

const EventCard = ({ event, onEdit, onDelete }) => {
    const isDeadline = event.type === 'deadline';
    const details = event.courseDetails;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="group flex items-start gap-4 p-4 rounded-xl bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all duration-300 shadow-sm dark:shadow-none"
        >
            <div
                className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-black/30"
                style={{ borderLeft: `4px solid ${isDeadline ? '#f59e0b' : (details?.color || '#71717a')}` }}
            >
                {isDeadline ? <Bell size={24} className="text-amber-500 dark:text-amber-400" /> : <Clock size={24} className="text-brand-secondary dark:text-cyan-400" />}
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-white leading-tight">
                    {isDeadline ? event.title : details?.name || 'Unknown Course'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isDeadline ? details?.name || 'Unknown Course' : event.startTime}
                </p>
                {!isDeadline && event.venue && (
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-500">
                        <MapPin size={12} />
                        <span>{event.venue}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">
                        {isDeadline ? event.startTime : event.endTime}
                    </p>
                    {isDeadline && event.date && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {event.date.toLocaleDateString('en-GB')}
                        </p>
                    )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-brand-secondary dark:hover:text-cyan-300">
                        <Edit size={16} />
                    </button>
                    <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-red-500 dark:hover:text-red-400">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default EventCard;