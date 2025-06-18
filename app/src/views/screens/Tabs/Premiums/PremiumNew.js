import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, SafeAreaView, ScrollView, Modal, TouchableOpacity, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import Images from '../../../../consts/Images';
import { getUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import { Text } from 'react-native-paper';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import { responsiveFontSize, responsiveWidth, responsiveHeight } from 'react-native-responsive-dimensions';
import COLORS from '../../../../consts/colors';
import {
  getFateRulletUsersMatchFromWaitingPool,
  deleteToken,
  getAllTokens,
  reportUser,
  declineMatchReq
} from '../../../../Services/Auth/SignupService';
import fonts from '../../../../consts/fonts';
import { useIsFocused } from '@react-navigation/native';
import { node_base_url } from '../../../../consts/baseUrls';
import io from 'socket.io-client';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import DeviceInfo from 'react-native-device-info';
// Replace Tooltip import with our custom tooltip
import { CustomTooltip, useTooltip } from '../../../../components/CustomTooltip';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import CustomInput from '../../../../components/CustomInput/CustomInput';
// Keep the redux imports
import { useDispatch, useSelector } from 'react-redux';
import {
  nextPremiumStep,
  skipPremiumTour,
  startSettingsTour
} from '../../../../redux/features/tourGuide/tourGuideSlice';
import TourGuideTooltip from '../../../../components/TourGuide/TourGuideTooltip';

const { width } = Dimensions.get('window');
const squareSize = width * 0.90;
const radius = squareSize * 0.35;
const spotlightRadius = 50;

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
  const hasStarted = useRef(false);
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalAllowedRullet, setTotalAllowedRullet] = useState(0);
  const [socket, setSocket] = useState(null);
  const [userInWaitingPool, setUserInWaitingPool] = useState(null);
  const [falshMessage, setFalshMessage] = useState(false);
  const [falshMessageData, setFalshMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
  });
  const [modalVisible, setModalVisible] = useState(false);

  // Report user functionality
  const refReportSheet = useRef(null);
  const [reason, setReason] = useState('');
  const [matchedUserId, setMatchedUserId] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Handle report user submission
  const handleReportUser = async () => {
    setReportLoading(true);
    if (reason === '') {
      alert('Please enter reason');
      setReportLoading(false);
      return;
    }
    try {
      const data = {
        reported_by_user_id: userDetail?.data?.id,
        reported_user_id: matchedUserId,
        reason: reason,
      };
      console.log('report user data:', data);
      const response = await reportUser(data);
      setReportLoading(false);
      if (!response?.error) {
        // End the call and decline the match when report is submitted
        if (socket && matchedUserId) {
          socket.emit('respondToRulletMatch', {
            userId: userDetail?.data?.id,
            matchId: matchedUserId,
            response: 'reject'
          });

          await declineMatchReq({
            currentUserId: userDetail?.data?.id,
            exsistingMatchId: null,
            newMatchId: matchedUserId,
          });
        }

        alert('User reported successfully');
        refReportSheet.current.close();
        setReason('');
        setMatchedUserId(null);

        // Return to waiting pool state
        setUserInWaitingPool(true);

        // Show success message
        setFalshMessageData({
          message: 'Report Submitted',
          description: 'Your report has been submitted and the match has been declined',
          type: 'success',
          icon: 'success',
          backgroundColor: COLORS.success,
          textColor: COLORS.white,
        });
        setFalshMessage(true);
        setTimeout(() => setFalshMessage(false), 5000);
      } else {
        alert('Failed to report user. Please try again.');
      }
    } catch (error) {
      setReportLoading(false);
      console.error('Error reporting user:', error);
    }
  };

  // Show report sheet when needed
  const showReportSheet = (userId) => {
    setMatchedUserId(userId);
    refReportSheet.current?.open();
  };

  // Redux tour guide
  const dispatch = useDispatch();
  const {
    showPremiumTour,
    currentPremiumStep,
    premiumSteps,
    shouldNavigateToSettings
  } = useSelector((state) => state.tourGuide);

  // Navigate to Settings when tour is completed
  useEffect(() => {
    if (shouldNavigateToSettings) {
      // Navigate to Settings screen and start its tour
      navigation.navigate('Settings');
      dispatch(startSettingsTour());
    }
  }, [shouldNavigateToSettings, navigation]);

  const [showTooltip, setShowTooltip] = useState({
    premiumRoulette: false
  });

  // Set which tooltip to show based on current step
  useEffect(() => {
    if (showPremiumTour) {
      const currentTarget = premiumSteps[currentPremiumStep]?.target;
      setShowTooltip({
        premiumRoulette: currentTarget === 'premium-roulette'
      });
    } else {
      setShowTooltip({
        premiumRoulette: false
      });
    }
  }, [currentPremiumStep, showPremiumTour]);

  // Function to handle tooltip next button
  const handleNextStep = () => {
    dispatch(nextPremiumStep());
  };

  // Function to handle tooltip skip button
  const handleSkipTour = () => {
    dispatch(skipPremiumTour());
  };

  // Determine device type more reliably
  const { width, height } = Dimensions.get('window');
  const [isDeviceIpad, setIsDeviceIpad] = useState(false);

  // Use screen dimensions to immediately determine if it's likely an iPad
  // This provides a synchronous fallback while deviceName is being fetched
  const isTabletBasedOnDimensions = Platform.OS === 'ios' && Math.min(width, height) >= 768;

  // Function to check device type properly
  const checkDeviceType = async () => {
    try {
      if (Platform.OS === 'ios') {
        const name = await DeviceInfo.getDeviceName();
        const hasIpadName = name && typeof name === 'string' && name.toLowerCase().includes('ipad');
        // Set state based on name or dimensions as fallback
        setIsDeviceIpad(hasIpadName || isTabletBasedOnDimensions);
      } else {
        setIsDeviceIpad(isTabletBasedOnDimensions);
      }
    } catch (error) {
      console.log('Error getting device name:', error);
      // Fallback to dimensions-based detection
      setIsDeviceIpad(isTabletBasedOnDimensions);
    }
  };

  useEffect(() => {
    checkDeviceType();
  }, []);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(2 * Math.PI, {
        duration: 5000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    if (isFocused && route.name === 'PremiumNew') {
      setTimeout(() => {
        getUserDetail().then((userDetail) => {
          setUserDetail(userDetail);
        });
      }, 1000);

      const newSocket = io(node_base_url);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
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
    const data = { user_id: userDetail?.data?.id };
    try {
      const response = await getFateRulletUsersMatchFromWaitingPool(data);
      if (response.error) {
        const x = response.msg.replace(/\s+/g, '_').toUpperCase();
        if (x === 'NO_SUITABLE_MATCHES_FOUND.') {
          setUserInWaitingPool(true);
          setFalshMessageData({
            message: 'No Suitable Matches Found',
            // description: `you are add in waiting pool,keep this screen open for pair with someone`,
            description: `You have been added in the waiting pool.${'\n'} Keep this screen open to pair with someone`,
            type: 'info',
            icon: 'info',
            backgroundColor: COLORS.light,
            textColor: COLORS.white,
          });
          setFalshMessage(true);
          setTimeout(() => setFalshMessage(false), 5000);
        }
      } else {
        // await deleteToken({ user_id: userDetail?.data?.id, new_tokens: 1 });
        await deleteToken({ user_id: userDetail?.data?.id, new_tokens: 30 });
        // navigation.navigate('RulletVoiceCallScreen', {
        //   currentUser: userDetail?.data?.id,
        //   otherUser: response?.matchedUser?.id,
        //   otherUserName: response?.matchedUser?.name,
        //   otherUserImage: response?.matchedUser?.profile_image,
        //   fromNotification: false,
        // });
      }
    } catch (error) {
      console.error('Error in handleUsersMatchFromWaitingPool', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const newSocket = io(node_base_url);
    setSocket(newSocket);

    getUserDetail().then((x) => setUserDetail(x));

    return () => {
      if (socket && userDetail) {
        socket.emit('leaveRulletWaitingPool', userDetail?.data?.id);
        newSocket.disconnect();
      }
    };
  }, []);



  useEffect(() => {
    if (socket) {
      socket.on('matchFound', (data) => {
        // await deleteToken({ user_id: userDetail?.data?.id, new_tokens: 30 });

        console.log('Match found for calls:', data);
        setLoading(false);
      })
    }

    return () => {
      if (socket) {
        setLoading(false);
        socket.off('matchFound');
      }
    };
  }, [socket]);

  const handletoken = async () => {
    const x = {
      user_id: userDetail?.data?.id
    }
    const response = await getAllTokens(x);
    console.log('response_____', response?.tokens);
    return response?.tokens;
  }

  useEffect(() => {
    const fetchTokens = async () => {
      if (isFocused && userDetail && socket) {
        setUserInWaitingPool(false);

        const x = await handletoken();
        console.log('response_____', x);
        if (x < 30000) {
          socket.emit('joinRulletWaitingPool', userDetail?.data?.id);
          console.log('Joining pool', userDetail?.data?.id);
        }
        else {
          console.log('Not enough tokens to join the pool');
          setFalshMessageData({
            message: 'Insufficient Tokens',
            description: `You need at least 30 tokens to proceedss.`,
            type: 'error',
            icon: 'error',
            backgroundColor: COLORS.danger,
            textColor: COLORS.white,
          });
          setFalshMessage(true);
          setTimeout(() => setFalshMessage(false), 5000);
        }

        setLoading(false);
      } else if (!isFocused && socket && userDetail) {
        setLoading(false);
        socket.emit('leaveRulletWaitingPool', userDetail?.data?.id);
      }
    };

    fetchTokens();
  }, [isFocused, userDetail, socket]);

  return (
    <GradientBackground>
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}

      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.titleContainer, {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '90%',
          }]}>
            <Text style={styles.title}>Fate Calls</Text>
            <TouchableOpacity
              style={{
                marginTop: responsiveWidth(2),
                padding: responsiveFontSize(1),
              }}
              onPress={() => setModalVisible(true)}>
              <Icon name="info" size={24} color={COLORS.warning} />
            </TouchableOpacity>
          </View>

          <Modal
            transparent={true}
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>How Matching Works</Text>
                <Text style={styles.modalDescription}>
                  You are paired with someone who is currently on this screen and matches your ELO score range,
                  {'\n'}
                  as well as the preferences based on the questions you answered during onboarding.
                </Text>
                <PrimaryButton
                  title="Close"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                  textColor={COLORS.white}
                />
              </View>
            </View>
          </Modal>

          <CustomTooltip
            isVisible={showTooltip.premiumRoulette}
            content={
              <TourGuideTooltip
                content={premiumSteps[currentPremiumStep]?.content}
                onNext={handleNextStep}
                onSkip={handleSkipTour}
                isLastStep={currentPremiumStep === premiumSteps.length - 1}
              />
            }
            placement="bottom"
            onClose={() => { }}
            disableShadow={false}
            contentStyle={{
              backgroundColor: COLORS.white,
              width: responsiveWidth(90),
              height: 'auto',
            }}
            tooltipStyle={{
              // minHeight: 110,
              left: responsiveWidth(10),
              marginTop: responsiveWidth(15),
              position: 'absolute',
              bottom: responsiveWidth(25),
            }}
            childContentSpacing={0}
            arrowSize={{ width: 16, height: 8 }}
            backgroundStyle={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          />
          <View nativeID="premium-roulette" style={styles.squareBox}>
            <Image source={{ uri: userDetail?.data?.profile_image }} style={styles.centralImage} />
            {images.map((image, index) => {
              const angle = (index / images.length) * 2 * Math.PI;
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
                      left: squareSize / 2 + x - 25,
                      top: squareSize / 2 + y - 25,
                    },
                  ]}
                />
              );
            })}
            <Animated.Image
              source={Images.spotlight}
              style={[
                styles.spotlightImage,
                useAnimatedStyle(() => ({
                  transform: [{ rotate: `${(rotation.value * 180) / Math.PI}deg` }],
                })),
              ]}
            />
          </View>


          {/* <Text style={[styles.description, {
            fontSize: responsiveFontSize(1.2),
            color: COLORS.white,
            marginVertical: 0,
            width: '90%',
            textAlign: 'center',
            fontFamily: fonts.PoppinsRegular,
            backgroundColor: 'rgba(201, 201, 201, 0.4)',
            padding: 10,
            borderRadius: 10,
            overflow: 'hidden',
            marginTop: responsiveWidth(5),
          }]}>
            Matched with someone nearby who shares your vibe. Check their bio before starting the call!
          </Text> */}
          <Text style={[styles.description, { fontSize: responsiveFontSize(1.5) }]}>
            Preview the caller before the 10-minute chat. Like them? Add to matches. Don’t? End the call and get the next one.
          </Text>

          <View style={styles.spacer} />
        </ScrollView>
        <View style={[styles.buttonContainer, { paddingBottom: isDeviceIpad ? responsiveWidth(25) : responsiveWidth(20) }]}>
          {!userInWaitingPool ? (
            <PrimaryButton
              loading={loading}
              title="I am Ready"
              onPress={() => {
                setFalshMessage(false);
                // if (userDetail?.data?.tokens < 30) {
                //   setFalshMessage(false);
                //   setFalshMessageData({
                //     message: 'Insufficient Tokens',
                //     description: `You need at least 30 tokens to proceed.`,
                //     type: 'error',
                //     icon: 'error',
                //     backgroundColor: COLORS.danger,
                //     textColor: COLORS.white,
                //   });
                //   setFalshMessage(true);
                //   setTimeout(() => setFalshMessage(false), 5000);
                // } else {
                handleUsersMatchFromWaitingPool();
                // }
              }}
              style={styles.readyButton}
              textColor={COLORS.primary}
            />
          ) : (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>Waiting for a match ...</Text>
              <Text style={styles.waitingSubText}>
                Keep this screen open to get a pair request with someone.
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      <BottomSheet
        ref={refReportSheet}
        height={responsiveHeight(40)}
        openDuration={250}
        closeOnDragDown={true}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
          },
        }}
      >
        <View>
          <Text style={styles.reportTitle}>Report User</Text>
          <CustomInput
            label="Reason"
            value={reason}
            onChangeText={setReason}
            multiline={true}
            numberOfLines={4}
            style={styles.reportInput}
          />
          <PrimaryButton
            title="Submit"
            onPress={handleReportUser}
            loading={reportLoading}
            style={styles.reportButton}
            textColor={COLORS.white}
          />
        </View>
      </BottomSheet>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: responsiveHeight(10), // Add padding at bottom to ensure content is visible above button
  },
  title: {
    fontSize: responsiveWidth(7),
    fontWeight: '600',
    color: 'white',
    marginBottom: 30,
    fontFamily: fonts.PoppinsMedium,
    marginTop: responsiveWidth(10),
  },
  squareBox: {
    width: squareSize,
    height: squareSize,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 400,
    overflow: 'hidden',
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
  spotlightImage: {
    width: squareSize * 0.7,
    height: squareSize * 1.8,
    position: 'absolute',
    resizeMode: 'contain',
    transform: [{ rotate: '0deg' }],
    padding: responsiveWidth(30),
  },
  description: {
    fontSize: responsiveFontSize(1.8),
    color: 'white',
    marginVertical: 30,
    width: '90%',
    textAlign: 'center',
    fontFamily: fonts.PoppinsRegular,
  },
  spacer: {
    height: responsiveWidth(10),
  },
  buttonContainer: {
    // position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingVertical: responsiveWidth(2),
    paddingBottom: responsiveWidth(23),
    alignItems: 'center',
  },
  readyButton: {
    alignSelf: 'center',
    width: responsiveWidth(80),
    backgroundColor: COLORS.white,
    padding: 0,
    marginBottom: Platform.OS === 'ios' ? responsiveWidth(5) :
      responsiveWidth(2),
  },
  waitingContainer: {
    paddingVertical: responsiveWidth(2),
    backgroundColor: COLORS.secondary2,
    borderRadius: 10,
    marginBottom: responsiveWidth(2),
    width: responsiveWidth(80),
  },
  waitingText: {
    fontSize: responsiveWidth(5),
    fontWeight: '600',
    color: 'white',
    fontFamily: fonts.PoppinsMedium,
    alignSelf: 'center',
  },
  waitingSubText: {
    fontWeight: '600',
    color: 'white',
    fontFamily: fonts.PoppinsMedium,
    alignSelf: 'center',
    padding: responsiveWidth(1),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.dark,
    fontFamily: fonts.PoppinsMedium,
  },
  modalDescription: {
    fontSize: responsiveFontSize(1.8),
    textAlign: 'center',
    color: COLORS.dark,
    fontFamily: fonts.PoppinsRegular,
    marginBottom: 20,
  },
  modalButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
  },
  reportTitle: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.dark,
    fontFamily: fonts.PoppinsMedium,
  },
  reportInput: {
    height: responsiveHeight(15),
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  reportButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
  },
});

export default CircularImageSpotlight;