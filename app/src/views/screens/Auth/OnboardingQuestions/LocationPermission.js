import React, {useEffect} from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Image,
} from 'react-native';

import {responsiveHeight, responsiveWidth} from 'react-native-responsive-dimensions';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import Header from '../../../../components/TopBar/Header';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import TopBar from '../../../../components/TopBar/TopBar';

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
