import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
  Alert,
  BackHandler,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import { getAllQuestions, addAnswertoQuestion, getResponse } from '../../../../Services/Auth/SignupService';

import { useDispatch, useSelector } from 'react-redux';
import {
  setQuestionAnswer,
  setQuestions,
} from '../../../../redux/features/form/formSlice';

import OnboardingTooltip from './OnboardingTooltip';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';

const OnboardingQuestions = ({ route, navigation }) => {
  const dispatch = useDispatch();

  // Get email from Redux state - taking inspiration from HomePage
  const { email } = useSelector((state) => state.form);

  // Use isFocused hook to detect when screen gets focused
  const isFocused = useIsFocused();



  //  usama states
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [list, setList] = useState([
    {
      id: 1,
      question: 'How long have you been single?',
      answer: '',
      placeholder: "e.g l've been single for approximately 2,347,892,107 nano seconds, but who's counting?",
    },
  ]);
  const [activeIndex, setActiveIndex] = useState(route?.params?.activeIndex || 0);
  const [loading, setLoading] = useState(false);

  // Track if user came from Fate call screen
  const fromFateCall = route?.params?.fromFateCall || false;

  // Ref to prevent infinite navigation loops
  const navigationRef = useRef(false);
  // message state
  // message state
  const [flashMessage, setFlashMessage] = useState(false);
  const [flashMessageData, setFlashMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
  });
  const [showTooltip, setShowTooltip] = useState(false);
  const questionRef = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 10, y: 0, width: 0, height: 0 });

  // Add state to track if responses have been loaded to prevent infinite loops
  const [responsesLoaded, setResponsesLoaded] = useState(false);

  // Add state for full-screen overlay loader
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [hasServerResponses, setHasServerResponses] = useState(false);

  useEffect(() => {
    if (questionRef.current) {
      questionRef.current.measure((fx, fy, width, height, px, py) => {
        // Center the tooltip on the screen
        const screenWidth = responsiveWidth(50);
        const screenHeight = responsiveHeight(50);
        setTooltipPosition({
          x: screenWidth - width / 2,
          y: screenHeight / 2 - height / 2,
          width,
          height,
        });
      });
    }
  }, []);

  // Handle hardware back button when coming from Fate call
  useFocusEffect(
    useCallback(() => {
      // Reset navigation ref when screen gains focus
      navigationRef.current = false;

      const onBackPress = () => {
        if (fromFateCall && activeIndex === 0) {
          // If came from Fate call and on first question, go to ChooseHowToAnswer
          if (!navigationRef.current) {
            navigationRef.current = true;
            navigation.navigate('ChooseHowToAnswer');
          }
          return true; // Prevent default back behavior
        }
        return false; // Allow default back behavior
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Handle navigation events (swipe back, header back button)
      const beforeRemoveListener = navigation.addListener('beforeRemove', (e) => {
        if (fromFateCall && activeIndex === 0 && !navigationRef.current) {
          // Prevent default behavior
          e.preventDefault();

          // Set flag to prevent multiple navigations
          navigationRef.current = true;

          // Use setTimeout to avoid infinite loop by breaking the call stack
          setTimeout(() => {
            navigation.navigate('ChooseHowToAnswer');
          }, 0);
        }
      });

      return () => {
        backHandler.remove();
        beforeRemoveListener();
      };
    }, [fromFateCall, activeIndex, navigation])
  );

  const [tempVoiceText, setTempVoiceText] = useState('');
  const [isVoiceAvailable, setIsVoiceAvailable] = useState(true);
  const [partialResults, setPartialResults] = useState([]);
  const [recognized, setRecognized] = useState(false);

  // Voice setup and handling functions - improved like TestVoice.js
  const onSpeechStart = useCallback((e) => {
    console.log('onSpeechStart: ', e);
    setIsRecording(true);
    setError('');
    setRecognized(false);
    setTempVoiceText(''); // Clear temp text when starting
    console.log('Speech started - manual control only');
  }, []);

  const onSpeechRecognized = useCallback((e) => {
    console.log('onSpeechRecognized: ', e);
    setRecognized(true);
  }, []);

  const onSpeechEnd = useCallback((e) => {
    console.log('onSpeechEnd: ', e);
    setIsRecording(false);

    // Process any final voice text when speech ends
    setTimeout(() => {
      if (tempVoiceText && tempVoiceText.trim()) {
        console.log('Processing final voice text on speech end:', tempVoiceText);

        setVoiceText((prev) => {
          const currentText = prev || '';
          const newText = tempVoiceText.trim();
          const combined = currentText ? `${currentText.trim()} ${newText}` : newText;
          const finalText = combined.slice(0, 250);
          console.log('Final text being set on speech end:', finalText);
          return finalText;
        });

        // Update Redux immediately
        if (questions && questions[activeIndex]) {
          const updatedText = ((voiceText || '') + ' ' + tempVoiceText.trim()).trim().slice(0, 250);
          dispatch(
            setQuestionAnswer({
              questionNumber: questions[activeIndex]?.id,
              answer: updatedText,
            })
          );
        }
      }
    }, 100);
  }, [tempVoiceText, voiceText, questions, activeIndex, dispatch]);

  const onSpeechResults = useCallback((e) => {
    console.log('onSpeechResults: ', e);
    if (e?.value && Array.isArray(e.value) && e.value.length > 0) {
      const text = e.value[0];
      if (typeof text === 'string' && text.trim()) {
        // Store in temporary state for final processing when stopping
        setTempVoiceText(text.trim());
        console.log('Final voice text stored in temp (not displayed yet):', text.trim());
      }
    }
  }, []);

  const onSpeechPartialResults = useCallback((e) => {
    console.log('onSpeechPartialResults: ', e);
    if (e?.value && Array.isArray(e.value) && e.value.length > 0) {
      setPartialResults(e.value);
      const text = e.value[0];
      if (typeof text === 'string' && text.trim()) {
        setTempVoiceText(text.trim()); // Show live partial result
      }
    }
  }, []);

  const onSpeechError = useCallback((e) => {
    console.error('onSpeechError: ', e);
    setIsRecording(false);
    setRecognized(false);

    // Handle error properly - convert to string if it's an object
    let errorMessage = '';
    if (typeof e.error === 'string') {
      errorMessage = e.error;
    } else if (typeof e.error === 'object' && e.error !== null) {
      errorMessage = e.error.message || e.error.code || JSON.stringify(e.error);
    } else {
      errorMessage = 'Unknown error occurred';
    }

    setError(errorMessage);

    // Handle specific errors
    const errorCode = typeof e.error === 'string' ? e.error : e.error?.code || e.error?.message;

    // Handle error code "5" - Client side error (common on Android)
    if (errorCode === '5' || errorCode === 5) {
      console.log('Client side error (code 5) detected - attempting to save partial results');

      // Try to save any partial results that were captured before the error
      if (tempVoiceText && tempVoiceText.trim()) {
        console.log('Saving partial voice text due to client error:', tempVoiceText);

        // Add the captured text to the main text field
        setVoiceText((prev) => {
          const currentText = prev || '';
          const newText = tempVoiceText.trim();
          const combined = currentText ? `${currentText.trim()} ${newText}` : newText;
          const finalText = combined.slice(0, 250);
          console.log('Saved partial text after error:', finalText);
          return finalText;
        });

        // Update Redux with partial results
        if (questions && questions[activeIndex]) {
          const updatedText = ((voiceText || '') + ' ' + tempVoiceText.trim()).trim().slice(0, 250);
          dispatch(
            setQuestionAnswer({
              questionNumber: questions[activeIndex]?.id,
              answer: updatedText,
            })
          );
        }

        // Show success message that partial text was saved
        setFlashMessageData({
          message: 'Partial Text Saved',
          description: 'Your speech was partially captured and saved. You can continue typing or try recording again.',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.orange || '#FFA500',
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => setFlashMessage(false), 3000);
      } else {
        // No partial results to save
        setFlashMessageData({
          message: 'Recording Interrupted',
          description: 'Speech recognition was interrupted. Please try recording again.',
          type: 'error',
          icon: 'error',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => setFlashMessage(false), 3000);
      }

      // Clear temp text after processing
      setTempVoiceText('');
      return; // Exit early to avoid other error handling
    }

    // Clear temp text for other errors
    setTempVoiceText('');

    // Special handling for audio format error - this corrupts the entire audio session
    if (errorMessage.includes('IsFormatSampleRateAndChannelCountValid') || errorCode === 'start_recording') {
      console.log('Audio format error detected in OnboardingQuestions - performing deep cleanup');
      setIsVoiceAvailable(false);

      // Perform aggressive cleanup to reset audio session
      const resetAudioSession = async () => {
        try {
          console.log('Starting aggressive audio session reset...');

          // Multiple cleanup attempts
          for (let i = 0; i < 3; i++) {
            try {
              await Voice.stop();
              await Voice.cancel();
              await Voice.destroy();
              await Voice.removeAllListeners();
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (cleanupError) {
              console.log(`Cleanup attempt ${i + 1} completed:`, cleanupError);
            }
          }

          // Wait longer for audio session to fully reset
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Check if voice is available again after reset
          const available = await Voice.isAvailable();
          console.log('Voice available after reset:', available);
          setIsVoiceAvailable(available);

          if (available) {
            setError('');
            setFlashMessageData({
              message: 'Audio System Reset',
              description: 'Voice recognition has been restored. You can try recording again.',
              type: 'success',
              icon: 'check',
              backgroundColor: COLORS.primary || '#007AFF',
              textColor: COLORS.white,
            });
            setFlashMessage(true);
            setTimeout(() => setFlashMessage(false), 3000);
          } else {
            setError('Voice recording is not available on this device. Please type your answer instead.');
            setFlashMessageData({
              message: 'Voice Recording Unavailable',
              description: 'Please type your answer instead. Voice recording has been disabled due to audio system issues.',
              type: 'error',
              icon: 'error',
              backgroundColor: COLORS.red,
              textColor: COLORS.white,
            });
            setFlashMessage(true);
            setTimeout(() => setFlashMessage(false), 4000);
          }

        } catch (resetError) {
          console.error('Error during audio session reset:', resetError);
          setError('Audio system needs app restart to function properly.');
          setFlashMessageData({
            message: 'Audio System Error',
            description: 'Please restart the app to restore voice recognition functionality.',
            type: 'error',
            icon: 'error',
            backgroundColor: COLORS.red,
            textColor: COLORS.white,
          });
          setFlashMessage(true);
          setTimeout(() => setFlashMessage(false), 5000);
        }
      };

      resetAudioSession();
      return;
    }

    // Handle specific errors with better user feedback
    if (errorCode === 'permissions') {
      Alert.alert(
        'Permission Required',
        'Please grant microphone permission to use voice recognition.',
        [{ text: 'OK' }]
      );
    } else if (errorCode === 'recognizer_busy') {
      Alert.alert(
        'Recognition Busy',
        'Voice recognition is already in progress. Please wait.',
        [{ text: 'OK' }]
      );
    } else if (errorCode === 'no_match') {
      Alert.alert(
        'No Speech Detected',
        'No speech was recognized. Please try again.',
        [{ text: 'OK' }]
      );
    } else {
      setError(errorMessage);
    }
  }, [tempVoiceText, voiceText, questions, activeIndex, dispatch]);

  const initializeVoice = useCallback(() => {
    // Enhanced approach like TestVoice.js
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechRecognized = onSpeechRecognized;
  }, [onSpeechStart, onSpeechEnd, onSpeechResults, onSpeechError, onSpeechPartialResults, onSpeechRecognized]);

  // Helper function to provide Android-specific guidance
  const showAndroidSpeechGuidance = useCallback(() => {
    Alert.alert(
      'Speech Recognition Setup',
      'To fix speech recognition on Android:\n\n' +
      '1. Install Google app from Play Store\n' +
      '2. Go to Settings → Apps → Default Apps → Digital assistant app\n' +
      '3. Select Google as your assistant\n' +
      '4. Restart this app after making changes',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  }, []);



  const startRecording = useCallback(async () => {
    try {
      // Prevent recording when loading responses
      if (isLoadingResponses) return;

      // Check if character limit is reached
      if (voiceText.length >= 250) {
        setFlashMessageData({
          message: 'Character Limit Reached',
          description: 'You have reached the maximum limit of 250 characters. Please delete some text to continue recording.',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => setFlashMessage(false), 3000);
        return;
      }

      // Prevent multiple starts
      if (isRecording) {
        console.log('Voice recognition already started');
        return;
      }

      console.log('Starting comprehensive voice recognition diagnostics...');

      // Check available speech recognition services (Android specific)
      if (Platform.OS === 'android') {
        try {
          const services = await Voice.getSpeechRecognitionServices();
          console.log('Available speech recognition services:', services);

          // Check if Google Speech service is available
          const hasGoogleService = services.some(service =>
            service.includes('google') || service.includes('com.google.android.googlequicksearchbox')
          );

          if (!hasGoogleService) {
            console.warn('Google Speech Recognition service not found. Available services:', services);
            setFlashMessageData({
              message: 'Speech Service Issue',
              description: 'Google Speech Recognition service not available. Please install Google app or check your default speech recognition settings.',
              type: 'warning',
              icon: 'warning',
              backgroundColor: COLORS.orange || '#FFA500',
              textColor: COLORS.white,
            });
            setFlashMessage(true);
            setTimeout(() => setFlashMessage(false), 5000);
          }
        } catch (serviceError) {
          console.log('Could not check speech services:', serviceError);
        }
      }

      // Check if Voice recognition is available on the device
      const isVoiceAvailable = await Voice.isAvailable();
      if (!isVoiceAvailable) {
        setIsVoiceAvailable(false);
        setFlashMessageData({
          message: 'Voice Recognition Unavailable',
          description: 'Speech recognition is not available on this device. Please type your answer instead.',
          type: 'error',
          icon: 'error',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => setFlashMessage(false), 4000);
        return;
      }

      // Check microphone permission
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Speech recognition requires microphone access. Please enable it in settings.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open Settings', onPress: openSettings }
          ]
        );
        return;
      }

      console.log('Starting voice recognition...');

      // Stop TTS before starting Voice
      try {
        await Tts.stop();
        console.log('TTS stopped before Voice recording');
      } catch (ttsError) {
        console.log('TTS stop completed or was not running');
      }

      // Clear previous states
      setError('');
      setTempVoiceText('');
      setPartialResults([]);
      setRecognized(false);

      // Aggressive cleanup before starting - especially important after audio format errors
      console.log('Performing aggressive cleanup before start...');

      // Multiple cleanup attempts to ensure clean state
      for (let i = 0; i < 2; i++) {
        try {
          await Voice.stop();
          await Voice.cancel();
          await Voice.destroy();
          await Voice.removeAllListeners();
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (cleanupError) {
          console.log(`Pre-start cleanup attempt ${i + 1}:`, cleanupError);
        }
      }

      // Longer wait for audio session to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Re-check availability after cleanup
      const stillAvailable = await Voice.isAvailable();
      if (!stillAvailable) {
        setIsVoiceAvailable(false);
        setFlashMessageData({
          message: 'Voice Recognition Error',
          description: 'Voice recognition became unavailable. Please try again or type your answer.',
          type: 'error',
          icon: 'error',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => setFlashMessage(false), 3000);
        return;
      }

      // Initialize voice handlers BEFORE starting
      initializeVoice();

      // Try multiple Voice.start configurations as fallbacks
      console.log('Attempting to start voice recognition with multiple fallback strategies...');

      let voiceStarted = false;
      const fallbackConfigs = [
        // Strategy 1: Minimal configuration (most compatible)
        {
          name: 'Minimal Config',
          options: {
            EXTRA_PARTIAL_RESULTS: true,
            REQUEST_PERMISSIONS_AUTO: false,
          }
        },
        // Strategy 2: Basic configuration without timeout settings
        {
          name: 'Basic Config',
          options: {
            EXTRA_LANGUAGE_MODEL: 'LANGUAGE_MODEL_FREE_FORM',
            EXTRA_PARTIAL_RESULTS: true,
            REQUEST_PERMISSIONS_AUTO: false,
          }
        },
        // Strategy 3: Our current configuration
        {
          name: 'Optimized Config',
          options: {
            EXTRA_LANGUAGE_MODEL: 'LANGUAGE_MODEL_FREE_FORM',
            EXTRA_CALLING_PACKAGE: 'com.wscspeech',
            EXTRA_PARTIAL_RESULTS: true,
            REQUEST_PERMISSIONS_AUTO: false,
            EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 5000,
            EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 8000,
            EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 2000,
            EXTRA_MAX_RESULTS: 1,
          }
        },
        // Strategy 4: No options at all (simplest)
        {
          name: 'No Options',
          options: undefined
        }
      ];

      for (let i = 0; i < fallbackConfigs.length && !voiceStarted; i++) {
        const config = fallbackConfigs[i];
        try {
          console.log(`Trying voice start strategy ${i + 1}: ${config.name}`);

          if (config.options) {
            await Voice.start('en-US', config.options);
          } else {
            await Voice.start('en-US');
          }

          voiceStarted = true;
          console.log(`✅ Voice started successfully with strategy: ${config.name}`);
          break;
        } catch (strategyError) {
          console.log(`❌ Strategy ${i + 1} (${config.name}) failed:`, strategyError);

          // If this is not the last strategy, continue to next
          if (i < fallbackConfigs.length - 1) {
            console.log(`Trying next strategy...`);
            continue;
          }

          // If this is the last strategy, throw the error
          throw strategyError;
        }
      }

      if (!voiceStarted) {
        throw new Error('All voice recognition strategies failed');
      }

    } catch (e) {
      console.error('Error starting Voice with all strategies:', e);
      setIsRecording(false);

      // Enhanced error handling with specific guidance
      let errorMessage = '';
      if (typeof e === 'string') {
        errorMessage = e;
      } else if (e && e.message) {
        errorMessage = e.message;
      } else if (e && typeof e === 'object') {
        errorMessage = JSON.stringify(e);
      } else {
        errorMessage = 'Failed to start recording';
      }

      setError(errorMessage);

      // Provide specific guidance based on error type
      if (errorMessage.includes('IsFormatSampleRateAndChannelCountValid')) {
        setIsVoiceAvailable(false);
        setFlashMessageData({
          message: 'Audio System Error',
          description: 'The audio system needs to be reset. Voice recording is temporarily disabled.',
          type: 'error',
          icon: 'error',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
      } else if (errorMessage.includes('All voice recognition strategies failed')) {
        setFlashMessageData({
          message: 'Speech Recognition Setup Issue',
          description: 'Multiple setup attempts failed. Tap for detailed setup guide.',
          type: 'error',
          icon: 'error',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        // Show detailed guidance after a short delay
        setTimeout(() => {
          showAndroidSpeechGuidance();
        }, 2000);
      } else {
        setFlashMessageData({
          message: 'Recording Error',
          description: `${errorMessage}. Try: 1) Restart app, 2) Check microphone permissions, 3) Install Google app.`,
          type: 'error',
          icon: 'error',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
      }
      setFlashMessage(true);
      setTimeout(() => setFlashMessage(false), 6000); // Longer timeout for detailed messages
    }
  }, [isRecording, isLoadingResponses, voiceText.length, checkMicrophonePermission, initializeVoice, showAndroidSpeechGuidance]);

  const stopRecording = useCallback(async () => {
    try {
      console.log('Manually stopping voice recognition...');

      // Stop TTS first if it's running
      try {
        await Tts.stop();
        console.log('TTS stopped before stopping Voice');
      } catch (ttsError) {
        console.log('TTS stop completed during Voice stop');
      }

      // Add a small delay before stopping to let the speech recognition finish processing
      await new Promise(resolve => setTimeout(resolve, 200));

      await Voice.stop();
      setIsRecording(false);

      // Longer delay to ensure the stop is processed and results are captured
      await new Promise(resolve => setTimeout(resolve, 500));

      // Now append the recognized text to the main text field (like TestVoice.js)
      if (tempVoiceText && tempVoiceText.trim()) {
        console.log('Adding voice text to field:', tempVoiceText);

        setVoiceText((prev) => {
          const currentText = prev || '';
          const newText = tempVoiceText.trim();
          const combined = currentText ? `${currentText.trim()} ${newText}` : newText;
          const finalText = combined.slice(0, 250); // Ensure we don't exceed maxLength
          console.log('Combined text being set:', finalText);
          return finalText;
        });

        // Update Redux store with the new answer immediately
        if (questions && questions[activeIndex]) {
          const updatedText = ((voiceText || '') + ' ' + tempVoiceText.trim()).trim().slice(0, 250);
          dispatch(
            setQuestionAnswer({
              questionNumber: questions[activeIndex]?.id,
              answer: updatedText,
            })
          );
          console.log('Updated Redux with voice text:', updatedText);
        }

        console.log('Text added to field after stopping:', tempVoiceText);

        // Check if we hit the character limit
        setTimeout(() => {
          const currentLength = ((voiceText || '') + ' ' + tempVoiceText.trim()).trim().length;
          if (currentLength >= 250) {
            setFlashMessageData({
              message: 'Character Limit Reached',
              description: 'You have reached the maximum limit of 250 characters.',
              type: 'info',
              icon: 'info',
              backgroundColor: COLORS.orange || '#FFA500',
              textColor: COLORS.white,
            });
            setFlashMessage(true);
            setTimeout(() => setFlashMessage(false), 2500);
          }
        }, 100);
      } else {
        console.log('No temp voice text to add');
      }

      // Clear temp states after adding text
      setTempVoiceText('');
      setPartialResults([]);
      console.log('Voice recording stopped manually');
    } catch (e) {
      console.error('Error stopping Voice:', e);
      setError('Failed to stop recording');

      // Still try to add any temp text if available
      if (tempVoiceText && tempVoiceText.trim()) {
        setVoiceText((prev) => {
          const currentText = prev || '';
          const newText = tempVoiceText.trim();
          const combined = currentText ? `${currentText.trim()} ${newText}` : newText;
          return combined.slice(0, 250);
        });
        setTempVoiceText('');
        setPartialResults([]);
      }
    } finally {
      setIsRecording(false); // Always reset recording state like TestVoice.js
    }
  }, [tempVoiceText]);

  // Initialize voice recognition and handle cleanup - like TestVoice.js
  useEffect(() => {
    checkVoiceAvailability();
    initializeVoice();

    return () => {
      // Cleanup function to properly destroy Voice when component unmounts
      const cleanup = async () => {
        try {
          await Voice.stop();
          await Voice.cancel();
          await Voice.destroy();
          await Voice.removeAllListeners();
        } catch (error) {
          console.log('Cleanup error:', error);
        }
      };
      cleanup();
    };
  }, [initializeVoice]);

  // Check voice recognition availability - enhanced like TestVoice.js
  const checkVoiceAvailability = useCallback(async () => {
    try {
      const available = await Voice.isAvailable();
      console.log('Voice recognition available:', available);
      setIsVoiceAvailable(available);
      if (!available) {
        console.log('Voice recognition is not available on this device');
      }
      return available;
    } catch (error) {
      console.error('Error checking voice availability:', error);
      setIsVoiceAvailable(false);
      return false;
    }
  }, []);

  // microphone permission check helper
  const checkMicrophonePermission = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.MICROPHONE);
        console.log('iOS Microphone permission status:', result);
        return result === RESULTS.GRANTED;
      }
      if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        console.log('Android microphone permission status:', result);
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      return false;
    }
  }, []);

  const callQuestions = async () => {
    try {
      const response = await getAllQuestions();
      dispatch(setQuestions(response?.data));
      setList(response?.data || []); // Ensure list is not undefined
    } catch (error) {
      console.error('This is the error:', error);
    }
    finally {
      setLoading(false);
    }
  };
  const addAnswer = async () => {
    try {
      const value = await AsyncStorage.getItem('userDetail');
      const userDetail = JSON.parse(value);
      console.log('userDetail', userDetail?.id);
      // get item from question list based on active index
      const question = list?.[activeIndex];
      const data = {
        user_id: userDetail?.id,
        question_id: question?.id,
        answer: voiceText,
      };
      const response = await addAnswertoQuestion(data);
      console.log('response', response);
      if (activeIndex < list.length - 1) {
        setActiveIndex(activeIndex + 1);
        setVoiceText('');
        setIsRecording(false);
        setError('');
        Keyboard.dismiss();
        setLoading(false);
      } else {
        setLoading(false);
        navigation.navigate('AddYourPhotos');
      }
    } catch (error) {
      console.error('This is the error:', error);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (questions?.length === 0) {
      setLoading(true);
      callQuestions(); // Only fetch questions if Redux state is empty
    }
  }, [questions]);

  // redux thing 
  const questions = useSelector((state) => state.form.questions);

  useEffect(() => {
    // Fetch the current question's answer from Redux when activeIndex changes
    if (questions && questions.length > 0 && questions[activeIndex]) {
      const currentAnswer = questions[activeIndex]?.answer || '';
      console.log(`Question changed to index ${activeIndex}, setting voiceText to:`, currentAnswer);
      setVoiceText(currentAnswer);

      // Clear any temporary voice text when changing questions
      setTempVoiceText('');
      setPartialResults([]);
      setError('');
    }
  }, [activeIndex, questions]);

  const handleGetResponse = async (email) => {
    setIsLoadingResponses(true); // Show full-screen loader

    try {
      const data = {
        email: email,
      };
      const response = await getResponse(data);
      console.log('Response from server:', response);
      console.log('Current questions:', questions);

      // Check if response has data and it's not empty
      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log('Server has saved responses, updating Redux questions...');

        const serverResponses = response.data;
        console.log('Server responses array:', serverResponses);

        // Update each question in Redux by matching question_id with server response
        const updatedQuestions = questions.map((reduxQuestion) => {
          // Find matching question in server response by question_id
          const matchingServerResponse = serverResponses.find(
            (serverItem) => serverItem.question_id === reduxQuestion.question_id
          );

          console.log(`\n=== Processing Redux Question ===`);
          console.log(`Redux Question ID: "${reduxQuestion.question_id}"`);
          console.log(`Redux Question Text: "${reduxQuestion.question}"`);
          console.log(`Redux Question Current Answer: "${reduxQuestion.answer || 'EMPTY'}"`);

          if (matchingServerResponse && matchingServerResponse.response) {
            console.log(`✅ MATCH FOUND!`);
            console.log(`Server Response ID: "${matchingServerResponse.question_id}"`);
            console.log(`Server Response Answer: "${matchingServerResponse.response}"`);
            console.log(`Updating Redux question with server answer...`);

            return {
              ...reduxQuestion,
              answer: matchingServerResponse.response // Update answer with server response
            };
          }

          console.log(`❌ NO MATCH FOUND - Question will remain unchanged`);
          return reduxQuestion; // Keep question unchanged if no matching server response
        });

        // Update Redux store with the updated questions
        dispatch(setQuestions(updatedQuestions));

        // Mark that we have server responses
        setHasServerResponses(true);

        console.log('Successfully updated Redux questions with server responses');
        console.log('Updated questions:', updatedQuestions);

        // Check if all questions are answered
        const allQuestionsAnswered = updatedQuestions.every(q => q.answer && q.answer.trim().length > 0);

        if (allQuestionsAnswered) {
          // All questions are answered, navigate to next screen
          setShowTooltip(false);
          // Add a small delay to show the loader, then navigate
          setTimeout(() => {
            setIsLoadingResponses(false);
            console.log('Navigating to AddYourPhotos_Redux because all questions are answered');
            navigation.navigate('AddYourPhotos_Redux');
          }, 1500);
        } else {
          // Some questions are missing answers - find the first unanswered question
          const firstUnansweredIndex = updatedQuestions.findIndex(q => !q.answer || q.answer.trim().length === 0);

          console.log(`Found ${updatedQuestions.filter(q => q.answer && q.answer.trim().length > 0).length} answered questions out of ${updatedQuestions.length}`);
          console.log(`First unanswered question is at index: ${firstUnansweredIndex}`);

          if (firstUnansweredIndex !== -1) {
            // Set active index to the first unanswered question
            setActiveIndex(firstUnansweredIndex);

            // Update voiceText to the answer of the first unanswered question (should be empty)
            const firstUnansweredAnswer = updatedQuestions[firstUnansweredIndex]?.answer || '';
            setVoiceText(firstUnansweredAnswer);

            // Show user message about partial responses
            setFlashMessageData({
              message: 'Partial Responses Found',
              // description: `I found some of your previous answers! Please complete the remaining questions starting from question ${firstUnansweredIndex + 1}.`,
              description: `Agent missed some responses. Continue from question ${firstUnansweredIndex + 1}.`,
              type: 'info',
              icon: 'info',
              backgroundColor: COLORS.info,
              textColor: COLORS.black,
            });
            setFlashMessage(true);
            setTimeout(() => {
              setFlashMessage(false);
            }, 4000);

            console.log(`Navigated to first unanswered question at index ${firstUnansweredIndex}`);
          } else {
            // This shouldn't happen if allQuestionsAnswered is false, but just in case
            const currentQuestionAnswer = updatedQuestions[activeIndex]?.answer || '';
            setVoiceText(currentQuestionAnswer);
          }

          setIsLoadingResponses(false);
        }
      } else {
        console.log('No saved responses found on server, keeping current state');
        setHasServerResponses(false);
        setIsLoadingResponses(false);
      }

      // Mark responses as loaded to prevent further calls
      setResponsesLoaded(true);
    } catch (error) {
      console.error('Error fetching response:', error);
      setHasServerResponses(false);
      setIsLoadingResponses(false);
      setResponsesLoaded(true); // Set to true even on error to prevent infinite loops
    }
  };

  // Console log email from Redux when screen gets focused - taking inspiration from HomePage
  useEffect(() => {
    if (isFocused && email && questions.length > 0 && !responsesLoaded) {
      console.log('OnboardingQuestions_Redux screen focused');
      console.log('Email from Redux store:', email);
      console.log('Full Redux form state:', { email });
      console.log('Questions loaded, calling handleGetResponse...');
      handleGetResponse(email); // Call the function to get response
    }

    // Reset responsesLoaded when screen loses focus to allow reloading on next focus
    if (!isFocused && responsesLoaded) {
      console.log('Screen lost focus, resetting responsesLoaded for next visit');
      setResponsesLoaded(false);
    }
  }, [isFocused, email, questions, responsesLoaded]);

  const handleNext = () => {
    if (!questions || !questions?.[activeIndex]) {
      // Handle case where questions or current question is not available
      setFlashMessageData({
        message: 'Error',
        description: 'Question data is not available. Please try again.',
        type: 'info',
        icon: 'info',
        backgroundColor: COLORS.red,
        textColor: COLORS.white,
      });
      setFlashMessage(true);
      setTimeout(() => {
        setFlashMessage(false);
        setLoading(false);
      }, 3000);
      return;
    }

    if (voiceText && voiceText.length >= 5) {
      // Save the current answer to Redux
      dispatch(
        setQuestionAnswer({
          questionNumber: questions[activeIndex]?.id,
          answer: voiceText,
        })
      );

      setLoading(false);

      if (activeIndex < questions.length - 1) {
        // Move to next question
        const nextIndex = activeIndex + 1;
        setActiveIndex(nextIndex);

        // Get the next question's existing answer from Redux or set empty string
        const nextQuestionAnswer = questions[nextIndex]?.answer || '';
        setVoiceText(nextQuestionAnswer);

        console.log(`Moving to question ${nextIndex + 1}, existing answer:`, nextQuestionAnswer);
      } else {
        console.log('All questions answered', JSON.stringify(questions, null, 2));
        navigation.navigate('AddYourPhotos_Redux');
      }
    } else {
      setFlashMessageData({
        message: 'Answer Required',
        description: 'Answer should be at least 5 characters long.',
        type: 'info',
        icon: 'info',
        backgroundColor: COLORS.red,
        textColor: COLORS.white,
      });
      setFlashMessage(true);
      setTimeout(() => {
        setFlashMessage(false);
        setLoading(false);
      }, 2000);
    }
  };



  return (
    <GradientBackground>
      {flashMessage && <FlashMessages flashMessageData={flashMessageData} />}

      {/* Full-screen overlay loader for server response processing */}
      {isLoadingResponses && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 1)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <View style={{
            // backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: responsiveWidth(8),
            borderRadius: 20,
            alignItems: 'center',
            // borderWidth: 1,
            // borderColor: 'rgba(255, 255, 255, 0.2)',
          }}>
            <ActivityIndicator size="large" color={COLORS.white} />
            <Text style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2.2),
              fontWeight: '600',
              marginTop: responsiveHeight(2),
              textAlign: 'center',
            }}>
              Loading ...
            </Text>

          </View>
        </View>
      )}

      <SafeAreaView style={{ flex: 1 }}>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            flex: 1,
            opacity: isLoadingResponses ? 0.3 : 1, // Dim the background when overlay is showing
          }}
        // keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : -40}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                marginTop: responsiveHeight(3),
                justifyContent: 'space-between',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                disabled={isLoadingResponses} // Disable when loading responses
                onPress={() => {
                  if (isLoadingResponses) return; // Prevent action when loading responses

                  if (activeIndex > 0) {
                    // Decrease active index
                    const previousIndex = activeIndex - 1;

                    // Fetch the answer from Redux for the previous question
                    const previousAnswer = questions?.[previousIndex]?.answer || '';

                    // Update the active index and set the previous answer in voiceText
                    setActiveIndex(previousIndex);
                    setVoiceText(previousAnswer);
                  } else {
                    // If came from Fate call and on first question, go to ChooseHowToAnswer
                    if (fromFateCall && !navigationRef.current) {
                      navigationRef.current = true;
                      navigation.navigate('ChooseHowToAnswer');
                    } else if (!fromFateCall) {
                      // Default behavior: go back to previous screen
                      navigation.goBack();
                    }
                  }
                }}
              >
                <Icon name={'chevron-left'}
                  style={{
                    padding: responsiveWidth(3.5),
                    marginBottom: responsiveWidth(2),
                    opacity: isLoadingResponses ? 0.5 : 1, // Dim when disabled
                  }}
                  size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            {
              (loading && !isLoadingResponses) && (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              )
            }

            <ScrollView
              style={{
                display: (loading && !isLoadingResponses) ? 'none' : 'flex',
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: Platform.OS === 'android' ? responsiveHeight(2) : 0,
              }}
              keyboardShouldPersistTaps="handled"
            >

              {questions && questions?.[activeIndex] ? (
                <View style={{ flex: 1, paddingHorizontal: responsiveWidth(5) }}>
                  {/* Progress Bar */}
                  <View style={{
                    height: 5,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 2,
                    marginTop: responsiveHeight(2),
                    marginBottom: responsiveHeight(4),
                  }}>
                    <View style={{
                      height: 5,
                      backgroundColor: COLORS.primary,
                      borderRadius: 2,
                      width: `${((activeIndex + 1) / questions.length) * 100}%`,
                    }} />
                  </View>

                  {/* Question */}
                  <Text
                    style={{
                      fontSize: responsiveFontSize(3.2),
                      color: 'white',
                      textAlign: 'left',
                      lineHeight: responsiveFontSize(4),
                      marginBottom: responsiveHeight(3),
                      fontFamily: fonts.PoppinsSemiBold,
                    }}
                  >
                    {questions?.[activeIndex]?.question}
                  </Text>

                  {/* Input Field with Microphone */}
                  <View style={{
                    marginBottom: responsiveHeight(2),
                    flexDirection: 'row',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  }}>
                    <TextInput
                      autoCapitalize={'none'}
                      editable={!isLoadingResponses && !isRecording}
                      style={{
                        paddingHorizontal: responsiveWidth(3),
                        paddingTop: responsiveWidth(4),
                        paddingBottom: responsiveWidth(4),
                        color: 'white',
                        fontSize: responsiveFontSize(1.5),
                        fontFamily: fonts.PoppinsMedium,
                        width: '85%',
                      }}
                      multiline={true}
                      placeholder={isVoiceAvailable ? "Tap to record or type your answer" : "Type your answer here"}
                      placeholderTextColor={'rgba(255, 255, 255, 0.6)'}
                      value={voiceText}
                      maxLength={250}
                      onChangeText={text => {
                        setVoiceText(text);
                        // Update Redux immediately when user types manually
                        if (questions && questions[activeIndex]) {
                          dispatch(
                            setQuestionAnswer({
                              questionNumber: questions[activeIndex]?.id,
                              answer: text,
                            })
                          );
                        }
                      }}
                      returnKeyType="done"
                    />

                    {/* Microphone Icon */}
                    <View
                      style={{
                        width: '15%',
                        alignItems: 'center',
                      }}
                    >
                      <TouchableOpacity
                        disabled={isLoadingResponses || voiceText.length >= 250 || !isVoiceAvailable}
                        style={{
                          marginTop: responsiveHeight(1),
                          marginBottom: responsiveHeight(1),
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: isRecording ? '#E91E63' :
                            (!isVoiceAvailable ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'),
                          justifyContent: 'center',
                          alignItems: 'center',
                          opacity: (isLoadingResponses || voiceText.length >= 250 || !isVoiceAvailable) ? 0.5 : 1,
                        }}
                        onPress={isRecording ? stopRecording : startRecording}>
                        <Icon
                          name={isRecording ? 'stop' : (!isVoiceAvailable ? 'microphone-slash' : 'microphone')}
                          size={18}
                          color={(!isVoiceAvailable || voiceText.length >= 250) ? '#888' : 'white'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Character Count */}
                  <Text
                    style={{
                      color: voiceText?.length >= 240 ? '#FFA500' : 'rgba(255, 255, 255, 0.6)',
                      fontSize: responsiveFontSize(1.4),
                      fontFamily: fonts.JostRegular,
                      textAlign: 'right',
                      marginBottom: responsiveHeight(1),
                    }}>
                    {voiceText?.length}/250
                  </Text>

                  {/* Voice Status Messages */}
                  {!isVoiceAvailable && (
                    <Text
                      style={{
                        color: '#FFA500',
                        fontSize: responsiveFontSize(1.3),
                        fontFamily: fonts.JostRegular,
                        textAlign: 'center',
                        marginBottom: responsiveHeight(1),
                      }}>
                      Voice recording not available - Please type your answer
                    </Text>
                  )}

                  {isVoiceAvailable && voiceText.length >= 240 && voiceText.length < 250 && (
                    <Text
                      style={{
                        color: '#FFA500',
                        fontSize: responsiveFontSize(1.3),
                        fontFamily: fonts.PoppinsMedium,
                        textAlign: 'center',
                        marginBottom: responsiveHeight(1),
                      }}>
                      {250 - voiceText.length} characters remaining for recording
                    </Text>
                  )}

                  {/* Recording Status with enhanced feedback */}
                  {isRecording && (
                    <View style={{
                      alignItems: 'center',
                      marginBottom: responsiveHeight(3),
                    }}>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(233, 30, 99, 0.2)',
                        paddingHorizontal: responsiveWidth(4),
                        paddingVertical: responsiveHeight(1),
                        borderRadius: 20,
                      }}>
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#E91E63',
                          marginRight: 8,
                        }} />
                        <Text style={{
                          color: 'white',
                          fontSize: responsiveFontSize(1.6),
                          fontFamily: fonts.JostMedium,
                        }}>
                          {recognized ? 'Recognized...' : 'Listening...'}
                        </Text>
                      </View>

                      {/* Show partial results while recording */}
                      {tempVoiceText ? (
                        <View style={{
                          marginTop: responsiveHeight(1),
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          paddingHorizontal: responsiveWidth(3),
                          paddingVertical: responsiveHeight(0.5),
                          borderRadius: 10,
                          maxWidth: '90%',
                        }}>
                          <Text style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: responsiveFontSize(1.4),
                            fontFamily: fonts.JostRegular,
                            textAlign: 'center',
                            fontStyle: 'italic',
                          }}>
                            "{tempVoiceText}"
                          </Text>
                        </View>
                      ) : null}

                      <Text style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: responsiveFontSize(1.3),
                        fontFamily: fonts.JostRegular,
                        marginTop: responsiveHeight(1),
                        textAlign: 'center',
                      }}>
                        Tap the microphone to stop
                      </Text>
                    </View>
                  )}

                  {/* Error Messages */}
                  {voiceText.length >= 250 && (
                    <View style={{
                      backgroundColor: 'rgba(255, 165, 0, 0.2)',
                      padding: responsiveHeight(1.5),
                      borderRadius: 10,
                      marginBottom: responsiveHeight(2),
                    }}>
                      <Text style={{
                        color: '#FFA500',
                        fontSize: responsiveFontSize(1.4),
                        fontFamily: fonts.PoppinsMedium,
                        textAlign: 'center',
                      }}>
                        Character limit reached
                      </Text>
                    </View>
                  )}

                  {/* Spacer to push Next button to bottom */}
                  <View style={{ flex: 1 }} />

                </View>
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: COLORS.white, fontSize: responsiveFontSize(2) }}>No question to display.</Text>
                </View>
              )}
            </ScrollView>
            <View style={{
              paddingHorizontal: responsiveWidth(5),
              paddingBottom: Platform.OS === 'android' ? responsiveHeight(5) : responsiveHeight(2),
              paddingTop: responsiveHeight(1),
              display: (loading && !isLoadingResponses) ? 'none' : 'flex',
            }}>
              <PrimaryButton
                loading={loading}
                title="Next"
                disabled={isLoadingResponses} // Disable button when loading responses
                onPress={() => {
                  if (isLoadingResponses) return; // Prevent action when loading responses

                  Keyboard.dismiss();
                  setLoading(true);

                  // Check if the voiceText is empty or less than 5 characters
                  if (!voiceText || voiceText.trim().length < 5) {
                    setFlashMessageData({
                      message: 'Answer Required',
                      description: 'Answer should be at least 5 characters long',
                      type: 'info',
                      icon: 'info',
                      backgroundColor: COLORS.red,
                      textColor: COLORS.white,
                    });

                    setFlashMessage(true);

                    // Dismiss the flash message after 2 seconds
                    setTimeout(() => {
                      setFlashMessage(false);
                      setLoading(false);
                    }, 2000);
                  } else {
                    // If valid, proceed with the next steps
                    handleNext(); // Proceed to the next question
                  }
                }}
                style={{
                  width: '100%',
                  // height: responsiveHeight(6.5),
                  display: isRecording ? 'none' : 'flex',

                }}
                backgroundColor={COLORS.white}
                textColor={COLORS.primary}
              />

            </View>
          </View>
          {showTooltip && <OnboardingTooltip />}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};
var styles = StyleSheet.create({
  buttonText: {
    fontSize: 18,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
});
export default OnboardingQuestions;
