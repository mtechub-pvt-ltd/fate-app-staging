import React, { useEffect } from 'react';
import { height } from '../../consts/Dimension';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import fonts from '../../consts/fonts';
import { responsiveFontSize } from 'react-native-responsive-dimensions';

const FlashMessages = ({ flashMessageData }) => {
  useEffect(() => {
    if (flashMessageData && flashMessageData.message) {
      showMessage({
        message: flashMessageData.message,
        description: flashMessageData.description,
        type: flashMessageData.type,
        backgroundColor: flashMessageData.backgroundColor, // Using backgroundColor from the flash message data
        color: "#ffffff", // Text color
        icon: {
          icon: flashMessageData.icon,
          position: 'left',
          color: "#ffffff",
        },
        duration: 3000,
      });
    }
  }, [flashMessageData]); // Update when flash message data changes

  return (
    <FlashMessage
      style={{
        backgroundColor: flashMessageData?.backgroundColor || 'rgba(0,0,0,0.8)',
        zIndex: 9999,
      }}
      titleStyle={{
        fontWeight: 'bold',
        color: "#ffffff",
        fontFamily: fonts.PoppinsMedium,
        marginBottom: height * 0.01,
        fontSize: responsiveFontSize(2),
      }}
      textStyle={{
        color: "#ffffff",
        fontFamily: fonts.PoppinsMedium,
      }}
      position="top"
      duration={3000}
    />
  );
};

export default FlashMessages;
