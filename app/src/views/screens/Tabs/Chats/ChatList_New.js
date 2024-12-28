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
  ScrollView,
  Button,
  Platform

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
import io from 'socket.io-client';
import { node_base_url } from '../../../../consts/baseUrls';
function ChatList({ navigation }) {

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const getActiveUsers = async () => {
    var InsertAPIURL = node_base_url + '/user/v1/getallusers?page=1';
    var headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    // var body = {
    //   email: data.email,
    //   password: data.password,
    //   device_id: '123456', 
    //   role: 'user',
    // };
    try {
      const response = await fetch(InsertAPIURL, {
        method: 'GET',
        headers: headers,
        // body: JSON.stringify(body),
      });
      const jsonResponse = await response.json();
      setUsers(jsonResponse.data);
    } catch (error) {
      console.error('This is the error:', error);
      throw error;
    }
  }
  useEffect(() => {
    getActiveUsers();
    getUserDetail().then((res) => {
      setCurrentUser(res.data);
    });
  }, []);



  return (
    <GradientBackground>
      <SafeAreaView
        style={{
          flex: 1,
        }}>
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            // check if item .id is equal to current user id then dont show that item
            item.id === currentUser.id ? null :
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: responsiveWidth(2),
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.lightGray,
                }}
                onPress={() => {
                  console.log('currentUser', currentUser.id);
                  console.log('otherUser', item.id);
                  // navigation.navigate('Chats_New', {
                  //   currentUser: currentUser.id,
                  //   otherUser: item.id,
                  // });

                  navigation.navigate('Chats_New', {
                    currentUser: currentUser.id,
                    otherUser: item.id,
                    // otherUserImage: item.profile_image,
                    // otherUserName: item.name,
                  });
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                  <View style={{ marginLeft: responsiveWidth(2) }}>
                    <Text
                      style={{
                        fontFamily: fonts.JostMedium,
                        fontSize: responsiveFontSize(2),
                        color: COLORS.white,
                      }}>
                      {item.id}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.JostRegular,
                        fontSize: responsiveFontSize(1.5),
                        color: COLORS.white,
                      }}>
                      {item.email}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.white}
                />
              </TouchableOpacity>
          )}
        />


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
export default ChatList;
