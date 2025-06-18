import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming, withRepeat } from 'react-native-reanimated';
import Images from '../../../../consts/Images';
import { getUserDetail, getRulletCountToday, storeRulletCountToday } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import { Text } from 'react-native-paper';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import { responsiveWidth } from 'react-native-responsive-dimensions';
import COLORS from '../../../../consts/colors';
import {
  findUserInWaitingPool,
  addUserInWaitingPool,
} from '../../../../Services/Auth/SignupService';
import { ScrollView } from 'react-native-gesture-handler';
import fonts from '../../../../consts/fonts';
import { useIsFocused } from '@react-navigation/native';


const { width, height } = Dimensions.get('window');
const squareSize = width * 0.90; // Adjust the size of the square box
const radius = squareSize * 0.35; // Adjust radius based on the square size
const spotlightRadius = 40; // Adjust based on the spotlight image

const images = [
  { require: Images.user_img_1 },
  { require: Images.user_img_2 },
  { require: Images.user_img_3 },
  { require: Images.user_img_4 },
  { require: Images.user_img_5 },
  { require: Images.user_img_6 },
  { require: Images.user_img_7 },
  { require: Images.user_img_8 },
  { require: Images.user_img_9 },
  { require: Images.user_img_10 },
];

const CircularImageSpotlight = ({ route, navigation }) => {
  const isFocused = useIsFocused();
  const rotation = useSharedValue(0);
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalAllowedRullet, setTotalAllowedRullet] = useState(0);


  const getfindUserInWaitingPool = async () => {
    setLoading(true);
    try {
      // Check user subscription type 
      const subscriptionType = userDetail?.data?.subscription_type;
      console.log('subscriptionType', subscriptionType);
      let allowedRulletCount = 0;  // Local variable for current count

      // Determine allowed rullet count based on subscription
      if (subscriptionType === 'free' || subscriptionType === 'FREE') {
        alert('Please subscribe to use this feature');
        setTotalAllowedRullet(0);
        setLoading(false);  // Stop loading if free user
        return;  // Exit early
      } else if (subscriptionType === 'silvermonthly12345_new') {
        allowedRulletCount = 20;
      } else if (subscriptionType === 'goldmonthly12345_new') {
        allowedRulletCount = 50;
      } else if (subscriptionType === 'platinummonthly12345_new') {
        allowedRulletCount = 10;
      }

      setTotalAllowedRullet(allowedRulletCount);  // Update state with allowed rullet count

      const today = new Date();
      const formattedToday = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

      // Fetch today's rullet count from AsyncStorage
      const rulletCount = await getRulletCountToday();
      console.log('rulletCount', rulletCount);

      // If user has roulettes left for the day
      if (
        (rulletCount?.data?.date === formattedToday || rulletCount?.data == null)
        &&
        (rulletCount?.data?.count < allowedRulletCount || rulletCount?.data == null)
      ) {
        // Proceed with waiting pool and update the rullet count
        const data = {
          user_id: userDetail?.data?.id,
        };

        const response = await findUserInWaitingPool(data);
        console.log('response fate Ruller', `${response?.otherUserResult?.id} ${response?.otherUserResult?.name} ${response?.otherUserResult?.profile_image}`);

        // Store the updated rullet count
        await storeRulletCountToday({
          date: formattedToday,
          count: rulletCount?.data?.count + 1,  // Increment the count
        });

        // Navigate to the voice call screen
        navigation.navigate('FateRulletVoiceCallScreen', {
          currentUser: userDetail?.data?.id,
          otherUser: response?.otherUserResult?.id,
          otherUserName: response?.otherUserResult?.name,
          otherUserImage: response?.otherUserResult?.profile_image,
        });
      }
      // If it's a new day, reset the rullet count
      else if (new Date(rulletCount?.data?.date) < new Date(today)) {
        // Reset the rullet count for the new day
        await storeRulletCountToday({
          date: formattedToday,
          count: 0,  // Reset to 0 for the new day
        });

        // Proceed with finding a user in the waiting pool
        const data = {
          user_id: userDetail?.data?.id,
        };

        const response = await findUserInWaitingPool(data);
        console.log('response fate Ruller', `${response?.otherUserResult?.id} ${response?.otherUserResult?.name} ${response?.otherUserResult?.profile_image}`);

        // Initialize rullet count for the new day
        await storeRulletCountToday({
          date: formattedToday,
          count: 1,
        });

        // Navigate to the voice call screen
        navigation.navigate('FateRulletVoiceCallScreen', {
          currentUser: userDetail?.data?.id,
          otherUser: response?.otherUserResult?.id,
          otherUserName: response?.otherUserResult?.name,
          otherUserImage: response?.otherUserResult?.profile_image,
        });
      }
      // If the user has used up all roulettes for the day
      else {
        alert('You have used all your roulettes for today');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error in findUserInWaitingPool:', error);
      setLoading(false);
    }
  };



  const handleAddUserInWaitingPool = async (user) => {

    try {
      const data = {
        user_id: user?.data?.id,
      };
      const res = await addUserInWaitingPool(data);

      console.log('response fate Ruller', res);
    }
    catch (error) {
      console.log('error fate Ruller', error);

    }


  };

  useEffect(() => {



    rotation.value = withRepeat(
      withTiming(1, {
        duration: 3000, // Adjust duration as needed
        easing: Easing.linear,
      }),
      -1, // Infinite loop,
      false
    );
  }, []);
  useEffect(() => {

    if (isFocused && route.name === 'Premiums') {
      setTimeout(() => {
        getUserDetail().then((userDetail) => {
          setUserDetail(userDetail);
          handleAddUserInWaitingPool(userDetail);
        })
      }, 1000);

    }


  }, [isFocused, route.name]);

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = rotation.value * 360; // Convert the rotation progress to degrees
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  return (
    <GradientBackground>
      <ScrollView>
        <SafeAreaView
          style={styles.container}>
          <Text
            style={{
              fontSize: 30,
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
            {images.map((image, index) => {
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
            })}

            {/* Spotlight */}
            <Animated.View style={[styles.spotlightContainer, animatedStyle]}>
              <Image
                source={{
                  uri: 'https://i.postimg.cc/SKgnFffn/Unlock-a-world-of-possibilities-with-Nummee-the-ultimate-app-for-buying-and-managing-phone-numbers.png',
                }}
                style={styles.spotlight}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
          <Text
            style={{
              fontSize: 20,
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
              height: responsiveWidth(25),
            }} />
        </SafeAreaView>
      </ScrollView>
      <View
        style={{
          marginBottom: responsiveWidth(25),
          paddingTop: responsiveWidth(2),
        }}
      >
        <PrimaryButton
          loading={loading}
          title="I am ready"
          onPress={() => {
            // navigation.navigate('RulletCalling')
            getfindUserInWaitingPool();
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
  },
  centralImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'absolute',
    zIndex: 1,
    borderWidth: 2,
    borderColor: 'white',
  },
  image: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',

  },
  spotlightContainer: {
    position: 'absolute',
    width: radius * 2,
    height: radius * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotlight: {
    width: 150, // Adjust based on the spotlight image dimensions
    height: 150,
    position: 'absolute',
    borderRadius: 110,
    tintColor: 'white',
    transform: [{ rotate: '90deg' }], // Adjust based on the spotlight image
    top: -40, // Starts at the top center
  },
});

export default CircularImageSpotlight;
