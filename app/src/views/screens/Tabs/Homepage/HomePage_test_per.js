import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  memo
} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Platform,
  RefreshControl,
  Alert,
  TouchableHighlight,
  Dimensions,
  ActivityIndicator,
  Animated,
  PanResponder,
} from 'react-native';
import Sound from 'react-native-sound';
import TrackPlayer from 'react-native-track-player';
import MiniAudioPlayer from '../../../../components/AudioPlayer/MiniAudioPlayer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import LinearGradient from 'react-native-linear-gradient';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import MatchCard from '../../../../components/MatchCard/MatchCard';
import {
  getMatchUsers,
  disQualifyUser,
  getUserJokerCard,
  assignJokerToUser,
  addToken,
  getUserById
} from '../../../../Services/Auth/SignupService';
import RBSheet from 'react-native-raw-bottom-sheet';
import LottieView from 'lottie-react-native';
import { BlurView } from '@react-native-community/blur';
import { useIsFocused } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import {
  House,
  Warning,
  CaretLeft,
  CaretRight,
  DotsThreeVertical,
  XCircle,
  WarningCircle,
  ExclamationMark,
  ChatTeardropDots,
  ArrowsClockwise
} from 'phosphor-react-native';
import FastImage from 'react-native-fast-image';
import DeviceInfo, { isTablet } from 'react-native-device-info';
// Removed react-native-snap-carousel dependency for custom FlatList implementation
// Replace the Tooltip import with our custom tooltip
import { CustomTooltip, useTooltip } from '../../../../components/CustomTooltip';

// Import for Redux tour guide
import { useDispatch, useSelector } from 'react-redux';
import {
  nextHomeStep,
  skipHomePageTour,
  setNewUserFlag
} from '../../../../redux/features/tourGuide/tourGuideSlice';
import TourGuideTooltip from '../../../../components/TourGuide/TourGuideTooltip';
import Swiper from 'react-native-deck-swiper';





const { width, height } = Dimensions.get('window');

function HomePage({ route, navigation }) {
  const { isUpdated } = route?.params || false;
  console.log('isUpdated', isUpdated);
  const [fatelist, setFateList] = useState([]);




  const Card = ({ user }) => {
    return (
      <ScrollView style={styles.card}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cardContent}

        scrollEventThrottle={16} // ~60fps
      >
        <ImageBackground
          source={{
            uri: user?.image,
            cache: 'force-cache',
            priority: FastImage.priority.high
          }} style={styles.image}
        >

          <LinearGradient colors={['transparent', 'transparent', COLORS.black]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              flex: 1,
              borderRadius: 5,
              width: '100%',
              height: '120%',
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}>
            <View
              style={{
                alignItems: 'center',
                marginBottom: responsiveHeight(2)
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: responsiveFontSize(4),
                  fontFamily: fonts.PoppinsMedium,
                }}
              >
                {user?.name}
              </Text>
              <Text
                style={{
                  color: 'white',
                  fontSize: responsiveFontSize(2),
                  fontFamily: fonts.PoppinsMedium,
                }}
              >
                {user?.age}, {
                  user?.card_name == 'fate' ? 'Fate Match' :
                    user?.card_name == 'K' ? 'Second Match' :
                      user?.card_name == 'J' ? 'Third Match' :
                        user?.card_name == '10' ? 'Fourth Match' :
                          user?.card_name == 'A' ? 'Fifth Match' : null


                }

              </Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                marginBottom: responsiveHeight(5),
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: '60%'
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  console.log('Disqualify',
                    JSON.stringify(user?.userDetail?.userdetail?.note, null, 2));
                }}
              >
                <View
                  style={{
                    backgroundColor: COLORS.orange,
                    width: 55,
                    height: 55,
                    borderRadius: 30,
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    overflow: 'hidden'
                  }}
                >
                  <Image
                    source={Images.disqualify}
                    style={{
                      width: 30,
                      height: 30,

                    }}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Chats_New', {
                    currentUser: currentUser?.id,
                    otherUser: user?.id,
                    otherUserImage: user?.image,
                    otherUserName: user?.name,
                  });
                  // console.log('Navigating to Chats_New', {
                  //   currentUser: currentUser?.id,
                  //   otherUser: user?.id,
                  //   otherUserImage: user?.image,
                  //   otherUserName: user?.name,
                  // });
                }}
              >
                <View
                  style={{
                    backgroundColor: COLORS.secondary2,
                    width: 55,
                    height: 55,
                    borderRadius: 30,
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    overflow: 'hidden'
                  }}
                >
                  <ChatTeardropDots color={COLORS.white}
                    weight='fill' size={30} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDisqualifyPress(user)}
              >
                <View
                  style={{
                    backgroundColor: COLORS.white,
                    width: 55,
                    height: 55,
                    borderRadius: 30,
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    overflow: 'hidden'
                  }}
                >
                  <Image
                    source={Images.cross}
                    style={{
                      width: 15,
                      height: 15,

                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>


        </ImageBackground>
        <LinearGradient colors={[COLORS.black, COLORS.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{

            // borderRadius: 5,
            width: '100%',
            height: 'auto',
            justifyContent: 'flex-start',

          }}>
          <View
            style={{
              marginBottom: responsiveHeight(2),
              marginHorizontal: responsiveWidth(3),
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: responsiveFontSize(2.5),
                fontFamily: fonts.PoppinsMedium,
              }}
            >
              {user?.name}
            </Text>
            <Text
              style={{
                color: 'lightgrey',
                fontSize: responsiveFontSize(2),
                fontFamily: fonts.PoppinsMedium,
              }}
            >
              Second Match
            </Text>
          </View>
          <View
            style={{
              marginBottom: responsiveHeight(2),
              marginHorizontal: responsiveWidth(3),
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: responsiveFontSize(2.5),
                fontFamily: fonts.PoppinsMedium,
              }}
            >
              Bio
            </Text>
            <Text
              style={{
                color: 'lightgrey',
                fontSize: responsiveFontSize(2),
                fontFamily: fonts.PoppinsMedium,
              }}
            >
              {
                user?.userDetail?.userdetail?.bio_notes
              }
            </Text>
          </View>
          <View
            style={{
              marginBottom: responsiveHeight(2),
              marginHorizontal: responsiveWidth(3),
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: responsiveFontSize(2.5),
                fontFamily: fonts.PoppinsMedium,
              }}
            >
              Pictures
            </Text>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
                  marginTop: responsiveHeight(1)
                }}
              >
                {(user?.userDetail?.userdetail?.images || []).map((item, index) => (
                  <FastImage
                    key={index}
                    source={{ uri: item }}
                    style={{
                      width: Platform.OS == 'android' ? responsiveWidth(24) : responsiveWidth(25),
                      height: responsiveWidth(35),
                      borderRadius: 10,
                      marginRight: responsiveWidth(3),
                      marginTop: responsiveWidth(3),
                      borderWidth: 2,
                      borderColor: COLORS?.white,
                      alignSelf: 'center'
                    }}
                  />
                ))}
              </View>

            </View>

          </View>
          <View style={styles.audioContainer}>
            {user?.userDetail?.userdetail?.note ? (
              <>
                {console.log(`🔍 DEBUG: User ${user?.name} note URL:`, user?.userDetail?.userdetail?.note)}
                <MiniAudioPlayer
                  key={user?.userDetail?.userdetail?.note} // 🧠 force remount per unique audio URL
                  audioUrl={user?.userDetail?.userdetail?.note}
                  autoPlay={false}
                  onClose={() => { }}
                />
              </>
            ) : (
              <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                <Image
                  source={Images.alert_purple}
                  style={{
                    width: 50,
                    height: 50,
                    alignSelf: 'center',
                    marginVertical: 10,
                  }}
                />
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(1.5),
                    fontFamily: fonts.PoppinsMedium,
                    textAlign: 'center',
                  }}
                >
                  No voice note found
                </Text>
              </View>
            )}
          </View>

        </LinearGradient>


      </ScrollView>)
  };

  const SwipeableCard = ({ user, onSwipeLeft, onSwipeRight }) => {
    const translateX = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 20,
        onPanResponderMove: (_, gesture) => {
          translateX.setValue(gesture.dx);
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 120) {
            Animated.timing(translateX, {
              toValue: 500,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              translateX.setValue(0); // Reset animation for reuse
              onSwipeRight();
            });
          } else if (gesture.dx < -120) {
            Animated.timing(translateX, {
              toValue: -500,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              translateX.setValue(0); // Reset animation for reuse
              onSwipeLeft();
            });
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      })
    ).current;

    return (
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.animatedCard, {
          transform: [{ translateX }],
          height: '100%',
          width: '100%',

        }]}
      >
        <Card user={user} />
      </Animated.View>
    );
  };


  const [index, setIndex] = useState(0);


  const handleSwipe = (direction) => {
    console.log(`Swiped ${direction}:`, fatelist[index]?.name);
    setIndex((prev) => (prev + 1) % fatelist?.length);
  };
  // Redux tour guide
  const dispatch = useDispatch();
  const {
    showHomePageTour,
    currentHomeStep,
    homePageSteps,
    shouldNavigateToChat,
    isNewUser
  } = useSelector((state) => state.tourGuide);

  // Check and initialize tour guide for first-time users
  useEffect(() => {
    const initializeTourGuide = async () => {
      try {
        // Check if user has seen the tour guide before
        const hasSeenTour = await AsyncStorage.getItem('hasSeenTourGuide');
        console.log('DEBUG TOOLTIPS - Has seen tour guide:', hasSeenTour);
        console.log('DEBUG TOOLTIPS - Current Redux state:', {
          showHomePageTour,
          currentHomeStep,
          homePageSteps,
          shouldNavigateToChat,
          isNewUser
        });

        if (hasSeenTour !== 'true') {
          // This is a first-time user, set the new user flag to show tooltips
          console.log('DEBUG TOOLTIPS - Setting new user flag to true');
          dispatch(setNewUserFlag(true));

          // Store that we've shown the tour guide
          await AsyncStorage.setItem('hasSeenTourGuide', 'true');

          // Log Redux state again after dispatch - but don't use hooks here
          setTimeout(() => {
            // We can't call useSelector here, so we'll just log that we dispatched
            console.log('DEBUG TOOLTIPS - Redux action dispatched to show tour guide');
          }, 100);
        }
      } catch (error) {
        console.log('Error initializing tour guide:', error);
      }
    };

    initializeTourGuide();
  }, []);

  // Navigate to ChatList when the tour is completed
  // useEffect(() => {
  //   if (shouldNavigateToChat) {
  //     // Navigate to ChatList
  //     navigation.navigate('ChatList');
  //   }
  // }, [shouldNavigateToChat]);

  // const [showTooltip, setShowTooltip] = useState({
  //   homeHeader: false,
  //   matchesGrid: false,
  //   jokerCard: false
  // });

  // Set which tooltip to show based on current step
  useEffect(() => {
    if (showHomePageTour) {
      // Just show one tooltip for the matches grid
      setShowTooltip({
        matchesGrid: true,
        homeHeader: false,
        jokerCard: false,
      });

      // Measure the FlatList container for positioning the tooltip
      if (matchesGridRef.current) {
        measureElement(matchesGridRef, 'matchesGrid');
      }
    } else {
      setShowTooltip({
        homeHeader: false,
        matchesGrid: false,
        jokerCard: false,
      });
    }
  }, [currentHomeStep, showHomePageTour]);

  // Determine device type more reliably

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
        setIsDeviceIpad(hasIpadName || isTablet || isTabletBasedOnDimensions);
      } else {
        setIsDeviceIpad(isTablet || isTabletBasedOnDimensions);
      }
    } catch (error) {
      console.log('Error getting device name:', error);
      // Fallback to dimensions-based detection
      setIsDeviceIpad(isTablet || isTabletBasedOnDimensions);
    }
  };

  useEffect(() => {
    checkDeviceType();
  }, []);

  // tooltip
  const [toolTipVisible, setToolTipVisible] = useState(false);

  const isFocused = useIsFocused();
  const [currentUser, setCurrentUser] = useState(null);

  const [activeDot, setActiveDot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jokerSuggerstion, setJokerSuggestion] = useState([]);
  const [isJokerTapped, setIsJokerTapped] = useState(false);
  const [activeUser, setActiveUser] = useState(null); // New state for the active user
  const [activeUserDetail, setActiveUserDetail] = useState(null);
  const [activeUserDetailLoading, setActiveUserDetailLoading] = useState(false);

  // handle more press
  const handleActiveUserInfo = async (item) => {
    refRBSheet_activeUserInfo.current.open();
    setActiveUserDetailLoading(true);
    setActiveUser(item);
    const response = await getUserById(item?.id);
    console.log('response', response)
    setActiveUserDetail(response?.data);
    setTimeout(() => {
      setActiveUserDetailLoading(false);
    }, 1000);

  }

  // Carousel states
  const [carouselImages, setCarouselImages] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [fadeAnim] = useState(new Animated.Value(1)); // Animation for smooth transitions
  const carouselRef = useRef(null);

  // Autoplay functionality for carousel
  // useEffect(() => {
  //   let interval;
  //   if (carouselImages.length > 0) {
  //     interval = setInterval(() => {
  //       setActiveSlide(prevSlide => {
  //         const nextSlide = (prevSlide + 1) % carouselImages.length;
  //         if (carouselRef.current) {
  //           carouselRef.current.snapToItem(nextSlide);
  //         }
  //         return nextSlide;
  //       });
  //     }, 3000); // Change slide every 3 seconds
  //   }

  //   return () => {
  //     if (interval) {
  //       clearInterval(interval);
  //     }
  //   };
  // }, [carouselImages.length]);

  const onRefresh = useCallback(() => {
    if (!loading) {
      setLoading(true); // Start loading
      getMatchUsersList().finally(() => setLoading(false)); // Stop loading after the fetch
    }
  }, [loading]);



  const refRBSheet = useRef();
  const refRBSheet_reasons = useRef();
  const refRBSheet_jokerList = useRef();
  const refRBSheet_JokerSent = useRef();
  const refRBSheet_activeUserInfo = useRef();
  const refAudioPlayerSheet = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);
  const [soundPlayer, setSoundPlayer] = useState(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);


  const disqualifyList = [
    {
      id: 1,
      content: 'Not my type (looks)',
      type: 'NOT_MY_TYPE',
    },
    {
      id: 2,
      content: 'Rude',
      type: 'RUDE',
    },
    {
      id: 3,
      content: 'Not feeling safe',
      type: 'NOT_FEELING_SAFE',
    },
    {
      id: 4,
      content: 'Not Interesting / Engaging enough',
      type: 'NOT_INTERESTING',
    },
    {
      id: 5,
      content: 'Do not like user profile',
      type: 'DO_NOT_LIKE_USER_PROFILE',
    },
    {
      id: 6,
      content: 'Incompatible lifestyle - e.g.Smoking, Drinking, Exercise',
      type: 'INCOMPATIBLE_LIFESTYLE',
    },
    {
      id: 7,
      content: 'Not ambitious(career or education)',
      type: 'NOT_AMBITIOUS',
    },
    {
      id: 8,
      content: 'Our values don’t match - e.g.religion, politics',
      type: 'OUR_VALUES_DONOT_MATCH',
    },
  ]

  // Handle disqualify button press
  const handleDisqualifyPress = async (user) => {
    const canDQ = await canDisqualify();
    if (!canDQ) {
      return;
    }
    setActiveDot(user);
    refRBSheet.current.open();
  };

  // const getMatchUsersList = async () => {
  //   setLoading(true);
  //   const userDetail = await getUserDetail();
  //   const data = {
  //     user_id: userDetail?.data?.id,
  //     prefered_gender: userDetail?.data?.prefered_gender,
  //   };

  //   setCurrentUser(userDetail?.data);
  //   console.log('userDetail', data);

  //   const response = await getMatchUsers(data);

  //   console.log('getMatchUsers>>>>>>>>>>>>>>>>>', JSON.stringify(response, null, 2))


  //   const cardNames = ['fate', 'K', 'J', '10', 'A'];
  //   const cardTypes = ['FATE', 'NORMAL', 'NORMAL', 'NORMAL', 'ANONYMOUS'];

  //   const newMatchList = response?.matches?.map((user, index) => {
  //     const cardName = cardNames[index % cardNames.length];
  //     const cardType = cardTypes[index % cardNames.length];
  //     const cardImageKey = 'f_' + cardName;
  //     return {
  //       id: user.user_id,
  //       image: user.profile_image,
  //       images: user.images || [user.profile_image],
  //       name: user.name,
  //       status: 'Online',
  //       card_name: cardName,
  //       card_type: cardType,
  //       card_image: Images[cardImageKey],
  //       age: user.age,
  //       waitingForMatch: false,
  //     };
  //   }) || [];

  //   const jokerEntry = {
  //     id: 6,
  //     image: null,
  //     name: '',
  //     status: 'Offline',
  //     card_name: 'Joker',
  //     card_type: 'JOKER',
  //     age: null,
  //     card_image: Images.joker,
  //   };

  //   newMatchList.push(jokerEntry);

  //   console.log('newMatchList prepared, now fetching joker card');

  //   // Important: Don't update fateList yet, wait until joker card info is loaded
  //   // Instead of setFateList(newMatchList), we'll temporarily store it
  //   const tempMatchList = [...newMatchList];

  //   // Call joker card and only then update the UI with the complete list
  //   try {
  //     const userDetail = await getUserDetail();
  //     const data = {
  //       user_id: userDetail?.data?.id,
  //       prefered_gender: userDetail?.data?.prefered_gender,
  //       isSystemAssigned: userDetail?.data?.subscription_type == null ||
  //         userDetail?.data?.subscription_type == 'free' ||
  //         userDetail?.data?.subscription_type == 'FREE' ? 'TRUE' : 'FALSE',
  //     };
  //     const response = await getUserJokerCard(data);

  //     console.log('getUserJokerCard response:', JSON.stringify(response, null, 2));

  //     // Update the joker card in the temp list
  //     if (response?.isSystemAssigned === 'TRUE' && (response?.alreadyAssigned == true || response?.alreadyAssigned == false)) {
  //       // For free users with system assigned joker
  //       const jokerIndex = tempMatchList.findIndex(user => user.card_type === 'JOKER');
  //       if (jokerIndex !== -1 && response?.newJokerCard) {
  //         tempMatchList[jokerIndex] = {
  //           id: response?.newJokerCard?.user_id || response?.newJokerCard?.id,
  //           image: response?.newJokerCard?.profile_image,
  //           name: response?.newJokerCard?.name,
  //           status: 'Online',
  //           card_name: 'Joker',
  //           card_type: 'JOKER',
  //           card_image: Images.joker,
  //           age: response?.newJokerCard?.age || null,
  //         };
  //       }
  //     }
  //     else if (response?.isSystemAssigned === 'FALSE' && response?.alreadyAssigned == false) {
  //       // For paid users with already assigned joker
  //       const jokerIndex = tempMatchList.findIndex(user => user.card_type === 'JOKER');
  //       if (jokerIndex !== -1 && response?.newJokerCard) {
  //         tempMatchList[jokerIndex] = {
  //           id: response?.newJokerCard?.user_id || response?.newJokerCard?.id,
  //           image: response?.newJokerCard?.profile_image,
  //           name: response?.newJokerCard?.name,
  //           status: 'Online',
  //           card_name: 'Joker',
  //           card_type: 'JOKER',
  //           card_image: Images.joker,
  //           age: response?.newJokerCard?.age || null,
  //         };
  //       }
  //     }

  //     // Now set the fateList with the complete data including joker
  //     console.log('Setting final fateList with joker data included');
  //     setFateList(tempMatchList);
  //   } catch (error) {
  //     console.log('Error fetching joker card:', error);
  //     // If there's an error fetching joker, still show the match list
  //     setFateList(tempMatchList);
  //   }

  //   // After all API calls are done, pick first user and set as active
  //   // const firstUser = response.matches[0];
  //   const firstUser = tempMatchList[0];
  //   if (firstUser && firstUser.images && firstUser.images.length > 0) {
  //     console.log('Setting first user as active:', firstUser.name);
  //     setCarouselImages(firstUser.images);
  //     setActiveSlide(0);
  //     setActiveImageIndex(0);
  //     setActiveUser(firstUser); // Set the first user as active user

  //     // Preload images for better performance
  //     preloadImages(firstUser.images);
  //   }

  //   setLoading(false);
  //   setToolTipVisible(true);
  // };

  //  Store the disqualification timestamp

  const getMatchUsersList = async () => {
    setLoading(true);
    const userDetail = await getUserDetail();
    const data = {
      user_id: userDetail?.data?.id,
      prefered_gender: userDetail?.data?.prefered_gender,
    };

    setCurrentUser(userDetail?.data);
    console.log('userDetail', data);

    const response = await getMatchUsers(data);

    console.log('getMatchUsers>>>>>>>>>>>>>>>>>', JSON.stringify(response, null, 2));

    const cardNames = ['fate', 'K', 'J', '10', 'A'];
    const cardTypes = ['FATE', 'NORMAL', 'NORMAL', 'NORMAL', 'ANONYMOUS'];

    const newMatchList = response?.matches?.map((user, index) => {
      const cardName = cardNames[index % cardNames.length];
      const cardType = cardTypes[index % cardNames.length];
      const cardImageKey = 'f_' + cardName;
      return {
        id: user.user_id,
        image: user.profile_image,
        images: user.images || [user.profile_image],
        name: user.name,
        status: 'Online',
        card_name: cardName,
        card_type: cardType,
        card_image: Images[cardImageKey],
        age: user.age,
        waitingForMatch: false,
        userDetail: user,
      };
    }) || [];

    // 🔴 COMMENTED OUT JOKER LOGIC BELOW
    /*
    const jokerEntry = {
      id: 6,
      image: null,
      name: '',
      status: 'Offline',
      card_name: 'Joker',
      card_type: 'JOKER',
      age: null,
      card_image: Images.joker,
    };
  
    newMatchList.push(jokerEntry);
  
    const tempMatchList = [...newMatchList];
  
    try {
      const userDetail = await getUserDetail();
      const data = {
        user_id: userDetail?.data?.id,
        prefered_gender: userDetail?.data?.prefered_gender,
        isSystemAssigned: userDetail?.data?.subscription_type == null ||
          userDetail?.data?.subscription_type == 'free' ||
          userDetail?.data?.subscription_type == 'FREE' ? 'TRUE' : 'FALSE',
      };
      const response = await getUserJokerCard(data);
  
      // update logic...
      setFateList(tempMatchList);
    } catch (error) {
      console.log('Error fetching joker card:', error);
      setFateList(tempMatchList);
    }
    */

    // ✅ Directly set fateList without Joker
    setFateList(newMatchList);

    const firstUser = newMatchList[0];
    if (firstUser && firstUser.images && firstUser.images.length > 0) {
      console.log('Setting first user as active:', firstUser.name);
      setCarouselImages(firstUser.images);
      setActiveSlide(0);
      setActiveImageIndex(0);
      setActiveUser(firstUser);
      preloadImages(firstUser.images);
    }

    setLoading(false);
    setToolTipVisible(true);
  };

  const storeDisqualifyTimestamp = async () => {
    const now = new Date();
    const disqualifyTimestamp = now.getTime(); // Store the current time in milliseconds
    await AsyncStorage.setItem('lastDisqualifyTimestamp', JSON.stringify(disqualifyTimestamp));
  };
  //  Check if the user has disqualified someone within the last 48 hours
  const canDisqualify = async () => {
    const lastDisqualifyTimestamp = await AsyncStorage.getItem('lastDisqualifyTimestamp');
    console.log('last disqualicfaiotn', lastDisqualifyTimestamp);

    if (!lastDisqualifyTimestamp) {
      // Allow disqualification if no timestamp exists
      return true;
    }

    const now = new Date().getTime();
    const hoursSinceLastDisqualify = (now - JSON.parse(lastDisqualifyTimestamp)) / (1000 * 60 * 60);

    if (hoursSinceLastDisqualify < 48) {
      Alert.alert('You cannot disqualify another user within 48 hours.');
      return false;
    }

    return true; // User can disqualify if 48 hours have passed
  };




  const disqualifyUserHandler = async (reason, type) => {


    refRBSheet_reasons.current.close();
    setLoading(true);
    const userDetail = await getUserDetail();
    const data = {
      user_id: userDetail?.data?.id,
      disqualify_user_id: activeDot.id,
      reason: reason,
      type: type,
    };

    const response = await disQualifyUser(data);
    console.log('disQualifyUser', response); if (response?.error == false) {
      // remove 30 tokens
      //
      const data = {
        user_id: userDetail?.data?.id,
        new_tokens: -30
      }
      const res = await addToken(data);
      console.log('addToken', res);
      await storeDisqualifyTimestamp(); // Store timestamp of this disqualification

      // Refresh the match list
      await getMatchUsersList();

      Alert.alert('Success', 'User has been disqualified successfully.');
    } else {
      Alert.alert('Error', 'Failed to disqualify user. Please try again.');
    }

    setLoading(false);
  };

  const callUserJokerCard = async (from_home) => {
    from_home ? setLoading(true) : null;

    try {
      const userDetail = await getUserDetail();
      const data = {
        user_id: userDetail?.data?.id,
        prefered_gender: userDetail?.data?.prefered_gender,
        isSystemAssigned: userDetail?.data?.subscription_type == null || userDetail?.data?.subscription_type == 'free' || userDetail?.data?.subscription_type == 'FREE' ? 'TRUE' : 'FALSE',
      };
      const response = await getUserJokerCard(data);

      console.log('getUserJokerCard', JSON.stringify(response, null, 2));

      from_home ? setLoading(false) : null;
      if (response?.isSystemAssigned === 'TRUE'
        && (response?.alreadyAssigned == true
          || response?.alreadyAssigned == false)
      ) {
        setFateList((prev) => {
          return prev.map((user) => {
            if (user.id === 6) {
              return {
                id: response?.newJokerCard?.user_id || response?.newJokerCard?.id,
                image: response?.newJokerCard?.profile_image,
                name: response?.newJokerCard?.name,
                status: 'Online',
                card_name: 'Joker',
                card_type: 'JOKER',
                card_image: Images.joker,
              };
            }
            return user;
          });
        });
      }
      else if (response?.isSystemAssigned === 'FALSE' && response?.alreadyAssigned == true) {
        setFateList((prev) => {
          return prev.map((user) => {
            if (user.id === 6) {
              return {
                id: response?.newJokerCard?.user_id || response?.newJokerCard?.id,
                image: response?.newJokerCard?.profile_image,
                name: response?.newJokerCard?.name,
                status: 'Online',
                card_name: 'Joker',
                card_type: 'JOKER',
                card_image: Images.joker,
              };
            }

            return user;
          });
        });
      }
      else if (response?.isSystemAssigned === 'FALSE' && response?.alreadyAssigned == false) {
        if (from_home == false) {
          // null
        }
        else {
          setJokerSuggestion(response.jokerCards);
          refRBSheet_jokerList.current.open();
        }
      }
    }
    catch (error) {
      console.log('error', error);
      from_home ? setLoading(false) : null;
    }


  };
  const addJokerToUser = async (item) => {
    setLoading(true);
    refRBSheet_jokerList.current.close();
    const userDetail = await getUserDetail();
    const data = {
      from_user_id: userDetail?.data?.id,
      to_user_id: userDetail?.data?.id,
      jokercard: {
        user_id: item?.user_id
      },
      isSystemAssigned: userDetail?.data?.subscription_type == null || userDetail?.data?.subscription_type == 'free' || userDetail?.data?.subscription_type == 'FREE' ? 'TRUE' : 'FALSE',
    };
    const response = await assignJokerToUser(data);
    console.log('assignJokerToUser', response)
    // remove 60 tokens
    const data1 = {
      user_id: userDetail?.data?.id,
      new_tokens: -60
    }
    const res = await addToken(data1);
    console.log('addToken', res);
    setLoading(false);
    if (response.error === false) {


      setTimeout(async () => {
        await callUserJokerCard(false);
        refRBSheet_JokerSent.current.open();
      }, 500);
      setTimeout(() => {
        refRBSheet_JokerSent.current.close();
      }, 3000);
    }


  };

  // need to uncomment this code

  useEffect(() => {
    console.log('HomePage');
    getMatchUsersList();
  }, []);
  useEffect(() => {
    // if (isUpdated && !loading) {
    //   getMatchUsersList();
    //   navigation.setParams({ isUpdated: false });
    // }

    // }, [isFocused]);
  }, [isFocused]);




  const getUserData = async () => {
    const userDetail = await getUserDetail();
    setCurrentUser(userDetail?.data);

    // remvoe user form the rullet
    console.log('userDetail', userDetail?.data?.id);
    const data = {
      user_id: userDetail?.data?.id,
    }
    // const response = await removeUserFromFateRullet(data);
    // console.log('removeUserFromFateRullet', response);
    // check current screen name 





  }
  useEffect(() => {
    getUserData()
  }, [isFocused]);

  const DisqualifyComponent = () => {
    return (<TouchableOpacity activeOpacity={0.9} style={styles.fate_card_main_container}>
      <LinearGradient
        colors={[COLORS.white, COLORS.white]}
        style={{
          flex: 1,
          paddingLeft: 15,
          paddingRight: 15,
          borderRadius: 5,
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 5,
          borderRadius: 10,
          borderColor: COLORS.secondary,
        }}
      >


        <Text
          style={{
            textAlign: 'center',
            fontSize: responsiveFontSize(2.5),
            fontWeight: 'bold',
            color: COLORS.secondary,
          }}
          fontFamily={'Jost-Medium'}>
          User{'\n'}
          Disqualified
        </Text>
        <Text color={'red'}
          style={{
            textAlign: 'center',
            fontSize: responsiveFontSize(1.5),
            marginTop: responsiveHeight(2),
          }}
          fontFamily={'Jost-Medium'}>
          The New User will be shown in 1 Hour
        </Text>
      </LinearGradient>


    </TouchableOpacity>
    )
  }

  // Function to handle joker card press
  const handleJokerCardPress = useCallback(() => {
    callUserJokerCard(true);
  }, []);

  // Function to handle exclamation press
  const handleExclamationPress = async (item) => {
    console.log('Exclamation pressed for item:', item);
    const canProceed = await canDisqualify();
    console.log('not proceed', canProceed);

    if (!canProceed) {
      console.log('Cannot proceed');
      return;
    }

    // Only executed when canProceed is true
    setActiveDot(item);
    console.log('yes proceed');

    if (refRBSheet && refRBSheet.current) {
      console.log('Opening refRBSheet');
      refRBSheet.current.close();

      setTimeout(() => {
        refRBSheet.current.open();
      }, 500);
    } else {
      console.log('refRBSheet is not initialized or is null');
    }
  };

  // Create a keyExtractor function outside of render
  const keyExtractor = useCallback((item, index) =>
    (item.id ? item.id.toString() : index.toString()), []);

  // Function to handle card selection
  const handleCardSelect = useCallback((selectedItem) => {
    if (selectedItem && selectedItem.images && selectedItem.images.length > 0) {
      console.log('Updating active user to:', selectedItem.name);
      // First set loading state to true
      setImageLoading(true);
      // Update the active user
      setActiveUser(selectedItem);
      // Update the carousel images
      setCarouselImages(selectedItem.images);
      // Reset the active image index
      setActiveImageIndex(0);
      // Preload images for better performance
      preloadImages(selectedItem.images);
    }
  }, [preloadImages]);


  // Create an optimized list footer component
  const ListFooter = useCallback(() => (
    <View style={{ height: responsiveHeight(20) }} />
  ), []);

  // Reference to the joker card for the tooltip
  const jokerCardRef = useRef(null);

  // Find the joker card in the list data
  const jokerCard = fatelist.find(item => item.card_type === 'JOKER');

  // Create refs for each tooltip target
  const headerRef = useRef(null);
  const matchesGridRef = useRef(null);

  // State to store element measurements
  const [measurements, setMeasurements] = useState({
    homeHeader: null,
    matchesGrid: null,
    jokerCard: null
  });

  const [showTooltip, setShowTooltip] = useState({
    homeHeader: true,
    matchesGrid: false,
    jokerCard: false
  });

  // Set which tooltip to show based on current step
  useEffect(() => {
    if (showHomePageTour) {
      // Just show one tooltip for the matches grid
      setShowTooltip({
        matchesGrid: true,
        homeHeader: false,
        jokerCard: false,
      });

      // Measure the FlatList container for positioning the tooltip
      if (matchesGridRef.current) {
        measureElement(matchesGridRef, 'matchesGrid');
      }
    } else {
      setShowTooltip({
        homeHeader: false,
        matchesGrid: false,
        jokerCard: false,
      });
    }
  }, [currentHomeStep, showHomePageTour]);

  // Function to measure element position with improved logging
  const measureElement = (ref, key) => {
    if (!ref || !ref.current) {
      console.log(`DEBUG TOOLTIPS - Ref for ${key} is not available yet`);
      return;
    }

    setTimeout(() => {
      try {
        ref.current.measure((x, y, width, height, pageX, pageY) => {
          console.log(`DEBUG TOOLTIPS - Measured ${key}:`, { x: pageX, y: pageY, width, height });
          setMeasurements(prev => ({
            ...prev,
            [key]: {
              x: pageX,
              y: pageY,
              width,
              height
            }
          }));
        });
      } catch (error) {
        console.log(`DEBUG TOOLTIPS - Error measuring ${key}:`, error);
      }
    }, 500); // Increased timeout to ensure component is rendered
  };

  // Function to handle tooltip next button
  const handleNextStep = () => {
    dispatch(nextHomeStep());
    setShowTooltip({
      homeHeader: false,
      matchesGrid: false,
      jokerCard: false,
    });
    setMeasurements({
      homeHeader: null,
      matchesGrid: null,
      jokerCard: null
    });
    if (currentHomeStep === 0) {
      measureElement(matchesGridRef, 'matchesGrid');
    }
    else if (currentHomeStep === 1) {
      measureElement(jokerCardRef, 'jokerCard');
    }
    else if (currentHomeStep === 2) {
      measureElement(headerRef, 'homeHeader');
    }
    // Check if we need to navigate to ChatList
    if (currentHomeStep === homePageSteps.length - 1) {
      dispatch(skipHomePageTour());
      navigation.navigate('ChatList');
    }

  };

  // Function to handle tooltip skip button
  const handleSkipTour = () => {
    dispatch(skipHomePageTour());
  };

  // Audio player functions
  const playAudioFromURL = (audioURL) => {
    const soundInstance = new Sound(audioURL, '', (error) => {
      if (error) {
        console.error('Error loading sound:', error);
        return;
      }

      const totalDuration = soundInstance.getDuration();
      setDuration(totalDuration);
      setSoundPlayer(soundInstance);
      animatedWidth.setValue(0);

      soundInstance.play((success) => {
        if (success) {
          console.log('Audio playback finished');
        } else {
          console.error('Audio playback failed');
        }
        setIsPlaying(false);
        clearInterval(intervalRef.current);
        animatedWidth.setValue(0);
      });

      setIsPlaying(true);

      intervalRef.current = setInterval(() => {
        soundInstance.getCurrentTime((currentTime) => {
          if (currentTime && totalDuration > 0) {
            const progress = (currentTime / totalDuration) * 100;
            animatedWidth.setValue(progress);
          }
        });
      }, 100);
    });
  };

  const stopAudio = () => {
    if (isPlaying && soundPlayer) {
      soundPlayer.stop(() => {
        clearInterval(intervalRef.current);
        animatedWidth.setValue(0);
        soundPlayer.release();
      });
      setIsPlaying(false);
    }
  };

  // Audio player is now integrated directly in the user info panel

  // Function to navigate to next user in the matches list
  const handleNextUser = () => {
    if (fatelist.length === 0) return;
    console.log('Handling next user in the matches list');
    console.log('Active user:', activeUser?.name);
    console.log('Fatelist:', JSON.stringify(fatelist.map(user => ({
      id: user.id,
      name: user.name,
      hasImages: !!user.images
    })), null, 2));

    // If activeUser is null, try to set the first valid user
    if (!activeUser) {
      for (let i = 0; i < fatelist.length; i++) {
        if (fatelist[i]?.images?.length > 0) {
          setActiveUser(fatelist[i]);
          setActiveDot(fatelist[i]);
          setCarouselImages(fatelist[i].images);
          setActiveImageIndex(0);
          break;
        }
      }
      return;
    }

    // Find current user index
    let currentIndex = -1;
    for (let i = 0; i < fatelist.length; i++) {
      if (fatelist[i].id === activeUser.id) {
        currentIndex = i;
        break;
      }
    }

    if (currentIndex === -1) return;

    // Find next valid user
    let nextIndex = currentIndex;
    let foundValidUser = false;
    let loopCount = 0;

    while (!foundValidUser && loopCount < fatelist.length) {
      nextIndex = (nextIndex + 1) % fatelist.length;
      const nextUser = fatelist[nextIndex];

      if (nextUser?.images && nextUser.images.length > 0) {
        foundValidUser = true;

        console.log('Found next user:', nextUser.name);

        // Fade out current image
        console.log('Starting animation to switch to user:', nextUser.name);
        console.log('Next user images:', nextUser.images);

        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true
        }).start(() => {
          console.log('INSIDE ANIMATION CALLBACK - Setting new user:', nextUser.name);

          // Update states
          setCarouselImages(nextUser.images);
          setActiveImageIndex(0);
          setActiveUser(nextUser);
          setActiveDot(nextUser);
          setImageLoading(true);

          console.log('New carousel images set:', nextUser.images?.length || 0);
          console.log('New active user set:', nextUser.name);

          // Fade in new image
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
          }).start(() => {
            console.log('Fade-in animation complete');
          });

          // Preload images
          if (nextUser.images && nextUser.images.length > 0) {
            console.log('Preloading images for user:', nextUser.name);
            preloadImages(nextUser.images);
          } else {
            console.log('No images to preload for user:', nextUser.name);
          }

          // Force update after a short delay to ensure UI reflects new user
          setTimeout(() => {
            console.log('DELAYED CHECK - Current active user:', activeUser?.name);
          }, 500);
        });

        break;
      }

      loopCount++;
    }

    if (!foundValidUser) {
      console.log('No valid next user found with images');
    }
  };

  // Function to navigate to previous user in the matches list
  const handlePrevUser = () => {
    if (fatelist.length === 0) return;
    console.log('Handling previous user in the matches list');

    // If activeUser is null, try to set the first valid user
    if (!activeUser) {
      for (let i = 0; i < fatelist.length; i++) {
        // Accept Joker card with null image or users with images
        if ((fatelist[i].card_type === 'JOKER') || (fatelist[i]?.images?.length > 0)) {
          setActiveUser(fatelist[i]);
          setActiveDot(fatelist[i]);

          // If it's a Joker card with null image, set empty images array
          if (fatelist[i].card_type === 'JOKER' && fatelist[i].image === null) {
            setCarouselImages([]);
          } else {
            setCarouselImages(fatelist[i].images || []);
          }

          setActiveImageIndex(0);
          break;
        }
      }
      return;
    }

    // Find current user index
    let currentIndex = -1;
    for (let i = 0; i < fatelist.length; i++) {
      if (fatelist[i].id === activeUser.id) {
        currentIndex = i;
        break;
      }
    }

    if (currentIndex === -1) return;

    // Find previous valid user
    let prevIndex = currentIndex;
    let foundValidUser = false;
    let loopCount = 0;

    while (!foundValidUser && loopCount < fatelist.length) {
      prevIndex = (prevIndex - 1 + fatelist.length) % fatelist.length;
      const prevUser = fatelist[prevIndex];

      // Accept Joker card with null image or users with images
      if ((prevUser.card_type === 'JOKER') || (prevUser?.images && prevUser.images.length > 0)) {
        foundValidUser = true;

        console.log('Found previous user:', prevUser.name);

        // Fade out current image
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true
        }).start(() => {
          // Update states
          // If it's a Joker card with null image, set empty images array
          if (prevUser.card_type === 'JOKER' && prevUser.image === null) {
            setCarouselImages([]);
          } else {
            setCarouselImages(prevUser.images || []);
          }
          setActiveImageIndex(0);
          setActiveUser(prevUser);
          setActiveDot(prevUser);
          setImageLoading(true);

          // Fade in new image
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
          }).start();

          // Preload images if available
          if (prevUser?.images && prevUser.images.length > 0) {
            preloadImages(prevUser.images);
          }
        });

        break;
      }

      loopCount++;
    }

    if (!foundValidUser) {
      console.log('No valid previous user found with images');
    }
  };

  // Function to navigate to next image in the story progress  
  const handleNextImage = () => {
    // Don't try to navigate images for Joker cards with null image
    if (activeUser?.card_type === 'JOKER' && activeUser?.image === null) {
      return;
    }

    if (carouselImages.length > 0) {
      const nextIndex = (activeImageIndex + 1) % carouselImages.length;

      // Fade out current image
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setImageLoading(true);
        setActiveImageIndex(nextIndex);

        // Fade in new image
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });

      // Preload the next image for smooth transition
      const nextNextIndex = (nextIndex + 1) % carouselImages.length;
      if (carouselImages[nextNextIndex]) {
        FastImage.preload([{
          uri: carouselImages[nextNextIndex],
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable
        }]);
      }
    }
  };

  // Function to navigate to previous image in the story progress
  const handlePrevImage = () => {
    // Don't try to navigate images for Joker cards with null image
    if (activeUser?.card_type === 'JOKER' && activeUser?.image === null) {
      return;
    }

    if (carouselImages.length > 0) {
      const prevIndex = (activeImageIndex - 1 + carouselImages.length) % carouselImages.length;

      // Fade out current image
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setImageLoading(true);
        setActiveImageIndex(prevIndex);

        // Fade in new image
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });

      // Preload the previous image for smooth transition
      const prevPrevIndex = (prevIndex - 1 + carouselImages.length) % carouselImages.length;
      if (carouselImages[prevPrevIndex]) {
        FastImage.preload([{
          uri: carouselImages[prevPrevIndex],
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable
        }]);
      }
    }
  };

  // Image preloading for better performance  
  const preloadImages = useCallback((imageUrls) => {
    if (!imageUrls || imageUrls.length === 0) return;

    // Always start with loading state true when new images are being preloaded
    setImageLoading(true);

    // Reset loading states for new images
    const newLoadingStates = {};
    imageUrls.forEach((_, index) => {
      newLoadingStates[index] = true;
    });
    setImageLoadingStates(newLoadingStates);

    // Preload first 3 images for immediate viewing
    const imagesToPreload = imageUrls.slice(0, Math.min(3, imageUrls.length));

    // Start preloading the images
    imagesToPreload.forEach((imageUrl, index) => {
      if (imageUrl) {
        FastImage.preload([{
          uri: imageUrl,
          priority: index === 0 ? FastImage.priority.high : FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable
        }]);
      }
    });

    // For the first image, we'll automatically mark it as loaded after a reasonable timeout
    // This ensures the loader disappears even if the onLoad event doesn't fire for some reason
    setTimeout(() => {
      if (imageUrls.length > 0) {
        handleImageLoadEnd(0);
      }
    }, 5000);
  }, []);

  // Enhanced error handling for image loading
  const handleImageError = useCallback((error, imageIndex) => {
    console.log(`Image load error at index ${imageIndex}:`, error);
    setImageLoadingStates(prev => ({
      ...prev,
      [imageIndex]: false
    }));

    if (imageIndex === activeImageIndex) {
      setImageLoading(false);
    }
  }, [activeImageIndex]);

  // Function to handle image load completion
  const handleImageLoadEnd = (imageIndex) => {
    if (imageIndex === activeImageIndex) {
      setImageLoading(false);
    }
    setImageLoadingStates(prev => ({
      ...prev,
      [imageIndex]: false
    }));
  };

  // Function to handle image load start
  const handleImageLoadStart = (imageIndex) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [imageIndex]: true
    }));
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <BottomSheet
          height={responsiveHeight(50)}
          ref={refRBSheet_activeUserInfo}
        >
          {/* Header Row with Name & Card Info */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: responsiveWidth(95),
              alignSelf: 'center',
              marginVertical: responsiveHeight(1),
            }}
          >
            <View>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2.5),
                  fontWeight: '600',
                  marginLeft: responsiveWidth(2),
                  fontFamily: fonts.PoppinsRegular,
                }}
              >
                {activeUser?.name ? activeUser.name : 'New User'}, {activeUser?.age ?? ''}
              </Text>

              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  marginLeft: responsiveWidth(2),
                  fontFamily: fonts.PoppinsRegular,
                }}
              >
                {activeUser?.card_name === 'fate'
                  ? '1st Match'
                  : activeUser?.card_name === 'Joker'
                    ? 'Joker Match'
                    : activeUser?.card_name === 'K'
                      ? '2nd Match'
                      : activeUser?.card_name === 'J'
                        ? '3rd Match'
                        : activeUser?.card_name === '10'
                          ? '4th Match'
                          : 'Anonymous'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                refRBSheet_activeUserInfo.current?.close();
              }}
            >
              <View style={{ padding: 5 }}>
                <XCircle size={30} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Conditional Content */}
          {activeUserDetailLoading ? (
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.white} />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                marginHorizontal: '5%',
                paddingBottom: 20,
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2.5),
                  fontWeight: '600',
                  fontFamily: fonts.PoppinsRegular,
                }}
              >
                Bio
              </Text>

              <Text
                style={{
                  color: COLORS.grey,
                  fontSize: responsiveFontSize(2),
                  fontWeight: '400',
                  fontFamily: fonts.PoppinsRegular,
                  marginTop: responsiveHeight(1),
                }}
              >
                {activeUserDetail?.bio_notes ?? 'No bio available.'}
              </Text>

              {/* Voice Note Section */}
              <View style={styles.audioContainer}>
                {activeUserDetail?.note ? (
                  <>
                    {console.log(`🔍 DEBUG: Active User ${activeUserDetail?.name} note URL:`, activeUserDetail.note)}
                    <MiniAudioPlayer
                      key={activeUserDetail.note} // ✅ Add key for remount
                      audioUrl={activeUserDetail.note}
                      autoPlay={false}
                      onClose={() => { }}
                    />
                  </>
                ) : (
                  <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <Image
                      source={Images.alert_purple}
                      style={{
                        width: 50,
                        height: 50,
                        alignSelf: 'center',
                        marginVertical: 10,
                      }}
                    />
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: responsiveFontSize(1.5),
                        fontFamily: fonts.PoppinsMedium,
                        textAlign: 'center',
                      }}
                    >
                      No voice note found
                    </Text>
                  </View>
                )}
              </View>
              <View
                style={{
                  height: responsiveHeight(5),
                }}
              />
            </ScrollView>
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              marginHorizontal: responsiveWidth(2),
              width: '95%',
              alignSelf: 'center!important',
              marginVertical: responsiveWidth(2),
              display: activeUser?.card_type === 'JOKER' && activeUser?.image === null ? 'none' : 'flex',
              marginBottom: responsiveHeight(4),
            }}
          >
            <TouchableOpacity
              activeOpacity={.6}
              style={{
                backgroundColor: COLORS.secondary2,
                borderRadius: 50,
                flexDirection: "row",
                paddingHorizontal: 7,
                alignItems: 'center',
                borderColor: 'rgba(252, 251, 253, 0.5)',
                borderWidth: 2,
                zIndex: 9999
              }}
              onPress={() => {
                refRBSheet_activeUserInfo.current?.close();
                handleExclamationPress(activeUser)
              }}
            >

              <Warning size={25}
                color={COLORS.white}
              />
              <Text
                style={{
                  padding: responsiveWidth(1),
                  fontFamily: fonts.PoppinsRegular,
                  fontWeight: 500,
                  color: COLORS.white
                }}
              >Disqualify</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={.6}
              style={{
                backgroundColor: COLORS.secondary2,
                borderRadius: 50,
                flexDirection: "row",
                paddingHorizontal: 7,
                alignItems: 'center',
                borderColor: 'rgba(252, 251, 253, 0.5)',
                borderWidth: 2
              }}
              onPress={() => {

                const isJoker = activeUser?.card_type === 'JOKER';


                // Update the active user when a card is pressed, except for waiting cards


                // Continue with the original navigation logic
                if (isJoker) {
                  if ((currentUser?.subscription_type == null ||
                    currentUser?.subscription_type == 'free' ||
                    currentUser?.subscription_type == 'FREE')
                  ) {
                    // navigation.navigate('ViewProfile', {
                    //   current_user: currentUser,
                    //   other_user: activeUser,
                    // });

                    navigation.navigate('Chats_New', {
                      currentUser: currentUser?.id,
                      otherUser: activeUser?.id,
                      otherUserImage: activeUser?.image,
                      otherUserName: activeUser?.name,
                    });
                    refRBSheet_activeUserInfo.current?.close();
                  } else if (currentUser?.subscription_type == 'silvermonthly12345_new' ||
                    currentUser?.subscription_type == 'goldmonthly12345_new' ||
                    currentUser?.subscription_type == 'platinummonthly12345_new'
                  ) {
                    // onJokerCardPress();
                    alert('Joker Card Pressed');
                  }
                } else {
                  // navigation.navigate('ViewProfile', {
                  //   current_user: currentUser,
                  //   other_user: activeUser,
                  // });
                  navigation.navigate('Chats_New', {
                    currentUser: currentUser?.id,
                    otherUser: activeUser?.id,
                    otherUserImage: activeUser?.image,
                    otherUserName: activeUser?.name,
                  });
                  refRBSheet_activeUserInfo.current?.close();
                }


              }}
            >

              <ChatTeardropDots size={25}
                color={COLORS.white}
              />
              <Text
                style={{
                  padding: responsiveWidth(1),
                  fontFamily: fonts.PoppinsRegular,
                  fontWeight: 500,
                  color: COLORS.white
                }}
              >Message</Text>
            </TouchableOpacity>


          </View>
        </BottomSheet>

        <BottomSheet ref={refRBSheet}>
          <View
            style={{
              marginTop: responsiveHeight(3),
            }}>
            <Image source={Images.warning} style={{ width: 50, height: 50, alignSelf: 'center' }} />
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2.5),
                fontFamily: fonts.PoppinsMedium,
                textAlign: 'center',
                width: responsiveWidth(70),
                marginVertical: responsiveHeight(2),
                alignSelf: 'center',
              }}>
              Are you sure you want to{'\n'} disqualify this user?
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
                onPress={() => {
                  refRBSheet.current.close();
                }}
                style={{
                  // marginTop: responsiveHeight(5),
                  alignSelf: 'center',
                  width: responsiveWidth(30),
                  backgroundColor: COLORS.primary,
                  padding: 0,
                }}
              />
              <PrimaryButton
                title="Confirm"
                onPress={() => {
                  refRBSheet.current.close();
                  setTimeout(() => {

                    refRBSheet_reasons.current.open();
                  }, 500);
                }}
                style={{
                  // marginTop: responsiveHeight(5),
                  alignSelf: 'center',
                  width: responsiveWidth(30),
                  padding: 0,
                }}
              />
            </View>
          </View>
        </BottomSheet>

        <BottomSheet
          height={
            Platform.OS === 'ios' ?
              responsiveHeight(60) : responsiveHeight(80)}
          ref={refRBSheet_reasons}

        >
          <View
            style={{
              marginHorizontal: responsiveWidth(3),

              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',

            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                // backgroundColor: 'red',
                width: responsiveWidth(90),
                paddingBottom: 10
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  fontFamily: fonts.PoppinsMedium,
                  // paddingVertical: responsiveHeight(2),
                  width: responsiveWidth(70),
                  fontWeight: '600',
                }}>
                Select a reason for Disqualifications
              </Text>
              <TouchableOpacity
                onPress={() => {
                  refRBSheet_reasons.current.close();
                }}
                style={{
                  padding: 8,
                  borderRadius: 50,
                  alignItems: 'center',
                }}
              >
                <XCircle color={COLORS.white} weight='fill' size={34} />
              </TouchableOpacity>
            </View>



            <FlatList


              showsVerticalScrollIndicator={false}
              data={disqualifyList}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      borderBottomWidth: 1,
                      borderColor: COLORS.grey + '50',
                    }}
                    onPress={() => {
                      disqualifyUserHandler(item.content, item.type);
                    }}
                  >
                    <Text
                      style={{
                        padding: 15,
                        color: COLORS.greylight,
                        fontFamily: fonts.PoppinsMedium,
                      }}
                    >{
                        item.content
                      }</Text>
                  </TouchableOpacity>
                )
              }}
              keyExtractor={item => item.id.toString()}

              style={{
                // marginTop: responsiveHeight(1),
              }}
              contentContainerStyle={{

              }}

              ListFooterComponent={() => {
                return (
                  <View
                    style={{
                      height: responsiveHeight(10),
                    }}></View>
                );
              }}
            />

          </View>
        </BottomSheet>
        <BottomSheet
          height={responsiveHeight(20)}
          ref={refRBSheet_JokerSent}>
          <View
            style={{
              marginTop: responsiveHeight(3),
            }}>
            <Image source={Images.app_logo} style={{ width: 50, height: 50, alignSelf: 'center' }} />
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2.5),
                fontFamily: fonts.JostMedium,
                textAlign: 'center',
                width: responsiveWidth(70),
                marginVertical: responsiveHeight(2),
                alignSelf: 'center',
              }}>
              Joker Card Sent Successfully
            </Text>

          </View>
        </BottomSheet>
        <RBSheet
          ref={refRBSheet_jokerList}
          height={responsiveHeight(70)}
          openDuration={250}
          customStyles={{
            container: {
              backgroundColor: COLORS.black,
              width: responsiveWidth(90),
              borderRadius: 20,
              // padding: 20,
              marginBottom: responsiveHeight(15),
              alignSelf: 'center',
              height: responsiveHeight(70),
              borderRadius: 20,
              borderWidth: 1,
              overflow: 'hidden',
              borderColor: COLORS.light + '50',
            },
          }}
          animationType={'fade'}
        >
          <View
            gradientStyle={{
              width: responsiveWidth(90),
              alignSelf: 'center',
              height: '100%',

            }}
          >
            <View
              style={{
                flexDirection: 'row',
                width: responsiveWidth(80),
                zIndex: 999,
                marginVertical: responsiveHeight(1),
                alignItems: 'center',
                marginHorizontal: responsiveWidth(3),
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  fontWeight: '600',
                  width: responsiveWidth(100),
                  // fontFamily: fonts.JostMedium,
                }}
              >
                Select a profile to {'\n'}send a Joker Card
              </Text>
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  position: 'absolute',
                  right: 0,
                }}
                onPress={() => {
                  refRBSheet_jokerList.current.close();
                }}
              >
                <Icon name="times" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <FlatList

              showsVerticalScrollIndicator={true}
              data={jokerSuggerstion}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      flexDirection: 'row',
                      marginTop: responsiveHeight(1),
                    }}
                    onPress={() => {
                      console.log('item', item);
                      addJokerToUser(item);
                      // refRBSheet_jokerList.current.close();

                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        width: '80%',
                      }}
                    >
                      <Image
                        source={{
                          uri: item?.profile_image === null ? Images.app_logo : item?.profile_image,
                        }}
                        style={{
                          width: Platform.OS === 'ios' ? responsiveWidth(15) : responsiveWidth(13),

                          height: responsiveHeight(7),
                          borderRadius: 100,
                          resizeMode: 'cover',
                        }}
                      />
                      <View>
                        <Text
                          style={{
                            color: COLORS.white,
                            fontSize: responsiveFontSize(2),
                            marginTop: responsiveHeight(0.5),
                            marginHorizontal: responsiveWidth(3),
                            fontWeight: '600',
                          }}>
                          {item.name}
                        </Text>
                        <Text
                          style={{
                            color: COLORS.white,
                            fontSize: responsiveFontSize(1.6),
                            marginTop: responsiveHeight(0.5),
                            marginHorizontal: responsiveWidth(3),
                            display: item?.age === null ? 'none' : 'flex',

                          }}>
                          {item?.age} Year | {item?.user_id}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        justifyContent: 'center',
                        flexDirection: 'row',
                        width: '20%',
                      }}
                    >

                      <Icon name="paper-plane"
                        style={{
                          padding: 10,
                          backgroundColor: 'rgba(255, 255, 255, 0.16)',
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.06)',
                          overflow: 'hidden',
                        }}
                        size={20} color={COLORS.white} />

                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
              style={{
                // marginTop: Platform.OS === 'ios' ? responsiveHeight(2) :
                //   responsiveHeight(3),
                width: '95%',
                alignSelf: 'center',
                // paddingHorizontal: responsiveWidth(2),
                // paddingTop: responsiveHeight(2),

              }}

              ListFooterComponent={() => {
                return (
                  <View
                    style={{
                      height: responsiveHeight(10),
                    }}></View>
                );
              }}
            />
          </View>
        </RBSheet>

        {/* Home header - NOT wrapped with Tooltip directly */}
        <View >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: responsiveWidth(90),
              marginTop: Platform.OS === 'ios' ? responsiveHeight(0) : responsiveHeight(2),
              paddingVertical: responsiveWidth(3),
              marginHorizontal: responsiveWidth(2),
            }}>
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2.5),
                fontFamily: fonts.PoppinsMedium,
              }}>
              <House color={COLORS.white} weight='fill' size={24} />
              {'  '}Matches
            </Text>
            <TouchableOpacity
              onPress={() => {
                getMatchUsersList();
              }}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 3,
              }}
            >
              <ArrowsClockwise color={COLORS.white} weight='fill' size={24} />
            </TouchableOpacity>
          </View>

        </View>

        {/* Matches grid - NOT wrapped with Tooltip directly */}
        <View ref={matchesGridRef} nativeID="matches-grid" style={{ flex: 1 }}>



          {/* {NEW WORK } */}
          <View

            style={{
              backgroundColor: COLORS.primary,
              height: '90%',
              borderRadius: 30,
              borderWidth: 4,
              borderColor: COLORS.primary,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {
              loading ? (
                <ActivityIndicator
                  size={'large'}
                  color={COLORS.white}
                />) : (

                Array.from({ length: 2 }, (_, i) => {
                  const userIndex = (index + i) % fatelist?.length;
                  const user = fatelist?.[userIndex];
                  return (
                    <SwipeableCard
                      key={`${user?.user_id}-${index + i}`} // Unique key for infinite scrolling
                      user={user}
                      onSwipeLeft={() => handleSwipe('left')}

                      onSwipeRight={() => handleSwipe('right')}
                    />
                  );
                }).reverse()
              )
            }





          </View>

        </View >

        {/* Tooltips positioned above all content, but only visible based on state */}


        < CustomTooltip
          isVisible={showTooltip.matchesGrid}
          content={
            < TourGuideTooltip
              content={homePageSteps[currentHomeStep]?.content}
              onNext={handleNextStep}
              onSkip={handleSkipTour}
              isLastStep={currentHomeStep === homePageSteps.length - 1
              }
            />
          }
          placement="bottom"
          onClose={() => { }}
          targetMeasurements={measurements.matchesGrid}
          backgroundColor="rgba(0,0,0,0.5)"
          contentStyle={{ backgroundColor: '#F46CE3' }}
          tooltipStyle={{ minHeight: 0 }}
          arrowSize={{ width: 24, height: 12 }}
        />


      </SafeAreaView >
    </GradientBackground >
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.7,
    backgroundColor: 'black',
  },
  fate_card_main_container: {
    width: responsiveWidth(40),
    height: responsiveHeight(30),
    marginHorizontal: responsiveWidth(2),
    // marginLeft: "2%",
    backgroundColor: '#e754caff',
    marginVertical: responsiveHeight(1),
    borderRadius: 10,
  },
  fate_card_header_container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: responsiveWidth(1),
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  fate_card_header_image: {
    width: responsiveWidth(4),
    height: responsiveHeight(2),
    resizeMode: 'contain',
  },
  fate_card_body_bkg_image: {
    width: '70%',
    alignSelf: 'center',
    position: 'absolute',
    top: responsiveHeight(3),
    height: responsiveHeight(24),
    overflow: 'hidden',
    borderRadius: 10,
  },
  fate_card_body_bkg_image_style: {
    width: '100%',
    height: 'auto',
  },
  fate_card_body_main_blurview: {
    position: 'absolute',
    bottom: -1,
    width: '100%', // Set the width you desire
    height: responsiveHeight(5), // Set the height you desire
    borderRadius: 10, // This will be the border radius for the container
    overflow: 'hidden',
  },
  fate_card_body_blurview: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    // backgroundColor: "rgba(0, 0, 255, 0.5)",
    paddingLeft: responsiveWidth(2),
    paddingTop: responsiveWidth(0.5),
  },
  fate_card_body_blurview_heading: {
    color: 'black',
    fontSize: responsiveFontSize(1.6),
    fontFamily: 'Jost-Medium',
    position: 'absolute',
    top: 0,
    left: responsiveWidth(2),
  },
  fate_card_body_blurview_text: {
    color: 'black',
    fontSize: responsiveFontSize(1.2),
    fontFamily: 'Jost-Medium',
    position: 'absolute',
    bottom: responsiveHeight(0.5),
    left: responsiveWidth(2),
  },
  fate_card_footer_container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: responsiveWidth(1),
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  fate_card_footer_img: {
    width: responsiveWidth(4),
    height: responsiveHeight(2),
    resizeMode: 'contain',
    transform: [{ rotate: '180deg' }],
  },

  normal_card_main_container: {
    width: responsiveWidth(40),
    height: responsiveHeight(30),
    marginHorizontal: responsiveWidth(2),
    // marginLeft: "2%",
    backgroundColor: 'white',
    marginVertical: responsiveHeight(1),
    borderRadius: 10,
  },
  anoymous_card_main_container: {
    width: responsiveWidth(40),
    height: responsiveHeight(30),
    marginHorizontal: responsiveWidth(2),
    // marginLeft: "2%",
    // backgroundColor: 'red',
    marginVertical: responsiveHeight(1),
    borderRadius: 10,
  },
  normal_card_left_header: {
    // flexDirection: "row",
    justifyContent: 'flex-start',
    padding: responsiveWidth(1),
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    // width: "100%",
    height: '100%',
  },
  normal_card_left_header_image: {
    width: responsiveWidth(4),
    height: responsiveHeight(2),
    resizeMode: 'contain',
    marginTop: responsiveHeight(1),
  },
  normal_card_body_bkg_image: {
    width: '70%',
    alignSelf: 'center',
    position: 'absolute',
    top: responsiveHeight(3),
    height: responsiveHeight(24),
    overflow: 'hidden',
    borderRadius: 10,
  },
  normal_card_body_bkg_image_style: {
    width: '100%',
    height: 'auto',
  },
  normal_card_body_main_blurview: {
    position: 'absolute',
    bottom: -1,
    width: '100%', // Set the width you desire
    height: responsiveHeight(5), // Set the height you desire
    borderRadius: 10, // This will be the border radius for the container
    overflow: 'hidden',
  },




  normal_card_right_header_alert_icon: {
    position: 'absolute',
    top: responsiveHeight(0.6),
    zIndex: 9999,
  },
  normal_card_right_header_image: {
    width: responsiveWidth(4),
    height: responsiveHeight(2),
    resizeMode: 'contain',
    transform: [{ rotate: '180deg' }],
  },
  normal_card_right_header_text: {
    transform: [{ rotate: '180deg' }],
    marginTop: responsiveHeight(1),
  },
  // Story viewer styles
  storyViewerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyFlatList: {
    flex: 1,
    // backgroundColor: 'red',
    width: responsiveWidth(90),
  },
  storyContainer: {
    width: 'auto',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
  },
  storyImage: {
    width: 'auto',
    height: responsiveHeight(65),
    borderRadius: 15,
    alignSelf: 'center',
  },
  storyIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(5),
  },
  storyIndicator: {
    height: responsiveWidth(1),
    width: responsiveWidth(8),
    borderRadius: responsiveWidth(0.5),
    marginHorizontal: responsiveWidth(0.5),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  storyPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    margin: responsiveWidth(5),
  },
  storyPlaceholderText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(2),
    fontFamily: fonts.PoppinsMedium,
  },
  audioContainer: {
    justifyContent: 'space-between',
    // backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 15,
    // borderWidth: 1,
    // borderColor: 'rgba(255, 255, 255, 0.2)',
    // paddingHorizontal: responsiveWidth(2),
    // marginTop: responsiveHeight(2),
    paddingBottom: responsiveHeight(4),
  },
  stack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', backgroundColor: COLORS.black,

  },
  animatedCard: {

    width: width,
    height: height,

    borderRadius: 20,
    elevation: 5,
    overflow: 'hidden',
    backgroundColor: COLORS.black,
  },
  card: {
    flex: 1,
    height: 'auto',
    backgroundColor: COLORS.primary,
    backgroundColor: COLORS.black,
  },
  cardContent: {
    backgroundColor: COLORS.black,
    height: 'auto',
    // padding: 20,
  },
  image: {
    width: '100%',
    height: Platform.OS == 'android' ? height * 0.80 : height * 0.75,
    // borderRadius: 15,
    // marginBottom: 10,
    zIndex: -9
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  bio: {
    marginTop: 10,
    color: '#555',
  },
  section: {
    marginTop: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.white, // ✅ Background color already present - no shadow warning
    borderRadius: 20,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  animatedCard: {
    position: 'absolute',
    width: width * 0.9,
    height: height * 0.7,
    alignSelf: 'center',
  },
});
export default HomePage;
