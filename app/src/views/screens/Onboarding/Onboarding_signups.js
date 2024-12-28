import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Animated,
  StyleSheet,
  Image,
  TouchableOpacity,
  Easing,
  Platform
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import COLORS from '../../../consts/colors';
import Images from '../../../consts/Images';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUserDetail,
  storeUserDetail,
} from '../../../HelperFunctions/AsyncStorage/userDetail';
import GradientBackground from '../../../components/MainContainer/GradientBackground';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import fonts from '../../../consts/fonts';
import Icon from 'react-native-vector-icons/FontAwesome5';
import SecondaryButton from '../../../components/Button/SecondaryButton';
import { registerByEmail } from '../../../Services/Auth/SignupService';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  AppleButton,
  appleAuth
} from '@invertase/react-native-apple-authentication';
import FlashMessages from '../../../components/FlashMessages/FlashMessages';

const isAppleAuthSupported = appleAuth.isSupported;
function Onboarding({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // message state
  const [falshMessage, setFalshMessage] = useState(false);
  const [falshMessageData, setFalshMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
  });

  function validateEmail(email) {
    const regexPattern =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regexPattern.test(String(email).toLowerCase());
  }
  function validateStrongPassword(password) {
    const minLength = 8;
    const containsUppercase = /[A-Z]/.test(password);
    const containsLowercase = /[a-z]/.test(password);
    const containsNumber = /[0-9]/.test(password);
    const containsSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength && containsUppercase && containsLowercase && containsNumber && containsSpecialChar
    );
  }

  // google sign in
  GoogleSignin.configure({
    // in scope you need to add the email age and profile
    // for more info check the documentation

    scopes: ['email', 'profile', 'openid',],
    // webClientId: '1085816021395-2q1e9g1v0qjv6t4q4n7f1v5l6t4t9b6g.apps.googleusercontent.com',
    // offlineAccess: true,
  });

  const checkGoogleSignin = async () => {
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      return console.log('error', error);
    }
  };
  const googleSignIn = async () => {
    try {

      // Step 1: Ensure Google Play Services are available
      await GoogleSignin.hasPlayServices();

      //   console.log('User is already signed in. Signing out to show account picker.');
      await GoogleSignin.signOut(); // Sign out the current session
      // await GoogleSignin.revokeAccess(); // Revoke access to clear previous sessions





      const userInfo = await GoogleSignin.signIn();
      console.log('userInfo>>>>>>>>>>>>>>', userInfo)


      await handleRegisterEmailAPI(userInfo?.user.email, 'Mtechub@123', 'GOOGLE', userInfo?.user.name)

    } catch (error) {
      console.log(`error>>>>>> ${error}`)

    }
  };



  async function onAppleButtonPress() {
    setLoading(true);
    try {
      // performs login request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // get current authentication state for user
      // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
      const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

      // use credentialState response to ensure the user is authenticated
      if (credentialState === appleAuth.State.AUTHORIZED) {
        // user is authenticated
        // console.log('appleAuthRequestResponse>>>>>>>>>>>>>>', appleAuthRequestResponse?.user)
        let name = appleAuthRequestResponse?.fullName?.givenName + ' ' + appleAuthRequestResponse?.fullName?.familyName
        await handleRegisterEmailAPI(appleAuthRequestResponse?.user + '@gmail.com', 'Mtechub@123', 'APPLE', name)
        setLoading(false);
      } else {
        setLoading(false);
        // user is unauthenticated
        alert('User is unauthenticated')
      }
    } catch (error) {
      console.log(error)
      setLoading(false);
    }

  }


  useEffect(() => {
    if (Platform.OS === 'ios') {
      return appleAuth.onCredentialRevoked(async () => {
        console.warn('If this function executes, User Credentials have been Revoked');
      });
    }


  }, [])

  const handleRegisterEmailAPI = async (mail, pass, type, name) => {

    setLoading(true);
    const data = {
      email: mail,
      password: pass,
      type: type,
    };
    console.log(data);

    try {
      const response = await registerByEmail(data);
      console.log(response);
      if (response.error == true) {
        setFalshMessageData({
          message: 'Error',
          description: response.msg,
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
      } else {
        setFalshMessageData({
          message: 'Success',
          description: response.msg,
          type: 'success',
          icon: 'success',
          backgroundColor: COLORS.success,
          textColor: COLORS.white,
        });
        const userDetail = await storeUserDetail(response.data);
        if (userDetail) {
          navigation.navigate('BasicProfileInfo', {
            name: name.includes(null) ? null : name,
          });
        }
      }
      setFalshMessage(true);
      setLoading(false);
      setTimeout(() => {
        setFalshMessage(false);
      }, 3000);
    } catch (error) {
      console.log('error', error);
    }


  };


  return (
    <GradientBackground>
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}
      <SafeAreaView
        style={{
          flex: 1,
        }}>
        <Text
          style={{
            fontSize: 40,
            fontWeight: 'bold',
            color: COLORS.white,
            fontFamily: fonts.JostBlack,
            marginTop: '5%',
          }}>
          The future of {'\n'}meaningful
        </Text>
        <Image
          source={Images.matches}
          style={{
            width: 160,
            height: 60,
            resizeMode: 'contain',
            tintColor: COLORS.white,
            // marginTop: responsiveHeight(1),
          }}
        />
        <Image
          source={Images.fate_match}
          style={{
            width: '80%',
            height: '30%',
            resizeMode: 'contain',
            alignSelf: 'center',
            marginTop: 10,
          }}
        />

        <Text
          style={{
            fontSize: 20,
            color: COLORS.white,
            textAlign: 'center',
            fontFamily: fonts.PoppinsRegular,
            marginVertical: 15,
            fontWeight: '500',
            letterSpacing: .5,
          }}>
          Stop swiping, start typing ...
        </Text>

        <SecondaryButton
          loading={loading}
          title="Continue with Google"
          image={Images.google_logo}
          onPress={() => {
            if (!loading) {
              googleSignIn()
            }

          }}
        />
        <View
          style={{
            display: isAppleAuthSupported
              || Platform.OS === 'ios'
              ? 'flex' : 'none',
          }}
        >
          <SecondaryButton
            loading={loading}
            title="Continue with Apple"
            image={Images.apple_logo}
            onPress={() => {
              if (!loading) {
                if (isAppleAuthSupported) {
                  onAppleButtonPress();
                } else {
                  console.log('Apple Sign-In is not supported on this device');
                }
              }
            }}
          />
        </View>
        <SecondaryButton

          title="Continue with Email"
          image={Images.email_logo}
          onPress={() => navigation.navigate('SignUp_N', {
            signupBy: "EMAIL"
          })}
        />
        <View
          style={{
            flexDirection: 'row',
            marginTop: 4,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: 17,
              fontFamily: fonts.PoppinsRegular,
              fontWeight: '400',
              color: COLORS.white,
            }}>
            Already have an account?
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login_N')}
            style={{
              padding: 10,
              marginLeft: 2,
            }}>
            <Text
              style={{
                color: COLORS.white,
                fontFamily: fonts.PoppinsSemiBold,
                fontSize: 17,
                textDecorationLine: 'underline',
              }}>
              Sign In
            </Text>
          </TouchableOpacity>
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
export default Onboarding;
