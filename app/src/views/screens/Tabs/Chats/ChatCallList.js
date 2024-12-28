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
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserDetail, storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import Header from '../../../../components/TopBar/Header';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import LinearGradient from 'react-native-linear-gradient';
import AppLogo from '../../../../components/AppLogo/AppLogo';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import { getMatchUsers, getUsersforJokerCard } from '../../../../Services/Auth/SignupService';
import { ScrollView } from 'react-native-gesture-handler';
function ChatList({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [match_list1, setMatchList1] = useState([]);
  const [activeDot, setActiveDot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jokerSuggerstion, setJokerSuggestion] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const refRBSheet = useRef();

  const users = [
    {
      id: 1,
      name: 'Olivia',
      image: Images.user1
    },
    {
      id: 2,
      name: 'Cristiana',
      image: Images.user2
    },
    {
      id: 3,
      name: 'Marie',
      image: Images.user3
    },
    {
      id: 4,
      name: 'Goulding',
      image: Images.user4
    },
    {
      id: 1,
      name: 'Olivia',
      image: Images.user1
    },
    {
      id: 2,
      name: 'Cristiana',
      image: Images.user2
    },
    {
      id: 3,
      name: 'Marie',
      image: Images.user3
    },
    {
      id: 4,
      name: 'Goulding',
      image: Images.user4
    },
  ]

  useEffect(() => {
    // SplashScreen.hide();
    console.log('chat list');

  }, []);
  return (

    <GradientBackground>
      <SafeAreaView
        style={{
          flex: 1,
        }}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: responsiveWidth(90),
              marginTop: Platform.OS === 'ios' ? responsiveHeight(0) : responsiveHeight(2),
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack()
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 11,
                  marginRight: responsiveWidth(3)
                }}>
                <Icon name="chevron-left" size={responsiveFontSize(2.5)} color={COLORS.white} />
              </TouchableOpacity>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2.5),
                  fontFamily: fonts.JostMedium,
                }}>
                Call History
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>

              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 11,

                  backgroundColor: 'background: rgba(255, 255, 255, 0.16)',
                  borderRadius: 50,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.06)',
                }}>
                <Icon name="search" size={responsiveFontSize(2.5)} color={COLORS.white} />
              </TouchableOpacity>

            </View>
          </View>



          <ScrollView
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            style={{
              height: responsiveHeight(85),
              width: responsiveWidth(92),
              marginTop: responsiveHeight(1),
              // backgroundColor: 'red'
            }}

          >


            {
              users.map((item, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      flexDirection: 'row',
                      marginTop: responsiveHeight(1.3),
                      padding: responsiveWidth(2),
                      borderRadius: 10,
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.16)',
                    }}>
                    <Image
                      source={item.image}
                      style={[
                        styles.fate_card_header_image,
                        {
                          width: responsiveWidth(15),
                          height: responsiveHeight(7),
                          borderRadius: 100,
                          resizeMode: 'cover',
                        },
                      ]}
                    />
                    <View
                      style={{
                        width: responsiveWidth(40),
                        marginLeft: 10
                      }}
                    >
                      <Text
                        style={{
                          color: COLORS.white,
                          fontSize: responsiveFontSize(1.9),
                          fontFamily: fonts.JostMedium,
                          marginTop: responsiveHeight(1),
                        }}>
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          color: 'background: rgba(255, 255, 255, 0.7)',
                          fontSize: responsiveFontSize(1.9),
                          marginTop: responsiveHeight(1),
                        }}>
                        Voice call - 00:30:45
                      </Text>

                    </View>
                    <View
                      style={{
                        width: responsiveWidth(25),
                        marginLeft: 10,
                        flexDirection: "row",
                        justifyContent: 'space-between',
                        alignSelf: 'center'

                      }}
                    >
                      <TouchableOpacity
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 11,
                        }}>
                        <MaterialIcon name="call" size={responsiveFontSize(3)} color={COLORS.white} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 11,
                          marginLeft: 10,
                        }}>
                        <Icon name="video" size={responsiveFontSize(2.5)} color={COLORS.white} />
                      </TouchableOpacity>

                    </View>


                  </View>
                );
              }
              )
            }
            <View
              style={{
                height: responsiveHeight(10),
              }}
            ></View>
          </ScrollView>

        </View>
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
export default ChatList;
