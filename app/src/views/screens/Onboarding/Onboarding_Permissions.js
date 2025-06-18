import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Alert,
  Image,
  Linking,
  AppState,
  ToastAndroid
} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS
} from 'react-native-permissions';
import COLORS from '../../../consts/colors';
import { storeUserDetail } from '../../../HelperFunctions/AsyncStorage/userDetail';
import GradientBackground from '../../../components/MainContainer/GradientBackground';
import fonts from '../../../consts/fonts';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../../components/TopBar/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveHeight, responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions';
import Images from '../../../consts/Images';
import PrimaryButton from '../../../components/Button/PrimaryButton';
import FlashMessages from '../../../components/FlashMessages/FlashMessages';

function Onboarding({ navigation }) {
  // Track which permission screen we're displaying
  const [currentPermissionIndex, setCurrentPermissionIndex] = useState(0);
  // Add a loading state to handle auto-navigation when permission is already granted
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  // Add flash message states
  const [flashMessage, setFlashMessage] = useState(false);
  const [flashMessageData, setFlashMessageData] = useState({
    message: '',
    description: '',
    type: '',
    backgroundColor: ''
  });
  // Add a ref to keep track of our permission flow to prevent jumps
  const permissionFlowRef = useRef({
    lastCheckedIndex: 0,
    initialCheckDone: false,
    processingComplete: false
  });

  const [permissions, setPermissions] = useState([
    {
      name: 'Location',
      granted: false,
      description: 'Allow Fate to access your location to view map in app',
      type: Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      isRequired: Platform.OS === 'ios' ? true : false,
      icon: Images.location // Assume you have appropriate icons in your Images
    },
    {
      name: 'Microphone',
      granted: false,
      description: 'Microphone access is required to record audio for voice messages',
      type: Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
      isRequired: true,
      icon: Images.microphone || Images.alert_purple // Use appropriate icon or fallback
    },
    {
      name: 'Photos - Save',
      granted: false,
      description: 'We need access to save audio files to your library',
      type: Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      isRequired: Platform.OS === 'ios' ? true : false,
      icon: Images.photos || Images.alert_purple
    },
    {
      name: 'Photos - Library',
      granted: false,
      description: 'Access to your photo library is needed to select and upload profile pictures',
      type: Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      isRequired: Platform.OS === 'ios' ? true : false,
      icon: Images.photos || Images.alert_purple
    },
    {
      name: 'Speech Recognition',
      granted: false,
      description: 'Speech recognition is used to enable voice commands and messaging within the app',
      type: Platform.OS === 'ios' ? PERMISSIONS.IOS.SPEECH_RECOGNITION : PERMISSIONS.ANDROID.RECORD_AUDIO,
      isRequired: true,
      icon: Images.speech || Images.alert_purple
    },
    {
      name: 'Camera',
      granted: false,
      description: 'Camera access is required to take photos and videos',
      type: Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
      isRequired: true,
      icon: Images.camera || Images.alert_purple
    },
  ]);

  // Filter to only show required permissions based on platform
  const requiredPermissions = permissions.filter(p => p.isRequired);

  // Reference to track AppState
  const appState = useRef(AppState.currentState);

  // Check if we've gone through all permissions
  useEffect(() => {
    // Initial permission check
    checkPermissionsAndProceed();

    // Set up AppState listener to detect when app comes back from Settings
    const subscription = AppState.addEventListener('change', nextAppState => {
      // When app comes back to foreground from background
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Recheck the current permission status
        checkCurrentPermissionStatus();
      }

      appState.current = nextAppState;
    });

    // Cleanup subscription
    return () => {
      subscription.remove();
    };
  }, []);

  // Check whenever the current permission index changes to handle auto-skipping
  useEffect(() => {
    // Store the current index in our ref
    permissionFlowRef.current.lastCheckedIndex = currentPermissionIndex;

    // If we have a valid permission index
    if (currentPermissionIndex < permissions.length && !permissionFlowRef.current.processingComplete) {
      // Check if current permission is already granted
      const checkIfAlreadyGranted = async () => {
        const permission = permissions[currentPermissionIndex];
        try {
          const result = await check(permission.type);
          if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
            console.log(`Auto-skipping already granted permission: ${permission.name}`);
            // Update the granted status
            const updatedPermissions = [...permissions];
            updatedPermissions[currentPermissionIndex] = { ...permission, granted: true };
            setPermissions(updatedPermissions);
            // Move to next permission automatically
            moveToNextPermission(updatedPermissions);
          }
        } catch (error) {
          console.log(`Error checking ${permission.name} permission:`, error);
        }
      };

      checkIfAlreadyGranted();
    }
  }, [currentPermissionIndex]);

  const checkPermissionsAndProceed = async () => {
    try {
      // If we've already done our initial check, don't reset the flow
      if (permissionFlowRef.current.initialCheckDone) {
        console.log("Initial permission check already done, skipping reset");
        setIsCheckingPermission(false);
        return;
      }

      // Set loading state to true while checking permissions
      setIsCheckingPermission(true);

      const updatedPermissions = [...permissions];
      let allRequiredGranted = true;
      let firstNotGrantedIndex = -1;

      for (let i = 0; i < updatedPermissions.length; i++) {
        const permission = updatedPermissions[i];
        if (!permission.isRequired) continue;

        try {
          const result = await check(permission.type);
          console.log(`Checking ${permission.name} permission: ${result}`);
          if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
            updatedPermissions[i] = { ...permission, granted: true };
            console.log(`${permission.name} permission is already granted`);
          } else {
            allRequiredGranted = false;
            if (firstNotGrantedIndex === -1) {
              firstNotGrantedIndex = i;
              console.log(`First not granted permission: ${permission.name} at index ${i}`);
            }
          }
        } catch (error) {
          console.log(`Error checking ${permission.name} permission:`, error);
        }
      }

      setPermissions(updatedPermissions);

      // Mark that we've completed our initial check
      permissionFlowRef.current.initialCheckDone = true;

      // Check if all required permissions are already granted
      if (allRequiredGranted) {
        // All required permissions already granted, proceed to next screen
        console.log("All permissions already granted, proceeding to signup screen");
        permissionFlowRef.current.processingComplete = true;
        navigation.replace('Onboarding_signups');
      } else if (firstNotGrantedIndex !== -1) {
        // Set the index to the first required permission that is not granted
        console.log(`Setting current permission index to ${firstNotGrantedIndex}`);
        permissionFlowRef.current.lastCheckedIndex = firstNotGrantedIndex;
        setCurrentPermissionIndex(firstNotGrantedIndex);
      }

      // Done checking permissions
      setIsCheckingPermission(false);
    } catch (error) {
      console.error('Error in checkPermissionsAndProceed:', error);
      setIsCheckingPermission(false);
    }
  }; const handlePermissionRequest = async () => {
    try {
      // Set checking state to true while requesting permission
      setIsCheckingPermission(true);

      // Use our stored index for consistency
      const idx = permissionFlowRef.current.lastCheckedIndex;
      const permission = permissions[idx];

      if (!permission) {
        console.log("Invalid permission index, resetting flow");
        checkPermissionsAndProceed();
        return;
      }

      // First check if permission is already granted
      const currentStatus = await check(permission.type);
      if (currentStatus === RESULTS.GRANTED || currentStatus === RESULTS.LIMITED) {
        console.log(`${permission.name} permission is already granted, skipping to next`);
        const updatedPermissions = [...permissions];
        updatedPermissions[idx] = { ...permission, granted: true };
        setPermissions(updatedPermissions);
        moveToNextPermission(updatedPermissions);
        setIsCheckingPermission(false);
        return;
      }

      const result = await request(permission.type);
      const updatedPermissions = [...permissions];

      if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
        // existing granted branch
      } else if (result === RESULTS.DENIED) {
        // User tapped 'Don't Allow' - show light reminder via flash message
        setIsCheckingPermission(false);
        showFlashMessage(
          `${permission.name} Permission Denied`,
          `You can enable ${permission.name.toLowerCase()} anytime from Settings.`,
          'info',
          COLORS.red
        );

        // Move to next permission instead of staying stuck here
        console.log(`${permission.name} permission denied, moving to next permission`);
        moveToNextPermission(updatedPermissions);
      } else if (result === RESULTS.BLOCKED) {
        // User has blocked the permission and won't be prompted again
        setIsCheckingPermission(false);
        // Use flash message instead of alert to avoid blocking the flow
        showFlashMessage(
          `${permission.name} Permission Blocked`,
          `You can enable ${permission.name.toLowerCase()} in device Settings.`,
          'info',
          COLORS.red
        );

        // Also move to the next permission even if blocked
        console.log(`${permission.name} permission blocked, moving to next permission`);
        moveToNextPermission(updatedPermissions);
      } else {
        // other cases
        moveToNextPermission(updatedPermissions);
      }
      setIsCheckingPermission(false);
    } catch (error) {
      console.log('Error requesting permission:', error);
      // Even if there's an error, try to move to next permission
      moveToNextPermission(permissions);
      setIsCheckingPermission(false);
    }
  };

  const checkCurrentPermissionStatus = async () => {
    try {
      // Set loading state while checking
      setIsCheckingPermission(true);

      // Make sure we're using the correct index from our ref
      if (currentPermissionIndex !== permissionFlowRef.current.lastCheckedIndex) {
        console.log(`Restoring permission index from ${currentPermissionIndex} to ${permissionFlowRef.current.lastCheckedIndex}`);
        setCurrentPermissionIndex(permissionFlowRef.current.lastCheckedIndex);
      }

      // Get the current permission we're dealing with (using the stored index)
      const currentIdx = permissionFlowRef.current.lastCheckedIndex;
      const permission = permissions[currentIdx];

      if (!permission) {
        console.log("No valid permission found, proceeding to signup screen");
        setIsCheckingPermission(false);
        navigation.replace('Onboarding_signups');
        return;
      }

      // Check if it's now granted after returning from Settings
      const result = await check(permission.type);
      console.log(`After returning from settings, ${permission.name} permission status: ${result}`);

      if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
        // Permission was granted in Settings, update state and move to next
        const updatedPermissions = [...permissions];
        updatedPermissions[currentIdx] = { ...permission, granted: true };
        setPermissions(updatedPermissions);
        moveToNextPermission(updatedPermissions);
      }
      // If still not granted, stay on the current permission screen

      setIsCheckingPermission(false);
    } catch (error) {
      console.log('Error checking permission after Settings:', error);
      setIsCheckingPermission(false);
    }
  };

  const moveToNextPermission = (currentPermissions) => {
    // Check if we've already completed processing permissions
    if (permissionFlowRef.current.processingComplete) {
      console.log("Permission flow already completed, navigating to signup");
      navigation.replace('Onboarding_signups');
      return;
    }

    // Find next required permission that hasn't been granted yet
    let nextIndex = currentPermissionIndex + 1;
    while (
      nextIndex < currentPermissions.length &&
      (!currentPermissions[nextIndex].isRequired || currentPermissions[nextIndex].granted)
    ) {
      nextIndex++;
    }

    if (nextIndex < currentPermissions.length) {
      // Store the last checked index in our ref to prevent jumps
      console.log(`Moving to next permission at index ${nextIndex}`);
      permissionFlowRef.current.lastCheckedIndex = nextIndex;
      // Show next permission that hasn't been granted yet
      setCurrentPermissionIndex(nextIndex);
    } else {
      // We've gone through all permissions, proceed to next screen
      console.log("All permissions processed, moving to signup screen");
      permissionFlowRef.current.processingComplete = true;
      navigation.replace('Onboarding_signups');
    }
  };

  // Flash message helper function
  const showFlashMessage = (message, description, type, backgroundColor) => {
    setFlashMessageData({ message, description, type, backgroundColor });
    setFlashMessage(true);
    setTimeout(() => setFlashMessage(false), 3000);
  };

  // Only show the screen if we have permissions to request
  if (currentPermissionIndex >= permissions.length || permissionFlowRef.current.processingComplete) {
    return null; // Or a loading indicator
  }

  // Make sure we're using the correct index
  const idx = permissionFlowRef.current.lastCheckedIndex;
  const currentPermission = permissions[idx >= 0 && idx < permissions.length ? idx : currentPermissionIndex];

  // Skip rendering the full UI while we're checking permissions
  if (isCheckingPermission || currentPermission?.granted) {
    return (
      <GradientBackground>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.permissionName}>Checking permissions...</Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        {/* <View style={{ marginHorizontal: responsiveWidth(5) }}>
          <Header
            title="Permission Required"
          // subtitle="Please grant access to use all app features"
          />
        </View> */}

        <View style={styles.permissionContainer}>
          <Image
            source={currentPermission.icon || Images.alert_purple}
            style={styles.permissionIcon}
          />

          <Text style={styles.permissionName}>{currentPermission.name} </Text>
          {/* <Text style={styles.permissionDescription}>{currentPermission.description}</Text> */}
          <Text style={styles.permissionDescription}>Permission Required</Text>

          <PrimaryButton
            backgroundColor={COLORS.white}
            title="Continue"
            onPress={handlePermissionRequest}
            textColor={COLORS.primary}
            style={{
              marginTop: responsiveHeight(4),
              width: '80%',
            }}
          />
        </View>
      </SafeAreaView>
      {flashMessage && <FlashMessages flashMessageData={flashMessageData} />}
    </GradientBackground>
  );
}

var styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(5),
  },
  permissionIcon: {
    width: 70,
    height: 70,
    marginBottom: responsiveHeight(3),
  },
  permissionName: {
    fontSize: responsiveFontSize(2.5),
    fontFamily: fonts.PoppinsMedium,
    color: COLORS.white,
    // marginBottom: responsiveHeight(2),
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: fonts.PoppinsRegular,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: responsiveHeight(3),
    // paddingHorizontal: responsiveWidth(5),
  },
});

export default Onboarding;
