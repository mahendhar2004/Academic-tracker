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

export const COURSE_THEMES = [
    { label: 'Red', value: 'red', hex: '#ef4444' },
    { label: 'Orange', value: 'orange', hex: '#f97316' },
    { label: 'Amber', value: 'amber', hex: '#f59e0b' },
    { label: 'Green', value: 'green', hex: '#22c55e' },
    { label: 'Emerald', value: 'emerald', hex: '#10b981' },
    { label: 'Teal', value: 'teal', hex: '#14b8a6' },
    { label: 'Cyan', value: 'cyan', hex: '#06b6d4' },
    { label: 'Sky', value: 'sky', hex: '#0ea5e9' },
    { label: 'Blue', value: 'blue', hex: '#3b82f6' },
    { label: 'Indigo', value: 'indigo', hex: '#6366f1' },
    { label: 'Violet', value: 'violet', hex: '#8b5cf6' },
    { label: 'Purple', value: 'purple', hex: '#a855f7' },
    { label: 'Fuchsia', value: 'fuchsia', hex: '#d946ef' },
    { label: 'Pink', value: 'pink', hex: '#ec4899' },
    { label: 'Rose', value: 'rose', hex: '#f43f5e' },
    { label: 'Slate', value: 'slate', hex: '#64748b' },
];

export const COURSE_COLORS = COURSE_THEMES.map(t => t.hex);

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
