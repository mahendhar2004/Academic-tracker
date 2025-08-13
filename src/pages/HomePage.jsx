import React from 'react';
import { motion } from 'framer-motion';
import AtAGlance from '../components/dashboard/AtAGlance';

const HomePage = ({ schedule, deadlines, tasks, courses, profileData }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.4 }}
        >
            <div className="max-w-2xl">
                <AtAGlance schedule={schedule} deadlines={deadlines} tasks={tasks} courses={courses} />
            </div>
        </motion.div>
    );
};

export default HomePage;
