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
import { registerByEmail } from '../../../../Services/Auth/SignupService';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { height } from '../../../../consts/Dimension';
import { Horse, Heart, Cube, Eye, EyeSlash } from 'phosphor-react-native';
import { setEmailAndPassword, setStep } from '../../../../redux/features/form/formSlice';
import { useDispatch, useSelector } from 'react-redux';



function SignUp_N({ route, navigation }) {
  const { signupBy } = route?.params;
  const { email: reduxEmail, password: reduxPassword } = useSelector((state) => state.form);

  const [email, setEmail] = useState(reduxEmail || '');
  const [password, setPassword] = useState(reduxPassword || '');
  const [showPassword, setShowPassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  // message state
  const [falshMessage, setFalshMessage] = useState(false);
  const [falshMessageData, setFalshMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
  });

  const dispatch = useDispatch();

  const handleNext = () => {
    dispatch(setEmailAndPassword({ email, password }));
    dispatch(setStep(2)); // Move to step 2
    navigation.navigate('BasicProfileInfo');
  };

  function validateEmail(email) {
    const regexPattern =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regexPattern.test(String(email).toLowerCase());
  }
  // test 1-11

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

  const handleRegisterEmailAPI = async (mail, pass, type) => {
    if (type) {
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
            navigation.navigate('BasicProfileInfo');
          }
        }
        setFalshMessage(true);
        setLoading(false);
        setTimeout(() => {
          setFalshMessage(false);
        }, 3000);
      } catch (error) {
        console.log(error);
      }
    } else {
      if (email.length == 0 || password.length == 0 || confirmPassword.length == 0) {
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
      } else if (!validateEmail(email)) {
        setFalshMessageData({
          message: 'Error',
          description: 'Please enter a valid email',
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
      } else if (!validateStrongPassword(password)) {
        setFalshMessageData({
          message: 'Error',
          description:
            'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFalshMessage(true);
        setTimeout(() => {
          setFalshMessage(false);
        }, 3000);
      } else if (password != confirmPassword) {
        setFalshMessageData({
          message: 'Error',
          description: 'Please enter the same password',
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
      } else {
        setLoading(true);
        const data = {
          email: email,
          password: password,
          type: type ? type : 'EMAIL'
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
              navigation.navigate('BasicProfileInfo');
            }
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
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}>
              <Header
                title="Sign Up"
                subtitle={`Ready to Dive In? Sign Up and Let the Magic Begin!`}
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
              <CustomInput
                mainContainerStyle={{ marginTop: responsiveHeight(2) }}
                title="Password"
                autoCapitalize="none"
                keyboardType="default"
                placeholder="Enter password"
                secureTextEntry={showPassword}
                onChangeText={text => {
                  setPassword(text);
                }}
                leftIcon={
                  showPassword ?
                    <Eye color={COLORS.white} size={24} /> :
                    <EyeSlash color={COLORS.white} size={24} />
                }
                leftIconPress={() => {
                  setShowPassword(!showPassword);
                }}
              />
              <CustomInput
                mainContainerStyle={{ marginTop: responsiveHeight(2) }}
                title="Confirm Password"
                placeholder="Enter confirm password"
                autoCapitalize="none"
                secureTextEntry={showConfirmPassword}
                onChangeText={text => {
                  setConfirmPassword(text);
                }}
                leftIcon={
                  showConfirmPassword ?
                    <Eye color={COLORS.white} size={24} /> :
                    <EyeSlash color={COLORS.white} size={24} />
                }
                leftIconPress={() => {
                  setShowConfirmPassword(!showConfirmPassword);
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
              paddingTop: responsiveHeight(1),
              backgroundColor: 'transparent'
            }}>
              <PrimaryButton
                title="Sign Up"
                loading={loading}
                onPress={() => {
                  // handleRegisterEmailAPI();
                  handleNext();
                }}
                style={{
                  alignSelf: 'center',
                  width: responsiveWidth(90),
                }}
                backgroundColor={COLORS.white}
                textColor={COLORS.primary}
              />
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: responsiveHeight(1),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontSize: responsiveFontSize(2),
                    color: COLORS.white,
                  }}>
                  Already have an account?
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login_N')}
                  style={{
                    padding: 10,
                    marginLeft: responsiveWidth(1),
                    fontFamily: fonts.JostMedium,
                    fontSize: responsiveFontSize(4),
                  }}>
                  <Text
                    style={{
                      color: COLORS.white,
                      fontFamily: fonts.JostMedium,
                      fontSize: responsiveFontSize(2),
                      textDecorationLine: 'underline',
                    }}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
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