import React, { useEffect, useState, useRef } from 'react';
import { Player } from '@react-native-community/audio-toolkit';
import {
  View,
  Text,
  Alert,
  SafeAreaView,

  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import TopBar from '../../../../components/TopBar/TopBar';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import { useFocusEffect } from '@react-navigation/native';
import {
  registerByEmail,
  updateUserProfileData,
  addAnswertoQuestion,
  updateUserProfilePerference,
  addNote,
  addToken,
} from '../../../../Services/Auth/SignupService';
import AudioRecord from 'react-native-audio-record';
import fonts from '../../../../consts/fonts';
import { storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSelector, useDispatch } from 'react-redux';
import { setBio, resetForm } from '../../../../redux/features/form/formSlice';
import { setNewUserFlag } from '../../../../redux/features/tourGuide/tourGuideSlice';
import { AnimatedCircularProgress } from 'react-native-circular-progress';





const AudioToolkitExample = ({ route, navigation }) => {
  const { addUserToWaitingList } = route?.params || {};

  console.log('addUserToWaitingList:', addUserToWaitingList);

  const dispatch = useDispatch();
  const bio = useSelector((state) => state.form.bio);
  const formData1 = useSelector((state) => state.form);



  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [falshMessage, setFalshMessage] = useState(false);
  const [falshMessageData, setFalshMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
  });
  const [profileCreationComplete, setProfileCreationComplete] = useState(false);

  const incrementProgress = (step) => {
    setCount((prevCount) => Math.min(prevCount + step, 100)); // Increment progress by step size
  };

  // Disable hardware back button and swipe gestures during profile creation
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Allow back navigation only after profile creation is complete
        if (profileCreationComplete) {
          return false; // Allow default back action
        }

        // Prevent back navigation during profile creation
        console.log('Back button pressed during profile creation - preventing navigation');

        // Show a brief message to the user
        setFalshMessage(true);
        setFalshMessageData({
          message: 'Please wait',
          description: 'Profile creation is in progress. Please wait until completion.',
          type: 'info',
          icon: 'info-circle',
        });

        // Hide the message after 3 seconds
        setTimeout(() => {
          setFalshMessage(false);
        }, 3000);

        return true; // Return true to prevent default back action
      };

      // Add event listener for Android hardware back button
      if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
      }

      return () => {
        // Cleanup function to remove listener when component unmounts or loses focus
        if (Platform.OS === 'android') {
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
      };
    }, [profileCreationComplete])
  );

  const createAccount = async () => {
    setLoading(true);
    try {
      const totalSteps = 6; // Total number of API calls, including photo uploads and profile image
      const progressStep = 100 / totalSteps; // Step size for progress increment
      console.log('Starting account creation process.');

      // ** Step 1: Registering user by email
      console.log('Step 1: Registering user by email.');
      let dataRegister = {
        email: formData1.email,
        password: formData1.password,
        role: 'user',
        type: formData1.type,
        addUserToWaitingList: addUserToWaitingList, // Use the prop if available
      };
      const responseRegister = await registerByEmail(dataRegister);
      console.log('Response from registerByEmail:', responseRegister);
      incrementProgress(progressStep);

      // ** Step 2: Uploading profile image to Cloudinary
      console.log('Step 2: Uploading profile image to Cloudinary.');
      let profileImageUrl = null;
      if (formData1?.profilePic?.uri) {
        profileImageUrl = await uploadPhotoToCloudinary(formData1?.profilePic?.uri);
      }
      console.log('Uploaded profile image:', profileImageUrl);
      incrementProgress(progressStep);

      // ** Step 3: Uploading photos to Cloudinary
      console.log('Step 3: Uploading photos to Cloudinary.');
      let uploadedPhotos = [];
      for (const photo of formData1?.photos || []) {
        if (photo.image) {
          const uploadedUrl = await uploadPhotoToCloudinary(photo.image);
          if (uploadedUrl) {
            uploadedPhotos.push(uploadedUrl);
          }
        }
      }
      console.log('Uploaded photos:', uploadedPhotos);
      incrementProgress(progressStep);

      // ** Step 4: Updating user profile data
      console.log('Step 4: Updating user profile data.');
      let dataUserProfile = {
        name: formData1.fullName,
        age: formData1.age,
        gender: formData1.gender,
        images: uploadedPhotos,
        profile_image: profileImageUrl, // Use the Cloudinary URL for profile image
      };
      const responseUserProfile = await updateUserProfileData(dataUserProfile, responseRegister?.data?.id);
      console.log('Response from updateUserProfileData:', JSON.stringify(responseUserProfile, null, 2));
      incrementProgress(progressStep);

      // ** Step 5: Adding answers to questions
      console.log('Step 5: Adding answers to questions.');
      for (const [index, question] of formData1.questions.entries()) {
        const data = {
          user_id: responseRegister?.data?.id,
          question_id: question?.id,
          answer: question?.answer,
        };
        const response = await addAnswertoQuestion(data);
        console.log(`Answer submitted for question ID: ${question?.id}. Response:`, response);
      }
      incrementProgress(progressStep);

      // ** Step 6: Updating user profile preferences
      console.log('Step 6: Updating user profile preferences.');
      const dataUserProfilePerference = {
        user_id: responseRegister?.data?.id,
        prefered_min_age: formData1?.preferences?.preferredAgeRange?.min,
        prefered_max_age: formData1?.preferences?.preferredAgeRange?.max,
        prefered_gender: formData1?.preferences?.preferredGender,
      };
      const responseUserProfilePerference = await updateUserProfilePerference(dataUserProfilePerference);
      console.log('Response from updateUserProfilePerference:', JSON.stringify(responseUserProfilePerference, null, 2));
      incrementProgress(progressStep);

      // ** Step 7: Adding notes and bio
      console.log('Step 7: Adding notes and bio.');
      const dataNote = {
        user_id: responseRegister?.data?.id,
        note: formData1?.bio?.audio,
        bio_notes: formData1?.bio?.text,
      };
      const responseNote = await addNote(dataNote);
      console.log('Response from addNote:', JSON.stringify(responseNote, null, 2));
      incrementProgress(progressStep);

      // Final step: Navigate to the next screen if all steps succeed
      if (!responseNote.error) {
        console.log('All API calls completed successfully. Storing user details.');

        // Mark profile creation as complete
        setProfileCreationComplete(true);

        await storeUserDetail(responseNote?.user);

        // Add 30 tokens to the user account
        await addInitialTokens(responseNote?.user?.id);

        // Set the new user flag to true in Redux
        dispatch(setNewUserFlag(true));

        // Store a flag in AsyncStorage to remember that tooltips have been shown
        await AsyncStorage.setItem('hasSeenTourGuide', 'false');

        if (addUserToWaitingList === true) {
          // navigation.replace('WaitingListScreen'); // Navigate to WaitingList screen


          navigation.reset({
            index: 0,
            routes: [{
              name: 'NewWaitingListScreen1',
            }],
          });
        } else {
          // Navigate to "MyTabs" and specifically to the Home tab
          navigation.reset({
            index: 0,
            routes: [{
              name: 'MyTabs',
              params: { screen: 'Home' } // Explicitly navigate to Home tab
            }],
          });
        }


      } else {
        console.error('Error in addNote response:', responseNote.msg);
        alert(responseNote.msg);
      }
    } catch (error) {
      console.error('Error during account creation process:', error);
      // Re-enable navigation on error so user can go back
      setProfileCreationComplete(true);
    } finally {
      setLoading(false);
      dispatch(resetForm()); // Reset Redux state to the initial state

      console.log('Account creation process completed.');
    }
  };

  // Helper function to upload a photo to Cloudinary
  const uploadPhotoToCloudinary = async (photoUri) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'profilePicture.jpg',
      });
      formData.append('upload_preset', 'mwawkvfq');

      // Comment out Cloudinary upload code
      /*
      const response = await fetch('https://api.cloudinary.com/v1_1/dfhk5givd/image/upload', { // Updated URL
        method: 'POST',
        body: formData,
      });
      const cloudinaryData = await response.json();
      return cloudinaryData.secure_url;
      */

      // New upload implementation using custom backend API
      const response = await fetch('https://backend.fatedating.com/upload-file', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadResult = await response.json();

      if (!uploadResult.error) {
        console.log('Image uploaded successfully:', uploadResult.msg);
        return uploadResult.data.fullUrl; // Return the URL of the uploaded image
      } else {
        console.error('Upload error:', uploadResult);
        return ''; // Return empty string or handle error as needed
      }
    } catch (error) {
      console.error('Error uploading photo to Cloudinary:', error);
      return null; // Return null if an error occurs
    }
  };

  const addInitialTokens = async (userId) => {
    try {
      const response = await addToken({ user_id: userId, new_tokens: 30 });
      if (response?.success) {
        console.log('30 tokens added successfully.');
      } else {
        console.error('Failed to add tokens:', response?.message);
      }
    } catch (error) {
      console.error('Error adding tokens:', error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      createAccount();
    }, 1000);

  }, []);

  return (
    <GradientBackground>
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}
      <SafeAreaView style={{ padding: 20, flex: 1 }}>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            flex: 1,
          }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* <TopBar onPress={() => navigation.goBack()} /> */}

            </View>
            <View
              style={{
                marginTop: responsiveHeight(10),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: COLORS.white,
                  textAlign: 'center',
                  fontFamily: fonts.PoppinsRegular,
                  marginVertical: 15,
                  fontWeight: '500',
                  letterSpacing: .5,
                  width: responsiveWidth(60),
                  alignSelf: 'center',

                }}>
                Matching you with your Soulmate
              </Text>
              <AnimatedCircularProgress
                size={140}
                width={7}
                fill={count}
                tintColor={COLORS.secondary2}
                onAnimationComplete={() => console.log('onAnimationComplete')}
                backgroundColor={'rgba(255,255,255,0.5)'}
                rotation={180}
                style={{ marginVertical: responsiveHeight(4) }}
                children={() => (
                  <View
                    style={{
                      position: 'absolute',
                      top: responsiveHeight(2),
                      left: responsiveWidth(2),
                      right: responsiveWidth(2),
                      bottom: responsiveHeight(2),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        fontSize: responsiveFontSize(3.5),
                        color: COLORS.white,
                        fontFamily: fonts.PoppinsRegular,
                        fontWeight: '600',
                      }}>
                      {parseInt(count)}%
                    </Text>
                  </View>
                )}

              />


              <Text
                style={{
                  fontSize: responsiveFontSize(1.7),
                  fontWeight: '400',
                  color: COLORS.white,
                  fontFamily: fonts.PoppinsRegular,
                  marginTop: responsiveHeight(2),
                  alignSelf: 'center',
                  textAlign: 'center',
                  width: responsiveWidth(80),
                }}>
                Building a profile that showcases your personality and interests.
              </Text>
            </View>
            <View
              style={{
                alignContent: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                padding: responsiveHeight(1),
                position: 'absolute',
                bottom: responsiveHeight(2),
              }}
            >
              {/* <PrimaryButton loading={loading}
                title="Finish"
                // onPress={addData}
                onPress={() => {
                  // console.log('Bio:', JSON.stringify(formData1, null, 2));
                  createAccount();
                }}
                style={{
                  width: responsiveWidth(90),
                  backgroundColor: COLORS.white,
                }}
                textColor={COLORS.primary}
              /> */}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};


export default AudioToolkitExample;
