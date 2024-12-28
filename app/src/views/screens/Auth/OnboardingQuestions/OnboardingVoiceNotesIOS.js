
import React, { useEffect, useState, useRef } from 'react';
import { Player } from '@react-native-community/audio-toolkit';
import {
  View,
  Text,
  Alert,
  SafeAreaView,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  Button,
  Keyboard,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import TopBar from '../../../../components/TopBar/TopBar';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import { addNote, generateWaveFormImage } from '../../../../Services/Auth/SignupService';
import Sound from 'react-native-sound';
import AudioRecord from 'react-native-audio-record';
import fonts from '../../../../consts/fonts';
import { storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';

const AudioToolkitExample = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFilePath, setAudioFilePath] = useState(null);
  const [cloudAudioUrl, setCloudAudioUrl] = useState(null);
  const [waveformImage, setWaveformImage] = useState(null);
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [falshMessage, setFalshMessage] = useState(false);
  const [falshMessageData, setFalshMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null); // Interval reference
  const [duration, setDuration] = useState(0); // Total duration of the audio
  // const [progress, setProgress] = useState(0); // For progress bar
  const progressRef = useRef(0); // Progress stored in ref
  const playerRef = useRef(null);
  const progressBarWidthRef = useRef(); // Progress bar ref


  useEffect(() => {
    // Request permissions for Android
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        if (
          granted['android.permission.RECORD_AUDIO'] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          Alert.alert('Permissions Required', 'You must allow permissions to record audio.');
        }
      }
    };

    requestPermissions();

    // Initialize AudioRecord with configuration
    const options = {
      sampleRate: 16000, // 16 kHz
      channels: 1, // Mono
      bitsPerSample: 16, // 16-bit
      audioSource: 6, // Voice Recognition
      wavFile: 'test_audio.wav', // File name
    };
    AudioRecord.init(options);
  }, []);

  const startRecording = () => {
    try {
      AudioRecord.start();
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Unable to start recording.');
    }
  };

  const stopRecording = async () => {
    try {
      const filePath = await AudioRecord.stop();
      setIsRecording(false);

      if (!filePath) {
        console.error('No file path returned after recording.');
        Alert.alert('Error', 'Recording failed.');
        return;
      }

      console.log('Recording stopped. File saved at:', filePath);
      setAudioFilePath(filePath);
      await uploadAudio(filePath);

    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Unable to stop the recording.');
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
    formData.append('upload_preset', 'uheajywb'); // Replace with your Cloudinary preset

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dl91sgjy1/video/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        console.log('Upload successful:', result);
        setCloudAudioUrl(result.secure_url);

        // processs waveform : 

        const waveFormResponse = await generateWaveFormImage(result.secure_url);
        setWaveformImage(waveFormResponse.waveformImage);


        // Set the duration from the response
        if (result.duration) {
          console.log('Audio duration from Cloudinary:', result.duration);
          setDuration(result.duration * 1000); // Convert seconds to milliseconds
        } else {
          console.warn('Duration not found in Cloudinary response');
        }
      } else {
        console.error('Upload error:', result);
        Alert.alert('Upload Failed', 'Failed to upload audio.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Upload error:', error);
      Alert.alert('Upload Error', 'An error occurred during upload.');
    }
  };
  const playCloudAudio = () => {
    if (!cloudAudioUrl) {
      Alert.alert('Error', 'No audio URL available.');
      return;
    }

    if (playerRef.current) {
      playerRef.current.destroy(); // Destroy any existing player
    }

    const newPlayer = new Player(cloudAudioUrl);
    playerRef.current = newPlayer;

    newPlayer.prepare((error) => {
      if (error) {
        console.error('Error preparing audio:', error);
        Alert.alert('Error', 'Failed to prepare audio.');
        return;
      }

      const audioDuration = duration || newPlayer.duration * 1000; // Use the duration from state or Player
      if (!audioDuration) {
        Alert.alert('Error', 'Invalid audio duration.');
        return;
      }

      console.log('Audio Duration:', audioDuration);
      progressRef.current = 0; // Reset progress
      setIsPlaying(true);

      // Start playback
      newPlayer.play((playError) => {
        if (playError) {
          console.error('Error during playback:', playError);
          Alert.alert('Error', 'Failed to play audio.');
        } else {
          console.log('Playback finished');
        }

        clearInterval(intervalRef.current); // Clear interval on completion
        setIsPlaying(false);
        progressRef.current = 100; // Ensure progress reaches 100%
        updateProgressBar(); // Final update to progress bar
      });

      // Real-time progress updates using the Player's `currentTime`
      intervalRef.current = setInterval(() => {
        const currentPosition = newPlayer.currentTime * 1000; // Get current playback position in milliseconds
        const calculatedProgress = Math.min((currentPosition / audioDuration) * 100, 100);

        progressRef.current = calculatedProgress; // Update progress in ref
        updateProgressBar(); // Update the progress bar visually

        console.log(
          `Current Time: ${currentPosition.toFixed(2)} ms, Progress: ${calculatedProgress.toFixed(2)}%`
        );

        if (calculatedProgress >= 100 || !isPlaying) {
          clearInterval(intervalRef.current); // Clear interval when playback completes
        }
      }, 200); // Update every 200ms
    });
  };
  const updateProgressBar = () => {
    if (progressBarWidthRef.current) {
      const progress = progressRef.current || 0;
      progressBarWidthRef.current.setNativeProps({
        style: { width: `${progress}%` },
      });
      console.log(`Updated Progress Bar Width: ${progress}%`);
    }
  };

  const stopAudio = () => {
    if (playerRef.current) {
      playerRef.current.stop(() => {
        setIsPlaying(false);
        progressRef.current = 0; // Reset progress
        updateProgressBar();
        clearInterval(intervalRef.current);
      });
    }
  };

  const addData = async () => {
    try {
      setLoading(true);

      const value = await AsyncStorage.getItem('userDetail');
      const userDetail = JSON.parse(value);
      const data = {
        user_id: userDetail.id,
        note: cloudAudioUrl,
      };
      const response = await addNote(data);
      if (!response.error) {
        await storeUserDetail(response?.user);
        navigation.replace('MyTabs');

      } else {
        alert(response.msg);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
    }
  };


  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current); // Cleanup on unmount
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);




  return (
    <GradientBackground>
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}
      {loading &&
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
        </View>

      }
      <SafeAreaView style={{ padding: 20, flex: 1 }}>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            flex: 1,
          }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
        >
          <View style={{ flex: 1 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}>

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
                  setAudioFilePath(null);
                  setCloudAudioUrl(null);
                }} style={{ padding: responsiveHeight(2) }}>
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: responsiveFontSize(2),
                      // fontWeight: 'bold',
                      fontFamily: fonts.PoppinsRegular,
                      // display: cloudAudioUrl ? 'flex' : 'none',
                    }}
                  >
                    RESET
                  </Text>
                </TouchableOpacity>

              </View>
              <View style={{
                marginTop: responsiveHeight(2),
                marginLeft: responsiveWidth(3),
                width: responsiveWidth(85)
              }}>
                <Text style={styles.title}>
                  Share a bit about yourself or leave a voice note to let your true self shine!
                </Text>
              </View>
              <TextInput
                autoCapitalize={'none'}
                style={{
                  backgroundColor: 'background: rgba(255, 255, 255, 0.08)',
                  width: responsiveWidth(90),
                  padding: responsiveHeight(2),
                  paddingTop: responsiveHeight(2),
                  borderRadius: 20,
                  marginTop: responsiveHeight(4),
                  borderColor: 'rgba(255, 255, 255, 0.24)',
                  borderWidth: 1,
                  color: 'white',
                  fontSize: responsiveFontSize(2),
                  height: Platform.OS === 'ios' ? responsiveHeight(15) : 'auto',
                }}
                multiline={true}
                numberOfLines={4}
                placeholder={'Start Typing ...'}
                placeholderTextColor={'#ABABAB'}
                // value={voiceText}
                maxLength={250}
                onChangeText={text => {
                  // setVoiceText(text);
                }}
                onSubmitEditing={() => {
                  // setVoiceText((prevText) => prevText + '\n');
                  // Keyboard.dismiss();
                }}
                blurOnSubmit={true}
                returnKeyType="done"
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: .7,
                  display: cloudAudioUrl ? 'none' : 'flex',
                }}
              >
                <TouchableOpacity
                  onPress={isRecording ? stopRecording : startRecording}
                  style={{

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

                    fontFamily: fonts.PoppinsRegular
                  }}>{isRecording ? 'Listening ...' : ''}</Text>
                  <Text style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(2),
                    fontWeight: '500',
                    marginTop: responsiveHeight(1),
                    fontFamily: fonts.PoppinsRegular
                  }}>{isRecording ? 'Stop Recording' : 'Tap to talk'}</Text>
                </TouchableOpacity>

              </View>
              <View
                style={{

                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: .7,
                  display: cloudAudioUrl ? 'flex' : 'none',
                }}
              >
                <Image
                  source={{ uri: waveformImage }}
                  style={{
                    width: '100%',
                    height: 120,
                  }}
                  resizeMode="contain"
                />
                <Icon name="volume-up" size={responsiveHeight(6)} color={COLORS.white} />
                <View
                  style={{
                    width: '100%',
                    height: responsiveHeight(1),
                    backgroundColor: '#ccc',
                    borderRadius: 5,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    ref={progressBarWidthRef}
                    style={{
                      width: `${progressRef.current}%`, // Use progressRef for real-time updates
                      height: '100%',
                      backgroundColor: 'red', // Progress bar color
                    }}
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
                    onPress={() => {
                      isPlaying ? stopAudio() : playCloudAudio();
                    }}
                  >
                    <Icon name={
                      isPlaying ? 'pause-circle' : 'play-circle'
                    }
                      size={responsiveHeight(5)} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>

            </ScrollView>
            <View
              style={{
                alignContent: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                padding: responsiveHeight(1),
              }}
            >
              <PrimaryButton loading={loading}
                title="Finish"
                onPress={addData}
                style={{
                  width: responsiveWidth(90),
                  backgroundColor: COLORS.white,
                }}
                textColor={COLORS.primary}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};
const styles = StyleSheet.create({
  title: {
    fontSize: responsiveFontSize(3),
    color: 'white', fontWeight: '600',
    fontFamily: fonts.PoppinsRegular,
  },
  progressBarContainer: {
    width: '100%',
    height: responsiveHeight(1),
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginVertical: 20,
    overflow: 'hidden', // Ensure no overflow of progress bar
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  controls: { flexDirection: 'row', marginTop: 20 },
  controlButton: { padding: 10, backgroundColor: '#1DB954', borderRadius: 5, marginHorizontal: 10 },
  controlText: { color: '#fff', fontSize: 16 },
});

export default AudioToolkitExample;
