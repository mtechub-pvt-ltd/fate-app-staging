import React, { useEffect, useState, useRef } from 'react';
import { Player } from '@react-native-community/audio-toolkit';
import {
  View,
  Text,
  Alert,
  SafeAreaView,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Linking,
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
import AudioRecord from 'react-native-audio-record';
import fonts from '../../../../consts/fonts';
import { storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSelector, useDispatch } from 'react-redux';
import { setBio } from '../../../../redux/features/form/formSlice';
import MiniAudioPlayer from '../../../../components/AudioPlayer/MiniAudioPlayer';

const AudioToolkitExample = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const bio = useSelector((state) => state.form.bio);
  const formData1 = useSelector((state) => state.form);
  const { bio_notes, cloudinary_note } = route.params || {};
  console.log('bio_notes:', bio_notes);

  const [isRecording, setIsRecording] = useState(false);
  const [audioFilePath, setAudioFilePath] = useState(null);
  const [cloudAudioUrl, setCloudAudioUrl] = useState(null);
  const [waveformWidth, setWaveformWidth] = useState(0);
  const [waveformImage, setWaveformImage] = useState(null);
  const [voiceText, setVoiceText] = useState(bio_notes);
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false); // Add state for audio upload loader
  const [falshMessage, setFalshMessage] = useState(false);
  const [falshMessageData, setFalshMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
  });
  const [isPlaying, setIsPlaying] = useState(false);
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
    };

    // requestPermissions();

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

  const animatedWidth = useSharedValue(0); // Shared value for mask width
  const animatedStyle = useAnimatedStyle(() => ({
    width: animatedWidth.value, // Dynamic width for the fill effect
  }));

  const uploadAudio = async (filePath) => {
    if (!filePath) {
      console.log('No audio recording found');
      return null;
    }

    try {
      setUploadingAudio(true); // Show full screen loader before upload starts

      const formData = new FormData();
      formData.append('file', {
        // uri: filePath,
        uri: Platform.OS === 'android' ? 'file://' + filePath : filePath, // Remove 'file://' for iOS
        type: 'audio/wav', // or the appropriate mime type for your recording
        // name: 'voice_note.wav',
        name: new Date().getTime() + Math.random().toString(36).substring(7) + '.wav',
      });

      // Comment out Cloudinary upload code
      /*
      formData.append('upload_preset', 'mwawkvfq');
      
      const response = await fetch('https://api.cloudinary.com/v1_1/dfhk5givd/video/upload', { // Updated URL
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      console.log('Upload success', data);
      return data.secure_url;
      */

      // New upload implementation using custom backend API
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
        setUploadingAudio(false); // Hide loader after successful upload
        return data.data.fullUrl;
      } else {
        console.error('Audio upload error:', data);
        setUploadingAudio(false); // Hide loader after upload error
        return null;
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      setUploadingAudio(false); // Hide loader after upload error
      return null;
    }
  };

  const playCloudAudio = async () => {
    if (!cloudAudioUrl) {
      Alert.alert('Error', 'No audio URL available.');
      return;
    }

    if (playerRef.current) {
      playerRef.current.destroy(); // Destroy any existing player
    }

    const newPlayer = new Player(cloudAudioUrl);
    playerRef.current = newPlayer;
    setIsPlaying(true); // Update playback state

    await newPlayer.prepare((error) => {
      if (error) {
        console.error('Error preparing audio:', error);
        Alert.alert('Error', 'Failed to prepare audio.');
        return;
      }

      const audioDuration = duration || newPlayer.duration * 1000; // Use the duration from state or Player
      if (!audioDuration || audioDuration <= 0) {
        Alert.alert('Error', 'Invalid audio duration.');
        console.error('Invalid audio duration:', audioDuration);
        return;
      }

      console.log('Audio duration:', audioDuration);

      // Reset animation to start
      animatedWidth.value = 0;

      newPlayer.play((playError) => {
        if (playError) {
          console.error('Error during playback:', playError);
          Alert.alert('Error', 'Failed to play audio.');
        } else {
          console.log('Playback finished');
        }
        setIsPlaying(false);
        // Cleanup on playback finish
        clearInterval(intervalRef.current);

        animatedWidth.value = withTiming(0, { duration: 0 }); // Reset animation to start
      });

      // Animate the mask dynamically during playback
      intervalRef.current = setInterval(() => {
        const currentPosition = newPlayer.currentTime * 1000; // Current playback position in ms
        console.log('Current position:', currentPosition);

        if (!currentPosition || currentPosition >= audioDuration || !isPlaying) {
          clearInterval(intervalRef.current);
          console.log('Stopping interval');
          return;
        }

        const calculatedWidth = (currentPosition / audioDuration) * waveformWidth;

        console.log('Calculated width:', calculatedWidth);

        animatedWidth.value = withTiming(calculatedWidth, { duration: 200 }); // Smooth transition
      }, 200); // Update every 200ms
    });
  };

  const stopAudio = () => {
    if (playerRef.current) {
      playerRef.current.stop(() => {
        setIsPlaying(false); // Update playback state
        clearInterval(intervalRef.current); // Clear animation interval

        // Reset animation to the start
        animatedWidth.value = withTiming(0, { duration: 0 });
      });
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

  const addData = async (url) => {
    try {
      setLoading(true);
      const value = await AsyncStorage.getItem('userDetail');
      const userDetail = JSON.parse(value);
      const data = {
        user_id: userDetail.id,
        note: cloudAudioUrl === null ? cloudinary_note : cloudAudioUrl,
        bio_notes: voiceText,
      };
      console.log('Data:', data);
      const response = await addNote(data);
      console.log('Response:', response);
      if (!response.error) {
        await storeUserDetail(response?.user);
        setVoiceText('');
        setCloudAudioUrl(null);
        setWaveformImage(null);

        // Navigate to ProfileCreationLoader screen
        // navigation.navigate('ProfileCreationLoader');
        navigation.navigate('MyTabs', { screen: 'EditProfile' });
      } else {
        alert(response.msg);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
    }
  };

  return (
    <GradientBackground>
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}
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
        </View>
      )}
      <SafeAreaView
        style={{
          padding: Platform.OS === 'ios' ? 20 : 0,
          flex: 1,
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            flex: 1,
          }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
        >
          <View style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignContent: 'center',
                  alignItems: 'center',
                }}
              >
                <TopBar onPress={() => navigation.goBack()} />
                <TouchableOpacity
                  onPress={() => {
                    setAudioFilePath(null);
                    setCloudAudioUrl(null);
                    setWaveformImage(null);
                  }}
                  style={{ padding: responsiveHeight(2) }}
                >
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
              <View
                style={{
                  marginTop: responsiveHeight(2),
                  marginLeft: responsiveWidth(3),
                  width: responsiveWidth(85),
                }}
              >
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
                value={voiceText}
                maxLength={250}
                onChangeText={(text) => {
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
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 0.7,
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
                  }}
                >
                  <Icon name={isRecording ? 'stop-circle' : 'microphone'} size={responsiveHeight(5)} color={COLORS.white} />
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: responsiveFontSize(2),
                      fontWeight: 'bold',
                      marginTop: responsiveHeight(1),
                      fontFamily: fonts.PoppinsRegular,
                    }}
                  >
                    {isRecording ? 'Listening ... Stop Recording' : ''}
                  </Text>
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: responsiveFontSize(2),
                      fontWeight: '500',
                      marginTop: responsiveHeight(1),
                      fontFamily: fonts.PoppinsRegular,
                      display: isRecording ? 'none' : 'flex',
                    }}
                  >
                    Tap to talk
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  position: 'relative',
                  width: responsiveWidth(90),
                  height: 120,
                  display: cloudAudioUrl ? 'flex' : 'none',
                  marginTop: responsiveHeight(4),
                }}
              >
                <MiniAudioPlayer audioUrl={cloudAudioUrl} autoPlay={false} onClose={() => { }} />
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
              <PrimaryButton
                loading={loading}
                title="Update"
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
    fontSize: Platform.OS === 'android' ? responsiveFontSize(2.5) : responsiveFontSize(3),
    color: 'white',
    fontWeight: '600',
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
