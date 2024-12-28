import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { ErrorMessage, Formik } from 'formik';
import { TextInput, Button, Headline, Text } from 'react-native-paper';
import COLORS from '../../../../consts/colors';
import { width, height } from '../../../../consts/Dimension';
import * as Yup from 'yup';
import MainContainer from '../../../../components/MainContainer/MainContainer';
import { Image, MotiView } from 'moti';
import Images from '../../../../consts/Images';
import {
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import AppLogo from '../../../../components/AppLogo/AppLogo';
import Icon from 'react-native-vector-icons/FontAwesome5';
import ErrorMessages from '../../../../components/ErrorMessages/ErrorMessages';
import ChevronLeft from '../../../../components/ChevronLeft/ChevronLeft';
import { base_url, image_url } from '../../../../consts/baseUrls';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

import { registerByPhoneNo } from '../../../../Services/Auth/SignupService';
import { storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';

export default function SignUp({ route, navigation }) {
  const { data, navigatedFrom } = route.params;

  //otp states
  const CELL_COUNT = 6;
  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

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

  const handleRegisterPhoneAPI = async () => {
    setLoading(true);
    const datas = {
      phono_code: data.phone_code,
      phone_no: data.phone_no,
    };
    try {
      const response = await registerByPhoneNo(datas);
      setLoading(false);
      if (response[0].error == false) {
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
      }
      // else {
      //   setFalshMessageData({
      //     message: 'Error',
      //     description:
      //       response[0].message.charAt(0).toUpperCase() +
      //       response[0].message.slice(1),
      //     type: 'info',
      //     icon: 'info',
      //     backgroundColor: COLORS.red,
      //     textColor: COLORS.white,
      //   });
      // }

      setFalshMessage(true);

      setCode('');
      setLoading(false);
      if (navigatedFrom == 'SignUp' || navigatedFrom == 'Login') {
        storeUserDetail(response[0].user_detail);
        setTimeout(() => {
          setFalshMessage(false);
          navigation.replace('Test');
        }, 500);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      // Handle any errors that occurred during the API call
    }
  };

  // firebase call
  const [confirm, setConfirm] = useState(null);
  // verification code (OTP - One-Time-Passcode)
  const [code, setCode] = useState('');
  // Handle login
  function onAuthStateChanged(user) {
    if (user) {
      // Some Android devices can automatically process the verification code (OTP) message, and the user would NOT need to enter the code.
      // Actually, if he/she tries to enter it, he/she will get an error message because the code was already used in the background.
      // In this function, make sure you hide the component(s) for entering the code and/or navigate away from this screen.
      // It is also recommended to display a message to the user informing him/her that he/she has successfully logged in.
    }
  }

  async function signInWithPhoneNumber(phoneNumber) {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
    } catch (error) {
      console.log('Invalid phone number.', error);
    }
  }

  useEffect(() => {
    if (data != null && data != undefined) {
      var phoneVal = '+' + data.phone_code + data.phone_no;
      console.log(phoneVal);
      signInWithPhoneNumber(phoneVal);
    }

    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
      }}>
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {falshMessage && (
            <FlashMessages falshMessageData={falshMessageData} />
          )}

          <MainContainer>
            <ChevronLeft onPress={() => navigation.goBack()} />
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
                Verify your account
              </Headline>
              <Text
                style={[
                  styles.headlineTextStyle,
                  {
                    textAlign: 'center',
                    lineHeight: 20,
                  },
                ]}>
                Please Enter your Verification Code{'\n'}
                You have received on your Phone No.{'\n\n'}
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: COLORS.secondary,
                    paddingTop: '12%',
                    fontSize: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}>
                  {data != null && data != undefined
                    ? '+' + data.phone_code + data.phone_no
                    : null}
                </Text>
              </Text>
            </MotiView>
            <>
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  backgroundColor: COLORS.white,
                }}>
                <CodeField
                  ref={ref}
                  {...props}
                  // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
                  value={code}
                  onChangeText={setCode}
                  cellCount={CELL_COUNT}
                  rootStyle={styles.codeFieldRoot}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  renderCell={({ index, symbol, isFocused }) => (
                    <Text
                      key={index}
                      style={[styles.cell, isFocused && styles.focusCell]}
                      onLayout={getCellOnLayoutHandler(index)}>
                      {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>
                  )}
                />
              </View>

              <Button
                loading={loading}
                disabled={loading}
                mode="contained"
                contentStyle={{
                  paddingVertical: '4%',
                }}
                style={{
                  marginVertical: height * 0.05,
                  borderRadius: 50,
                  width: width * 0.8,
                  alignSelf: 'center',
                }}
                buttonColor={COLORS.primary}
                textColor={COLORS.white}
                textContentType="none"
                onPress={() => {
                  if (code.length == 6) {
                    confirmCode();
                  } else {
                    setFalshMessageData({
                      message: 'Error',
                      description: 'Invalid Verification Code',
                      type: 'info',
                      icon: 'info',
                      backgroundColor: COLORS.red,
                      textColor: COLORS.white,
                    });
                    setFalshMessage(true);
                    setTimeout(() => {
                      setFalshMessage(false);
                    }, 1000);
                  }
                }}>
                Verify
              </Button>
            </>
          </MainContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  AppLogoImageStyle: {
    alignSelf: 'center',
    marginTop: '15%',
    marginBottom: '10%',
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
  root: {
    flex: 1,
    padding: 10,
  },
  title: { textAlign: 'center', fontSize: 30 },
  codeFieldRoot: {
    marginTop: 10,
  },
  cell: {
    width: width * 0.12,
    height: height * 0.07,
    lineHeight: height * 0.065,
    fontSize: 30,
    borderWidth: 2,
    borderColor: '#00000030',
    textAlign: 'center',
    borderRadius: 10,
    marginHorizontal: '1.5%',
    color: COLORS.greylight,
  },
  focusCell: {
    borderColor: COLORS.secondary,
  },
});
