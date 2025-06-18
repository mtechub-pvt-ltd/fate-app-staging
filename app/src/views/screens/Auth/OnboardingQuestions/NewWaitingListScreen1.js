import React, { useEffect, useState, useRef } from 'react';
import { Player } from '@react-native-community/audio-toolkit';
import {
  View,
  Text,
  Alert,
  SafeAreaView,

  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  BackHandler,
  ImageBackground
} from 'react-native';
import { useIAP, requestPurchase, purchaseUpdatedListener, purchaseErrorListener } from 'react-native-iap';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import TopBar from '../../../../components/TopBar/TopBar';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import { useFocusEffect } from '@react-navigation/native';
import {
  updateWaitingListStatus,
  getUserById,
  userLogout
} from '../../../../Services/Auth/SignupService';
import AudioRecord from 'react-native-audio-record';
import fonts from '../../../../consts/fonts';
import { getUserDetail, storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSelector, useDispatch } from 'react-redux';
import { setBio, resetForm } from '../../../../redux/features/form/formSlice';
import { setNewUserFlag } from '../../../../redux/features/tourGuide/tourGuideSlice';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Images from '../../../../consts/Images';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';





const NewWaitingListScreen1 = ({ route, navigation }) => {
  const { fromOnboarding } = route?.params || {};
  const refRBSheet = useRef();
  const [showLoader, setShowLoader] = useState(false);
  const [showHelloText, setShowHelloText] = useState(false);
  const [waitingListData, setWaitingListData] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [countdownInterval, setCountdownInterval] = useState(null);
  const [staticRemainingTime, setStaticRemainingTime] = useState(null);
  const [staticCountdownInterval, setStaticCountdownInterval] = useState(null);

  const [staticStartTime, setStaticStartTime] = useState(null);

  const updateRemainingTime = (createdAtUTC) => {
    const currentTimeUTC = new Date();
    const timeDifference = currentTimeUTC.getTime() - createdAtUTC.getTime();
    const hoursPassed = timeDifference / (1000 * 60 * 60);

    if (hoursPassed < 48) {
      const remainingMilliseconds = (48 * 60 * 60 * 1000) - timeDifference;
      const hours = Math.floor(remainingMilliseconds / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingMilliseconds % (1000 * 60)) / 1000);
      setRemainingTime({ hours, minutes, seconds });
      return true; // Still in waiting period
    } else {
      setRemainingTime(null);
      return false; // Waiting period completed
    }
  };

  const updateStaticRemainingTime = () => {
    if (!staticStartTime) return false;

    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - staticStartTime.getTime();
    const remainingTime = (48 * 60 * 60 * 1000) - timeDifference; // 48 hours in milliseconds

    if (remainingTime > 0) {
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      setStaticRemainingTime({ hours, minutes, seconds });
      return true; // Still in waiting period
    } else {
      // Set to 00:00:00 when countdown is complete
      setStaticRemainingTime({ hours: 0, minutes: 0, seconds: 0 });
      return false; // Waiting period completed
    }
  };

  const checkUserWaitingStatus = async () => {
    try {
      const userDetail = await getUserDetail();
      const response = await getUserById(userDetail?.data?.id);
      console.log('response___________--', response?.data);

      if (response?.data) {
        setWaitingListData(response.data);

        // Check if user is on waiting list
        if (response.data.add_user_to_waiting_list === "true") {
          // Parse the server date - it should be in UTC format (ISO string)
          const createdAtUTC = new Date(response.data.created_at);

          // Validate that the date was parsed correctly
          if (isNaN(createdAtUTC.getTime())) {
            console.error('Invalid date from server:', response.data.created_at);
            return response?.data;
          }

          // Get current time in UTC
          const currentTimeUTC = new Date();

          // Calculate the difference in milliseconds using UTC timestamps
          const timeDifference = currentTimeUTC.getTime() - createdAtUTC.getTime();
          const hoursPassed = timeDifference / (1000 * 60 * 60); // Convert to hours

          // Additional validation - check if the created date is in the future (which shouldn't happen)
          if (timeDifference < 0) {
            console.warn('Created date is in the future, this might indicate a timezone issue');
            console.log('Server date:', response.data.created_at);
            console.log('Parsed UTC date:', createdAtUTC.toISOString());
            console.log('Current UTC date:', currentTimeUTC.toISOString());
          }

          console.log('=== TIME CALCULATION DEBUG ===');
          console.log('Server date string:', response.data.created_at);
          console.log('Created at (UTC ISO):', createdAtUTC.toISOString());
          console.log('Current time (UTC ISO):', currentTimeUTC.toISOString());
          console.log('Created at (Local display):', createdAtUTC.toLocaleString());
          console.log('Current time (Local display):', currentTimeUTC.toLocaleString());
          console.log('Time difference (milliseconds):', timeDifference);
          console.log('Hours passed:', hoursPassed.toFixed(2));
          console.log('================================');

          if (hoursPassed < 48) {
            const remainingMilliseconds = (48 * 60 * 60 * 1000) - timeDifference;
            const hours = Math.floor(remainingMilliseconds / (1000 * 60 * 60));
            const minutes = Math.floor((remainingMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingMilliseconds % (1000 * 60)) / 1000);
            setRemainingTime({ hours, minutes, seconds });
            console.log('Remaining time:', { hours, minutes, seconds });

            // Start countdown timer to update every second
            if (countdownInterval) {
              clearInterval(countdownInterval);
            }

            const interval = setInterval(() => {
              const stillWaiting = updateRemainingTime(createdAtUTC);
              if (!stillWaiting) {
                clearInterval(interval);
                // Navigate to main app when waiting period completed
                console.log('Waiting period completed!');
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MyTabs' }],
                });
              }
            }, 1000); // Update every second

            setCountdownInterval(interval);
          } else {
            // 48 hours have passed, user should have access
            setRemainingTime(null);
            navigation.reset({
              index: 0,
              routes: [{ name: 'MyTabs' }],
            });
          }
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MyTabs' }],
          });
        }
      }

      return response?.data;
    } catch (error) {
      console.error('Error fetching user detail:', error);
      return null;
    }
    finally {
      // Hide loader after fetching user status
      setShowLoader(false);
      setShowHelloText(true);
    }
  }

  useEffect(() => {
    // Reset form state when navigating to this screen
    console.log('Resetting form state', fromOnboarding);

    // Show full screen loader if coming from onboarding
    if (fromOnboarding === true) {
      setShowLoader(true);
      // check data form background how much user time is remaining or it is still in waiting list
      checkUserWaitingStatus()
    } else {
      // If not coming from onboarding, show static 48-hour countdown immediately
      setShowHelloText(true);

      // Initialize static 48-hour countdown
      const startTime = new Date();
      setStaticStartTime(startTime);

      // Set initial static remaining time
      const remainingTime = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      setStaticRemainingTime({ hours, minutes, seconds });

      // Start static countdown timer
      const staticInterval = setInterval(() => {
        const stillWaiting = updateStaticRemainingTime();
        if (!stillWaiting) {
          clearInterval(staticInterval);
          console.log('Static waiting period completed!');
          // Keep user on waiting list screen, don't auto-navigate
          // User can only leave by purchasing or manually logging out
        }
      }, 1000);

      setStaticCountdownInterval(staticInterval);
    }

    // Cleanup function to clear countdown intervals
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      if (staticCountdownInterval) {
        clearInterval(staticCountdownInterval);
      }
    };
  }, [fromOnboarding]);

  const dispatch = useDispatch();
  const bio = useSelector((state) => state.form.bio);
  const formData1 = useSelector((state) => state.form);
  const isFocused = useIsFocused();

  // Initialize useIAP hook
  const {
    products,
    getProducts,
    finishTransaction,
  } = useIAP();

  const iosProductSkus = ['com.fateapp1.skipwait'];

  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [error, setError] = useState(null);
  const [falshMessage, setFalshMessage] = useState(false);
  const [falshMessageData, setFalshMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
  });
  const [profileCreationComplete, setProfileCreationComplete] = useState(false);

  const incrementProgress = (step) => {
    setCount((prevCount) => Math.min(prevCount + step, 100)); // Increment progress by step size
  };

  // Fetch IAP products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        await getProducts({ skus: iosProductSkus });
        console.log('Products fetched: ', products);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
      }
    };

    if (isFocused) {
      fetchProducts();
    }
  }, [isFocused, getProducts]);

  // Set up purchase listeners
  useEffect(() => {
    const purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      try {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          console.log('Purchase completed:', purchase);
          await finishTransaction({ purchase, isConsumable: false });
          // alert('Purchase Successful! You now have instant access.');
          setPurchaseLoading(false);

          const userDetail = await getUserDetail();
          console.log('User Detail:', userDetail?.data);

          const data = {
            user_id: userDetail?.data?.id,
            newStatus: false
          }

          const res = await updateWaitingListStatus(data)
          if (await storeUserDetail(res?.res)) {
            navigation.reset({
              index: 0,
              routes: [{
                name: 'MyTabs',
                params: { screen: 'Home' } // Explicitly navigate to Home tab
              }],
            });
          }

        }
      } catch (error) {
        console.error('Error finishing transaction:', error);
        setPurchaseLoading(false);
      }
    });

    const purchaseErrorSubscription = purchaseErrorListener((error) => {
      console.warn('Purchase error:', error);
      // alert('Purchase failed: ' + error.message);
      setPurchaseLoading(false);
    });

    return () => {
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
    };
  }, [finishTransaction]);

  const handlePurchase = async (productId) => {
    try {
      setPurchaseLoading(true);
      const purchase = await requestPurchase({ sku: productId });
      console.log('Purchase request sent:', purchase);

    } catch (err) {
      console.error('Purchase Error:', err);
      // alert('Error during purchase, please try again.');
      setPurchaseLoading(false); // Only set loading to false on error
    }
  };

  // Disable hardware back button and swipe gestures during profile creation
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Allow back navigation only after profile creation is complete
        if (profileCreationComplete) {
          return false; // Allow default back action
        }

        // Prevent back navigation during profile creation
        console.log('Back button pressed during profile creation - preventing navigation');

        // Show a brief message to the user
        setFalshMessage(true);
        setFalshMessageData({
          message: 'Please wait',
          description: 'Profile creation is in progress. Please wait until completion.',
          type: 'info',
          icon: 'info-circle',
        });

        // Hide the message after 3 seconds
        setTimeout(() => {
          setFalshMessage(false);
        }, 3000);

        return true; // Return true to prevent default back action
      };

      // Add event listener for Android hardware back button
      if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
      }

      return () => {
        // Cleanup function to remove listener when component unmounts or loses focus
        if (Platform.OS === 'android') {
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
      };
    }, [profileCreationComplete])
  );

  const handleLogout = async () => {
    try {
      setShowLoader(true)
      const userDetail = await getUserDetail();
      // Log out on the server side
      const data = {
        user_id: userDetail?.data?.id
      };
      console.log('data', data);
      await userLogout(data);

      // Set flag to indicate we're coming from logout
      await AsyncStorage.setItem('isFromLogout', 'true');

      // Use navigate instead of reset to avoid navigation errors
      setTimeout(() => {
        setShowLoader(false)
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding_signups' }],
        });
      }, 500);
    } catch (error) {
      console.error('Error during logout:', error);
      setShowLoader(false)
    }
  };



  return (
    <>
      {/* Full screen loader when coming from onboarding */}


      {showLoader && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.black,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          zIndex: 9999,
        }}>
          <ActivityIndicator size="large" color={COLORS.white} />
          <Text style={{
            color: COLORS.white,
            marginTop: 20,
            fontFamily: fonts.PoppinsRegular,
            fontSize: responsiveFontSize(2.5),
            fontWeight: '500',
          }}>
            Loading...
          </Text>
        </View>
      )}

      {/* Waiting List Screen - Show when hellText is true */}
      {showHelloText && (
        <>
          <BottomSheet ref={refRBSheet}>
            <View
              style={{
                marginTop: responsiveHeight(3),
              }}>
              <Image source={Images.warning} style={{ width: 50, height: 50, alignSelf: 'center' }} />
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2.2),
                  fontFamily: fonts.PoppinsMedium,
                  textAlign: 'center',
                  width: responsiveWidth(70),
                  marginVertical: responsiveHeight(2),
                  alignSelf: 'center',
                }}>
                Are you sure you{'\n'}want to log out?
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  width: responsiveWidth(70),
                  alignSelf: 'center',
                }}>
                <PrimaryButton
                  title="Cancel"
                  fontSize={responsiveFontSize(2)}
                  onPress={() => {
                    refRBSheet.current.close();
                  }}
                  style={{
                    alignSelf: 'center',
                    width: responsiveWidth(30),
                    backgroundColor: COLORS.primary,
                    padding: 0,
                  }}
                />
                <PrimaryButton
                  fontSize={responsiveFontSize(2)}
                  title="Log Out"
                  onPress={() => {
                    refRBSheet.current.close();
                    handleLogout();
                  }}
                  style={{
                    alignSelf: 'center',
                    width: responsiveWidth(30),
                    padding: 0,
                    backgroundColor: COLORS.red,
                  }}
                />
              </View>
            </View>
          </BottomSheet>

          <ImageBackground
            source={Images.bkg3}
            style={{
              flex: 1, width: '100%', height: '100%',
              backgroundColor: COLORS.black
            }}
          >
            {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}
            <SafeAreaView style={{ padding: 20, flex: 1 }}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
              >
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      marginTop: responsiveHeight(5),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: responsiveFontSize(3),
                        color: COLORS.white,
                        textAlign: 'center',
                        fontFamily: fonts.PoppinsRegular,
                        marginVertical: 15,
                        fontWeight: '500',
                        letterSpacing: .5,
                        width: responsiveWidth(80),
                        alignSelf: 'center',
                      }}>
                      You're on the waitlist! Your access will begin in{' '}
                      {fromOnboarding && remainingTime ? `${remainingTime.hours} hours` : '48 hours'}.
                    </Text>

                    <ImageBackground
                      source={Images.counter}
                      style={{
                        width: responsiveWidth(50),
                        height: responsiveHeight(25),
                        resizeMode: 'contain',
                        marginVertical: responsiveHeight(4),
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      imageStyle={{ resizeMode: 'contain' }}
                    >
                      <Icon
                        name="clock"
                        size={responsiveFontSize(5)}
                        color={COLORS.white}
                      />
                      <Text
                        style={{
                          fontSize: responsiveFontSize(2.5),
                          fontFamily: fonts.PoppinsRegular,
                          fontWeight: '600',
                          color: COLORS.white,
                          marginTop: responsiveHeight(1),
                          textAlign: 'center',
                        }}
                      >
                        {fromOnboarding && remainingTime ?
                          `${remainingTime.hours}:${remainingTime.minutes.toString().padStart(2, '0')}:${remainingTime.seconds.toString().padStart(2, '0')}` :
                          staticRemainingTime ?
                            `${staticRemainingTime.hours}:${staticRemainingTime.minutes.toString().padStart(2, '0')}:${staticRemainingTime.seconds.toString().padStart(2, '0')}` :
                            '48:00:00'
                        }
                      </Text>
                    </ImageBackground>

                    <Text
                      style={{
                        fontSize: responsiveFontSize(2.2),
                        fontWeight: '400',
                        color: COLORS.white,
                        fontFamily: fonts.PoppinsRegular,
                        marginTop: responsiveHeight(2),
                        alignSelf: 'center',
                        textAlign: 'center',
                        width: responsiveWidth(80),
                      }}>
                      Want to access the app and your matches immediately? Upgrade now for £9.99 and skip the line
                    </Text>
                  </View>

                  <View
                    style={{
                      alignContent: 'center',
                      justifyContent: 'center',
                      alignSelf: 'center',
                      padding: responsiveHeight(1),
                      position: 'absolute',
                      bottom: responsiveHeight(2),
                    }}
                  >
                    <PrimaryButton
                      title={'Unlock Access Instantly'}
                      loading={purchaseLoading}
                      disabled={purchaseLoading}
                      onPress={async () => {
                        if (products && products.length > 0) {
                          const product = products[0];
                          handlePurchase(product.productId);
                        } else {
                          alert('Product not available. Please try again later.');
                        }
                      }}
                      style={{
                        width: responsiveWidth(80),
                        height: responsiveHeight(6),
                        backgroundColor: COLORS.white,
                        fontFamily: fonts.PoppinsMedium,
                      }}
                      textColor={COLORS.primary}
                    />
                    <PrimaryButton
                      title={'Logout'}
                      onPress={() => {
                        refRBSheet.current.open();
                      }}
                      style={{
                        width: responsiveWidth(80),
                        height: responsiveHeight(6),
                        backgroundColor: 'transparent',
                        fontFamily: fonts.PoppinsRegular,
                        marginTop: responsiveHeight(2),
                      }}
                      textColor={COLORS.white}
                    />
                  </View>
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </ImageBackground>
        </>
      )}

      {/* Purchase Loading Overlay */}
      {purchaseLoading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          zIndex: 1000,
        }}>
          <ActivityIndicator size="large" color={COLORS.white} />
          <Text style={{
            color: COLORS.white,
            marginTop: 10,
            fontFamily: fonts.PoppinsRegular,
            fontSize: responsiveFontSize(2),
          }}>
            Processing purchase...
          </Text>
        </View>
      )}
    </>
  );
};


export default NewWaitingListScreen1;
