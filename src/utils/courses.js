// Highest semester number across a course list, ignoring courses with a
// missing/zero semester so one malformed document can't turn this into NaN.
export const getMaxSemester = (courses, fallback = 0) => {
    if (!courses || courses.length === 0) return fallback;
    const semesters = courses.map(c => c.semester).filter(Boolean);
    if (semesters.length === 0) return fallback;
    return Math.max(...semesters);
};
