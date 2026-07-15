// Safely resolves a Firestore Timestamp (or a Timestamp-shaped legacy value) to a JS Date,
// falling back to a plain Date parse. Guards display code against malformed/legacy documents
// that don't have a real Timestamp in the expected field.
export const toDateSafe = (value) => {
    if (!value) return null;
    if (typeof value.toDate === 'function') return value.toDate();
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
};
