import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import { motion } from 'framer-motion';
import {
    Link as LinkIcon, Briefcase, Trophy, Award, BookOpen,
    User as UserIcon, GraduationCap, GitBranch, FileText, MapPin, Mail, Phone
} from 'lucide-react';
// UPDATED: Imported all necessary icons
import {
    FaLinkedin, FaGithub, FaInstagram, FaFacebook, FaTwitter, FaWhatsapp,
    FaTelegramPlane, FaDiscord, FaYoutube, FaTwitch, FaReddit
} from 'react-icons/fa';
import { SiLeetcode, SiCodeforces } from 'react-icons/si';


// UPDATED: Expanded the function to include all social icons
const getSocialIcon = (url) => {
    const lowerUrl = url.toLowerCase();
    const props = { size: 22, className: "text-slate-400 dark:text-slate-400 group-hover:text-brand-primary dark:group-hover:text-cyan-400 transition-colors" };

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


// --- Reusable Display Components for a Clean Look ---

const InfoCard = ({ icon: Icon, title, children }) => (
    <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-xl dark:shadow-2xl"
    >
        <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-4 flex items-center gap-3">
            <Icon size={20} className="text-brand-secondary dark:text-cyan-400" />
            {title}
        </h3>
        <div className="space-y-3">
            {children}
        </div>
    </motion.div>
);

const DisplayField = ({ label, value, icon: Icon }) => (
    value ? (
        <div className="flex items-start text-sm">
            <Icon size={16} className="text-slate-500 dark:text-slate-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
                <p className="text-slate-500 dark:text-slate-400">{label}</p>
                <p className="font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
    ) : null
);

const DisplayList = ({ items }) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    return (
        <div className="space-y-2">
            {items.map((item, index) => (
                <div key={index} className="bg-slate-100 dark:bg-black/30 p-3 rounded-lg">
                    <p className="text-slate-700 dark:text-slate-200 text-sm">{item}</p>
                </div>
            ))}
        </div>
    );
};

const DisplayResumeList = ({ items }) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    return (
        <div className="space-y-2">
            {items.map((item, index) => (
                <a
                    key={index}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-slate-100 dark:bg-black/30 p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-black/50 transition-colors group"
                >
                    <p className="font-semibold text-brand-secondary dark:text-cyan-400 group-hover:text-brand-primary dark:group-hover:text-cyan-300 transition-colors">{item.title}</p>
                    <p className="text-xs text-slate-500 truncate">{item.link}</p>
                </a>
            ))}
        </div>
    );
};


const PublicProfilePage = ({ shareId }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileRef = doc(db, `artifacts/${appId}/publicProfiles/${shareId}`);
                const profileSnap = await getDoc(profileRef);
                if (profileSnap.exists()) {
                    setProfile(profileSnap.data());
                } else {
                    setError("Profile not found or is private.");
                }
            } catch (err) {
                setError("Failed to load profile.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [shareId]);

    if (loading) {
        return <div className="bg-slate-50 dark:bg-black min-h-screen flex justify-center items-center text-slate-900 dark:text-white"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary dark:border-cyan-400"></div></div>;
    }
    if (error) {
        return <div className="bg-slate-50 dark:bg-black min-h-screen flex justify-center items-center text-red-500 dark:text-red-400 text-xl">{error}</div>;
    }

    // Safely access nested properties and provide default empty arrays to prevent errors
    const personal = profile.personal || {};
    const academic = profile.academic || {};
    const socialLinks = profile.socialLinks || [];

    // Create flags to check if sections have any content
    const hasAboutInfo = personal.email || personal.phone || personal.location;
    const hasAcademicInfo = academic.collegeName || academic.degree || academic.collegePercentile;
    const hasProjects = academic.projects && academic.projects.length > 0;
    const hasInternships = academic.internships && academic.internships.length > 0;
    const hasCertificates = academic.certificates && academic.certificates.length > 0;
    const hasAchievements = personal.achievements && personal.achievements.length > 0;
    const hasResumes = academic.resumes && academic.resumes.length > 0;

    return (
        <div className="bg-slate-50 dark:bg-black min-h-screen text-slate-900 dark:text-white font-sans aurora-background">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="pt-28 pb-12"
                >
                    {/* --- Header / Hero --- */}
                    <header className="relative text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                            className="relative z-10"
                        >
                            <img
                                src={profile.imageUrl || `https://ui-avatars.com/api/?name=${profile.name}&background=0d1117&color=fff&bold=true&size=128`}
                                alt={profile.name}
                                className="w-36 h-36 rounded-full border-4 border-slate-200 dark:border-slate-800 object-cover mx-auto mb-4"
                            />
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">{profile.name}</h1>
                            {profile.branch && <p className="text-xl text-brand-secondary dark:text-cyan-400 mt-1">{profile.branch}</p>}

                            {socialLinks.length > 0 && (
                                <div className="flex justify-center items-center gap-6 mt-4">
                                    {socialLinks.map((link, index) => (
                                        <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="group">
                                            {getSocialIcon(link)}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </header>

                    {/* --- Main Content Grid --- */}
                    <motion.main
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                        }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
                    >
                        {/* Left Column */}
                        <div className="lg:col-span-1 space-y-8">
                            {hasAboutInfo && (
                                <InfoCard icon={UserIcon} title="About">
                                    {personal.email && <DisplayField label="Email" value={personal.email} icon={Mail} />}
                                    {personal.phone && <DisplayField label="Phone" value={personal.phone} icon={Phone} />}
                                    {personal.location && <DisplayField label="Location" value={personal.location} icon={MapPin} />}
                                </InfoCard>
                            )}
                            {hasAcademicInfo && (
                                <InfoCard icon={GraduationCap} title="Academic">
                                    {academic.collegeName && <DisplayField label="University" value={academic.collegeName} icon={BookOpen} />}
                                    {academic.degree && <DisplayField label="Degree" value={academic.degree} icon={GraduationCap} />}
                                    {academic.collegePercentile && <DisplayField label="CGPA" value={academic.collegePercentile} icon={Award} />}
                                </InfoCard>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-2 space-y-8">
                            {hasProjects && (
                                <InfoCard icon={GitBranch} title="Projects">
                                    <DisplayList items={academic.projects} />
                                </InfoCard>
                            )}
                            {hasInternships && (
                                <InfoCard icon={Briefcase} title="Internships & Experience">
                                    <DisplayList items={academic.internships} />
                                </InfoCard>
                            )}
                            {hasCertificates && (
                                <InfoCard icon={Award} title="Certificates">
                                    <DisplayList items={academic.certificates} />
                                </InfoCard>
                            )}
                            {hasAchievements && (
                                <InfoCard icon={Trophy} title="Achievements">
                                    <DisplayList items={personal.achievements} />
                                </InfoCard>
                            )}
                            {hasResumes && (
                                <InfoCard icon={FileText} title="Resumes">
                                    <DisplayResumeList items={academic.resumes} />
                                </InfoCard>
                            )}
                        </div>
                    </motion.main>
                </motion.div>
            </div>
        </div>
    );
};

export default PublicProfilePage;