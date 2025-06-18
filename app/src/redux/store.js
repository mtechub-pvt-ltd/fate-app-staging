import { configureStore } from '@reduxjs/toolkit';

// Example: Import a slice reducer (replace with your actual slices)
import sampleReducer from './features/sample/sampleSlice';
import userReducer from './features/user/userSlice'; // Import your slice reducers
import formReducer from './features/form/formSlice';
import tourGuideReducer from './features/tourGuide/tourGuideSlice';

const store = configureStore({
    reducer: {
        sample: sampleReducer, // Add reducers here
        user: userReducer,
        form: formReducer,
        tourGuide: tourGuideReducer, // Add tour guide reducer
    },
});

export default store;
