import {StyleSheet, Image} from 'react-native';
import React from 'react';
// import { Image } from 'moti';
import Images from '../../consts/Images';
import {width, height} from '../../consts/Dimension';
const AppLogo = ({style}) => {
  return <Image source={Images.Applogo} style={[styles.imageStyle, style]} />;
};

const styles = StyleSheet.create({
  imageStyle: {
    width: width * 0.6,
    height: height * 0.11,
    resizeMode: 'contain',
  },
});
export default AppLogo;
