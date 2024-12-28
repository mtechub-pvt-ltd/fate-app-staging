import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Animated,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserDetail, storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import OcticonsIcon from 'react-native-vector-icons/Octicons';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import Header from '../../../../components/TopBar/Header';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import LinearGradient from 'react-native-linear-gradient';
import AppTextLogo from '../../../../components/AppLogo/AppTextLogo';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import { updateUserProfileData, verifyPhotos } from '../../../../Services/Auth/SignupService';
import RBSheet from 'react-native-raw-bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import { SliderBox } from "react-native-image-slider-box";
import { ScrollView } from 'react-native-gesture-handler';
import { height } from '../../../../consts/Dimension';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useIsFocused } from '@react-navigation/native';
import Sound from 'react-native-sound';
import {
  CloudArrowUp,
  Microphone
} from 'phosphor-react-native';
let soundInstance = null;
function HomePage({ route, navigation }) {
  const isFocused = useIsFocused();
  const refBottomSheet = useRef(null);
  const refBottomSheet1 = useRef(null);
  const refRBSheet = useRef(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const animatedWidth = useRef(new Animated.Value(0)).current; // Progress bar animation value
  const intervalRef = useRef(null); // Interval reference
  const [soundPlayer, setSoundPlayer] = useState(null);

  const [profilePicture, setProfilePicture] = useState({ uri: '' });
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
          refBottomSheet.current.close();
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
  const openCamera = async () => {
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
          refBottomSheet.current.close();
          console.log('Response = ', response);
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorCode) {
            // throw console.log('ImagePicker Error: ', response.errorCode);
          } else if (response.errorMessage) {
            console.log('ImagePicker Error: ', response.errorMessage);
          } else {
            // setProfilePicture({
            //   uri: response.assets[0].uri,
            // });
            setLoading(true);
            Promise.all([uploadProfileImage(response.assets[0].uri)],
              setUserData({ ...userData, profile_image: response.assets[0].uri })
            ).then((x) => {
              updateUserProfile(x[0], 'PROFILE');
              setLoading(false);
            }).catch((err) => { });

          }
        },
      );
    } catch (err) {
      console.error(err);
    }
  };

  const uploadProfileImage = async (img) => {

    const formData = new FormData();
    formData.append('file', {
      uri: img,
      type: 'image/jpeg',
      name: 'profilePicture.jpg',
    });
    formData.append('upload_preset', 'uheajywb');

    try {
      const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dl91sgjy1/image/upload', {
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
  };
  const uploadImage = async (img) => {

    const formData = new FormData();
    formData.append('file', {
      uri: img,
      type: 'image/jpeg',
      name: 'profilePicture.jpg',
    });
    formData.append('upload_preset', 'uheajywb');

    try {
      const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dl91sgjy1/image/upload', {
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
  };

  const updateUserProfile = async (img, imgType) => {
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



  // const playAudioFromURL = (audioURL) => {
  //   console.log('audioURL', audioURL);

  //   const soundInstance = new Sound(audioURL, '', (error) => {
  //     if (error) {
  //       console.log('Failed to load the sound', error);
  //       return;
  //     }
  //     console.log('Sound loaded successfully');

  //     // Play the sound and automatically handle stop when done
  //     soundInstance.play((success) => {
  //       if (success) {
  //         console.log('Sound finished playing successfully');
  //       } else {
  //         console.log('Sound playback failed');
  //       }
  //       setIsPlaying(false); // Automatically set isPlaying to false when finished
  //       soundInstance.release(); // Release the sound player to free up resources
  //     });

  //     setIsPlaying(true); // Set playing status
  //     setSoundPlayer(soundInstance); // Store the sound instance for future use
  //   });
  // };

  const playAudioFromURL = (audioURL) => {
    console.log('Audio URL:', audioURL);

    const soundInstance = new Sound(audioURL, '', (error) => {
      if (error) {
        console.log('Failed to load the sound:', error);
        return;
      }

      console.log('Sound loaded successfully');
      const totalDuration = soundInstance.getDuration(); // Get total duration
      console.log('Total duration:', totalDuration);
      setDuration(totalDuration);
      setSoundPlayer(soundInstance);

      // Reset progress bar
      animatedWidth.setValue(0);

      // Start playing audio
      soundInstance.play((success) => {
        if (success) {
          console.log('Playback finished successfully');
        } else {
          console.log('Playback failed');
        }
        setIsPlaying(false);
        clearInterval(intervalRef.current); // Clear interval on completion
        animatedWidth.setValue(0); // Reset progress bar
      });

      setIsPlaying(true); // Set playback state

      // Start interval to update the progress bar
      intervalRef.current = setInterval(() => {
        soundInstance.getCurrentTime((currentTime) => {
          console.log('Current time:', currentTime);
          if (currentTime !== undefined && totalDuration > 0) {
            const progress = (currentTime / totalDuration) * 100; // Calculate progress percentage
            animatedWidth.setValue(progress); // Update the progress bar
          }
        });
      }, 100); // Update every 100ms for smoother progress
    });
  };





  // const stopAudio = () => {
  //   if (isPlaying) {
  //     soundPlayer.stop(() => {
  //       soundPlayer.release();
  //       console.log('Sound stopped');
  //     });
  //     setIsPlaying(false);
  //   }
  // };


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

  useEffect(() => {
    getuserData();
  }, [isFocused]);

  return (
    <GradientBackground>
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
          <TouchableOpacity
            style={{
              padding: responsiveHeight(1),
            }}
            onPress={() => {
              refBottomSheet.current.close();
            }}
          >
            <Icon name="times" size={responsiveFontSize(3)} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => {
            openCamera();
            // refBottomSheet.current.close();
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

          <TouchableOpacity
            style={{
              padding: responsiveHeight(1),
            }}
            onPress={() => {
              refBottomSheet1.current.close();
            }}
          >
            <Icon name="times" size={responsiveFontSize(3)} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => {
            openCamera();
            // refBottomSheet.current.close();
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
        </TouchableOpacity>
      </BottomSheet>
      <BottomSheet ref={refRBSheet}>
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
                // marginTop: responsiveHeight(5),
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
                // marginTop: responsiveHeight(5),
                alignSelf: 'center',
                width: responsiveWidth(30),
                padding: 0,
              }}
              loading={loading}
            />
          </View>
        </View>
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
            <ScrollView>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  width: responsiveWidth(90),
                  marginTop: Platform.OS === 'ios' ? responsiveHeight(0) : responsiveHeight(2),
                  alignItems: 'center',
                  paddingHorizontal: responsiveWidth(2),
                  paddingVertical: responsiveHeight(2),
                }}>
                <TouchableOpacity
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
                </TouchableOpacity>
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(2.5),
                    fontFamily: fonts.PoppinsMedium,
                  }}>
                  {'  '}Edit Profile
                </Text>


              </View>
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
                <TouchableOpacity
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
                  backgroundColor: '#FFFFFF14',
                  padding: responsiveWidth(2),
                  borderRadius: 10,
                }}
              >
                <CustomInput
                  mainContainerStyle={{
                    // marginTop: responsiveHeight(2),
                  }}
                  title="Full Name"
                  autoCapitalize="none"
                  secureTextEntry={false}
                  onChangeText={text => {
                    setUserData({ ...userData, name: text });
                  }}
                  value={userData?.name}
                  leftIcon={true}
                  // leftIconName={'eye-slash'}
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
                  onChangeText={text => {
                    setUserData({ ...userData, age: text });
                  }}

                  value={userData?.age?.toString()}

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
                {/* <CustomInput
              mainContainerStyle={{
                marginTop: responsiveHeight(2),

              }}
              title="Bio"
              autoCapitalize="none"
              secureTextEntry={false}
              onChangeText={text => {
                setUserData({ ...userData, note: text });
              }}
              multiline={true}
              numberOfLines={4}
              value={userData?.note}
              leftIcon={true}
              // leftIconName={'eye-slash'}
              leftIconPress={() => {
                console.log('eye-slash');
              }}
            /> */}

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
                    }
                    )
                  }
                  <TouchableOpacity
                    onPress={() => {
                      openGallery('FOR_IMAGES');
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
                  marginBottom: responsiveHeight(12),
                  width: responsiveWidth(90),
                  alignSelf: 'center',
                }}
              >

                {/* <View
                  style={{
                    // flexDirection: 'row',
                    // justifyContent: 'space-between',
                    flexDirection: 'column-reverse',
                    alignItems: 'center',
                    marginVertical: responsiveHeight(2),
                  }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: COLORS.white,
                      borderRadius: 50,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      // marginLeft: responsiveWidth(11),
                    }}
                    onPress={() => {
                      isPlaying ? stopAudio() :
                        playAudioFromURL(userData?.note);
                    }}
                  >
                    <Icon
                      name={isPlaying ? 'pause' : 'play'}
                      size={responsiveFontSize(3)}
                      color={'rgba(105, 61, 191, 1)'}
                      style={{
                        padding: responsiveWidth(3),
                        paddingHorizontal: responsiveWidth(3.5),
                        alignSelf: 'center',
                      }}
                    />
                  </TouchableOpacity>

                  <Image
                    source={Images.voice_animation}
                    style={{
                      width: responsiveWidth(75),
                      height: responsiveHeight(5),
                      resizeMode: 'contain',
                      alignSelf: 'center',
                      display: isPlaying ? 'flex' : 'none'
                    }}
                  />

                </View> */}
                <View style={styles.voiceNoteContainer}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => {
                      isPlaying ? stopAudio() : playAudioFromURL(userData?.note);
                    }}
                  >
                    <Icon
                      name={isPlaying ? 'pause' : 'play'}
                      size={responsiveFontSize(2)}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>

                  {/* Progress Bar */}
                  <View
                    style={{
                      width: '80%', // Adjust the width as needed
                      alignSelf: 'center',
                      marginVertical: responsiveHeight(1),
                    }}
                  >
                    {/* Background Bar */}
                    <View
                      style={{
                        width: '100%',
                        height: responsiveHeight(1),
                        backgroundColor: '#ccc', // Grey background
                        borderRadius: 5,
                        overflow: 'hidden', // Ensure the progress bar stays inside
                      }}
                    >
                      {/* Animated Progress Bar */}
                      <Animated.View
                        style={{
                          width: animatedWidth.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'], // Expand from left to right
                          }),
                          height: '100%',
                          backgroundColor: COLORS.primary, // Primary progress bar color
                        }}
                      />
                    </View>
                  </View>




                </View>

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
                    style={{
                      padding: responsiveWidth(1.4),
                      borderRadius: 30,
                      borderWidth: 1,
                      width: responsiveWidth(80),
                      alignSelf: 'center',
                      borderColor: 'white',
                      // marginTop: responsiveHeight(1),
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => {
                      Platform.OS === 'ios' ?
                        navigation.navigate('OnboardingVoiceNotesIOS', {
                          showBack: true
                        }) :
                        navigation.navigate('OnboardingVoiceNotes', {
                          showBack: true
                        });
                    }}
                  >
                    <Microphone color={COLORS.white}
                      weight='light' size={20} />
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: Platform.OS === 'ios' ? responsiveFontSize(1.5) : responsiveFontSize(1.4),
                        fontFamily: fonts.PoppinsMedium,
                        textAlign: 'center',
                      }}
                    >
                      Record again
                    </Text>
                  </TouchableOpacity>
                </View>


              </View>


            </ScrollView>

            <View
              style={{
                paddingTop: responsiveHeight(2),
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
    backgroundColor: isPlaying ? COLORS.primary : COLORS.gray, // Pink when playing, gray otherwise
    borderRadius: 5,
    flex: 1,
  }),
});
export default HomePage;
