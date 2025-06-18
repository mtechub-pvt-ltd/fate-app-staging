import React, { useEffect, useState } from 'react';
import {
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import Header from '../../../../components/TopBar/Header';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import { updateResetPasswordNew } from '../../../../Services/Auth/SignupService';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';


import { Eye, EyeSlash } from 'phosphor-react-native';


function SignUp_N({ route, navigation }) {
  const { email } = route?.params;
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


  const handleRegisterEmailAPI = async (mail, pass, type) => {

    if (password.length == 0 || confirmPassword.length == 0) {
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
      };
      console.log(data);

      try {
        const response = await updateResetPasswordNew(data);
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
          setTimeout(() => {
            navigation.navigate('Login_N');
          }, 3000);
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
                title="Reset Password"
                subtitle={`Enter your new password below`}
                onIconPress={() => {
                  navigation.goBack();
                }}
                IconName="chevron-left"
                iconSize={responsiveHeight(2.5)}
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
              paddingTop: responsiveHeight(2),
              backgroundColor: 'transparent'
            }}>
              <PrimaryButton
                title="Update"
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
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: responsiveHeight(2),
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: responsiveHeight(1),
                }}>
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