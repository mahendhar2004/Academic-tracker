import { getMaxSemester } from './courses';

test('getMaxSemester ignores missing/zero semester values instead of returning NaN', () => {
    const courses = [{ semester: 3 }, { semester: undefined }, { semester: 5 }, { semester: 0 }];
    expect(getMaxSemester(courses, 0)).toBe(5);
});

test('getMaxSemester falls back when no course has a valid semester', () => {
    expect(getMaxSemester([{ semester: undefined }], 1)).toBe(1);
});

test('getMaxSemester falls back for an empty/missing course list', () => {
    expect(getMaxSemester([], 2)).toBe(2);
    expect(getMaxSemester(null, 2)).toBe(2);
});
