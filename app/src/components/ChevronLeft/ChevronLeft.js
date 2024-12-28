import { StyleSheet, Text, View ,TouchableOpacity
} from 'react-native'
import React from 'react'
import { width, height } from '../../consts/Dimension';
import Icon from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../../consts/colors';
const ChevronLeft = ({onPress}) => {
    return <TouchableOpacity
    activeOpacity={0.7}
    style={{
      alignSelf:'flex-start',
      backgroundColor:COLORS.white,
      paddingVertical:'.5%',
      paddingHorizontal:'3.5%',
      borderRadius:50,
      borderWidth:1,
      borderColor:COLORS.greylight+70,
      position:'absolute',
      alignItems:'center',
      justifyContent:'center',
      top:'2%',
      left:'4%',
     }}
      onPress={onPress}
    >
      <Icon
        name="chevron-left"
        size={20}
        color={COLORS.primary}
        style={{
          alignSelf: 'center',
          marginVertical: '2%',
        }}
      />
    </TouchableOpacity>
  };


export default ChevronLeft;