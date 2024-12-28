import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, Image, TouchableHighlight,
  TouchableOpacity,
  Alert
} from 'react-native';
import Voice from '@react-native-voice/voice';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import { getAllQuestions, addAnswertoQuestion } from '../../../../Services/Auth/SignupService';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import COLORS from '../../../../consts/colors';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import Header from '../../../../components/TopBar/Header';
import fonts from '../../../../consts/fonts';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
const VoiceTest = ({ navigation }) => {
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
  const refRBSheet_JokerSent = useRef();
  const refInput = useRef();

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
    console.log('onSpeechStart: ', e);
    setState((prevState) => ({ ...prevState, started: '√' }));
  };

  const onSpeechRecognized = (e) => {
    console.log('onSpeechRecognized: ', e);
    setState((prevState) => ({ ...prevState, recognized: '√' }));
  };

  const onSpeechEnd = (e) => {
    console.log('onSpeechEnd: ', e);
    setState((prevState) => ({ ...prevState, end: '√' }));
    setIsRecording(false);
  };

  const onSpeechError = (e) => {
    console.log('onSpeechError: ', e);
    setState((prevState) => ({ ...prevState, error: JSON.stringify(e.error) }));
  };

  const onSpeechResults = (e) => {
    console.log('onSpeechResults: ', e);
    setState((prevState) => ({ ...prevState, results: e.value }));
  };

  const onSpeechPartialResults = (e) => {
    console.log('onSpeechPartialResults: ', e);
    setState((prevState) => ({ ...prevState, partialResults: e.value }));
  };

  const onSpeechVolumeChanged = (e) => {
    console.log('onSpeechVolumeChanged: ', e);
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
    } catch (e) {
      console.error(e);
    }
  };

  const cancelRecognizing = async () => {
    try {
      await Voice.cancel();
    } catch (e) {
      console.error(e);
    }
  };

  const destroyRecognizer = async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.error(e);
    }
  };


  const callQuestions = async () => {
    try {
      const response = await getAllQuestions();
      console.log('response', response?.data);
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
        answer: state?.results[0],
      };
      const response = await addAnswertoQuestion(data);
      console.log('response', response);
      if (activeIndex < list.length - 1) {
        setActiveIndex(activeIndex + 1);
        setVoiceText('');
        setState((prevState) => ({ ...prevState, results: '' }));
        setLoading(false);
      } else {
        setLoading(false);
        // alert('data added')
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
      <BottomSheet
        height={responsiveHeight(40)}
        ref={refRBSheet_JokerSent}>
        <View
          style={{
            // marginTop: responsiveHeight(3),
          }}>

          <Text
            style={{
              color: COLORS.black,
              fontSize: responsiveFontSize(2.5),
              fontFamily: fonts.JostMedium,
              textAlign: 'center',
              width: responsiveWidth(70),
              marginTop: responsiveHeight(2),
              alignSelf: 'center',
            }}>
            Add your answer
          </Text>


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
              borderColor: COLORS.primary,
              borderRadius: 10,
              width: responsiveWidth(80),
              padding: responsiveWidth(5),
              color: COLORS.white,
            }}

          />
          <Text
            style={{
              color: COLORS.black,
              fontSize: responsiveFontSize(1.5),
              fontFamily: fonts.JostMedium,
              marginHorizontal: responsiveWidth(10),
              marginTop: responsiveHeight(1)
            }}>
            {voiceText?.length}/ 250
          </Text>
          <PrimaryButton

            title="Submit"

            onPress={() => {
              setState((prevState) => ({ ...prevState, results: [voiceText] }));
              refRBSheet_JokerSent.current.close();
            }}
            style={{
              marginTop: responsiveHeight(2),
              alignSelf: 'center',
              width: responsiveWidth(80),
              // display: isRecording ? 'none' : 'flex',
            }}
          />

        </View>
      </BottomSheet>
      <View style={styles.container}>


        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: responsiveWidth(80),

            marginTop: responsiveHeight(10),
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(3.5),
              color: 'white',
              width: responsiveWidth(60),
              fontWeight: 'bold',
            }}
          >
            {list[activeIndex]?.question}
          </Text>
          <Icon
            name={'volume-up'}
            size={responsiveFontSize(3)}
            color={'white'}
            style={{

            }}
          />
        </View>
        {/* <Text style={styles.stat}>{`Started: ${state.started}`}</Text>
        <Text style={styles.stat}>{`Recognized: ${state.recognized}`}</Text>
        <Text style={styles.stat}>{`Pitch: ${state.pitch}`}</Text>
        <Text style={styles.stat}>{`Error: ${state.error}`}</Text> */}
        {/* <Text style={styles.stat}>Results</Text> */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: responsiveWidth(80),
            marginTop: responsiveHeight(2),
          }}>
          <Text
            style={{
              color: 'white',
              fontSize: responsiveFontSize(1.5),
              fontWeight: 'bold',
            }}>
            {state?.results[0]?.length}/ 250
          </Text>
          <TouchableOpacity
            onPress={() => {
              setState((prevState) => ({ ...prevState, results: [''] }));
            }}

            style={{
              padding: 10,
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: responsiveFontSize(1.5),
                fontWeight: 'bold',
                // display: isRecording ? 'none' : voiceText?.length > 0 ? 'flex' : 'none',
              }}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableHighlight
          activeOpacity={0.6}
          underlayColor={'rgba(255, 255, 255, 0.17)'}
          onPress={async () => {
            setVoiceText(state.results[0]);
            refRBSheet_JokerSent.current.open();

            // Use a delay and check if refInput exists before calling focus
            setTimeout(() => {
              if (refInput.current) {
                refInput.current.focus();  // Only focus if the input ref exists
              } else {
                console.log("Input ref is undefined");
              }
            }, 300); // Adjust delay as per your bottom sheet's animation
          }}
          style={{
            width: responsiveWidth(80),
            height: responsiveHeight(25),
            borderRadius: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.17)',
          }}
        >
          <Text style={[styles.stat, {
            color: state?.results[0]?.length > 0 ? COLORS.white : 'lightgrey',
            padding: 10,
          }]}>
            {state?.results[0]?.length > 0 ? state?.results[0] : list[activeIndex]?.placeholder}
          </Text>
        </TouchableHighlight>


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

            }}>

            (It will stop automatically when you stop talking)
          </Text>
        </View>
        <TouchableOpacity
          style={{
            padding: 5,
            alignItems: 'center',
            marginTop: responsiveHeight(2),
            // backgroundColor: "black",
            display: isRecording ? 'none' : 'flex',
          }}

          onPress={startRecognizing}
        >
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

        {/* {state.results.map((result, index) => (
        <Text key={`result-${index}`} style={styles.stat}>
          {result}
        </Text>
      ))} */}
        {/* <Text style={styles.stat}>Partial Results</Text>
        {state.partialResults.map((result, index) => (
          <Text key={`partial-result-${index}`} style={styles.stat}>
            {result}
          </Text>
        ))} */}
        {/* <Text style={styles.stat}>{`End: ${state.end}`}</Text> */}
        {/* <TouchableHighlight onPress={stopRecognizing}>
          <Text style={styles.action}>Stop Recognizing</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={cancelRecognizing}>
          <Text style={styles.action}>Cancel</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={destroyRecognizer}>
          <Text style={styles.action}>Destroy</Text>
        </TouchableHighlight> */}

        <PrimaryButton
          loading={loading}
          title="Next"

          onPress={() => {
            setLoading(true);
            // addAnswer()

            if (state?.results[0]?.length < 5) {
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
              if (state.results.length < 1) {
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
                // alert('Answer added');
              }

            }

          }}
          style={{
            marginTop: responsiveHeight(5),
            alignSelf: 'center',
            width: responsiveWidth(90),
            display: isRecording ? 'none' : 'flex',
            padding: 5,
          }}
          backgroundColor={COLORS.white}
          textColor={COLORS.primary}
        />
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
  },
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  action: {
    textAlign: 'center',
    color: 'white',
    marginVertical: 5,
    fontWeight: 'bold',
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  stat: {
    padding: '2%',
    color: 'black',
    marginBottom: 1,
    fontFamily: 'JostRegular',
    fontSize: responsiveFontSize(2),
  },
});

export default VoiceTest;
