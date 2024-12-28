import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const MainContainer = ({ children }) => {
    return <View style={styles.container}>{children}</View>;
  };

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: '5%',
      },
})
export default MainContainer;