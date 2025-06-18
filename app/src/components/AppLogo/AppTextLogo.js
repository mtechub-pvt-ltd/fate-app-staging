import {StyleSheet, Image} from 'react-native';
import React from 'react';
// import { Image } from 'moti';
import Images from '../../consts/Images';
import {responsiveHeight, responsiveWidth} from 'react-native-responsive-dimensions';
const AppTextLogo = ({style}) => {
  return <Image source={Images.writtenLogo} style={[styles.imageStyle, style]} />;
};

const styles = StyleSheet.create({
  imageStyle: {
    width: responsiveWidth(40),
    height: responsiveHeight(5),
    resizeMode: 'contain',
  },
});
export default AppTextLogo;
