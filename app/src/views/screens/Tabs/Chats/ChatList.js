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
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
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
import AppLogo from '../../../../components/AppLogo/AppLogo';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import { getMatchUsers, getUsersforJokerCard, getMatchUsersForChat } from '../../../../Services/Auth/SignupService';
import { ScrollView } from 'react-native-gesture-handler';
// used is focused to check if the screen is focused or not
import { useIsFocused } from '@react-navigation/native';
import { BlurView } from '@react-native-community/blur';
import {
  House,
  BellRinging,
  BellSimple,
  MagnifyingGlass,
  X as CloseIcon,
} from 'phosphor-react-native';

function ChatList({ navigation }) {
  const isFocused = useIsFocused();
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
  const [users, setUsers] = useState([]);
  const [actualUsers, setActualUsers] = useState([]);
  const [searchable, setSearchable] = useState(false);
  const [searchText, setSearchText] = useState('');

  const refRBSheet = useRef();



  const getMatchUsersList = async () => {
    setLoading(true);
    const userDetail = await getUserDetail();
    const data = {
      // user_id: 245,
      // current_user_gender: 'MALE',
      user_id: userDetail?.data?.id,
      current_user_gender: userDetail?.data?.gender,
    };
    setCurrentUser(userDetail?.data);

    const response = await getMatchUsersForChat(data);
    // console.log('response for chatlist', response.conns);
    // sort mateches by last message timestamp

    setUsers(response.matches);
    setActualUsers(response.matches);

    setLoading(false);
  };
  useEffect(() => {
    // SplashScreen.hide();

    getMatchUsersList();
  }, [isFocused]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const hours = parseInt(timestamp.substring(11, 13), 10);
    const minutes = timestamp.substring(14, 16);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 hour to 12 for 12-hour clock
    return `${formattedHours}:${minutes} ${ampm}`;
  };
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
              alignItems: 'center',
            }}>

            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2.7),
                fontFamily: fonts.PoppinsMedium,
              }}>
              Chat
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',

              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                  width: responsiveWidth(85),
                  display: searchable ? 'flex' : 'none',
                }}
              >
                <TextInput
                  value={searchText}
                  autoCapitalize="none"
                  keyboardType="default"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.16)',
                    width: Platform.OS === 'ios' ? responsiveWidth(65) :
                      responsiveWidth(60),
                    padding: responsiveHeight(1.5),
                    color: 'white',
                    paddingLeft:
                      Platform.OS === 'ios' ?
                        responsiveWidth(4) : responsiveWidth(6),
                    fontFamily: 'JostMedium',
                    fontSize: responsiveFontSize(1.5),
                    borderRadius: 50,
                  }}
                  placeholder="Search ..."

                  placeholderTextColor="white"
                  onChangeText={(e) => {
                    setSearchText(e);
                    if (e.trim() === '') {
                      // Reset users list if search is cleared
                      setUsers(actualUsers);
                    } else {
                      // Filter the conversations
                      const filtered = actualUsers.filter((item) =>
                        item?.name?.toLowerCase().includes(e.toLowerCase())
                      );
                      setUsers(filtered);
                    }
                  }}


                />
                <TouchableOpacity
                  onPress={() => {
                    setSearchable(!searchable);
                    setSearchText('');
                    setUsers(actualUsers); // Reset users to the full list
                  }}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 11,
                    marginLeft: responsiveWidth(2),
                  }}
                >
                  <CloseIcon size={24} color={COLORS.white} />
                </TouchableOpacity>

              </View>
              {/* <TouchableOpacity
                onPress={() => {
                  navigation.navigate('ChatCallList');
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 11,
                  marginRight: responsiveWidth(2),
                  backgroundColor: 'background: rgba(255, 255, 255, 0.16)',
                  borderRadius: 50,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.06)',
                  display: searchable ? 'none' : 'flex',
                }}>
                <Image
                  source={Images.call_icon}
                  style={{
                    width: responsiveWidth(4.5),
                    height: responsiveHeight(2),
                    resizeMode: 'contain',
                    tintColor: COLORS.white,
                  }}
                />
              </TouchableOpacity> */}
              <TouchableOpacity
                onPress={() => {
                  setSearchable(!searchable);

                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 11,
                  display: searchable ? 'none' : 'flex',
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
              height:
                Platform.OS === 'ios' ? responsiveHeight(75) :
                  responsiveHeight(80),
              width: responsiveWidth(92),
              marginTop: responsiveHeight(1),
            }}
            refreshControl={
              <RefreshControl
                tintColor={COLORS.white}
                refreshing={false} onRefresh={getMatchUsersList} />
            }
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: responsiveWidth(90),
                marginTop: Platform.OS === 'ios' ? responsiveHeight(1) : responsiveHeight(2),
              }}>

              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2.2),
                  fontFamily: fonts.PoppinsMedium,
                  fontWeight: '500',
                }}>
                Conversations
              </Text>
            </View>
            {
              users?.map((item, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSearchText('');
                      setSearchable(false);
                      navigation.navigate('Chats_New', {
                        currentUser: currentUser.id,
                        otherUser: item.user_id,
                        otherUserImage: item?.profile_image,
                        otherUserName: item?.name,
                        otherUserType: item.role,
                      });
                    }}
                    activeOpacity={0.8}
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
                    <BlurView

                      style={{
                        // zIndex: 999,
                        display: item.role === 'ACE' ? 'flex' : 'none',
                        overflow: 'hidden',
                        borderRadius: 32,
                        backgroundColor: 'rgba(255, 255, 255, 0.16)',
                      }}
                      blurType="light"
                      blurAmount={4}
                      reducedTransparencyFallbackColor="white"
                    >
                      <Image
                        source={
                          item.profile_image === null ? Images.user : { uri: item.profile_image }
                        }
                        style={[
                          styles.fate_card_header_image,
                          {
                            width: responsiveWidth(15),
                            height: responsiveHeight(7),
                            borderRadius: 100,
                            resizeMode: 'cover',
                            zIndex: -9,
                          },
                        ]}
                      />
                    </BlurView>
                    <Image
                      source={
                        item.profile_image === null ? Images.user : { uri: item.profile_image }
                      }
                      style={[
                        styles.fate_card_header_image,
                        {
                          width:
                            Platform.OS === 'ios' ? responsiveWidth(15) :
                              responsiveWidth(14),
                          height: responsiveHeight(7),
                          borderRadius: 100,
                          resizeMode: 'cover',
                          display: item.role != 'ACE' ? 'flex' : 'none'
                        },
                      ]}
                    />
                    <View
                      style={{
                        width: responsiveWidth(70),
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginLeft: responsiveWidth(2),

                        }}
                      >
                        <Text
                          style={{
                            color: COLORS.white,
                            fontSize: responsiveFontSize(1.9),
                            fontFamily: fonts.PoppinsMedium,
                            marginTop: responsiveHeight(1),
                          }}>

                          {
                            item?.name === null ? 'New User' :
                              item?.name}
                        </Text>
                        <Text
                          style={{
                            color: COLORS.white,
                            fontSize: responsiveFontSize(1.3),
                            fontFamily: fonts.PoppinsMedium,
                            marginTop: responsiveHeight(1),

                          }}>
                          {
                            // item?.lastMessage?.timestamp1?.replace(/\s/g, '')?.substring(11, 16)
                            formatTime(item?.lastMessage?.timestamp1)
                          }
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginLeft: responsiveWidth(2),
                          marginTop: responsiveHeight(-1),
                        }}
                      >
                        <Text
                          style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: responsiveFontSize(1.4),
                            fontFamily: fonts.PoppinsMedium,
                            marginTop: responsiveHeight(1),
                          }}>
                          {/* {item.email} */}
                          {item?.lastMessage?.content
                            ? item?.lastMessage?.content.split(' ').length > 5
                              ? item?.lastMessage?.content.split(' ').slice(0, 5).join(' ') + '...'
                              : item?.lastMessage?.content.startsWith('http') || item?.lastMessage?.content.startsWith('https')
                                ? '🗾 Image'
                                : item?.lastMessage?.content
                            : 'No new message'}

                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            marginTop: responsiveHeight(1.5),

                          }}
                        >
                          <Icon
                            name="check"
                            size={responsiveFontSize(1.2)}
                            color={COLORS.grey}
                            style={{
                              marginRight: responsiveWidth(-1),
                            }}
                          /><Icon
                            name="check"
                            size={responsiveFontSize(1.2)}
                            color={COLORS.grey}
                          />
                        </View>

                      </View>
                    </View>


                  </TouchableOpacity>
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
