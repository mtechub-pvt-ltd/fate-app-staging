import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Animated,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Platform,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import COLORS from '../../../consts/colors';
import Images from '../../../consts/Images';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserDetail, storeUserDetail } from '../../../HelperFunctions/AsyncStorage/userDetail';
import GradientBackground from '../../../components/MainContainer/GradientBackground';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import fonts from '../../../consts/fonts';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { height, width } from '../../../consts/Dimension';
import PrimaryButton from '../../../components/Button/PrimaryButton';
import TopBar from '../../../components/TopBar/TopBar';

function Onboarding_Continue({ navigation }) {
  useEffect(() => {
    const av = new Animated.Value(0);
    av.addListener(() => {
      return;
    });

    (async () => {
      var userDetail = await getUserDetail();
      console.log('userDetail', userDetail);
      if (userDetail?.data != null && userDetail.error == false) {
        // navigation.navigate('OnboardingSlider');
        navigation.replace('MyTabs');
      }
    })();
    // setTimeout(() => {
    //   SplashScreen.hide();
    // }, 1000);
  }, []);
  return (
    // <SafeAreaView
    //   style={{
    //     flex: 1,
    //     alignItems: 'center',
    //   }}>
    //   <Text
    //     style={{
    //       fontSize: responsiveFontSize(5),
    //       fontWeight: 'bold',
    //       color: COLORS.white,
    //       textAlign: 'center',
    //       lineHeight: responsiveHeight(6),
    //       fontFamily: fonts.JostBlack,
    //       marginTop: responsiveHeight(10),
    //     }}>
    //     The future of meaningfuls
    //   </Text>
    //   <Image
    //     source={Images.Onboarding_Continue}
    //     style={{
    //       width: responsiveWidth(50),
    //       height: responsiveHeight(5),
    //       resizeMode: 'contain',
    //       alignSelf: 'center',
    //       marginTop: responsiveHeight(1),
    //     }}
    //   />
    //   <Image
    //     source={Images.Applogo}
    //     style={{
    //       width: responsiveWidth(45),
    //       height: responsiveHeight(12),
    //       resizeMode: 'contain',
    //       alignSelf: 'center',
    //       marginTop: responsiveHeight(1),
    //     }}
    //   />
    //   <Image
    //     source={Images.writtenLogo}
    //     style={{
    //       width: responsiveWidth(40),
    //       height: responsiveHeight(6),
    //       resizeMode: 'contain',
    //       alignSelf: 'center',
    //       marginTop: responsiveHeight(4),
    //     }}
    //   />
    //   <Text
    //     style={{
    //       fontSize: responsiveFontSize(2.5),
    //       color: COLORS.white,
    //       textAlign: 'center',
    //       lineHeight: responsiveHeight(6),
    //       marginVertical: responsiveHeight(4),
    //     }}>
    //     Stop swiping, start typing
    //   </Text>
    //   <TouchableOpacity
    //     onPress={() => navigation.navigate('SignUp_N')}
    //     activeOpacity={0.6}
    //     style={{
    //       justifyContent: 'space-between',
    //       alignItems: 'center',
    //       flexDirection: 'row',
    //       backgroundColor: '#A90074',
    //       width: responsiveWidth(80),
    //       borderRadius: responsiveWidth(50),
    //       padding: responsiveWidth(2),
    //     }}>
    //     <View
    //       style={{
    //         backgroundColor: COLORS.primary,
    //         borderRadius: 50,
    //         justifyContent: 'center',
    //         alignItems: 'center',
    //         padding: 10,
    //         width: responsiveWidth(10.5),
    //         height: responsiveHeight(5),
    //       }}>
    //       <Icon
    //         name="heart"
    //         size={responsiveFontSize(2.5)}
    //         color={COLORS.white}
    //       />
    //     </View>
    //     <Text
    //       style={{
    //         fontSize: responsiveFontSize(2.5),
    //         color: COLORS.white,
    //         fontFamily: fonts.JostMedium,
    //         textAlign: 'center',
    //         lineHeight: responsiveHeight(6),
    //       }}>
    //       Get Started
    //     </Text>
    //     <Text
    //       style={{
    //         fontSize: responsiveFontSize(2.5),
    //         color: COLORS.secondary,
    //         fontFamily: fonts.JostMedium,
    //         textAlign: 'center',
    //         lineHeight: responsiveHeight(6),
    //       }}>
    //       Get S
    //     </Text>
    //   </TouchableOpacity>
    //   <View
    //     style={{
    //       flexDirection: 'row',
    //       marginTop: responsiveHeight(2),
    //       alignItems: 'center',
    //       justifyContent: 'center',
    //     }}>
    //     <Text
    //       style={{
    //         fontSize: responsiveFontSize(2),
    //       }}>
    //       Already have an account?
    //     </Text>
    //     <TouchableOpacity
    //       onPress={() => navigation.navigate('Login')}
    //       style={{
    //         padding: 10,
    //         marginLeft: responsiveWidth(1),
    //         fontFamily: fonts.JostMedium,
    //         fontSize: responsiveFontSize(4),
    //       }}>
    //       <Text
    //         style={{
    //           color: COLORS.white,
    //           fontFamily: fonts.JostMedium,
    //           fontSize: responsiveFontSize(2),
    //         }}>
    //         Sign In
    //       </Text>
    //     </TouchableOpacity>
    //   </View>
    // </SafeAreaView>
    <ImageBackground
      source={Images.Onboarding_Continue}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        resizeMode: 'cover',
        padding: 10,
        width: width,
        height: height,
      }}>
      <TopBar />
      <Text
        style={{
          fontSize: responsiveFontSize(3),
          fontWeight: 'bold',
          color: COLORS.white,
          textAlign: 'center',
          lineHeight: responsiveHeight(4),
          fontFamily: fonts.JostBlack,
          marginTop: responsiveHeight(0),
        }}>
        We'd love to get to {'\n'}know you better
      </Text>
      <Text
        style={{
          fontSize: responsiveFontSize(2),
          color: COLORS.white,
          textAlign: 'center',
          lineHeight: responsiveHeight(2.3),
          fontFamily: fonts.JostRegular,
          marginTop: responsiveHeight(3),
          width: responsiveWidth(70),
        }}>
        Your information will helps us match you with like-minded individuals and create meaningful connections.
      </Text>

      <PrimaryButton
        style={{
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 50 : 20,
        }}
        title="Continue"
        onPress={() => navigation.navigate('SignUp_N')}
      />
    </ImageBackground>
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
export default Onboarding_Continue;
