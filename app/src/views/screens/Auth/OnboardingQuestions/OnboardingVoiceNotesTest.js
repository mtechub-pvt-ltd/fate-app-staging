import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import TopBar from '../../../../components/TopBar/TopBar';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import { addNote } from '../../../../Services/Auth/SignupService';
import Sound from 'react-native-sound';
import AudioRecord from 'react-native-audio-record';
import fonts from '../../../../consts/fonts';
import { storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';


const OnboardingVoiceNotes = ({ route, navigation }) => {
  const { showBack } = route?.params || false;
  const [isRecording, setIsRecording] = useState(false);
  const [soundFile, setSoundFile] = useState(null);
  const [soundPlayer, setSoundPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null); // Interval reference
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [falshMessage, setFalshMessage] = useState(false);
  const [falshMessageData, setFalshMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
  });

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        if (
          granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
        } else {
          console.log('Permissions denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestPermissions();
    }
  }, []);

  const startRecording = async () => {
    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      wavFile: 'test.wav',
    };

    AudioRecord.init(options);
    AudioRecord.start();
    console.log('Recording started');
    setIsRecording(true);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    const audioFile = await AudioRecord.stop();
    console.log('Recording stopped, audio file saved at: ', audioFile);
    setSoundFile(audioFile);

    const soundInstance = new Sound(audioFile, '', (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
        return;
      }
      setDuration(soundInstance.getDuration());
      setSoundPlayer(soundInstance);
      console.log('Sound loaded successfully');
    });
  };

  const playSound = () => {
    if (soundPlayer) {
      setIsPlaying(true);
      animatedWidth.setValue(0); // Reset progress bar to zero

      soundPlayer.play((success) => {
        if (success) {
          console.log('Playback finished');
        } else {
          console.log('Playback failed');
        }
        setIsPlaying(false);
        animatedWidth.setValue(0); // Reset progress bar when playback finishes
        clearInterval(intervalRef.current); // Clear the interval
      });

      // Update progress bar
      intervalRef.current = setInterval(() => {
        soundPlayer.getCurrentTime((currentTime) => {
          const progress = (currentTime / duration) * 100; // Calculate progress percentage
          Animated.timing(animatedWidth, {
            toValue: progress,
            duration: 100,
            useNativeDriver: false,
          }).start();
        });
      }, 100);
    }
  };

  const stopSound = () => {
    if (soundPlayer) {
      soundPlayer.stop(() => {
        setIsPlaying(false);
        animatedWidth.setValue(0); // Reset progress bar
        clearInterval(intervalRef.current); // Clear the interval
      });
    }
  };

  const uploadAudio = async (audioPath) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'android' ? `file://${audioPath}` : audioPath,
      type: 'audio/wav',
      name: 'audioFile.wav',
    });
    formData.append('upload_preset', 'uheajywb');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dl91sgjy1/video/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        console.log('Upload successful:', result);
        return result.secure_url;
      } else {
        console.error('Upload error:', result);
        return '';
      }
    } catch (error) {
      setLoading(false);
      console.error('Upload error:', error);
      return '';
    }
  };

  const addData = async () => {
    try {
      setLoading(true);
      const path = await uploadAudio(soundFile);
      const value = await AsyncStorage.getItem('userDetail');
      const userDetail = JSON.parse(value);
      const data = {
        user_id: userDetail.id,
        note: path,
      };
      const response = await addNote(data);
      if (!response.error) {
        await storeUserDetail(response?.user);
        navigation.replace('MyTabs');
        setLoading(false);
      } else {
        setLoading(false);
        alert(response.msg);
      }
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
    }
  };

  return (
    <GradientBackground>
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignContent: 'center',
            alignItems: 'center',
          }}
        >
          <TopBar onPress={() => navigation.goBack()} />
          <TouchableOpacity onPress={() => {
            setSoundFile(null);
            setSoundPlayer(null);
          }} style={{ padding: responsiveHeight(2) }}>
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2),
                // fontWeight: 'bold',
                fontFamily: fonts.PoppinsRegular,
                display: soundFile ? 'flex' : 'none',
              }}
            >
              RESET
            </Text>
          </TouchableOpacity>

        </View>
        <View style={{ marginTop: responsiveHeight(2), marginLeft: responsiveWidth(3) }}>
          <Text style={styles.title}>Add a voice note to let your true self shine!</Text>
        </View>


        <View
          style={{

            justifyContent: 'center',
            alignItems: 'center',
            flex: .7,
            display: soundFile && !isRecording ? 'flex' : 'none',
          }}
        >
          <Icon name="volume-up" size={responsiveHeight(6)} color={COLORS.white} />
          <View style={[styles.progressBarContainer, {
            display: soundFile ? 'flex' : 'none',
          }]}>
            <Animated.View
              style={[
                styles.progressBar,
                { width: animatedWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) },
              ]}
            />

          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >

            <TouchableOpacity
              style={{
                backgroundColor: COLORS.primary,
                padding: responsiveHeight(2),
                borderRadius: 15,
              }}
              onPress={isPlaying ? stopSound : playSound}
              disabled={!soundFile}>
              <Icon name={
                isPlaying ? 'pause-circle' : 'play-circle'
              }
                size={responsiveHeight(5)} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            flex: .7,
            display: !soundFile || isRecording ? 'flex' : 'none',
          }}
        >
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            style={{
              backgroundColor: COLORS.primary,
              padding: responsiveHeight(3),
              borderRadius: 15,

              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
            <Icon name={
              isRecording ? 'stop-circle' : 'microphone'
            }
              size={responsiveHeight(5)} color={COLORS.white} />
            <Text style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2),
              fontWeight: 'bold',
              marginTop: responsiveHeight(1),
              display: isRecording ? 'flex' : 'none',
              fontFamily: fonts.PoppinsRegular
            }}>{isRecording ? 'Listening ...' : ''}</Text>
            <Text style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2),
              fontWeight: 'bold',
              marginTop: responsiveHeight(1),
              fontFamily: fonts.PoppinsRegular
            }}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
          </TouchableOpacity>

        </View>

        <View
          style={{
            position: 'absolute',
            bottom: responsiveHeight(2),
            alignContent: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            padding: responsiveHeight(2),
          }}
        >
          <PrimaryButton loading={loading}
            title="Finish" onPress={addData}
            style={{
              width: responsiveWidth(90),
              backgroundColor: COLORS.white,
            }}
            textColor={COLORS.primary}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: responsiveFontSize(3.5),
    fontFamily: fonts.PoppinsRegular,
    color: 'white', fontWeight: '600'
  },
  progressBarContainer: {
    width: '100%',
    height: responsiveHeight(1),
    backgroundColor: '#ccc', borderRadius: 5, marginVertical: 20
  },
  progressBar: { height: '100%', backgroundColor: COLORS.primary },
  controls: { flexDirection: 'row', marginTop: 20 },
  controlButton: { padding: 10, backgroundColor: '#1DB954', borderRadius: 5, marginHorizontal: 10 },
  controlText: { color: '#fff', fontSize: 16 },
});

export default OnboardingVoiceNotes;
