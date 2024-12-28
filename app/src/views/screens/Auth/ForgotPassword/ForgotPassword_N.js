import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserDetail, storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import Header from '../../../../components/TopBar/Header';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import { registerByEmail, forgetPasswordNew } from '../../../../Services/Auth/SignupService';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { height } from '../../../../consts/Dimension';
import { Horse, Heart, Cube, Eye, EyeSlash } from 'phosphor-react-native';


function SignUp_N({ route, navigation }) {
  const { signupBy } = route?.params ? route.params : '';
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
  GoogleSignin.configure();

  const googleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('userInfo>>>>>>>>>>>>>>', userInfo?.user.email)

      await handleRegisterEmailAPI(userInfo?.user.email, 'Mtechub@123', 'GOOGLE')

    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('SIGN_IN_CANCELLED', error)
            // user cancelled the login flow
            break;
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            console.log('IN_PROGRESS', error)
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log('PLAY_SERVICES_NOT_AVAILABLE', error)
            // play services not available or outdated
            break;
          default:
            // some other error happened
            console.log('default', error)
        }
      } else {
        // an error that's not related to google sign in occurred
        console.log('error', error)
      }
    }
  };

  const handleRegisterEmailAPI = async () => {

    if (email.length == 0) {
      setFalshMessageData({
        message: 'Error',
        description: 'Please fill all the fields',
        type: 'info',
        icon: 'info',
        backgroundColor: COLORS.red,
        textColor: COLORS.white,
      });
      setFalshMessage(true);
      setTimeout(() => {
        setFalshMessage(false);
      }, 3000);
      return;
    }
    else if (!validateEmail(email)) {
      setFalshMessageData({
        message: 'Error',
        description: 'Please enter a valid email address',
        type: 'info',
        icon: 'info',
        backgroundColor: COLORS.red,
        textColor: COLORS.white,
      });
      setFalshMessage(true);
      setTimeout(() => {
        setFalshMessage(false);
      }, 3000);
      return;
    }
    else {
      setLoading(true);
      const data = {
        email: email,
      };
      console.log(data);

      try {
        const response = await forgetPasswordNew(data);
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
          navigation.navigate('VerificationOTP',
            {
              email: email,
              otp: response?.data?.otp
            });
        }
        setFalshMessage(true);
        setLoading(false);
        setTimeout(() => {
          setFalshMessage(false);
        }, 3000);
      } catch (error) {
        console.log(error);
      }
    }

  };

  useEffect(() => {
    if (signupBy) {
      if (signupBy == 'GOOGLE') {
        googleSignIn()
      }
    }
  }, []);

  return (
    <GradientBackground>
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
        >
          <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <Header
                title="Forgot Password"
                subtitle={`Lost Your Way? Let's Get You Back In by resetting your password.`}
                onIconPress={() => {
                  navigation.goBack();
                }}
                IconName="chevron-left"
                iconSize={responsiveHeight(2.5)}
              />
              <CustomInput
                mainContainerStyle={{ marginTop: responsiveHeight(5) }}
                title="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="e.g. yourmail@email.com"
                onChangeText={text => {
                  setEmail(text);
                }}
              />

              <View
                style={{
                  height: responsiveHeight(10),
                  // backgroundColor: 'red'
                }}
              ></View>

            </ScrollView>
            <View style={{
              paddingVertical: responsiveHeight(1),
              backgroundColor: 'transparent'
            }}>
              <PrimaryButton
                title="Send Code"
                loading={loading}
                onPress={() => {
                  handleRegisterEmailAPI();
                }}
                style={{
                  alignSelf: 'center',
                  width: responsiveWidth(90),
                }}
                backgroundColor={COLORS.white}
                textColor={COLORS.primary}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
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

export default SignUp_N;