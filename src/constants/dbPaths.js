import { appId } from '../firebase/config';

export const getBaseUserPath = (userId) => `artifacts/${appId}/users/${userId}`;

export const getCollectionPath = (userId, collectionName) => `${getBaseUserPath(userId)}/${collectionName}`;

export const getDocPath = (userId, collectionName, docId) => `${getBaseUserPath(userId)}/${collectionName}/${docId}`;

export const getProfilePath = (userId) => `${getBaseUserPath(userId)}/profile/data`;

export const getPerformanceTargetPath = (userId) => `${getBaseUserPath(userId)}/performanceTarget/target`;

export const COLLECTIONS = {
    COURSES: 'courses',
    SCHEDULE: 'schedule',
    DEADLINES: 'deadlines',
    EXAM_MARKS: 'examMarks',
    TASKS: 'tasks',
    CONTACTS: 'contacts',
    EXPENDITURES: 'expenditures',
    SCENARIOS: 'scenarios',
    PERFORMANCE_TARGET: 'performanceTarget' // Used in subcollection path logic
};
