import React, {
  useEffect, useState,
} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Animated,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';

import {
  getUserDetail,
} from '../../../../HelperFunctions/AsyncStorage/userDetail';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import TopBar from '../../../../components/TopBar/TopBar';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

function VerificationOTP({ route, navigation }) {
  const { email, otp } = route?.params;
  const CELL_COUNT = 4;
  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  useEffect(() => {
    const av = new Animated.Value(0);
    av.addListener(() => {
      return;
    });

    (async () => {
      var userDetail = await getUserDetail();
      console.log(userDetail);
      // if (userDetail.data == null && userDetail.error == false) {
      //   userDetail.firstInstall == 'true'
      //     ? navigation.replace('Login')
      //     : navigation.navigate('OnboardingSlider');
      // } else {
      //   // go to home screen
      //   navigation.replace('Test');
      // }
    })();
    // setTimeout(() => {
    //   SplashScreen.hide();
    // }, 1000);
  }, []);
  return (
    <GradientBackground>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          alignItems: 'center',
          alignContent: 'center',

        }}>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
          }}
        >
          <TopBar
            onPress={() => {
              navigation.goBack();
            }}
          /></View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
        >
          <View >
            <ScrollView keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
              <Text
                style={{
                  fontSize: responsiveFontSize(3.2),
                  fontWeight: '500',
                  color: COLORS.white,
                  lineHeight: responsiveHeight(6),
                  fontFamily: fonts.PoppinsRegular,
                  marginTop: responsiveHeight(2),
                }}>
                Verification
              </Text>
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  color: COLORS.white,
                  marginVertical: responsiveHeight(1),
                  lineHeight: responsiveHeight(3),
                  textTransform: 'lowercase',
                  width: responsiveWidth(80),
                  fontFamily: fonts.PoppinsRegular,
                  fontWeight: '400',
                }}>
                A 4 digit verification code has been sent to {email}
              </Text>

              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  fontFamily: fonts.PoppinsRegular,
                  fontWeight: '500',
                  marginTop: responsiveHeight(3),
                }}>
                Enter the code
              </Text>
              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.16)',
                  borderColor: 'rgba(255, 255, 255, 0.24)',
                  borderRadius: 20,
                  padding: responsiveHeight(1),
                  borderWidth: responsiveWidth(0.2),
                  marginTop: responsiveHeight(2),
                }}
              >
                <CodeField
                  ref={ref}
                  {...props}
                  // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
                  value={value}
                  onChangeText={setValue}
                  cellCount={CELL_COUNT}
                  rootStyle={styles.codeFieldRoot}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  renderCell={({ index, symbol, isFocused }) => (
                    <View
                      key={index}
                      style={[styles.cellWrapper, isFocused && styles.focusCell]}
                    >
                      <Text
                        style={[styles.cell]}
                        onLayout={getCellOnLayoutHandler(index)}>
                        {symbol || (isFocused ? <Cursor /> : null)}
                      </Text>
                    </View>
                  )}
                />

              </View>
              <TouchableOpacity
                style={{
                  alignSelf: 'center',
                  marginTop: responsiveHeight(3),
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(2),
                    fontFamily: fonts.PoppinsRegular,
                    fontWeight: '500',

                  }}>
                  Resend Code
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  height: responsiveHeight(10),
                }}
              >

              </View>
            </ScrollView>
            <View style={{
              paddingTop: responsiveHeight(2),
              backgroundColor: 'transparent'
            }}>
              <PrimaryButton
                title="Verify"
                onPress={() => {
                  if (value == otp) {
                    navigation.navigate('CreateNewPassword', {
                      email: email
                    });
                  } else {
                    alert('Invalid OTP');
                  }

                }}
                style={{
                  alignSelf: 'center',
                  width: responsiveWidth(90),
                  // marginTop: responsiveHeight(5),

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
  codeFieldRoot: {
    width: responsiveWidth(60),
    alignSelf: 'center',
  },
  cellWrapper: {
    borderColor: 'rgba(255, 255, 255, 0.34)',
    borderWidth: responsiveWidth(.5),
    borderStartWidth: responsiveWidth(0),
    borderEndWidth: responsiveWidth(0),
    borderTopWidth: responsiveWidth(0),
    width: responsiveWidth(12),
    height: responsiveHeight(6),
  },
  cell: {
    lineHeight: responsiveHeight(5.5),
    fontSize: responsiveFontSize(3),
    textAlign: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    fontFamily: fonts.PoppinsMedium,
    color: COLORS.white,
  },
  focusCell: {
    borderColor: COLORS.secondary2,
  },
});
export default VerificationOTP;
