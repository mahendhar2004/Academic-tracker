// Safely resolves a Firestore Timestamp (or a Timestamp-shaped legacy value) to a JS Date,
// falling back to a plain Date parse. Guards display code against malformed/legacy documents
// that don't have a real Timestamp in the expected field.
export const toDateSafe = (value) => {
    if (!value) return null;
    if (typeof value.toDate === 'function') return value.toDate();
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
};

// Parses a plain "YYYY-MM-DD" string (e.g. from a date <input>) as LOCAL midnight.
// `new Date("YYYY-MM-DD")` parses as UTC midnight instead, which then displays as the
// previous day for any user west of UTC once read back with local-time getters -- the
// rest of this app (AddEditDeadlineModal, HomePage, CalendarPage, ...) reads dates back
// using local getters, so storage needs to be anchored to local midnight to match.
export const parseLocalDateString = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// Formats a Date as a local "YYYY-MM-DD" string -- the inverse of parseLocalDateString.
export const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
