import React from 'react';
import { motion } from 'framer-motion';
import AtAGlance from '../components/dashboard/AtAGlance';

const HomePage = ({ schedule, deadlines, tasks, courses }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.4 }}
        >
            <AtAGlance schedule={schedule} deadlines={deadlines} tasks={tasks} courses={courses} />
        </motion.div>
    );
};

export default HomePage;
