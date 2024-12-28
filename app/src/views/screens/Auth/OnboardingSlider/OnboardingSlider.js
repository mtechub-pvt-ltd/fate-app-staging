import React, {useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import COLORS from '../../../../consts/colors';
import {width, height} from '../../../../consts/Dimension';
import Images from '../../../../consts/Images';
import Logo from '../../../../assets/logo.png';

import Icon from 'react-native-vector-icons/Ionicons';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import {MotiView} from 'moti';
import {addFirstInstallStatus} from '../../../../HelperFunctions/AsyncStorage/userDetail';

export default function OnboardingSlider({navigation}) {
  const [state, setState] = React.useState({
    showRealApp: false,
  });
  const slides = [
    {
      key: 'one',
      title: 'Welcome to Numee',
      text: 'Experience a whole new world of virtual simulation and unleash your imagination',
      image: Images.slider1,
      backgroundColor: COLORS.secondary + '20',
    },
    {
      key: 'two',
      title: 'Embark on a Virtual Adventure!',
      text: 'Step into the realm of virtual sims and create your own unique virtual life',
      image: Images.slider3,
      backgroundColor: COLORS.primary + '20',
    },
    {
      key: 'three',
      title: 'Unleash Creativity in Virtual Sims!',
      text: 'Build, customize, and explore limitless possibilities in our immersive simulation world',
      image: Images.slider2,
      backgroundColor: COLORS.secondary + '20',
    },
  ];
  const renderItem = ({item, index}) => {
    return (
      <MotiView
        delay={1000}
        from={{
          opacity: 0,
          translateY: 100,
        }}
        animate={{
          opacity: 1,
          translateY: 0,
        }}
        transition={{
          type: 'spring',
          delay: index == 0 ? 1000 : index == 1 ? 2000 : index == 2 ? 3000 : 0,
        }}
        style={{
          flex: 1,
          backgroundColor: item.backgroundColor,
          alignItems: 'center',
          justifyContent: 'space-around',
        }}>
        <View
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            source={item.image}
            style={{
              width: 400,
              height: 400,
              alignSelf: 'center',
            }}
          />
          <View
            style={{
              backgroundColor: 'transparent',
              padding: '5%',
              width: '90%',
              marginBottom: '15%',
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 40,
                fontWeight: 'bold',
                marginBottom: '5%',
                color: COLORS.dark,
              }}>
              {item.title}
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 20,
                color: COLORS.greylight,
                lineHeight: 30,
              }}>
              {item.text}
            </Text>
          </View>
        </View>
      </MotiView>
    );
  };
  const onDone = () => {
    // User finished the introduction. Show real app through
    setState({showRealApp: true});
  };

  React.useEffect(() => {}, []);
  return <Text>xscdvfgbhn</Text>;
}

const styles = StyleSheet.create({
  sliderButton: {
    width: width / 4,

    paddingVertical: '4%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    alignSelf: 'center',
  },
  sliderButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
