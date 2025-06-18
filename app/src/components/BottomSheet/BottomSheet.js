import React from 'react';
import { StyleSheet } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import COLORS from '../../consts/colors';
import { BlurView } from '@react-native-community/blur';
const BottomSheet = React.forwardRef((props, ref) => {
  return (
    <RBSheet
      ref={ref} // Use forwarded ref here
      height={props.height ? props.height : 300}
      openDuration={250}
      customStyles={{
        container: {
          backgroundColor:
            props.backgroundColor ? props.backgroundColor : COLORS.black,

          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
        },
      }}
      onClose={() => {
        if (props.onClose) {
          props.onClose();
        }
      }}
      dragFromTopOnly={true}
      closeOnDragDown={true}
      closeOnPressMask={true}
    >
      {
        props.backgroundColor ? (
          <BlurView
            style={[StyleSheet.absoluteFill, {
            }]}
            blurType="light"
            blurAmount={30}
          >
            {props.children}
          </BlurView>
        ) : (props.children)
      }

    </RBSheet>
  );
});

export default BottomSheet;
