import 'react-native-gesture-handler';
import React, { useRef, useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Linking,
  Platform,
  Alert,
  BackHandler,
  PermissionsAndroid
} from 'react-native';
import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
  useNavigationState,
  useRoute,
  useNavigationContainerRef,
  StackActions,
  NavigationActions,
  useIsFocused,
  navigation,
} from '@react-navigation/native';
import COLORS from './app/src/consts/colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Onboarding from './app/src/views/screens/Onboarding/Onboarding';
import Test from './app/src/views/screens/Onboarding/Test';
import Onboarding_signups from './app/src/views/screens/Onboarding/Onboarding_signups';
import Onboarding_Continue from './app/src/views/screens/Onboarding/Onboarding_Continue';
import Login from './app/src/views/screens/Auth/Login/Login';
import Login_N from './app/src/views/screens/Auth/Login/Login_N';
import SignUp_N from './app/src/views/screens/Auth/SignUp/SignUp_N';
import ForgotPassword_N from './app/src/views/screens/Auth/ForgotPassword/ForgotPassword_N';
import VerificationOTP from './app/src/views/screens/Auth/ForgotPassword/VerificationOTP';
import CreateNewPassword from './app/src/views/screens/Auth/ForgotPassword/CreateNewPassword';
import OnboardingQuestions from './app/src/views/screens/Auth/OnboardingQuestions/OnboardingQuestions';
import BasicProfileInfo from './app/src/views/screens/Auth/OnboardingQuestions/BasicProfileInfo';
import AddYourPhotos from './app/src/views/screens/Auth/OnboardingQuestions/AddYourPhotos';
import LocationPermission from './app/src/views/screens/Auth/OnboardingQuestions/LocationPermission';
import HomePage from './app/src/views/screens/Tabs/Homepage/HomePage';
import HomePage_test from './app/src/views/screens/Tabs/Homepage/HomePage_test';
import HomePage1 from './app/src/views/screens/Tabs/Homepage/HomePage1';
import ChatList from './app/src/views/screens/Tabs/Chats/ChatList';
import ChatRoom from './app/src/views/screens/Tabs/Chats/ChatRoom';
import ChatList_New from './app/src/views/screens/Tabs/Chats/ChatList_New';
import Chats_New from './app/src/views/screens/Tabs/Chats/Chats_New';
import ChatCallList from './app/src/views/screens/Tabs/Chats/ChatCallList';
import Chat from './app/src/views/screens/Tabs/Chats/Chat';
import Premiums from './app/src/views/screens/Tabs/Premiums/Premiums';
import DecisionMatch from './app/src/views/screens/Tabs/Premiums/DecisionMatch';
import RulletCalling from './app/src/views/screens/Tabs/Premiums/RulletCalling';
import Settings from './app/src/views/screens/Tabs/Settings/Settings';
import Insights from './app/src/views/screens/Tabs/Settings/Insights';
import ViewProfile from './app/src/views/screens/Tabs/Settings/ViewProfile';
import EditProfile from './app/src/views/screens/Tabs/Settings/EditProfile';
import PricingandPlan from './app/src/views/screens/Tabs/Settings/PricingandPlan';
import UpdatePasswords from './app/src/views/screens/Tabs/Settings/UpdatePasswords';
import VideoCallScreen from './app/src/views/screens/Tabs/Chats/VideoCallScreen';
import VoiceCallScreen from './app/src/views/screens/Tabs/Chats/VoiceCallScreen';
import FateRulletVoiceCallScreen from './app/src/views/screens/Tabs/Chats/FateRulletVoiceCallScreen';

import SignUp from './app/src/views/screens/Auth/SignUp/SignUp';
import VerifyOTP from './app/src/views/screens/Auth/VerifyOTP/VerifyOTP';
// import RNExitApp from 'react-native-exit-app';
import { base_url, image_url } from './app/src/consts/baseUrls';
import OnboardingSlider from './app/src/views/screens/Auth/OnboardingSlider/OnboardingSlider';
// import SplashScreen from 'react-native-splash-screen';
import ForgotPassword from './app/src/views/screens/Auth/ForgotPassword/ForgotPassword';

import LoadingForQs from './app/src/views/screens/Auth/OnboardingQuestions/LoadingForQs';
import LoadingForQs_test from './app/src/views/screens/Auth/OnboardingQuestions/LoadingForQs_test';
import WebRtc from './app/src/views/screens/Tabs/Chats/WebRtc';
import { BlurView } from '@react-native-community/blur';
import VideoCallScreenFB from './app/src/views/screens/Tabs/Chats/VideoCallScreenFB';
import VideoCallScreen_test from './app/src/views/screens/Tabs/Chats/VideoCallScreen_test';
import OnboardingVoiceNotes from './app/src/views/screens/Auth/OnboardingQuestions/OnboardingVoiceNotes';
import OnboardingVoiceNotesTest from './app/src/views/screens/Auth/OnboardingQuestions/OnboardingVoiceNotesTest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { withIAPContext } from 'react-native-iap';
// fire base seeting 
import firebase from '@react-native-firebase/app';
import app from './firebase';
import messaging from '@react-native-firebase/messaging';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import ProfilePreference from './app/src/views/screens/Auth/OnboardingQuestions/ProfilePreference';
import UpdateProfilePreference from './app/src/views/screens/Auth/OnboardingQuestions/UpdateProfilePreference';
import {
  declineVideoCall,
  declineRulletCall,
  declineMatchReq,
  acceptMatchReq,
  removeUserFromFateRullet
} from './app/src/Services/Auth/SignupService';
import Subscription1 from './app/src/views/screens/Auth/Subscriptions/Subscription1';
import PurchaseTokens from './app/src/views/screens/Tabs/Settings/PurchaseTokens';
import {
  House,
  BellRinging,
  BellSimple,
  MagnifyingGlass,
  ChatCircle,
  MonitorPlay,
  Gear
} from 'phosphor-react-native';
import { use } from './server/app/uploadimage';
import { getUserDetail } from './app/src/HelperFunctions/AsyncStorage/userDetail';




const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();




function MyTabs({ route, naigation }) {
  const routeName = getFocusedRouteNameFromRoute(route);


  useEffect(() => {
    if (routeName !== 'Premiums') {
      getUserDetail().then(async (res) => {
        const data = { user_id: res?.data?.id };
        const response = await removeUserFromFateRullet(data);
        console.log('removeUserFromFateRullet', response);
      });
    }
  }, [routeName]);


  return (

    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          height: Platform.OS === 'ios' ? 70 : 60,
          paddingTop: Platform.OS === 'ios' ? 10 : 5,
          paddingBottom: Platform.OS === 'ios' ? 10 : 0,
          marginBottom: Platform.OS === 'ios' ? 30 : 15,
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
        name="Premiums"
        component={Premiums}
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
          Alert.alert(
            'Permissions Requireds',
            'The app requires these permissions to function properly.'
          );
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

  }, []);


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

      if (notification?.data?.callType === 'VIDEO') {
        console.log('notification.data',);
        // navigationRef.navigate('Test', {
        //   data: notification.data
        // });

        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Onboarding', params: { data: notification.data } }],
        });
        // set incoming call data to true
        // AsyncStorage.setItem('incomingCall', 'TRUE');
        // AsyncStorage.setItem('callData', JSON.stringify(notification.data));
      }
      if (notification?.data?.callType === 'AUDIO') {
        console.log('notification.data',);
        // navigationRef.navigate('Test', {
        //   data: notification.data
        // });

        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Onboarding', params: { data: notification.data } }],
        });
        // set incoming call data to true
        // AsyncStorage.setItem('incomingCall', 'TRUE');
        // AsyncStorage.setItem('callData', JSON.stringify(notification.data));
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
        Alert.alert(
          'Call incoming',
          'You have a video call from ' + remoteMessage.data.callerName,
          [
            {
              text: 'Cancel',
              onPress: async () => {
                await declineVideoCall({
                  callerId: remoteMessage.data.callerId,
                  receiverId: remoteMessage.data.receiverId,
                });
              },
              style: 'cancel',
            },
            {
              text: 'Answer',
              onPress: async () => {


                navigationRef.navigate('VideoCallScreen', {
                  currentUser: remoteMessage.data.receiverId,
                  otherUser: remoteMessage.data.callerId,
                  fromNotification: true,
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
      if (remoteMessage?.data?.callType === 'AUDIO') {
        console.log('notification.data', remoteMessage.data);
        Alert.alert(
          'Call incoming',
          'You have a Audio call from ' + remoteMessage.data.callerName,
          [
            {
              text: 'Cancel',
              onPress: async () => {
                await declineVideoCall({
                  callerId: remoteMessage.data.callerId,
                  receiverId: remoteMessage.data.receiverId,
                });
              },
              style: 'cancel',
            },
            {
              text: 'Answer',
              onPress: async () => {


                navigationRef.navigate('VoiceCallScreen', {
                  currentUser: remoteMessage.data.receiverId,
                  otherUser: remoteMessage.data.callerId,
                  otherUserName: remoteMessage.data.callerName,
                  otherUserImage: remoteMessage.data.callerImage,
                  fromNotification: true,
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
        Alert.alert(
          'Call declined',
          'Your call have been declined',
          [
            {
              text: 'OK',
              onPress: async () => {
                navigationRef.navigate('MyTabs');
              },
              style: 'cancel',
            },

          ],
          { cancelable: false }
        );
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




  return (
    <NavigationContainer ref={navigationRef} independent={true}>
      <Stack.Navigator
        // slideAnimationEnabled={true}
        // slideAnimationDuration={2000}
        // slideAnimationType="timing"
        screenOptions={{ header: () => null }}>
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="LoadingForQs_test" component={LoadingForQs_test} />
        <Stack.Screen name="LoadingForQs" component={LoadingForQs} />
        <Stack.Screen name="Test" component={Test} />
        <Stack.Screen name="OnboardingVoiceNotes" component={OnboardingVoiceNotes} />
        <Stack.Screen name="OnboardingVoiceNotesTest" component={OnboardingVoiceNotesTest} />
        <Stack.Screen name="MyTabs" component={MyTabs} />
        <Stack.Screen name="Onboarding_signups" component={Onboarding_signups} />
        <Stack.Screen name="Onboarding_Continue" component={Onboarding_Continue} />
        <Stack.Screen name="OnboardingQuestions" component={OnboardingQuestions} />
        <Stack.Screen name="ChatList_New" component={ChatList_New} />
        <Stack.Screen name="Chats_New" component={Chats_New} />
        <Stack.Screen name="VideoCallScreen" component={VideoCallScreen} />
        <Stack.Screen name="HomePage1" component={HomePage1} />
        <Stack.Screen name="SignUp_N" component={SignUp_N} />
        <Stack.Screen name="Login_N" component={Login_N} />
        <Stack.Screen name="ProfilePreference" component={ProfilePreference} />
        <Stack.Screen name="LocationPermission" component={LocationPermission} />
        <Stack.Screen name="AddYourPhotos" component={AddYourPhotos} />
        <Stack.Screen name="BasicProfileInfo" component={BasicProfileInfo} />
        <Stack.Screen name="ForgotPassword_N" component={ForgotPassword_N} />
        <Stack.Screen name="VerificationOTP" component={VerificationOTP} />
        <Stack.Screen name="CreateNewPassword" component={CreateNewPassword} />
        <Stack.Screen name="ChatCallList" component={ChatCallList} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="Subscription1" component={Subscription1} />
        <Stack.Screen name="PurchaseTokens" component={PurchaseTokens} />
        <Stack.Screen name="ChatRoom" component={ChatRoom} />
        <Stack.Screen name="ViewProfile" component={ViewProfile} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="PricingandPlan" component={PricingandPlan} />
        <Stack.Screen name="UpdatePasswords" component={UpdatePasswords} />
        <Stack.Screen name="RulletCalling" component={RulletCalling} />
        <Stack.Screen name="VideoCallScreen_test" component={VideoCallScreen_test} />
        <Stack.Screen name="UpdateProfilePreference" component={UpdateProfilePreference} />
        <Stack.Screen name="VoiceCallScreen" component={VoiceCallScreen} />
        <Stack.Screen name="Insights" component={Insights} />
        <Stack.Screen name="FateRulletVoiceCallScreen" component={FateRulletVoiceCallScreen} />
        <Stack.Screen name="DecisionMatch" component={DecisionMatch} />

        {/* <Stack.Screen name="Login" component={Login} /> */}
        {/* <Stack.Screen name="OnboardingSlider" component={OnboardingSlider} />
        <Stack.Screen name="SignUp" component={SignUp} />

        <Stack.Screen name="VerifyOTP" component={VerifyOTP} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="Test" component={Test} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default withIAPContext(App);
