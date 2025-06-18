import { StyleSheet, Image, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import React from 'react';
// import { Image } from 'moti';
import { width, height } from '../../consts/Dimension';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import COLORS from '../../consts/colors';
import fonts from '../../consts/fonts';
const SecondaryButton = props => {
  return (
    <TouchableOpacity
      onPress={() => {
        props.onPress();
      }}
      activeOpacity={0.6}
      style={
        [{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          backgroundColor: '#FFFFFF14',
          width: responsiveWidth(90),
          borderRadius: responsiveWidth(4),
          borderWidth: 1,
          borderColor: '#FFFFFF3D',
          marginVertical: responsiveHeight(.7),
          paddingVertical: responsiveHeight(.7)

        }, {
          ...props?.style
        }]}>
      <ActivityIndicator
        size="small"
        style={{
          marginRight: 10,
          display: props.loading ? 'flex' : 'none',
        }}
        color={COLORS.grey}
        animating={props.loading}
      />
      <Image
        source={props.image}
        style={{
          width: responsiveWidth(6),
          height: responsiveHeight(4),
          resizeMode: 'contain',
          alignSelf: 'center',
          marginRight: responsiveWidth(2),
          // backgroundColor: COLORS.white,
          ...props.imageStyle,
        }}
      />

      <Text
        style={{
          fontSize: Platform.OS === 'ios' ? responsiveFontSize(2) :
            responsiveFontSize(2),
          color: COLORS.white,
          fontFamily: fonts.PoppinsRegular,
          fontWeight: '500',
          textAlign: 'center',
          // lineHeight: responsiveHeight(6),
        }}>
        {
          props.title
        }
      </Text>

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
export default SecondaryButton;
