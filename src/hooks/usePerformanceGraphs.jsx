import { useMemo } from 'react';
import { GRADE_POINTS } from '../constants';

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