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
  PermissionsAndroid,
  Alert,
  Linking,
  ActivityIndicator
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserDetail, storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import { useDispatch, useSelector } from 'react-redux';
// import { setPhotos, setProfilePicture } from '../../../../redux/actions/formAction';
// import { Camera, ImageIcon, PlusCircle, XCircle } from 'lucide-react-native';
// import { COLORS } from '../../../../consts/Colors';
// import { fonts } from '../../../../consts/Fonts';
// import PrimaryButton from '../../../components/Button';
// import GradientBackground from '../../../components/GradientBackground';
// import Header from '../../../components/Header';
// import TopBar from '../../../components/TopBar';
// import BottomSheet from '../../../components/BottomSheet';
// import DraggableGrid from 'react-native-draggable-grid';
// import { openSettings, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import Header from '../../../../components/TopBar/Header';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import TopBar from '../../../../components/TopBar/TopBar';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import { DraggableGrid } from 'react-native-draggable-grid';
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { node_base_url } from '../../../../consts/baseUrls';
import {
  PlusCircle, XCircle, Camera,
  Image as ImageIcon
} from 'phosphor-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setPhotos, setProfilePicture } from '../../../../redux/features/form/formSlice';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import CameraUtils from '../../../../utils/CameraUtils';


function AddYourPhotos({ navigation }) {
  const tabs = ['PHOTOS', 'PROFILE PICTURE'];
  const [activeTab, SetActiveTab] = useState(tabs[0]);
  const [alert_one_image, setAlert_one_image] = useState(false);

  //  redux data
  const photos = useSelector((state) => state.form.photos) || [];
  const profilePicture = useSelector((state) => state.form.profilePic) || { uri: '' };
  const dispatch = useDispatch();
  const [newPhotos, setNewPhotos] = useState([]);
  const refBottomSheet = useRef(null);
  const refBottomSheet2 = useRef(null);
  const [loading, setLoading] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);

  const Total = 9;
  const openGallery = async () => {
    try {
      console.log('Opening gallery function called');
      setGalleryLoading(true);

      if (Platform.OS === 'android') {
        const permission =
          Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const result = await PermissionsAndroid.request(permission);

        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Denied',
            'Gallery permission is required to select photos.',
          );
          setGalleryLoading(false);
          return;
        }
      } else {
        const permissionResult = await CameraUtils.requestGalleryPermission();
        if (!permissionResult.success) {
          setGalleryLoading(false);
          if (permissionResult.showSettings) {
            CameraUtils.showPermissionAlert(permissionResult.message, true);
          } else {
            Alert.alert('Permission Denied', permissionResult.message);
          }
          return;
        }
      }

      console.log('Gallery permission granted, launching gallery...');

      // Launch gallery with optimized options
      CameraUtils.launchGalleryWithOptions(result => {
        setGalleryLoading(false);

        if (result.cancelled) {
          console.log('Gallery cancelled by user');
          return;
        }

        if (!result.success) {
          console.error('Gallery error:', result.error);
          Alert.alert('Gallery Error', result.error);
          return;
        }

        console.log('Image selected successfully:', result.uri);
        setImageProcessing(true);

        // Update state based on active tab
        setTimeout(() => {
          try {
            if (activeTab === tabs[1]) {
              // If on "PROFILE PICTURE" tab, update profile picture
              dispatch(setProfilePicture({ uri: result.uri }));
            } else {
              // If on "PHOTOS" tab, add to photos array
              const emptyIndex = photos.findIndex(p => !p.image || p.image === '');
              if (emptyIndex !== -1) {
                const updatedPhotos = [...photos];
                updatedPhotos[emptyIndex] = { image: result.uri };
                dispatch(setPhotos(updatedPhotos));
              } else if (photos.length < Total) {
                dispatch(setPhotos([...photos, { image: result.uri }]));
              } else {
                Alert.alert(
                  'Maximum Photos',
                  'You can only upload a maximum of 9 photos.',
                );
              }
            }
          } catch (stateUpdateError) {
            console.error('Error updating state:', stateUpdateError);
            Alert.alert(
              'Error',
              'Failed to save the image. Please try again.',
            );
          } finally {
            setImageProcessing(false);
          }
        }, 100);
      });
    } catch (err) {
      console.error('Error in openGallery:', err);
      Alert.alert('Gallery Error', 'Failed to open gallery. Please try again.');
      setGalleryLoading(false);
      setImageProcessing(false);
    }
  };

  const openCamera = async () => {
    try {
      console.log('Opening camera function called');
      setCameraLoading(true);

      if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Denied',
            'Camera permission is required to take photos.',
          );
          setCameraLoading(false);
          return;
        }
      } else {
        const permissionResult = await CameraUtils.requestCameraPermission();
        if (!permissionResult.success) {
          setCameraLoading(false);
          if (permissionResult.showSettings) {
            CameraUtils.showPermissionAlert(permissionResult.message, true);
          } else {
            Alert.alert('Permission Denied', permissionResult.message);
          }
          return;
        }
      }

      console.log('Camera permission granted, launching camera...');

      // Launch camera with optimized options
      CameraUtils.launchCameraWithOptions(result => {
        setCameraLoading(false);

        if (result.cancelled) {
          console.log('Camera cancelled by user');
          return;
        }

        if (!result.success) {
          console.error('Camera error:', result.error);
          Alert.alert('Camera Error', result.error);
          return;
        }

        console.log('Image captured successfully:', result.uri);
        setImageProcessing(true);

        // Update state based on active tab with better error handling
        setTimeout(() => {
          try {
            if (activeTab === tabs[1]) {
              // If on "PROFILE PICTURE" tab, update profile picture
              dispatch(setProfilePicture({ uri: result.uri }));
            } else {
              // If on "PHOTOS" tab, add to photos array
              const emptyIndex = photos.findIndex(p => !p.image || p.image === '');
              if (emptyIndex !== -1) {
                const updatedPhotos = [...photos];
                updatedPhotos[emptyIndex] = { image: result.uri };
                dispatch(setPhotos(updatedPhotos));
              } else if (photos.length < Total) {
                dispatch(setPhotos([...photos, { image: result.uri }]));
              } else {
                Alert.alert(
                  'Maximum Photos',
                  'You can only upload a maximum of 9 photos.',
                );
              }
            }
          } catch (stateUpdateError) {
            console.error('Error updating state:', stateUpdateError);
            Alert.alert(
              'Error',
              'Failed to save the image. Please try again.',
            );
          } finally {
            setImageProcessing(false);
          }
        }, 100);
      });
    } catch (err) {
      console.error('Error in openCamera:', err);
      Alert.alert('Camera Error', 'Failed to open camera. Please try again.');
      setCameraLoading(false);
      setImageProcessing(false);
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
    // Get only non-empty photos for upload
    const nonEmptyPhotos = getNonEmptyPhotos();

    const uploadPromises = nonEmptyPhotos.map(async item => {
      if (!item || item.image === '') {
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
      dispatch(setPhotos([...photos, ...newImageUrls.map(url => ({ image: url }))]));

      // Upload profile image
      const profileImageUrl = await uploadProfileImage();
      console.log('Uploaded Profile Image:', profileImageUrl);
      dispatch(setProfilePicture({ uri: profileImageUrl }));

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
        const cameraGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app requires access to your camera to take photos.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );

        // For Android 13+ (API level 33), we also need media permissions
        if (Platform.Version >= 33) {
          await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.CAMERA
          ]);
        }

        if (cameraGranted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Camera permission granted");
          return true;
        } else {
          console.log("Camera permission denied");
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  const checkCameraPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        console.log('iOS Camera permission status:', result);
        return result === RESULTS.GRANTED;
      }

      if (Platform.OS === 'android') {
        // Check if permission is already granted
        const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);

        if (hasPermission) {
          return true;
        }

        // Request permission if not granted
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app requires access to your camera to take photos.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );

        console.log('Android Camera permission status:', result);
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (error) {
      console.error('Error checking camera permission:', error);
      return false;
    }
  };

  const checkGalleryPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        // On iOS 14+, we need to use new photo library permissions
        const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        console.log('iOS Photo Library permission status:', result);

        // On iOS, LIMITED access is also acceptable
        if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
          return true;
        }

        // If permission is denied, show a helpful message
        if (result === RESULTS.DENIED || result === RESULTS.BLOCKED) {
          console.log('Photo library permission denied on iOS');
          setTimeout(() => {
            Alert.alert(
              'Photo Access Required',
              'Please allow access to your photo library in your device settings to upload photos.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openURL('app-settings:') }
              ]
            );
          }, 500);
          return false;
        }

        return false;
      }

      if (Platform.OS === 'android') {
        // For Android 13+ (API level 33), use READ_MEDIA_IMAGES
        if (Platform.Version >= 33) {
          const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
          if (hasPermission) {
            return true;
          }

          const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
          return result === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // For older Android versions, use READ_EXTERNAL_STORAGE
          const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
          if (hasPermission) {
            return true;
          }

          const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
          return result === PermissionsAndroid.RESULTS.GRANTED;
        }
      }
      return true;
    } catch (error) {
      console.error('Error checking gallery permission:', error);
      return false;
    }
  };

  // Create a function to get non-empty photos
  const getNonEmptyPhotos = () => {
    return photos.filter(photo => photo && photo.image !== '');
  };

  const handleTakePhoto = async () => {
    try {
      console.log('Requesting camera permission...');

      // Close the bottom sheet first
      if (refBottomSheet.current) {
        refBottomSheet.current.close();
      }

      // Check camera permissions
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        console.log('iOS Camera permission status:', result);

        if (result !== RESULTS.GRANTED) {
          Alert.alert(
            'Camera Permission Required',
            'Please allow camera access in your device settings to take photos.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openURL('app-settings:') }
            ]
          );
          return;
        }
      } else {
        const granted = await checkCameraPermission();
        if (!granted) {
          console.log('Camera permission not granted, cannot open camera');
          Alert.alert(
            'Permission Required',
            'Camera access is required to take a photo. Please enable it in settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => openSettings() }
            ]
          );
          return;
        }
      }

      console.log('Camera permission granted, opening camera...');

      // Add a longer delay to ensure bottom sheet is fully closed and permissions are processed
      setTimeout(() => {
        openCamera();
      }, 500);

    } catch (error) {
      console.error('Error in handleTakePhoto:', error);
      Alert.alert('Error', 'Failed to access camera. Please try again.');
    }
  };

  const handleChoosePhoto = async () => {
    try {
      console.log('Handling photo selection...');

      // Close the bottom sheet first
      if (refBottomSheet.current) {
        refBottomSheet.current.close();
      }

      // Check permissions on iOS
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        console.log('iOS Photo Library permission status:', result);

        if (result !== RESULTS.GRANTED && result !== RESULTS.LIMITED) {
          Alert.alert(
            'Permission Required',
            'Photo library access is required to choose photos. Please enable it in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openURL('app-settings:') }
            ]
          );
          return;
        }
      }

      // For Android, check permissions if needed (for older versions)
      if (Platform.OS === 'android' && Platform.Version < 33) {
        const granted = await checkGalleryPermission();
        if (!granted) {
          console.log('Gallery permission not granted');
          Alert.alert(
            'Permission Required',
            'Photo library access is required to choose a photo. Please enable it in settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => openSettings() }
            ]
          );
          return;
        }
      }

      console.log('Opening gallery...');

      // Add a longer delay to ensure bottom sheet is fully closed and permissions are processed
      setTimeout(() => {
        openGallery();
      }, 500);

    } catch (error) {
      console.error('Error in handleChoosePhoto:', error);
      Alert.alert('Error', 'Failed to access photo library. Please try again.');
    }
  };

  useEffect(() => {
    requestCameraPermission();

    // Cleanup function to reset loading states
    return () => {
      setGalleryLoading(false);
      setCameraLoading(false);
      setImageProcessing(false);
    };
  }, []);

  // Optimize photos array to move empty slots to the end
  useEffect(() => {
    if (Array.isArray(photos) && photos.length > 0) {
      // Check if we have both empty and non-empty photos
      const nonEmptyPhotos = photos.filter(photo => photo && photo.image !== '');
      const emptyPhotos = photos.filter(photo => !photo || photo.image === '');

      // If we have the correct number of items but in the wrong order,
      // reorganize to have all non-empty photos first, followed by empty ones
      if (nonEmptyPhotos.length > 0 && emptyPhotos.length > 0) {
        const reorganizedPhotos = [...nonEmptyPhotos, ...emptyPhotos];
        // Only update if the order has changed
        if (JSON.stringify(reorganizedPhotos) !== JSON.stringify(photos)) {
          console.log('Photos array reorganized to optimize empty slots');
          dispatch(setPhotos(reorganizedPhotos));
        }
      }
    }
  }, [photos]);
  return (
    <GradientBackground>
      <TopBar />
      <BottomSheet height={responsiveHeight(40)} ref={refBottomSheet}>
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
            // First close the bottom sheet
            refBottomSheet.current.close();

            // Then call handleTakePhoto after a delay
            setTimeout(() => {
              handleTakePhoto();
            }, 300);
          }}
          style={{
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.24)',
            flexDirection: 'row',
            padding: responsiveHeight(2),
            alignContent: 'center',
            alignItems: 'center',
            opacity: cameraLoading ? 0.6 : 1,
          }}
          disabled={cameraLoading}>
          {cameraLoading ? (
            <ActivityIndicator size="small" color={COLORS.secondary2} />
          ) : (
            <Camera color={COLORS.secondary2} size={25} />
          )}

          <Text
            style={{
              fontSize: responsiveFontSize(2),
              color: COLORS.white,
              marginLeft: responsiveWidth(5),
              fontFamily: fonts.PoppinsRegular,
            }}>
            {cameraLoading ? 'Opening Camera...' : 'Take a Photo'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            padding: responsiveHeight(2),
            alignContent: 'center',
            alignItems: 'center',
            opacity: galleryLoading ? 0.6 : 1,
          }}
          onPress={() => {
            // First close the bottom sheet
            refBottomSheet.current.close();

            // Then call handleChoosePhoto after a delay
            setTimeout(() => {
              handleChoosePhoto();
            }, 300);
          }}
          disabled={galleryLoading}>
          {galleryLoading ? (
            <ActivityIndicator size="small" color={COLORS.secondary2} />
          ) : (
            <ImageIcon color={COLORS.secondary2} size={25} />
          )}
          <Text
            style={{
              fontSize: responsiveFontSize(2),
              color: COLORS.white,
              marginLeft: responsiveWidth(5),
              fontFamily: fonts.PoppinsRegular,
            }}>
            {galleryLoading ? 'Opening Gallery...' : 'Choose a photo'}
          </Text>
        </TouchableOpacity>
      </BottomSheet>
      <BottomSheet height={responsiveHeight(70)} ref={refBottomSheet2}>
        <Text
          style={{
            fontSize: responsiveFontSize(2.5),
            fontFamily: fonts.JostMedium,
            padding: responsiveHeight(1),
          }}>
          Choose Profile Picture
        </Text>
        <FlatList
          data={getNonEmptyPhotos()}
          numColumns={2}
          ListEmptyComponent={() => (
            <View style={{
              width: responsiveWidth(90),
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              marginVertical: responsiveHeight(10),
            }}>
              <Text style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2),
                textAlign: 'center',
                fontFamily: fonts.PoppinsRegular,
              }}>
                No photos available. Please upload photos first.
              </Text>
            </View>
          )}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  dispatch(setProfilePicture({ uri: item.image })); // Update Redux state
                  refBottomSheet2.current.close();
                }}
                style={{
                  width: '45%',
                  height: responsiveHeight(13),
                  backgroundColor: COLORS.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: responsiveWidth(5),
                  borderWidth: 2,
                  borderColor: COLORS.white,
                  marginTop: responsiveHeight(1.5),
                  marginHorizontal: responsiveWidth(1),
                  overflow: 'hidden',
                }}>
                <Image
                  source={{ uri: item?.image }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: responsiveWidth(4),
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            );
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
              title={activeTab === 'PHOTOS' ? 'Add your best Photo' : 'Profile Photo'}
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
                    try {
                      console.log('data', data);
                      if (Array.isArray(data)) {
                        dispatch(setPhotos(data));
                      } else {
                        console.error('Invalid drag data:', data);
                      }
                    } catch (error) {
                      console.error('Error in onDragRelease:', error);
                    }
                  }}
                  renderItem={(item, index) => {
                    if (item?.image === '') {
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            // Ensure we have a clean state before trying to open the bottom sheet
                            setTimeout(() => {
                              refBottomSheet.current.open();
                            }, 100);
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
                        <View
                          style={{
                            width: responsiveWidth(28),
                            height: responsiveHeight(13),
                            backgroundColor: COLORS.white,
                            borderRadius: responsiveWidth(2),
                            borderWidth: 2,
                            borderColor: COLORS.white,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: responsiveHeight(2),
                            overflow: 'hidden',
                          }}
                        >
                          <Image
                            source={{ uri: item?.image }}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: responsiveWidth(1),
                            }}
                            resizeMode="contain"
                          />
                          <TouchableOpacity
                            onPress={() => {
                              try {
                                // Add safety check for photos array
                                if (Array.isArray(photos) && index >= 0 && index < photos.length) {
                                  // Instead of just setting the image to empty string, 
                                  // we'll move the empty space to the end so there are no "holes" in the array
                                  const deletingItem = photos[index];
                                  const remainingItems = photos.filter((_, i) => i !== index);

                                  // Add the empty space at the end
                                  const updatedPhotos = [...remainingItems, { ...deletingItem, image: '' }];

                                  dispatch(setPhotos(updatedPhotos));
                                  console.log(`Deleted image at index ${index}`);
                                } else {
                                  console.error('Invalid photos array or index:', { photos, index });
                                }
                              } catch (error) {
                                console.error('Error deleting image:', error);
                              }
                            }}
                            style={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              paddingHorizontal: 7,
                              paddingVertical: 5,
                              backgroundColor: COLORS.red,
                              borderRadius: 15,

                            }}>
                            <Text>
                              <Icon name="times" size={responsiveFontSize(2)} color={COLORS.white} />
                            </Text>
                          </TouchableOpacity>
                        </View>
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
                <View
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    width: responsiveWidth(40),
                    height: responsiveHeight(20),
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: responsiveWidth(5),
                    borderWidth: profilePicture?.uri && profilePicture.uri !== '' ? 2 : responsiveWidth(0.2),
                    borderColor: COLORS.white,
                    alignSelf: 'center',
                    borderStyle: profilePicture?.uri && profilePicture.uri !== '' ? 'solid' : 'dashed',
                    overflow: 'hidden',
                  }}
                >
                  {profilePicture?.uri && profilePicture.uri !== '' ? (
                    <Image
                      source={{ uri: profilePicture.uri }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: responsiveWidth(3),
                        backgroundColor: 'white'
                      }}
                      resizeMode="contain"
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        refBottomSheet.current.open();
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Icon
                        name="camera"
                        size={responsiveFontSize(4)}
                        color={COLORS.white}
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      dispatch(setProfilePicture({ uri: '' }));
                    }}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      backgroundColor: COLORS.red,
                      paddingVertical: responsiveHeight(.7),
                      paddingHorizontal: responsiveHeight(1),
                      borderRadius: responsiveWidth(5),
                      display: profilePicture?.uri && profilePicture.uri !== '' ? 'flex' : 'none',
                    }}
                  >
                    <Icon
                      style={{

                      }}
                      name="times"
                      size={responsiveFontSize(2)}
                      color={COLORS.white}
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    // Check if there are any non-empty photos before opening the bottom sheet
                    const nonEmptyPhotos = getNonEmptyPhotos();
                    if (nonEmptyPhotos.length > 0) {
                      refBottomSheet2.current.open();
                    } else {
                      // Alert the user that they need to add photos first
                      Alert.alert(
                        "No Photos Available",
                        "Please add some photos first before selecting a profile picture.",
                        [{ text: "OK" }]
                      );
                    }
                  }}
                  style={{
                    borderColor: COLORS.primary,
                    alignSelf: 'center',
                    padding: responsiveHeight(2),
                    opacity: getNonEmptyPhotos().length > 0 ? 1 : 0.6,
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
            loading={loading || imageProcessing}
            title={
              activeTab === tabs[0]
                ? 'Next'
                : profilePicture?.uri === ''
                  ? 'Upload New Photo'
                  : 'Continue'
            }
            onPress={() => {
              if (imageProcessing || galleryLoading || cameraLoading) {
                return; // Prevent action while processing
              }

              if (activeTab === tabs[0]) {
                // Add safety check for photos array and verify we have at least one photo
                const nonEmptyPhotos = getNonEmptyPhotos();
                if (nonEmptyPhotos.length > 0) {
                  SetActiveTab(tabs[1]);
                } else {
                  setAlert_one_image(true);
                }
              } else {
                if (profilePicture?.uri === '') {
                  refBottomSheet.current.open();
                } else {
                  navigation.navigate('ProfilePreference');
                }
              }
            }}
            style={{
              alignSelf: 'center',
              width: responsiveWidth(90),
              marginVertical: Platform.OS === 'ios' ? responsiveHeight(2) : responsiveHeight(2),
              opacity: (imageProcessing || galleryLoading || cameraLoading) ? 0.7 : 1,
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
