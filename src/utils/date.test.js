import { parseLocalDateString, getLocalDateString, toDateSafe } from './date';

test('parseLocalDateString + getLocalDateString round-trip without a UTC/local day shift', () => {
    const dateStr = '2026-07-16';
    expect(getLocalDateString(parseLocalDateString(dateStr))).toBe(dateStr);
});

test('parseLocalDateString anchors to local midnight, not UTC midnight', () => {
    const date = parseLocalDateString('2026-01-05');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(5);
    expect(date.getHours()).toBe(0);
});

test('toDateSafe resolves a Firestore-Timestamp-shaped value via toDate()', () => {
    const fakeTimestamp = { toDate: () => new Date('2026-01-01T00:00:00') };
    expect(toDateSafe(fakeTimestamp)).toEqual(new Date('2026-01-01T00:00:00'));
});

test('toDateSafe returns null for missing or unparseable values', () => {
    expect(toDateSafe(null)).toBeNull();
    expect(toDateSafe(undefined)).toBeNull();
    expect(toDateSafe('not a date')).toBeNull();
});
