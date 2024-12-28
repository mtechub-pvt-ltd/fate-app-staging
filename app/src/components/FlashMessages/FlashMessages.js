import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { width, height } from '../../consts/Dimension';
import Icon from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../../consts/colors';
import FlashMessage, { showMessage, hideMessage } from 'react-native-flash-message';
import fonts from '../../consts/fonts';
import { responsiveFontSize } from 'react-native-responsive-dimensions';

const FlashMessages = ({ falshMessageData }) => {
  React.useEffect(() => {
    showMessage({
      message: falshMessageData.message,
      description: falshMessageData.description,
      type: falshMessageData.type,
      icon: {
        icon: falshMessageData.icon,
        position: 'left',
        color: falshMessageData.textColor,
      },
    });
  }, []);
  return (
    <FlashMessage
      style={{
        backgroundColor: falshMessageData.backgroundColor,
        zIndex: 9999,
      }}
      titleStyle={{
        fontWeight: 'bold',
        color: falshMessageData.textColor,
        fontFamily: fonts.PoppinsMedium,
        marginBottom: height * 0.01,
        fontSize: responsiveFontSize(2),
      }}
      textStyle={{
        color: falshMessageData.textColor,
        fontFamily: fonts.PoppinsMedium,
      }}
      position="top"
      duration={5000}
    />
  );
};

export default FlashMessages;
