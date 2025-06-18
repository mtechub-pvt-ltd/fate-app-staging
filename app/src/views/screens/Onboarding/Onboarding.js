import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  Animated,
  StyleSheet,
  Image,
  Easing,
  Platform,
  Alert,

} from 'react-native';
import COLORS from '../../../consts/colors';
import Images from '../../../consts/Images';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUserDetail,
  storeUserDetail,
} from '../../../HelperFunctions/AsyncStorage/userDetail';
import GradientBackground from '../../../components/MainContainer/GradientBackground';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import {
  addToken,
  getUserByID
} from '../../../Services/Auth/SignupService';
import messaging from '@react-native-firebase/messaging';



function Onboarding({ route, navigation }) {
  const data = route?.params?.data;
  // notificaiton 
  // const { data, fromNotification } = route?.params;

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;


  const checkLastTokenAddTime = async () => {
    const latestTokenAddTime = await AsyncStorage.getItem('latestTokenAddTime');
    console.log('latestTokenAddTime_______', latestTokenAddTime);
    if (latestTokenAddTime) {
      const currentTime = new Date().getTime();
      const diff = currentTime - parseInt(latestTokenAddTime);
      console.log('diff_______', diff);
      if (diff > 86400000) {
        console.log('diff_______', diff);
        await AsyncStorage.setItem('latestTokenAddTime', new Date().getTime().toString());
        var userDetail = await getUserDetail()
        const data = {
          user_id: userDetail.data.id,
          // new_tokens: 1
          new_tokens: 30
        }
        const res = await addToken(data);
      }
    } else {
      await AsyncStorage.setItem('latestTokenAddTime', new Date().getTime().toString());
      var userDetail = await getUserDetail()
      const data = {
        user_id: userDetail.data.id,
        // new_tokens: 1
        new_tokens: 30
      }
      const res = await addToken(data);
    }
  }



  useEffect(() => {
    const animateGlow = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1.1,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    // Start the logo animation effect
    animateGlow();

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          const { data } = remoteMessage;
          if (data.callType == 'VIDEO') {
            navigation.replace('VideoCallScreen', {
              currentUser: data.receiverId,
              otherUser: data.callerId,
              otherUserName: data.callerName,
              otherUserImage: data.callerImage,
              fromNotification: true,
            });
          } else if (data.callType == 'AUDIO') {
            navigation.replace('VoiceCallScreen', {
              currentUser: data.receiverId,
              otherUser: data.callerId,
              otherUserName: data.callerName,
              otherUserImage: data.callerImage,
              fromNotification: true,
            });
          }
        } else {
          // Set a timeout to navigate after the splash screen animation
          setTimeout(() => {
            // Check user authentication status and navigate accordingly
            (async () => {
              try {
                const userDetail = await getUserDetail();

                if (userDetail?.data != null && userDetail.error == false) {
                  // navigation.replace('OnboardingSlider');

                  if (data) {
                    data.callType == 'VIDEO' ?
                      navigation.replace('VideoCallScreen', {
                        currentUser: data.receiverId,
                        otherUser: data.callerId,
                        fromNotification: true,
                      }) :
                      navigation.replace('VoiceCallScreen', {
                        currentUser: data.receiverId,
                        otherUser: data.callerId,
                        fromNotification: true,
                      });
                  }
                  else {
                    // get user updated detail ;: 
                    const resNew = await getUserByID(userDetail?.data?.id);
                    console.log('res_______', resNew.data);
                    // /update store user detail
                    if (resNew.error == false && resNew?.data?.block_status == false) {
                      const updatedData = {
                        ...userDetail.data,
                        ...resNew.data
                      }
                      const z = await storeUserDetail(updatedData);
                      console.log('z_______', z);


                      // get user latest token add time

                      await checkLastTokenAddTime();


                      // navigation.reset({
                      //   index: 0,
                      //   routes: [{ name: 'MyTabs' }],
                      // });

                      // NEW FLOW

                      navigation.reset({
                        index: 0,
                        routes: [{
                          name: 'NewWaitingListScreen1',
                          params: {
                            fromOnboarding: true,
                          } // Explicitly navigate to Home tab
                        }],
                      });


                    } else {
                      Alert.alert(
                        'Account Blocked',
                        'Your account has been blocked by admin, please contact support for more information',
                        [
                          {
                            text: 'OK',
                            onPress: async () => {
                              await AsyncStorage.clear();
                              navigation.navigate('Login_N');
                            },
                            style: 'cancel',
                          },

                        ],
                        { cancelable: false }
                      );
                    }
                  }

                } else {
                  // User is not logged in
                  // Check if it's the first time app install
                  const isFirstTime = await AsyncStorage.getItem('isFirstTimeInstall');

                  if (isFirstTime === null) {
                    // First time app install - set the flag and navigate to permissions
                    await AsyncStorage.setItem('isFirstTimeInstall', 'false');
                    console.log('First time app install, navigating to permissions');
                    navigation.replace('Onboarding_Permissions');
                  } else {
                    // Not first time - navigate directly to signup
                    console.log('Not first time app install, navigating to signup');
                    navigation.replace('Onboarding_signups');
                  }
                }
              } catch (error) {
                console.error(error);
              }
            })();
          }, 4000);
        }
      });
  }, [opacity, scale]);



  return (
    <GradientBackground>
      <SafeAreaView
        style={{
          flex: .85,
          alignItems: 'center',
          justifyContent: 'center',
        }}>

        <Animated.View
          style={[
            {

              justifyContent: 'center',
              alignItems: 'center',
              opacity: opacity,
              // transform: [{ scale: scale }],
              // position: 'absolute',
              zIndex: 999,
              // backgroundColor: 'red',
            },
          ]}
        >
          <Image
            source={Images.writtenLogo}
            style={{
              width: responsiveWidth(40),
              height: responsiveHeight(6),
              resizeMode: 'contain',
              alignSelf: 'center',
              // position: 'absolute',
              zIndex: 999,
              // marginTop: Platform.OS === 'ios' ? responsiveHeight(10) : null,
            }}
          />

        </Animated.View>

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
  glowingBox: {
    width: 170,
    height: 130,
    backgroundColor: COLORS.secondary,
    borderRadius: 150,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    marginBottom: Platform.OS === 'ios' ? responsiveHeight(2) :
      responsiveHeight(0),
    elevation: Platform.OS === 'ios' ? responsiveHeight(0) : 15,
    zIndex: 1,
  },
});
export default Onboarding;
