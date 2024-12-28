import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import {ErrorMessage, Formik} from 'formik';
import {TextInput, Button, Headline, Text} from 'react-native-paper';
import COLORS from '../../../../consts/colors';
import {width, height} from '../../../../consts/Dimension';
import * as Yup from 'yup';
import MainContainer from '../../../../components/MainContainer/MainContainer';
import {Image, MotiView} from 'moti';
import Images from '../../../../consts/Images';
import {
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import AppLogo from '../../../../components/AppLogo/AppLogo';
import Icon from 'react-native-vector-icons/FontAwesome5';
import FastImage from 'react-native-fast-image';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import {registerByEmail} from '../../../../Services/Auth/SignupService';
import {storeUserDetail} from '../../../../HelperFunctions/AsyncStorage/userDetail';

export default function SignUp({navigation}) {
  //states
  const [loginWithPhoneNumber, setLoginWithPhoneNumber] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // phone no states
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState('PK');
  const [country, setCountry] = useState({callingCode: ['92']});

  // loading state
  const [loading, setLoading] = useState(false);
  // message state
  const [falshMessage, setFalshMessage] = useState(false);
  const [falshMessageData, setFalshMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegisterEmailAPI = async () => {
    if (email == '' || password == '') {
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
      }, 2000);
      return;
    }
    setLoading(true);
    const data = {
      email: email,
      password: password,
    };
    console.log(data);

    try {
      const response = await registerByEmail(data);
      // console.log(response);
      if (response[0].error == true) {
        setFalshMessageData({
          message: 'Error',
          description: response[0].message,
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
      } else {
        setFalshMessageData({
          message: 'Success',
          description: response[0].message,
          type: 'success',
          icon: 'success',
          backgroundColor: COLORS.success,
          textColor: COLORS.white,
        });
        // const userDetail = await storeUserDetail(response[0].user_detail);
        // if (userDetail) {
        //   navigation.replace("Test");
        // }
      }
      setFalshMessage(true);
      setLoading(false);
      setTimeout(() => {
        setFalshMessage(false);
      }, 3000);
    } catch (error) {
      console.log(error);
    }
    //   setLoading(false);
    //   if (response[0].error == true) {
    //     setFalshMessageData({
    //       message: "Error",
    //       description:
    //         response[0].message.charAt(0).toUpperCase() +
    //         response[0].message.slice(1),
    //       type: "info",
    //       icon: "info",
    //       backgroundColor: COLORS.red,
    //       textColor: COLORS.white,
    //     });
    //   } else {
    //     setFalshMessageData({
    //       message: "Success",
    //       description:
    //         response[0].message.charAt(0).toUpperCase() +
    //         response[0].message.slice(1),
    //       type: "success",
    //       icon: "success",
    //       backgroundColor: COLORS.success,
    //       textColor: COLORS.white,
    //     });
    //     const userDetail = await storeUserDetail(response[0].user_detail);
    //     if (userDetail) {
    //       navigation.replace("Test");
    //     }
    //   }

    //   setFalshMessage(true);
    //   setTimeout(() => {
    //     setFalshMessage(false);
    //   }, 1000);
    // } catch (error) {
    //   setLoading(false);
    //   console.log(error);
    //   // Handle any errors that occurred during the API call
    // }
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: COLORS.white,
        flex: 1,
      }}>
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}>
          {falshMessage && (
            <FlashMessages falshMessageData={falshMessageData} />
          )}

          <MainContainer>
            <AppLogo style={styles.AppLogoImageStyle} />
            <MotiView
              // add typing effect with moti
              from={{
                opacity: 0,
                translateY: 50,
              }}
              animate={{
                opacity: 1,
                translateY: 0,
              }}
              transition={{
                type: 'spring',
                duration: 1000,
                delay: 200,
              }}
              style={{
                marginVertical: '2%',
                textAlign: 'center',
                alignItems: 'center',
              }}>
              <Headline style={styles.headlineStyle}>
                Your Virtual Journey Begins
              </Headline>
              <Text style={styles.headlineTextStyle}>
                Create an account to get started
              </Text>
            </MotiView>
            <>
              <View>
                <View>
                  <TextInput
                    onChangeText={e => {
                      setEmail(e);
                    }}
                    value={email}
                    label="Enter your Email"
                    mode="outlined"
                    textContentType="emailAddress"
                    autoCapitalize="none"
                    activeOutlineColor={COLORS.secondary}
                    outlineColor={COLORS.grey + 80}
                    left={
                      <TextInput.Icon
                        icon={() => (
                          <Icon
                            name="envelope"
                            size={20}
                            color={COLORS.greylight}
                          />
                        )}
                      />
                    }
                    keyboardType="email-address"
                    style={styles.inputStyle}
                  />

                  <TextInput
                    onChangeText={e => {
                      {
                        setPassword(e);
                      }
                    }}
                    value={password}
                    label="Enter your Password"
                    mode="outlined"
                    textContentType="password"
                    autoCapitalize="none"
                    activeOutlineColor={COLORS.secondary}
                    outlineColor={COLORS.grey + 80}
                    secureTextEntry={!showPassword}
                    left={
                      <TextInput.Icon
                        icon={() => (
                          <Icon
                            name="lock"
                            size={20}
                            color={COLORS.greylight}
                          />
                        )}
                      />
                    }
                    right={
                      <TextInput.Icon
                        onPress={() => setShowPassword(!showPassword)}
                        icon={() => (
                          <Icon
                            name={showPassword ? 'eye-slash' : 'eye'}
                            size={20}
                            color={COLORS.greylight}
                          />
                        )}
                      />
                    }
                    keyboardType="default"
                    style={styles.inputStyle}
                  />
                  {/* <ErrorMessages error={errors.password} /> */}
                </View>
              </View>
              <View
                style={[
                  styles.forgotPasswordRowStyle,
                  {
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                  },
                ]}></View>
              <Button
                loading={loading}
                disabled={loading}
                mode="contained"
                contentStyle={{
                  paddingVertical: '2%',
                }}
                style={{
                  marginVertical: height * 0.03,
                  borderRadius: 50,
                }}
                buttonColor={COLORS.primary}
                textColor={COLORS.white}
                textContentType="none"
                onPress={handleRegisterEmailAPI}>
                Sign Up
              </Button>
            </>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text>Already have an account?</Text>
              <TouchableWithoutFeedback
                style={styles.forgotPasswordStyle}
                onPress={() => navigation.navigate('Login')}>
                <Text
                  style={{
                    color: COLORS.primary,
                    fontWeight: 'bold',
                    backgroundColor: COLORS.white,
                    marginVertical: '2%',
                    marginLeft: '12%',
                  }}>
                  Login Now
                </Text>
              </TouchableWithoutFeedback>
            </View>

            <MotiView
              from={{
                opacity: 0,
                translateY: 50,
              }}
              animate={{
                opacity: 1,
                translateY: 0,
              }}
              transition={{
                type: 'spring',
                duration: 1000,
                delay: 500,
              }}>
              <FastImage
                source={Images.worldMapBkg}
                cacheControl="immutable"
                style={styles.worldMapBkgStyle}
              />
            </MotiView>
          </MainContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  AppLogoImageStyle: {
    alignSelf: 'center',
    marginTop: '10%',
    marginBottom: '5%',
  },
  inputStyle: {
    marginVertical: '2%',
    backgroundColor: COLORS.white,
  },
  headlineStyle: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  headlineTextStyle: {
    color: COLORS.greylight,
    paddingVertical: '2%',
    marginBottom: '5%',
  },
  forgotPasswordStyle: {
    backgroundColor: COLORS.white,
    paddingHorizontal: '2%',
  },
  forgotPasswordRowStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: '2%',
  },
  forgotPasswordTextStyle: {
    fontWeight: 'bold',
    marginVertical: '2%',
  },
  worldMapBkgStyle: {
    width: width,
    height: height * 0.24,
    alignSelf: 'center',
    resizeMode: 'stretch',
    overflow: 'hidden',
    opacity: 0.5,
    position: 'absolute',
    bottom: -height * 0.25,
    zIndex: -1,
  },
});
