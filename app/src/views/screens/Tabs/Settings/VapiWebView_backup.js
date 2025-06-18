import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    Image,
    Platform,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    ImageBackground,
    BackHandler, // Added for hardware back press
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
// import BottomSheet from '../../../../components/BottomSheet/BottomSheet'; // Standard BottomSheet, we need RBSheet
import RBSheet from "react-native-raw-bottom-sheet"; // Added for custom bottom sheet
import { getAllTokens, userLogout, deleteUserAccount } from '../../../../Services/Auth/SignupService';
import RNRestart from 'react-native-restart';
import { useIsFocused, useFocusEffect } from '@react-navigation/native'; // Added useFocusEffect
import {
    User,
    Eye,
    Eraser,
    Lock,
    Virus,
    SignOut,
    Coins,
    Gear,
    Notebook,
    SealCheck,
    Trash,
    RocketLaunch
} from 'phosphor-react-native';
import { height, width } from '../../../../consts/Dimension';
import { useDispatch, useSelector } from 'react-redux';
import LottieView from 'lottie-react-native';
import Vapi from '@vapi-ai/react-native';


const vapi = new Vapi('d65afa88-3b99-452b-bd09-d575d8df07d0'); // Replace with your actual API key

// Helper component for instruction items
const InstructionItem = ({ icon, text, iconFamily = 'FontAwesome5' }) => (
    <View style={styles.instructionItem}>
        <View style={styles.instructionIconCircle}>
            <Image
                source={icon}
                style={{
                    width: 25, height: 25,
                    alignSelf: 'center'
                }}
            />
        </View>
        <Text style={styles.instructionText}>{text}</Text>
    </View>
);


function HomePage({ route, navigation }) {

    const refDeleteAccountSheet = useRef();
    const refConfirmationSheet = useRef();
    const userInitiatedEndCall = useRef(false); // Added ref to track user-initiated call endings

    const [isCallConnected, setIsCallConnected] = useState(false);
    const [isCallStarting, setIsCallStarting] = useState(false);
    const [animatedDots, setAnimatedDots] = useState(''); // New state for animated dots
    const [lastQuestionAnswered, setLastQuestionAnswered] = useState(false); // New state for continue button
    const [hasCompletedFirstCall, setHasCompletedFirstCall] = useState(false); // Track if user has completed their first call
    const email = useSelector(state => state.form.email); // Get email from Redux store
    console.log(email)
    // Determine the title based on call state
    let titleText = "Click image to start call"; // Default title
    if (isCallStarting) {
        titleText = `Starting call with Fate${animatedDots}`;
    } else if (isCallConnected) {
        titleText = "Talking to Fate...";
    }

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

    // Load first call completion status from AsyncStorage
    useEffect(() => {
        const loadFirstCallStatus = async () => {
            try {
                const hasCompleted = await AsyncStorage.getItem('hasCompletedFirstCall');
                if (hasCompleted === 'true') {
                    setHasCompletedFirstCall(true);
                }
            } catch (error) {
                console.error('VapiWebView: Error loading first call status:', error);
            }
        };
        loadFirstCallStatus();
    }, []);

    useEffect(() => {
        const callStartedListener = vapi.on('call-start', () => {
            try {
                console.log('VapiWebView: Event - call-start');
                // setUserTranscripts([]); // Removed: Clear transcripts when a new call starts
                setIsCallStarting(true);
                setIsCallConnected(false);
                setLastQuestionAnswered(false); // Reset on new call
            } catch (e) {
                console.error('VapiWebView: Error in call-start listener:', e);
            }
        });

        const callConnectedListener = vapi.on('speech-start', () => { // Assuming 'speech-start' means connected
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
                // console.log('User Transcripts on Call End:', userTranscripts); // Removed: Log transcripts here

                if (userInitiatedEndCall.current) {
                    // User manually ended the call, no alert needed here as UI changes handle it.
                } else if (
                    reason === 'customer-ended-call' ||
                    reason === 'assistant-ended-call' ||
                    reason === 'assistant-ended-call-after-message-spoken'
                    // Add any other normal reasons from Vapi documentation
                ) {
                    // Normal call end
                    console.log("VapiWebView: Call Ended - The call completed successfully.");
                } else if (
                    reason &&
                    (reason.startsWith('pipeline-error') || // Covers pipeline-error-*
                        reason.startsWith('call.in-progress.error') || // Covers call.in-progress.error-*
                        reason === 'assistant-error' ||
                        reason === 'unknown-error' ||
                        reason === 'ejected' // Example: "Meeting has ended" often comes with 'ejected'
                    )
                ) {
                    // Error call end
                    console.log(`VapiWebView: Call Error - The call ended due to an error: ${reason}`);
                } else if (reason) {
                    // Other specific reasons
                    console.log(`Call Ended The call ended: ${reason}`);
                } else {
                    // Fallback for non-user initiated ends without a specific reason
                    console.log("VapiWebView: Call Ended - The call has been concluded.");
                }

                setIsCallConnected(false);
                setIsCallStarting(false);

                // Mark first call as completed and save to AsyncStorage
                if (!hasCompletedFirstCall) {
                    setHasCompletedFirstCall(true);
                    AsyncStorage.setItem('hasCompletedFirstCall', 'true').catch(error => {
                        console.error('VapiWebView: Error saving first call completion status:', error);
                    });
                }
            } catch (e) {
                console.error('VapiWebView: Error in call-end listener:', e);
            } finally {
                userInitiatedEndCall.current = false; // Reset for the next call
                // setUserTranscripts([]); // Removed: Clear transcripts after call ends
            }
        });

        const callErrorListener = vapi.on('error', (error) => {
            try {
                console.error('VapiWebView: Event - error:', error);
                setIsCallConnected(false);
                setIsCallStarting(false);
                if (error?.error?.msg === "Meeting has ended") {
                    console.log("Meeting Ended The meeting was ended by the agent or due to an error.");
                } else {
                    console.log(`Call Error - A call error occurred: ${error?.message || JSON.stringify(error) || 'Unknown Vapi error'}`);
                }
            } catch (e) {
                console.error('VapiWebView: Error in error listener itself:', e);
            } finally {
                userInitiatedEndCall.current = false; // Reset on error too
            }
        });

        const messageListener = vapi.on('message', (message) => {
            try {
                // console.log('VapiWebView: Message received:', message); // Optional: log all messages for debugging
                if (message.type === 'transcript' && message.transcriptType === 'final') {
                    if (message.role === 'user') {
                        console.log('VapiWebView: User final transcript:', message.transcript); // Log final user transcript
                        // setUserTranscripts(prevTranscripts => [...prevTranscripts, message.transcript]); // Removed: Storing transcript
                        setLastQuestionAnswered(false); // User spoke, waiting for assistant
                    } else if (message.role === 'assistant') {
                        console.log('VapiWebView: Assistant final transcript:', message.transcript); // Log final assistant transcript
                        setLastQuestionAnswered(true); // Assistant answered
                    }
                }
            } catch (e) {
                console.error('VapiWebView: Error in message listener:', e);
            }
        });

        // Start the call automatically when the component mounts
        startCall(); // Commented out as per previous state

        // Cleanup listeners on component unmount
        return () => {
            console.log('VapiWebView: Cleaning up Vapi listeners.');
            callStartedListener?.remove?.();
            callConnectedListener?.remove?.();
            callEndedListener?.remove?.();
            callErrorListener?.remove?.();
            messageListener?.remove?.();
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (isCallStarting || isCallConnected) {
                    if (refConfirmationSheet.current) {
                        refConfirmationSheet.current.open();
                    } else {
                        console.warn('VapiWebView: refConfirmationSheet.current is null in onBackPress');
                    }
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
                    if (refConfirmationSheet.current) {
                        refConfirmationSheet.current.open();
                    } else {
                        console.warn('VapiWebView: refConfirmationSheet.current is null in beforeRemove listener');
                    }
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
            if (refConfirmationSheet.current) {
                refConfirmationSheet.current.close();
            } else {
                console.warn('VapiWebView: refConfirmationSheet.current is null in handleConfirmEndCall');
            }
            await endCall();
            navigation.goBack();
        } catch (error) {
            console.error('VapiWebView: Error in handleConfirmEndCall:', error);
            console.log("VapiWebView: Error - An unexpected error occurred while ending the call and navigating back.");
        }
    };

    const handleContinue = () => {
        console.log('VapiWebView: Continue button pressed by user.');
        setLastQuestionAnswered(false); // Hide continue button, ready for user to speak or assistant to continue
        // Optionally, you might want to send a specific event or message to Vapi here if needed,
        // for example, if the assistant is explicitly waiting for a "continue" signal.
        // For now, it just resets the UI state.
    };

    const startCall = async () => {
        try {
            // setUserTranscripts([]); // Removed: Also clear transcripts when explicitly starting a call
            console.log('VapiWebView: Attempting to start call...');
            setIsCallStarting(true);
            setIsCallConnected(false);
            setLastQuestionAnswered(false); // Reset on new call
            userInitiatedEndCall.current = false; // Reset before a new call
            const assistantOverrides = {
                variableValues: {
                    userId: email || 'user-123@example.com', // Fallback email
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
            console.log('VapiWebView: Attempting to end call (user initiated path)...');
            userInitiatedEndCall.current = true; // Mark as user-initiated
            await vapi.stop();
            console.log('VapiWebView: Call stop command sent successfully.');
            // States are primarily managed by listeners, but can be set here for immediate UI feedback if needed.
            // setIsCallConnected(false); // Listener will handle this
            // setIsCallStarting(false); // Listener will handle this
        } catch (error) {
            console.error('VapiWebView: Error stopping call via vapi.stop():', error);
            // Even if vapi.stop() fails, we should ensure the UI reflects an attempt to end.
            // The listeners might still fire or an error listener might catch something.
            // Resetting userInitiatedEndCall here ensures that if a subsequent 'call-end' or 'error' event occurs,
            // it's not mistakenly treated as user-initiated if vapi.stop() itself threw an error.
            userInitiatedEndCall.current = false;
            setIsCallConnected(false); // Attempt to reflect ended state
            setIsCallStarting(false);
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
                    <TouchableOpacity onPress={startCall} disabled={isCallStarting || isCallConnected}>
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
                    </TouchableOpacity>
                    <View style={styles.instructionsContainer}>
                        <InstructionItem icon={Images.mic} text="Please allow microphone access when prompted" />
                        <InstructionItem icon={Images.audio} text="Speak clearly and naturally" />
                        <InstructionItem icon={Images.sound} text="Find a quiet space for the best experience" />
                    </View>

                </ScrollView>


                <View style={styles.footerContainer}>
                    {isCallConnected && (
                        <Text style={[styles.warningCallText, {
                            backgroundColor: COLORS.warning + '20',
                            padding: 10,
                            color: COLORS.warning,
                            borderRadius: 15,
                            overflow: 'hidden'
                        }]}>
                            {hasCompletedFirstCall
                                ? "Tap Continue to move forward, or End Call to stop. Your answers won't be saved if you end the call."
                                : "This is your first call with Fate. Tap End Call when you're ready to finish."
                            }
                        </Text>
                    )}
                    {isCallConnected ? (
                        hasCompletedFirstCall ? (
                            // User has completed first call: Show End Call and Continue in a row
                            <View style={styles.buttonRowContainer}>
                                <PrimaryButton
                                    title="End Call"
                                    loading={false}
                                    onPress={handleConfirmEndCall}
                                    style={{
                                        width: responsiveWidth(43), // Adjusted width for row layout
                                    }}
                                    backgroundColor={COLORS.white}
                                    textColor={COLORS.primary}
                                />
                                <PrimaryButton
                                    title="Continue"
                                    onPress={handleContinue}
                                    style={{
                                        width: responsiveWidth(43), // Adjusted width for row layout
                                    }}
                                    backgroundColor={COLORS.secondary2}
                                    textColor={COLORS.white}
                                />
                            </View>
                        ) : (
                            // First time user: Show only End Call, full width
                            <PrimaryButton
                                title="End Call"
                                loading={false}
                                onPress={handleConfirmEndCall}
                                style={{
                                    alignSelf: 'center',
                                    width: responsiveWidth(90),
                                }}
                                backgroundColor={COLORS.white}
                                textColor={COLORS.primary}
                            />
                        )
                    ) : (
                        // Call is NOT connected: Show only End Call, full width
                        <PrimaryButton
                            title="End Call"
                            loading={false}
                            onPress={handleConfirmEndCall}
                            style={{
                                alignSelf: 'center',
                                width: responsiveWidth(90),
                            }}
                            backgroundColor={COLORS.white}
                            textColor={COLORS.primary}
                        />
                    )}
                    {/* Removed "Log Stored Transcripts" button logic is already gone */}
                </View>

            </ImageBackground>

            <RBSheet
                ref={refConfirmationSheet}
                closeOnDragDown={true}
                closeOnPressMask={true}
                customStyles={{
                    wrapper: {
                        backgroundColor: "rgba(0,0,0,0.5)",
                    },
                    draggableIcon: {
                        backgroundColor: "#000"
                    },
                    container: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        height: responsiveHeight(30), // Adjust height as needed
                        padding: responsiveWidth(5)
                    }
                }}
            >
                <View style={styles.bottomSheetContainer}>
                    <Text style={styles.bottomSheetTitle}>End Call?</Text>
                    <Text style={styles.bottomSheetMessage}>
                        Are you sure you want to go back? This will end the current call, and your responses will not be saved.
                    </Text>
                    <PrimaryButton
                        title="Yes, End Call"
                        onPress={handleConfirmEndCall}
                        style={{ marginBottom: responsiveHeight(2), backgroundColor: COLORS.danger }}
                        textColor={COLORS.white}
                    />
                    <PrimaryButton
                        title="No, Stay"
                        onPress={() => {
                            if (refConfirmationSheet.current) {
                                refConfirmationSheet.current.close();
                            } else {
                                console.warn('VapiWebView: refConfirmationSheet.current is null for No, Stay button');
                            }
                        }}
                        backgroundColor={COLORS.lightGray}
                        textColor={COLORS.black}
                    />
                </View>
            </RBSheet>
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
