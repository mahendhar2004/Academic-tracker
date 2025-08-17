import React from 'react';
import { motion } from 'framer-motion';
// Regular UI icons are still from lucide-react
import { 
    LogOut, AlertTriangle, Link as LinkIcon, Briefcase, Trophy, Code, Award, BookOpen
} from 'lucide-react';
// Import brand icons from the new library, react-icons
import { FaLinkedin, FaGithub, FaInstagram, FaFacebook, FaTwitter, FaWhatsapp, FaTelegramPlane, FaDiscord, FaYoutube, FaTwitch, FaReddit } from 'react-icons/fa';
import { SiLeetcode, SiCodeforces } from 'react-icons/si';

import EditableField from '../components/profile/EditableField';
import EditableList from '../components/profile/EditableList';


// UPDATED: A much more comprehensive icon function using React Icons
const getSocialIcon = (url) => {
    const lowerUrl = url.toLowerCase();
    const props = { size: 20, className: "text-slate-400 hover:text-white transition-colors" };
  
    if (lowerUrl.includes('linkedin')) return <FaLinkedin {...props} />;
    if (lowerUrl.includes('github')) return <FaGithub {...props} />;
    if (lowerUrl.includes('leetcode')) return <SiLeetcode {...props} />;
    if (lowerUrl.includes('codeforces')) return <SiCodeforces {...props} />;
    if (lowerUrl.includes('wa.me') || lowerUrl.includes('whatsapp')) return <FaWhatsapp {...props} />;
    if (lowerUrl.includes('t.me') || lowerUrl.includes('telegram')) return <FaTelegramPlane {...props} />;
    if (lowerUrl.includes('discord')) return <FaDiscord {...props} />;
    if (lowerUrl.includes('youtube')) return <FaYoutube {...props} />;
    if (lowerUrl.includes('twitter') || lowerUrl.includes('x.com')) return <FaTwitter {...props} />;
    if (lowerUrl.includes('instagram')) return <FaInstagram {...props} />;
    if (lowerUrl.includes('facebook')) return <FaFacebook {...props} />;
    if (lowerUrl.includes('twitch')) return <FaTwitch {...props} />;
    if (lowerUrl.includes('reddit')) return <FaReddit {...props} />;
    if (lowerUrl.includes('medium') || lowerUrl.includes('substack')) return <BookOpen {...props} />;

    return <LinkIcon {...props} />; // Default fallback icon
};


const ProfilePage = ({ profileData, onSaveField, onResetData, onSignOut }) => {
    const cardStyles = "bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl";

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
        >
            {/* --- LEFT COLUMN --- */}
            <motion.div variants={itemVariants} className="lg:col-span-1 space-y-8">
                {/* --- Main Profile Card --- */}
                <div className={`${cardStyles} p-6 text-center space-y-4`}>
                    <img 
                        src={profileData.imageUrl || `https://ui-avatars.com/api/?name=${profileData.name}&background=0d1117&color=fff&bold=true`} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-full border-4 border-slate-700 object-cover mx-auto"
                    />
                    <div className="space-y-2">
                        <EditableField label="Name" value={profileData.name} onSave={(val) => onSaveField('name', val)} large={true} />
                        <EditableField label="Branch" value={profileData.academic?.branch} onSave={(val) => onSaveField('academic.branch', val)} />
                    </div>
                    <div className="flex justify-center flex-wrap gap-4 pt-2">
                        {(profileData.social?.links || []).map((link, index) => (
                            <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                                {getSocialIcon(link)}
                            </a>
                        ))}
                    </div>
                </div>

                {/* --- Danger Zone --- */}
                <div className={`${cardStyles} p-6 border-red-500/30`}>
                    <h3 className="font-bold text-xl text-red-400 mb-4">Danger Zone</h3>
                    <div className="flex flex-col gap-4">
                        <motion.button whileTap={{ scale: 0.95 }} onClick={onSignOut} className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            <LogOut size={18} /> Sign Out
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={onResetData} className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-300 font-bold py-2 px-4 rounded-lg transition-colors">
                            <AlertTriangle size={18} /> Reset All Data
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* --- RIGHT COLUMN --- */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
                {/* --- Academic Card --- */}
                <div className={`${cardStyles} p-6 space-y-6`}>
                     <EditableField label="College Name" value={profileData.personal?.collegeName} onSave={(val) => onSaveField('personal.collegeName', val)} />
                     <EditableField label="Roll No." value={profileData.academic?.rollNo} onSave={(val) => onSaveField('academic.rollNo', val)} />
                     <hr className="border-slate-800" />
                     <EditableList icon={Code} label="Projects" items={profileData.academic?.projects || []} onSave={(items) => onSaveField('academic.projects', items)} placeholder="e.g., https://github.com/user/repo" />
                     <hr className="border-slate-800" />
                     <EditableList icon={Award} label="Certificates" items={profileData.academic?.certificates || []} onSave={(items) => onSaveField('academic.certificates', items)} placeholder="e.g., Google Cloud Certified" />
                </div>
                
                {/* --- Professional Card --- */}
                <div className={`${cardStyles} p-6 space-y-6`}>
                    <EditableList icon={Briefcase} label="Internships & Experience" items={profileData.academic?.internships || []} onSave={(items) => onSaveField('academic.internships', items)} placeholder="e.g., SDE Intern @ Google" />
                     <hr className="border-slate-800" />
                    <EditableField label="Resume Link" value={profileData.academic?.resumeLink} onSave={(val) => onSaveField('academic.resumeLink', val)} />
                     <hr className="border-slate-800" />
                    <EditableList icon={LinkIcon} label="Social & Portfolio Links" items={profileData.social?.links || []} onSave={(items) => onSaveField('social.links', items)} placeholder="e.g., https://linkedin.com/in/..." />
                </div>

                {/* --- Personal Card --- */}
                 <div className={`${cardStyles} p-6 space-y-6`}>
                    <EditableField label="Location" value={profileData.personal?.location} onSave={(val) => onSaveField('personal.location', val)} />
                     <hr className="border-slate-800" />
                    <EditableList icon={Trophy} label="Achievements" items={profileData.personal?.achievements || []} onSave={(items) => onSaveField('personal.achievements', items)} placeholder="e.g., Winner of Smart India Hackathon" />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProfilePage;