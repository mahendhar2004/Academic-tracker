import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassyModal from '../common/GlassyModal';
import { Loader2 } from 'lucide-react';

const BugReportModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('idle'); // idle, sending, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');

        // --- IMPORTANT ---
        // Replace this URL with your actual Google Form's response URL
        const googleFormUrl = "https://docs.google.com/forms/u/0/d/e/1FAIpQLScAazlToXCYHz82cAaUYPCy-oLgCUXQajvw6dZ_SEFItBtpEQ/formResponse";

        // Replace these with the actual 'name' attributes from your Google Form's input fields
        const titleEntry = "entry.342898630";
        const descriptionEntry = "entry.2147275163";

        const formData = new FormData();
        formData.append(titleEntry, title);
        formData.append(descriptionEntry, description);

        try {
            // 'no-cors' makes the response opaque -- this can only ever catch a network-level
            // failure (DNS/connection), never a rejected/misconfigured form submission on
            // Google's end. Keep the success copy honest about that instead of claiming
            // confirmed delivery.
            await fetch(googleFormUrl, {
                method: 'POST',
                mode: 'no-cors', // Important for sending to Google Forms
                body: formData,
            });
            setStatus('success');
            setTitle('');
            setDescription('');
            setTimeout(onClose, 2000); // Close modal after 2 seconds on success
        } catch (error) {
            console.error('Error submitting bug report:', error);
            setStatus('error');
        }
    };

    return (
        <GlassyModal isOpen={isOpen} onClose={onClose} title="Report an Issue">
            <form onSubmit={handleSubmit} className="space-y-4 w-80 md:w-96">
                {status === 'success' ? (
                    <div className="text-center py-8">
                        <h3 className="text-xl font-bold text-green-400">Thank You!</h3>
                        <p className="text-slate-300 mt-2">Your feedback is on its way.</p>
                    </div>
                ) : (
                    <>
                        <div>
                            <label htmlFor="bugTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Issue Title</label>
                            <input
                                id="bugTitle"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Page not loading"
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-900 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="bugDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                            <textarea
                                id="bugDescription"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Please describe the issue in detail, including the steps to reproduce it."
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 h-32 resize-none text-slate-900 dark:text-white"
                                required
                            />
                        </div>
                        {status === 'error' && <p className="text-red-400 text-sm text-center">Failed to submit. Please try again.</p>}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full bg-cyan-500/50 hover:bg-cyan-500/80 border border-cyan-400/50 text-white font-bold py-3 px-4 rounded-lg transition-colors !mt-6 disabled:opacity-60"
                        >
                            {status === 'sending' ? <Loader2 className="animate-spin mx-auto" /> : 'Submit Report'}
                        </motion.button>
                    </>
                )}
            </form>
        </GlassyModal>
    );
};

export default BugReportModal;