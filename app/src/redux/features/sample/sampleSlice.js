import { createSlice } from '@reduxjs/toolkit';

const sampleSlice = createSlice({
    name: 'sample',
    initialState: { value: 0 },
    reducers: {
        increment: (state) => {
            state.value += 1;
        },
        decrement: (state) => {
            state.value -= 1;
        },
        incrementByAmount: (state, action) => {
            state.value += action.payload;
        },
    },
});

export const { increment, decrement, incrementByAmount } = sampleSlice.actions;
export default sampleSlice.reducer;
