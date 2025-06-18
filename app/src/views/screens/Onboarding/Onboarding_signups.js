import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  Linking,
  Dimensions,
  AppState,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';


import COLORS from '../../../consts/colors';
import Images from '../../../consts/Images';
import fonts from '../../../consts/fonts';

import SecondaryButton from '../../../components/Button/SecondaryButton';
import FlashMessages from '../../../components/FlashMessages/FlashMessages';
import {
  storeUserDetail
} from '../../../HelperFunctions/AsyncStorage/userDetail';
import {
  registerByEmail,
  checkUserExists
} from '../../../Services/Auth/SignupService';
import {
  setEmailAndPassword, setStep, setAccountType
} from '../../../redux/features/form/formSlice';
import { FlipInXDown } from 'react-native-reanimated';
import {
  responsiveHeight,
  responsiveFontSize,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
// import Video from 'react-native-video';
import { privacy_link } from '../../../consts/baseUrls';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';

const isAppleAuthSupported = appleAuth.isSupported;

function Onboarding_signups({ navigation }) {
  const { type: reduxType } = useSelector((state) => state.form);
  const dispatch = useDispatch();
  const videoRef = useRef(null);

  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [flashMessage, setFlashMessage] = useState(false);
  const [flashMessageData, setFlashMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
  });

  // Clear AsyncStorage but preserve appleSignInData when the component mounts
  useEffect(() => {
    const clearStorageExceptAppleData = async () => {
      try {
        // First check if we came from logout action
        const isFromLogout = await AsyncStorage.getItem('isFromLogout');
        if (isFromLogout === 'true') {
          console.log('Clearing storage after logout but preserving appleSignInData');

          // Save the Apple Sign-In data before clearing storage
          const appleSignInData = await AsyncStorage.getItem('appleSignInData');

          // Clear all AsyncStorage
          await AsyncStorage.clear();

          // If Apple Sign-In data exists, restore it
          if (appleSignInData) {
            await AsyncStorage.setItem('appleSignInData', appleSignInData);
            console.log('Apple Sign-In data preserved');
          }

          // Remove the flag to prevent clearing storage on future visits
          await AsyncStorage.setItem('isFromLogout', 'false');

          // Show success message
          showFlashMessage('Success', 'Logged out successfully', 'success', COLORS.success);
        } else {
          // Set the flag for first time (not from logout)
          await AsyncStorage.setItem('isFromLogout', 'false');
        }
      } catch (error) {
        console.error('Error during logout storage handling:', error);
      }
    };

    clearStorageExceptAppleData();
  }, []);


  GoogleSignin.configure({
    scopes: ['email', 'profile', 'openid'],
  });



  const googleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();

      const userInfo = await GoogleSignin.signIn();
      const data = { email: userInfo?.user.email };
      const response = await checkUserExists(data);

      console.log('Google Sign-In Response:', response);

      if (!response?.exists) {
        await Promise.all([
          dispatch(setEmailAndPassword({ email: userInfo?.user.email, password: 'Mtechub@123' })),
          dispatch(setStep(2)),
          dispatch(setAccountType('GOOGLE')),
        ]);
        navigation.navigate('BasicProfileInfo', { name: userInfo?.user.name });
      } else {
        showFlashMessage('Error', 'User already exists', 'info', COLORS.red);
        Alert.alert(
          'Account Exists',
          'An account with this email already exists. Please sign in instead.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        showFlashMessage('Cancelled', 'Google Sign-In was cancelled', 'info', COLORS.warning);
      } else {
        console.error('Google Sign-In Error:', error);
        showFlashMessage('Error', 'Google Sign-In failed', 'info', COLORS.red);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const onAppleButtonPress = async () => {
    setAppleLoading(true);
    console.log('Starting Apple Sign-In flow...');


    try {
      // Always call the Apple authentication modal to get fresh authentication
      console.log('Requesting Apple authentication...');
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      }); console.log('Apple Sign-In Response:', {
        user: appleAuthRequestResponse.user,
        email: appleAuthRequestResponse.email || 'Not provided (expected for subsequent logins)',
        fullName: appleAuthRequestResponse.fullName || 'Not provided (expected for subsequent logins)'
      });

      const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
      console.log('Apple Sign-In credential state:', credentialState);

      if (credentialState === appleAuth.State.AUTHORIZED) {
        console.log('Apple Sign-In successful, user authorized');

        // Extract data from current response
        const userIdentifier = appleAuthRequestResponse.user;
        console.log('Apple user identifier:', userIdentifier);

        // Apple only provides email and fullName on first login
        let email = appleAuthRequestResponse.email;
        let fullNameObj = appleAuthRequestResponse.fullName;

        // Get the stored Apple data if it exists
        const storedAppleData = await AsyncStorage.getItem('appleSignInData');
        console.log('Stored Apple data found:', storedAppleData ? 'Yes' : 'No');
        let storedData = storedAppleData ? JSON.parse(storedAppleData) : null;

        // Create the user data object to use for authentication and storage
        let appleUserData;

        // CASE 1: Apple returns email and full name (first login)
        if (email && (fullNameObj?.givenName || fullNameObj?.familyName)) {
          console.log('CASE 1: Apple provided full data - first login');
          const name = `${fullNameObj.givenName || ''} ${fullNameObj.familyName || ''}`.trim();

          // Create and save user data for future logins
          appleUserData = {
            name: name,
            email: email,
            user: userIdentifier,
            fullName: fullNameObj,
            lastUpdated: new Date().toISOString()
          };

          // Save the complete data to AsyncStorage for future logins
          console.log('Saving Apple user data to AsyncStorage for future use');
          await AsyncStorage.setItem('appleSignInData', JSON.stringify(appleUserData));
        }
        // CASE 2: Apple doesn't return email/name (subsequent logins)
        else {
          console.log('CASE 2: Apple subsequent login - retrieving stored data');

          // Check if we have stored Apple data from previous login
          if (storedData && storedData.user === userIdentifier) {
            console.log('Found stored Apple data, using saved information');
            appleUserData = storedData;
            email = storedData.email;
          } else {
            // No stored data found - this is an edge case
            // Try to decode email from identityToken as fallback
            if (!email) {
              const idToken = appleAuthRequestResponse.identityToken;
              if (idToken) {
                try {
                  const jwtDecodeModule = require('jwt-decode');
                  const decoder = jwtDecodeModule.default || jwtDecodeModule;
                  const decoded = decoder(idToken);
                  email = decoded.email;
                  console.log('Decoded email from JWT:', email);
                } catch (e) {
                  console.warn('Failed to decode identityToken', e);
                }
              }
            }

            // If still no email, use userIdentifier as fallback
            if (!email) {
              email = `${userIdentifier}@appleid.com`;
              console.log('Using userIdentifier as email fallback:', email);
            }

            // Create minimal user data for profile completion
            appleUserData = {
              name: null, // Will be filled in BasicProfileInfo
              email: email,
              user: userIdentifier,
              needsProfileCompletion: true,
              lastUpdated: new Date().toISOString()
            };

            // Save this minimal data
            await AsyncStorage.setItem('appleSignInData', JSON.stringify(appleUserData));
          }
        }

        // Use the apple user data for authentication
        const data = { email: appleUserData.email };
        console.log('Checking if user exists with email:', appleUserData.email);
        const response = await checkUserExists(data);
        console.log('User exists check response:', response);

        if (!response?.exists) {
          console.log('User does not exist, proceeding with sign up...');
          await Promise.all([
            dispatch(setEmailAndPassword({ email: appleUserData.email, password: 'Mtechub@123' })),
            dispatch(setStep(2)),
            dispatch(setAccountType('APPLE')),
          ]);
          console.log('Navigating to BasicProfileInfo');

          // Navigate with appropriate parameters based on available data
          const navigationParams = {};
          if (appleUserData.name) {
            navigationParams.name = appleUserData.name;
          }
          // No longer passing appleNotSentName flag - just treat as normal flow

          navigation.navigate('BasicProfileInfo', navigationParams);
        } else {
          console.log('User already exists');
          showFlashMessage('Error', 'User already exists Please sign in instead', 'info', COLORS.red);

        }
      } else {
        console.log('Apple Sign-In failed: User not authorized');
        showFlashMessage('Error', 'Apple Sign-In authentication failed', 'info', COLORS.red);
      }
    } catch (error) {
      if (error.code === appleAuth.Error.CANCELLED) {
        showFlashMessage('Cancelled', 'Apple Sign-In was cancelled', 'info', COLORS.black);
      } else {
        console.error('Apple Sign-In Error:', error);
        if (error.code) {
          console.error('Error code:', error.code);
        }
        if (error.message) {
          console.error('Error message:', error.message);
        }
        showFlashMessage('Error', 'Apple Sign-In failed', 'info', COLORS.warning);
      }
    } finally {
      console.log('Apple Sign-In flow completed');
      setAppleLoading(false);
    }
  };

  const showFlashMessage = (message, description, type, backgroundColor) => {
    setFlashMessageData({
      message,
      description,
      type,
      icon: type,
      backgroundColor,
      textColor: COLORS.white,
    });
    setFlashMessage(true);
    setTimeout(() => setFlashMessage(false), 3000);
  };



  // Handle Apple credential revocation
  useEffect(() => {
    if (Platform.OS === 'ios') {
      return appleAuth.onCredentialRevoked(() => {
        console.warn('User Credentials have been Revoked');
      });
    }
  }, []);


  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && videoRef.current) {
        // Resume video playback when app comes to foreground
        videoRef.current.seek(0);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return (





    <View style={{
      flex: 1,
      backgroundColor: COLORS.black,
    }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: Platform.OS === 'ios' ? responsiveHeight(8) : responsiveHeight(3),

        }}
      >
        <Image
          source={Images.writtenLogo}
          style={styles.matchesImage}
        />
      </View>


      {/* <Video
        ref={videoRef}
        source={require('../../../assets/lottie/data11.mp4')}
        style={styles.backgroundVideo}
        resizeMode="cover"
        repeat={true}
        muted={true}
        rate={1.0}
        ignoreSilentSwitch="ignore"
        playInBackground={false}
        playWhenInactive={false}
        onError={(e) => console.log('Video Error:', e)}
        onLoadStart={() => console.log('Video loading started')}
        onEnd={() => {

          videoRef.current.seek(1);
        }}

      /> */}
      <LottieView
        source={require('../../../assets/lottie/data_lottie.json')}
        autoPlay
        loop
        style={{
          width: '110%',
          height: '110%',
          position: 'absolute',
          left: '-5%',
          top: '-5%',
          zIndex: -9
        }}
        speed={1.5}
      />




      {flashMessage && <FlashMessages flashMessageData={flashMessageData} />}
      <LinearGradient
        colors={[
          COLORS.black + '00', // 0%
          COLORS.black + '33', // 20%
          COLORS.black + 'B3', // 50%
          COLORS.black + 'FF', // 100%
        ]}
        style={{
          flex: 1,
          paddingLeft: 15,
          paddingRight: 15,
          borderRadius: 5,
          width: '100%',
          height: '100%',
        }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            style={styles.centeredView}
          />




          <View
            style={{

              position: 'absolute',
              bottom: '4%',
              width: "100%"
            }}
          >
            {isAppleAuthSupported && (
              <View style={styles.centeredView}>
                <SecondaryButton
                  loading={appleLoading}
                  title="Continue with Apple"
                  image={Images.apple_logo}
                  onPress={() => !appleLoading && onAppleButtonPress()}
                  style={{
                    borderWidth: 1,
                    borderColor: COLORS.primary,
                    backgroundColor: COLORS.primary + '20',
                  }}
                  imageStyle={{
                    tintColor: COLORS.white,
                  }}
                />
              </View>
            )}
            <View style={styles.centeredView}>
              <SecondaryButton
                loading={googleLoading}
                title="Continue with Google"
                image={Images.google_logo}
                onPress={() => !googleLoading && googleSignIn()}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.primary,
                  backgroundColor: COLORS.primary + '20',
                }}
              />
            </View>


            <View style={styles.centeredView}>
              <SecondaryButton
                title="Continue with Email"
                image={Images.email_logo}
                onPress={() => navigation.navigate('SignUp_N', { signupBy: 'EMAIL' })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.primary,
                  backgroundColor: COLORS.primary + '20',
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginVertical: responsiveHeight(1.4),
                width: Platform.OS != 'ios' ? '100%' :
                  '95%',
                flexWrap: 'wrap',
                alignSelf: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(1.5),
                  marginLeft: responsiveWidth(1),
                  fontFamily: 'Poppins-Regular',

                }}
              >
                By Continuing, you agree to our</Text>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL(privacy_link);
                }}
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.white,
                  marginHorizontal: responsiveWidth(1),
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(1.5),
                    fontFamily: 'Poppins-Regular',
                    fontWeight: '600',

                  }}
                >Terms and Conditions</Text>
              </TouchableOpacity>

            </View>
            <View style={styles.footerView}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login_N')} style={styles.signInButton}>
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>


        </ScrollView>
      </LinearGradient >
    </View>

  );
}

const styles = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '120%',
    zIndex: -2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: -1,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: fonts.PoppinsBlack,
    marginTop: '5%',

  },
  matchesImage: {
    width: 220,
    height: 70,
    resizeMode: 'contain',

  },
  fateMatchImage: {
    width: '80%',
    height: '30%',
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 20,
    color: COLORS.white,
    textAlign: 'center',
    fontFamily: fonts.PoppinsRegular,
    marginVertical: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  centeredView: {
    alignSelf: 'center',
  },
  footerView: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 17,
    fontFamily: fonts.PoppinsRegular,
    fontWeight: '400',
    color: COLORS.white,
  },
  signInButton: {
    padding: 10,
    marginLeft: 2,
  },
  signInText: {
    color: COLORS.white,
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 17,
    textDecorationLine: 'underline',
  },
});

export default Onboarding_signups;