import { useMemo } from 'react';

// Co-locating the constant here as it's a dependency for the calculation
const GRADE_POINTS = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D+': 4, 'D': 3, 'F': 2 };

export const usePerformanceGraphs = (semesters) => {
    const cpiGraphData = useMemo(() => {
        let cumulativeWeightedPoints = 0;
        let cumulativeCredits = 0;
        return [...semesters]
            .sort((a, b) => a.semester - b.semester)
            .map(sem => {
                let semWeightedPoints = 0;
                let semCredits = 0;
                sem.courses.forEach(course => {
                    semWeightedPoints += course.credits * (GRADE_POINTS[course.grade] || 0);
                    semCredits += course.credits;
                });
                cumulativeWeightedPoints += semWeightedPoints;
                cumulativeCredits += semCredits;
                return {
                    semester: sem.semester,
                    cpi: (cumulativeCredits > 0 ? cumulativeWeightedPoints / cumulativeCredits : 0).toFixed(2)
                };
            });
    }, [semesters]);

    const spiGraphData = useMemo(() => {
        return semesters
            .map(sem => ({ semester: sem.semester, spi: parseFloat(sem.spi) }))
            .sort((a, b) => a.semester - b.semester);
    }, [semesters]);

    return { cpiGraphData, spiGraphData };
};