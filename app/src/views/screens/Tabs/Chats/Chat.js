import React, {useEffect, useState, useRef} from 'react';
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
import {ActivityIndicator} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getUserDetail, storeUserDetail} from '../../../../HelperFunctions/AsyncStorage/userDetail';
import {responsiveHeight, responsiveWidth, responsiveFontSize} from 'react-native-responsive-dimensions';
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
function Chat({route, navigation}) {
  const {item} = route.params;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const refRBSheet = useRef();
  const match_list = [
    {
      id: 1,
      image: Images.image_9,
      name: 'Isabell',
      status: 'Online',
      card_name: 'fate',
      card_type: 'FATE',
    },
    {
      id: 2,
      image: Images.image_k,
      name: 'Kesh',
      status: 'Online',
      card_name: 'K',
      card_type: 'NORMAL',
    },
    {
      id: 3,
      image: Images.image_j,
      name: 'Jenny',
      status: 'Online',
      card_name: 'J',
      card_type: 'NORMAL',
    },
    {
      id: 4,
      image: Images.image_10,
      name: 'Olivia',
      status: 'Online',
      card_name: '10',
      card_type: 'NORMAL',
    },

    {
      id: 5,
      image: Images.image_9,
      name: 'Kesh',
      status: 'Online',
      card_name: 'A',
      card_type: 'ANONYMOUS',
    },
    {
      id: 6,
      image: Images.image_joker,
      name: 'Jhon',
      status: 'Online',
      card_name: 'Joker',
      card_type: 'JOKER',
    },
  ];
  const chat_list = [
    {
      user_id: 1,
      message: 'Hi Alex, apparently you’re my top match haha',
      message_type: 'TEXT',
      time: '12:32 AM',
      bot: false,
    },
    {
      user_id: 2,
      message: 'Thats cool, You’re in my top two, nice to meet you!',
      time: '12:32 AM',
      bot: false,
    },
    {
      user_id: 3,
      message: 'You both have a hobby in common,it starts with H',
      Message_type: 'TEXT',
      time: '12:32 AM',
      bot: true,
    },
    {
      user_id: 1,
      message: 'No way you’re a hiker too??',
      message_type: 'TEXT',
      time: '12:32 AM',
      bot: false,
    },
    {
      user_id: 2,
      message: 'https://iili.io/JVxPPxj.jpg',
      message_type: 'IMAGE',
      time: '12:32 AM',
      bot: false,
    },
    {
      user_id: 2,
      message: 'Yes i got back from one this weekend actually!!',
      message_type: 'TEXT',
      time: '12:32 AM',
      bot: false,
    },
  ];
  return (
    <GradientBackground>
      <SafeAreaView
        style={{
          flex: 1,
        }}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexDirection: 'row',
            // backgroundColor: COLORS.primary,
            width: '100%',
            paddingVertical: responsiveHeight(2),
          }}>
          <Icon
            name="chevron-left"
            size={responsiveFontSize(3)}
            color={COLORS.white}
            style={{left: responsiveWidth(2), zIndex: 9999}}
            onPress={() => navigation.goBack()}
          />
          <View
            style={{
              flexDirection: 'row',
            }}>
            <Image
              source={item.image}
              style={{
                marginLeft: responsiveWidth(5),
                width: responsiveWidth(15),
                height: responsiveHeight(7),
                borderRadius: 100,
                padding: responsiveWidth(2),
              }}
            />
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(3),
                fontFamily: fonts.JostMedium,
                marginLeft: responsiveWidth(2),
              }}>
              {item.name} {'\n'}
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(1.5),
                }}>
                Online
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              right: responsiveWidth(2),
              padding: responsiveWidth(2),
            }}>
            <Icon name="video" size={responsiveFontSize(2)} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              right: responsiveWidth(15),
              padding: responsiveWidth(2),
            }}>
            <Icon
              name="phone"
              style={{
                transform: [{rotate: '90deg'}],
              }}
              size={responsiveFontSize(2)}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={chat_list}
          renderItem={({item}) =>
            item.bot ? (
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: 'black',
                  marginHorizontal: 10,
                  padding: 10,
                  justifyContent: 'space-between',
                  borderTopEndRadius: 10,
                  borderTopStartRadius: 0,
                  borderBottomStartRadius: 10,
                  borderBottomEndRadius: 10,
                  marginVertical: 15,
                }}>
                <Text
                  style={{
                    margin: 10,
                    color: 'white',
                    alignSelf: 'flex-start',
                    width: '70%',
                  }}>
                  {item.message}
                </Text>
                <Image
                  source={AppLogo}
                  style={{
                    width: 40,
                    height: 40,
                    resizeMode: 'contain',
                  }}
                />
              </View>
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: item.user_id == 1 ? 'white' : '#f095deff',
                  width: '70%',
                  margin: 10,
                  borderTopEndRadius: item.user_id != 1 ? 0 : 10,
                  borderTopStartRadius: item.user_id == 1 ? 0 : 10,
                  borderBottomStartRadius: 10,
                  borderBottomEndRadius: 10,
                  alignSelf: item.user_id == 1 ? 'flex-start' : 'flex-end',
                  overflow: 'hidden',
                }}>
                <Text
                  style={{
                    margin: 10,
                    color: 'black',
                    display: item.message_type == 'IMAGE' ? 'none' : 'flex',
                  }}>
                  {item.message}
                </Text>
                <Image
                  source={{
                    uri: item.message,
                  }}
                  style={{
                    width: '100%',
                    height: responsiveHeight(20),
                    overflow: 'hidden',
                    resizeMode: 'contain',
                    marginHorizontal: 5,
                    display: item.message_type == 'IMAGE' ? 'flex' : 'none',
                    borderRadius: 20,
                    padding: 10,
                  }}
                />
              </View>
            )
          }
          keyExtractor={item => item.id}
          ListFooterComponent={() => (
            <View
              style={{
                height: 150,
              }}></View>
          )}
        />
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            position: 'absolute',
            bottom: 0,
            width: '100%',
            backgroundColor: '#e754caff',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '80%',
              backgroundColor: 'black',
              borderRadius: 10,
              margin: 10,
            }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 10,
              }}>
              {/* <Icon as={Ionicons} name={'happy-outline'} size={25} color={'grey'} /> */}
              <Icon name="smile" size={25} color={'grey'} />
            </TouchableOpacity>
            <TextInput
              style={{
                width: '70%',
                padding: responsiveHeight(2),
                borderRadius: 10,
                // margin: 10,
                color: 'white',
              }}
              placeholder={'Type a message'}
            />
            <TouchableOpacity
              style={{
                marginRight: 20,
              }}>
              {/* <Icon as={Ionicons} name={'camera'} size={25} color={'grey'} />
               */}
              <Icon name="camera" size={25} color={'grey'} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{
              padding: 12,
              backgroundColor: 'black',
              borderRadius: 10,
              marginRight: 10,
            }}>
            {/* <Icon as={Ionicons} name={'send'} size={5} color={'#F258D4'} /> */}
            <Icon name="paper-plane" size={25} color={'#F258D4'} />
          </TouchableOpacity>
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
    transform: [{rotate: '180deg'}],
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
    transform: [{rotate: '180deg'}],
  },
  normal_card_right_header_text: {
    transform: [{rotate: '180deg'}],
    marginTop: responsiveHeight(1),
  },
});
export default Chat;
