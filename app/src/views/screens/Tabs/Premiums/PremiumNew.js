import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import Images from '../../../../consts/Images';
import { getUserDetail, storeUserDetail, getRulletCountToday, storeRulletCountToday } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import { Text } from 'react-native-paper';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions';
import COLORS from '../../../../consts/colors';
import SecondaryButton from '../../../../components/Button/SecondaryButton';
import {
  findUserInWaitingPool,
  addUserInWaitingPool,
  getFateRulletUsersMatchFromWaitingPool,
  deleteToken,
} from '../../../../Services/Auth/SignupService';
import { ScrollView } from 'react-native-gesture-handler';
import fonts from '../../../../consts/fonts';
import { useIsFocused } from '@react-navigation/native';
import { node_base_url } from '../../../../consts/baseUrls';
import io from 'socket.io-client';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';


const { width, height } = Dimensions.get('window');
const squareSize = width * 0.90; // Adjust the size of the square box
const radius = squareSize * 0.35; // Adjust radius based on the square size
const spotlightRadius = 50; // Adjust based on the spotlight image

const images = [
  { data: Images.user_img_1 },
  { data: Images.user_img_2 },
  { data: Images.user_img_3 },
  { data: Images.user_img_4 },
  { data: Images.user_img_5 },
  { data: Images.user_img_6 },
  { data: Images.user_img_7 },
  { data: Images.user_img_8 },
  { data: Images.user_img_9 },
  { data: Images.user_img_10 },
];

const CircularImageSpotlight = ({ route, navigation }) => {
  const isFocused = useIsFocused();
  const rotation = useSharedValue(0);
  const hasStarted = useRef(false); // Prevent restarting animation
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalAllowedRullet, setTotalAllowedRullet] = useState(0);
  const [socket, setSocket] = useState(null);
  const [userInWaitingPool, setUserInWaitingPool] = useState(null);

  // message state
  const [falshMessage, setFalshMessage] = useState(false);
  const [falshMessageData, setFalshMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
  });

  useEffect(() => {
    // Start the animation once when the component mounts
    rotation.value = withRepeat(
      withTiming(2 * Math.PI, {
        duration: 5000, // 10 seconds for a full rotation
        easing: Easing.linear,
      }),
      -1, // Repeat infinitely
      false // Do not reverse the animation
    );
  }, []);


  useEffect(() => {
    if (isFocused && route.name === 'PremiumNew') {


      setTimeout(() => {
        getUserDetail().then((userDetail) => {
          setUserDetail(userDetail);
          // handleAddUserInWaitingPool(userDetail);
        })
      }, 1000);


      const newSocket = io(node_base_url)
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        // Emit any initial events here if necessary
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };

    }


  }, [isFocused, route.name]);

  const handleUsersMatchFromWaitingPool = async () => {
    setLoading(true);
    const data = {
      user_id: userDetail?.data?.id,
    };
    console.log('Data for getFateRulletUsersMatchFromWaitingPool', userDetail?.data?.id);
    try {
      const response = await getFateRulletUsersMatchFromWaitingPool(data);
      // console.log('Response from getFateRulletUsersMatchFromWaitingPool', response);

      // deleteToken();
      if (response.error === true) {
        // put _ in msg and capitilzie it
        const x = response.msg.replace(/\s+/g, '_').toUpperCase();

        if (x === 'NO_SUITABLE_MATCHES_FOUND.') {
          setUserInWaitingPool(true);
          setFalshMessageData({
            message: 'No Suitable Matches Found',
            description: `you are add in waiting pool,${'\n'}keep this screen open for pair with someone`,
            type: 'info',
            icon: 'info',
            backgroundColor: COLORS.red,
            textColor: COLORS.white,
          });
          setFalshMessage(true);
          setTimeout(() => {
            setFalshMessage(false);
          }, 5000);
        }

      } else {
        const res = await deleteToken({
          user_id: userDetail?.data?.id,
          new_tokens: 1
        });
        // Navigate to the call screen with the matched user’s data
        navigation.navigate('RulletVoiceCallScreen', {
          currentUser: userDetail?.data?.id,
          otherUser: response?.matchedUser?.id,
          otherUserName: response?.matchedUser?.name,
          otherUserImage: response?.matchedUser?.profile_image,
          fromNotification: false,
        });
      }


    }
    catch (error) {
      console.log('Error in handleUsersMatchFromWaitingPool', error);
    }
    finally {
      setLoading(false);
    }
  }


  // soxket init 
  useEffect(() => {
    const newSocket = io(node_base_url);
    setSocket(newSocket);

    // Fetch user details on mount
    getUserDetail().then((x) => {
      setUserDetail(x);
    });

    // Disconnect socket on unmount
    return () => {
      if (socket && userDetail) {
        socket.emit('leaveRulletWaitingPool', userDetail?.data?.id); // Leave pool on unmount
        newSocket.disconnect();
      }
    };
  }, []);

  // listen for match found
  useEffect(() => {
    if (socket) {
      socket.on('matchFound', (data) => {
        console.log('Match found for calls:', data);
        setLoading(false);

        // navigation.navigate('FateRulletVoiceCallScreen', {
        //   currentUser: userDetail?.data?.id,
        //   otherUser: data.match.id,
        //   otherUserName: data.match.id?.name,
        //   otherUserImage: data.match.id?.profile_image,
        //   fromNotification: false,
        // });

        // Navigate to the call screen with the matched user’s data
        // navigation.navigate('RulletCalling', { matchedUser: data.match });
      });
    }

    return () => {
      if (socket) {
        setLoading(false);
        socket.off('matchFound');
      }
    };
  }, [socket]);



  useEffect(() => {
    if (isFocused && userDetail && socket) {
      setUserInWaitingPool(false);
      socket.emit('joinRulletWaitingPool', userDetail?.data?.id); // Re-emit join when screen regains focus
      console.log('Joining pool', userDetail?.data?.id);
      setLoading(false);
    } else if (!isFocused && socket && userDetail) {
      setLoading(false);
      socket.emit('leaveRulletWaitingPool', userDetail?.data?.id); // Emit leave on losing focus
    }
  }, [isFocused, userDetail, socket]);

  return (
    <GradientBackground>
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}
      <ScrollView>
        <SafeAreaView
          style={styles.container}>
          <Text
            style={{
              fontSize: responsiveWidth(7),
              fontWeight: '600',
              color: 'white',
              marginBottom: 30,
              fontFamily: fonts.PoppinsMedium,
              marginTop: responsiveWidth(10),

            }}
          >
            Fate Roulette
          </Text>
          {/* Square Box Container */}
          <View style={styles.squareBox}>
            {/* Central Image */}
            <Image
              source={{ uri: userDetail?.data?.profile_image }}
              style={styles.centralImage}
            />

            {/* Circular Images */}
            {/* {images.map((image, index) => {
              const angle = (index / images.length) * 2 * Math.PI;
              const x = radius * Math.cos(angle);
              const y = radius * Math.sin(angle);

              return (
                <Image
                  key={index}
                  source={image.require}
                  style={[
                    styles.image,
                    {
                      left: squareSize / 2 + x - spotlightRadius,
                      top: squareSize / 2 + y - spotlightRadius,
                    },
                  ]}
                />
              );
            })} */}

            {images.map((image, index) => {
              const angle = (index / images.length) * 2 * Math.PI; // Calculate position
              const x = radius * Math.cos(angle);
              const y = radius * Math.sin(angle);

              return (
                <Image
                  key={index}
                  source={image.data}
                  style={[
                    styles.orbitingImage,
                    {
                      position: 'absolute',
                      left: squareSize / 2 + x - 25, // Adjust to center image
                      top: squareSize / 2 + y - 25, // Adjust to center image
                    },
                  ]}
                />
              );
            })}
            {/* Animated Spotlight */}
            <Animated.Image
              source={Images.spotlight} // Spotlight image
              imageStyle={{
                backgroundColor: 'red',
              }}
              style={[
                styles.spotlightImage,
                useAnimatedStyle(() => {
                  return {
                    transform: [
                      { rotate: `${(rotation.value * 180) / Math.PI}deg` }, // Rotate smoothly
                    ],
                  };
                }),
              ]}
            />

          </View>
          <Text
            style={{
              fontSize: responsiveFontSize(1.8),
              color: 'white',
              marginVertical: 30,
              width: '90%',
              textAlign: 'center',
              fontFamily: fonts.PoppinsRegular,
            }}
          >
            Let us find you a caller for 10 minutes. If you don't like them, swap for the next caller and end the call to disqualify someone.
          </Text>

          <View
            style={{
              height: responsiveWidth(10),
            }} />
        </SafeAreaView>
      </ScrollView>
      <View
        style={{
          marginBottom: responsiveWidth(25),
          paddingTop: responsiveWidth(2),
        }}
      >
        {
          !userInWaitingPool && (
            <PrimaryButton
              loading={loading}
              // title={`I am Ready ${userDetail?.data?.id}`}
              title={`I am Ready`}
              onPress={() => {
                // navigation.navigate('RulletCalling')
                handleUsersMatchFromWaitingPool();
              }}
              style={{
                // marginTop: responsiveHeight(5),
                alignSelf: 'center',
                width: responsiveWidth(80),
                backgroundColor: COLORS.white,
                padding: 0,
              }}
              textColor={COLORS.primary}
            />
          )
        }
        {
          userInWaitingPool && (
            <View
              style={{
                paddingVertical: responsiveWidth(2),
                backgroundColor: COLORS.secondary2,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  fontSize: responsiveWidth(5),
                  fontWeight: '600',
                  color: 'white',
                  fontFamily: fonts.PoppinsMedium,
                  alignSelf: 'center',

                }}
              >
                Waiting for a match ...
              </Text>
              <Text
                style={{
                  fontWeight: '600',
                  color: 'white',
                  fontFamily: fonts.PoppinsMedium,
                  alignSelf: 'center',

                }}
              >
                Keep this screen open to pair with someone
              </Text>
            </View>
          )
        }




      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center the content vertically
    alignItems: 'center', // Center the content horizontally
  },
  squareBox: {
    width: squareSize, // Set the width and height of the square box
    height: squareSize,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent white
    position: 'relative', // Needed for absolute positioning of the images
    justifyContent: 'center', // Center the content within the square
    alignItems: 'center',
    borderRadius: 400,
    overflow: 'hidden', // Clip the images to the circle
  },
  centralImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
    position: 'absolute',
    zIndex: 1,
    borderWidth: 2,
    borderColor: 'white',
  },

  orbitingImage: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: 'white',
  },
  spotlight: {
    position: 'absolute',
    width: squareSize * 0.7,
    height: squareSize * 0.2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent white spotlight
    borderTopLeftRadius: 100,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 0,
    zIndex: 1, // Below the central image
    transformOrigin: 'left bottom', // Rotate around the bottom center
  },
  spotlightImage: {
    width: squareSize * 0.7, // Adjust spotlight size
    height: squareSize * 1.8,
    // backgroundColor: 'red',
    position: 'absolute',
    // zIndex: ,
    resizeMode: 'contain',
    transform: [{ rotate: '0deg' }], // Initial rotation
    padding: responsiveWidth(30),
  },
});

export default CircularImageSpotlight;
