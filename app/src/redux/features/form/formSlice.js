import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    step: 1, // Track the current step (1-6)
    email: '',
    password: '',
    fullName: '',
    age: '',
    gender: '',
    questions: [], // Changed from an object to an array
    photos: [
        { name: '1', key: 'one', image: '' },
        { name: '2', key: 'two', image: '' },
        { name: '3', key: 'three', image: '' },
        { name: '4', key: 'four', image: '' },
        { name: '5', key: 'five', image: '' },
        { name: '6', key: 'six', image: '' },
        { name: '7', key: 'seven', image: '' },
        { name: '8', key: 'eight', image: '' },
        { name: '9', key: 'night', image: '' },
    ],
    profilePic: {
        uri: '',
    },
    preferences: {
        preferredAgeRange: {
            min: 25,
            max: 50,
        },
        preferredGender: 'SELECT_GENDER',
    },
    bio: {
        text: '',
        audio: null,
    },
};

const formSlice = createSlice({
    name: 'form',
    initialState,
    reducers: {
        setStep: (state, action) => {
            state.step = action.payload;
        },
        setEmailAndPassword: (state, action) => {
            const { email, password } = action.payload;
            state.email = email;
            state.password = password;
        },
        setPersonalDetails: (state, action) => {
            const { fullName, age, gender } = action.payload;
            state.fullName = fullName;
            state.age = age;
            state.gender = gender;
        },
        setQuestions: (state, action) => {
            state.questions = action.payload; // Store the entire list of questions
        },
        setQuestionAnswer: (state, action) => {
            const { questionNumber, answer } = action.payload;
            const existingIndex = state.questions.findIndex(
                (q) => q.id === questionNumber
            );

            if (existingIndex !== -1) {
                // Update existing question
                state.questions[existingIndex].answer = answer;
            }
        },
        setPhotos: (state, action) => {
            state.photos = [...action.payload]; // Update photos
        },
        setProfilePicture: (state, action) => {
            state.profilePic = action.payload; // Update profile picture
        },
        setPreferences: (state, action) => {
            state.preferences = {
                ...state.preferences, // Preserve existing preferences
                ...action.payload,   // Merge new values
            };
        },
        setBio: (state, action) => {
            state.bio = action.payload;
        },
        resetForm: () => initialState,
    },
});

export const {
    setStep,
    setEmailAndPassword,
    setPersonalDetails,
    setQuestionAnswer,
    setQuestions,
    setPhotos,
    setProfilePicture,
    setPreferences,
    setBio,
    resetForm,
} = formSlice.actions;

export default formSlice.reducer;
