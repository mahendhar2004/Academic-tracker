export const createCourseSlice = (set) => ({
    allCourses: [],
    schedule: [],
    deadlines: [],
    examMarks: [],

    setCourses: (data) => set({ allCourses: data }),
    setSchedule: (data) => set({ schedule: data }),
    setDeadlines: (data) => set({ deadlines: data }),
    setExamMarks: (data) => set({ examMarks: data }),
});
