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
import ErrorMessages from '../../../../components/ErrorMessages/ErrorMessages';
import FastImage from 'react-native-fast-image';
import CountryPicker from 'react-native-country-picker-modal';
import ChevronLeft from '../../../../components/ChevronLeft/ChevronLeft';
import {base_url, image_url} from '../../../../consts/baseUrls';
import FlashMessage, {
  showMessage,
  hideMessage,
} from 'react-native-flash-message';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import {
  registerByEmail,
  registerByPhoneNo,
  checkPhoneNoStatus,
} from '../../../../Services/Auth/SignupService';
import { LoginByEmail } from '../../../../Services/Auth/LoginService';
import { storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';


export default function ForgotPassword({navigation}) {
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
  //form validation
  const validationSchemaByEmail = Yup.object().shape({
    email: Yup.string().required('Email is required'),
    password: Yup.string().required('Password is required'),
  });
  const validationSchemaByPhone = Yup.object().shape({
    phoneNumber: Yup.string().required('Phone Number is required'),
  });

  const handleRegisterPhoneAPI = async values => {
    setLoading(true);
    const data = {
      phono_code: country.callingCode[0],
      phone_no:
        values.phoneNumber.charAt(0) == '0'
          ? values.phoneNumber.slice(1)
          : values.phoneNumber,
    };

    try {
      const response = await checkPhoneNoStatus(data);
      setLoading(false);
      console.log(response);
      if (response[0].error == false) {
        setFalshMessageData({
          message: 'Error',
          description:
            response[0].message.charAt(0).toUpperCase() +
            response[0].message.slice(1),
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFalshMessage(true);
        setTimeout(() => {
          setFalshMessage(false);
        }, 1000);
      } else {
       
        navigation.navigate('VerifyOTP', {
          data: {
            phone_code: country.callingCode[0],
            phone_no:
              values.phoneNumber.charAt(0) == '0'
                ? values.phoneNumber.slice(1)
                : values.phoneNumber,
          },
          navigatedFrom: 'Login',
        });
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      // Handle any errors that occurred during the API call
    }
  };
  const handleLoginEmailAPI = async values => {
    setLoading(true);
    const data = {
      email: values.email,
      password: values.password,
    };
    try {
      const response = await LoginByEmail(data);
      setLoading(false);
      
      if (response[0].error == true) {
        setFalshMessageData({
          message: 'Error',
          description:
            response[0].message.charAt(0).toUpperCase() +
            response[0].message.slice(1),
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
      } 
      else {
        setFalshMessageData({
          message: 'Success',
          description:
            response[0].message.charAt(0).toUpperCase() +
            response[0].message.slice(1),
          type: 'success',
          icon: 'success',
          backgroundColor: COLORS.success,
          textColor: COLORS.white,
        });
        const userDetail= await storeUserDetail(response[0].user_detail);
      }

      setFalshMessage(true);
      setTimeout(() => {
        setFalshMessage(false);
        response[0].error == true ?
        null : navigation.navigate('Test');
      }, 1000);
    } catch (error) {
      setLoading(false);
      console.log(error);
      // Handle any errors that occurred during the API call
    }
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
            <ChevronLeft  onPress={() => navigation.goBack()} />
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
                Forgot your password?
              </Headline>
              <Text style={[styles.headlineTextStyle,{
                textAlign:'center',
                lineHeight:20,
              }]}>
                Enter your email address below{'\n'} to reset your password
              </Text>
            </MotiView>
            
              <Formik
                initialValues={{
                  email: '',
                 
                }}
                onSubmit={values => {
                  handleLoginEmailAPI(values);
                }}
                validationSchema={validationSchemaByEmail}>
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  handleReset,
                  values,
                  errors,
                }) => (
                  <>
                    <View>
                      <View>
                        <TextInput
                          onChangeText={handleChange('email')}
                          onBlur={handleBlur('email')}
                          value={values.email}
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
                        {errors.email && <ErrorMessages error={errors.email} />}
                        
                      </View>
                    </View>
                    
                    <Button
                      loading={loading}
                      disabled={loading}
                      mode="contained"
                      contentStyle={{
                        paddingVertical: '3%',
                      }}
                      style={{
                        marginVertical: height * 0.03,
                        borderRadius: 50,
                        width: width * 0.8,
                        alignSelf: 'center',
                      }}
                      buttonColor={COLORS.primary}
                      textColor={COLORS.white}
                      textContentType="none"
                      onPress={handleSubmit}>
                      Send OTP
                    </Button>
                  </>
                )}
              </Formik>
          

            

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
