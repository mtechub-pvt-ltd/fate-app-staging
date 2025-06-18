import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Platform,
  ScrollView,
  Linking,
  ActivityIndicator
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
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import { getAllTokens, userLogout, deleteUserAccount } from '../../../../Services/Auth/SignupService';
import RNRestart from 'react-native-restart';
import { useIsFocused } from '@react-navigation/native';
import {
  User,
  Eye,
  Eraser,
  Lock,
  Virus,
  SignOut,
  Coins,
  Gear,
  Notebook,
  SealCheck,
  Trash,
  RocketLaunch
} from 'phosphor-react-native';
import { height, width } from '../../../../consts/Dimension';
// import { CustomTooltip, useTooltip } from '../../../../components/CustomTooltip';

// Import for Redux tour guide
import { useDispatch, useSelector } from 'react-redux';
import {
  nextSettingsStep,
  skipSettingsTour
} from '../../../../redux/features/tourGuide/tourGuideSlice';
import TourGuideTooltip from '../../../../components/TourGuide/TourGuideTooltip';
import CustomTooltip from '../../../../components/CustomTooltip';

function HomePage({ route, navigation }) {
  const refRBSheet = useRef();
  const refDeleteAccountSheet = useRef();
  const [users, setUsers] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isFocused = useIsFocused();

  // Redux tour guide
  const dispatch = useDispatch();
  const {
    showSettingsTour,
    currentSettingsStep,
    settingsSteps
  } = useSelector((state) => state.tourGuide);

  // Create refs for each tooltip target
  const profileSectionRef = useRef(null);
  const tokensSectionRef = useRef(null);
  const settingsOptionsRef = useRef(null);

  // State to store element measurements
  const [measurements, setMeasurements] = useState({
    profileSection: null,
    tokensSection: null,
    settingsOptions: null
  });

  const [showTooltip, setShowTooltip] = useState({
    profileSection: false,
    tokensSection: false,
    settingsOptions: false
  });

  // Set which tooltip to show based on current step
  useEffect(() => {
    if (showSettingsTour) {
      const currentTarget = settingsSteps[currentSettingsStep]?.target;
      setShowTooltip({
        profileSection: currentTarget === 'profile-section',
        tokensSection: currentTarget === 'tokens-section',
        settingsOptions: currentTarget === 'settings-options',
      });

      // Measure the position of the current target
      if (currentTarget === 'profile-section' && profileSectionRef.current) {
        measureElement(profileSectionRef, 'profileSection');
      } else if (currentTarget === 'tokens-section' && tokensSectionRef.current) {
        measureElement(tokensSectionRef, 'tokensSection');
      } else if (currentTarget === 'settings-options' && settingsOptionsRef.current) {
        measureElement(settingsOptionsRef, 'settingsOptions');
      }
    } else {
      setShowTooltip({
        profileSection: false,
        tokensSection: false,
        settingsOptions: false,
      });
    }
  }, [currentSettingsStep, showSettingsTour]);

  // Function to measure element position
  const measureElement = (ref, key) => {
    if (!ref || !ref.current) {
      console.log(`Ref for ${key} is not available yet`);
      return;
    }

    setTimeout(() => {
      try {
        ref.current.measure((x, y, width, height, pageX, pageY) => {
          console.log(`Measured ${key}:`, { x: pageX, y: pageY, width, height });
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
        console.log(`Error measuring ${key}:`, error);
      }
    }, 500); // Increased timeout to ensure component is rendered
  };

  // Handle tooltip navigation and button clicks
  const handleNextSettingsStep = () => {
    dispatch(nextSettingsStep());
  };

  const handleSkipSettingsTour = () => {
    dispatch(skipSettingsTour());
  };

  const getMatchUsersList = async () => {
    const userDetail = await getUserDetail();
    console.log('userDetail', userDetail);
    setUsers(userDetail?.data);
    const data = {
      user_id: userDetail?.data?.id
    }
    const response = await getAllTokens(data);
    console.log('response_____', response?.tokens?.length);

    setTokens(response)

  };
  useEffect(() => {
    getMatchUsersList();

  }, [isFocused]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true); // Start loading indicator

      // Log out on the server side
      const data = {
        user_id: users?.id
      };
      console.log('data', data);
      await userLogout(data);

      // Set flag to indicate we're coming from logout
      await AsyncStorage.setItem('isFromLogout', 'true');

      // Use navigate instead of reset to avoid navigation errors
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding_signups' }],
        });
      }, 2000);
    } catch (error) {
      console.error('Error during logout:', error);
      setIsLoggingOut(false); // Hide loading indicator on error
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);

      // Call the delete account API
      const data = {
        user_id: users?.id
      };

      console.log('Deleting account for user:', data);
      const response = await deleteUserAccount(data);

      if (!response.error) {
        console.log('Account deleted successfully');
        // Set flag to indicate we're coming from logout
        handleLogout();
      } else {
        console.error('Error deleting account:', response);
        alert('Failed to delete account. Please try again later.');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error during account deletion:', error);
      alert('An error occurred. Please try again later.');
      setIsDeleting(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView
        style={{
          flex: 1,
        }}>
        {isDeleting && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.white} />
            <Text style={styles.loadingText}>Deleting account...</Text>
          </View>
        )}
        {isLoggingOut && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.white} />
            <Text style={styles.loadingText}>Logging out...</Text>
          </View>
        )}
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
                  // marginTop: responsiveHeight(5),
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
                  // marginTop: responsiveHeight(5),
                  alignSelf: 'center',
                  width: responsiveWidth(30),
                  padding: 0,
                  backgroundColor: COLORS.red,
                }}

              />
            </View>
          </View>
        </BottomSheet>

        <BottomSheet ref={refDeleteAccountSheet}>
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
              Are you sure you{'\n'}want to delete your account?
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
                  refDeleteAccountSheet.current.close();
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
                title="Delete"
                onPress={() => {
                  refDeleteAccountSheet.current.close();
                  handleDeleteAccount();
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

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: responsiveWidth(90),
            marginTop: Platform.OS === 'ios' ? responsiveHeight(0) : responsiveHeight(2),
            alignItems: 'center',
            paddingBottom: responsiveHeight(1),
          }}>

          <Text
            style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2.5),
              fontFamily: fonts.PoppinsMedium,
            }}>
            <User color={COLORS.white}
              weight="fill" size={24} />
            {'  '}Profile
          </Text>

        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
        >

          {/* Profile Section with custom tooltip */}
          <View
            ref={profileSectionRef}
            nativeID="profile-section"
            style={{
              backgroundColor: '#FFFFFF0F',
              padding: responsiveWidth(2),
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#FFFFFF29',
              marginTop: responsiveHeight(2),
            }}
            onLayout={() => measureElement(profileSectionRef, 'profileSection')}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('ViewProfile', {
                current_user: users?.id,
                other_user: users
              })}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                margin: responsiveWidth(2),
                borderRadius: 7,
                padding: responsiveWidth(1),
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                display: 'none',
                zIndex: 9999,
              }}
            >
              <Eye color={COLORS.white}
                weight='light' size={24} />
            </TouchableOpacity>

            <ImageBackground
              source={{
                uri: users?.profile_image
              }}
              style={{
                width: Platform.OS === 'ios' ? responsiveWidth(23) : responsiveWidth(20.5),
                height: Platform.OS === 'ios' ? responsiveHeight(10) : responsiveHeight(10.5),
                resizeMode: 'contain',
                alignSelf: 'center',
                borderRadius: 50,
              }}
              imageStyle={{
                borderRadius: 50,
              }}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate('EditProfileNew')}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'rgba(255, 255, 255, .2)',
                  padding: responsiveWidth(1),
                  borderRadius: 50,
                  paddingHorizontal: responsiveWidth(2),
                  paddingVertical: responsiveHeight(1),
                  zIndex: 9999,
                }}
              >
                <Eraser color={COLORS.white}
                  weight='light' size={24} />
              </TouchableOpacity>
            </ImageBackground>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: responsiveHeight(1),
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2.2),
                  textAlign: 'center',
                  fontFamily: fonts.PoppinsSemiBold,
                }}
              >{users?.name + ' '}</Text>
              <SealCheck color={COLORS.primary}
                style={{
                  display: users?.isVerifiedUser == 1 ? 'flex' : 'none',
                }}
                weight='fill' size={24} />
            </View>

            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2),
                textAlign: 'center',
                marginTop: responsiveHeight(.5),
              }}
            >
              {users?.age} Years {'\n'}
            </Text>
          </View>

          {/* Custom tooltip for profile section */}
          <CustomTooltip
            isVisible={showTooltip.profileSection}
            content={
              <TourGuideTooltip
                content={settingsSteps[currentSettingsStep]?.content}
                onNext={() => dispatch(nextSettingsStep())}
                onSkip={() => dispatch(skipSettingsTour())}
                isLastStep={currentSettingsStep === settingsSteps.length - 1}
              />
            }
            placement="bottom"
            onClose={() => { }}
            targetMeasurements={measurements.profileSection}
            backgroundColor="rgba(0,0,0,0.5)"
            contentStyle={{ backgroundColor: '#F46CE3' }}
            tooltipStyle={{
              // minHeight: 110,
              left: responsiveWidth(10),
              marginTop: responsiveWidth(15),
              position: 'absolute',
              bottom: responsiveWidth(25),
            }}
            arrowSize={{ width: 24, height: 12 }}
          />

          {/* Tokens Section with custom tooltip */}
          <ImageBackground
            ref={tokensSectionRef}
            nativeID="tokens-section"
            source={Images.test_stars}
            imageStyle={{
              tintColor: 'rgba(255, 255, 255, 0.16)',
            }}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: responsiveWidth(4),
              alignItems: 'center',
              marginTop: responsiveHeight(2),
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.16)',
              borderRadius: 10,
              alignContent: 'center',
              borderRadius: 20,
            }}
            onLayout={() => measureElement(tokensSectionRef, 'tokensSection')}
          >
            <View>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(4),
                  fontFamily: fonts.PoppinsBold,
                }}
              >
                {tokens?.tokens?.length == 0 ? 0 : tokens?.tokens}
              </Text>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  fontFamily: fonts.PoppinsMedium,
                }}
              >
                Available Tokens
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                Platform.OS !== 'ios' ?
                  navigation.navigate('PurchaseTokensAndroid', {
                    // navigation.navigate('PurchaseTokens', {
                    currentTokens: tokens ? tokens?.tokens : 0
                  })
                  :
                  navigation.navigate('PurchaseTokens', {
                    currentTokens: tokens ? tokens?.tokens : 0
                  })
              }}
              style={{
                backgroundColor: COLORS.white,
                borderRadius: 50,
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  padding: responsiveWidth(2),
                  paddingHorizontal: responsiveWidth(4),
                  overflow: 'hidden',
                  color: COLORS.primary,
                  fontFamily: fonts.PoppinsMedium,
                }}
              >
                Purchase Now
              </Text>
            </TouchableOpacity>
          </ImageBackground>

          {/* Custom tooltip for tokens section */}
          <CustomTooltip
            isVisible={showTooltip.tokensSection}
            content={
              <TourGuideTooltip
                content={settingsSteps[currentSettingsStep]?.content}
                onNext={() => dispatch(nextSettingsStep())}
                onSkip={() => dispatch(skipSettingsTour())}
                isLastStep={currentSettingsStep === settingsSteps.length - 1}
              />
            }
            placement="bottom"
            onClose={() => { }}
            targetMeasurements={measurements.tokensSection}
            backgroundColor="rgba(0,0,0,0.5)"
            contentStyle={{ backgroundColor: '#F46CE3' }}

            tooltipStyle={{
              // minHeight: 110,
              left: responsiveWidth(10),
              marginTop: responsiveWidth(15),
              position: 'absolute',
              bottom: responsiveWidth(25),
            }}
            childContentSpacing={20}
            arrowSize={{ width: 24, height: 12 }}
          />

          {/* Settings Options with custom tooltip */}
          <View
            ref={settingsOptionsRef}
            nativeID="settings-options"
            onLayout={() => measureElement(settingsOptionsRef, 'settingsOptions')}
          >
            <TouchableOpacity
              onPress={() => {
                Platform.OS === 'ios' ?
                  navigation.navigate('PricingandPlan') :
                  navigation.navigate('PricingandPlanAndroid')
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: responsiveWidth(4),
                alignItems: 'center',
                marginTop: responsiveHeight(2),
                borderWidth: 1,
                borderColor: '#FFFFFF29',
                borderRadius: 10,
                backgroundColor: '#FFFFFF14',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <Coins color={COLORS.white}
                  weight='light' size={24} />
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(2),
                    fontFamily: fonts.PoppinsRegular,
                    fontWeight: '400',
                    marginLeft: responsiveWidth(3),
                  }}
                >
                  Pricing & Plans
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={responsiveFontSize(2)}
                color={COLORS.white}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('UpdateProfilePreference', {
                  userDetail: users
                })
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: responsiveWidth(4),
                alignItems: 'center',
                marginTop: responsiveHeight(2),
                borderWidth: 1,
                borderColor: '#FFFFFF29',
                borderRadius: 10,
                backgroundColor: '#FFFFFF14',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                }}
              >
                <Gear color={COLORS.white}
                  weight='light' size={24} />
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(2),
                    fontFamily: fonts.PoppinsRegular,
                    fontWeight: '400',
                    marginLeft: responsiveWidth(3),
                  }}
                >
                  Update Preference
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={responsiveFontSize(2)}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>

          {/* Custom tooltip for settings options */}
          <CustomTooltip
            isVisible={showTooltip.settingsOptions}
            content={
              <TourGuideTooltip
                content={settingsSteps[currentSettingsStep]?.content}
                onNext={() => dispatch(nextSettingsStep())}
                onSkip={() => dispatch(skipSettingsTour())}
                isLastStep={currentSettingsStep === settingsSteps.length - 1}
              />
            }
            placement="top"
            onClose={() => { }}
            targetMeasurements={measurements.settingsOptions}
            backgroundColor="rgba(0,0,0,0.5)"
            contentStyle={{ backgroundColor: '#F46CE3' }}
            tooltipStyle={{ minHeight: 0 }}
            arrowSize={{ width: 24, height: 12 }}
          />

          {/* Remaining options - no tour guide */}
          <TouchableOpacity
            onPress={() => navigation.navigate('UpdatePasswords')}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: responsiveWidth(4),
              alignItems: 'center',
              marginTop: responsiveHeight(2),
              borderWidth: 1,
              borderColor: '#FFFFFF29',
              borderRadius: 10,
              backgroundColor: '#FFFFFF14',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
              }}
            >
              <Lock color={COLORS.white}
                weight='light' size={24} />
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  fontFamily: fonts.PoppinsRegular,
                  fontWeight: '400',
                  marginLeft: responsiveWidth(3),

                }}
              >
                Update Password
              </Text>
            </View>
            <Icon
              name="chevron-right"
              size={responsiveFontSize(2)}
              color={COLORS.white}
            />
          </TouchableOpacity>

          {/* Rest of the settings remain unchanged */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Insights', {
                userDetail: users
              })
            }}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: responsiveWidth(4),
              alignItems: 'center',
              marginTop: responsiveHeight(2),
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.16)',
              borderRadius: 10,
              backgroundColor: '#FFFFFF14',
              alignContent: 'center',
              // backgroundColor: 'rgba(255, 255, 255, 0.16)',
              display:
                users?.subscription_type == 'goldmonthly12345_new' ||
                  users?.subscription_type == 'silvermonthly12345_new' ||
                  users?.subscription_type == 'platinummonthly12345_new'

                  ? 'flex' : 'none',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
              }}
            >
              <Icon
                name="chart-bar"
                size={responsiveFontSize(2)}
                color={COLORS.white}
              />
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  fontFamily: fonts.PoppinsRegular,
                  fontWeight: '400',
                  marginLeft: responsiveWidth(3),

                }}
              >
                Insights
              </Text>
            </View>
            <Icon
              name="chevron-right"
              size={responsiveFontSize(2)}
              color={COLORS.white}
            />
          </TouchableOpacity>


          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: responsiveWidth(4),
              alignItems: 'center',
              marginTop: responsiveHeight(2),
              borderWidth: 1,
              borderColor: '#FFFFFF29',
              borderRadius: 10,
              backgroundColor: '#FFFFFF14',
            }}
            onPress={() => {
              // Linking.openURL('https://fatedating.com/About-us');
              Linking.openURL('https://app.termly.io/policy-viewer/policy.html?policyUUID=c2e278c8-25b0-4471-a8b3-729b7ae93f19');
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
              }}
            >
              <RocketLaunch color={COLORS.white}
                weight='light' size={24} />
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  marginLeft: responsiveWidth(3),
                  fontFamily: fonts.PoppinsRegular,
                  fontWeight: '400',

                }}
              >
                Privacy Policy
              </Text>
            </View>
            <Icon
              name="chevron-right"
              size={responsiveFontSize(2)}
              color={COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: responsiveWidth(4),
              alignItems: 'center',
              marginTop: responsiveHeight(2),
              borderWidth: 1,
              borderColor: '#FFFFFF29',
              borderRadius: 10,
              backgroundColor: '#FFFFFF14',
            }}
            onPress={() => {
              // Linking.openURL('https://fatedating.com/About-us');
              Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/');
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
              }}
            >
              <Notebook color={COLORS.white}
                weight='light' size={24} />
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  marginLeft: responsiveWidth(3),
                  fontFamily: fonts.PoppinsRegular,
                  fontWeight: '400',

                }}
              >
                Terms & Conditions
              </Text>
            </View>
            <Icon
              name="chevron-right"
              size={responsiveFontSize(2)}
              color={COLORS.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              refDeleteAccountSheet.current.open();
            }}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: responsiveWidth(4),
              alignItems: 'center',
              marginTop: responsiveHeight(2),
              borderWidth: 1,
              borderColor: '#FFFFFF29',
              borderRadius: 10,
              backgroundColor: '#FFFFFF14',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
              }}
            >
              <Trash color={COLORS.white}
                weight='fill' size={24} />
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  fontFamily: fonts.PoppinsRegular,
                  fontWeight: '400',
                  marginLeft: responsiveWidth(3),

                }}
              >
                Delete my Account
              </Text>
            </View>
            <Icon
              name="chevron-right"
              size={responsiveFontSize(2)}
              color={COLORS.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              refRBSheet.current.open();
              // AsyncStorage.clear();
              // RNRestart.Restart();
            }}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: responsiveWidth(4),
              alignItems: 'center',
              marginTop: responsiveHeight(2),
              borderWidth: 1,
              borderColor: '#FFFFFF29',
              borderRadius: 10,
              backgroundColor: '#FFFFFF14',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
              }}
            >

              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  fontFamily: fonts.PoppinsRegular,
                  fontWeight: '400',
                  marginLeft: responsiveWidth(3),

                }}
              >
                Log Out
              </Text>
            </View>
            <SignOut color={COLORS.white}
              weight='fill' size={24} />
          </TouchableOpacity>

          <View
            style={{
              marginBottom: responsiveHeight(20),
            }}
          >

          </View>
        </ScrollView>

      </SafeAreaView>
    </GradientBackground >
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  // ... existing styles
  overlay: {
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.7,
    backgroundColor: 'black',
  },
  loadingOverlay: {
    position: 'absolute',
    left: -20,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 999,
    width: width + 20,
    height: height,
  },
  loadingText: {
    color: COLORS.white,
    marginTop: responsiveHeight(2),
    fontFamily: fonts.PoppinsMedium,
    fontSize: responsiveFontSize(2),
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
