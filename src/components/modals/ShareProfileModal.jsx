import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Loader2 } from 'lucide-react';
import GlassyModal from '../common/GlassyModal';

const ShareProfileModal = ({ isOpen, onClose, onConfirm, isSubmitting }) => {
    const [includeEmail, setIncludeEmail] = useState(false);
    const [includePhone, setIncludePhone] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIncludeEmail(false);
            setIncludePhone(false);
        }
    }, [isOpen]);

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title="Share Public Profile">
            <div className="space-y-6 max-w-sm">
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                    Anyone with the link can view this profile. Choose what personal contact
                    info, if any, to include -- everything else is left out by default.
                </p>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={includeEmail}
                            onChange={(e) => setIncludeEmail(e.target.checked)}
                            className="w-5 h-5 rounded accent-cyan-500"
                        />
                        <span className="text-slate-800 dark:text-slate-200">Include my email address</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={includePhone}
                            onChange={(e) => setIncludePhone(e.target.checked)}
                            className="w-5 h-5 rounded accent-cyan-500"
                        />
                        <span className="text-slate-800 dark:text-slate-200">Include my phone number</span>
                    </label>
                </div>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onConfirm({ includeEmail, includePhone })}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/50 text-cyan-600 dark:text-cyan-300 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (<><Share2 size={18} /> Generate & Copy Link</>)}
                </motion.button>
            </div>
        </GlassyModal>
    );
};

export default ShareProfileModal;
