import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeSlash } from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import Header from '../../../../components/TopBar/Header';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import { loginsByEmail, addToken } from '../../../../Services/Auth/SignupService';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import { showMessage } from 'react-native-flash-message';

// Import utility functions
import { isIOS, platformSelect } from '../../../../utils/platform';
import { validateEmail, createFlashMessage, handleApiError } from '../../../../utils/errorHandler';

// Import Google and Apple sign-in, SecondaryButton and Images
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import SecondaryButton from '../../../../components/Button/SecondaryButton';
import Images from '../../../../consts/Images';

const isAppleAuthSupported = appleAuth.isSupported;

function Login_N({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false); // Added for email login

  // message state with unique ID to force re-render
  const [falshMessage, setFalshMessage] = useState(false);
  const [falshMessageData, setFalshMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
    color: '',
    id: Date.now(), // Add unique ID to force re-render
  });

  const showFlashMessage = (message, description, type) => {
    const messageData = createFlashMessage(message, description, type, COLORS);
    setFalshMessageData({
      ...messageData,
      id: Date.now(), // Update ID to force re-render
    });
    setFalshMessage(true);

    // Show message directly in addition to the component
    let rnFlashMessageType = type;
    if (type === 'error') {
      rnFlashMessageType = 'danger'; // Map 'error' to 'danger' for react-native-flash-message (typically red)
    } else if (type === 'info') { // Our 'info' type (used for cancellations) maps to 'warning'
      rnFlashMessageType = 'warning'; // Map 'info' to 'warning' for react-native-flash-message (typically yellow/orange)
    }
    // 'success' type will map to 'success'

    showMessage({
      message: message,
      description: description,
      type: rnFlashMessageType, // Use the mapped type to let react-native-flash-message handle default styling
      // backgroundColor: messageData.color, // REMOVED: Rely on rnFlashMessageType for background color
      color: "#ffffff", // Keep text color white
      icon: {
        icon: messageData.icon, // Use icon from createFlashMessage
        position: 'left',
        color: "#ffffff",
      },
      duration: 3000,
    });

    setTimeout(() => {
      setFalshMessage(false);
    }, 3000);
  };

  // configure Google Signin once
  useEffect(() => {
    GoogleSignin.configure({ scopes: ['email', 'profile', 'openid'] });
  }, []);

  // handle Google social login
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();
      const email = userInfo?.user?.email;
      if (!email) throw new Error('No email returned from Google');
      const response = await loginsByEmail({ email, password: 'Mtechub@123' });
      if (response?.error) {
        showFlashMessage('Error', response.msg || 'Login failed', 'error');
      } else if (response?.data) {
        showFlashMessage('Success', 'Login successful', 'success');
        const userDetail = await storeUserDetail(response?.data);
        if (userDetail) {
          await AsyncStorage.setItem('signup_user', JSON.stringify({ signup_user: false }));
          await addToken({ user_id: userDetail?.data?.id, new_tokens: 30 });

          navigation.reset({
            index: 0,
            routes: [{
              name: 'NewWaitingListScreen1',
              params: {
                fromOnboarding: true,
              } // Explicitly navigate to Home tab
            }],
          });
          // navigation.reset({ index: 0, routes: [{ name: 'MyTabs' }] });
        }
      } else {
        showFlashMessage('Error', 'Unexpected response from server', 'error');
      }
    } catch (error) {
      console.error('Google Login Error:', error);
      if (error.code === GoogleSignin.statusCodes.SIGN_IN_CANCELLED) {
        showFlashMessage('Cancelled', 'Google Sign-In was cancelled', 'info', COLORS.red);
      } else {
        showFlashMessage('Error', error.message || 'Google login failed', 'error');
      }
    } finally {
      setGoogleLoading(false);
    }
  };


  const handleAppleLogin = async () => {
    try {
      setAppleLoading(true);
      const appleResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL],
      });
      const userId = appleResponse.user;
      let email;
      // Try decode identityToken for email
      const idToken = appleResponse.identityToken;
      if (idToken) {
        try {
          const jwtDecodeModule = require('jwt-decode');
          const decoder = jwtDecodeModule.default || jwtDecodeModule;
          const decoded = decoder(idToken);
          email = decoded.email;
        } catch (e) {
          console.warn('Failed to decode Apple identityToken, using userId fallback', e);
        }
      }
      // Fallback to userId if no email extracted
      if (!email) {
        email = `${userId}@gmail.com`;
        console.log('Fallback email:', email);
      }
      const response = await loginsByEmail({ email, password: 'Mtechub@123' });
      if (response?.error) {
        showFlashMessage('Error', response.msg || 'Login failed', 'error');
      } else if (response?.data) {
        showFlashMessage('Success', 'Login successful', 'success');
        const userDetail = await storeUserDetail(response.data);
        if (userDetail) {
          await AsyncStorage.setItem('signup_user', JSON.stringify({ signup_user: false }));
          await addToken({ user_id: userDetail?.data?.id, new_tokens: 30 });

          navigation.reset({
            index: 0,
            routes: [{
              name: 'NewWaitingListScreen1',
              params: {
                fromOnboarding: true,
              } // Explicitly navigate to Home tab
            }],
          });
          // navigation.reset({ index: 0, routes: [{ name: 'MyTabs' }] });
        }
      } else {
        showFlashMessage('Error', 'Unexpected response from server', 'error');
      }
    } catch (error) {
      console.error('Apple Login Error:', error);
      if (error.code === appleAuth.Error.CANCELLED) {
        showFlashMessage('Cancelled', 'Apple Sign-In was cancelled', 'info');
      } else {
        showFlashMessage('Error', error.message || 'Apple login failed', 'error');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  // Rest of the component remains the same with login handling logic
  const handleLoginEmailAPI = async () => {
    // Form validation
    if (email.trim().length === 0) {
      showFlashMessage('Error', 'Please enter your email', 'error');
      return;
    }

    if (password.trim().length === 0) {
      showFlashMessage('Error', 'Please enter your password', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showFlashMessage('Error', 'Please enter a valid email', 'error');
      return;
    }

    setEmailLoading(true);
    const data = { email, password };

    try {
      const response = await loginsByEmail(data);
      console.log('Login response:', response);

      if (response?.error) {
        showFlashMessage('Error', response.msg || 'Login failed', 'error');
      } else if (response?.data) {
        showFlashMessage('Success', 'Login successful', 'success');

        const userDetail = await storeUserDetail(response.data);
        if (userDetail) {
          await AsyncStorage.setItem('signup_user', JSON.stringify({ signup_user: false }));
          await addToken({ user_id: userDetail?.data?.id, new_tokens: 30 });

          navigation.reset({
            index: 0,
            routes: [{
              name: 'NewWaitingListScreen1',
              params: {
                fromOnboarding: true,
              } // Explicitly navigate to Home tab
            }],
          });
          // navigation.reset({
          //   index: 0,
          //   routes: [{ name: 'MyTabs' }],
          // });
        }
      } else {
        // Handle unexpected response format
        showFlashMessage('Error', 'Unexpected response from server', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showFlashMessage('Error', 'Login failed. Please try again.', 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  // JSX remains largely the same
  return (
    <GradientBackground>
      {/* We'll keep this component for compatibility, but also use direct showMessage calls */}
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={platformSelect('padding', 'height')}
          style={{ flex: 1 }}
          keyboardVerticalOffset={platformSelect(5, 0)}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View >
              <Header
                title="Sign In"
                subtitle="Ready to Dive In? Sign In and Let the Magic Begin!"
                onIconPress={() => navigation.goBack()}
                IconName="chevron-left"
                iconSize={responsiveHeight(2.5)}
              />

              <CustomInput
                mainContainerStyle={{ marginTop: responsiveHeight(5) }}
                title="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="e.g. yourmail@email.com"
                onChangeText={text => setEmail(text)}
                value={email}
              />
              <CustomInput
                mainContainerStyle={{ marginTop: responsiveHeight(3) }}
                title="Password"
                autoCapitalize="none"
                keyboardType="default"
                placeholder="Enter password"
                secureTextEntry={!showPassword}
                onChangeText={text => setPassword(text)}
                leftIcon={
                  showPassword ?
                    <Eye color={COLORS.white} size={24} /> :
                    <EyeSlash color={COLORS.white} size={24} />
                }
                leftIconPress={() => setShowPassword(!showPassword)}
                value={password}
              />
              <TouchableOpacity
                style={{ alignSelf: 'flex-end' }}
                onPress={() => navigation.navigate('ForgotPassword_N')}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(2),
                    paddingVertical: responsiveHeight(2),
                    paddingHorizontal: responsiveHeight(1),
                    textDecorationLine: 'underline',
                  }}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
              {/* <View style={{ height: responsiveHeight(10) }} /> */}
            </View>

            <PrimaryButton
              title="Sign In"
              loading={emailLoading} // Use emailLoading for email sign-in button
              onPress={handleLoginEmailAPI}
              style={{
                alignSelf: 'center',
                width: responsiveWidth(90),
              }}
              backgroundColor={COLORS.white}
              textColor={COLORS.primary}
            />

            {/* Social sign-in buttons */}
            <View
              style={{
                // display: 'none',
              }}
            >
              <View style={{
                alignSelf: 'center',
                marginTop: responsiveHeight(1)
              }}>
                <SecondaryButton
                  loading={googleLoading} // Use googleLoading for Google button
                  title="Continue with Google"
                  image={Images.google_logo}
                  onPress={() => !googleLoading && handleGoogleLogin()}
                />
              </View>
              {isAppleAuthSupported && (
                <View style={{
                  alignSelf: 'center',
                  marginTop: responsiveHeight(.5)
                }}>
                  <SecondaryButton
                    loading={appleLoading} // Use appleLoading for Apple button
                    title="Continue with Apple"
                    image={Images.apple_logo}
                    onPress={() => !appleLoading && handleAppleLogin()}
                  />
                </View>
              )}
            </View>
            <View
              style={{
                flexDirection: 'row',
                // marginTop: responsiveHeight(1),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  color: COLORS.white,
                }}
              >
                Don't have an account?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('SignUp_N', { signupBy: "EMAIL" })}
                style={{
                  padding: 10,
                  marginLeft: responsiveWidth(.5),
                  fontFamily: fonts.JostMedium,
                  fontSize: responsiveFontSize(4),
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    textDecorationLine: 'underline',
                    fontFamily: fonts.JostMedium,
                    fontSize: responsiveFontSize(2),
                  }}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

          </ScrollView>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    fontSize: 18,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
});

export default Login_N;
