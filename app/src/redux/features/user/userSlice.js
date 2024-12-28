import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async Thunk to fetch user data
export const fetchUserData = createAsyncThunk(
    'user/fetchUserData',
    async (userId, thunkAPI) => {
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        data: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchUserData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default userSlice.reducer;
