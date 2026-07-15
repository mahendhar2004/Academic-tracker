import { useMemo } from 'react';
import { getMaxSemester } from '../utils/courses';

export const useAttendanceData = (allCourses) => {
  return useMemo(() => {
    if (!allCourses || allCourses.length === 0) {
      return { currentSemester: null, visibleCourses: [], hiddenCourses: [], previousSemesters: [] };
    }

    const maxSemester = getMaxSemester(allCourses, 0);
    const currentCourses = allCourses.filter(c => c.semester === maxSemester);

    const visible = currentCourses
      .filter(c => !c.isHidden)
      .sort((a, b) => a.name.localeCompare(b.name));
      
    const hidden = currentCourses
      .filter(c => c.isHidden)
      .sort((a, b) => a.name.localeCompare(b.name));

    const groupedBySem = allCourses.reduce((acc, course) => {
      if (course.semester !== maxSemester) {
        (acc[course.semester] = acc[course.semester] || []).push(course);
      }
      return acc;
    }, {});
    
    for (const sem in groupedBySem) {
      groupedBySem[sem].sort((a, b) => a.name.localeCompare(b.name));
    }

    const previous = Object.entries(groupedBySem).sort(([a], [b]) => b - a);

    return {
      currentSemester: maxSemester || null,
      visibleCourses: visible,
      hiddenCourses: hidden,
      previousSemesters: previous,
    };
  }, [allCourses]);
};