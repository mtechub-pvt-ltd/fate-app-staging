import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Animated,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Platform,
  ScrollView,

} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserDetail, storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import Header from '../../../../components/TopBar/Header';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import LinearGradient from 'react-native-linear-gradient';
import AppTextLogo from '../../../../components/AppLogo/AppTextLogo';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import { getAllTokens } from '../../../../Services/Auth/SignupService';
import RBSheet from 'react-native-raw-bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import RNRestart from 'react-native-restart';
import { useIsFocused } from '@react-navigation/native';
import {
  Heart,
  User,
  Eye,
  Eraser,
  Star,
  Lock,
  ChartBar,
  Virus,
  Book,
  SignOut,
  Coins,
  Gear,
  Notebook,
  SealCheck
} from 'phosphor-react-native';





function HomePage({ route, navigation }) {
  const refRBSheet = useRef();
  const [users, setUsers] = useState(null);
  const [tokens, setTokens] = useState(null);
  const isFocused = useIsFocused();
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
  // const getUserTokens = async () => {

  // };
  useEffect(() => {
    getMatchUsersList();

  }, [isFocused]);




  return (
    <GradientBackground>
      <SafeAreaView
        style={{
          flex: 1,
        }}>
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
                title="Log Out"
                onPress={() => {
                  refRBSheet.current.close();
                  AsyncStorage.clear();
                  RNRestart.Restart();
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
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: responsiveWidth(90),
              marginTop: Platform.OS === 'ios' ? responsiveHeight(0) : responsiveHeight(2),
              alignItems: 'center',
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
          <View
            style={{
              backgroundColor: '#FFFFFF0F',
              padding: responsiveWidth(2),
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#FFFFFF29',
              marginTop: responsiveHeight(2),

            }}
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
                // overflow: 'hidden',
              }}
              imageStyle={{
                borderRadius: 50,
              }}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate('EditProfile')}
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
                {/* <Icon name="eraser" size={responsiveFontSize(2)} color={COLORS.white} /> */}
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
              {
                users?.age
              } Years {'\n'}

            </Text>
          </View>

          <ImageBackground
            source={Images.test_stars}
            // style={{
            //   width: Platform.OS === 'ios' ? responsiveWidth(23) : responsiveWidth(19.5),
            //   height: responsiveHeight(10),
            //   resizeMode: 'contain',
            //   alignSelf: 'center',
            //   borderRadius: 50,
            //   // overflow: 'hidden',
            // }}
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
          >
            <View>

              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(4),
                  fontFamily: fonts.PoppinsBold,
                }}
              >
                {tokens?.tokens.length == 0 ? 0 : tokens?.tokens}
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
                  alert('This feature is not available for Android users') :
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
          <TouchableOpacity
            onPress={() => {
              Platform.OS === 'ios' ?
                navigation.navigate('PricingandPlan') :
                alert('This feature is not available for Android users')
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
              {/* <ChartBar color={COLORS.white}
                weight='light' size={24} /> */}
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
              {/* <Icon
                name="user-edit"
                size={responsiveFontSize(2)}
                color={COLORS.white}
              /> */}
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
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              display:
                users?.subscription_type == 'goldmonthly12345' ||
                  users?.subscription_type == 'silvermonthly12345' ||
                  users?.subscription_type == 'platinummonthly12345'

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
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
              }}
            >
              <Virus color={COLORS.white}
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
                  fontFamily: fonts.PoppinsRegular,
                  fontWeight: '400',
                  marginLeft: responsiveWidth(3),

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
