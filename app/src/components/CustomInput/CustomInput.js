import { StyleSheet, Image, Text, View, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
// import { Image } from 'moti';
import Images from '../../consts/Images';
import { width, height } from '../../consts/Dimension';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import COLORS from '../../consts/colors';
import fonts from '../../consts/fonts';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Horse, Heart, Cube } from 'phosphor-react-native';
const CustomInput = props => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={[{ alignSelf: 'center' }, props.mainContainerStyle]}>
      <Text
        style={{
          color: COLORS.white,
          fontSize: responsiveFontSize(2),
          fontFamily: fonts.PoppinsRegular,
          fontWeight: '500',
          ...props.titleStyle,
        }}>
        {props.title}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignContent: 'center',
          alignItems: 'center',
        }}>
        <TextInput
          ref={props.refInput}
          value={props.value}
          autoCapitalize={props.autoCapitalize}
          keyboardType={props.keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={props.secureTextEntry}
          style={{
            backgroundColor: '#FFFFFF29',
            width: responsiveWidth(90),
            padding: responsiveHeight(1.7),
            borderRadius: 20,
            marginTop: responsiveHeight(1),
            paddingLeft: 20,
            fontFamily: fonts.PoppinsRegular,
            fontSize: responsiveFontSize(2),
            borderWidth: responsiveWidth(0.2),
            borderColor: isFocused ? COLORS.primary :
              props.borderColor ? props.borderColor : '#FFFFFF3D',
            color: 'white',
            ...props.style,
          }}
          placeholderTextColor={COLORS.grey}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          {...props}
        />
        {props.leftIcon && (
          <TouchableOpacity
            onPress={props.leftIconPress}
            style={{
              position: 'absolute',
              right: responsiveWidth(2),
              padding: 10,
              top: responsiveHeight(1.8),
              display: 'flex',
            }}>
            {props.leftIcon}
          </TouchableOpacity>
        )}

      </View>
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
export default CustomInput;
