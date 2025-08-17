import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Bell, Edit, Trash2 } from 'lucide-react';

const EventCard = ({ event, onEdit, onDelete }) => {
    const isDeadline = event.type === 'deadline';
    const details = event.courseDetails;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="group flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/10 hover:bg-slate-800/60 transition-all duration-300"
        >
            {/* Icon */}
            <div
                className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-black/30"
                style={{ borderLeft: `4px solid ${isDeadline ? '#f59e0b' : details.color}` }}
            >
                {isDeadline
                    ? <Bell size={24} className="text-amber-400" />
                    : <Clock size={24} className="text-cyan-400" />}
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
                <p className="font-bold text-white leading-tight">
                    {isDeadline ? event.title : details.name}
                </p>
                <p className="text-sm text-slate-400">
                    {isDeadline ? details.name : event.startTime}
                </p>
            </div>

            {/* Right-side: time + actions */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-right">
                    <p className="font-semibold text-white">
                        {isDeadline ? event.startTime : event.endTime}
                    </p>
                    {isDeadline && (
                        <p className="text-xs text-slate-400">
                            {event.date.toLocaleDateString('en-GB')}
                        </p>
                    )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onEdit}
                        className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-cyan-300"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-red-400"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default EventCard;
