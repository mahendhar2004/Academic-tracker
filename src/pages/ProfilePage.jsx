import React from 'react';
import { motion } from 'framer-motion';
import { UserCircle2, LogOut, AlertTriangle, GraduationCap } from 'lucide-react';
import EditableField from '../components/profile/EditableField';

const ProfilePage = ({ profileData, onSaveField, onResetData, onSignOut }) => {
    const personal = profileData.personal || {};
    const academic = profileData.academic || {};

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.4 }}
            className="flex justify-center"
        >
            <div className="max-w-5xl w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Details Section */}
                    <div className="bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3"><UserCircle2 className="text-cyan-400" />Personal Details</h3>
                        <EditableField label="Name" value={profileData.name} onSave={(val) => onSaveField('name', val)} />
                        <EditableField label="College Name" value={personal.collegeName} onSave={(val) => onSaveField('personal.collegeName', val)} />
                        <EditableField label="Personal Email" value={profileData.email} onSave={(val) => onSaveField('email', val)} />
                        <EditableField label="College Email" value={personal.collegeEmail} onSave={(val) => onSaveField('personal.collegeEmail', val)} />
                        <EditableField label="Phone Number" value={personal.phone} onSave={(val) => onSaveField('personal.phone', val)} />
                        <EditableField label="Gender" value={personal.gender} onSave={(val) => onSaveField('personal.gender', val)} />
                    </div>

                    {/* Academic Details Section */}
                    <div className="bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3"><GraduationCap className="text-cyan-400" />Academic Details</h3>
                        <EditableField label="Branch" value={academic.branch} onSave={(val) => onSaveField('academic.branch', val)} />
                        {/* Add more academic fields here in the future */}
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
