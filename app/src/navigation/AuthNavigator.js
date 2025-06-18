import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Auth Screens
import Login_N from '../views/screens/Auth/Login/Login_N';
import SignUp_N from '../views/screens/Auth/SignUp/SignUp_N';
import ForgotPassword_N from '../views/screens/Auth/ForgotPassword/ForgotPassword_N';
import VerificationOTP from '../views/screens/Auth/ForgotPassword/VerificationOTP';
import CreateNewPassword from '../views/screens/Auth/ForgotPassword/CreateNewPassword';

// Onboarding Question Screens
import OnboardingQuestions from '../views/screens/Auth/OnboardingQuestions/OnboardingQuestions';
import OnboardingQuestions_Redux from '../views/screens/Auth/OnboardingQuestions/OnboardingQuestions_Redux';
import BasicProfileInfo from '../views/screens/Auth/OnboardingQuestions/BasicProfileInfo';
import AddYourPhotos from '../views/screens/Auth/OnboardingQuestions/AddYourPhotos';
import AddYourPhotos_Redux from '../views/screens/Auth/OnboardingQuestions/AddYourPhotos_Redux';
import LocationPermission from '../views/screens/Auth/OnboardingQuestions/LocationPermission';
import ProfilePreference from '../views/screens/Auth/OnboardingQuestions/ProfilePreference';
import OnboardingVoiceNotes from '../views/screens/Auth/OnboardingQuestions/OnboardingVoiceNotes';
import OnboardingVoiceNotesTest from '../views/screens/Auth/OnboardingQuestions/OnboardingVoiceNotesTest';
import OnboardingVoiceNotesIOS from '../views/screens/Auth/OnboardingQuestions/OnboardingVoiceNotesIOS';
import ProfileCreationLoader from '../views/screens/Auth/OnboardingQuestions/ProfileCreationLoader';
import LoadingForQs from '../views/screens/Auth/OnboardingQuestions/LoadingForQs';
import LoadingForQs_test from '../views/screens/Auth/OnboardingQuestions/LoadingForQs_test';

const Stack = createStackNavigator();

const AuthNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Authentication */}
            <Stack.Screen name="SignUp_N" component={SignUp_N} />
            <Stack.Screen name="Login_N" component={Login_N} />
            <Stack.Screen name="ForgotPassword_N" component={ForgotPassword_N} />
            <Stack.Screen name="VerificationOTP" component={VerificationOTP} />
            <Stack.Screen name="CreateNewPassword" component={CreateNewPassword} />

            {/* Profile Setup */}
            <Stack.Screen name="BasicProfileInfo" component={BasicProfileInfo} />
            <Stack.Screen name="OnboardingQuestions" component={OnboardingQuestions} />
            <Stack.Screen name="OnboardingQuestions_Redux" component={OnboardingQuestions_Redux} />
            <Stack.Screen name="LoadingForQs_test" component={LoadingForQs_test} />
            <Stack.Screen name="AddYourPhotos" component={AddYourPhotos} />
            <Stack.Screen name="AddYourPhotos_Redux" component={AddYourPhotos_Redux} />
            <Stack.Screen name="ProfilePreference" component={ProfilePreference} />
            <Stack.Screen name="OnboardingVoiceNotesTest" component={OnboardingVoiceNotesTest} />
            <Stack.Screen
                name="ProfileCreationLoader"
                component={ProfileCreationLoader}
                options={{
                    gestureEnabled: false, // Disable swipe gestures on iOS
                    headerLeft: () => null, // Remove back button from header
                }}
            />
            <Stack.Screen name="LoadingForQs" component={LoadingForQs} />
            <Stack.Screen name="OnboardingVoiceNotes" component={OnboardingVoiceNotes} />
            <Stack.Screen name="OnboardingVoiceNotesIOS" component={OnboardingVoiceNotesIOS} />
            <Stack.Screen name="LocationPermission" component={LocationPermission} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;