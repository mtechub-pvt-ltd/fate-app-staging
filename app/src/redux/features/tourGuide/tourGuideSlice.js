import { createSlice } from '@reduxjs/toolkit';

// Tour guide steps for HomePage
const homePageSteps = [
    {
        id: 'home-matches',
        target: 'matches-grid',
        content: 'Based on your chat with Fate, we’ve matched you with these profiles. Tap the arrow to view more and disqualify anyone within 48 hours if not interested.',
        placement: 'center',
        order: 1,
    }
];

// Tour guide steps for Chat
const chatSteps = [
    {
        id: 'chat-list',
        target: 'chat-list',
        content: 'Here you can see all your conversation matches.',
        placement: 'bottom',
        order: 1,
    }
];

// Tour guide steps for Settings
const settingsSteps = [
    {
        id: 'settings-tokens',
        target: 'tokens-section',
        content: 'Check your available tokens here and purchase more when needed.',
        placement: 'bottom',
        order: 1,
    },
    {
        id: 'settings-options',
        target: 'settings-options',
        content: 'Various options to control your profile and account settings.',
        placement: 'top',
        order: 2,
    }
];

// Tour guide steps for Premium section
const premiumSteps = [
    {
        id: 'premium-roulette',
        target: 'premium-roulette',
        content: 'Choose to connect with someone by accepting or rejecting before starting a call,later you can add them in a match.',
        placement: 'top',
        order: 1,
    }
];

const initialState = {
    isNewUser: false,  // Flag to indicate if user is newly registered
    showHomePageTour: false, // Default is false, will be set to true for new users
    showSettingsTour: false, // Default is false, will be set to true for new users
    showChatTour: false,     // Default is false, will be set to true for new users
    showPremiumTour: false,  // Default is false, will be set to true for new users
    currentHomeStep: 0,
    currentSettingsStep: 0,
    currentChatStep: 0,
    currentPremiumStep: 0,
    homePageSteps,
    settingsSteps,
    chatSteps,
    premiumSteps,
    // Track if we need to navigate to the next screen in the tour
    shouldNavigateToChat: false,
    shouldNavigateToPremium: false,
    shouldNavigateToSettings: false
};

export const tourGuideSlice = createSlice({
    name: 'tourGuide',
    initialState,
    reducers: {
        setNewUserFlag: (state, action) => {
            state.isNewUser = action.payload;
            // Only show tours if this is a new user
            state.showHomePageTour = action.payload;
            state.showSettingsTour = action.payload;
            state.showChatTour = action.payload;
            state.showPremiumTour = action.payload;
        },
        nextHomeStep: (state) => {
            if (state.currentHomeStep < state.homePageSteps.length - 1) {
                state.currentHomeStep += 1;
            } else {
                // Last step on homepage, prepare to navigate to chat screen
                state.showHomePageTour = false;
                state.currentHomeStep = 0;
                state.shouldNavigateToChat = true;
            }
        },
        nextSettingsStep: (state) => {
            if (state.currentSettingsStep < state.settingsSteps.length - 1) {
                state.currentSettingsStep += 1;
            } else {
                state.showSettingsTour = false;
                state.currentSettingsStep = 0;
                // This is the last step in the tour flow
            }
        },
        nextChatStep: (state) => {
            if (state.currentChatStep < state.chatSteps.length - 1) {
                state.currentChatStep += 1;
            } else {
                // Last step on chat screen, prepare to navigate to premium screen
                state.showChatTour = false;
                state.currentChatStep = 0;
                state.shouldNavigateToPremium = true;
            }
        },
        nextPremiumStep: (state) => {
            if (state.currentPremiumStep < state.premiumSteps.length - 1) {
                state.currentPremiumStep += 1;
            } else {
                // Last step on premium screen, prepare to navigate to settings screen
                state.showPremiumTour = false;
                state.currentPremiumStep = 0;
                state.shouldNavigateToSettings = true;
            }
        },
        skipHomePageTour: (state) => {
            state.showHomePageTour = false;
            state.currentHomeStep = 0;
        },
        skipSettingsTour: (state) => {
            state.showSettingsTour = false;
            state.currentSettingsStep = 0;
        },
        skipChatTour: (state) => {
            state.showChatTour = false;
            state.currentChatStep = 0;
        },
        skipPremiumTour: (state) => {
            state.showPremiumTour = false;
            state.currentPremiumStep = 0;
        },
        resetTours: (state) => {
            state.showHomePageTour = state.isNewUser;
            state.showSettingsTour = state.isNewUser;
            state.showChatTour = state.isNewUser;
            state.showPremiumTour = state.isNewUser;
            state.currentHomeStep = 0;
            state.currentSettingsStep = 0;
            state.currentChatStep = 0;
            state.currentPremiumStep = 0;
        },
        // New actions to handle navigation between screens
        startChatTour: (state) => {
            state.showChatTour = true;
            state.currentChatStep = 0;
            state.shouldNavigateToChat = false;
        },
        startPremiumTour: (state) => {
            state.showPremiumTour = true;
            state.currentPremiumStep = 0;
            state.shouldNavigateToPremium = false;
        },
        startSettingsTour: (state) => {
            state.showSettingsTour = true;
            state.currentSettingsStep = 0;
            state.shouldNavigateToSettings = false;
        }
    },
});

export const {
    setNewUserFlag,
    nextHomeStep,
    nextSettingsStep,
    nextChatStep,
    nextPremiumStep,
    skipHomePageTour,
    skipSettingsTour,
    skipChatTour,
    skipPremiumTour,
    resetTours,
    startChatTour,
    startPremiumTour,
    startSettingsTour
} = tourGuideSlice.actions;

export default tourGuideSlice.reducer;