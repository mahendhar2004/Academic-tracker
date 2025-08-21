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
    DAILY_CHECK_IN: 5,
    PROFILE_PERSONAL: 10,
    PROFILE_ACADEMIC: 20,
    PROFILE_PROJECTS: 30,
    PROFILE_CERTIFICATES: 30,
    PROFILE_ACHIEVEMENTS: 30,
    PROFILE_INTERNSHIPS: 100,
    PROFILE_RESUMES: 50,
    PROFILE_SOCIAL: 25,
    PROFILE_THEME: 15,
};

// REMOVED: The EXPENDITURE_CATEGORIES constant is no longer needed.

export const COURSE_COLORS = [
    '#dc2626', '#ea580c', '#ca8a04', '#65a30d', '#16a34a', '#0d9488',
    '#0ea5e9', '#4f46e5', '#9333ea', '#db2777', '#78716c', '#c2410c',
];

const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return Math.abs(hash);
};

export const getColorForCourse = (courseId) => {
    if (!courseId) return '#71717a';
    const hash = simpleHash(courseId);
    return COURSE_COLORS[hash % COURSE_COLORS.length];
};
