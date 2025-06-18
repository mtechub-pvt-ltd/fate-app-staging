import {
  View, Text, SafeAreaView, StyleSheet,
  TouchableOpacity, Platform, ScrollView, KeyboardAvoidingView,
  Image, ActivityIndicator, Button, BackHandler, Alert
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import InCallManager from 'react-native-incall-manager';

import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import TopBar from '../../../../components/TopBar/TopBar';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import { useDispatch, useSelector } from 'react-redux';
import { setStep } from '../../../../redux/features/form/formSlice';
import Images from '../../../../consts/Images';
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import Vapi from '@vapi-ai/react-native';
import {
  PhoneCall,
  Checks,
  Placeholder,
  Waveform
} from 'phosphor-react-native';

// Initialize Vapi with your API key
const vapi = new Vapi('d65afa88-3b99-452b-bd09-d575d8df07d0'); // Replace with your actual API key

function ChooseHowToAnswer({ route, navigation }) {
  const dispatch = useDispatch();

  // Get email from Redux state to use as userId
  const email = useSelector(state => state.form.email);

  // Reference to bottom sheet
  const fateAgentBottomSheetRef = useRef(null);

  // useEffect(() => {
  //   fateAgentBottomSheetRef.current.open()
  // }, [])

  // Navigation guard to prevent duplicate navigation
  const hasNavigatedRef = useRef(false);

  // Selected option state (1 = Fate Agent, 2 = Typing)
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [callStarting, setCallStarting] = useState(false);
  const [isCallConnected, setIsCallConnected] = useState(false);

  // message state
  const [flashMessage, setFlashMessage] = useState(false);
  const [flashMessageData, setFlashMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
  });

  // Track response saving state
  const [savingResponses, setSavingResponses] = useState(false);

  // Unified navigation function with guard
  const navigateAfterCall = () => {
    if (hasNavigatedRef.current) {
      console.log('Navigation already triggered, skipping');
      return;
    }
    hasNavigatedRef.current = true;
    fateAgentBottomSheetRef.current.close();
    console.log('Navigating to next screen after call completion');

    // if (Platform.OS === 'ios') {
    //   try {

    //     navigation.navigate('OnboardingQuestions_Redux');

    //   } catch (error) {
    //     console.log('Navigation error, trying alternative route');
    //     navigation.navigate('LoadingForQs_test');
    //   }
    // } else {
    navigation.navigate('OnboardingQuestions_Redux');
    // }
  };

  // Set up event listeners for Vapi call status changes
  useEffect(() => {
    // Store listeners for cleanup
    let listeners = [];

    // Set up event listeners for call status changes
    const callStartListener = vapi.on('call-start', () => {
      console.log('Call started');
      setCallStarting(true);
      setLoading(true);
    });
    listeners.push(callStartListener);

    const speechStartListener = vapi.on('speech-start', () => {
      console.log('Call speech started');
      setIsCallConnected(true);
      setCallStarting(false);
      setLoading(false);
      // We'll add a small delay to ensure UI updates before any other operations
      setTimeout(() => {
        console.log('Speech connection stabilized');
      }, 300);
    });
    listeners.push(speechStartListener);

    const callEndListener = vapi.on('call-end', () => {
      console.log('Call ended event received');

      // Update states
      setIsCallConnected(false);
      setCallStarting(false);
      setLoading(false);

      // Only navigate if tool call was completed (responses were saved)
      if (savingResponses) {
        console.log('Call ended after saving responses, navigating now...');
        setSavingResponses(false);
        setTimeout(() => {
          endCall()
          navigateAfterCall();
        }, 300);
      } else {
        console.log('Call ended early, no navigation');
        setSavingResponses(false);
      }

      // Close the bottom sheet
      fateAgentBottomSheetRef.current?.close();
    });
    listeners.push(callEndListener);

    const errorListener = vapi.on('error', (error) => {
      console.error('Call error:', error);
      setIsCallConnected(false);
      setCallStarting(false);
      setLoading(false);
      setSavingResponses(false);

      // if (error.error.type == 'ejected') {
      //   alert('Call ended by system');
      // } else {
      //   // Show error message
      //   setFlashMessage(true);
      //   setFlashMessageData({
      //     message: 'Call Error',
      //     description: 'There was an error connecting to the Fate Agent. Please try again.',
      //     type: 'error',
      //     icon: 'error',
      //   });

      //   // Hide message after 3 seconds
      //   setTimeout(() => {
      //     setFlashMessage(false);
      //   }, 3000);
      // }


    });
    listeners.push(errorListener);

    // Add message listener to track tool messages
    const messageListener = vapi.on('message', (message) => {
      console.log('Call message received:', JSON.stringify(message, null, 2));

      // Check for tool-calls message type which means the assistant is using the save_response_tool
      if (message?.type === 'tool-calls' || message?.toolCalls || message?.content?.tool) {
        console.log('Tool call detected, saving responses...');
        setSavingResponses(true);
      }

      // Check for tool call result success - this is the primary navigation trigger
      // if (message?.type === 'tool_call_result' && message?.result === 'Success.') {
      //   console.log('Tool call result success, ending call and navigating...');
      //   setTimeout(() => {
      //     vapi.stop()
      //     endCall(); // This will trigger call-end event
      //     navigateAfterCall();
      //   }, 1000);
      // }

      if (
        message?.type === 'tool_call_result' &&
        message?.tool_call_id?.includes('end_call_tool')
      ) {
        console.log('Final tool completed — force stopping call');
        endCall(); // <- triggers vapi.stop() and navigation
        navigateAfterCall();
      }


      // Fallback: Check for conversation-update with tool success
      if (message?.type === 'conversation-update' &&
        message?.conversation?.some(item =>
          item.role === 'tool' && item.content === 'Success.')) {
        console.log('Tool call successful via conversation-update, ending call...');
        setTimeout(() => {
          endCall(); // This will trigger call-end event
          navigateAfterCall();
        }, 1000);
      }

      // Handle hang message type (but don't navigate - let call-end handle it)
      if (message?.type === 'hang') {
        console.log('Hang message received, call ended by system');
        endCall(); // Just in case Vapi doesn’t kill the session
        // Call will be handled by call-end listener
      }
    });
    listeners.push(messageListener);

    // Cleanup listeners on component unmount
    return () => {
      // Clean up all listeners
      listeners.forEach(listener => {
        try {
          // Different Vapi versions might have different cleanup methods
          if (listener && typeof listener === 'object') {
            // Try different possible methods to remove listeners
            if (typeof listener.remove === 'function') {
              listener.remove();
            } else if (typeof listener.off === 'function') {
              listener.off();
            } else if (typeof listener.unsubscribe === 'function') {
              listener.unsubscribe();
            }
          }
        } catch (error) {
          console.warn('Error removing listener:', error);
        }
      });
    };
  }, [navigation]);

  // Clean up calls when component unmounts
  useEffect(() => {
    return () => {
      // End call when component unmounts
      if (isCallConnected || callStarting) {
        console.log('Component unmounting, ensuring call is ended');
        try {
          vapi.stop();
          // Make sure to stop InCallManager to release audio resources
          InCallManager.stop();
          console.log('Audio session stopped during unmount');
        } catch (error) {
          console.error('Error during cleanup on unmount:', error);
          // Try stopping InCallManager separately if the combined cleanup fails
          try {
            InCallManager.stop();
          } catch (e) {
            console.error('Error stopping InCallManager during unmount:', e);
          }
        }
      } else {
        // If there was no active call, make sure InCallManager is still stopped
        try {
          InCallManager.stop();
        } catch (e) {
          console.error('Error stopping InCallManager during unmount:', e);
        }
      }
    };
  }, []);

  // Handle hardware back button on Android
  useEffect(() => {
    const handleBackButton = () => {
      if (isCallConnected || callStarting) {
        console.log('Hardware back pressed, ending call');
        endCall();
        // Return true to prevent default back action while call is ending
        return true;
      }
      return false; // Let the default back action happen when no call is active
    };

    // Add event listener for Android hardware back button
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    }

    // Cleanup
    return () => {
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
      }
    };
  }, [isCallConnected, callStarting]);

  // Function to handle option selection
  const handleSelectOption = (option) => {
    setSelectedOption(option);
  };

  // Function to start the Vapi call
  const startCall = async () => {
    try {
      setLoading(true);
      setCallStarting(true);

      // Enable speaker mode on all platforms, especially important for Android
      try {
        // Start managing audio session
        InCallManager.start({ media: 'audio' });
        // Force speaker on immediately
        InCallManager.setForceSpeakerphoneOn(true);
        console.log('Speaker mode enabled');
      } catch (audioError) {
        console.error('Error enabling speaker mode:', audioError);
        // Continue with call even if speaker mode fails
      }

      const assistantOverrides = {
        variableValues: {
          userId: email || 'anonymous-user', // Use email from Redux state, fallback to anonymous
          sessionId: 'session-' + Date.now() // Create a unique session ID
        }
      };

      // Start the call with the assistant ID
      await vapi.start('93ca982c-663f-4238-a350-6548fb7044d9', assistantOverrides);
      console.log('Call started successfully');
    } catch (error) {
      console.error('Error starting call:', error);
      setCallStarting(false);
      setLoading(false);

      // Show error message
      setFlashMessage(true);
      setFlashMessageData({
        message: 'Call Error',
        description: 'Could not start the call with Fate Agent. Please try again.',
        type: 'error',
        icon: 'error',
      });

      // Hide message after 3 seconds
      setTimeout(() => {
        setFlashMessage(false);
      }, 3000);

      // Clean up audio session if call failed
      try {
        InCallManager.stop();
      } catch (e) {
        console.error('Error stopping InCallManager:', e);
      }
    }
  };  // Function to end the Vapi call manually
  const endCall = async () => {
    // Prevent multiple calls to endCall
    if (!isCallConnected && !callStarting) {
      console.log('Call already ended or never started');
      return;
    }

    try {
      console.log('Attempting to end call');
      // Update states first to prevent further processing
      setIsCallConnected(false);
      setCallStarting(false);
      setLoading(false);
      setSavingResponses(false);

      // Close the bottom sheet if it's open
      if (fateAgentBottomSheetRef.current) {
        fateAgentBottomSheetRef.current.close();
      }

      // Stop the Vapi call
      await vapi.stop();
      console.log('Call ended successfully');

      // Stop InCallManager to release audio resources
      try {
        InCallManager.stop();
        console.log('Audio session stopped');
      } catch (e) {
        console.error('Error stopping InCallManager:', e);
      }
    } catch (error) {
      console.error('Error ending call:', error);

      // Ensure InCallManager is stopped even if vapi.stop fails
      try {
        InCallManager.stop();
      } catch (e) {
        console.error('Error stopping InCallManager:', e);
      }
    }
  };

  // Function to handle next button press
  const handleNext = () => {
    if (selectedOption === null) {
      // Show error message if no option selected
      setFlashMessage(true);
      setFlashMessageData({
        message: 'Selection Required',
        description: 'Please select how you want to answer onboarding questions',
        type: 'error',
        icon: 'error',
      });

      // Hide message after 3 seconds
      setTimeout(() => {
        setFlashMessage(false);
      }, 3000);
      return;
    }

    if (selectedOption === 1) {
      // Open the bottom sheet and start the call
      // fateAgentBottomSheetRef.current.open();
      // // Start the call after a short delay to ensure the bottom sheet is open
      // setTimeout(() => {
      //   startCall();
      // }, 500);
      navigation.navigate('VapiWebView', {
        email: email
      })
    } else {
      console.log('Typing selected');
      if (Platform.OS === 'ios') {
        try {
          navigation.navigate('OnboardingQuestions_Redux');
        } catch (error) {
          console.log('Navigation error, trying alternative route');
          // navigation.navigate('LoadingForQs_test');
          navigation.navigate('OnboardingQuestions_Redux');
        }
      } else {
        // navigation.navigate('LoadingForQs_test');
        navigation.navigate('OnboardingQuestions_Redux');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GradientBackground>
        {flashMessage && <FlashMessages flashMessageData={flashMessageData} />}

        <SafeAreaView
          style={{
            flex: 1,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <TopBar
              onPress={() => {
                // End call if active when navigating back
                if (isCallConnected || callStarting) {
                  console.log('Navigating back, ending call');
                  endCall();
                }
                navigation.goBack();
              }}
            />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: responsiveHeight(10),
            }}
            enableOnAndroid={true}
            showsVerticalScrollIndicator={false}
          >

            <Text
              style={{
                fontSize: responsiveFontSize(3.2),
                fontWeight: '500',
                color: COLORS.white,
                lineHeight: responsiveHeight(6),
                fontFamily: fonts.PoppinsRegular,
                marginTop: responsiveHeight(2),
              }}>
              Pick Your Onboarding Style
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(2),
                color: COLORS.white,
                marginVertical: responsiveHeight(1),
                lineHeight: responsiveHeight(3),
                width: responsiveWidth(80),
                fontFamily: fonts.PoppinsRegular,
                fontWeight: '400',
              }}>
              We use this information to find you the most meaningful connections
            </Text>



            <View style={{
              justifyContent: 'space-evenly',
              marginHorizontal: responsiveWidth(2),
              marginTop: responsiveHeight(2),
            }}>
              {/* Fate Agent Option */}
              <TouchableOpacity
                style={{
                  width: responsiveWidth(90),
                  padding: responsiveHeight(3),
                  backgroundColor: selectedOption === 1 ? COLORS.primary : 'rgba(255, 255, 255, 0.16)',
                  borderRadius: 15,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: responsiveWidth(0.5),
                  borderColor: 'rgba(255, 255, 255, 0.24)',
                  marginVertical: responsiveHeight(1),
                }}
                activeOpacity={0.8}
                onPress={() => handleSelectOption(1)}
              >
                <Image
                  source={Images.Applogo}
                  style={{
                    width: responsiveWidth(15),
                    height: responsiveWidth(15),
                    marginBottom: responsiveHeight(1),
                  }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    color: COLORS.white,
                    fontFamily: fonts.PoppinsRegular,
                    fontSize: responsiveFontSize(2),
                    marginTop: responsiveHeight(1)
                  }}
                >
                  Speak To Fate
                </Text>
              </TouchableOpacity>

              {/* Typing Option */}
              <TouchableOpacity
                style={{
                  width: responsiveWidth(90),
                  padding: responsiveHeight(4),
                  backgroundColor: selectedOption === 2 ? COLORS.primary : 'rgba(255, 255, 255, 0.16)',
                  borderRadius: 15,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: responsiveWidth(0.5),
                  borderColor: 'rgba(255, 255, 255, 0.24)',
                  marginVertical: responsiveHeight(1),
                }}
                activeOpacity={0.8}
                onPress={() => handleSelectOption(2)}
              >
                <Icon
                  name="keyboard"
                  size={responsiveWidth(10)}
                  color={COLORS.white}
                  style={{
                    marginBottom: responsiveHeight(1),
                  }}
                />

                <Text
                  style={{
                    color: COLORS.white,
                    fontFamily: fonts.PoppinsRegular,
                    fontSize: responsiveFontSize(2),
                    marginTop: responsiveHeight(1)
                  }}
                >
                  Type To Fate
                </Text>
              </TouchableOpacity>



            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: responsiveWidth(90),
                // marginTop: responsiveHeight(2),
                height: responsiveHeight(5),
              }}
            />
          </ScrollView>

          <View style={{
            marginVertical: responsiveHeight(3),
            backgroundColor: 'transparent',
          }}>
            <PrimaryButton
              loading={loading}
              title={'Next'}
              onPress={handleNext}
              style={{
                alignSelf: 'center',
                width: responsiveWidth(90),
              }}
              backgroundColor={COLORS.white}
              textColor={COLORS.primary}
            />
          </View>



        </SafeAreaView>

        {/* Bottom Sheet for Fate Agent Call */}
        <BottomSheet
          height={responsiveHeight(90)}
          ref={fateAgentBottomSheetRef}
          enablePanDownToClose={false} // Prevent accidental closing
          onClose={() => {
            // End call when bottom sheet is closed
            console.log('Bottom sheet closed');
            if (isCallConnected || callStarting) {
              console.log('Call in progress, ending it');
              endCall();
            }
          }}
        >
          <GradientBackground>
            <ScrollView contentContainerStyle={{
              marginTop: responsiveHeight(3),
              alignItems: 'center',
              justifyContent: 'center',

            }}

            >
              {callStarting && loading ? (
                <>
                  <ActivityIndicator size="large" color={COLORS.primary} style={{ marginBottom: 10 }} />
                  <Text style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(2.5),
                    fontFamily: fonts.PoppinsRegular,
                    textAlign: 'center',
                    marginVertical: responsiveHeight(1),
                  }}>
                    Starting Call with Fate ...
                  </Text>
                  <Image
                    source={Images.Applogo}
                    style={{
                      width: responsiveWidth(30),
                      height: responsiveWidth(30),
                      alignSelf: 'center',
                      marginTop: responsiveHeight(4),
                    }}
                    resizeMode="contain"
                  />
                  <View
                    style={{
                      marginTop: responsiveHeight(5)
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        marginVertical: responsiveHeight(1),
                        alignItems: 'center',
                        alignSelf: 'center'
                      }}
                    >
                      <Icon
                        name="microphone"
                        size={responsiveFontSize(3)}
                        color={COLORS.white}
                        style={{
                          marginRight: 20
                        }}
                      />
                      <Text style={{
                        color: COLORS.white,
                        fontSize: responsiveFontSize(2),
                        fontFamily: fonts.PoppinsRegular,
                        textAlign: 'left',
                        width: '90%'
                      }}>
                        Please allow microphone access when prompted
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginVertical: responsiveHeight(1),
                        alignItems: 'center',
                      }}
                    >
                      <Waveform color={COLORS.white}
                        weight="fill"
                        style={{
                          marginRight: 15
                        }}
                        size={responsiveFontSize(3)} />
                      <Text style={{
                        color: COLORS.white,
                        fontSize: responsiveFontSize(2),
                        fontFamily: fonts.PoppinsRegular,
                        textAlign: 'left',

                      }}>
                        Speak clearly and naturally
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginVertical: responsiveHeight(1),
                        alignItems: 'center',
                      }}
                    >
                      <Waveform color={COLORS.white}
                        weight="fill"
                        style={{
                          marginRight: 15
                        }}
                        size={responsiveFontSize(3)} />
                      <Text style={{
                        color: COLORS.white,
                        fontSize: responsiveFontSize(2),
                        fontFamily: fonts.PoppinsRegular,
                        textAlign: 'left',
                        width: '90%'
                      }}>
                        Find a quiet space for the best experience
                      </Text>
                    </View>


                  </View>
                </>
              ) : isCallConnected ? (
                savingResponses ? (
                  <>
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginBottom: 10 }} />
                    <Text style={{
                      color: COLORS.white,
                      fontSize: responsiveFontSize(2.5),
                      fontFamily: fonts.PoppinsRegular,
                      fontWeight: '500',
                      textAlign: 'center',
                      marginVertical: responsiveHeight(1),
                    }}>
                      Saving your responses...
                    </Text>
                    <Text style={{
                      color: COLORS.white,
                      fontSize: responsiveFontSize(1.8),
                      fontFamily: fonts.PoppinsRegular,
                      textAlign: 'center',
                      marginVertical: responsiveHeight(1),
                      opacity: 0.8,
                      width: responsiveWidth(80),
                    }}>
                      Please wait while we store your information. We'll proceed automatically when complete.
                    </Text>
                  </>
                ) : (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                      <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 10 }} />
                      <Text style={{
                        color: COLORS.white,
                        fontSize: responsiveFontSize(2.5),
                        fontFamily: fonts.PoppinsRegular,
                        fontWeight: '500',
                        textAlign: 'center',
                      }}>
                        Call in Progress...
                      </Text>
                    </View>

                    <Image
                      source={Images.Applogo}
                      style={{
                        width: responsiveWidth(30),
                        height: responsiveWidth(30),
                        alignSelf: 'center',
                        marginVertical: responsiveHeight(2),
                      }}
                      resizeMode="contain"
                    />

                    <View
                      style={{
                        marginTop: responsiveHeight(5)
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          marginVertical: responsiveHeight(1),
                          alignItems: 'center',
                          alignSelf: 'center'
                        }}
                      >
                        <Icon
                          name="microphone"
                          size={responsiveFontSize(3)}
                          color={COLORS.white}
                          style={{
                            marginRight: 20
                          }}
                        />
                        <Text style={{
                          color: COLORS.white,
                          fontSize: responsiveFontSize(2),
                          fontFamily: fonts.PoppinsRegular,
                          textAlign: 'left',
                          width: '90%'
                        }}>
                          Please allow microphone access when prompted
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          marginVertical: responsiveHeight(1),
                          alignItems: 'center',
                        }}
                      >
                        <Waveform color={COLORS.white}
                          weight="fill"
                          style={{
                            marginRight: 15
                          }}
                          size={responsiveFontSize(3)} />
                        <Text style={{
                          color: COLORS.white,
                          fontSize: responsiveFontSize(2),
                          fontFamily: fonts.PoppinsRegular,
                          textAlign: 'left',

                        }}>
                          Speak clearly and naturally
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          marginVertical: responsiveHeight(1),
                          alignItems: 'center',
                        }}
                      >
                        <Waveform color={COLORS.white}
                          weight="fill"
                          style={{
                            marginRight: 15
                          }}
                          size={responsiveFontSize(3)} />
                        <Text style={{
                          color: COLORS.white,
                          fontSize: responsiveFontSize(2),
                          fontFamily: fonts.PoppinsRegular,
                          textAlign: 'left',
                          width: '90%'
                        }}>
                          Find a quiet space for the best experience
                        </Text>
                      </View>


                    </View>

                  </>
                )
              ) : (
                <>
                  <ActivityIndicator size="large" color={COLORS.primary} style={{ marginBottom: 10 }} />
                  <Text style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(2.5),
                    fontFamily: fonts.PoppinsRegular,
                    fontWeight: '500',
                    textAlign: 'center',
                    marginVertical: responsiveHeight(1),
                  }}>
                    Connecting to Fate ...
                  </Text>

                  <Image
                    source={Images.Applogo}
                    style={{
                      width: responsiveWidth(30),
                      height: responsiveWidth(30),
                      alignSelf: 'center',
                      marginTop: responsiveHeight(2),
                    }}
                    resizeMode="contain"
                  />
                </>
              )}
            </ScrollView>
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.white || '#FF3B30',
                paddingVertical: responsiveHeight(1.5),
                paddingHorizontal: responsiveWidth(8),
                borderRadius: 30,
                bottom: responsiveHeight(5),
                position: "absolute",
                alignSelf: 'center',
                width: '90%'
              }}
              onPress={endCall}
              disabled={savingResponses}
            >
              <Text style={{
                color: COLORS.primary,
                fontSize: responsiveFontSize(2),
                fontFamily: fonts.PoppinsRegular,
                fontWeight: '600',
                alignSelf: 'center'
              }}>
                End Call
              </Text>
            </TouchableOpacity>
          </GradientBackground>
        </BottomSheet>
      </GradientBackground>
    </KeyboardAvoidingView>
  );
}
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
export default ChooseHowToAnswer;
