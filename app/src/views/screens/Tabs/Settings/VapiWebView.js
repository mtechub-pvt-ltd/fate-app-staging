import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  Platform,
  ScrollView,
  ImageBackground,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import fonts from '../../../../consts/fonts';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import Vapi from '@vapi-ai/react-native';


const vapi = new Vapi('d65afa88-3b99-452b-bd09-d575d8df07d0'); // Replace with your actual API key

// Helper component for instruction items
const InstructionItem = ({ icon, text }) => (
  <View style={styles.instructionItem}>
    <View style={styles.instructionIconCircle}>
      <Image source={icon} style={styles.instructionIcon} />
    </View>
    <Text style={styles.instructionText}>{text}</Text>
  </View>
);


function HomePage({ route, navigation }) {
  const { email } = route.params;

  const userInitiatedEndCall = useRef(false);

  const [isCallConnected, setIsCallConnected] = useState(false);
  const [isCallStarting, setIsCallStarting] = useState(false);
  const [animatedDots, setAnimatedDots] = useState('');
  const [isProcessingContinue, setIsProcessingContinue] = useState(false);
  const [showPostCallButtons, setShowPostCallButtons] = useState(false);

  // Memoize title to prevent unnecessary re-renders
  const titleText = React.useMemo(() => {
    if (!email) return "Loading user information...";
    if (isCallStarting) return `Starting call with Fate${animatedDots}`;
    if (isCallConnected) return "Talking to Fate...";
    return "Call Compeleted";
  }, [email, isCallStarting, isCallConnected, animatedDots]);

  useEffect(() => {
    let dotAnimationInterval;
    if (isCallStarting) {
      dotAnimationInterval = setInterval(() => {
        setAnimatedDots(dots => {
          if (dots.length < 3) {
            return dots + '.';
          }
          return '';
        });
      }, 500); // Adjust speed as needed
    } else {
      setAnimatedDots(''); // Reset dots when not starting
      if (dotAnimationInterval) {
        clearInterval(dotAnimationInterval);
      }
    }
    return () => clearInterval(dotAnimationInterval); // Cleanup interval
  }, [isCallStarting]);

  useEffect(() => {
    // Clean up any existing listeners first
    vapi.removeAllListeners();

    const callStartedListener = vapi.on('call-start', () => {
      try {
        console.log('VapiWebView: Event - call-start');
        setIsCallStarting(true);
        setIsCallConnected(false);
      } catch (e) {
        console.error('VapiWebView: Error in call-start listener:', e);
      }
    });

    const callConnectedListener = vapi.on('speech-start', () => {
      try {
        console.log('VapiWebView: Event - speech-start (call connected)');
        setIsCallConnected(true);
        setIsCallStarting(false);
      } catch (e) {
        console.error('VapiWebView: Error in speech-start listener:', e);
      }
    });

    const callEndedListener = vapi.on('call-end', (event) => {
      try {
        const reason = event?.endedReason;
        console.log('VapiWebView: Event - call-end. User initiated end:', userInitiatedEndCall.current, 'Reason:', reason);
        console.log('VapiWebView: Current states - isCallConnected:', isCallConnected, 'isCallStarting:', isCallStarting, 'showPostCallButtons:', showPostCallButtons);

        // Always reset call states first
        setIsCallConnected(false);
        setIsCallStarting(false);

        // Show post-call buttons for successful call completion
        setShowPostCallButtons(true);

        if (
          reason &&
          (reason.startsWith('pipeline-error') ||
            reason.startsWith('call.in-progress.error') ||
            reason === 'assistant-error' ||
            reason === 'unknown-error' ||
            reason === 'ejected')
        ) {
          // Error call end - don't show post-call buttons for errors
          console.log(`VapiWebView: Call Error - The call ended due to an error: ${reason}`);
          setShowPostCallButtons(false);
        }
      } catch (e) {
        console.error('VapiWebView: Error in call-end listener:', e);
      } finally {
        userInitiatedEndCall.current = false;
      }
    });

    const callErrorListener = vapi.on('error', (error) => {
      try {
        console.error('VapiWebView: Event - error:', error);

        // Reset call states
        setIsCallConnected(false);
        setIsCallStarting(false);

        if (error?.error?.msg === "Meeting has ended") {
          console.log("Meeting Ended: The meeting was ended by the agent or completed successfully.");
          setShowPostCallButtons(true);
        } else {
          console.log(`Call Error - A call error occurred: ${error?.message || JSON.stringify(error) || 'Unknown Vapi error'}`);
          setShowPostCallButtons(false);
        }
      } catch (e) {
        console.error('VapiWebView: Error in error listener itself:', e);
      } finally {
        userInitiatedEndCall.current = false;
      }
    });

    const messageListener = vapi.on('message', (message) => {
      try {
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          if (message.role === 'user') {
            console.log('VapiWebView: User final transcript:', message.transcript);
          } else if (message.role === 'assistant') {
            console.log('VapiWebView: Assistant final transcript:', message.transcript);
          }
        }
      } catch (e) {
        console.error('VapiWebView: Error in message listener:', e);
      }
    });

    // Only start the call automatically if email is available
    if (email) {
      console.log('VapiWebView: Email available, starting call automatically');
      startCall();
    } else {
      console.log('VapiWebView: Email not available yet, waiting...');
    }

    // Cleanup listeners on component unmount
    return () => {
      console.log('VapiWebView: Cleaning up Vapi listeners.');
      vapi.removeAllListeners();
    };
  }, [email]); // Add email as dependency

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isCallStarting || isCallConnected) {
          // End call directly without confirmation modal
          endCall().then(() => {
            navigation.goBack();
          }).catch(error => {
            console.error('Error ending call on back press:', error);
            navigation.goBack(); // Go back anyway if there's an error
          });
          return true;
        }
        return false;
      };

      // Listener for hardware back button on Android
      const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Listener for navigation actions (e.g., swipe back, header back button)
      const beforeRemoveSubscription = navigation.addListener('beforeRemove', (e) => {
        if ((isCallStarting || isCallConnected) && !e.data.action.payload?.source) {
          e.preventDefault();
          // End call directly without confirmation modal
          endCall().then(() => {
            navigation.dispatch(e.data.action);
          }).catch(error => {
            console.error('Error ending call on navigation:', error);
            navigation.dispatch(e.data.action); // Continue navigation anyway if there's an error
          });
        }
      });

      return () => {
        backHandlerSubscription.remove();
        beforeRemoveSubscription(); // Correct way to remove listener from navigation.addListener
      };
    }, [isCallStarting, isCallConnected, navigation])
  );

  const handleConfirmEndCall = async () => {
    try {
      setShowPostCallButtons(false);
      await endCall();
      navigation.goBack();
    } catch (error) {
      console.error('VapiWebView: Error in handleConfirmEndCall:', error);
      console.log("VapiWebView: Error - An unexpected error occurred while ending the call and navigating back.");
    }
  };

  const handleContinue = async () => {
    if (isProcessingContinue) {
      console.log('VapiWebView: Continue button already processing, ignoring...');
      return;
    }

    console.log('VapiWebView: Continue button pressed by user.');
    setIsProcessingContinue(true);

    try {
      console.log('VapiWebView: Ending call from continue button...');
      await vapi.stop();
      navigation.navigate("OnboardingQuestions_Redux", {
        fromFateCall: true,
        activeIndex: 0
      });
    } catch (error) {
      console.error('VapiWebView: Error in handleContinue:', error);
    } finally {
      setIsCallConnected(false);
      setIsCallStarting(false);
      setShowPostCallButtons(false);
      setIsProcessingContinue(false);
    }
  };

  const startCall = async () => {
    try {
      // Check if email is available before starting the call
      if (!email) {
        console.error('VapiWebView: Cannot start call - email not available from Redux');
        console.log('VapiWebView: Call Start Error - Email is required to start the call');
        return;
      }

      console.log('VapiWebView: Attempting to start call with email:', email);
      setIsCallStarting(true);
      setIsCallConnected(false);
      setShowPostCallButtons(false);
      userInitiatedEndCall.current = false;

      const assistantOverrides = {
        variableValues: {
          userId: email,
          sessionId: 'session-' + Date.now(),
          userEmail: email
        }
      };

      await vapi.start('f8d8fd4b-7ac9-475b-8655-b373e24116c2', assistantOverrides);
      console.log('VapiWebView: Call start initiated successfully.');
    } catch (error) {
      console.error('VapiWebView: Error starting call:', error);
      setIsCallStarting(false);
      setIsCallConnected(false);
      console.log(`VapiWebView: Call Start Error - Failed to start the call: ${error?.message || 'Unknown error'}`);
    }
  };

  const endCall = async () => {
    try {
      console.log('VapiWebView: Attempting to end call...');

      // Set states immediately for instant UI feedback
      setIsCallConnected(false);
      setIsCallStarting(false);
      setShowPostCallButtons(true);

      await vapi.stop();
      console.log('VapiWebView: Call stop command sent successfully.');
    } catch (error) {
      console.error('VapiWebView: Error stopping call via vapi.stop():', error);
      // Ensure UI reflects the attempt to end even on error
      setIsCallConnected(false);
      setIsCallStarting(false);
      setShowPostCallButtons(true);
      console.log(`VapiWebView: Call End Error - Failed to stop the call: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={Images.fateBkg}
        style={{
          flex: 1,
        }}>


        <ScrollView contentContainerStyle={styles.scrollableContentContainer} showsVerticalScrollIndicator={false} bounces={true}>


          <Text
            style={[styles.initialTitle, {
              marginTop: responsiveHeight(4)
            }]}
          >
            {titleText}
          </Text>
          {
            isCallConnected ? (
              <LottieView
                source={require('../../../../assets/lottie/audio-animation.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
                speed={2}
              />
            ) : <Image source={Images.logoGlow} style={styles.soundWaveImage} resizeMode="contain" />
          }
          <View style={styles.instructionsContainer}>
            <InstructionItem icon={Images.mic} text="Please allow microphone access when prompted" />
            <InstructionItem icon={Images.audio} text="Speak clearly and naturally" />
            <InstructionItem icon={Images.sound} text="Find a quiet space for the best experience" />
          </View>

        </ScrollView>


        <View style={styles.footerContainer}>
          {(isCallConnected || showPostCallButtons) && (
            <Text style={[styles.warningCallText, {
              backgroundColor: COLORS.warning + '20',
              padding: 10,
              color: COLORS.warning,
              borderRadius: 15,
              overflow: 'hidden'
            }]}>
              Tap Continue to move forward, or End Call to stop. Your answers won't be saved if you end the call.
            </Text>
          )}

          {(isCallConnected || showPostCallButtons) && (
            <View style={styles.buttonRowContainer}>
              <PrimaryButton
                title="End Call"
                loading={false}
                onPress={handleConfirmEndCall}
                style={{ width: responsiveWidth(43) }}
                backgroundColor={COLORS.white}
                textColor={COLORS.primary}
              />
              <PrimaryButton
                title="Continue"
                onPress={handleContinue}
                disabled={isProcessingContinue}
                style={{ width: responsiveWidth(43) }}
                backgroundColor={COLORS.secondary2}
                textColor={COLORS.white}
              />
            </View>
          )}
        </View>

      </ImageBackground>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.black || '#000000', // Fallback color
  },
  gradientBackground: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: responsiveWidth(5),
    paddingTop: Platform.OS === 'android' ? responsiveHeight(3) : responsiveHeight(2),
    paddingBottom: responsiveHeight(1),
    width: '100%',
    alignItems: 'flex-start', // Align back button to the left
  },
  backButton: {
    padding: responsiveWidth(1), // Add some padding for easier touch
  },
  scrollableContentContainer: {
    flexGrow: 1,
    // justifyContent: 'center', // Center content vertically if it's short
    // alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
    paddingBottom: responsiveHeight(2), // Padding at the bottom of scroll content
  },
  stateSpecificContent: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: responsiveHeight(2), // Add some vertical padding
  },
  loader: {
    marginVertical: responsiveHeight(3),
  },
  title: {
    fontSize: responsiveFontSize(3.2),
    color: COLORS.white || '#FFFFFF',
    fontFamily: fonts.primary?.Bold || 'System', // Fallback font
    textAlign: 'center',
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(3),
  },
  characterImage: {
    width: responsiveWidth(45),
    height: responsiveWidth(45),
    marginBottom: responsiveHeight(2),
  },
  soundWaveImage: {
    width: '100%',
    height: responsiveHeight(22),
    marginVertical: responsiveHeight(3),
    alignSelf: 'center',
    resizeMode: 'contain'
  },
  lottieAnimation: { // Added style for Lottie animation
    height: responsiveHeight(15),
    width: responsiveHeight(15), // Assuming a square Lottie, adjust if needed
    alignSelf: 'center',
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(3),
  },
  imagePlaceholder: {
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  placeholderText: {
    color: '#AAA',
    fontSize: responsiveFontSize(2),
  },
  initialStateContainer: {
    justifyContent: 'center', // Center content in the initial state view
    paddingBottom: responsiveHeight(5), // Extra padding if it's the only thing on screen
  },
  initialTitle: {
    fontSize: responsiveFontSize(3),
    color: COLORS.white || '#FFFFFF',
    fontFamily: fonts.primary?.Bold || 'System',
    textAlign: 'center',
    marginBottom: responsiveHeight(1.5),
    fontFamily: fonts.PoppinsMedium
  },
  initialSubtitle: {
    fontSize: responsiveFontSize(2),
    color: COLORS.lightGray || '#D3D3D3',
    fontFamily: fonts.primary?.Regular || 'System',
    textAlign: 'center',
    marginBottom: responsiveHeight(5),
    paddingHorizontal: responsiveWidth(5),
  },
  startCallButton: {
    backgroundColor: COLORS.primaryPink || '#E91E63',
    width: responsiveWidth(70),
    paddingVertical: responsiveHeight(1.8),
    borderRadius: responsiveWidth(10), // More rounded corners
  },
  startCallButtonText: {
    color: COLORS.white || '#FFFFFF',
    fontFamily: fonts.primary?.Bold || 'System',
    fontSize: responsiveFontSize(2.2),
  },
  instructionsContainer: {
    marginTop: responsiveHeight(2),
    width: '100%',
    maxWidth: responsiveWidth(90), // Max width for instructions
    paddingHorizontal: responsiveWidth(2), // Inner padding for instruction container
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveHeight(2.5),
  },
  instructionIconCircle: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: responsiveWidth(30),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveWidth(4),
  },
  instructionIcon: {
    width: 25,
    height: 25,
    alignSelf: 'center'
  },
  instructionText: {
    fontSize: responsiveFontSize(1.9),
    color: COLORS.white || '#FFFFFF',
    fontFamily: fonts.primary?.Regular || 'System',
    flexShrink: 1,
    lineHeight: responsiveFontSize(2.5), // Improved line height
    fontFamily: fonts.PoppinsMedium
  },
  footerContainer: {
    paddingHorizontal: responsiveWidth(5), // Adjusted to responsiveWidth(5) to allow buttonRowContainer to be responsiveWidth(90)
    paddingBottom: Platform.OS === 'ios' ? responsiveHeight(4) : responsiveHeight(3),
    paddingTop: responsiveHeight(1.5),
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 9999
  },
  warningCallText: { // Style for the new warning text
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: responsiveHeight(1.5),
    fontSize: responsiveFontSize(1.8),
    fontFamily: fonts.PoppinsRegular,
    paddingHorizontal: responsiveWidth(5),
  },
  buttonRowContainer: { // New style for buttons in a row
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: responsiveWidth(90), // Container for two buttons
    alignSelf: 'center',
  },
  resetButton: {
    marginTop: responsiveHeight(1),
    alignSelf: 'center',
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(4),
  },
  resetButtonText: {
    color: COLORS.lightGray,
    fontSize: responsiveFontSize(1.6),
    fontFamily: fonts.PoppinsRegular,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  endCallButton: {
    backgroundColor: COLORS.white || '#FFFFFF',
    width: '100%',
    maxWidth: responsiveWidth(80), // Max width for the button
    paddingVertical: responsiveHeight(1.8),
    borderRadius: responsiveWidth(10), // More rounded corners
  },
  endCallButtonText: {
    color: COLORS.primaryPink || '#E91E63',
    fontFamily: fonts.primary?.Bold || 'System',
    fontSize: responsiveFontSize(2.2),
  },
  // Styles for Confirmation Bottom Sheet
  bottomSheetContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomSheetTitle: {
    fontSize: responsiveFontSize(2.5),
    fontFamily: fonts.primary?.Bold || 'System',
    color: COLORS.black,
    marginBottom: responsiveHeight(1),
  },
  bottomSheetMessage: {
    fontSize: responsiveFontSize(2),
    fontFamily: fonts.primary?.Regular || 'System',
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: responsiveHeight(3),
    paddingHorizontal: responsiveWidth(5),
  },
});

export default HomePage;
