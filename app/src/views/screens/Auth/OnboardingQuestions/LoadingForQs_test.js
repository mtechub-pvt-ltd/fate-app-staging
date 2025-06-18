import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Voice from '@react-native-voice/voice';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import { getAllQuestions, addAnswertoQuestion } from '../../../../Services/Auth/SignupService';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import COLORS from '../../../../consts/colors';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import fonts from '../../../../consts/fonts';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import { useDispatch, useSelector } from 'react-redux';
import { setQuestions, setQuestionAnswer } from '../../../../redux/features/form/formSlice';



const VoiceTest = ({ navigation }) => {
  // redux : 

  const dispatch = useDispatch();
  const questions = useSelector((state) => state.form.questions);

  const refInput = useRef();
  const [state, setState] = useState({
    recognized: '',
    pitch: '',
    error: '',
    end: '',
    started: '',
    results: [],
    partialResults: [],
  });
  const [list, setList] = useState([]);
  const [voiceText, setVoiceText] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [falshMessage, setFalshMessage] = useState(false);
  const [falshMessageData, setFalshMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
    backgroundColor: '',
    textColor: '',
  });

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = (e) => {
    setState((prevState) => ({ ...prevState, started: '√' }));
  };

  const onSpeechRecognized = (e) => {
    setState((prevState) => ({ ...prevState, recognized: '√' }));
  };

  const onSpeechEnd = (e) => {
    setState((prevState) => ({ ...prevState, end: '√' }));
    setIsRecording(false);
  };

  const onSpeechError = (e) => {
    setState((prevState) => ({ ...prevState, error: JSON.stringify(e.error) }));
  };

  const onSpeechResults = (e) => {
    setState((prevState) => ({ ...prevState, results: e.value }));
    setVoiceText(e.value[0] || ''); // Populate the input directly with voice text
  };

  const onSpeechPartialResults = (e) => {
    setState((prevState) => ({ ...prevState, partialResults: e.value }));
  };

  const onSpeechVolumeChanged = (e) => {
    setState((prevState) => ({ ...prevState, pitch: e.value }));
  };

  const startRecognizing = async () => {
    try {
      setIsRecording(true);
      await Voice.start('en-US');
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecognizing = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (e) {
      console.error(e);
    }
  };

  // const callQuestions = async () => {
  //   try {
  //     const response = await getAllQuestions();
  //     setList(response?.data);
  //   } catch (error) {
  //     console.error('This is the error:', error);
  //   }
  // };

  const callQuestions = async () => {
    try {
      const response = await getAllQuestions();
      // Merge existing answers with new questions
      const questionsWithAnswers = response?.data?.map(newQuestion => {
        const existingQuestion = questions?.find(q => q?.id === newQuestion.id);
        return {
          ...newQuestion,
          answer: existingQuestion?.answer || ''
        };
      });
      dispatch(setQuestions(questionsWithAnswers)); // Dispatch merged questions to Redux
    } catch (error) {
      console.error('This is the error:', error);
    }
  };

  // const addAnswer = async () => {
  //   try {
  //     const value = await AsyncStorage.getItem('userDetail');
  //     const userDetail = JSON.parse(value);
  //     const question = list[activeIndex];
  //     const data = {
  //       user_id: userDetail.id,
  //       question_id: question.id,
  //       answer: voiceText,
  //     };
  //     const response = await addAnswertoQuestion(data);

  //     if (activeIndex < list.length - 1) {
  //       setActiveIndex(activeIndex + 1);
  //       setVoiceText('');
  //       setState((prevState) => ({ ...prevState, results: '' }));
  //       setLoading(false);
  //     } else {
  //       setLoading(false);
  //       navigation.navigate('AddYourPhotos');
  //     }
  //   } catch (error) {
  //     console.error('This is the error:', error);
  //     setLoading(false);
  //   }
  // };

  const addAnswer = () => {
    if (voiceText.length >= 5) {
      // Save current answer before proceeding
      dispatch(
        setQuestionAnswer({
          questionNumber: questions[activeIndex]?.id,
          answer: voiceText,
        })
      );

      if (activeIndex < questions.length - 1) {
        const nextIndex = activeIndex + 1;
        setActiveIndex(nextIndex);
        // Set the text to the saved answer for the next question if it exists
        setVoiceText(questions[nextIndex]?.answer || '');
      } else {
        console.log('All questions answered', JSON.stringify(questions, null, 2));
        navigation.navigate('AddYourPhotos_Redux');
      }
    } else {
      setFalshMessageData({
        message: 'Answer should be at least 5 characters long',
        description: 'Please try again',
        type: 'error',
        icon: 'danger',
        backgroundColor: COLORS.red,
        textColor: COLORS.white,
      });
      setFalshMessage(true);
      setTimeout(() => setFalshMessage(false), 2000);
    }
  };

  useEffect(() => {
    callQuestions();
  }, []);
  useEffect(() => {
    // Set voice text to the saved answer whenever activeIndex changes or questions update
    if (questions && questions[activeIndex]) {
      setVoiceText(questions[activeIndex].answer || '');
    }
  }, [activeIndex, questions]);

  return (
    <GradientBackground>
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}
      <SafeAreaView style={{ flex: 1 }}>

        <ScrollView
          showsVerticalScrollIndicator={false}
        >

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >

            <View style={styles.container}>
              <View
                style={{
                  marginTop: responsiveHeight(3),
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: responsiveWidth(95),
                  alignSelf: 'center',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    if (activeIndex > 0) {
                      const previousIndex = activeIndex - 1;

                      // Save the current answer before navigating back
                      dispatch(
                        setQuestionAnswer({
                          questionNumber: questions[activeIndex]?.id,
                          answer: voiceText,
                        })
                      );

                      // Fetch and set the previous answer
                      const previousAnswer = questions[previousIndex]?.answer || '';
                      setActiveIndex(previousIndex);
                      setVoiceText(previousAnswer);
                    } else {
                      navigation.goBack();
                    }
                  }}
                >
                  <Icon name={'chevron-left'}
                    style={{
                      padding: responsiveWidth(1.5),
                    }}
                    size={24} color={COLORS.white} />
                </TouchableOpacity>

              </View>
              <View style={styles.header}>
                {/* <Text style={styles.questionText}>{list[activeIndex]?.question}</Text> */}
                <Text style={styles.questionText}>{questions[activeIndex]?.question}</Text>

              </View>

              {/* <TextInput
              autoCapitalize="none"
              onChangeText={text => setVoiceText(text)}
              value={voiceText}
              placeholder={'Type your answer here'}
              maxLength={250}
              multiline={true}
              style={styles.input}
            /> */}
              <CustomInput
                refInput={refInput}
                autoCapitalize="none"
                onChangeText={text => {
                  setVoiceText(text);
                }}
                value={voiceText}
                borderColor={COLORS.primary}
                maxLength={250}
                multiline={true}
                placeholder={'Type your answer here'}
                style={{
                  height: responsiveHeight(15),
                  borderWidth: 1,
                  borderColor: COLORS.white,
                  borderRadius: 10,
                  width: responsiveWidth(80),
                  padding: responsiveWidth(5),
                  color: COLORS.white,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}

              />

              <View style={styles.controls}>
                <Text style={styles.charCount}>{voiceText.length}/250</Text>
                <TouchableOpacity onPress={() => setVoiceText('')}>
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.micButton}
                onPressIn={startRecognizing} // Start recording on press
                onPressOut={stopRecognizing} // Stop recording on release
              >
                <Icon name="microphone" size={50} color="white" />
                <Text style={styles.micText}>
                  {isRecording ? 'Listening...' : 'Hold to Talk'}
                </Text>
              </TouchableOpacity>
              <View style={{
                height: responsiveHeight(25),
                backgroundColor: 'red',
                zIndex: 999
              }} />


            </View>

          </KeyboardAvoidingView>

        </ScrollView>
        <PrimaryButton
          loading={loading}
          title="Next"
          onPress={() => {
            // setLoading(true);
            if (voiceText.length < 5) {
              setFalshMessageData({
                message: 'Answer should be at least 5 characters long',
                description: 'Please try again',
                type: 'error',
                icon: 'danger',
                backgroundColor: COLORS.red,
                textColor: COLORS.white,
              });
              setFalshMessage(true);
              setTimeout(() => {
                setLoading(false);
                setFalshMessage(false);
              }, 2000);
            } else {
              addAnswer();
            }
          }}
          style={styles.nextButton}
          backgroundColor={COLORS.white}
          textColor={COLORS.primary}
        />
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: responsiveWidth(80),
    marginTop: responsiveHeight(5),
  },
  questionText: {
    fontSize: responsiveFontSize(3.5),
    color: 'white',
    width: responsiveWidth(80),
    // fontWeight: 'bold',
    fontFamily: fonts.PoppinsSemiBold,
  },
  input: {
    height: responsiveHeight(15),
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    width: responsiveWidth(80),
    padding: responsiveWidth(5),
    color: COLORS.white,
    marginTop: responsiveHeight(2),
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: responsiveWidth(80),
    marginTop: responsiveHeight(1),
  },
  charCount: {
    color: 'white',
    fontSize: responsiveFontSize(1.5),
    fontWeight: 'bold',
  },
  resetText: {
    color: 'white',
    fontSize: responsiveFontSize(1.5),
    fontWeight: 'bold',
  },
  micButton: {
    padding: 5,
    alignItems: 'center',
    marginTop: responsiveHeight(2),
  },
  micText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    lineHeight: 30,
  },
  nextButton: {
    marginVertical: responsiveHeight(2),
    alignSelf: 'center',
    width: responsiveWidth(90),
    padding: 5,
  },
});

export default VoiceTest;
