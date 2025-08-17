export const GRADE_POINTS = { 
    'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 
    'D+': 4, 'D': 3, 'F': 2 
};

export const GRADES = Object.keys(GRADE_POINTS);

export const COIN_VALUES = {
    MARK_ATTENDANCE: 5, 
    DECREMENT_ATTENDANCE: -5,
    COMPLETE_TASK: 10, 
    UNCOMPLETE_TASK: -10,
    FINISH_POMODORO: 25,
};

// FINAL UPDATE: A hand-picked palette with 12 highly distinct colors.
export const COURSE_COLORS = [
    '#dc2626', // Red
    '#ea580c', // Orange
    '#ca8a04', // Gold
    '#65a30d', // Lime
    '#16a34a', // Green
    '#0d9488', // Teal
    '#0ea5e9', // Sky Blue
    '#4f46e5', // Indigo
    '#9333ea', // Purple
    '#db2777', // Pink
    '#78716c', // Stone
    '#c2410c', // Deep Orange
];

// A simple hashing function to get a consistent number from a string
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

// This function will always return the same color for the same courseId
export const getColorForCourse = (courseId) => {
    if (!courseId) return '#71717a'; // Default color
    const hash = simpleHash(courseId);
    return COURSE_COLORS[hash % COURSE_COLORS.length];
};