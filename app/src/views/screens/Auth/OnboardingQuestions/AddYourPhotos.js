import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Platform,
  PermissionsAndroid
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserDetail, storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import Header from '../../../../components/TopBar/Header';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import TopBar from '../../../../components/TopBar/TopBar';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import { DraggableGrid } from 'react-native-draggable-grid';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { node_base_url } from '../../../../consts/baseUrls';
import {
  PlusCircle, XCircle, Camera,
  Image as ImageIcon
} from 'phosphor-react-native';


function AddYourPhotos({ navigation }) {
  const tabs = ['PHOTOS', 'PROFILE PICTURE'];
  const [activeTab, SetActiveTab] = useState(tabs[0]);
  const [alert_one_image, setAlert_one_image] = useState(false);

  //  redux data




  const [profilePicture, setProfilePicture] = useState({
    uri: '',
  });
  const [newPhotos, setNewPhotos] = useState([]);
  const refBottomSheet = useRef(null);
  const refBottomSheet2 = useRef(null);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([
    { name: '1', key: 'one', image: '' },
    { name: '2', key: 'two', image: '' },
    { name: '3', key: 'three', image: '' },
    { name: '4', key: 'four', image: '' },
    { name: '5', key: 'five', image: '' },
    { name: '6', key: 'six', image: '' },
    { name: '7', key: 'seven', image: '' },
    { name: '8', key: 'eight', image: '' },
    { name: '9', key: 'night', image: '' },
  ]);

  const Total = 9;
  const openGallery = async () => {
    try {
      const firstEmptyIndex = photos.findIndex(p => p.image === '');
      if (firstEmptyIndex === -1) {
        console.log('No empty slots available');
        return;
      }

      launchImageLibrary(
        {
          mediaType: 'photo',
          includeBase64: false,
          maxHeight: 1200,
          maxWidth: 1200,
          selectionLimit: 1, // Assuming you want to pick one image at a time
        },
        response => {
          refBottomSheet.current.close();
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorCode) {
            console.log('ImagePicker Error: ', response.errorCode);
          } else if (response.errorMessage) {
            console.log('ImagePicker Error: ', response.errorMessage);
          } else {
            if (activeTab === tabs[1]) {
              setProfilePicture({
                uri: response.assets[0].uri,
              });
            } else {
              const newPhotos = [...photos];
              if (response.assets && response.assets.length > 0) {
                newPhotos[firstEmptyIndex].image = response.assets[0].uri; // Update the first empty slot with the new image
                setPhotos(newPhotos);
              }
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
      const firstEmptyIndex = photos.findIndex(p => p.image === '');
      if (firstEmptyIndex === -1) {
        console.log('No empty slots available');
        return;
      }

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
            if (activeTab === tabs[1]) {
              setProfilePicture({
                uri: response.assets[0].uri,
              });
            } else {
              const newPhotos = [...photos];
              if (response.assets && response.assets.length > 0) {
                newPhotos[firstEmptyIndex].image = response.assets[0].uri; // Update the first empty slot with the new image
                setPhotos(newPhotos);
              }
            }
          }
        },
      );
    } catch (err) {
      console.error(err);
    }
  };

  // uplload images one by one
  const uploadImage = async (item) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', {
      uri: item.image,
      type: 'image/jpeg',
      name: 'profilePicture.jpg',
    });

    // Comment out Cloudinary upload code
    /*
    formData.append('upload_preset', 'mwawkvfq');
    try {
      const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dfhk5givd/image/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const uploadResult = await uploadResponse.json();

      if (uploadResponse.ok) {
        return uploadResult.secure_url; // Return the URL of the uploaded image
      } else {
        console.error('Upload error:', uploadResult);
        return ''; // Return empty string or handle error as needed
      }
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
  };


  const uploadImg = async () => {
    const uploadPromises = photos.map(async item => {
      if (item.image === '') {
        return '';
      } else {
        return await uploadImage(item);
      }
    });
    const uploadedImages = await Promise.all(uploadPromises);
    return uploadedImages.filter(url => url !== ''); // Filter out any failed uploads or empty strings
  };

  const uploadProfileImage = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', {
      uri: profilePicture.uri,
      type: 'image/jpeg',
      name: 'profilePicture.jpg',
    });

    // Comment out Cloudinary upload code
    /*
    formData.append('upload_preset', 'mwawkvfq');
    try {
      // const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dl91sgjy1/image/upload', {
      const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dfhk5givd/image/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const uploadResult = await uploadResponse.json();
      return uploadResult.secure_url; // Return the URL of the uploaded image
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
        console.log('Profile image uploaded successfully:', uploadResult.msg);
        return uploadResult.data.fullUrl; // Return the URL of the uploaded image
      } else {
        console.error('Profile image upload error:', uploadResult);
        return ''; // Return empty string or handle error as needed
      }
    } catch (error) {
      console.error('Profile image upload error:', error);
      return ''; // Return empty string or handle error as needed
    }
  };

  const uploadData = async () => {
    try {
      setLoading(true);

      // Upload new images
      const newImageUrls = await uploadImg();
      console.log('Uploaded Images:', newImageUrls);
      setPhotos(prevPhotos => [...prevPhotos, ...newImageUrls.map(url => ({ image: url }))]);

      // Upload profile image
      const profileImageUrl = await uploadProfileImage();
      console.log('Uploaded Profile Image:', profileImageUrl);
      setProfilePicture({ uri: profileImageUrl });

      // Fetch the existing basic_info from AsyncStorage
      const data1 = await AsyncStorage.getItem('basic_info');
      let basic_info = JSON.parse(data1) || {};

      // Update basic_info with new images and profile picture
      basic_info.images = newImageUrls;
      basic_info.profile_picture = profileImageUrl;

      // Save the updated basic_info back to AsyncStorage
      await AsyncStorage.setItem('basic_info', JSON.stringify(basic_info));
      const user = await getUserDetail();

      // Update profile data on the server
      const InsertAPIURL = `${node_base_url}/user/v1/updateProfile/${user.data.id}`;
      const body = {
        name: basic_info?.full_name,
        age: basic_info?.age,
        gender: basic_info?.gender?.toUpperCase(),
        images: basic_info?.images,
        profile_image: basic_info?.profile_picture,
      };

      const response = await fetch(InsertAPIURL, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const jsonResponse = await response.json();
      console.log('Server Response:', jsonResponse);

      if (jsonResponse.error === false) {
        storeUserDetail(jsonResponse.user);
        await AsyncStorage.setItem('signup_user', JSON.stringify({ signup_user: true }));
        navigation.replace('ProfilePreference');
        // navigation.replace('MyTabs');
      } else {
        console.error('Error updating profile:', jsonResponse);
      }

      setLoading(false);
    } catch (error) {
      console.error('This is the error:', error);
      setLoading(false);
      // Handle the error appropriately
    }
  };

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app requires access to your camera.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("You can use the camera");
        } else {
          console.log("Camera permission denied");
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    requestCameraPermission();
  }, []);
  return (
    <GradientBackground>
      <TopBar />
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
            onPress={() => {
              refBottomSheet.current.close();
            }}
            style={{
              marginTop: responsiveHeight(1),
            }}

          >
            <XCircle color={COLORS.white} size={25} />
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
          <Camera color={COLORS.secondary2} size={25} />

          <Text
            style={{
              fontSize: responsiveFontSize(2),
              color: COLORS.white,
              marginLeft: responsiveWidth(5),
              fontFamily: fonts.PoppinsRegular,
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
          <ImageIcon color={COLORS.secondary2} size={25} />
          <Text
            style={{
              fontSize: responsiveFontSize(2),
              color: COLORS.white,
              marginLeft: responsiveWidth(5),
              fontFamily: fonts.PoppinsRegular,
            }}>
            Choose a photo
          </Text>
        </TouchableOpacity>
      </BottomSheet>
      <BottomSheet height={responsiveHeight(60)} ref={refBottomSheet2}>
        <Text
          style={{
            fontSize: responsiveFontSize(2.5),
            fontFamily: fonts.JostMedium,
            padding: responsiveHeight(1),
          }}>
          Choose Profile Picture
        </Text>
        <FlatList
          data={photos}
          numColumns={2}
          renderItem={({ item, index }) => {
            if (item.image !== '') {
              return (
                <TouchableOpacity
                  onPress={() => {
                    setProfilePicture({ uri: item.image });
                    refBottomSheet2.current.close();
                  }}
                  style={{
                    width: '45%',
                    height: responsiveHeight(13),
                    backgroundColor: COLORS.white,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: responsiveWidth(5),
                    // borderWidth: 1,
                    borderColor: COLORS.primary,
                    marginTop: responsiveHeight(1.5),
                    marginHorizontal: responsiveWidth(1),
                    overflow: 'hidden',
                  }}>
                  <Image
                    source={{ uri: item?.image }}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: responsiveWidth(5),
                      // backgroundColor: 'red',
                      justifyContent: 'center',
                      alignItems: 'center',
                      resizeMode: 'cover',
                      overflow: 'hidden',
                    }}
                  />
                </TouchableOpacity>
              );
            }
          }}
        />
        <PrimaryButton
          title={'Close'}
          onPress={() => {
            refBottomSheet2.current.close();
          }}
          style={{
            alignSelf: 'center',
            width: responsiveWidth(90),
            // marginTop: responsiveHeight(5),
            // borderWidth: 1,
            borderColor: COLORS.primary,
            position: 'absolute',
            bottom: responsiveHeight(5),
          }}
        />
      </BottomSheet>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
          // left: responsiveWidth(-5),
          backgroundColor: 'background: rgba(1, 0, 1, .6)',
          position: 'absolute',
          // bottom: responsiveHeight(-5),
          zIndex: 999,
          width: responsiveWidth(100),
          height: responsiveHeight(100),
          display: alert_one_image ? 'flex' : 'none',
        }}
      >
        <View
          style={{
            backgroundColor: 'background: rgba(1, 0, 1, 1)',
            width: responsiveWidth(80),
            left: -5,
            alignItems: 'center',
            padding: responsiveHeight(2),
            borderRadius: responsiveWidth(5),

          }}
        >
          <Image
            source={Images.alert_purple}
            style={{
              width: responsiveWidth(70),
              height: responsiveHeight(10),
              resizeMode: 'contain',
            }}
          />
          <Text

            style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(3),
              fontWeight: 'bold',
              marginVertical: responsiveHeight(1),
              fontFamily: fonts.PoppinsRegular,
            }}
          >
            Error!
          </Text>
          <Text

            style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2),
              textAlign: 'center',
              marginVertical: responsiveHeight(2),
              fontFamily: fonts.PoppinsRegular,
            }}
          >
            Upload atleast one image {'\n'}to continue
          </Text>
          <PrimaryButton
            title={'Ok'}
            onPress={() => {
              setAlert_one_image(false);
            }}
            style={{
              alignSelf: 'center',
              width: responsiveWidth(70),
              marginTop: responsiveHeight(1.5),
            }}
            backgroundColor={COLORS.white}
            textColor={COLORS.primary}
          />
        </View>
      </View>

      <SafeAreaView
        style={{
          flex: 1,
        }}>

        <TopBar
          onPress={() => {
            if (activeTab === tabs[1]) {
              SetActiveTab(tabs[0]);
            }
            else {
              navigation.goBack();
            }
          }}
        />
        <View style={{ flex: 1 }}>

          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <Header
              mainContainerStyle={{
                marginTop: responsiveHeight(0),
                width: responsiveWidth(90),
              }}
              title={activeTab === 'PHOTOS' ? 'Add your best Photos' : 'Profile Photo'}
              subtitle={
                activeTab === 'PHOTOS'
                  ? `Let everyone see that beautiful${'\n'} face of yours`
                  : 'Your profile photo helps others recognize you on our platform'
              }
            />
            {activeTab === 'PHOTOS' ? (
              <>
                {/* alert one image */}

                <DraggableGrid
                  numColumns={3}
                  onDragRelease={data => {
                    console.log('data', data);
                    setPhotos(data);
                  }}
                  renderItem={(item, index) => {
                    if (item?.image === '') {
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            // openGallery();
                            refBottomSheet.current.open();
                            // openCamera();
                          }}
                          style={{
                            width: responsiveWidth(28),
                            height: responsiveHeight(13),
                            backgroundColor: 'background: rgba(255, 255, 255, 0.08)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: responsiveWidth(5),
                            borderWidth: 1.5,
                            borderColor: 'border: 1.5px solid rgba(255, 255, 255, 0.88)',
                            borderStyle: 'dashed',
                            marginTop: responsiveHeight(2),
                          }}>
                          {/* <Icon name="plus-circle" size={responsiveFontSize(4)} color={COLORS.white} /> */}
                          <PlusCircle color={COLORS.white} size={40} />

                        </TouchableOpacity>
                      );
                    } else {
                      return (
                        <ImageBackground
                          style={{
                            width: responsiveWidth(28),
                            height: responsiveHeight(13),
                            borderRadius: 0,
                            // backgroundColor: 'red',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: responsiveHeight(2),
                          }}
                          imageStyle={{
                            borderRadius: responsiveWidth(2),
                          }}
                          source={{ uri: item?.image }}
                          key={item.key}>
                          <TouchableOpacity
                            onPress={() => {
                              setPhotos(
                                photos.map((item, i) => {
                                  if (index === i) {
                                    return { ...item, image: '' };
                                  }
                                  return item;
                                }),
                              );
                            }}
                            style={{
                              position: 'absolute',
                              top: -5,
                              right: -5,
                              paddingHorizontal: 7,
                              paddingVertical: 5,
                              backgroundColor: COLORS.red,
                              borderRadius: 15,

                            }}>
                            <Text>
                              <Icon name="times" size={responsiveFontSize(2)} color={COLORS.white} />
                            </Text>
                          </TouchableOpacity>
                        </ImageBackground>
                      );
                    }
                  }}
                  data={photos}
                />
                {/* <PrimaryButton
                  title={'Next'}
                  onPress={() => {
                    // check if photos .image has more than 1 image
                    const hasImages = photos.filter(p => p.image !== '');
                    if (hasImages.length < 1) {
                      setAlert_one_image(true);
                    } else {
                      SetActiveTab(tabs[1]);
                    }
                  }}
                  style={{
                    alignSelf: 'center',
                    width: responsiveWidth(90),
                    marginTop: Platform.OS === 'ios' ? responsiveHeight(5) : responsiveHeight(0),
                    marginBottom: Platform.OS === 'android' ? responsiveHeight(5) : responsiveHeight(0),

                  }}
                  backgroundColor={COLORS.white}
                  textColor={COLORS.primary}
                /> */}
              </>
            ) : (
              <View
                style={{
                  marginTop: responsiveHeight(5),
                  flex: 1,
                }}>
                <ImageBackground
                  source={profilePicture.uri != '' ? { uri: profilePicture.uri } : Images.profile_picture}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    width: responsiveWidth(28),
                    flexDirection: 'row',
                    height: responsiveHeight(13),
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: responsiveWidth(50),
                    borderWidth: profilePicture.uri != '' ? 0 : responsiveWidth(0.2),
                    borderColor: COLORS.white,
                    alignSelf: 'center',
                    borderStyle: 'dashed',

                  }}
                  imageStyle={{
                    borderRadius: responsiveWidth(50),
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}>
                  <Icon
                    style={{
                      display: profilePicture.uri != '' ? 'none' : 'flex',
                    }}
                    name="camera"
                    size={responsiveFontSize(4)}
                    color={COLORS.white}
                  />
                </ImageBackground>
                <TouchableOpacity
                  onPress={() => {
                    refBottomSheet2.current.open();
                  }}
                  style={{
                    borderColor: COLORS.primary,
                    alignSelf: 'center',
                    padding: responsiveHeight(2),
                  }}>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(2),
                      color: COLORS.white,
                      textAlign: 'center',
                      lineHeight: responsiveHeight(2),
                      padding: responsiveHeight(1),
                      fontFamily: fonts.PoppinsRegular,
                    }}>
                    Select from Previous Photos
                  </Text>
                </TouchableOpacity>
                {/* <View
                  style={{
                    position: 'absolute',
                    bottom: responsiveHeight(5),
                  }}
                >
                  <PrimaryButton
                    title={'Upload New Photo'}
                    onPress={() => {
                      // SetActiveTab(tabs[1]);
                      refBottomSheet.current.open();
                    }}
                    style={{
                      alignSelf: 'center',
                      width: responsiveWidth(90),
                      marginTop: responsiveHeight(5),
                      borderColor: COLORS.primary,
                      backgroundColor: COLORS.white,
                      display: profilePicture?.uri == '' ? 'flex' : 'none',
                    }}
                    backgroundColor={COLORS.white}
                    textColor={COLORS.primary}
                  />
                  <PrimaryButton
                    title={'Continue'}
                    loading={loading}
                    onPress={() => {
                      uploadData();
                      // navigation.navigate('LocationPermission');
                    }}
                    style={{
                      alignSelf: 'center',
                      width: responsiveWidth(90),
                      marginTop: responsiveHeight(2),
                      display: profilePicture.uri != '' ? 'flex' : 'none',
                      borderColor: COLORS.white,
                      backgroundColor: COLORS.white,
                      display: profilePicture.uri != '' ? 'flex' : 'none',
                    }}
                    textColor={COLORS.primary}
                  />
                </View> */}

              </View>
            )}
          </ScrollView>

          <PrimaryButton
            loading={loading}
            title={
              activeTab === tabs[0]
                ? 'Next'
                : profilePicture?.uri === ''
                  ? 'Upload New Photo'
                  : 'Continue'
            }
            onPress={() => {
              if (activeTab === tabs[0]) {
                const hasImages = photos.some(p => p.image !== ''); // Check for images
                hasImages ? SetActiveTab(tabs[1]) : setAlert_one_image(true);
              } else {
                profilePicture?.uri === ''
                  ? refBottomSheet.current.open()
                  : uploadData();
              }
            }}
            style={{
              alignSelf: 'center',
              width: responsiveWidth(90),
              marginVertical: Platform.OS === 'ios' ? responsiveHeight(2) : responsiveHeight(0),
            }}
            backgroundColor={COLORS.white}
            textColor={COLORS.primary}
          />

        </View>


      </SafeAreaView>
    </GradientBackground>
  );
}
var styles = StyleSheet.create({
  buttonText: {
    fontSize: 18,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
});
export default AddYourPhotos;
