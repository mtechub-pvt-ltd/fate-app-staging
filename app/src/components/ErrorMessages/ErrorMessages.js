import { Text, View } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../../consts/colors';
const ErrorMessages = ({error}) => {
    return <View
    style={{
      flexDirection:'row',
      alignItems:'center',
      width:'90%',
    }}
    >
    <Icon
              name="exclamation-circle"
              size={12}
              color={COLORS.red}
              style={{
                marginRight:'2%'
              }}
            />
    <Text
    style={{
      color:COLORS.red,
      fontSize:12,
      marginVertical:'1%',
      lineHeight:20,
    }}
    >{error}</Text>
    </View>
  };


export default ErrorMessages;