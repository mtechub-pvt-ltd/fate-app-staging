import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { getUserDetail, storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';

import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import { updatePasswordNew } from '../../../../Services/Auth/SignupService';
import { ScrollView } from 'react-native-gesture-handler';
import { Eye, EyeSlash } from 'phosphor-react-native';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';

function HomePage({ route, navigation }) {
  const [userDetail, setUserDetail] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showoldPassword, setShowOldPassword] = useState(false);
  const [shownewPassword, setShowNewPassword] = useState(false);
  const [showconfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [flashMessage, setFlashMessage] = useState(false);
  const [flashMessageData, setFlashMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
    backgroundColor: COLORS.red,
    textColor: COLORS.white,
  });

  const handleUpdatePassword = async () => {
    try {
      if (!oldPassword) {
        setFlashMessageData({
          message: 'Validation Error',
          description: 'Please enter old password',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => setFlashMessage(false), 3000);
        return;
      }

      if (!newPassword) {
        setFlashMessageData({
          message: 'Validation Error',
          description: 'Please enter new password',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => setFlashMessage(false), 3000);
        return;
      }

      if (!confirmPassword) {
        setFlashMessageData({
          message: 'Validation Error',
          description: 'Please enter confirm password',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => setFlashMessage(false), 3000);
        return;
      }

      if (newPassword !== confirmPassword) {
        setFlashMessageData({
          message: 'Validation Error',
          description: 'New password does not match confirm password',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => setFlashMessage(false), 3000);
        return;
      }

      setLoading(true);

      const data = {
        user_id: userDetail?.data?.id || '',
        oldPassword,
        newPassword,
      };

      const response = await updatePasswordNew(data);

      setLoading(false);

      if (response?.error) {
        setFlashMessageData({
          message: 'Error',
          description: response?.msg || 'Failed to update password',
          type: 'info',
          icon: 'info',
          backgroundColor: COLORS.red,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => setFlashMessage(false), 3000);
      } else {
        setFlashMessageData({
          message: 'Success',
          description: response?.msg || 'Password updated successfully',
          type: 'success',
          icon: 'success',
          backgroundColor: COLORS.success,
          textColor: COLORS.white,
        });
        setFlashMessage(true);
        setTimeout(() => {
          setFlashMessage(false);
          storeUserDetail(response?.user || {}).then(() => {
            navigation.navigate('MyTabs', {
              screen: 'Home',
            });
          });
        }, 3000);
      }
    } catch (error) {
      setLoading(false);
      setFlashMessageData({
        message: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        type: 'error',
        icon: 'error',
        backgroundColor: COLORS.red,
        textColor: COLORS.white,
      });
      setFlashMessage(true);
      setTimeout(() => setFlashMessage(false), 3000);
    }
  };

  useEffect(() => {
    getUserDetail()
      .then(res => {
        setUserDetail(res || {});
      })
      .catch(() => {
        setUserDetail({});
      });
  }, []);

  return (
    <GradientBackground>
      {flashMessage && <FlashMessages flashMessageData={flashMessageData} />}
      <SafeAreaView style={{ flex: 1 }}>
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon
                name="chevron-left"
                style={{ marginRight: responsiveWidth(2), padding: responsiveWidth(2) }}
                size={responsiveFontSize(3)}
                color={COLORS.white}
              />
            </TouchableOpacity>
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2.5),
                fontFamily: fonts.PoppinsMedium,
              }}>
              {' '}
              Update Password
            </Text>
          </View>

          <CustomInput
            mainContainerStyle={{ marginTop: responsiveHeight(2) }}
            title="Old Password"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Enter password"
            secureTextEntry={!showoldPassword}
            onChangeText={text => setOldPassword(text)}
            leftIcon={
              showoldPassword ? (
                <Eye color={COLORS.white} size={24} />
              ) : (
                <EyeSlash color={COLORS.white} size={24} />
              )
            }
            leftIconPress={() => setShowOldPassword(!showoldPassword)}
          />
          <CustomInput
            mainContainerStyle={{ marginTop: responsiveHeight(3) }}
            title="New Password"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Enter password"
            secureTextEntry={!shownewPassword}
            onChangeText={text => setNewPassword(text)}
            leftIcon={
              shownewPassword ? (
                <Eye color={COLORS.white} size={24} />
              ) : (
                <EyeSlash color={COLORS.white} size={24} />
              )
            }
            leftIconPress={() => setShowNewPassword(!shownewPassword)}
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
            secureTextEntry={!showconfirmPassword}
            onChangeText={text => setConfirmPassword(text)}
            leftIcon={
              showconfirmPassword ? (
                <Eye color={COLORS.white} size={24} />
              ) : (
                <EyeSlash color={COLORS.white} size={24} />
              )
            }
            leftIconPress={() => setShowConfirmPassword(!showconfirmPassword)}
          />
          <PrimaryButton
            title="Update"
            loading={loading}
            onPress={handleUpdatePassword}
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
    </GradientBackground>
  );
}

const styles = StyleSheet.create({});

export default HomePage;
