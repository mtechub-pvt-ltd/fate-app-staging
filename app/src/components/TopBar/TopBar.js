import { StyleSheet, Image, Text, View, TouchableOpacity, Platform } from 'react-native';
import React from 'react';
// import { Image } from 'moti';
import Images from '../../consts/Images';
import { width, height } from '../../consts/Dimension';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import COLORS from '../../consts/colors';
import fonts from '../../consts/fonts';
import Icon from 'react-native-vector-icons/FontAwesome5';
const TopBar = props => {
  return (
    <View
      style={{
        top: Platform.OS == 'ios' ? responsiveHeight(1) : responsiveHeight(2),
        width: '14%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 100,
        display: props.onPress ? 'flex' : 'none',
        marginVertical: responsiveHeight(1),
      }}>
      <TouchableOpacity
        onPress={props.onPress}
        style={{
          padding: 10,
          width: responsiveWidth(10),
          // backgroundColor: COLORS.primary,
          alignContent: 'center',
          alignItems: 'center',
        }}>
        <Icon name="chevron-left" size={responsiveFontSize(3)} color={COLORS.white} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={props.rightIconPress}
        style={{
          padding: 10,
          width: responsiveWidth(10),
          // backgroundColor: COLORS.primary,
          alignContent: 'center',
          alignItems: 'center',
        }}>
        <Icon name={props.rightIcon} size={responsiveFontSize(2.5)} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  imageStyle: {
    width: width * 0.6,
    height: height * 0.11,
    resizeMode: 'contain',
  },
});
export default TopBar;
