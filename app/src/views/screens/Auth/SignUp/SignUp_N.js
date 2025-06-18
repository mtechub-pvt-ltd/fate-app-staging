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
  Linking
} from 'react-native';
import { storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import Header from '../../../../components/TopBar/Header';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import { registerByEmail, checkUserExists } from '../../../../Services/Auth/SignupService';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { Check, Eye, EyeSlash } from 'phosphor-react-native';
import {
  setEmailAndPassword, setStep,
} from '../../../../redux/features/form/formSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Checkbox } from 'react-native-paper';
import BouncyCheckbox from "react-native-bouncy-checkbox";




function SignUp_N({ route, navigation }) {
  const { signupBy } = route?.params;
  const { email: reduxEmail, password: reduxPassword,
    type: reduxType
  } = useSelector((state) => state.form);

  const [email, setEmail] = useState(reduxEmail || '');
  const [password, setPassword] = useState(reduxPassword || '');
  const [showPassword, setShowPassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState(reduxPassword || '');
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [isChecked, setIsChecked] = useState(false);

  const [loading, setLoading] = useState(false);
  // message state
  const [flashMessage, setFlashMessage] = useState(false);
  const [flashMessageData, setFlashMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
    backgroundColor: COLORS.red, // Default background color
    textColor: COLORS.white, // Default text color
  });

  const dispatch = useDispatch();

  const handleNext = async () => {
    setLoading(true);
    try {
      if (email.length == 0 || password.length == 0 || confirmPassword.length == 0) {
        setFlashMessageData({
          message: 'Error',
          description: 'Please fill all the fields',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => {
          setFlashMessage(false);
        }, 3000);
        return;
      } else if (!validateEmail(email)) {
        setFlashMessageData({
          message: 'Error',
          description: 'Please enter a valid email',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => {
          setFlashMessage(false);
        }, 3000);
        return;
      } else if (!validateStrongPassword(password)) {
        setFlashMessageData({
          message: 'Error',
          description:
            'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => {
          setFlashMessage(false);
        }, 3000);
      } else if (password != confirmPassword) {
        setFlashMessageData({
          message: 'Error',
          description: 'Please enter the same password',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => {
          setFlashMessage(false);
        }, 3000);
        return;
      } else if (!isChecked) {
        setFlashMessageData({
          message: 'Error',
          description: 'Please agree to the terms and conditions',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => {
          setFlashMessage(false);
        }, 3000);
        return;
      } else {
        const data = {
          email: email,
        };
        const response = await checkUserExists(data);


        if (response?.exists == false) {


          Promise.all([
            dispatch(setEmailAndPassword({ email, password })),
            dispatch(setStep(2)) // Move to step 2
          ]).then(() => {
            navigation.navigate('BasicProfileInfo');
          }
          );
        } else {
          setFlashMessageData({
            message: 'Error',
            description: 'User already exists',
            type: 'info',
            icon: 'info',
            backgroundColor: COLORS.red,
            textColor: COLORS.white,
          });
          setFlashMessage(true);

          setTimeout(() => {
            setFlashMessage(false);
            setLoading(false);
          }, 3000);
        }


      }
    }
    catch (error) {
      console.log(error);
    }
    finally {
      setLoading(false);
    }

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
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('userInfo>>>>>>>>>>>>>>', userInfo?.user.email);

      // Check if user exists first
      const data = { email: userInfo?.user.email };
      const response = await checkUserExists(data);
      console.log('Google Sign-In Response:', response);

      if (!response?.exists) {
        // Update Redux state
        await Promise.all([
          dispatch(setEmailAndPassword({ email: userInfo?.user.email, password: 'Mtechub@123' })),
          dispatch(setStep(2))
        ]);

        await handleRegisterEmailAPI(userInfo?.user.email, 'Mtechub@123', 'GOOGLE');
      } else {
        // Show error message for existing user
        setFlashMessageData({
          message: 'Error',
          description: 'User already exists. Please sign in instead.',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => {
          setFlashMessage(false);
        }, 3000);
      }

    } catch (error) {
      console.log('Google Sign-In Error:', error);
      if (error.code) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('SIGN_IN_CANCELLED', error);
            break;
          case statusCodes.IN_PROGRESS:
            console.log('IN_PROGRESS', error);
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log('PLAY_SERVICES_NOT_AVAILABLE', error);
            setFlashMessageData({
              message: 'Error',
              description: 'Google Play Services is not available or outdated',
              type: 'info',
              icon: 'info',
              backgroundColor: COLORS.red,
              textColor: COLORS.white,
            });
            setFlashMessage(true);
            setTimeout(() => {
              setFlashMessage(false);
            }, 3000);
            break;
          default:
            setFlashMessageData({
              message: 'Error',
              description: 'Google Sign-In failed. Please try again.',
              type: 'info',
              icon: 'info',
              backgroundColor: COLORS.red,
              textColor: COLORS.white,
            });
            setFlashMessage(true);
            setTimeout(() => {
              setFlashMessage(false);
            }, 3000);
        }
      } else {
        setFlashMessageData({
          message: 'Error',
          description: 'Google Sign-In failed. Please try again.',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => {
          setFlashMessage(false);
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      console.log('Starting Apple Sign-In flow...');

      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      console.log('Apple Sign-In Response:', appleAuthRequestResponse);

      const { identityToken, email, fullName, user } = appleAuthRequestResponse;

      if (!identityToken) {
        throw new Error('No identity token received');
      }

      // Try to get email from token
      let userEmail = email;
      if (!userEmail && identityToken) {
        try {
          const decoded = jwtDecode(identityToken);
          userEmail = decoded.email;
          console.log('Got email from token:', userEmail);
        } catch (e) {
          console.log('Failed to decode token:', e);
        }
      }

      // Fallback to user ID if still no email
      if (!userEmail) {
        userEmail = `${user}@privaterelay.appleid.com`;
        console.log('Using fallback email:', userEmail);
      }

      const defaultPassword = 'Mtechub@123';
      const name = fullName ?
        `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() :
        user;

      // Check if user exists
      const checkResponse = await checkUserExists({ email: userEmail });
      console.log('Check user response:', checkResponse);

      if (!checkResponse?.exists) {
        console.log('User does not exist, proceeding with registration');
        // Update Redux state
        await Promise.all([
          dispatch(setEmailAndPassword({ email: userEmail, password: defaultPassword })),
          dispatch(setStep(2))
        ]);

        // Register user
        const registerData = {
          email: userEmail,
          password: defaultPassword,
          type: 'APPLE'
        };

        const response = await registerByEmail(registerData);
        console.log('Register response:', response);

        if (!response.error) {
          const userDetail = await storeUserDetail(response.data);
          if (userDetail) {
            console.log('Navigating to BasicProfileInfo');
            navigation.navigate('BasicProfileInfo', { name });
          }
        } else {
          throw new Error(response.msg || 'Registration failed');
        }
      } else {
        throw new Error('User already exists. Please sign in instead.');
      }
    } catch (error) {
      console.log('Apple Sign-In Error:', error);
      setFlashMessageData({
        message: 'Error',
        description: error.message || 'Apple Sign-In failed. Please try again.',
        type: 'info',
        icon: 'info',
        backgroundColor: COLORS.red,
        textColor: COLORS.white,
      });
      setFlashMessage(true);
      setTimeout(() => {
        setFlashMessage(false);
      }, 3000);
    } finally {
      setLoading(false);
      console.log('Apple Sign-In flow completed');
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
          setFlashMessageData({
            message: 'Error',
            description: response.msg,
            type: 'info',
            icon: 'info',
            backgroundColor: COLORS.red,
            textColor: COLORS.white,
          });
        } else {
          setFlashMessageData({
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
        setFlashMessage(true);
        setLoading(false);
        setTimeout(() => {
          setFlashMessage(false);
        }, 3000);
      } catch (error) {
        console.log(error);
      }
    } else {
      if (email.length == 0 || password.length == 0 || confirmPassword.length == 0) {
        setFlashMessageData({
          message: 'Error',
          description: 'Please fill all the fields',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => {
          setFlashMessage(false);
        }, 3000);
        return;
      } else if (!validateEmail(email)) {
        setFlashMessageData({
          message: 'Error',
          description: 'Please enter a valid email',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => {
          setFlashMessage(false);
        }, 3000);
        return;
      } else if (!validateStrongPassword(password)) {
        setFlashMessageData({
          message: 'Error',
          description:
            'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => {
          setFlashMessage(false);
        }, 3000);
      } else if (password != confirmPassword) {
        setFlashMessageData({
          message: 'Error',
          description: 'Please enter the same password',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => {
          setFlashMessage(false);
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
            setFlashMessageData({
              message: 'Error',
              description: response.msg,
              type: 'info',
              icon: 'info',
              backgroundColor: COLORS.red,
              textColor: COLORS.white,
            });
          } else {
            setFlashMessageData({
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
          setFlashMessage(true);
          setLoading(false);
          setTimeout(() => {
            setFlashMessage(false);
          }, 3000);
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  useEffect(() => {
    if (signupBy) {
      if (signupBy === 'GOOGLE') {
        googleSignIn()
      } else if (signupBy === 'APPLE') {
        handleAppleSignIn();
      }
    }
  }, []);

  return (
    <GradientBackground>
      {flashMessage && <FlashMessages flashMessageData={flashMessageData} />}
      <SafeAreaView style={{
        flex: 1,

      }}>
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
                  flexDirection: 'row',
                  marginVertical: responsiveHeight(3),
                  // alignItems: 'center',
                  // justifyContent: 'flex-start',
                }}
              >


                <BouncyCheckbox
                  size={25}
                  fillColor={COLORS.secondary2}
                  unFillColor={COLORS.white}
                  iconStyle={{ borderColor: COLORS.white }}
                  innerIconStyle={{ borderWidth: 1 }}
                  textStyle={{ fontFamily: "JosefinSans-Regular" }}
                  onPress={() => {
                    setIsChecked(!isChecked);
                  }}
                  isChecked={isChecked}
                  style={{
                    marginTop: -2
                  }}
                />
                <View
                  style={{
                    flexDirection: 'row',

                  }}
                >

                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: responsiveFontSize(2),
                      marginLeft: responsiveWidth(1),
                      fontFamily: 'Poppins-Regular',

                    }}
                  >I agree to the</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Linking.openURL('https://app.termly.io/policy-viewer/policy.html?policyUUID=c2e278c8-25b0-4471-a8b3-729b7ae93f19');
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
                        fontSize: responsiveFontSize(2),
                        fontFamily: 'Poppins-Regular',
                        fontWeight: '600',

                      }}
                    >Terms and Conditions</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(2),
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  emptyCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 4,
  },
  termsText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(1.8),
    fontFamily: fonts.MONTSERRAT_REGULAR,
  },
});

export default SignUp_N;