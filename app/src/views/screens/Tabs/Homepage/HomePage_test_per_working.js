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
  Dimensions
} from 'react-native';
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
  addToken
} from '../../../../Services/Auth/SignupService';
import RBSheet from 'react-native-raw-bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import { useIsFocused } from '@react-navigation/native';
import {
  House
} from 'phosphor-react-native';
import FastImage from 'react-native-fast-image';
import DeviceInfo from 'react-native-device-info';
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

// Create a memoized version of MatchCardItem for better performance
const MatchCardItem = memo(({ item, currentUser, navigation, onExclamation, onJokerCardPress, isDeviceIpad }) => {
  const isJoker = item?.card_type === 'JOKER';

  const handlePress = () => {
    if (isJoker) {
      if ((currentUser?.subscription_type == null ||
        currentUser?.subscription_type == 'free' ||
        currentUser?.subscription_type == 'FREE')
      ) {
        navigation.navigate('ViewProfile', {
          current_user: currentUser,
          other_user: item,
        });
      } else if (currentUser?.subscription_type == 'silvermonthly12345_new' ||
        currentUser?.subscription_type == 'goldmonthly12345_new' ||
        currentUser?.subscription_type == 'platinummonthly12345_new'
      ) {
        onJokerCardPress();
      }
    } else if (item?.waitingForMatch != true) {
      navigation.navigate('ViewProfile', {
        current_user: currentUser,
        other_user: item,
      });
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={{
        width: responsiveWidth(42),
        height: isDeviceIpad ? responsiveHeight(30) : responsiveHeight(25),
        marginHorizontal: responsiveWidth(2),
        marginVertical: responsiveHeight(1),
      }}
    >
      <MatchCard
        bgColor={item?.card_type === 'FATE' ? COLORS.primary : '#c5acc2'}
        item={item}
        isPaidUser={currentUser?.subscription_type}
        images={{
          topImage:
            item?.card_name === 'fate' ? Images.Applogo :
              item?.card_name === 'K' ? Images.k_top :
                item?.card_name === 'J' ? Images.j_top :
                  item?.card_name === '10' ? Images.ten_top :
                    item?.card_name === 'A' ? Images.a_top :
                      item?.card_name === 'Joker' ? Images.joker_top :
                        null,
          centerImage: item.image,
          bottomImage: item?.card_name === 'fate' ? Images.Applogo :
            item?.card_name === 'K' ? Images.k_bottom :
              item?.card_name === 'J' ? Images.j_bottom :
                item?.card_name === '10' ? Images.ten_bottom :
                  item?.card_name === 'A' ? Images.a_bottom :
                    item?.card_name === 'Joker' ? Images.joker_bottom :
                      null,
        }}
        onExclamationPress={item?.waitingForMatch ? null : onExclamation ? () => onExclamation(item) : null}
      />
    </TouchableOpacity>
  );
});

function HomePage({ route, navigation }) {
  const { isUpdated } = route?.params || false;
  console.log('isUpdated', isUpdated);

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
  const [fatelist, setFateList] = useState([]);
  const [activeDot, setActiveDot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jokerSuggerstion, setJokerSuggestion] = useState([]);
  const [isJokerTapped, setIsJokerTapped] = useState(false);
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

    console.log('getMatchUsers', response);

    const cardNames = ['fate', 'K', 'J', '10', 'A'];
    const cardTypes = ['FATE', 'NORMAL', 'NORMAL', 'NORMAL', 'ANONYMOUS'];
    const maxCards = cardNames.length;

    const newMatchList = response.matches.map((user, index) => {
      const cardName = cardNames[index % cardNames.length];
      const cardType = cardTypes[index % cardNames.length];
      const cardImageKey = 'f_' + cardName;
      return {
        id: user.user_id,
        image: user.profile_image,
        name: user.name,
        status: 'Online',
        card_name: cardNames[index % cardNames.length],
        card_type: cardTypes[index % cardTypes.length],
        card_image: Images[cardImageKey],
        waitingForMatch: false,
      };
    });

    // Add dummy entries if the number of matches is less than maxCards
    for (let i = newMatchList.length; i < maxCards; i++) {
      newMatchList.push({
        id: i + 1, // Dummy ID
        image: 'https://w7.pngwing.com/pngs/414/888/png-transparent-waiting-illustration-thumbnail.png',
        name: 'Waiting...',
        status: 'Offline',
        card_name: cardNames[i % cardNames.length],
        card_type: cardTypes[i % cardNames.length],
        card_image: Images['f_' + cardNames[i % cardNames.length]],
        waitingForMatch: true,
      });
    }

    const jokerEntry = {
      id: 6,
      image: null,
      name: '',
      status: 'Offline',
      card_name: 'Joker',
      card_type: 'JOKER',
      card_image: Images.joker,
    };

    newMatchList.push(jokerEntry);

    console.log('newMatchList prepared, now fetching joker card');

    // Important: Don't update fateList yet, wait until joker card info is loaded
    // Instead of setFateList(newMatchList), we'll temporarily store it
    const tempMatchList = [...newMatchList];

    // Call joker card and only then update the UI with the complete list
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

      console.log('getUserJokerCard response:', JSON.stringify(response, null, 2));

      // Update the joker card in the temp list
      if (response?.isSystemAssigned === 'TRUE' && (response?.alreadyAssigned == true || response?.alreadyAssigned == false)) {
        // For free users with system assigned joker
        const jokerIndex = tempMatchList.findIndex(user => user.card_type === 'JOKER');
        if (jokerIndex !== -1 && response?.newJokerCard) {
          tempMatchList[jokerIndex] = {
            id: response?.newJokerCard?.user_id || response?.newJokerCard?.id,
            image: response?.newJokerCard?.profile_image,
            name: response?.newJokerCard?.name,
            status: 'Online',
            card_name: 'Joker',
            card_type: 'JOKER',
            card_image: Images.joker,
          };
        }
      }
      else if (response?.isSystemAssigned === 'FALSE' && response?.alreadyAssigned == false) {
        // For paid users with already assigned joker
        const jokerIndex = tempMatchList.findIndex(user => user.card_type === 'JOKER');
        if (jokerIndex !== -1 && response?.newJokerCard) {
          tempMatchList[jokerIndex] = {
            id: response?.newJokerCard?.user_id || response?.newJokerCard?.id,
            image: response?.newJokerCard?.profile_image,
            name: response?.newJokerCard?.name,
            status: 'Online',
            card_name: 'Joker',
            card_type: 'JOKER',
            card_image: Images.joker,
          };
        }
      }

      // Now set the fateList with the complete data including joker
      console.log('Setting final fateList with joker data included');
      setFateList(tempMatchList);
    } catch (error) {
      console.log('Error fetching joker card:', error);
      // If there's an error fetching joker, still show the match list
      setFateList(tempMatchList);
    }

    setLoading(false);
    setToolTipVisible(true);
  };

  //  Store the disqualification timestamp
  const storeDisqualifyTimestamp = async () => {
    const now = new Date();
    const disqualifyTimestamp = now.getTime(); // Store the current time in milliseconds
    await AsyncStorage.setItem('lastDisqualifyTimestamp', JSON.stringify(disqualifyTimestamp));
  };
  //  Check if the user has disqualified someone within the last 48 hours
  const canDisqualify = async () => {
    const lastDisqualifyTimestamp = await AsyncStorage.getItem('lastDisqualifyTimestamp');
    if (lastDisqualifyTimestamp) {
      const now = new Date().getTime();
      const hoursSinceLastDisqualify = (now - JSON.parse(lastDisqualifyTimestamp)) / (1000 * 60 * 60);

      if (hoursSinceLastDisqualify < 48) {
        Alert.alert('You cannot disqualify another user within 48 hours.');
        return false;
      }
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
    console.log('disQualifyUser', response);

    if (response?.error == false) {
      // remove 30 tokens
      //
      const data = {
        user_id: userDetail?.data?.id,
        new_tokens: -30
      }
      const res = await addToken(data);
      console.log('addToken', res);
      await storeDisqualifyTimestamp(); // Store timestamp of this disqualification
      await getMatchUsersList();
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
    if (isUpdated && !loading) {
      getMatchUsersList();
      navigation.setParams({ isUpdated: false });
    }

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
    // getUserData()
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
  const handleExclamationPress = useCallback(async (item) => {
    const canProceed = await canDisqualify();
    if (!canProceed) {
      return;
    } else {
      setActiveDot(item);
      refRBSheet.current.open();
    }
  }, []);

  // Create a keyExtractor function outside of render
  const keyExtractor = useCallback((item, index) =>
    (item.id ? item.id.toString() : index.toString()), []);

  // Create an optimized renderItem function
  const renderItem = useCallback(({ item }) => (
    <MatchCardItem
      item={item}
      currentUser={currentUser}
      navigation={navigation}
      onExclamation={handleExclamationPress}
      onJokerCardPress={handleJokerCardPress}
      isDeviceIpad={isDeviceIpad}
    />
  ), [currentUser, navigation, handleExclamationPress, handleJokerCardPress, isDeviceIpad]);

  // Create an optimized list footer component
  const ListFooter = useCallback(() => (
    <View style={{ height: responsiveHeight(20) }} />
  ), []);

  // Reference to the joker card for the tooltip
  const jokerCardRef = useRef(null);
  const homeHeaderRef = useRef(null);

  // Find the joker card in the list data
  const jokerCard = fatelist.find(item => item.card_type === 'JOKER');

  // Create refs for each tooltip target
  const headerRef = useRef(null);
  const matchesGridRef = useRef(null);
  // const jokerCardRef = useRef(null);

  // State to store element measurements
  const [measurements, setMeasurements] = useState({
    homeHeader: null,
    matchesGrid: null,
    jokerCard: null
  });

  const [showTooltip, setShowTooltip] = useState({
    homeHeader: false,
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

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
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
              marginTop: responsiveHeight(1),
              marginHorizontal: responsiveWidth(5),
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
              }}
            >
              <Text
                style={{
                  color: COLORS.primary,
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
                  paddingVertical: 5,
                  paddingHorizontal: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.16)',
                  borderRadius: 50,
                  // width: 40,
                  alignItems: 'center',
                }}
              >
                <Icon name="times" size={18} color={COLORS.white} />
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
                        color: COLORS.white,
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
                marginHorizontal: responsiveWidth(5),
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
              // ListHeaderComponent={() => {
              //   return ()
              // }}
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
            }}>
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2.5),
                fontFamily: fonts.PoppinsMedium,
              }}>
              <House color={COLORS.white} weight='fill' size={24} />
              {'  '}Home
            </Text>
          </View>

          <Text
            style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2.7),
              marginTop: responsiveHeight(1),
              marginBottom: responsiveHeight(1),
              fontWeight: '600',
              fontFamily: fonts.PoppinsMedium,
            }}
          >
            Matches
          </Text>
        </View>

        {/* Matches grid - NOT wrapped with Tooltip directly */}
        <View ref={matchesGridRef} nativeID="matches-grid" style={{ flex: 1 }}>
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={loading}
                tintColor="#fff"
                titleColor="#fff"
                onRefresh={onRefresh}
                style={{
                  marginTop: responsiveHeight(2),
                  display: 'none',
                }}
              />
            }
            style={{
              alignSelf: 'center',
              marginTop: responsiveHeight(1),
            }}
            showsVerticalScrollIndicator={false}
            data={fatelist}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={2}
            ListFooterComponent={ListFooter}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={5}
            removeClippedSubviews={true}
          />
        </View>

        {/* Tooltips positioned above all content, but only visible based on state */}


        <CustomTooltip
          isVisible={showTooltip.matchesGrid}
          content={
            <TourGuideTooltip
              content={homePageSteps[currentHomeStep]?.content}
              onNext={handleNextStep}
              onSkip={handleSkipTour}
              isLastStep={currentHomeStep === homePageSteps.length - 1}
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


      </SafeAreaView>
    </GradientBackground>
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
    backgroundColor: 'red',
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
  normal_card_body_blurview: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    // backgroundColor: "rgba(0, 0, 255, 0.5)",
    paddingLeft: responsiveWidth(2),
    paddingTop: responsiveWidth(0.5),
  },
  normal_card_body_blurview_heading: {
    color: 'black',
    fontSize: responsiveFontSize(1.6),
    fontFamily: 'Jost-Medium',
    position: 'absolute',
    top: 0,
    left: responsiveWidth(2),
  },
  normal_card_body_blurview_text: {
    color: 'black',
    fontSize: responsiveFontSize(1.2),
    fontFamily: 'Jost-Medium',
    position: 'absolute',
    bottom: responsiveHeight(0.5),
    left: responsiveWidth(2),
  },
  normal_card_right_header_container: {
    justifyContent: 'flex-end',
    padding: responsiveWidth(1),
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    width: responsiveWidth(7),
    height: '100%',
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
});
export default HomePage;
