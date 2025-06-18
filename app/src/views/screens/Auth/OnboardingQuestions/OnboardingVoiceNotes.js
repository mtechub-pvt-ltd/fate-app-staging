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
  ActivityIndicator,
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
import MiniAudioPlayer from '../../../../components/AudioPlayer/MiniAudioPlayer';

Sound.setCategory('Playback');

const OnboardingVoiceNotes = ({ route, navigation }) => {
  const { showBack } = route?.params || false;
  const [isRecording, setIsRecording] = useState(false);
  const [soundFile, setSoundFile] = useState(null);
  const [cloudAudioUrl, setCloudAudioUrl] = useState(null);
  const [soundPlayer, setSoundPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null); // Interval reference
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false); // Add state for audio upload
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

    // Clean up interval and sound player on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (soundPlayer) {
        soundPlayer.release();
      }
    };
  }, []);

  const startRecording = async () => {
    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      wavFile: Math.random().toString(36).substring(7) + '.mp3',
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
      setAudioLoading(true); // Show loading indicator while preparing to play
      setIsPlaying(true);
      animatedWidth.setValue(0); // Reset progress bar to zero

      soundPlayer.play((success) => {
        setAudioLoading(false); // Hide loading indicator when playback finishes
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
          if (progress > 0) {
            setAudioLoading(false); // Hide loading indicator once playback actually starts
          }
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

  const uploadAudio = async () => {
    const recordingUri = soundFile;
    if (!recordingUri) {
      console.log('No audio recording found');
      return null;
    }

    try {
      setUploadingAudio(true); // Show loading overlay during upload

      const formData = new FormData();
      formData.append('file', {
        uri: recordingUri,
        type: 'audio/wav', // or the appropriate mime type for your recording
        name: new Date().getTime() + Math.random().toString(36).substring(7) + '.wav',
      });

      // Use custom backend API
      const response = await fetch('https://backend.fatedating.com/upload-file', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (!data.error) {
        console.log('Audio uploaded successfully:', data.msg);
        setCloudAudioUrl(data.data.fullUrl);
        setUploadingAudio(false); // Hide loading overlay after success
        return data.data.fullUrl;
      } else {
        console.error('Audio upload error:', data);
        setUploadingAudio(false); // Hide loading overlay after error
        return null;
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      setUploadingAudio(false); // Hide loading overlay on error
      return null;
    }
  };

  const addData = async () => {
    try {
      setLoading(true);
      const path = await uploadAudio();
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

      {/* Full Screen Loading Overlay */}
      {(loading || uploadingAudio) && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            left: responsiveHeight(0),
            top: responsiveHeight(0),
            zIndex: 999,
            width: responsiveWidth(100),
            height: responsiveHeight(100),
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <ActivityIndicator size="large" color={COLORS.white} />
          <Text style={{ color: COLORS.white, marginLeft: 10 }}>
            {uploadingAudio ? 'Uploading audio...' : 'Loading...'}
          </Text>
        </View>
      )}

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

        {/* Show playback UI */}
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 0.7,
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
            {audioLoading ? (
              <View style={{
                backgroundColor: COLORS.primary,
                padding: responsiveHeight(2),
                borderRadius: 15,
              }}>
                <ActivityIndicator size="large" color={COLORS.white} />
                <Text style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(1.5),
                  marginTop: 5,
                  textAlign: 'center',
                  fontFamily: fonts.PoppinsRegular
                }}>Loading audio...</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.primary,
                  padding: responsiveHeight(2),
                  borderRadius: 15,
                }}
                onPress={isPlaying ? stopSound : playSound}
                disabled={!soundFile || audioLoading}>
                <Icon name={
                  isPlaying ? 'pause-circle' : 'play-circle'
                }
                  size={responsiveHeight(5)} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Show recording UI */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 0.7,
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

        {/* Finish button */}
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
            disabled={!soundFile || isRecording}
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
    color: 'white',
    fontWeight: '600'
  },
  progressBarContainer: {
    width: '80%',
    height: responsiveHeight(1),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    marginVertical: 20,
    overflow: 'hidden', // Ensure no overflow of progress bar
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 5,
  },
  controls: { flexDirection: 'row', marginTop: 20 },
  controlButton: { padding: 10, backgroundColor: '#1DB954', borderRadius: 5, marginHorizontal: 10 },
  controlText: { color: '#fff', fontSize: 16 },
});

export default OnboardingVoiceNotes;
