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
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserDetail, storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';

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
import { updatePasswordNew } from '../../../../Services/Auth/SignupService';
import RBSheet from 'react-native-raw-bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import { SliderBox } from "react-native-image-slider-box";
import { ScrollView } from 'react-native-gesture-handler';
import { height } from '../../../../consts/Dimension';
import { Horse, Heart, Cube, Eye, EyeSlash } from 'phosphor-react-native';






function HomePage({ route, navigation }) {

  const [userDetail, setUserDetail] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showoldPassword, setShowOldPassword] = useState(false);
  const [shownewPassword, setShowNewPassword] = useState(false);
  const [showconfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {

    if (oldPassword === '') {
      alert('Please enter old password');
    } else if (newPassword === '') {
      alert('Please enter new password');
    } else if (confirmPassword === '') {
      alert('Please enter confirm password');
    } else if (newPassword !== confirmPassword) {
      alert('New password not matched with confirm password');
    } else {
      console.log('update password');
      setLoading(true);

      const data = {
        user_id: userDetail.data.id,
        oldPassword: oldPassword,
        newPassword: newPassword,
      };
      const response = await updatePasswordNew(data);
      console.log('response PASS ________', response);
      setLoading(false);
      if (response?.error === true) {
        alert(response?.msg);
      } else {
        alert(response?.msg);
        await storeUserDetail(response.user);
        console.log('userDetail_________ form api ', response.data);
        navigation.navigate('MyTabs', {
          screen: 'Home',
        });
      }
    }
  };



  useEffect(() => {
    getUserDetail().then(res => {
      setUserDetail(res);
    });
  }, []);

  return (
    <GradientBackground>
      <SafeAreaView
        style={{
          flex: 1,
        }}>
        <ScrollView>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              width: responsiveWidth(90),
              marginTop: Platform.OS === 'ios' ? responsiveHeight(0) : responsiveHeight(2),
              alignItems: 'center',
              paddingHorizontal: responsiveWidth(2),
              paddingVertical: responsiveHeight(2),
            }}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();

              }}
            >
              <Icon name="chevron-left"
                style={{
                  marginRight: responsiveWidth(2),
                  padding: responsiveWidth(2),
                }}

                size={responsiveFontSize(3)} color={COLORS.white} />
            </TouchableOpacity>
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2.5),
                fontFamily: fonts.PoppinsMedium,
              }}>
              {' '}Update Password
            </Text>

          </View>



          <CustomInput
            mainContainerStyle={{
              marginTop: responsiveHeight(2),
            }}

            title="Old Password"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Enter password"
            secureTextEntry={showoldPassword}
            onChangeText={text => {
              setOldPassword(text);
            }}
            leftIcon={
              showoldPassword ?
                <Eye color={COLORS.white} size={24} /> :
                <EyeSlash color={COLORS.white} size={24} />
            }
            leftIconPress={() => {
              showoldPassword(!showoldPassword);
            }}
          />
          <CustomInput
            mainContainerStyle={{
              marginTop: responsiveHeight(3),
            }}

            title="New Password"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Enter password"
            secureTextEntry={shownewPassword}
            onChangeText={text => {
              setNewPassword(text);
            }}
            leftIcon={
              shownewPassword ?
                <Eye color={COLORS.white} size={24} /> :
                <EyeSlash color={COLORS.white} size={24} />
            }
            leftIconPress={() => {
              setShowNewPassword(!shownewPassword);
            }}
          />
          <CustomInput
            mainContainerStyle={{
              marginTop: responsiveHeight(3),
              marginBottom: responsiveHeight(2),
            }}

            title="Confirm Password"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Enter password"
            secureTextEntry={showconfirmPassword}
            onChangeText={text => {
              setConfirmPassword(text);
            }}

            leftIcon={
              showconfirmPassword ?
                <Eye color={COLORS.white} size={24} /> :
                <EyeSlash color={COLORS.white} size={24} />
            } leftIconPress={() => {
              setShowConfirmPassword(!showconfirmPassword);
            }}
          />
          <PrimaryButton
            title="Update"
            loading={loading}
            onPress={() => {
              handleUpdatePassword();
            }}
            style={{
              marginTop: responsiveHeight(4),
              alignSelf: 'center',
              width: responsiveWidth(90),
            }}
            backgroundColor={COLORS.white}
            textColor={COLORS.primary}
          />











        </ScrollView>
      </SafeAreaView>
    </GradientBackground >
  );
}
const styles = StyleSheet.create({

});
export default HomePage;
