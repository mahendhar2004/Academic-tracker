import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    UserCircle2, LogOut, AlertTriangle, GraduationCap, BookCopy, Users, Award, 
    Link as LinkIcon, Plus, Linkedin, Github, Instagram, Facebook, Twitter 
} from 'lucide-react';
import EditableField from '../components/profile/EditableField';
import EditableList from '../components/profile/EditableList';

// Helper function to get the correct icon based on the URL
const getSocialIcon = (url) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('linkedin')) return <Linkedin size={16} className="text-blue-400 flex-shrink-0" />;
    if (lowerUrl.includes('github')) return <Github size={16} className="text-slate-300 flex-shrink-0" />;
    if (lowerUrl.includes('instagram')) return <Instagram size={16} className="text-pink-500 flex-shrink-0" />;
    if (lowerUrl.includes('facebook')) return <Facebook size={16} className="text-blue-600 flex-shrink-0" />;
    if (lowerUrl.includes('twitter') || lowerUrl.includes('x.com')) return <Twitter size={16} className="text-sky-500 flex-shrink-0" />;
    return <LinkIcon size={16} className="text-slate-400 flex-shrink-0" />;
};

const ProfilePage = ({ profileData, onSaveField, onResetData, onSignOut, currentSemester, currentSemesterCourses, onAddNewCourse }) => {
    const personal = profileData.personal || {};
    const academic = profileData.academic || {};
    const social = profileData.social || {};

    // ... defaultCurrentYear and yearOptions logic remains the same ...
    const defaultCurrentYear = useMemo(() => {
        if (!currentSemester) return '';
        const year = Math.ceil(currentSemester / 2);
        switch(year) {
            case 1: return 'First Year/Freshman';
            case 2: return 'Second Year/Sophomore';
            case 3: return 'Third Year/Junior';
            case 4: return 'Fourth Year/Senior/Final Year';
            default: return '';
        }
    }, [currentSemester]);
    
    const yearOptions = [
        'First Year/Freshman',
        'Second Year/Sophomore',
        'Third Year/Junior',
        'Fourth Year/Senior/Final Year'
    ];


    const cardStyles = "bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-6 rounded-xl shadow-lg";

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.4 }}
            className="flex justify-center"
        >
            <div className="max-w-7xl w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {/* Card 1: Personal Details */}
                    <div className={cardStyles}>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3"><UserCircle2 className="text-cyan-400" />Personal Details</h3>
                        <EditableField label="Name" value={profileData.name} onSave={(val) => onSaveField('name', val)} />
                        <EditableField label="Personal Email" value={profileData.email} onSave={(val) => onSaveField('email', val)} />
                        <EditableField label="Phone Number" value={personal.phone} onSave={(val) => onSaveField('personal.phone', val)} />
                        <EditableField label="Age" value={personal.age} onSave={(val) => onSaveField('personal.age', val)} />
                        <EditableField 
                            label="Gender" 
                            value={personal.gender} 
                            onSave={(val) => onSaveField('personal.gender', val)}
                            inputType="select"
                            options={['Prefer not to say', 'Male', 'Female']}
                        />
                    </div>

                    {/* Card 2: Academic Details */}
                    <div className={cardStyles}>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3"><GraduationCap className="text-cyan-400" />Academic Details</h3>
                        <EditableField label="Roll No." value={academic.rollNo} onSave={(val) => onSaveField('academic.rollNo', val)} />
                        <EditableField label="Current Year" value={academic.currentYear || defaultCurrentYear} onSave={(val) => onSaveField('academic.currentYear', val)} inputType="select" options={yearOptions} />
                        <EditableField label="Current Semester" value={academic.currentSemester || currentSemester} onSave={(val) => onSaveField('academic.currentSemester', val)} />
                        <EditableField label="College Name" value={personal.collegeName} onSave={(val) => onSaveField('personal.collegeName', val)} />
                        <EditableField label="College Email" value={personal.collegeEmail} onSave={(val) => onSaveField('personal.collegeEmail',val)} />
                        <EditableField label="Branch" value={academic.branch} onSave={(val) => onSaveField('academic.branch', val)} />
                    </div>

                    {/* Card 3: Current Courses */}
                    <div className={cardStyles}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3"><BookCopy className="text-cyan-400" />Current Courses</h3>
                            <motion.button whileTap={{scale:0.95}} onClick={onAddNewCourse} className="flex items-center gap-2 bg-white/15 text-white font-bold py-1 px-3 rounded-lg text-sm transition-colors hover:bg-white/25">
                                <Plus size={16} /> Add
                            </motion.button>
                        </div>
                        <div className="space-y-2 max-h-[340px] overflow-y-auto no-scrollbar pr-2">
                            {currentSemesterCourses && currentSemesterCourses.length > 0 ? (
                                currentSemesterCourses.map(course => (
                                    <div key={course.id} className="bg-black/20 p-3 rounded-lg flex justify-between items-center">
                                        <p className="font-semibold text-white truncate pr-4">{course.name}</p>
                                        <p className="text-sm text-slate-400 flex-shrink-0">{course.credits} Cr</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-center py-8">No courses found for the current semester.</p>
                            )}
                        </div>
                    </div>

                    {/* Card 4: Societies or Clubs */}
                    <div className={cardStyles}>
                        <EditableList 
                            label="Societies or Clubs"
                            icon={Users}
                            items={personal.clubs || []}
                            onSave={(items) => onSaveField('personal.clubs', items)}
                            placeholder="e.g., Robotics Club"
                        />
                    </div>

                    {/* Card 5: Skills */}
                    <div className={cardStyles}>
                        <EditableList 
                            label="Skills"
                            icon={Award}
                            items={academic.skills || []}
                            onSave={(items) => onSaveField('academic.skills', items)}
                            placeholder="e.g., React, Python"
                        />
                    </div>

                    {/* Card 6: Social Links */}
                    <div className={cardStyles}>
                        <EditableList 
                            label="Social Links"
                            icon={LinkIcon}
                            items={social.links || []}
                            onSave={(items) => onSaveField('social.links', items)}
                            placeholder="e.g., https://linkedin.com/in/..."
                            // FIX: Pass the new renderItem prop to display icons and links
                            renderItem={(link) => (
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {getSocialIcon(link)}
                                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-slate-200 truncate hover:text-cyan-400 hover:underline">
                                        {link.replace(/^(https?:\/\/)?(www\.)?/, '')}
                                    </a>
                                </div>
                            )}
                        />
                    </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-4">
                       <motion.button whileTap={{ scale: 0.95 }} onClick={onSignOut} className="w-full max-w-sm flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                           <LogOut size={18} /> Sign Out
                       </motion.button>
                       <motion.button whileTap={{ scale: 0.95 }} onClick={onResetData} className="w-full max-w-sm flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-300 font-bold py-2 px-4 rounded-lg transition-colors">
                           <AlertTriangle size={18} /> Reset All Data
                       </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfilePage;