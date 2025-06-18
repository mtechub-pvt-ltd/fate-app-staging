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
import { addNote } from '../../../../Services/Auth/SignupService';
import AudioRecord from 'react-native-audio-record';
import fonts from '../../../../consts/fonts';
import { storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSelector, useDispatch } from 'react-redux';
import { setBio } from '../../../../redux/features/form/formSlice';
import MiniAudioPlayer from '../../../../components/AudioPlayer/MiniAudioPlayer';

const AudioToolkitExample = ({ navigation }) => {
  const dispatch = useDispatch();
  const bio = useSelector((state) => state.form.bio);

  const userGender = useSelector((state) => state.form.gender);

  const formData1 = useSelector((state) => state.form);
  const [isRecording, setIsRecording] = useState(false);
  const [audioFilePath, setAudioFilePath] = useState(null);
  const [cloudAudioUrl, setCloudAudioUrl] = useState(null);
  const [waveformWidth, setWaveformWidth] = useState(0);
  const [waveformImage, setWaveformImage] = useState(null);
  const [voiceText, setVoiceText] = useState('');
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
  const intervalRef = useRef(null); // Interval reference
  const [duration, setDuration] = useState(0); // Total duration of the audio
  const [audioLoading, setAudioLoading] = useState(false); // Track audio loading state
  const [uploadingAudio, setUploadingAudio] = useState(false); // Track audio upload state
  const progressRef = useRef(0); // Progress stored in ref
  const playerRef = useRef(null);
  const progressBarWidthRef = useRef(); // Progress bar ref

  const requestPermissionsAndInitAudio = async () => {
    if (Platform.OS === 'android') {
      try {
        // First check if permissions are already granted
        const checkAudio = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        const checkStorage = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);

        if (!checkAudio || !checkStorage) {
          // Request permissions if not granted
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ]);

          if (
            granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.DENIED ||
            granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.DENIED
          ) {
            // If permissions are denied, show the settings alert
            Alert.alert(
              'Permissions Required',
              'You must allow permissions to record audio. Go to Settings > App Permissions to enable them.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
              ]
            );
            return;
          }
        }

        // If we reach here, permissions are granted
        console.log('All permissions granted');
        initAudioRecording();
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    } else {
      // iOS doesn't need runtime permissions for audio recording
      initAudioRecording();
    }
  };

  const initAudioRecording = () => {
    // Initialize AudioRecord with configuration
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

    return () => {
      // Cleanup on unmount
      clearInterval(intervalRef.current);
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
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
      setUploadingAudio(true); // Show loading indicator during upload

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? 'file://' + filePath : filePath, // Remove 'file://' for iOS
        type: 'audio/wav', // or the appropriate mime type for your recording
        name: new Date().getTime() + Math.random().toString(36).substring(7) + '.wav',
      });

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
        setUploadingAudio(false); // Hide loading indicator after successful upload
        return data.data.fullUrl;
      } else {
        console.error('Audio upload error:', data);
        setUploadingAudio(false); // Hide loading indicator after failed upload
        return null;
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      setUploadingAudio(false); // Hide loading indicator on error
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
    setAudioLoading(true); // Show loading indicator while preparing audio
    const newPlayer = new Player(cloudAudioUrl);
    playerRef.current = newPlayer;
    setIsPlaying(true); // Update playback state
    await newPlayer.prepare((error) => {
      if (error) {
        console.error('Error preparing audio:', error);
        Alert.alert('Error', 'Failed to prepare audio.');
        setAudioLoading(false); // Hide loading indicator on error
        setIsPlaying(false);
        return;
      }
      const audioDuration = duration || newPlayer.duration * 1000; // Use the duration from state or Player
      if (!audioDuration || audioDuration <= 0) {
        Alert.alert('Error', 'Invalid audio duration.');
        console.error('Invalid audio duration:', audioDuration);
        setAudioLoading(false); // Hide loading indicator on error
        setIsPlaying(false);
        return;
      }
      console.log('Audio duration:', audioDuration);
      // Reset animation to start
      animatedWidth.value = 0;
      newPlayer.play((playError) => {
        setAudioLoading(false); // Hide loading indicator when playback finishes
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

  const addData = async () => {
    try {
      setLoading(true);
      const value = await AsyncStorage.getItem('userDetail');
      console.log('User detail:', value);
      if (!value) {
        setFalshMessageData({
          message: 'User Not Found',
          description: 'Please restart the app and try again.',
          type: 'danger',
          icon: 'danger',
        });
        setFalshMessage(true);
        setTimeout(() => setFalshMessage(false), 3000);
        setLoading(false);
        return;
      }

      const userDetail = JSON.parse(value);

      if (!userDetail || !userDetail.id) {
        setFalshMessageData({
          message: 'Invalid User Data',
          description: 'User information is incomplete. Please restart the app.',
          type: 'danger',
          icon: 'danger',
        });
        setFalshMessage(true);
        setTimeout(() => setFalshMessage(false), 3000);
        setLoading(false);
        return;
      }

      const data = {
        user_id: userDetail.id,
        note: cloudAudioUrl,
        bio_notes: voiceText,
      };

      // Update Redux with both text and audio before API call


      // Make API call in background
      const response = await addNote(data);
      if (!response.error) {
        await storeUserDetail(response?.user);
        setVoiceText('');
        setCloudAudioUrl(null);
        setWaveformImage(null);
      } else {
        setFalshMessageData({
          message: 'Error',
          description: response.msg || 'Something went wrong. Please try again.',
          type: 'danger',
          icon: 'danger',
        });
        setFalshMessage(true);
        setTimeout(() => setFalshMessage(false), 3000);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
      setFalshMessageData({
        message: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        type: 'danger',
        icon: 'danger',
      });
      setFalshMessage(true);
      setTimeout(() => setFalshMessage(false), 3000);
    }
  };

  return (
    <GradientBackground>
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}
      {(loading || uploadingAudio) && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, .51)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <View style={{
            padding: responsiveWidth(8),
            borderRadius: 20,
            alignItems: 'center',
          }}>
            <ActivityIndicator size="large" color={COLORS.white} />
            <Text style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2.2),
              fontWeight: '600',
              marginTop: responsiveHeight(2),
              textAlign: 'center',
              fontFamily: fonts.PoppinsMedium,
            }}>
              {uploadingAudio ? 'Uploading audio...' : 'Loading...'}
            </Text>
          </View>
        </View>
      )}
      <SafeAreaView
        style={{
          padding: Platform.OS === 'ios' ? 20 : 0,
          flex: 1,
        }}
      >
        <KeyboardAvoidingView
          behavior={'height'}
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
                      fontFamily: fonts.PoppinsRegular,
                      display: cloudAudioUrl ? 'flex' : 'none',
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
              {/* Input Field with Microphone */}
              <View style={{
                marginBottom: responsiveHeight(2),
                marginTop: responsiveHeight(4),
                flexDirection: 'row',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                alignSelf: 'center',
                width: responsiveWidth(90),
              }}>
                <TextInput
                  autoCapitalize={'none'}
                  editable={!isRecording}
                  style={{
                    paddingHorizontal: responsiveWidth(3),
                    paddingTop: responsiveWidth(4),
                    paddingBottom: responsiveWidth(4),
                    color: 'white',
                    fontSize: responsiveFontSize(1.5),
                    fontFamily: fonts.PoppinsMedium,
                    width: '85%',
                    // minHeight: Platform.OS === 'ios' ? responsiveHeight(12) : responsiveHeight(10),
                  }}
                  multiline={true}
                  placeholder="Type your bio or tap to record"
                  placeholderTextColor={'rgba(255, 255, 255, 0.6)'}
                  value={voiceText}
                  maxLength={250}
                  onChangeText={(text) => {
                    setVoiceText(text);
                  }}
                  returnKeyType="done"
                />

                {/* Microphone Icon */}
                <View
                  style={{
                    width: '15%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TouchableOpacity
                    disabled={voiceText.length >= 250}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isRecording ? '#E91E63' : 'rgba(255, 255, 255, 0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      opacity: voiceText.length >= 250 ? 0.5 : 1,
                    }}
                    onPress={isRecording ? stopRecording : startRecording}>
                    <Icon
                      name={isRecording ? 'stop' : 'microphone'}
                      size={18}
                      color={voiceText.length >= 250 ? '#888' : 'white'}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Character Count */}
              <Text
                style={{
                  color: voiceText?.length >= 240 ? '#FFA500' : 'rgba(255, 255, 255, 0.6)',
                  fontSize: responsiveFontSize(1.4),
                  fontFamily: fonts.JostRegular,
                  textAlign: 'right',
                  marginBottom: responsiveHeight(1),
                  width: responsiveWidth(90),
                  alignSelf: 'center',
                }}>
                {voiceText?.length}/250
              </Text>

              {/* Recording Status */}
              {isRecording && (
                <View style={{
                  alignItems: 'center',
                  marginBottom: responsiveHeight(3),
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(233, 30, 99, 0.2)',
                    paddingHorizontal: responsiveWidth(4),
                    paddingVertical: responsiveHeight(1),
                    borderRadius: 20,
                  }}>
                    <View style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#E91E63',
                      marginRight: 8,
                    }} />
                    <Text style={{
                      color: 'white',
                      fontSize: responsiveFontSize(1.6),
                      fontFamily: fonts.JostMedium,
                    }}>
                      Recording...
                    </Text>
                  </View>
                  <Text style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: responsiveFontSize(1.3),
                    fontFamily: fonts.JostRegular,
                    marginTop: responsiveHeight(1),
                    textAlign: 'center',
                  }}>
                    Tap the microphone to stop
                  </Text>
                </View>
              )}

              {/* Character limit warning */}
              {voiceText.length >= 250 && (
                <View style={{
                  backgroundColor: 'rgba(255, 165, 0, 0.2)',
                  padding: responsiveHeight(1.5),
                  borderRadius: 10,
                  marginBottom: responsiveHeight(2),
                  width: responsiveWidth(90),
                  alignSelf: 'center',
                }}>
                  <Text style={{
                    color: '#FFA500',
                    fontSize: responsiveFontSize(1.4),
                    fontFamily: fonts.PoppinsMedium,
                    textAlign: 'center',
                  }}>
                    Character limit reached
                  </Text>
                </View>
              )}
              <View
                style={{
                  position: 'relative',
                  width: responsiveWidth(90),
                  paddingBottom: responsiveHeight(2),
                  display: cloudAudioUrl ? 'flex' : 'none',
                  alignSelf: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                }}
              >
                <MiniAudioPlayer audioUrl={cloudAudioUrl} autoPlay={false} onClose={() => { }} />
              </View>
              <View
                style={{
                  height: responsiveHeight(15),
                }}
              />
            </ScrollView>
            <View
              style={{
                alignContent: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                padding: responsiveHeight(1),
                marginBottom: responsiveHeight(5),
              }}
            >
              <PrimaryButton
                loading={loading}
                title="Submit"
                // onPress={addData}
                onPress={() => {
                  dispatch(setBio({
                    text: voiceText,
                    audio: cloudAudioUrl
                  }));

                  if (userGender === 'Male') {
                    // Male users go to GetInstantAccess
                    navigation.navigate('GetInstantAccess');
                  } else {
                    // Female users go directly to OnboardingVoiceNotesIOS
                    navigation.navigate('ProfileCreationLoader', {
                      addUserToWaitingList: false,
                    });
                  }


                }}
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
