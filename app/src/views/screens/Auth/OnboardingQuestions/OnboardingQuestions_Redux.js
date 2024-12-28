import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Animated,
  StyleSheet,
  Keyboard,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserDetail, storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import { boolean } from 'yup';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import Header from '../../../../components/TopBar/Header';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import TopBar from '../../../../components/TopBar/TopBar';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import { getAllQuestions, addAnswertoQuestion } from '../../../../Services/Auth/SignupService';
import {
  Horse, Heart, Cube,
  Eye, EyeSlash,
  SkipForward, SkipBackward,
} from 'phosphor-react-native';
import { colorKeys } from 'moti';
import { CollapsedItem } from 'react-native-paper/lib/typescript/components/Drawer/Drawer';
import { useDispatch, useSelector } from 'react-redux';
import {
  setQuestionAnswer,
  setQuestions
} from '../../../../redux/features/form/formSlice';

const OnboardingQuestions = ({ route, navigation }) => {
  const dispatch = useDispatch();
  // const { email: reduxEmail, password: reduxPassword } = useSelector((state) => state.form);



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
      dispatch(setQuestions(response?.data));
      setList(response?.data);
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
    if (questions.length === 0) {
      setLoading(true);
      callQuestions(); // Only fetch questions if Redux state is empty
    }
  }, []);

  // redux thing 
  const questions = useSelector((state) => state.form.questions);


  useEffect(() => {
    // Fetch the current question's answer from Redux when activeIndex changes
    const currentAnswer = questions[activeIndex]?.answer;
    setVoiceText(currentAnswer);
  }, [activeIndex, questions]);

  const handleNext = () => {
    if (voiceText.length >= 5) {
      dispatch(
        setQuestionAnswer({
          questionNumber: questions[activeIndex]?.id, // Use question ID from Redux
          answer: voiceText,
        })
      );

      setLoading(false);
      if (activeIndex < questions.length - 1) {
        setActiveIndex(activeIndex + 1);
        setVoiceText('' || questions[activeIndex + 1]?.answer);
      } else {
        console.log('All questions answered', JSON.stringify(questions, null, 2));
        navigation.navigate('AddYourPhotos_Redux');
      }
    } else {
      alert('Answer should be at least 5 characters long.');
    }
  };



  return (
    <GradientBackground>
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}
      <SafeAreaView style={{ flex: 1 }}>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            flex: 1,

          }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
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
                onPress={() => {
                  if (activeIndex > 1) {
                    // Decrease active index
                    const previousIndex = activeIndex - 1;

                    // Fetch the answer from Redux for the previous question
                    const previousAnswer = questions[previousIndex]?.answer || '';

                    // Update the active index and set the previous answer in voiceText
                    setActiveIndex(previousIndex);
                    setVoiceText(previousAnswer);
                  } else {
                    navigation.goBack();
                  }

                }}
              >
                <Icon name={'chevron-left'}
                  style={{
                    padding: responsiveWidth(3.5),
                    // backgroundColor: COLORS.primary,
                    marginBottom: responsiveWidth(2),
                  }}
                  size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            {
              loading && (
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
                display: loading ? 'none' : 'flex',
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}>

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
                    width: responsiveWidth(75),
                    fontWeight: '600',

                  }}
                >
                  {/* {list[activeIndex].question} */}
                  {questions[activeIndex]?.question}
                </Text>
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
                placeholder={questions[activeIndex]?.placeholder}
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
              paddingVertical: responsiveHeight(1),
              display: loading ? 'none' : 'flex',
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

                    // addAnswer();

                    // added for redux ; 

                    handleNext();
                  }

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
