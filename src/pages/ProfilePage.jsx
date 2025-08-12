import React from 'react';
import { motion } from 'framer-motion';
import { UserCircle2, LogOut, AlertTriangle, Edit } from 'lucide-react';

const ProfileInfoRow = ({ label, value }) => (
    <div className="py-4 border-b border-white/10">
        <span className="text-sm text-slate-400">{label}</span>
        <p className="text-white font-semibold text-lg">{value || '-'}</p>
    </div>
);

const ProfilePage = ({ profileData, onEditProfile, onResetData, onSignOut }) => {
    const personal = profileData.personal || {};

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><UserCircle2 className="text-cyan-400" />My Profile</h2>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onEditProfile} className="flex-shrink-0 flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/25 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-white/25">
                    <Edit size={18} /> Edit Profile
                </motion.button>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/10 to-white/0 bg-blue-900/10 saturate-150 backdrop-blur-2xl border border-cyan-400/20 p-8 rounded-xl shadow-lg">
                <div className="flex flex-col gap-2">
                    <ProfileInfoRow label="Name" value={personal.name} />
                    <ProfileInfoRow label="College Name" value={personal.collegeName} />
                    <ProfileInfoRow label="Personal Email" value={personal.personalEmail} />
                    <ProfileInfoRow label="College Email" value={personal.collegeEmail} />
                    <ProfileInfoRow label="Phone Number" value={personal.phone} />
                    <ProfileInfoRow label="Gender" value={personal.gender} />
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center gap-4">
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
