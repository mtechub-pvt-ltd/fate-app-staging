import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Animated,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  ImageBackground,
} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

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
import TopBar from '../../../../components/TopBar/TopBar';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import {DraggableGrid} from 'react-native-draggable-grid';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import {setActive} from 'react-native-sound';

function LocationPermission({navigation}) {
  useEffect(() => {}, []);
  return (
    <GradientBackground>
      <TopBar
        onPress={() => {
          navigation.goBack();
        }}
      />

      <SafeAreaView
        style={{
          flex: 1,
        }}>
        <Header
          mainContainerStyle={{
            marginTop: responsiveHeight(10),
            width: responsiveWidth(80),
          }}
          title={'Your Location'}
          subtitle={'We will need your location to give you better experience'}
        />

        <View
          style={{
            marginTop: responsiveHeight(10),
          }}>
          <Image
            source={Images.Location}
            style={{
              width: responsiveWidth(90),
              height: responsiveHeight(15),
              alignItems: 'center',
              alignSelf: 'center',
              resizeMode: 'contain',
            }}
          />
          <PrimaryButton
            title={'Use My Current Location'}
            onPress={() => {}}
            style={{
              alignSelf: 'center',
              width: responsiveWidth(90),
              marginTop: responsiveHeight(2),
              marginTop: responsiveHeight(5),
              borderColor: COLORS.secondary,
              backgroundColor: COLORS.secondary,
            }}
          />
          <PrimaryButton
            title={'Maybe later'}
            onPress={() => {
              navigation.replace('MyTabs');
            }}
            style={{
              alignSelf: 'center',
              width: responsiveWidth(90),

              borderWidth: 2,
              borderColor: COLORS.primary,
              backgroundColor: 'transparent',
              marginTop: responsiveHeight(2),
            }}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
var styles = StyleSheet.create({
  buttonText: {
    fontSize: 18,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
});
export default LocationPermission;
