import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
// import { Image } from 'moti';
import { width, height } from '../../consts/Dimension';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import COLORS from '../../consts/colors';
import fonts from '../../consts/fonts';
import Icon from 'react-native-vector-icons/FontAwesome5';
const Header = props => {
  return (
    <View
      style={[
        {
          justifyContent: 'flex-start',
          padding: responsiveWidth(0),
        },
        props.mainContainerStyle,
      ]}>
      <TouchableOpacity
        onPress={props.onIconPress}
        style={{
          padding: responsiveWidth(2),
          marginVertical: responsiveHeight(2),
        }}
      >
        <Icon name={props.IconName} size={props.iconSize} color={COLORS.white} />
      </TouchableOpacity>
      <Text
        style={[
          {
            fontSize: responsiveFontSize(3.2),
            fontWeight: '500',
            color: COLORS.white,
            // lineHeight: responsiveHeight(2),
            fontFamily: fonts.PoppinsSemiBold,
          },
          props.titleStyle,
        ]}>
        {props.title}
      </Text>
      <Text
        style={{
          fontSize: responsiveFontSize(2),
          color: COLORS.white,
          marginVertical: responsiveHeight(1),
          // lineHeight: responsiveHeight(3),
          textTransform: 'capitalize',
          width: responsiveWidth(80),
          fontFamily: fonts.PoppinsRegular,
          fontWeight: '400',
        }}>
        {props.subtitle}
      </Text>
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
export default Header;
