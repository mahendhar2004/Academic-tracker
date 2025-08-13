import React from 'react';
import GlassyModal from '../common/GlassyModal';

const TimetableModal = ({ isOpen, onClose, schedule, courses }) => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const getCourseName = (courseId) => {
        const course = courses.find(c => c.id === courseId);
        return course ? course.name : 'Unknown Course';
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title="Full Weekly Timetable" customClasses="max-w-screen-lg w-full">
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                {daysOfWeek.map(day => (
                    <div key={day} className="flex-shrink-0 w-48">
                        <h3 className="font-bold text-lg mb-2 text-center text-cyan-300">{day}</h3>
                        <div className="space-y-2">
                            {schedule.filter(s => s.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime)).map(item => (
                                <div key={item.id} className="bg-black/40 p-2 rounded-lg text-center shadow-inner">
                                    <p className="font-semibold text-sm truncate">{getCourseName(item.courseId)}</p>
                                    <p className="text-xs text-slate-400">{item.startTime} - {item.endTime}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </GlassyModal>
    );
};

export default TimetableModal;
