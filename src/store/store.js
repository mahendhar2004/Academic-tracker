import { configureStore } from '@reduxjs/toolkit';
import coursesReducer from './coursesSlice';
import profileReducer from './profileSlice';
import scheduleReducer from './scheduleSlice';
import deadlinesReducer from './deadlinesSlice';
import examMarksReducer from './examMarksSlice';
import tasksReducer from './tasksSlice';

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    profile: profileReducer,
    schedule: scheduleReducer,
    deadlines: deadlinesReducer,
    examMarks: examMarksReducer,
    tasks: tasksReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disabling check for non-serializable data like Timestamps
    }),
});
