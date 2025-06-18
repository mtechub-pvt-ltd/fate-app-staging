import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import Header from '../../../../components/TopBar/Header';
import PrimaryButton from '../../../../components/Button/PrimaryButton';

import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import { getAllQuestions, addAnswertoQuestion } from '../../../../Services/Auth/SignupService';

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
    } catch (e) {
      console.error(e);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  }, [recognizedText]);

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
        navigation.navigate('LoadingForQs', {
          activeIndex: activeIndex,
        });
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
      <KeyboardAvoidingView
        style={{
          flex: 1,
          height: '100%',
        }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
          {/* <TopBar
            onPress={() => {
              if (activeIndex > 0) {
                setActiveIndex(activeIndex - 1);
                setVoiceText('');
              } else {
                navigation.goBack();
              }
            }}
            rightIcon={'info-circle'}
            rightIconPress={() => {
              // navigation.navigate('OnboardingInfo');
              console.log('info');
            }}
          /> */}

          <Header
            mainContainerStyle={{
              marginTop: responsiveHeight(15),
              alignSelf: 'center',
              // justifyContent: 'center',
              alignItems: 'center',
              width: responsiveWidth(80),
            }}
            IconName={'volume-up'}
            iconSize={responsiveFontSize(3)}
            titleStyle={{
              fontSize: responsiveFontSize(3.5),
              color: 'white',
              textAlign: 'center',
            }}
            title={list[activeIndex].question}
          />

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
                  fontFamily: fonts.JostMedium,
                  display: isRecording ? 'none' : voiceText?.length > 0 ? 'flex' : 'none',
                }}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            autoCapitalize={'none'}
            style={{
              backgroundColor: COLORS.white,
              width: responsiveWidth(90),
              padding: responsiveHeight(1.2),
              borderRadius: 20,
              marginTop: responsiveHeight(1),
              color: 'black',
              // padding: 20,
              fontFamily: fonts.JostMedium,
              fontSize: responsiveFontSize(2),
              height: Platform.OS === 'ios' ? responsiveHeight(10) : 'auto',
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
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
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
            </View>

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
                  fontFamily: 'Jost-SemiBold',
                  fontWeight: 'bold',
                  lineHeight: 30,
                }}>
                {isRecording ? 'Tap to stop' : 'Tap to Talk'}
              </Text>
            </TouchableOpacity>

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
              marginTop: responsiveHeight(5),
              alignSelf: 'center',
              width: responsiveWidth(90),
              display: isRecording ? 'none' : 'flex',
              marginBottom: Platform.OS === 'android' ? responsiveHeight(10) : 0,
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
