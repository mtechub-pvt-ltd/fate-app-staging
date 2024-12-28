import { StyleSheet, Image, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import React from 'react';
// import { Image } from 'moti';
import Images from '../../consts/Images';
import { width, height } from '../../consts/Dimension';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import COLORS from '../../consts/colors';
import fonts from '../../consts/fonts';
import Icon from 'react-native-vector-icons/FontAwesome5';
const PrimaryButton = props => {
  return (
    <TouchableOpacity
      disabled={props.loading}
      onPress={props.onPress}
      activeOpacity={0.6}
      style={[
        {
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          backgroundColor: props?.backgroundColor ? props.backgroundColor : '#A90074',
          width: responsiveWidth(80),
          borderRadius: responsiveWidth(3),
          padding: responsiveWidth(0),

        },
        props.style,
      ]}>
      <ActivityIndicator
        size="small"
        style={{
          marginRight: 10,
          display: props.loading ? 'flex' : 'none',
        }}
        color={COLORS.grey}
        animating={props.loading}
      />
      <Text
        style={{
          fontSize: responsiveFontSize(2.5),
          color: props?.textColor ? props.textColor : COLORS.white,
          fontWeight: '600',
          textAlign: 'center',
          lineHeight: responsiveHeight(6),
        }}>
        {props.title}
      </Text>
      {
        props.icon && (
          <Icon
            name={props.icon}
            style={{
              marginLeft: responsiveWidth(2),
              padding: responsiveWidth(2),
              color: COLORS.primary,
            }}
            size={responsiveFontSize(2)}
          />
        )
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imageStyle: {
    width: width * 0.6,
    height: height * 0.11,
    resizeMode: 'contain',
  },
});
export default PrimaryButton;
