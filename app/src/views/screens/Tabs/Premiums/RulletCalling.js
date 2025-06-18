import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';

import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import { ScrollView } from 'react-native-gesture-handler';






function HomePage({ route, navigation }) {

  const pricing_feature = [
    {
      id: 1,
      title: 'No countdown for match allocation',
    },
    {
      id: 2,
      title: '2 extra matches in match pool',
    },
    {
      id: 3,
      title: '10 Disqualifications allowed per day',
    },
    {
      id: 4,
      title: 'Joker card',
    },
  ];
  useEffect(() => {

  }, []);

  return (
    <GradientBackground>
      <SafeAreaView
        style={{
          flex: 1,
        }}>
        <ScrollView>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              width: responsiveWidth(90),
              marginTop: Platform.OS === 'ios' ? responsiveHeight(6) : responsiveHeight(2),
              alignItems: 'center',
              paddingHorizontal: responsiveWidth(2),
              paddingVertical: responsiveHeight(2),
            }}>
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(3),
                fontWeight: '600',
                alignItems: 'center',
                alignContent: 'center',
              }}>
              We’ve found you a caller  <Icon name="heart"
                style={{
                  marginLeft: responsiveWidth(2),
                  padding: responsiveWidth(2),
                  color: COLORS.primary,

                }}
                size={responsiveFontSize(3)}
              />
            </Text>

          </View>

          <Image
            source={Images.user1}
            style={{
              width: responsiveWidth(30),
              height: responsiveHeight(15),
              resizeMode: 'contain',
              alignSelf: 'center',
              marginVertical: responsiveHeight(2),

            }}
          />

          <Text
            style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2.7),
              textAlign: 'center',
              marginVertical: responsiveHeight(3),
              fontWeight: '600',
            }}>
            05:53 / 10:00
          </Text>
          <PrimaryButton
            title="Swap"
            loading={false}
            onPress={() => {
              console.log('I am ready');
            }}
            style={{
              marginTop: responsiveHeight(0),
              alignSelf: 'center',
              width: responsiveWidth(40),
            }}
            backgroundColor={COLORS.white}
            textColor={COLORS.primary}
            icon="sync"
          />
          <Text
            style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2.5),
              textAlign: 'center',
              marginVertical: responsiveHeight(5),
            }}>
            Let us find you a caller for 10 minutes. If you don't like them, swap for the next caller and end the call to disqualify someone.
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: responsiveWidth(60),
              alignSelf: 'center',
            }}
          >
            <TouchableOpacity
              style={{
                paddingVertical: 10,
                paddingHorizontal: 15,
                // marginRight: responsiveWidth(2),
                backgroundColor: 'background: rgba(255, 255, 255, 0.16)',
                borderRadius: 50,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.06)',
              }}>
              <Icon name="microphone" size={responsiveFontSize(3.5)} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 12,
                // marginRight: responsiveWidth(2),
                backgroundColor: 'background: rgba(255, 255, 255, 0.16)',
                borderRadius: 50,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.06)',
              }}>
              <MaterialIcon name="call-end" size={responsiveFontSize(3.5)} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                // marginRight: responsiveWidth(2),
                backgroundColor: 'background: rgba(255, 255, 255, 0.16)',
                borderRadius: 50,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.06)',
              }}>
              <MaterialCommunityIcon name="volume-high" size={responsiveFontSize(3.5)} color={COLORS.white} />
            </TouchableOpacity>

          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground >
  );
}
const styles = StyleSheet.create({

});
export default HomePage;
