import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Animated,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  Linking
} from 'react-native';

import { getUserDetail, storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import { updateUserProfileData, verifyPhotos } from '../../../../Services/Auth/SignupService';
import { ScrollView } from 'react-native-gesture-handler';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import Sound from 'react-native-sound';
import {
  CloudArrowUp,
  Microphone
} from 'phosphor-react-native';
import { height, width } from '../../../../consts/Dimension';
import SecondaryButton from '../../../../components/Button/SecondaryButton';
import MiniAudioPlayer from '../../../../components/AudioPlayer/MiniAudioPlayer';
import TrackPlayer from 'react-native-track-player';


let soundInstance = null;
function HomePage({ route, navigation }) {
  const isFocused = useIsFocused();
  const refBottomSheet = useRef(null);
  const refBottomSheet1 = useRef(null);
  const refRBSheet = useRef(null);
  const refSpotifySheet = useRef(null);
  const refInstagramSheet = useRef(null);
  const refAudioPlayerSheet = useRef(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const animatedWidth = useRef(new Animated.Value(0)).current; // Progress bar animation value
  const intervalRef = useRef(null); // Interval reference
  const [soundPlayer, setSoundPlayer] = useState(null);
  const [isSpotifyModalVisible, setSpotifyModalVisible] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  const [profilePicture, setProfilePicture] = useState({ uri: '' });

  // Flash message state
  const [flashMessage, setFlashMessage] = useState(false);
  const [flashMessageData, setFlashMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
    backgroundColor: COLORS.red, // Default background color
    textColor: COLORS.white, // Default text color
  });

  const openGallery = async (type) => {
    try {
      launchImageLibrary(
        {
          mediaType: 'photo',
          includeBase64: false,
          maxHeight: 1200,
          maxWidth: 1200,
          selectionLimit: 1, // Assuming you want to pick one image at a time
        },
        async response => {
          if (type === 'FOR_IMAGES') {
            refBottomSheet1.current.close();
          } else {
            refBottomSheet.current.close();
          }
          console.log('Gallery ImagePicker Response = ', response);
          if (response.didCancel) {
            console.log('User cancelled gallery image picker');
          } else if (response.errorCode) {
            console.log('Gallery ImagePicker Error Code: ', response.errorCode);
          } else if (response.errorMessage) {
            console.log('Gallery ImagePicker Error Message: ', response.errorMessage);
          } else if (response.assets && response.assets.length > 0) {
            console.log('Gallery image picker success!');
            console.log('Gallery selected image URI:', response.assets[0].uri);
            console.log('Gallery image file size:', response.assets[0].fileSize);
            console.log('Gallery image type:', response.assets[0].type);
            setLoading(true);
            if (type === 'FOR_IMAGES') {
              // upload image to cloudinary
              console.log('Starting image upload process...');

              // Test network first
              const networkOk = await testNetworkConnection();
              if (!networkOk) {
                setLoading(false);
                setFlashMessageData({
                  message: 'Network Error',
                  description: 'Unable to connect to server. Please check your internet connection.',
                  type: 'error',
                  icon: 'error',
                  backgroundColor: COLORS.red,
                  textColor: COLORS.white,
                });
                setFlashMessage(true);
                setTimeout(() => setFlashMessage(false), 3000);
                return;
              }

              uploadImage(response.assets[0].uri).then((x) => {
                console.log('image uploaded', x);
                if (x) {
                  const newImages = [...(userData?.images || []), x];
                  updateUserProfile(newImages, 'IMAGES');
                } else {
                  setLoading(false);
                  setFlashMessageData({
                    message: 'Upload Failed',
                    description: 'Failed to upload image. Please try again.',
                    type: 'error',
                    icon: 'error',
                    backgroundColor: COLORS.red,
                    textColor: COLORS.white,
                  });
                  setFlashMessage(true);
                  setTimeout(() => setFlashMessage(false), 3000);
                }
              }).catch((err) => {
                console.log('Upload error:', err);
                setLoading(false);
                setFlashMessageData({
                  message: 'Upload Failed',
                  description: 'Failed to upload image. Please try again.',
                  type: 'error',
                  icon: 'error',
                  backgroundColor: COLORS.red,
                  textColor: COLORS.white,
                });
                setFlashMessage(true);
                setTimeout(() => setFlashMessage(false), 3000);
              });
            } else {
              console.log('Starting profile image upload process...');

              // Test network first
              const networkOk = await testNetworkConnection();
              if (!networkOk) {
                setLoading(false);
                setFlashMessageData({
                  message: 'Network Error',
                  description: 'Unable to connect to server. Please check your internet connection.',
                  type: 'error',
                  icon: 'error',
                  backgroundColor: COLORS.red,
                  textColor: COLORS.white,
                });
                setFlashMessage(true);
                setTimeout(() => setFlashMessage(false), 3000);
                return;
              }

              setProfilePicture({
                uri: response.assets[0].uri,
              });
              uploadProfileImage(response.assets[0].uri).then((x) => {
                console.log('Profile image uploaded:', x);
                if (x) {
                  setUserData({ ...userData, profile_image: x });
                  updateUserProfile(x, 'PROFILE');
                } else {
                  setLoading(false);
                  setFlashMessageData({
                    message: 'Upload Failed',
                    description: 'Failed to upload profile image. Please try again.',
                    type: 'error',
                    icon: 'error',
                    backgroundColor: COLORS.red,
                    textColor: COLORS.white,
                  });
                  setFlashMessage(true);
                  setTimeout(() => setFlashMessage(false), 3000);
                }
              }).catch((err) => {
                console.log('Profile upload error:', err);
                setLoading(false);
                setFlashMessageData({
                  message: 'Upload Failed',
                  description: 'Failed to upload profile image. Please try again.',
                  type: 'error',
                  icon: 'error',
                  backgroundColor: COLORS.red,
                  textColor: COLORS.white,
                });
                setFlashMessage(true);
                setTimeout(() => setFlashMessage(false), 3000);
              });
            }
          }
        },
      );
    } catch (err) {
      console.error(err);
    }
  };

  const openCamera = async (type) => {
    try {
      await launchCamera(
        {
          mediaType: 'photo',
          includeBase64: false,
          maxHeight: 1200,
          maxWidth: 1200,
          selectionLimit: 1, // Assuming you want to pick one image at a time
        },
        async response => {
          if (type === 'FOR_IMAGES') {
            refBottomSheet1.current.close();
          } else {
            refBottomSheet.current.close();
          }
          console.log('ImagePicker Response = ', response);
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorCode) {
            console.log('ImagePicker Error Code: ', response.errorCode);
          } else if (response.errorMessage) {
            console.log('ImagePicker Error Message: ', response.errorMessage);
          } else if (response.assets && response.assets.length > 0) {
            console.log('Image picker success!');
            console.log('Selected image URI:', response.assets[0].uri);
            console.log('Image file size:', response.assets[0].fileSize);
            console.log('Image type:', response.assets[0].type);
            setLoading(true);

            if (type === 'FOR_IMAGES') {
              // Upload image for Pictures section
              console.log('Starting camera image upload process...');

              // Test network first
              const networkOk = await testNetworkConnection();
              if (!networkOk) {
                setLoading(false);
                setFlashMessageData({
                  message: 'Network Error',
                  description: 'Unable to connect to server. Please check your internet connection.',
                  type: 'error',
                  icon: 'error',
                  backgroundColor: COLORS.red,
                  textColor: COLORS.white,
                });
                setFlashMessage(true);
                setTimeout(() => setFlashMessage(false), 3000);
                return;
              }

              uploadImage(response.assets[0].uri).then((x) => {
                console.log('image uploaded', x);
                if (x) {
                  const newImages = [...(userData?.images || []), x];
                  updateUserProfile(newImages, 'IMAGES');
                } else {
                  setLoading(false);
                  setFlashMessageData({
                    message: 'Upload Failed',
                    description: 'Failed to upload image. Please try again.',
                    type: 'error',
                    icon: 'error',
                    backgroundColor: COLORS.red,
                    textColor: COLORS.white,
                  });
                  setFlashMessage(true);
                  setTimeout(() => setFlashMessage(false), 3000);
                }
              }).catch((err) => {
                console.log('Upload error:', err);
                setLoading(false);
                setFlashMessageData({
                  message: 'Upload Failed',
                  description: 'Failed to upload image. Please try again.',
                  type: 'error',
                  icon: 'error',
                  backgroundColor: COLORS.red,
                  textColor: COLORS.white,
                });
                setFlashMessage(true);
                setTimeout(() => setFlashMessage(false), 3000);
              });
            } else {
              // Upload image for Profile Picture section
              console.log('Starting camera profile image upload process...');

              // Test network first
              const networkOk = await testNetworkConnection();
              if (!networkOk) {
                setLoading(false);
                setFlashMessageData({
                  message: 'Network Error',
                  description: 'Unable to connect to server. Please check your internet connection.',
                  type: 'error',
                  icon: 'error',
                  backgroundColor: COLORS.red,
                  textColor: COLORS.white,
                });
                setFlashMessage(true);
                setTimeout(() => setFlashMessage(false), 3000);
                return;
              }

              uploadProfileImage(response.assets[0].uri).then((x) => {
                console.log('Profile image uploaded:', x);
                if (x) {
                  setUserData({ ...userData, profile_image: x });
                  updateUserProfile(x, 'PROFILE');
                } else {
                  setLoading(false);
                  setFlashMessageData({
                    message: 'Upload Failed',
                    description: 'Failed to upload profile image. Please try again.',
                    type: 'error',
                    icon: 'error',
                    backgroundColor: COLORS.red,
                    textColor: COLORS.white,
                  });
                  setFlashMessage(true);
                  setTimeout(() => setFlashMessage(false), 3000);
                }
              }).catch((err) => {
                console.log('Profile upload error:', err);
                setLoading(false);
                setFlashMessageData({
                  message: 'Upload Failed',
                  description: 'Failed to upload profile image. Please try again.',
                  type: 'error',
                  icon: 'error',
                  backgroundColor: COLORS.red,
                  textColor: COLORS.white,
                });
                setFlashMessage(true);
                setTimeout(() => setFlashMessage(false), 3000);
              });
            }
          }
        },
      );
    } catch (err) {
      console.error(err);
    }
  };

  const uploadProfileImage = async (uri) => {
    console.log('=== PROFILE IMAGE UPLOAD START ===');
    console.log('URI received:', uri);
    console.log('URI type:', typeof uri);
    console.log('URI length:', uri?.length);

    const formData = new FormData();

    // Log the file object being appended
    const fileObj = {
      uri: uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    };
    console.log('File object to append:', fileObj);

    formData.append('file', fileObj);

    // Comment out Cloudinary upload code
    /*
    formData.append('upload_preset', 'uheajywb');
    try {
      const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dl91sgjy1/image/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadResult = await uploadResponse.json();
      return uploadResult.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
    */

    // New upload implementation using custom backend API
    try {
      console.log('Making fetch request to:', 'https://backend.fatedating.com/upload-file');
      console.log('Request method: POST');
      console.log('FormData keys:', formData._parts ? formData._parts.map(part => part[0]) : 'FormData structure unknown');

      const uploadResponse = await fetch('https://backend.fatedating.com/upload-file', {
        method: 'POST',
        body: formData,
      });

      console.log('Response received!');
      console.log('Response status:', uploadResponse.status);
      console.log('Response statusText:', uploadResponse.statusText);
      console.log('Response headers:', uploadResponse.headers);

      if (!uploadResponse.ok) {
        console.error('HTTP Error:', uploadResponse.status, uploadResponse.statusText);
        const errorText = await uploadResponse.text();
        console.error('Error response body:', errorText);
        return null;
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', JSON.stringify(uploadResult, null, 2));

      if (!uploadResult.error) {
        console.log('✅ Profile image uploaded successfully:', uploadResult.msg);
        console.log('✅ Image URL:', uploadResult.data.fullUrl);
        return uploadResult.data.fullUrl; // Return the URL of the uploaded image
      } else {
        console.error('❌ Profile image upload error:', uploadResult);
        return null; // Return null if upload failed
      }
    } catch (error) {
      console.error('❌ Profile image upload exception:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      if (error.message.includes('Network request failed')) {
        console.error('🔥 NETWORK REQUEST FAILED - This usually means:');
        console.error('1. No internet connection');
        console.error('2. Server is down');
        console.error('3. CORS or network policy blocking request');
        console.error('4. Invalid URL or endpoint');
      }

      return null;
    }
    finally {
      console.log('=== PROFILE IMAGE UPLOAD END ===');
    }
  };

  const uploadImage = async (img) => {
    console.log('=== IMAGE UPLOAD START ===');
    console.log('IMG URI received:', img);
    console.log('IMG URI type:', typeof img);
    console.log('IMG URI length:', img?.length);

    const formData = new FormData();

    // Log the file object being appended
    const fileObj = {
      uri: img,
      type: 'image/jpeg',
      name: 'profilePicture.jpg',
    };
    console.log('IMG File object to append:', fileObj);

    formData.append('file', fileObj);

    // Comment out Cloudinary upload code
    /*
    formData.append('upload_preset', 'mwawkvfq');
    try {
      const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dfhk5givd/image/upload', { // Updated URL
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const uploadResult = await uploadResponse.json();
      return uploadResult.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      return ''; // Return empty string or handle error as needed
    }
    */

    // New upload implementation using custom backend API
    try {
      console.log('Making IMG fetch request to:', 'https://backend.fatedating.com/upload-file');
      console.log('IMG Request method: POST');
      console.log('IMG FormData keys:', formData._parts ? formData._parts.map(part => part[0]) : 'FormData structure unknown');

      const uploadResponse = await fetch('https://backend.fatedating.com/upload-file', {
        method: 'POST',
        body: formData,
      });

      console.log('IMG Response received!');
      console.log('IMG Response status:', uploadResponse.status);
      console.log('IMG Response statusText:', uploadResponse.statusText);

      if (!uploadResponse.ok) {
        console.error('IMG HTTP Error:', uploadResponse.status, uploadResponse.statusText);
        const errorText = await uploadResponse.text();
        console.error('IMG Error response body:', errorText);
        return '';
      }

      const uploadResult = await uploadResponse.json();
      console.log('IMG Upload result:', JSON.stringify(uploadResult, null, 2));

      if (!uploadResult.error) {
        console.log('✅ Image uploaded successfully:', uploadResult.msg);
        console.log('✅ Image URL:', uploadResult.data.fullUrl);
        return uploadResult.data.fullUrl; // Return the URL of the uploaded image
      } else {
        console.error('❌ Upload error:', uploadResult);
        return ''; // Return empty string or handle error as needed
      }
    } catch (error) {
      console.error('❌ IMG Upload exception:', error);
      console.error('IMG Error name:', error.name);
      console.error('IMG Error message:', error.message);
      console.error('IMG Error stack:', error.stack);

      if (error.message.includes('Network request failed')) {
        console.error('🔥 IMG NETWORK REQUEST FAILED - This usually means:');
        console.error('1. No internet connection');
        console.error('2. Server is down');
        console.error('3. CORS or network policy blocking request');
        console.error('4. Invalid URL or endpoint');
      }

      return ''; // Return empty string or handle error as needed
    }
    finally {
      console.log('=== IMAGE UPLOAD END ===');
    }
  };

  const getuserData = async () => {
    const user = await getUserDetail();
    setUserData(user.data);
  };

  // Test network connectivity first
  const testNetworkConnection = async () => {
    try {
      // Try a simple GET request to the upload endpoint without sending data
      const response = await fetch('https://backend.fatedating.com/upload-file', {
        method: 'OPTIONS', // Use OPTIONS to test if endpoint is reachable
        timeout: 5000,
      });
      console.log('Network test response:', response.status);
      return true; // If we get any response, network is working
    } catch (error) {
      console.log('Network test failed:', error);
      // Try a simpler connectivity test
      try {
        const simpleTest = await fetch('https://www.google.com', {
          method: 'HEAD',
          timeout: 3000,
        });
        console.log('Simple network test passed');
        return true; // Internet is working, might be server-specific issue
      } catch (simpleError) {
        console.log('No internet connection:', simpleError);
        return false;
      }
    }
  };

  const playAudioFromURL = (audioURL) => {
    console.log('Audio URL:', audioURL);

    // Force a fresh instance each time by adding a unique query or destroying previous
    if (soundPlayer) {
      soundPlayer.stop(() => {
        soundPlayer.release();
      });
    }

    const cacheBusterUrl = `${audioURL}?t=${Date.now()}`; // Force reload

    const newSound = new Sound(cacheBusterUrl, '', (error) => {
      if (error) {
        console.log('Failed to load sound:', error);
        return;
      }

      console.log('Sound loaded successfully');
      const totalDuration = newSound.getDuration();
      setDuration(totalDuration);
      setSoundPlayer(newSound);
      animatedWidth.setValue(0);

      newSound.play((success) => {
        if (success) {
          console.log('Playback finished successfully');
        } else {
          console.log('Playback failed due to audio decoding errors');
        }
        setIsPlaying(false);
        animatedWidth.setValue(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      });

      setIsPlaying(true);

      // Start progress tracking
      intervalRef.current = setInterval(() => {
        newSound.getCurrentTime((seconds) => {
          const progress = seconds / totalDuration;
          animatedWidth.setValue(progress);
        });
      }, 100);
    });
  };

  // Dummy implementation for audio functionality
  const stopAudio = () => {
    if (soundPlayer) {
      soundPlayer.stop(() => {
        soundPlayer.release();
        setSoundPlayer(null);
      });
    }
    setIsPlaying(false);
    animatedWidth.setValue(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const playAudioInBottomSheet = () => {
    if (userData?.note) {
      // Stop any currently playing audio
      stopAudio();
      // Set auto-play to true so audio starts playing immediately when sheet opens
      setShouldAutoPlay(true);
      // Open the bottom sheet to play the audio
      refAudioPlayerSheet.current.open();
    } else {
      alert('No voice note available');
    }
  };

  // Enhanced handler for audio player sheet close
  const handleAudioPlayerSheetClose = () => {
    // Reset the autoPlay flag
    setShouldAutoPlay(false);
    stopAudio();
  };

  // Add all useEffect hooks to match original functionality
  useEffect(() => {
    getuserData();
  }, []);

  // Focus effect hook to match original
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Stop audio when screen unfocused
        stopAudio();
        TrackPlayer.reset();
      };
    }, [])
  );

  useEffect(() => {
    if (userData?.note) {
      console.log("New audio URL received", userData?.note);
      stopAudio(); // ensure cleanup
    }
  }, [userData?.note]);

  // Enhanced cleanup for the component
  useEffect(() => {
    return () => {
      // Ensure audio and bottom sheet are properly cleaned up
      stopAudio();
      if (refAudioPlayerSheet.current) {
        refAudioPlayerSheet.current.close();
      }
    };
  }, []);

  const updateUserProfile = async (img, imgType) => {
    // Validate age before updating
    const age = parseInt(userData.age);
    if (userData.age && (age < 18 || age > 50)) {
      if (age < 18) {
        setFlashMessageData({
          message: 'Age Validation Error',
          description: 'Age must be at least 18 years old',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => {
          setFlashMessage(false);
        }, 3000);
      } else if (age > 50) {
        setFlashMessageData({
          message: 'Age Validation Error',
          description: 'Age must be 50 years or younger',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => {
          setFlashMessage(false);
        }, 3000);
      }
      return;
    }

    setLoading(true);
    const data = {
      name: userData.name,
      age: userData.age,
      note: userData.note,
      profile_image: img && imgType == 'PROFILE' ? img : userData.profile_image,
      images: img && imgType == 'IMAGES' ? img : userData.images,
    };
    const response = await updateUserProfileData(data, userData.id);
    setLoading(false);
    if (response?.error === false) {
      await storeUserDetail(response.user);
      getuserData();

      // Show success message
      setFlashMessageData({
        message: 'Success',
        description: 'Profile updated successfully',
        type: 'success',
        icon: 'success',
        backgroundColor: COLORS.success,
        textColor: COLORS.white,
      });
      setFlashMessage(true);
      setTimeout(() => {
        setFlashMessage(false);
      }, 3000);
    } else {
      // Show error message if update fails
      setFlashMessageData({
        message: 'Error',
        description: response?.msg || 'Failed to update profile',
        type: 'info',
        icon: 'info',
        backgroundColor: COLORS.red,
        textColor: COLORS.white,
      });
      setFlashMessage(true);
      setTimeout(() => {
        setFlashMessage(false);
      }, 3000);
    }
  };

  const deleteUserImage = async (img) => {
    setLoading(true);
    const newImages = (userData?.images || []).filter((item) => item !== img);
    updateUserProfile(newImages, 'IMAGES');
  };

  const handleVerifyPhotos = async () => {
    setLoading(true);
    try {
      const response = await verifyPhotos({ user_id: userData.id });
      setLoading(false);
      if (response?.error === false) {
        setFlashMessageData({
          message: 'Success',
          description: response?.msg || 'Request sent successfully',
          type: 'success',
          icon: 'success',
          backgroundColor: COLORS.success,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => {
          setFlashMessage(false);
        }, 3000);
        refRBSheet.current.close();
      } else {
        setFlashMessageData({
          message: 'Error',
          description: response?.msg || 'Failed to send verification request',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => {
          setFlashMessage(false);
        }, 3000);
      }
    } catch (error) {
      setLoading(false);
      console.log('error', error);
      setFlashMessageData({
        message: 'Error',
        description: 'Network error occurred',
        type: 'info',
        icon: 'info',
        backgroundColor: COLORS.red,
        textColor: COLORS.white,
      });
      setFlashMessage(true);
      setTimeout(() => {
        setFlashMessage(false);
      }, 3000);
    }
  };

  const handleConnectSpotify = () => {
    refSpotifySheet.current.open();
  };

  const confirmConnectSpotify = () => {
    refSpotifySheet.current.close();
    console.log('Spotify connection confirmed');
  };

  const cancelConnectSpotify = () => {
    refSpotifySheet.current.close();
  };

  const handleConnectInstagram = () => {
    refInstagramSheet.current.open();
  };

  const confirmConnectInstagram = () => {
    refInstagramSheet.current.close();
    console.log('Instagram connection confirmed');
  };

  const cancelConnectInstagram = () => {
    refInstagramSheet.current.close();
  };

  return (
    <GradientBackground>
      {flashMessage && <FlashMessages flashMessageData={flashMessageData} />}
      <ActivityIndicator animating={loading} size="large"
        color={COLORS.white}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          display: loading ? 'flex' : 'none',
        }}
      />
      <BottomSheet height={responsiveHeight(25)} ref={refBottomSheet}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginHorizontal: responsiveWidth(5),
            marginTop: responsiveHeight(1),
          }}
        >
          {/* <TouchableOpacity
            style={{
              padding: responsiveHeight(1),
            }}
            onPress={() => {
              refBottomSheet.current.close();
            }}
          >
            <Icon name="times" size={responsiveFontSize(3)} color={COLORS.white} />
          </TouchableOpacity> */}
        </View>
        <TouchableOpacity
          onPress={() => {
            openCamera();
          }}
          style={{
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.24)',
            flexDirection: 'row',
            padding: responsiveHeight(2),
            alignContent: 'center',
            alignItems: 'center',
          }}>
          <Icon name="camera" size={responsiveFontSize(3)} color={'#8C52FF'} />
          <Text
            style={{
              fontSize: responsiveFontSize(2),
              color: COLORS.white,
              marginLeft: responsiveWidth(5),
            }}>
            Take a Photo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            openGallery();
          }}
          style={{
            flexDirection: 'row',
            padding: responsiveHeight(2),
            alignContent: 'center',
            alignItems: 'center',
          }}>
          <Icon name="image" size={responsiveFontSize(3)} color={'#8C52FF'} />
          <Text
            style={{
              fontSize: responsiveFontSize(2),
              color: COLORS.white,
              marginLeft: responsiveWidth(5),
            }}>
            Choose from Gallery
          </Text>
        </TouchableOpacity>
      </BottomSheet>
      <BottomSheet height={responsiveHeight(25)} ref={refBottomSheet1}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginHorizontal: responsiveWidth(5),
            marginTop: responsiveHeight(1),
          }}
        >
          {/* <TouchableOpacity
            style={{
              padding: responsiveHeight(1),
            }}
            onPress={() => {
              refBottomSheet1.current.close();
            }}
          >
            <Icon name="times" size={responsiveFontSize(3)} color={COLORS.white} />
          </TouchableOpacity> */}
        </View>
        <TouchableOpacity
          onPress={() => {
            openCamera('FOR_IMAGES');
          }}
          style={{
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.24)',
            flexDirection: 'row',
            padding: responsiveHeight(2),
            alignContent: 'center',
            alignItems: 'center',
          }}>
          <Icon name="camera" size={responsiveFontSize(3)} color={'#8C52FF'} />
          <Text
            style={{
              fontSize: responsiveFontSize(2),
              color: COLORS.white,
              marginLeft: responsiveWidth(5),
            }}>
            Take a Photo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            openGallery('FOR_IMAGES');
          }}
          style={{
            flexDirection: 'row',
            padding: responsiveHeight(2),
            alignContent: 'center',
            alignItems: 'center',
          }}>
          <Icon name="image" size={responsiveFontSize(3)} color={'#8C52FF'} />
          <Text
            style={{
              fontSize: responsiveFontSize(2),
              color: COLORS.white,
              marginLeft: responsiveWidth(5),
            }}>
            Choose from Gallery
          </Text>
        </TouchableOpacity>
      </BottomSheet>
      <BottomSheet height={responsiveHeight(45)} ref={refRBSheet}>
        <View
          style={{
            marginTop: responsiveHeight(3),
          }}>
          <Image source={Images.warning} style={{ width: 50, height: 50, alignSelf: 'center' }} />
          <Text
            style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2.5),
              fontFamily: fonts.PoppinsMedium,
              textAlign: 'center',
              width: responsiveWidth(70),
              marginVertical: responsiveHeight(2),
              alignSelf: 'center',
            }}>
            Confirm sending a request to verify your photos?
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              width: responsiveWidth(70),
              alignSelf: 'center',
            }}>
            <PrimaryButton
              title="Cancel"
              onPress={() => {
                refRBSheet.current.close();
              }}
              style={{
                alignSelf: 'center',
                width: responsiveWidth(30),
                backgroundColor: COLORS.primary,
                padding: 0,
              }}
            />
            <PrimaryButton
              title="Confirm"
              onPress={() => {
                handleVerifyPhotos();
              }}
              style={{
                alignSelf: 'center',
                width: responsiveWidth(30),
                padding: 0,
              }}
              loading={loading}
            />
          </View>
        </View>
      </BottomSheet>
      <BottomSheet
        height={responsiveHeight(45)}
        ref={refSpotifySheet}>
        <View style={styles.sheetContent}>
          <Image source={Images.spotify_logo} style={{ width: 50, height: 50, alignSelf: 'center' }} />
          <Text style={styles.sheetTitle}>
            Connect Spotify</Text>
          <Text style={styles.sheetMessage}>
            By connecting Spotify, you authorize us to store your Spotify information and also you will be able to see your favorite listings if you have one.

            Are you sure you want to continue?
          </Text>
          <View style={styles.sheetButtons}>
            <PrimaryButton
              title="Confirm"
              backgroundColor={COLORS.primary}
              onPress={confirmConnectSpotify}
              style={styles.sheetButton}
            />
            <PrimaryButton
              backgroundColor={COLORS.danger}
              title="Cancel"
              onPress={cancelConnectSpotify}
              style={styles.sheetButton}
            />
          </View>
        </View>
      </BottomSheet>
      <BottomSheet
        height={responsiveHeight(55)}
        ref={refInstagramSheet}>
        <View style={styles.sheetContent}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              alignContent: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image source={Images.insta_logo} style={{ width: 50, height: 50, alignSelf: 'center', tintColor: COLORS.white }} />
            <Text style={[styles.sheetTitle, {
              marginTop: responsiveHeight(2),
            }]}>
              Connect Instagram
            </Text>
            <Text style={styles.sheetMessage}>
              Connect Instagram to allow photo access (for Business/Professional accounts) and authorize data storage.

              <Text style={{ color: COLORS.danger }}>
                If you&apos;re connecting a private Instagram account, you may encounter errors accessing content. Please switch to a public account to avoid any issues.
              </Text>

              Are you sure you want to continue?
            </Text>
          </ScrollView>
          <View style={styles.sheetButtons}>
            <PrimaryButton
              title="Confirm"
              backgroundColor={COLORS.primary}
              onPress={confirmConnectInstagram}
              style={styles.sheetButton}
            />
            <PrimaryButton
              backgroundColor={COLORS.danger}
              title="Cancel"
              onPress={cancelConnectInstagram}
              style={styles.sheetButton}
            />
          </View>
        </View>
      </BottomSheet>
      <BottomSheet
        height={responsiveHeight(35)}
        ref={refAudioPlayerSheet}
        onClose={handleAudioPlayerSheetClose}>
        {userData?.note && <MiniAudioPlayer
          audioUrl={userData.note}
          onClose={() => refAudioPlayerSheet.current.close()}
          autoPlay={shouldAutoPlay}
        />}
      </BottomSheet>
      <SafeAreaView
        style={{
          flex: 1,
          display: loading ? 'none' : 'flex',
        }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                width: responsiveWidth(90),
                marginTop: Platform.OS === 'ios' ? responsiveHeight(0) : responsiveHeight(2),
                alignItems: 'center',
                paddingVertical: responsiveHeight(1),
              }}>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2.5),
                  fontFamily: fonts.PoppinsMedium,
                }}>
                {'  '}Edit Profile
              </Text>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2.2),
                  fontFamily: fonts.PoppinsMedium,
                  marginBottom: responsiveHeight(1),
                  marginHorizontal: responsiveWidth(2),
                }}>
                Profile Picture
              </Text>
              <View
                style={{
                  backgroundColor: '#FFFFFF14',
                  padding: responsiveWidth(2),
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#FFFFFF29',
                  marginTop: responsiveHeight(1),
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    refBottomSheet.current.open();
                  }}
                >
                  <ImageBackground
                    source={{
                      uri: userData?.profile_image,
                    }}
                    style={{
                      width: Platform.OS === 'ios' ? responsiveWidth(26) : responsiveWidth(25),
                      height: responsiveHeight(12.5),
                      resizeMode: 'cover',
                      alignSelf: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    imageStyle={{
                      borderRadius: 100,
                    }}
                  >
                    <Icon name="camera" size={responsiveFontSize(3)} color={COLORS.white} />
                  </ImageBackground>
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2.2),
                  fontFamily: fonts.PoppinsMedium,
                  marginBottom: responsiveHeight(2),
                  marginHorizontal: responsiveWidth(2),
                  marginTop: responsiveHeight(2),
                }}>
                Personal Information
              </Text>

              <View
                style={{
                  padding: responsiveWidth(2),
                  borderRadius: 10,
                  paddingHorizontal: responsiveWidth(2),
                }}
              >
                <CustomInput
                  title="Full Name"
                  autoCapitalize="none"
                  secureTextEntry={false}
                  onChangeText={text => {
                    setUserData({ ...userData, name: text });
                  }}
                  value={userData?.name}
                  leftIcon={true}
                  leftIconPress={() => {
                    console.log('eye-slash');
                  }}
                />
                <CustomInput
                  mainContainerStyle={{
                    marginTop: responsiveHeight(2),
                  }}
                  title="Age"
                  secureTextEntry={false}
                  keyboardType="numeric"
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9]/g, '');
                    setUserData({ ...userData, age: numericText });
                  }}
                  value={userData?.age?.toString()}
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>
                  <Text style={{ color: COLORS.white, fontSize: responsiveFontSize(1.8), fontFamily: fonts.PoppinsRegular, marginBottom: responsiveHeight(1) }}>Bio</Text>
                </View>
                <CustomInput
                  secureTextEntry={false}
                  readOnly={true}
                  value={userData?.bio_notes}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={COLORS.gray}
                />

                <CustomInput
                  mainContainerStyle={{
                    marginTop: responsiveHeight(2),
                    display: userData?.type === 'EMAIL' ? 'flex' : 'none'
                  }}
                  title="Email"
                  autoCapitalize="none"
                  secureTextEntry={false}
                  onChangeText={text => {
                    console.log(text);
                  }}
                  value={userData?.email}
                  readOnly={true}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: responsiveHeight(2),
                  marginHorizontal: responsiveWidth(2),
                  marginTop: responsiveHeight(2),
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(2.2),
                    fontFamily: fonts.PoppinsMedium,
                  }}>
                  Pictures
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    refRBSheet.current.open();
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontSize: responsiveFontSize(1.8),
                      fontFamily: fonts.PoppinsRegular,
                    }}>
                    Verify
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  backgroundColor: '#FFFFFF14',
                  padding: responsiveWidth(2),
                  borderRadius: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    flexWrap: 'wrap',
                  }}
                >{
                    userData?.images?.map((item, index) => {
                      return (
                        <ImageBackground
                          key={index}
                          source={{
                            uri: item,
                          }}
                          style={{
                            width: responsiveWidth(26),
                            height: responsiveHeight(13),
                            resizeMode: 'cover',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginVertical: responsiveHeight(1),
                            borderRadius: 10,
                          }}
                          imageStyle={{
                            borderRadius: 10,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              deleteUserImage(item);
                            }}
                            style={{
                              position: 'absolute',
                              backgroundColor: 'red',
                              borderRadius: 50,
                              top: -5,
                              right: -5,
                              padding: responsiveWidth(1),
                              paddingHorizontal: responsiveWidth(1.4),
                            }}
                          >
                            <Icon name="times" size={responsiveFontSize(2)} color={COLORS.white} />
                          </TouchableOpacity>
                        </ImageBackground>
                      );
                    })
                  }
                  <TouchableOpacity
                    onPress={() => {
                      refBottomSheet1.current.open();
                    }}
                  >
                    <ImageBackground
                      style={{
                        width: responsiveWidth(26),
                        height: responsiveHeight(13),
                        resizeMode: 'cover',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginVertical: responsiveHeight(1),
                        borderRadius: 10,
                        backgroundColor: 'rgba(255, 255, 255, 0.16)',
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        borderColor: 'rgba(255, 255, 255, 0.16)',
                      }}
                      imageStyle={{
                        borderRadius: 10,
                      }}
                    >
                      <Icon name="plus" size={responsiveFontSize(3)} color={COLORS.white} />
                    </ImageBackground>
                  </TouchableOpacity>
                </View>
              </View>

              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2.2),
                  fontFamily: fonts.PoppinsMedium,
                  marginBottom: responsiveHeight(2),
                  marginHorizontal: responsiveWidth(2),
                  marginTop: responsiveHeight(2),
                }}>
                Voice Note
              </Text>
              <View
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF14',
                  borderRadius: 15,
                  paddingHorizontal: responsiveWidth(2),
                  width: responsiveWidth(90),
                  alignSelf: 'center',
                }}
              >
                {userData?.note ? (
                  <MiniAudioPlayer
                    audioUrl={userData.note}
                    autoPlay={false}
                    onClose={() => { }}
                  />
                ) : (
                  <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <Image
                      source={Images.alert_purple}
                      style={{
                        width: 50,
                        height: 50,
                        alignSelf: 'center',
                        marginVertical: 10,
                      }}
                    />
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: responsiveFontSize(1.5),
                        fontFamily: fonts.PoppinsMedium,
                        textAlign: 'center',
                      }}>
                      No voice note found
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginVertical: responsiveHeight(2),
                    width: responsiveWidth(90),
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      playAudioInBottomSheet();
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: COLORS.primary,
                      paddingVertical: responsiveWidth(3),
                      paddingHorizontal: responsiveWidth(4),
                      borderRadius: 10,
                      marginHorizontal: responsiveWidth(2),
                    }}
                  >
                    <Microphone size={responsiveFontSize(2.5)} color={COLORS.white} />
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: responsiveFontSize(1.6),
                        fontFamily: fonts.PoppinsRegular,
                        marginLeft: responsiveWidth(2),
                      }}
                    >
                      Play Voice Note
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2.2),
                  fontFamily: fonts.PoppinsMedium,
                  display: 'none',
                  marginHorizontal: responsiveWidth(2),
                  marginVertical: responsiveWidth(3),
                }}>
                Socials
              </Text>
              {
                userData?.spotify_data ?
                  <FlatList
                    horizontal
                    data={userData?.spotify_data}
                    keyExtractor={(item) => item.track.id}
                    renderItem={({ item }) => (
                      <></>
                    )}
                    style={{
                      width: '100%',
                      paddingVertical: 5,
                    }}
                  /> :
                  <View
                    style={{
                      alignSelf: 'center',
                      display: 'none',
                    }}
                  >
                    <SecondaryButton
                      loading={loading}
                      title={'Connect Spotify'}
                      image={Images.spotify_logo}
                      onPress={handleConnectSpotify}
                    />
                  </View>
              }

              {
                userData?.instagram_data ?
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderWidth: 1,
                      borderColor: 'rgba(221, 221, 225, 0.16)',
                      width: '95%',
                      marginLeft: 10,
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      borderRadius: 15,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        width: '100%',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                      }}
                    >
                      <FlatList
                        horizontal
                        data={userData?.instagram_data?.media.reverse()}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                          <View
                            style={{
                              width: 60,
                              display:
                                item.media_type === 'IMAGE' ? 'flex' : 'none',
                              marginRight: 10,
                            }}
                          >
                            <Image
                              source={{ uri: item.media_url }}
                              style={{
                                width: '100%',
                                height: 60,
                                borderRadius: 10,
                                marginVertical: 10,
                              }}
                            />
                          </View>
                        )}
                      />
                    </View>
                  </View>
                  :
                  <View
                    style={{
                      alignSelf: 'center',
                      display: 'none',
                    }}
                  >
                    <SecondaryButton
                      loading={loading}
                      title="Connect Instagram"
                      image={Images.insta_logo}
                      imageStyle={{
                        tintColor: COLORS.white,
                      }}
                      onPress={handleConnectInstagram}
                    />
                  </View>
              }

              <View
                style={{
                  marginBottom: responsiveHeight(10),
                }}
              ></View>
            </ScrollView>

            <View
              style={{
                paddingVertical: responsiveHeight(1),
                backgroundColor: 'transparent',
                justifyContent: 'space-evenly',
                flexDirection: 'row',
              }}
            >
              <PrimaryButton
                title="Update"
                loading={false}
                onPress={() => {
                  updateUserProfile();
                }}
                style={{
                  alignSelf: 'center',
                  width: responsiveWidth(40),
                }}
                backgroundColor={COLORS.white}
                textColor={COLORS.primary}
              />
              <PrimaryButton
                title="Cancel"
                loading={false}
                onPress={() => {
                  stopAudio();
                  navigation.goBack();
                }}
                style={{
                  alignSelf: 'center',
                  width: responsiveWidth(40),
                  borderColor: '#FFFFFF29',
                  borderWidth: 1,
                  backgroundColor: '#FFFFFF1F'
                }}
                backgroundColor={COLORS.primary}
                textColor={COLORS.white}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView >
    </GradientBackground >
  );
}

const styles = StyleSheet.create({
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4),
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(1),
  },
  playButton: {
    backgroundColor: COLORS.white,
    borderRadius: 50,
    paddingVertical: responsiveWidth(3),
    paddingHorizontal: responsiveWidth(3.4),
    marginRight: responsiveWidth(4),
  },
  progressBar: (isPlaying) => ({
    height: responsiveHeight(1),
    backgroundColor: isPlaying ? COLORS.primary : COLORS.gray,
    borderRadius: 5,
    flex: 1,
  }),
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: responsiveWidth(80),
    padding: responsiveWidth(5),
    backgroundColor: COLORS.white,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: responsiveFontSize(2.5),
    fontFamily: fonts.PoppinsMedium,
    color: COLORS.primary,
    marginBottom: responsiveHeight(2),
  },
  modalMessage: {
    fontSize: responsiveFontSize(2),
    fontFamily: fonts.PoppinsRegular,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: responsiveHeight(2),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    width: '45%',
  },
  sheetContent: {
    padding: responsiveWidth(5),
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: responsiveFontSize(2.5),
    fontFamily: fonts.PoppinsMedium,
    color: COLORS.white,
    marginBottom: responsiveHeight(2),
  },
  sheetMessage: {
    fontSize: responsiveFontSize(2),
    fontFamily: fonts.PoppinsRegular,
    color: COLORS.grey,
    textAlign: 'center',
    marginBottom: responsiveHeight(2),
  },
  sheetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingTop: responsiveHeight(2),
  },
  sheetButton: {
    width: '42%',
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: responsiveWidth(90),
    marginTop: Platform.OS === 'ios' ? responsiveHeight(0) : responsiveHeight(2),
    alignItems: 'center',
    paddingVertical: responsiveHeight(1),
  },
  backButton: {
    padding: responsiveWidth(2),
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: responsiveFontSize(2.5),
    fontFamily: fonts.PoppinsMedium,
    marginLeft: responsiveWidth(2),
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: responsiveFontSize(2.2),
    fontFamily: fonts.PoppinsMedium,
    marginBottom: responsiveHeight(1),
    marginHorizontal: responsiveWidth(2),
    marginTop: responsiveHeight(2),
  },
  profilePictureContainer: {
    backgroundColor: '#FFFFFF14',
    padding: responsiveWidth(2),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF29',
    marginTop: responsiveHeight(1),
    alignItems: 'center',
  },
  profileImage: {
    width: Platform.OS === 'ios' ? responsiveWidth(26) : responsiveWidth(25),
    height: responsiveHeight(12.5),
    resizeMode: 'cover',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    marginTop: responsiveHeight(1),
    padding: responsiveWidth(2),
  },
  editImageText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(1.8),
    fontFamily: fonts.PoppinsRegular,
    textAlign: 'center',
  },
  inputContainer: {
    padding: responsiveWidth(2),
    borderRadius: 10,
    paddingHorizontal: responsiveWidth(2),
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: responsiveHeight(2),
  },
  bioTitle: {
    color: COLORS.white,
    fontSize: responsiveFontSize(1.8),
    fontFamily: fonts.PoppinsRegular,
    marginBottom: responsiveHeight(1),
  },
  picturesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(2),
    marginHorizontal: responsiveWidth(2),
    marginTop: responsiveHeight(2),
  },
  verifyText: {
    color: COLORS.primary,
    fontSize: responsiveFontSize(1.8),
    fontFamily: fonts.PoppinsRegular,
  },
  picturesContainer: {
    backgroundColor: '#FFFFFF14',
    padding: responsiveWidth(2),
    borderRadius: 10,
  },
  imageContainer: {
    width: responsiveWidth(42),
    height: responsiveHeight(20),
    marginHorizontal: responsiveWidth(1),
    marginBottom: responsiveHeight(1),
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  imageStyle: {
    borderRadius: 10,
  },
  deleteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    padding: responsiveWidth(2),
    margin: responsiveWidth(1),
  },
  addImageButton: {
    width: responsiveWidth(42),
    height: responsiveHeight(20),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: responsiveWidth(1),
  },
  addImageText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(1.6),
    fontFamily: fonts.PoppinsRegular,
    marginTop: responsiveHeight(1),
  },
  voiceNoteContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF14',
    borderRadius: 15,
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(2),
    width: responsiveWidth(90),
    alignSelf: 'center',
  },
  audioPlayerPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: responsiveWidth(3),
    borderRadius: 10,
    width: '100%',
  },
  audioText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(1.8),
    fontFamily: fonts.PoppinsRegular,
    marginLeft: responsiveWidth(2),
  },
  noVoiceNote: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: responsiveWidth(3),
  },
  noVoiceText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(1.5),
    fontFamily: fonts.PoppinsMedium,
    textAlign: 'center',
    marginTop: responsiveHeight(1),
  },
  voiceNoteActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveHeight(2),
    width: '100%',
  },
  voiceActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: responsiveWidth(3),
    borderRadius: 10,
    marginHorizontal: responsiveWidth(2),
  },
  voiceActionText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(1.6),
    fontFamily: fonts.PoppinsRegular,
    marginLeft: responsiveWidth(1),
  },
  bottomActions: {
    paddingVertical: responsiveHeight(1),
    backgroundColor: 'transparent',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  updateButton: {
    alignSelf: 'center',
    width: responsiveWidth(40),
  },
  cancelButton: {
    alignSelf: 'center',
    width: responsiveWidth(40),
    borderColor: '#FFFFFF29',
    borderWidth: 1,
    backgroundColor: '#FFFFFF1F',
  },
  bottomSheetContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: responsiveWidth(5),
    marginTop: responsiveHeight(1),
  },
  closeButton: {
    padding: responsiveWidth(2),
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(5),
  },
  optionButton: {
    alignItems: 'center',
    padding: responsiveWidth(4),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    minWidth: responsiveWidth(30),
  },
  optionText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(1.8),
    fontFamily: fonts.PoppinsRegular,
    marginTop: responsiveHeight(1),
  },
});

export default HomePage;