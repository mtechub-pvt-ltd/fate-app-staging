import 'react-native-gesture-handler';
import React, { useRef, useEffect, useState } from 'react';
import {
  Text,
  View,
  Platform,
  Alert,
  PermissionsAndroid,
  TouchableOpacity,
  LogBox,
  Modal,
  StyleSheet,
  Image
} from 'react-native';

import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
  useNavigationContainerRef,
} from '@react-navigation/native';
import COLORS from './app/src/consts/colors';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ConnectSpotify from './app/src/views/screens/Onboarding/ConnectSpotify';
import Test from './app/src/views/screens/Onboarding/Test';
import TestInstagram from './app/src/views/screens/Onboarding/TestInstagram';
import TestInstagramNew from './app/src/views/screens/Onboarding/TestInstagramNew';
import Onboarding_signups from './app/src/views/screens/Onboarding/Onboarding_signups';
import Onboarding_Permissions from './app/src/views/screens/Onboarding/Onboarding_Permissions';
import Onboarding_Continue from './app/src/views/screens/Onboarding/Onboarding_Continue';
import Login_N from './app/src/views/screens/Auth/Login/Login_N';
import SignUp_N from './app/src/views/screens/Auth/SignUp/SignUp_N';
import ForgotPassword_N from './app/src/views/screens/Auth/ForgotPassword/ForgotPassword_N';
import VerificationOTP from './app/src/views/screens/Auth/ForgotPassword/VerificationOTP';
import CreateNewPassword from './app/src/views/screens/Auth/ForgotPassword/CreateNewPassword';
import OnboardingQuestions from './app/src/views/screens/Auth/OnboardingQuestions/OnboardingQuestions';
import OnboardingQuestions_Redux from './app/src/views/screens/Auth/OnboardingQuestions/OnboardingQuestions_Redux';
import BasicProfileInfo from './app/src/views/screens/Auth/OnboardingQuestions/BasicProfileInfo';
import ChooseHowToAnswer from './app/src/views/screens/Auth/OnboardingQuestions/ChooseHowToAnswer';
import AddYourPhotos from './app/src/views/screens/Auth/OnboardingQuestions/AddYourPhotos';
import AddYourPhotos_Redux from './app/src/views/screens/Auth/OnboardingQuestions/AddYourPhotos_Redux';
import LocationPermission from './app/src/views/screens/Auth/OnboardingQuestions/LocationPermission';
import HomePage_test from './app/src/views/screens/Tabs/Homepage/HomePage_test_per';
import HomePage1 from './app/src/views/screens/Tabs/Homepage/HomePage1';
import ChatList from './app/src/views/screens/Tabs/Chats/ChatList';
import ChatRoom from './app/src/views/screens/Tabs/Chats/ChatRoom';
import ChatList_New from './app/src/views/screens/Tabs/Chats/ChatList_New';
import Chats_New from './app/src/views/screens/Tabs/Chats/Chats_New';
import ChatCallList from './app/src/views/screens/Tabs/Chats/ChatCallList';
import Chat from './app/src/views/screens/Tabs/Chats/Chat';
import PremiumNew from './app/src/views/screens/Tabs/Premiums/PremiumNew';
import DecisionMatch from './app/src/views/screens/Tabs/Premiums/DecisionMatch';
import RulletCalling from './app/src/views/screens/Tabs/Premiums/RulletCalling';
import Settings from './app/src/views/screens/Tabs/Settings/Settings';
import VapiWebView from './app/src/views/screens/Tabs/Settings/VapiWebView';
import Insights from './app/src/views/screens/Tabs/Settings/Insights';
import ViewProfile from './app/src/views/screens/Tabs/Settings/ViewProfile';
import EditProfile from './app/src/views/screens/Tabs/Settings/EditProfile';
import PricingandPlan from './app/src/views/screens/Tabs/Settings/PricingandPlan';
import PricingandPlanAndroid from './app/src/views/screens/Tabs/Settings/PricingandPlanAndroid';
import UpdatePasswords from './app/src/views/screens/Tabs/Settings/UpdatePasswords';
import VideoCallScreen from './app/src/views/screens/Tabs/Chats/VideoCallScreen';
import VoiceCallScreen from './app/src/views/screens/Tabs/Chats/VoiceCallScreen';
import FateRulletVoiceCallScreen from './app/src/views/screens/Tabs/Chats/FateRulletVoiceCallScreen';
import LoadingForQs from './app/src/views/screens/Auth/OnboardingQuestions/LoadingForQs';
import LoadingForQs_test from './app/src/views/screens/Auth/OnboardingQuestions/LoadingForQs_test';
import { BlurView } from '@react-native-community/blur';
import VideoCallScreen_test from './app/src/views/screens/Tabs/Chats/VideoCallScreen_test';
import OnboardingVoiceNotes from './app/src/views/screens/Auth/OnboardingQuestions/OnboardingVoiceNotes';
import OnboardingVoiceNotesTest from './app/src/views/screens/Auth/OnboardingQuestions/OnboardingVoiceNotesTest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { withIAPContext } from 'react-native-iap';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import ProfilePreference from './app/src/views/screens/Auth/OnboardingQuestions/ProfilePreference';
import UpdateProfilePreference from './app/src/views/screens/Auth/OnboardingQuestions/UpdateProfilePreference';
import ProfileCreationLoader from './app/src/views/screens/Auth/OnboardingQuestions/ProfileCreationLoader';
import {
  declineVideoCall,
  declineMatchReq,
  acceptMatchReq,
  deleteToken,
  sendFateRulletUserResponsetoOtherUser,
} from './app/src/Services/Auth/SignupService';
import Subscription1 from './app/src/views/screens/Auth/Subscriptions/Subscription1';
import PurchaseTokens from './app/src/views/screens/Tabs/Settings/PurchaseTokens';
import {
  House,
  ChatCircle,
  MonitorPlay,
  Gear,
  PhoneDisconnect,
  Phone,
  WarningCircle,

} from 'phosphor-react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import fonts from './app/src/consts/fonts';
import RulletVoiceCallScreen from './app/src/views/screens/Tabs/Chats/RulletVoiceCallScreen';
import FlashMessages from './app/src/components/FlashMessages/FlashMessages';
import OnboardingVoiceNotesIOS from './app/src/views/screens/Auth/OnboardingQuestions/OnboardingVoiceNotesIOS';
import OnboardingVoiceNotesIOSUpdate from './app/src/views/screens/Auth/OnboardingQuestions/OnboardingVoiceNotesIOSUpdate';
import {
  Provider,
  useDispatch,
  useSelector,
} from 'react-redux';
import store from './app/src/redux/store';
import Onboarding from './app/src/views/screens/Onboarding/Onboarding';
import PurchaseTokensAndroid from './app/src/views/screens/Tabs/Settings/PurchaseTokensAndroid';
import {
  getUserDetail,
  storeUserDetail,
} from './app/src/HelperFunctions/AsyncStorage/userDetail';
import { WalkthroughProvider, enableExperimentalLayoutAnimation } from 'react-native-interactive-walkthrough';
import AudioRecord from 'react-native-audio-record';
import { requestMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Zeroconf from 'react-native-zeroconf';
import { Icon } from 'react-native-paper';
import Images from './app/src/consts/Images';
import { setNewUserFlag } from './app/src/redux/features/tourGuide/tourGuideSlice';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import EditProfileNew from './app/src/views/screens/Tabs/Settings/EditProfileNew';
import TestVoice from './app/src/views/screens/Onboarding/TestVoice';
import GetInstantAccess from './app/src/views/screens/Tabs/Settings/GetInstantAccess';
import NewWaitingListScreen1 from './app/src/views/screens/Auth/OnboardingQuestions/NewWaitingListScreen1';




enableExperimentalLayoutAnimation();
LogBox.ignoreAllLogs(true);
const zeroconf = new Zeroconf();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();





function MyTabs({ route, naigation }) {
  const routeName = getFocusedRouteNameFromRoute(route);
  const [hasShownTourGuide, setHasShownTourGuide] = useState(false);

  // Get the Redux store to access the isNewUser flag
  const dispatch = useDispatch();
  const isNewUser = useSelector((state) => state.tourGuide.isNewUser);

  // Check if the user has already seen the tour guide
  useEffect(() => {
    const checkTourGuideStatus = async () => {
      try {
        const hasSeenTour = await AsyncStorage.getItem('hasSeenTourGuide');

        // If the user has never seen the tour and is a new user (from signup flow)
        if (hasSeenTour === 'false' && isNewUser) {
          // We will keep the tour guide enabled (already set in Redux by ProfileCreationLoader)
          // Mark that we've shown the tour guide
          await AsyncStorage.setItem('hasSeenTourGuide', 'true');
          setHasShownTourGuide(true);
        } else if (!isNewUser) {
          // If not coming from signup, ensure tooltips are disabled
          dispatch(setNewUserFlag(false));
        }
      } catch (error) {
        console.error('Error checking tour guide status:', error);
      }
    };

    checkTourGuideStatus();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          height: Platform.OS === 'ios' ? 70 : 60,
          paddingTop: Platform.OS === 'ios' ? 10 : 5,
          paddingBottom: Platform.OS === 'ios' ? 10 : 0,
          marginBottom: Platform.OS === 'ios' ? 30 : 5,
          width: '90%',
          marginLeft: '5%',
          borderRadius: 50,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#8C52FF', // Solid color for Android
          borderWidth: 0,
        },

        tabBarActiveTintColor: COLORS.white,
        headerShown: false,
        tabBarInactiveTintColor: COLORS.white,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <View
              style={{
                width: '100%',
                overflow: 'hidden',
                borderRadius: 50,
              }}
            >
              <BlurView
                style={{
                  height: 70,
                  display: 'flex',
                }}
                blurType="light"
                blurAmount={55}
              />
            </View>
          ) : null,
      }}
    >

      <Tab.Screen
        options={{
          tabBarIcon: ({ tintColor, focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? Platform.OS === 'ios'
                    ? '#8C52FF'
                    : 'white'
                  : 'rgba(255, 255, 255, 0.08)',
                borderRadius: 50,
                padding: 10,
              }}
            >
              <House color={focused ?
                Platform.OS === 'ios' ? 'white' :
                  COLORS.secondary2 : COLORS.white} weight="fill" size={24} />
            </View>
          ),
        }}
        name="Home"
        component={HomePage_test}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ tintColor, focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? Platform.OS === 'ios'
                    ? '#8C52FF'
                    : 'white'
                  : 'rgba(255, 255, 255, 0.08)',
                borderRadius: 50,
                padding: 10,
              }}
            >
              <ChatCircle color={focused ?
                Platform.OS === 'ios' ? 'white' :
                  COLORS.secondary2 : COLORS.white} weight="fill" size={24} />
            </View>
          ),
        }}
        name="ChatList"
        component={ChatList}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ tintColor, focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? Platform.OS === 'ios'
                    ? '#8C52FF'
                    : 'white'
                  : 'rgba(255, 255, 255, 0.08)',
                borderRadius: 50,
                padding: 10,
              }}
            >
              <MonitorPlay color={focused ?
                Platform.OS === 'ios' ? 'white' :
                  COLORS.secondary2 : COLORS.white} weight="fill" size={24} />
            </View>
          ),
        }}
        name="PremiumNew"
        component={PremiumNew}
      />
      {/* <Tab.Screen
        options={{
          tabBarIcon: ({ tintColor, focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? Platform.OS === 'ios'
                    ? '#8C52FF'
                    : 'white'
                  : 'rgba(255, 255, 255, 0.08)',
                borderRadius: 50,
                padding: 10,
              }}
            >
              <MonitorPlay color={focused ?
                Platform.OS === 'ios' ? 'white' :
                  COLORS.secondary2 : COLORS.white} weight="fill" size={24} />
            </View>
          ),
        }}
        name="Premiums"
        component={Premiums}
      /> */}
      <Tab.Screen
        options={{
          tabBarIcon: ({ tintColor, focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? Platform.OS === 'ios'
                    ? '#8C52FF'
                    : 'white'
                  : 'rgba(255, 255, 255, 0.08)',
                borderRadius: 50,
                padding: 10,
              }}
            >
              <Gear color={focused ?
                Platform.OS === 'ios' ? 'white' :
                  COLORS.secondary2 : COLORS.white} weight="fill" size={24} />
            </View>
          ),
        }}
        name="Settings"
        component={Settings}
      />
    </Tab.Navigator>



  );
}

const App = ({ navigation }) => {

  // copiolot
  const tooltipStyle = {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingTop: 5,
    paddingBottom: 5,

  };

  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const requestPermissions = async () => {
    const storedPermission = await AsyncStorage.getItem('permissionsGranted');

    // Check if permissions were granted previously and skip re-requesting
    if (storedPermission === 'true') {
      setPermissionsGranted(true);
      return;
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        ]);

        const allPermissionsGranted = Object.values(granted).every(
          (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );

        if (allPermissionsGranted) {
          setPermissionsGranted(true);
          await AsyncStorage.setItem('permissionsGranted', 'true'); // Store permission status
          console.log('All necessary permissions granted');
        } else {
          console.log('Permissions denied', granted);
          // Alert.alert(
          //   'Permissions Requireds',
          //   'The app requires these permissions to function properly.'
          // );
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      // iOS: Permissions are handled via Info.plist
      console.log('iOS: Permissions handled via Info.plist');
      setPermissionsGranted(true);
    }
  };
  useEffect(() => {
    requestPermissions(); // Only request if not granted
    // refRBSheetDecline.current.open();
  }, []);

  // call handling


  const [callData, setCallData] = useState(null);
  const refRBSheet = useRef();
  const refRBSheetRulletIncoming = useRef();
  const refRBSheetDecline = useRef();
  const [rulletModalVisible, setRulletModalVisible] = useState(false);
  const [rulletCallerData, setRulletCallerData] = useState(null);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    let timer;
    if (rulletModalVisible) {
      setCountdown(10); // Reset countdown when modal is opened
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setRulletModalVisible(false); // Close modal when countdown ends
            declineMatchReq({
              currentUserId: rulletCallerData?.receiverId,
              exsistingMatchId: rulletCallerData?.exsistingMatchId,
              newMatchId: rulletCallerData?.newMatchId,
            });
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer); // Cleanup timer on unmount or modal close
  }, [rulletModalVisible]);


  const navigationRef = useNavigationContainerRef();


  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // config for push notification
  // remote local notifcaiton setup 

  // Configure Push Notifications
  PushNotification.configure({
    onRegister: function (token) {
      console.log("TOKEN:", token);
    },
    onNotification: function (notification) {
      console.log("NOTIFICATION:", notification);
      // Process your notification here
      if (notification.foreground) {
        PushNotification.localNotification({
          alertTitle: notification.title,
          alertBody: notification.message,
          userInfo: notification.data,
        });
      }

      // required on iOS only (see fetchCompletionHandler docs:
      notification.finish(PushNotificationIOS.FetchResult.NoData);

      if (notification.userInteraction) {
        if (notification.data?.callType === 'VIDEO') {
          navigationRef.navigate('VideoCallScreen', {
            currentUser: notification.data.receiverId,
            otherUser: notification.data.callerId,
            fromNotification: true,
          });
        }
        if (notification.data?.callType === 'AUDIO') {
          navigationRef.navigate('VoiceCallScreen', {
            currentUser: notification.data.receiverId,
            otherUser: notification.data.callerId,
            otherUserName: notification.data.callerName,
            otherUserImage: notification.data.callerImage,
            fromNotification: true,
          });
        }
      }
    },
    onAction: function (notification) {
      console.log("ACTION:", notification.action);
      console.log("NOTIFICATIONS:", notification);
      // Process the action here
    },
    onRegistrationError: function (err) {
      console.error(err.message, err);
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: true,
  });

  // Register background handler
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
    // PushNotification.localNotification({
    //   alertTitle: remoteMessage.notification.title,
    //   alertBody: remoteMessage.notification.body,
    //   userInfo: remoteMessage.data,
    // });
    PushNotification.localNotification({
      channelId: "fate_app_channel",
      title: remoteMessage.notification.title,
      message: remoteMessage.notification.body,
      playSound: true,
      soundName: 'default',
    });
  });



  useEffect(() => {

    // SplashScreen.hide();
  }, []);
  const requestUserPermission = async () => {

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await messaging().requestPermission({
        alert: true,
        announcement: true,
        badge: true,
        carPlay: true,
        provisional: true,
        sound: true,
      });
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  };
  const getToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
    }
  };
  // firebse push notification permission

  // alert states
  const [falshMessage, setFalshMessage] = useState(false);
  const [falshMessageData, setFalshMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
  });


  // user data handling
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const getUserDetails = async () => {
    const userDetail = await getUserDetail();
    // setUserDetail(userDetail);

    if (userDetail?.data == null) {
      console.log('<<<<<<<<<<<<<<userDetail>>>>>>>>>>>> not found');
      setIsUserLoggedIn(false);
    } else {
      console.log('<<<<<<<<<<<<<<userDetail>>>>>>>>>>>>', userDetail.data);
      setIsUserLoggedIn(true);
    }
  };


  const [incomingRulletCallData, setincommingRulletCallData] = useState(null);

  useEffect(() => {

    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'fate_app_channel',  // Channel ID for notifications
          channelName: 'Fate App Channel', // Channel Name
          importance: 4,  // High importance
          vibrate: true,  // Enable vibration
        },
        (created) => console.log(`Notification channel created: ${created}`)
      );
    }


    requestUserPermission();
    getToken();

    // get user data and check if user is logged in

    getUserDetails();



    // Foreground notification handler
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      // PushNotification.localNotification({
      //   alertTitle: remoteMessage.notification.title,
      //   alertBody: remoteMessage.notification.body,
      //   userInfo: remoteMessage.data,
      // });
      // PushNotification.localNotification({
      //   channelId: "fate_app_channel",
      //   title: remoteMessage.notification.title,
      //   message: remoteMessage.notification.body,
      //   playSound: true,
      //   soundName: 'default',
      // });
      console.log('remoteMessage', remoteMessage.data);

      if (remoteMessage?.data?.callType === 'VIDEO') {
        // ! working
        // Alert.alert(
        //   'Call incoming',
        //   'You have a video call from ' + remoteMessage.data.callerName,
        //   [
        //     {
        //       text: 'Cancel',
        //       onPress: async () => {
        //         await declineVideoCall({
        //           callerId: remoteMessage.data.callerId,
        //           receiverId: remoteMessage.data.receiverId,
        //         });
        //       },
        //       style: 'cancel',
        //     },
        //     {
        //       text: 'Answer',
        //       onPress: async () => {


        //         navigationRef.navigate('VideoCallScreen', {
        //           currentUser: remoteMessage.data.receiverId,
        //           otherUser: remoteMessage.data.callerId,
        //           fromNotification: true,
        //         });



        //       },
        //     },
        //   ],
        //   { cancelable: false }
        // );
        // setIncomingCallData(true);
        setCallData(remoteMessage.data);
        refRBSheet.current.open();
      }
      if (remoteMessage?.data?.callType === 'RULLET-MATCH-ALERT') {


        await deleteToken({
          user_id: remoteMessage.data.receiverId,
          new_tokens: 30
        });



        // navigationRef.navigate('RulletVoiceCallScreen', {
        //   currentUser: remoteMessage?.data?.receiverId,
        //   otherUser: remoteMessage?.data?.callerId,
        //   otherUserName: remoteMessage?.data?.callerName,
        //   otherUserImage: remoteMessage?.data?.callerImage,
        //   fromNotification: true,
        // });
        console.log('Rullet call data', remoteMessage.data);
        setRulletCallerData(remoteMessage.data);
        setRulletModalVisible(true);
        // alert('bioo note' + remoteMessage?.data?.bio);
      }
      if (remoteMessage?.data?.callType === 'RULLET-BOTH-MATCH-CONFIRM') {

        setFalshMessageData({
          message: 'Success',
          description: `Your Match with ${remoteMessage.data.senderName} is confirmed`,
          type: 'success',
          icon: 'success',
          backgroundColor: COLORS.success,
          textColor: COLORS.white,
        });
        setFalshMessage(true);
        setTimeout(() => {
          setFalshMessage(false);
        }, 5000);

      }
      if (remoteMessage?.data?.callType === 'RULLET-MATCH-CANCELLED') {
        Platform.OS === 'ios' ?
          null
          : alert(remoteMessage?.data?.body);
        setFalshMessageData({
          message: 'Alert',
          description: `Your Match with ${remoteMessage?.data?.senderName} is cancelled \n also you lost your previous match`,
          type: 'danger',
          icon: 'danger',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });

        setFalshMessage(true); // Show the flash message
        setTimeout(() => {
          setFalshMessage(false); // Hide the flash message after 5 seconds
        }, 5000);

      }
      if (remoteMessage?.data?.callType === 'AUDIO') {
        console.log('notification.data', remoteMessage.data);
        // Alert.alert(
        //   'Call incoming',
        //   'You have a Audio call from ' + remoteMessage.data.callerName,
        //   [
        //     {
        //       text: 'Cancel',
        //       onPress: async () => {
        //         await declineVideoCall({
        //           callerId: remoteMessage.data.callerId,
        //           receiverId: remoteMessage.data.receiverId,
        //         });
        //       },
        //       style: 'cancel',
        //     },
        //     {
        //       text: 'Answer',
        //       onPress: async () => {


        //         navigationRef.navigate('VoiceCallScreen', {
        //           currentUser: remoteMessage.data.receiverId,
        //           otherUser: remoteMessage.data.callerId,
        //           otherUserName: remoteMessage.data.callerName,
        //           otherUserImage: remoteMessage.data.callerImage,
        //           fromNotification: true,
        //         });



        //       },
        //     },
        //   ],
        //   { cancelable: false }
        // );

        // set incoming call data to true
        // AsyncStorage.setItem('incomingCall', 'TRUE');
        // AsyncStorage.setItem('callData', JSON.stringify(remoteMessage.data));

        setCallData(remoteMessage.data);
        refRBSheet.current.open();
      }
      // rullter call
      if (remoteMessage?.data?.callType === 'RULLET-AUDIO') {
        console.log('notification.data', remoteMessage.data);

        // check what is the current active screen
        const currentRoute = navigationRef.getCurrentRoute();
        console.log('currentRoute', currentRoute);
        if (currentRoute.name == 'Premiums') {
          navigationRef.navigate('FateRulletVoiceCallScreen', {
            currentUser: remoteMessage.data.receiverId,
            otherUser: remoteMessage.data.callerId,
            otherUserName: remoteMessage.data.callerName,
            otherUserImage: remoteMessage.data.callerImage,
            fromNotification: true,
          });
        }

        // Alert.alert(
        //   'Rullet Call incoming',
        //   'You have a Rullet Audio call from ' + remoteMessage.data.callerName,
        //   [
        //     {
        //       text: 'Cancel',
        //       onPress: async () => {
        //         console.log('declineRulletCall');
        //       },
        //       style: 'cancel',
        //     },
        //     {
        //       text: 'Answer',
        //       onPress: async () => {


        //         navigationRef.navigate('FateRulletVoiceCallScreen', {
        //           currentUser: remoteMessage.data.receiverId,
        //           otherUser: remoteMessage.data.callerId,
        //           otherUserName: remoteMessage.data.callerName,
        //           otherUserImage: remoteMessage.data.callerImage,
        //           fromNotification: true,
        //         });



        //       },
        //     },
        //   ],
        //   { cancelable: false }
        // );

        // set incoming call data to true
        // AsyncStorage.setItem('incomingCall', 'TRUE');
        // AsyncStorage.setItem('callData', JSON.stringify(remoteMessage.data));
      }
      if (remoteMessage?.data?.callType === 'RULLET-REQUEST') {
        console.log('notification.data', remoteMessage.data);

        Alert.alert(
          'Friend Request',
          'You have a friend request from ' + remoteMessage.data.callerName,
          [
            {
              text: 'NO',
              onPress: async () => {
                console.log('declineRulletCall');
                declineMatchReq({
                  currentUserId: remoteMessage.data.callerId,
                  exsistingMatchId: remoteMessage.data.exsistingMatchId,
                  newMatchId: remoteMessage.data.newMatchId,
                });
                navigationRef.navigate('MyTabs', {
                  screen: 'Premiums',
                });
              },
              style: 'NO',
            },
            {
              text: 'YES',
              onPress: async () => {
                acceptMatchReq({
                  currentUserId: remoteMessage.data.callerId,
                  exsistingMatchId: remoteMessage.data.exsistingMatchId,
                  newMatchId: remoteMessage.data.newMatchId,
                });
                navigationRef.navigate('MyTabs', {
                  screen: 'Premiums',
                });
              },
            },
          ],
          { cancelable: false }
        );

        // set incoming call data to true
        // AsyncStorage.setItem('incomingCall', 'TRUE');
        // AsyncStorage.setItem('callData', JSON.stringify(remoteMessage.data));
      }
      if (remoteMessage?.data?.callType === 'RULLET-REQUEST-REJECTED') {
        console.log('notification.data', remoteMessage.data);

        Alert.alert(
          'REJECTED',
          'Your friend request has been rejected',
          [
            {
              text: 'OK',
              onPress: async () => {
                navigationRef.navigate('MyTabs', {
                  screen: 'Premiums',
                });
              },
            },
          ],
          { cancelable: false }
        );

        // set incoming call data to true
        // AsyncStorage.setItem('incomingCall', 'TRUE');
        // AsyncStorage.setItem('callData', JSON.stringify(remoteMessage.data));
      }
      if (remoteMessage?.data?.callType === 'RULLET-REQUEST-ACCEPTED') {
        console.log('notification.data', remoteMessage.data);

        Alert.alert(
          'ACCEPTED',
          'Your friend request has been accepted',
          [
            {
              text: 'OK',
              onPress: async () => {
                navigationRef.navigate('MyTabs', {
                  screen: 'Premiums',
                });
              },
            },
          ],
          { cancelable: false }
        );

        // set incoming call data to true
        // AsyncStorage.setItem('incomingCall', 'TRUE');
        // AsyncStorage.setItem('callData', JSON.stringify(remoteMessage.data));
      }
      else if (remoteMessage?.data?.callType === 'DECLINERULLETCALL') {
        Alert.alert(
          'Call declined',
          'Your call have been declined by ' + remoteMessage.data.callerName,
          [
            {
              text: 'OK',
              onPress: async () => {
                navigationRef.navigate('MyTabs');
              },
              style: 'cancel',
            },
            {
              text: 'Get a new call',
              onPress: async () => {
                navigationRef.navigate('Premiums');

              },
            },
          ],
          { cancelable: false }
        );
      }
      else if (remoteMessage?.data?.callType === 'DECLINEVIDEOCALL') {
        setCallData(remoteMessage.data);
        navigationRef.navigate('MyTabs');
        refRBSheetDecline.current.open();
        setTimeout(() => {
          refRBSheetDecline.current.close();
        }, 4000);
        // Alert.alert(
        //   'Call declined',
        //   'Your call have been declined',
        //   [
        //     {
        //       text: 'OK',
        //       onPress: async () => {
        //         navigationRef.navigate('MyTabs');
        //       },
        //       style: 'cancel',
        //     },

        //   ],
        //   { cancelable: false }
        // );
      }
      else if (remoteMessage?.data?.callType === 'RULLET-CALL-ACCEPTED') {
        console.log('notification.data', remoteMessage.data);
        navigationRef.navigate('RulletVoiceCallScreen', {

          currentUser: remoteMessage.data.receiverId,
          otherUser: remoteMessage.data.callerId,
          otherUserName: remoteMessage.data.callerName,
          otherUserImage: remoteMessage.data.callerImage,
          fromNotification: true,


        });
      }




    });

    // Handle notifications that cause the app to open
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      // handleNotificationTap(remoteMessage.notification);
      navigationRef.navigate('VideoCallScreen', {
        currentUser: remoteMessage.notification.data.receiverId,
        otherUser: remoteMessage.notification.data.callerId,
      });
    });

    // Handle initial notification when app is opened from a quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );

          // navigationRef.navigate('VideoCallScreen', {
          //   // currentUser: remoteMessage.notification.data.receiverId,
          //   otherUser: remoteMessage.notification.data.callerId,
          // });
        }
      });

    return unsubscribe;
  }, []);

  // for local calls 

  useEffect(() => {
    const triggerNetworkPromptIfNeeded = async () => {
      const alreadyPrompted = await AsyncStorage.getItem('local_network_prompted');
      if (!alreadyPrompted && Platform.OS === 'ios') {
        zeroconf.scan();
        await AsyncStorage.setItem('local_network_prompted', 'true');
      }
    };
    triggerNetworkPromptIfNeeded();
  }, []);

  // call api for fateRullet

  const sendRulletResponsetoOtherUser = async () => {
    setRulletModalVisible(false);
    const x = await getUserDetail();

    console.log('currentUser', x.data.id);
    const data = {
      accpeted_user_id: rulletCallerData?.receiverId,
      to_tell_user_id: rulletCallerData?.callerId,
      // otherUserName: rulletCallerData?.callerName,
      // otherUserImage: rulletCallerData?.callerImage,
    }
    console.log('data≥≥≥≥≥≥≥≥≥≥≥≥≥', data)

    const res = await sendFateRulletUserResponsetoOtherUser(data);
    console.log('res', res)

    navigationRef.navigate('RulletVoiceCallScreen', {
      currentUser: rulletCallerData?.receiverId,
      otherUser: rulletCallerData?.callerId,
      otherUserName: rulletCallerData?.callerName,
      otherUserImage: rulletCallerData?.callerImage,
      fromNotification: false,
    });
  }




  return (
    <>
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}
      <Modal
        transparent={true}
        visible={rulletModalVisible}
        // visible={true}
        animationType="slide"
        onRequestClose={() => setRulletModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={{
              borderRadius: 10,
              width: '80%',
              // height: '80%',
              justifyContent: 'center',
              alignItems: 'center',
              // borderRadius: 15,
              borderColor: COLORS.white + '50',
              backgroundColor: COLORS.black,
            }}
          >

            <View
              style={{
                // backgroundColor: 'red',
                marginVertical: responsiveHeight(1),
                width: responsiveWidth(80),
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={[styles.modalTitle, {
                color: COLORS.white,
                fontFamily: fonts.PoppinsLight,
                fontSize: responsiveFontSize(2.2),
                fontWeight: '500',
              }]}>We've found you a caller</Text>
              <View
                style={{
                  height: responsiveHeight(0.5),
                  width: responsiveWidth(80),
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(255, 255, 255, 0.3)',
                  marginTop: "2%",
                }}
              />
            </View>
            <View
              style={{

                // backgroundColor: COLORS.white,
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
              }}
            >
              <Image
                // source={Images.ApplogoSearch}
                source={{
                  uri: rulletCallerData?.callerImage || 'default_image_uri',
                }}
                style={{
                  width: responsiveWidth(25),
                  height: responsiveWidth(25),
                  alignSelf: 'center',
                  borderRadius: 45,
                  backgroundColor: COLORS.white,
                  marginVertical: responsiveHeight(1),
                }}
                resizeMode="cover"
              />
            </View>

            <Text style={[styles.modalDescription, {
              marginTop: responsiveHeight(1),
              fontFamily: fonts.PoppinsMedium,
              fontSize: responsiveFontSize(2),
              color: COLORS.white,
            }]}>
              {rulletCallerData?.callerName || "No Name Available"}
            </Text>

            <Text style={[styles.modalDescription, {
              fontSize: responsiveFontSize(1.5),
              color: COLORS.white,
            }]}>
              {rulletCallerData?.bio || "No Bio Available"}
            </Text>

            <Text style={[styles.modalDescription, {
              fontSize: responsiveFontSize(2),
              color: COLORS.white,
              marginTop: responsiveHeight(2),
              fontWeight: '500',
            }]}>Closing in</Text>

            <View
              style={{
                marginBottom: responsiveHeight(2),
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={[styles.modalDescription, {
                fontSize: responsiveFontSize(3),
                color: COLORS.white,
                fontWeight: '900',
                marginRight: responsiveWidth(.5),
              }]}>{countdown}</Text>
              <Text style={[styles.modalDescription, {
                fontSize: responsiveFontSize(2),
                color: COLORS.white,
                fontWeight: '500',
              }]}>s</Text>
            </View>

            <View
              style={{
                // height: responsiveHeight(0.5),
                width: responsiveWidth(80),
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255, 255, 255, 0.3)',
                // marginBottom: "3%",
              }}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, {
                  backgroundColor: '#FF4E4E',
                  borderRadius: 15,
                }]}
                onPress={() => {
                  setRulletModalVisible(false);
                  declineMatchReq({
                    currentUserId: rulletCallerData?.receiverId,
                    exsistingMatchId: rulletCallerData?.exsistingMatchId,
                    newMatchId: rulletCallerData?.newMatchId,
                  });
                }}
              >
                <Text style={styles.modalButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, {
                  backgroundColor: '#6D42BD', // Changed to match the image's purple color
                  borderRadius: 15,
                }]}
                onPress={() => {
                  sendRulletResponsetoOtherUser()
                  // setRulletModalVisible(false);
                  // navigationRef.navigate('RulletVoiceCallScreen', {
                  //   currentUser: rulletCallerData?.receiverId,
                  //   otherUser: rulletCallerData?.callerId,
                  //   otherUserName: rulletCallerData?.callerName,
                  //   otherUserImage: rulletCallerData?.callerImage,
                  //   fromNotification: true,
                  // });
                }}
              >
                <Text style={styles.modalButtonText}>Accept</Text>
              </TouchableOpacity>
            </View>


          </View>
        </View>
      </Modal >
      <RBSheet
        ref={refRBSheetRulletIncoming}
        height={responsiveHeight(30)}
        openDuration={250}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          container: {
            backgroundColor: COLORS.red,
            borderRadius: 20,
            // position: 'absolute',
            // top: Platform.OS === 'ios' ? responsiveHeight(8) : responsiveHeight(2),
            // width: responsiveWidth(95),
            alignSelf: 'center',
            justifyContent: 'center',
            // padding: responsiveWidth(2),
            borderWidth: 1,
            borderColor: COLORS.grey + '50',
            height: responsiveHeight(30),
          },
        }}>
        <TouchableOpacity>
          <Text>
            dcsdsccdscdsscd
          </Text>
        </TouchableOpacity>


      </RBSheet>
      <RBSheet
        ref={refRBSheet}
        height={Platform.OS === 'ios' ? responsiveHeight(12) : responsiveHeight(13)}
        openDuration={250}
        closeOnDragDown={false}
        closeOnPressMask={false}
        customStyles={{
          container: {
            backgroundColor: COLORS.black,
            borderRadius: 20,
            position: 'absolute',
            top: Platform.OS === 'ios' ? responsiveHeight(8) : responsiveHeight(2),
            width: responsiveWidth(95),
            alignSelf: 'center',
            justifyContent: 'center',
            padding: responsiveWidth(2),
            borderWidth: 1,
            borderColor: COLORS.grey + '50',
          },
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: responsiveWidth(15),
              height: responsiveWidth(15),
              borderRadius: 50,
              backgroundColor: COLORS.greylight,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(3.5),
                fontFamily: fonts.PoppinsMedium,
              }}
            >
              {
                callData?.callerName?.charAt(0).toUpperCase()
              }
            </Text>
          </View>
          <View>

            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2),
                fontFamily: fonts.PoppinsMedium,

              }}>
              {
                callData?.callerName
              }
            </Text>
            <Text
              style={{
                color: COLORS.grey,
                fontSize: responsiveFontSize(1.5),
                fontFamily: fonts.PoppinsMedium,
              }}>
              {
                callData?.callType === 'VIDEO' ? 'Video ' : 'Voice '
              }
              Calling you ....
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              width: responsiveWidth(40),
            }}
          >

            <TouchableOpacity
              onPress={() => {
                declineVideoCall({
                  callerId: callData?.callerId,
                  receiverId: callData?.receiverId,
                });
                refRBSheet.current.close();
                setCallData(null);
              }}
              style={{
                backgroundColor: COLORS.red,
                height: responsiveWidth(15),
                width: responsiveWidth(15),
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PhoneDisconnect

                color={COLORS.white} weight="fill" size={24} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                refRBSheet.current.close();

                if (callData?.callType === 'VIDEO') {
                  // navigationRef.navigate('VideoCallScreen', {
                  navigationRef.navigate('VideoCallScreen_test', {
                    currentUser: callData?.receiverId,
                    otherUser: callData?.callerId,
                    otherUserName: callData?.callerName,
                    otherUserImage: callData?.callerImage,
                    fromNotification: true,
                  });
                } else {
                  navigationRef.navigate('VoiceCallScreen', {
                    currentUser: callData?.receiverId,
                    otherUser: callData?.callerId,
                    otherUserName: callData?.callerName,
                    otherUserImage: callData?.callerImage,
                    fromNotification: true,
                  });
                }



                setCallData(null);
              }}
              style={{
                backgroundColor: COLORS.success,
                height: responsiveWidth(15),
                width: responsiveWidth(15),
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Phone
                color={COLORS.white} weight="fill" size={24} />
            </TouchableOpacity>
          </View>
        </View>

      </RBSheet>
      <RBSheet
        ref={refRBSheetDecline}
        height={Platform.OS === 'ios' ? responsiveHeight(9) : responsiveHeight(9)}
        openDuration={250}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          container: {
            backgroundColor: COLORS.black,
            borderRadius: 20,
            position: 'absolute',
            top: Platform.OS === 'ios' ? responsiveHeight(8) : responsiveHeight(2),
            width: responsiveWidth(95),
            alignSelf: 'center',
            justifyContent: 'center',
            padding: responsiveWidth(3),
            borderWidth: 1,
            borderColor: COLORS.grey + '50',
          },
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          <WarningCircle
            color={COLORS.warning} weight="fill" size={34} />

          <Text
            style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2),
              fontFamily: fonts.PoppinsMedium,
              marginLeft: responsiveWidth(2),
            }}>
            Call Declined by User
          </Text>



        </View>

      </RBSheet>

      <WalkthroughProvider>
        <Provider store={store}>
          <NavigationContainer ref={navigationRef} independent={true}>
            <Stack.Navigator
              slideAnimationEnabled={true}
              slideAnimationDuration={2000}
              slideAnimationType="timing"
              screenOptions={{ header: () => null }}>


              <Stack.Screen name="Onboarding" component={Onboarding} />
              <Stack.Screen name="TestVoice" component={TestVoice} />
              <Stack.Screen name="Test" component={Test} />
              <Stack.Screen name="TestInstagramNew" component={TestInstagramNew} />
              <Stack.Screen name="TestInstagram" component={TestInstagram} />
              <Stack.Screen name="ConnectSpotify" component={ConnectSpotify} />
              <Stack.Screen name="SignUp_N" component={SignUp_N} />
              <Stack.Screen name="Login_N" component={Login_N} />
              <Stack.Screen name="Onboarding_signups" component={Onboarding_signups} />
              <Stack.Screen name="Onboarding_Permissions" component={Onboarding_Permissions} />
              <Stack.Screen name="BasicProfileInfo" component={BasicProfileInfo} />
              <Stack.Screen name="OnboardingQuestions_Redux" component={OnboardingQuestions_Redux} />
              <Stack.Screen name="LoadingForQs_test" component={LoadingForQs_test} />
              <Stack.Screen name="AddYourPhotos_Redux" component={AddYourPhotos_Redux} />
              <Stack.Screen name="ProfilePreference" component={ProfilePreference} />
              <Stack.Screen name="OnboardingVoiceNotesTest" component={OnboardingVoiceNotesTest} />
              <Stack.Screen
                name="ProfileCreationLoader"
                component={ProfileCreationLoader}
                options={{
                  gestureEnabled: false, // Disable swipe gestures on iOS
                  headerLeft: () => null, // Remove back button from header
                }}
              />
              <Stack.Screen name="OnboardingVoiceNotesIOS" component={OnboardingVoiceNotesIOS} />
              <Stack.Screen name="OnboardingVoiceNotesIOSUpdate" component={OnboardingVoiceNotesIOSUpdate} />
              <Stack.Screen name="LoadingForQs" component={LoadingForQs} />
              <Stack.Screen name="OnboardingVoiceNotes" component={OnboardingVoiceNotes} />
              <Stack.Screen name="MyTabs" component={MyTabs} />
              <Stack.Screen name="OnboardingQuestions" component={OnboardingQuestions} />
              <Stack.Screen name="ChatList_New" component={ChatList_New} />
              <Stack.Screen name="Chats_New" component={Chats_New} />
              <Stack.Screen name="VideoCallScreen" component={VideoCallScreen} />
              <Stack.Screen name="HomePage1" component={HomePage1} />
              <Stack.Screen name="LocationPermission" component={LocationPermission} />
              <Stack.Screen name="AddYourPhotos" component={AddYourPhotos} />
              <Stack.Screen name="ForgotPassword_N" component={ForgotPassword_N} />
              <Stack.Screen name="VerificationOTP" component={VerificationOTP} />
              <Stack.Screen name="CreateNewPassword" component={CreateNewPassword} />
              <Stack.Screen name="ChatCallList" component={ChatCallList} />
              <Stack.Screen name="Chat" component={Chat} />
              <Stack.Screen name="Subscription1" component={Subscription1} />
              <Stack.Screen name="EditProfileNew" component={EditProfileNew} />
              <Stack.Screen name="PurchaseTokens" component={PurchaseTokens} />
              <Stack.Screen name="PurchaseTokensAndroid" component={PurchaseTokensAndroid} />
              <Stack.Screen name="ChatRoom" component={ChatRoom} />
              <Stack.Screen name="ViewProfile" component={ViewProfile} />
              <Stack.Screen name="EditProfile" component={EditProfile} />
              <Stack.Screen name="PricingandPlan" component={PricingandPlan} />
              <Stack.Screen name="PricingandPlanAndroid" component={PricingandPlanAndroid} />
              <Stack.Screen name="UpdatePasswords" component={UpdatePasswords} />
              <Stack.Screen name="RulletCalling" component={RulletCalling} />
              <Stack.Screen name="VideoCallScreen_test" component={VideoCallScreen_test} />
              <Stack.Screen name="UpdateProfilePreference" component={UpdateProfilePreference} />
              <Stack.Screen name="VoiceCallScreen" component={VoiceCallScreen} />
              <Stack.Screen name="Insights" component={Insights} />
              <Stack.Screen name="RulletVoiceCallScreen" component={RulletVoiceCallScreen} />
              <Stack.Screen name="FateRulletVoiceCallScreen" component={FateRulletVoiceCallScreen} />
              <Stack.Screen name="DecisionMatch" component={DecisionMatch} />
              <Stack.Screen name="ChooseHowToAnswer" component={ChooseHowToAnswer} />
              <Stack.Screen name="VapiWebView" component={VapiWebView} />
              <Stack.Screen name="GetInstantAccess" component={GetInstantAccess} />
              <Stack.Screen name="NewWaitingListScreen1" component={NewWaitingListScreen1} />
            </Stack.Navigator>
          </NavigationContainer>
        </Provider>
      </WalkthroughProvider>



    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {

  },
  modalTitle: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',

    color: COLORS.dark,
    fontFamily: fonts.PoppinsMedium,
  },
  modalDescription: {
    fontSize: responsiveFontSize(1.8),
    textAlign: 'center',
    color: COLORS.dark,
    fontFamily: fonts.PoppinsRegular,
    marginBottom: responsiveWidth(1),
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '90%',
    alignSelf: 'center',
    paddingVertical: responsiveHeight(1),
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: 'center',
    fontFamily: fonts.PoppinsMedium,

  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(1.8),
    fontFamily: fonts.PoppinsMedium,
  },
});

export default withIAPContext(App);
