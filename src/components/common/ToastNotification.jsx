import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastNotification = ({ message, show, onHide, type = 'success' }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-500/50 text-red-700 dark:text-red-400';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-500/50 text-blue-700 dark:text-blue-400';
      case 'success':
      default:
        return 'bg-green-50 dark:bg-green-900/20 border-green-500/50 text-green-700 dark:text-green-400';
    }
  };

  const Icon = type === 'error' ? AlertCircle : type === 'info' ? Info : CheckCircle;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border ${getStyles()}`}
        >
          <Icon size={20} strokeWidth={2.5} />
          <p className="font-bold text-sm tracking-wide">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastNotification;
