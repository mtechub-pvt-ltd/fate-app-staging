import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Keyboard,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
  Alert,
  Linking,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import { getAllQuestions, addAnswertoQuestion } from '../../../../Services/Auth/SignupService';
import {
  SkipForward,
} from 'phosphor-react-native';

const OnboardingQuestions = ({ route, navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //  usama states
  const inputRef = useRef(null);
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  const [textError, setTextError] = useState(false);
  const [list, setList] = useState([
    {
      id: 1,
      question: 'How long have you been single?',
      answer: '',
      placeholder: "e.g l've been single for approximately 2,347,892,107 nano seconds, but who's counting?",
    },

    {
      id: 2,
      question: 'What challenges have you had in dating?',
      answer: '',
      placeholder: 'e.g Playing basketball and watching football are my jam',
    },
    {
      id: 3,
      question: 'What are you looking for in a Partner?',
      answer: '',
      placeholder:
        'e.g Exploring diverse cultures and cuisines while traveling to exotic destinations around the world',
    },
    {
      id: 4,
      question: 'What are your hobbies?',
      answer: '',
      placeholder: 'e.g Break-up just for a ring is my biggest lesson learnt in Dating so far',
    },
    {
      id: 4,
      question: 'What is your biggest lesson learnt in Dating so far?',
      answer: '',
      placeholder:
        "e.g I'vm hoping to find someone who makes my heart skip a beat, shares my interests and brings joy into my life every day",
    },
  ]);
  const [activeIndex, setActiveIndex] = useState(route?.params?.activeIndex || 0);
  const [loading, setLoading] = useState(false);
  // message state
  // message state
  const [falshMessage, setFalshMessage] = useState(false);
  const [falshMessageData, setFalshMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
  });

  const requestPermissionsAndInitAudio = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        if (
          granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          Alert.alert(
            'Permissions Required',
            'You must allow permissions to record audio. Go to Settings > App Permissions to enable them.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          console.log('All permissions granted');
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    }

    const options = {
      sampleRate: 16000, // 16 kHz
      channels: 1, // Mono
      bitsPerSample: 16, // 16-bit
      audioSource: 6, // Voice Recognition
      wavFile: 'test_audio.wav', // File name
    };
    AudioRecord.init(options);
  };

  useEffect(() => {
    requestPermissionsAndInitAudio();
  }, []);

  useEffect(() => {
    const onSpeechStart = () => {
      setIsRecording(true);
    };

    const onSpeechEnd = () => {
      setIsRecording(false);

    };

    const onSpeechError = e => {
      stopRecording();
      setIsRecording(false);
      setError(JSON.stringify(e.error));
    };

    const onSpeechResults = event => {
      console.log('onSpeechResults', event.value);
      let speech = event.value[0];
      setVoiceText(speech);
      setList(prev => {
        let temp = [...prev];
        temp[activeIndex].answer = speech;
        return temp;
      });

    };

    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      await Voice.start('en-US');
      setIsRecording(true);
      setError('');
      setVoiceText('');
    } catch (e) {
      console.error(e);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
      setError('');
      setVoiceText('');

    } catch (e) {
      console.error(e);
    }
  }, []);

  const speakText = async () => {
    try {
      Tts.speak('Hello, world!');
    } catch (e) {
      console.error(e);
    }
  };
  const callQuestions = async () => {
    try {
      const response = await getAllQuestions();
      setList(response?.data);
    } catch (error) {
      console.error('This is the error:', error);
    }
  };
  const addAnswer = async () => {
    try {
      const value = await AsyncStorage.getItem('userDetail');
      const userDetail = JSON.parse(value);
      console.log('userDetail', userDetail.id);
      // get item from question list based on active index
      const question = list[activeIndex];
      const data = {
        user_id: userDetail.id,
        question_id: question.id,
        answer: voiceText,
      };
      const response = await addAnswertoQuestion(data);
      console.log('response', response);
      if (activeIndex < list.length - 1) {
        setActiveIndex(activeIndex + 1);
        setVoiceText('');
        setTextError(false);
        setIsRecording(false);
        setRecognizedText('');
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
    callQuestions();
  }, []);

  return (
    <GradientBackground>
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
        >
          <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <View
                style={{
                  marginTop: responsiveHeight(3),
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}
                >
                  <Icon name={'chevron-left'}
                    style={{
                      padding: responsiveWidth(1.5),
                    }}
                    size={24} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setLoading(true);
                    // Keyboard.dismiss();
                    // cheeck if voice text is empty
                    if (voiceText.length === 0 || voiceText.length < 5) {
                      setTextError(true);
                      setTimeout(() => {
                        setTextError(false);
                        setLoading(false);
                      }, 2000);
                      // setLoading(false);
                    } else if (voiceText.length < 5) {
                      setFalshMessageData({
                        message: 'Answer should be atleast 5 characters long',
                        description: 'Please try again',
                        type: 'error',
                        icon: 'danger',
                        backgroundColor: COLORS.red,
                        textColor: COLORS.white,
                      });
                      setFalshMessage(true);
                      // setLoading(false);
                    } else {
                      addAnswer();
                    }
                    // navigation.navigate('AddYourPhotos');
                  }}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: responsiveWidth(1.5),

                  }}
                >
                  <Text
                    style={{
                      fontSize: responsiveFontSize(2.5),
                      color: COLORS.secondary2,
                      fontFamily: fonts.PoppinsRegular,
                      marginRight: responsiveWidth(1),
                    }}
                  >
                    Next
                  </Text>
                  <SkipForward color={COLORS.secondary2} size={24} />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  marginTop: responsiveHeight(2),
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: responsiveHeight(5),
                }}
              >
                <Text
                  style={{
                    fontSize: responsiveFontSize(3.5),
                    color: 'white',
                    textAlign: 'left',
                    width: responsiveWidth(60),

                    fontWeight: '600',

                  }}
                >
                  {list[activeIndex].question}
                </Text>
                {/* <TouchableOpacity>
              <Icon name={'volume-up'} size={30} color={'background: rgba(140, 82, 255, 1)'} />
            </TouchableOpacity> */}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: responsiveFontSize(1.5),
                    fontFamily: fonts.JostMedium,
                  }}>
                  {voiceText?.length}/ 250
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    setVoiceText('');
                  }}
                  style={{
                    padding: 10,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: responsiveFontSize(1.5),
                      fontWeight: 'bold',
                      display: isRecording ? 'none' : voiceText?.length > 0 ? 'flex' : 'none',
                    }}>
                    Reset
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                autoCapitalize={'none'}
                style={{
                  backgroundColor: 'background: rgba(255, 255, 255, 0.08)',
                  width: responsiveWidth(90),
                  padding: responsiveHeight(2),
                  paddingTop: responsiveHeight(2),
                  borderRadius: 20,
                  marginTop: responsiveHeight(1),
                  borderColor: 'rgba(255, 255, 255, 0.24)',
                  borderWidth: 1,
                  color: 'white',
                  fontSize: responsiveFontSize(2),
                  height: Platform.OS === 'ios' ? responsiveHeight(15) : 'auto',
                }}
                multiline={true}
                numberOfLines={4}
                placeholder={list[activeIndex].placeholder}
                placeholderTextColor={'#ABABAB'}
                value={voiceText}
                maxLength={250}
                onChangeText={text => {
                  setVoiceText(text);
                }}
                onSubmitEditing={() => {
                  setVoiceText((prevText) => prevText + '\n');
                  Keyboard.dismiss();
                }}
                blurOnSubmit={true}
                returnKeyType="done"

              />
              <View
                style={{
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 14,
                    fontFamily: fonts.JostMedium,
                    backgroundColor: 'red',
                    padding: 5,
                    borderRadius: 5,
                    marginTop: 10,
                    display: textError ? 'flex' : 'none',
                  }}>
                  Answer should be atleast 5 characters long
                </Text>
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    display: isRecording ? 'flex' : 'none',
                  }}>
                  <Image
                    source={Images.voice_animation}
                    style={{
                      width: 200,
                      height: 50,
                      marginTop: 20,
                      resizeMode: 'contain',
                    }}
                  />
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      fontFamily: 'Jost-SemiBold',
                      fontWeight: 'bold',
                      lineHeight: 30,
                    }}>
                    Listening...
                  </Text>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      fontFamily: 'Jost-SemiBold',
                      fontWeight: 'bold',
                      lineHeight: 30,
                      fontSize: 10,
                      letterSpacing: .5,
                      display: Platform.OS === 'ios' ? 'none' : 'flex',
                    }}>

                    (It will stop automatically when you stop talking)
                  </Text>
                </View>
                {
                  Platform.OS === 'ios' ? (
                    <TouchableOpacity
                      style={{
                        padding: 5,
                        alignItems: 'center',
                        marginTop: responsiveHeight(2),
                        // backgroundColor: "black",
                      }}
                      onPress={isRecording ? stopRecording : startRecording}>
                      <Icon name={isRecording ? 'microphone-slash' : 'microphone'} size={50} color={'white'} />
                      <Text
                        style={{
                          color: 'white',
                          textAlign: 'center',
                          // fontFamily: 'Jost-SemiBold',
                          fontWeight: 'bold',
                          lineHeight: 30,
                          marginTop: 5,
                        }}>
                        {isRecording ? 'Tap to stop' : 'Tap to Talk'}
                      </Text>
                    </TouchableOpacity>)
                    : (
                      <TouchableOpacity
                        style={{
                          padding: 5,
                          alignItems: 'center',
                          marginTop: responsiveHeight(2),
                          // backgroundColor: "black",
                          display: isRecording ? 'none' : 'flex',
                        }}
                        onPress={startRecording}>
                        <Icon name={'microphone'} size={50} color={'white'} />
                        <Text
                          style={{
                            color: 'white',
                            textAlign: 'center',
                            fontFamily: 'Jost-SemiBold',
                            fontWeight: 'bold',
                            lineHeight: 30,
                          }}>
                          {'Tap to Talk'}
                        </Text>
                      </TouchableOpacity>
                    )
                }


                {/* <Animated.Image
              source={image_9}
              resizeMode="contain"
              style={[
                {
                  width: 100, // Adjust to your needs
                  height: 100, // Adjust to your needs
                },
                animatedStyle,
              ]}
            /> */}

                {/* Error message */}

                {error
                  ? // <Text style={styles.errorText}>Error: {error?.message}</Text>
                  null
                  : null}
              </View>

            </ScrollView>
            <View style={{
              paddingTop: responsiveHeight(2),
            }}>
              <PrimaryButton
                loading={loading}
                title="Next"
                onPress={() => {
                  setLoading(true);
                  // Keyboard.dismiss();
                  // cheeck if voice text is empty
                  if (voiceText.length === 0 || voiceText.length < 5) {
                    setTextError(true);
                    setTimeout(() => {
                      setTextError(false);
                      setLoading(false);
                    }, 2000);
                    // setLoading(false);
                  } else if (voiceText.length < 5) {
                    setFalshMessageData({
                      message: 'Answer should be atleast 5 characters long',
                      description: 'Please try again',
                      type: 'error',
                      icon: 'danger',
                      backgroundColor: COLORS.red,
                      textColor: COLORS.white,
                    });
                    setFalshMessage(true);
                    // setLoading(false);
                  } else {
                    addAnswer();
                  }
                  // navigation.navigate('AddYourPhotos');
                }}
                style={{

                  alignSelf: 'center',
                  width: responsiveWidth(90),
                  display: isRecording ? 'none' : 'flex',

                }}
                backgroundColor={COLORS.white}
                textColor={COLORS.primary}
              />
            </View>
          </View>
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
