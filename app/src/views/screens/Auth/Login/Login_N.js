import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Animated,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Horse, Heart, Cube, Eye, EyeSlash } from 'phosphor-react-native';
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
import { loginsByEmail } from '../../../../Services/Auth/SignupService';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';



function Login_N({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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


  const handleLoginEmailAPI = async () => {
    if (email.length == 0 || password.length == 0) {
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
    } else {
      setLoading(true);
      const data = {
        email: email,
        password: password,
      };
      console.log(data);

      try {
        const response = await loginsByEmail(data);
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
            // navigation.navigate('BasicProfileInfo');
            console.log('userDetail:', JSON.stringify(userDetail, null, 2));
            await AsyncStorage.setItem('signup_user', JSON.stringify({ signup_user: false }));
            navigation.replace('MyTabs');
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


  };
  useEffect(() => {

  }, []);
  return (
    <GradientBackground>
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}
      <SafeAreaView
        style={{
          flex: 1,
        }}>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
        >
          <View style={{ flex: 1 }}>
            <ScrollView keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
              <Header
                title="Sign In"
                subtitle={`Ready to Dive In? Sign In and Let the Magic Begin!`}
                onIconPress={() => {
                  navigation.goBack();
                }}
                IconName="chevron-left"
                iconSize={responsiveHeight(2.5)}
              />
              <CustomInput
                mainContainerStyle={{
                  marginTop: responsiveHeight(5),
                }}
                title="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="e.g. yourmail@email.com"
                onChangeText={text => {
                  setEmail(text);
                }}
                value={email}
              />
              <CustomInput
                mainContainerStyle={{
                  marginTop: responsiveHeight(3),
                }}
                title="Password"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Enter password"
                secureTextEntry={!showPassword}
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
                value={password}
              />
              <TouchableOpacity
                style={{
                  alignSelf: 'flex-end',
                }}
                onPress={() => navigation.navigate('ForgotPassword_N')}>
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(2),
                    // fontFamily: fonts.JostMedium,
                    paddingVertical: responsiveHeight(2),
                    paddingHorizontal: responsiveHeight(1),
                    textDecorationLine: 'underline',
                    // width: responsiveWidth(50),
                  }}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  height: responsiveHeight(10),
                  // backgroundColor: 'red'
                }}
              ></View>
            </ScrollView>
            <View style={{
              paddingTop: responsiveHeight(1),

            }}>
              <PrimaryButton
                title="Sign In"
                loading={loading}
                onPress={() => {
                  handleLoginEmailAPI();
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
                  Don't have an account?
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('SignUp_N', {
                    signupBy: "EMAIL"
                  })}
                  style={{
                    padding: 10,
                    marginLeft: responsiveWidth(.5),
                    fontFamily: fonts.JostMedium,
                    fontSize: responsiveFontSize(4),
                  }}>
                  <Text
                    style={{
                      color: COLORS.white,
                      textDecorationLine: 'underline',
                      fontFamily: fonts.JostMedium,
                      fontSize: responsiveFontSize(2),
                    }}>
                    Sign Up
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
export default Login_N;
