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
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorCode) {
            console.log('ImagePicker Error: ', response.errorCode);
          } else if (response.errorMessage) {
            console.log('ImagePicker Error: ', response.errorMessage);
          } else {
            setLoading(true);
            if (type === 'FOR_IMAGES') {

              // uplaod iamge to cloudinary

              uploadImage(response.assets[0].uri).then((x) => {
                console.log('image uploaded', x);

                const newImages = [...userData.images, x];
                updateUserProfile(newImages, 'IMAGES');
              }
              ).catch((err) => { });
            } else {
              setProfilePicture({
                uri: response.assets[0].uri,
              });
              Promise.all([uploadProfileImage(response.assets[0].uri)],
                setUserData({ ...userData, profile_image: response.assets[0].uri })
              ).then((x) => {
                updateUserProfile(x[0], 'PROFILE');
              }).catch((err) => { });
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
        response => {
          if (type === 'FOR_IMAGES') {
            refBottomSheet1.current.close();
          } else {
            refBottomSheet.current.close();
          }
          console.log('Response = ', response);
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorCode) {
            // throw console.log('ImagePicker Error: ', response.errorCode);
          } else if (response.errorMessage) {
            console.log('ImagePicker Error: ', response.errorMessage);
          } else {
            setLoading(true);

            if (type === 'FOR_IMAGES') {
              // Upload image for Pictures section
              uploadImage(response.assets[0].uri).then((x) => {
                console.log('image uploaded', x);
                const newImages = [...userData.images, x];
                updateUserProfile(newImages, 'IMAGES');
              }).catch((err) => { });
            } else {
              // Upload image for Profile Picture section
              Promise.all([uploadProfileImage(response.assets[0].uri)],
                setUserData({ ...userData, profile_image: response.assets[0].uri })
              ).then((x) => {
                updateUserProfile(x[0], 'PROFILE');
                setLoading(false);
              }).catch((err) => { });
            }
          }
        },
      );
    } catch (err) {
      console.error(err);
    }
  };

  const uploadProfileImage = async (uri) => {
    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });

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
      const uploadResponse = await fetch('https://backend.fatedating.com/upload-file', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.error) {
        console.log('Profile image uploaded successfully:', uploadResult.msg);
        return uploadResult.data.fullUrl; // Return the URL of the uploaded image
      } else {
        console.error('Profile image upload error:', uploadResult);
        return null; // Return null if upload failed
      }
    } catch (error) {
      console.error('Profile image upload error:', error);
      return null;
    }
  };

  const uploadImage = async (img) => {

    const formData = new FormData();
    formData.append('file', {
      uri: img,
      type: 'image/jpeg',
      name: 'profilePicture.jpg',
    });

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
      const uploadResponse = await fetch('https://backend.fatedating.com/upload-file', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.error) {
        console.log('Image uploaded successfully:', uploadResult.msg);
        return uploadResult.data.fullUrl; // Return the URL of the uploaded image
      } else {
        console.error('Upload error:', uploadResult);
        return ''; // Return empty string or handle error as needed
      }
    } catch (error) {
      console.error('Upload error:', error);
      return ''; // Return empty string or handle error as needed
    }
  }; const updateUserProfile = async (img, imgType) => {
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

  }

  const deleteUserImage = async (img) => {
    setLoading(true);
    const newImages = userData.images.filter((item) => item !== img);
    updateUserProfile(newImages, 'IMAGES');
  }

  const getuserData = async () => {
    const user = await getUserDetail();
    setUserData(user.data);
  }


  const playAudioFromURL = (audioURL) => {
    console.log('Audio URL:', audioURL);

    // Force a fresh instance each time by adding a unique query or destroying previous
    if (soundPlayer) {
      soundPlayer.stop(() => {
        soundPlayer.release();
      });
    }

    const cacheBusterUrl = `${audioURL}?t=${Date.now()}`; // 💥 Force reload

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
          console.log('Playback failed');
        }
        setIsPlaying(false);
        clearInterval(intervalRef.current);
        animatedWidth.setValue(0);
      });

      setIsPlaying(true);

      intervalRef.current = setInterval(() => {
        newSound.getCurrentTime((currentTime) => {
          if (currentTime && totalDuration > 0) {
            const progress = (currentTime / totalDuration) * 100;
            animatedWidth.setValue(progress);
          }
        });
      }, 100);
    });
  };

  const stopAudio = () => {
    if (isPlaying && soundPlayer) {
      soundPlayer.stop(() => {
        console.log('Playback stopped');
        clearInterval(intervalRef.current); // Clear the interval
        animatedWidth.setValue(0); // Reset progress bar
        soundPlayer.release(); // Release resources
      });
      setIsPlaying(false);
    }
  };

  const handleVerifyPhotos = async () => {
    setLoading(true);
    try {
      const data = {
        user_id: userData?.id,
      }
      const response = await verifyPhotos(data);
      console.log('response', response);
      setLoading(false);
      if (response?.error == false) {

        alert('Request sent successfully');
        refRBSheet.current.close();
      }

    }
    catch (error) {
      setLoading(false);
      console.log('error', error);
    }

  }

  const handleConnectSpotify = () => {
    refSpotifySheet.current.open();
  };

  const confirmConnectSpotify = () => {
    refSpotifySheet.current.close();
    // Navigate to Test screen with parameter to auto-login
    navigation.navigate('ConnectSpotify', { autoLogin: true });
  };

  const cancelConnectSpotify = () => {
    refSpotifySheet.current.close();
  };

  const handleConnectInstagram = () => {
    refInstagramSheet.current.open();
  };

  const confirmConnectInstagram = () => {
    refInstagramSheet.current.close();
    // Navigate to Instagram connection screen
    navigation.navigate('TestInstagramNew', { autoLogin: true });
  };

  const cancelConnectInstagram = () => {
    refInstagramSheet.current.close();
  };

  // useEffect(() => {
  //   getuserData();
  // }, [isFocused]);


  useFocusEffect(
    useCallback(() => {
      // Runs every time the screen comes into focus
      console.log('Screen is focused');
      getuserData();

      return () => {
        // Optional: clean-up when leaving the screen

        console.log('Screen is unfocused');
        stopAudio(); // Stop audio when the screen is unfocused
        TrackPlayer.reset(); // Reset the player when leaving the screen
      };
    }, [])
  );

  useEffect(() => {
    if (userData?.note) {
      console.log("New audio URL received", userData?.note);
      stopAudio(); // ensure cleanup

    }
  }, [userData?.note]);

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

  // Enhanced handler for audio player sheet close
  const handleAudioPlayerSheetClose = () => {
    // Reset the autoPlay flag
    setShouldAutoPlay(false);


    stopAudio();
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
        {/* <TouchableOpacity
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
        </TouchableOpacity> */}
        {/* <TouchableOpacity
          style={{
            flexDirection: 'row',
            padding: responsiveHeight(2),
            alignContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            openGallery();
          }}>
          <Icon name="image" size={responsiveFontSize(3)} color={'#8C52FF'} />
          <Text
            style={{
              fontSize: responsiveFontSize(2),
              color: COLORS.white,
              marginLeft: responsiveWidth(5),
            }}>
            Choose a photo
          </Text>
        </TouchableOpacity> */}
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
        {/* <TouchableOpacity
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
        </TouchableOpacity> */}
        {/* <TouchableOpacity
          style={{
            flexDirection: 'row',
            padding: responsiveHeight(2),
            alignContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            openGallery('FOR_IMAGES');
          }}>
          <Icon name="image" size={responsiveFontSize(3)} color={'#8C52FF'} />
          <Text
            style={{
              fontSize: responsiveFontSize(2),
              color: COLORS.white,
              marginLeft: responsiveWidth(5),
            }}>
            Choose a photo
          </Text>
        </TouchableOpacity> */}
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
                // paddingHorizontal: responsiveWidth(2),
                paddingVertical: responsiveHeight(1),
              }}>
              {/* <TouchableOpacity
                onPress={() => {
                  stopAudio();
                  navigation.goBack();

                }}
              >
                <Icon name="chevron-left"
                  style={{
                    marginRight: responsiveWidth(2),
                    padding: responsiveWidth(2),
                  }}
                  size={responsiveFontSize(3)} color={COLORS.white} />
              </TouchableOpacity> */}
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
                {/* <TouchableOpacity
                  style={{
                    padding: responsiveWidth(1),
                    borderRadius: 30,
                    borderWidth: 1,

                    width: responsiveWidth(33),
                    alignSelf: 'center',
                    borderColor: 'white',
                    marginTop: responsiveHeight(1),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    refBottomSheet.current.open();
                  }}
                >
                  <CloudArrowUp color={COLORS.white}
                    weight='light' size={20} />
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: responsiveFontSize(1.5),
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}
                  >
                    {' '}Upload New
                  </Text>
                </TouchableOpacity> */}

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
                />                <CustomInput
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
                  {/* <TouchableOpacity
                    style={{
                      backgroundColor: 'rgba(105, 61, 191, 1)',
                      borderRadius: 10,
                      paddingHorizontal: responsiveWidth(3),
                      paddingVertical: responsiveWidth(1.5),
                    }}
                    onPress={() => {
                      navigation.navigate('OnboardingVoiceNotesIOSUpdate', {
                        showBack: true,
                        bio_notes: userData?.bio_notes,
                        cloudinary_note: userData?.note,
                      });

                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: responsiveFontSize(1.5),
                        fontFamily: fonts.PoppinsMedium,
                      }}>
                      Edit
                    </Text>
                  </TouchableOpacity> */}
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
                {/* <TouchableOpacity
                  style={{
                    backgroundColor:
                      userData?.isVerifiedUser == false ?
                        'rgba(105, 61, 191, 1)' : COLORS.success,
                    borderRadius: 10,
                    padding: responsiveWidth(2),
                  }}
                  onPress={() => {
                    userData?.isVerifiedUser == 1 ? null :
                      refRBSheet.current.open();
                  }}
                >
                  <Text
                    style={{
                      color:
                        userData?.isVerifiedUser == false ?
                          COLORS.white : COLORS.black,

                      fontSize: responsiveFontSize(1.5),
                      fontFamily: fonts.PoppinsMedium,
                    }}>
                    {
                      userData?.isVerifiedUser == 1 ? 'Account Verified' : 'Verify Photos'
                    }
                  </Text>
                </TouchableOpacity> */}
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

                          {/* <TouchableOpacity
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
                          </TouchableOpacity> */}
                        </ImageBackground>
                      );
                    }
                    )
                  }
                  {/* <TouchableOpacity
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

                  </TouchableOpacity> */}
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
                  {/* <TouchableOpacity
                    style={{
                      padding: responsiveWidth(1.4),
                      borderRadius: 30,
                      borderWidth: 1,
                      width: responsiveWidth(80),
                      alignSelf: 'center',
                      borderColor: 'white',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => {
                      navigation.navigate('OnboardingVoiceNotesIOSUpdate', {
                        showBack: true,
                        bio_notes: userData?.bio_notes,
                        cloudinary_note: userData?.note,
                      });

                    }}
                  >
                    <Microphone color={COLORS.white} weight='light' size={20} />
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: Platform.OS === 'ios' ? responsiveFontSize(1.5) : responsiveFontSize(1.4),
                        fontFamily: fonts.PoppinsMedium,
                        textAlign: 'center',
                      }}
                    >
                      {userData?.note ? 'Record again' : 'Record Voice Note'}
                    </Text>
                  </TouchableOpacity> */}
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
                      // <TouchableOpacity


                      //   onPress={() => {
                      //     const spotifyUrl = item?.track?.external_urls?.spotify;
                      //     Linking.openURL(spotifyUrl).catch(err => console.error("Couldn't load page", err));
                      //   }}
                      //   style={{
                      //     flexDirection: 'row',
                      //     alignItems: 'center',
                      //     backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      //     borderRadius: 15,
                      //     padding: 10,
                      //     marginVertical: 5,
                      //     marginHorizontal: 10,
                      //     borderWidth: 1,
                      //     borderColor: 'rgba(221, 221, 225, 0.16)'

                      //   }}
                      // >

                      //   <View
                      //     style={{
                      //       width: 50,
                      //       height: 50,
                      //       borderRadius: 10,
                      //       overflow: 'hidden',
                      //       marginRight: 10,
                      //     }}
                      //   >
                      //     <Image
                      //       source={{ uri: item.track.album.images[0].url }}
                      //       style={{ width: '100%', height: '100%' }}
                      //     />
                      //   </View>

                      //   {/* Track Details */}
                      //   <View style={{ flex: 1 }}>
                      //     <Text
                      //       style={{
                      //         fontSize: 16,
                      //         fontWeight: 'bold',
                      //         color: 'white',
                      //       }}
                      //     >
                      //       {item.track.name} - {item.track.artists[0].name}
                      //     </Text>
                      //     <View
                      //       style={{
                      //         flexDirection: 'row',
                      //         marginTop: 5,
                      //         alignContent: 'center',
                      //         alignItems: 'center',
                      //       }}
                      //     >
                      //       <Image
                      //         source={Images.spotify_logo2}
                      //         style={{
                      //           width: 20, height: 20,
                      //           backgroundColor: 'white',
                      //           borderRadius: 50,
                      //         }}
                      //       />
                      //       <Text
                      //         style={{
                      //           fontSize: 12,
                      //           color: 'white',
                      //           marginLeft: 5,
                      //         }}
                      //       >
                      //         Spotify, Favorite Song
                      //       </Text>
                      //     </View>
                      //   </View>
                      // </TouchableOpacity>
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
                    {/* <TouchableOpacity
                      onPress={() => {
                        Linking.openURL(`https://www.instagram.com/${userData?.instagram_data?.profile?.username}`);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <Image
                        source={{ uri: userData?.instagram_data?.profile?.profile_picture_url }}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 10,
                          alignSelf: 'center',
                          marginVertical: 10,
                        }}
                      />
                      <View
                        style={{
                          marginLeft: 10,

                        }}
                      >
                        <Text
                          style={{
                            fontSize: responsiveFontSize(2.5),
                            color: COLORS.white,
                            fontFamily: fonts.PoppinsMedium,
                          }}
                        >
                          {userData?.instagram_data?.profile?.username}
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                          }}
                        >
                          <Image
                            source={Images.insta_logo}
                            style={{
                              width: 20, height: 20,
                              backgroundColor: 'white',
                              borderRadius: 50,
                            }}
                          />
                          <Text
                            style={{
                              color: COLORS.white,
                              fontFamily: fonts.PoppinsMedium,
                              marginLeft: 5,
                            }}
                          >

                            @{userData?.instagram_data?.profile?.username}
                          </Text>
                        </View>

                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          position: 'absolute',
                          right: 5,
                          width: responsiveWidth(15),

                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: COLORS.white,
                            fontFamily: fonts.PoppinsMedium,
                            fontSize: responsiveFontSize(2),
                            marginRight: 5,
                          }}
                        >
                          Vist
                        </Text>
                        <Icon
                          name="chevron-right"
                          size={20}
                          color={COLORS.white}

                        />
                      </View>

                    </TouchableOpacity> */}
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
});
export default HomePage;
