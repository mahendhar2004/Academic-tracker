import { createSlice } from '@reduxjs/toolkit';

const coursesSlice = createSlice({
    name: 'courses',
    initialState: {
        all: [],
        loading: true,
    },
    reducers: {
        setCourses: (state, action) => {
            state.all = action.payload;
            state.loading = false;
        },
    },
});

export const { setCourses } = coursesSlice.actions;
export default coursesSlice.reducer;
