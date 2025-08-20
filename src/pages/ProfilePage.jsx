import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    LogOut, AlertTriangle, Link as LinkIcon, Briefcase, Trophy, Code, Award,
    BookOpen, User as UserIcon, MailCheck, Trash2, Share2
} from 'lucide-react';
import {
    FaLinkedin, FaGithub, FaInstagram, FaFacebook, FaTwitter, FaWhatsapp,
    FaTelegramPlane, FaDiscord, FaYoutube, FaTwitch, FaReddit
} from 'react-icons/fa';
import { SiLeetcode, SiCodeforces } from 'react-icons/si';
import EditableField from '../components/profile/EditableField';
import EditableList from '../components/profile/EditableList';
import EditableResumeList from '../components/profile/EditableResumeList';
import authService from '../services/authService';
import { COIN_VALUES } from '../constants';
import { useModalStore } from '../store/useModalStore';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import ToastNotification from '../components/common/ToastNotification';

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

    return <LinkIcon {...props} />;
};

const ProfilePage = ({ user, profileData, onSaveField, onResetData, onSignOut, onDeleteAccount }) => {
    const cardStyles = "bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl";
    const { openModal } = useModalStore();
    const [toast, setToast] = useState({ show: false, message: '' });

    const handleShareProfile = async () => {
        try {
            let shareId = profileData.shareId;
            if (!shareId) {
                shareId = doc(collection(db, `artifacts/${appId}/publicProfiles`)).id;
                await onSaveField('shareId', shareId, 0);
            }

            const publicProfileData = {
                name: profileData.name || 'Anonymous User',
                imageUrl: profileData.imageUrl || '',
                branch: profileData.academic?.branch || 'Branch not specified',
                socialLinks: profileData.social?.links || [],
                personal: profileData.personal || {},
                academic: profileData.academic || {},
            };

            const publicProfileRef = doc(db, `artifacts/${appId}/publicProfiles/${shareId}`);
            await setDoc(publicProfileRef, publicProfileData);

            const url = `${window.location.origin}?profile=${shareId}`;
            await navigator.clipboard.writeText(url);

            setToast({ show: true, message: 'Link copied to clipboard!' });

        } catch (error) {
            console.error("Failed to share profile:", error);
            setToast({ show: true, message: 'Could not create public profile.' });
        }
    };

    const handleSignOutClick = () => {
        openModal('confirmation', {
            message: 'Are you sure you want to sign out?',
            onConfirm: onSignOut
        });
    };

    const handleVerifyEmail = async () => {
        try {
            await authService.sendVerificationEmail();
            setToast({ show: true, message: 'Verification email sent!' });
        } catch (error) {
            setToast({ show: true, message: `Error: ${error.message}` });
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const displayEmail = profileData.personal?.email || user.email || '';

    return (
        <>
            <ToastNotification
                message={toast.message}
                show={toast.show}
                onHide={() => setToast({ show: false, message: '' })}
            />
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start"
            >
                {/* --- LEFT COLUMN (STICKY) --- */}
                <motion.div
                    variants={itemVariants}
                    className="lg:col-span-1 space-y-12 lg:sticky lg:top-8"
                >
                    <div className={`${cardStyles} p-8 text-center space-y-6`}>
                        <img
                            src={profileData.imageUrl || `https://ui-avatars.com/api/?name=${profileData.name}&background=0d1117&color=fff&bold=true`}
                            alt="Profile"
                            className="w-32 h-32 rounded-full border-4 border-slate-700 object-cover mx-auto"
                        />
                        <div className="space-y-2">
                            <EditableField label="Name" value={profileData.name} onSave={(val) => onSaveField('name', val, COIN_VALUES.PROFILE_PERSONAL)} large={true} />
                            <EditableField label="Branch" value={profileData.academic?.branch} onSave={(val) => onSaveField('academic.branch', val, COIN_VALUES.PROFILE_ACADEMIC)} />
                        </div>
                        <div className="flex justify-center flex-wrap gap-4 pt-2">
                            {(profileData.social?.links || []).map((link, index) => (
                                <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                                    {getSocialIcon(link)}
                                </a>
                            ))}
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleShareProfile}
                            className="w-full flex items-center justify-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/50 text-cyan-300 font-bold py-2 px-4 rounded-lg transition-colors mt-4"
                        >
                            <Share2 size={18} /> Share Public Profile
                        </motion.button>
                    </div>

                    <div className={`${cardStyles} p-8 border-red-500/30`}>
                        <h3 className="font-bold text-xl text-red-400 mb-4">Danger Zone</h3>
                        <div className="flex flex-col gap-4">
                            <motion.button whileTap={{ scale: 0.95 }} onClick={handleSignOutClick} className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                <LogOut size={18} /> Sign Out
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={onResetData} className="w-full flex items-center justify-center gap-2 bg-orange-500/20 hover:bg-orange-500/40 border border-orange-500/50 text-orange-300 font-bold py-2 px-4 rounded-lg transition-colors">
                                <AlertTriangle size={18} /> Reset All Data
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={onDeleteAccount}
                                className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-300 font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} /> Delete Account
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* --- RIGHT COLUMN (SCROLLABLE) --- */}
                <motion.div
                    variants={itemVariants}
                    className="lg:col-span-2 space-y-12 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto no-scrollbar lg:pr-4"
                >
                    <div className={`${cardStyles} p-8 space-y-4`}>
                        <h3 className="font-bold text-xl text-white flex items-center gap-3"><UserIcon size={20} /> Personal Details</h3>
                        <EditableField label="Age" value={profileData.personal?.age} onSave={(val) => onSaveField('personal.age', val, COIN_VALUES.PROFILE_PERSONAL)} />
                        <EditableField label="Location" value={profileData.personal?.location} onSave={(val) => onSaveField('personal.location', val, COIN_VALUES.PROFILE_PERSONAL)} placeholder="e.g., Jabalpur, India" />
                        <EditableField label="Contact Number" value={profileData.personal?.phone} onSave={(val) => onSaveField('personal.phone', val, COIN_VALUES.PROFILE_PERSONAL)} />

                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <EditableField label="Personal Email" value={displayEmail} onSave={(val) => onSaveField('personal.email', val, COIN_VALUES.PROFILE_PERSONAL)} />
                            </div>
                            {user?.emailVerified ? (
                                <div className="flex items-center gap-2 text-sm text-green-400 flex-shrink-0">
                                    <MailCheck size={16} />
                                    <span>Verified</span>
                                </div>
                            ) : (
                                <motion.button
                                    whileTap={{scale: 0.95}}
                                    onClick={handleVerifyEmail}
                                    className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 font-semibold text-sm px-3 py-1 rounded-md flex-shrink-0"
                                >
                                    Verify Email
                                </motion.button>
                            )}
                        </div>
                    </div>

                    <div className={`${cardStyles} p-8 space-y-6`}>
                        <h3 className="font-bold text-xl text-white flex items-center gap-3"><BookOpen size={20} /> Academic Background</h3>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg text-slate-300">Engineering College</h4>
                            <EditableField label="College Name" value={profileData.academic?.collegeName} onSave={(val) => onSaveField('academic.collegeName', val, COIN_VALUES.PROFILE_ACADEMIC)} placeholder="e.g., IIIT Jabalpur" />
                            <EditableField label="Location" value={profileData.academic?.engineeringCollegeLocation} onSave={(val) => onSaveField('academic.engineeringCollegeLocation', val, COIN_VALUES.PROFILE_ACADEMIC)} placeholder="e.g., Jabalpur, India" />
                            <EditableField label="CGPA/Percentile" value={profileData.academic?.collegePercentile} onSave={(val) => onSaveField('academic.collegePercentile', val, COIN_VALUES.PROFILE_ACADEMIC)} />
                            <EditableField label="Roll No." value={profileData.academic?.rollNo} onSave={(val) => onSaveField('academic.rollNo', val, COIN_VALUES.PROFILE_ACADEMIC)} />
                            <EditableField label="College Email" value={profileData.academic?.collegeEmail} onSave={(val) => onSaveField('academic.collegeEmail', val, COIN_VALUES.PROFILE_ACADEMIC)} />
                        </div>

                        <hr className="border-slate-800" />

                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg text-slate-300">Intermediate College</h4>
                            <EditableField label="College Name" value={profileData.academic?.intermediateCollegeName} onSave={(val) => onSaveField('academic.intermediateCollegeName', val, COIN_VALUES.PROFILE_ACADEMIC)} />
                            <EditableField label="Location" value={profileData.academic?.intermediateCollegeLocation} onSave={(val) => onSaveField('academic.intermediateCollegeLocation', val, COIN_VALUES.PROFILE_ACADEMIC)} />
                            <EditableField label="Percentile" value={profileData.academic?.intermediatePercentile} onSave={(val) => onSaveField('academic.intermediatePercentile', val, COIN_VALUES.PROFILE_ACADEMIC)} />
                        </div>

                        <hr className="border-slate-800" />

                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg text-slate-300">School</h4>
                            <EditableField label="School Name" value={profileData.academic?.schoolName} onSave={(val) => onSaveField('academic.schoolName', val, COIN_VALUES.PROFILE_ACADEMIC)} />
                            <EditableField label="School Location" value={profileData.academic?.schoolLocation} onSave={(val) => onSaveField('academic.schoolLocation', val, COIN_VALUES.PROFILE_ACADEMIC)} />
                            <EditableField label="School CGPA/GPA" value={profileData.academic?.schoolGpa} onSave={(val) => onSaveField('academic.schoolGpa', val, COIN_VALUES.PROFILE_ACADEMIC)} />
                        </div>
                    </div>

                    <div className={`${cardStyles} p-8 space-y-6`}>
                         <EditableList icon={Code} label="Projects" items={profileData.academic?.projects || []} onSave={(items) => onSaveField('academic.projects', items, COIN_VALUES.PROFILE_PROJECTS)} placeholder="e.g., https://github.com/user/repo" />
                         <hr className="border-slate-800" />
                         <EditableList icon={Award} label="Certificates" items={profileData.academic?.certificates || []} onSave={(items) => onSaveField('academic.certificates', items, COIN_VALUES.PROFILE_CERTIFICATES)} placeholder="e.g., Google Cloud Certified" />
                         <hr className="border-slate-800" />
                         <EditableList icon={Trophy} label="Achievements" items={profileData.personal?.achievements || []} onSave={(items) => onSaveField('personal.achievements', items, COIN_VALUES.PROFILE_ACHIEVEMENTS)} placeholder="e.g., Winner of Smart India Hackathon" />
                    </div>

                    <div className={`${cardStyles} p-8 space-y-6`}>
                        <EditableList icon={Briefcase} label="Internships & Experience" items={profileData.academic?.internships || []} onSave={(items) => onSaveField('academic.internships', items, COIN_VALUES.PROFILE_INTERNSHIPS)} placeholder="e.g., SDE Intern @ Google" />
                         <hr className="border-slate-800" />
                        <EditableResumeList
                            items={profileData.academic?.resumes || []}
                            onSave={(items) => onSaveField('academic.resumes', items, COIN_VALUES.PROFILE_RESUMES)}
                        />
                         <hr className="border-slate-800" />
                        <EditableList icon={LinkIcon} label="Social & Portfolio Links" items={profileData.social?.links || []} onSave={(items) => onSaveField('social.links', items, COIN_VALUES.PROFILE_SOCIAL)} placeholder="e.g., https://linkedin.com/in/..." />
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
};

export default ProfilePage;
