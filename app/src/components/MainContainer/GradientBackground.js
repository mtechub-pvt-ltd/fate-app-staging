import { StyleSheet } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import COLORS from '../../consts/colors';

const GradientBackground = ({ children, gradientStyle }) => {
  return (
    <LinearGradient colors={[COLORS.black, COLORS.primary]} style={[styles.linearGradient, gradientStyle]}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5,
    width: '100%',
    height: '100%',
  },
});
export default GradientBackground;
