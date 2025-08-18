import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import GlassyModal from '../common/GlassyModal';

const ReauthModal = ({ isOpen, onClose, onConfirm }) => (
     <GlassyModal isOpen={isOpen} onClose={onClose} title="Security Check Required" customClasses="border-orange-500/50 bg-orange-900/10">
      <div className="space-y-6 text-center max-w-sm">
          <ShieldAlert size={48} className="mx-auto text-orange-400" />
          <div>
            <h3 className="text-lg font-bold text-white">Action Requires Recent Sign-In</h3>
            <p className="text-slate-300 mt-2">
                For your security, this sensitive action can only be performed shortly after signing in.
            </p>
            <p className="text-slate-300 mt-2">
                Please sign out and sign back in to continue.
            </p>
          </div>
          <div className="flex justify-center gap-4">
              <motion.button whileTap={{scale: 0.95}} onClick={onClose} className="bg-black/20 hover:bg-black/40 border border-white/20 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                  Cancel
              </motion.button>
              <motion.button whileTap={{scale: 0.95}} onClick={onConfirm} className="bg-orange-500/50 hover:bg-orange-500/80 border border-orange-400/50 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                  Sign Out
              </motion.button>
          </div>
    </div>
     </GlassyModal>
);

export default ReauthModal;