import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Animated,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Platform,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserDetail, storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';

import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import Header from '../../../../components/TopBar/Header';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import LinearGradient from 'react-native-linear-gradient';
import AppTextLogo from '../../../../components/AppLogo/AppTextLogo';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import { getMatchUsers, getUsersforJokerCard } from '../../../../Services/Auth/SignupService';
import RBSheet from 'react-native-raw-bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import { SliderBox } from "react-native-image-slider-box";
import { ScrollView } from 'react-native-gesture-handler';
import { height } from '../../../../consts/Dimension';





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
              justifyContent: 'flex-start',
              width: responsiveWidth(90),
              marginTop: Platform.OS === 'ios' ? responsiveHeight(0) : responsiveHeight(2),
              alignItems: 'center',
              paddingHorizontal: responsiveWidth(2),
              paddingVertical: responsiveHeight(2),
            }}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();

              }}
            >
              <Icon name="chevron-left"
                style={{
                  marginRight: responsiveWidth(2),
                  padding: responsiveWidth(2),
                }}
                size={responsiveFontSize(3)} color={COLORS.white} />
            </TouchableOpacity>
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2.5),
                fontFamily: fonts.JostMedium,
              }}>
              {' '}Pricing
            </Text>

          </View>




          <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              padding: responsiveWidth(2),
              borderRadius: 10,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.16)',
            }}
          >
            <SimpleLineIcon
              name="badge"
              size={responsiveFontSize(3)}
              color={COLORS.white}
            />
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2.2),
                fontFamily: fonts.JostMedium,
                marginTop: responsiveHeight(1),
              }}>
              SILVER
            </Text>
            <Text
              style={{
                color: COLORS.white,

                marginTop: responsiveHeight(1),
              }}>
              <Text
                style={{
                  fontSize: responsiveFontSize(3.5),
                  fontWeight: 'bold',
                }}
              >$9.99</Text>  <Text
                style={{
                  fontSize: responsiveFontSize(2.5),
                  fontWeight: '500',
                }}
              >Per month</Text>
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                padding: responsiveWidth(2),
                borderRadius: 10,
                width: responsiveWidth(42),
                alignContent: 'center',
                justifyContent: 'space-between',
                marginTop: responsiveHeight(1),
              }}
            >
              <Icon
                name="rocket"
                size={responsiveFontSize(2.5)}
                color={COLORS.white}
              />
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  fontWeight: '500',
                  color: COLORS.white,
                }}
              >
                Includes Bronze
              </Text>

            </View>
            <View
              style={{
                width: responsiveWidth(88),
                flexDirection: 'row',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255, 255, 255, 0.16)',
                marginVertical: responsiveHeight(2),
              }}
            >
            </View>
            {
              pricing_feature.map((item, index) => {
                return (<View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: responsiveHeight(1),
                  }}
                >

                  <Icon
                    name="star"
                    size={responsiveFontSize(2.5)}
                    color={COLORS.white}
                  />
                  <Text
                    style={{
                      fontSize: responsiveFontSize(2),
                      fontWeight: '500',
                      color: COLORS.white,
                      marginLeft: responsiveWidth(2),
                    }}
                  >
                    {
                      item.title
                    }
                  </Text>
                </View>)
              })
            }

            <PrimaryButton
              title="Subscribe Now"
              loading={false}
              onPress={() => {
                console.log('Send message');
              }}
              style={{
                marginTop: responsiveHeight(0),
                alignSelf: 'center',
                width: responsiveWidth(90),
              }}
              backgroundColor={COLORS.white}
              textColor={COLORS.primary}
            />

          </View>
          <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              padding: responsiveWidth(2),
              borderRadius: 10,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.16)',
              marginTop: responsiveHeight(2),
            }}
          >
            <SimpleLineIcon
              name="badge"
              size={responsiveFontSize(3)}
              color={COLORS.white}
            />
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2.2),
                fontFamily: fonts.JostMedium,
                marginTop: responsiveHeight(1),
              }}>
              SILVER
            </Text>
            <Text
              style={{
                color: COLORS.white,

                marginTop: responsiveHeight(1),
              }}>
              <Text
                style={{
                  fontSize: responsiveFontSize(3.5),
                  fontWeight: 'bold',
                }}
              >$9.99</Text>  <Text
                style={{
                  fontSize: responsiveFontSize(2.5),
                  fontWeight: '500',
                }}
              >Per month</Text>
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                padding: responsiveWidth(2),
                borderRadius: 10,
                width: responsiveWidth(42),
                alignContent: 'center',
                justifyContent: 'space-between',
                marginTop: responsiveHeight(1),
              }}
            >
              <Icon
                name="rocket"
                size={responsiveFontSize(2.5)}
                color={COLORS.white}
              />
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  fontWeight: '500',
                  color: COLORS.white,
                }}
              >
                Includes Bronze
              </Text>

            </View>
            <View
              style={{
                width: responsiveWidth(88),
                flexDirection: 'row',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255, 255, 255, 0.16)',
                marginVertical: responsiveHeight(2),
              }}
            >
            </View>
            {
              pricing_feature.map((item, index) => {
                return (<View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: responsiveHeight(1),
                  }}
                >

                  <Icon
                    name="star"
                    size={responsiveFontSize(2.5)}
                    color={COLORS.white}
                  />
                  <Text
                    style={{
                      fontSize: responsiveFontSize(2),
                      fontWeight: '500',
                      color: COLORS.white,
                      marginLeft: responsiveWidth(2),
                    }}
                  >
                    {
                      item.title
                    }
                  </Text>
                </View>)
              })
            }

            <PrimaryButton
              title="Subscribe Now"
              loading={false}
              onPress={() => {
                console.log('Send message');
              }}
              style={{
                marginTop: responsiveHeight(0),
                alignSelf: 'center',
                width: responsiveWidth(90),
              }}
              backgroundColor={COLORS.white}
              textColor={COLORS.primary}
            />

          </View>
          <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              padding: responsiveWidth(2),
              borderRadius: 10,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.16)',
              marginTop: responsiveHeight(2),
            }}
          >
            <SimpleLineIcon
              name="badge"
              size={responsiveFontSize(3)}
              color={COLORS.white}
            />
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2.2),
                fontFamily: fonts.JostMedium,
                marginTop: responsiveHeight(1),
              }}>
              SILVER
            </Text>
            <Text
              style={{
                color: COLORS.white,

                marginTop: responsiveHeight(1),
              }}>
              <Text
                style={{
                  fontSize: responsiveFontSize(3.5),
                  fontWeight: 'bold',
                }}
              >$9.99</Text>  <Text
                style={{
                  fontSize: responsiveFontSize(2.5),
                  fontWeight: '500',
                }}
              >Per month</Text>
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                padding: responsiveWidth(2),
                borderRadius: 10,
                width: responsiveWidth(42),
                alignContent: 'center',
                justifyContent: 'space-between',
                marginTop: responsiveHeight(1),
              }}
            >
              <Icon
                name="rocket"
                size={responsiveFontSize(2.5)}
                color={COLORS.white}
              />
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  fontWeight: '500',
                  color: COLORS.white,
                }}
              >
                Includes Bronze
              </Text>

            </View>
            <View
              style={{
                width: responsiveWidth(88),
                flexDirection: 'row',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255, 255, 255, 0.16)',
                marginVertical: responsiveHeight(2),
              }}
            >
            </View>
            {
              pricing_feature.map((item, index) => {
                return (<View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: responsiveHeight(1),
                  }}
                >

                  <Icon
                    name="star"
                    size={responsiveFontSize(2.5)}
                    color={COLORS.white}
                  />
                  <Text
                    style={{
                      fontSize: responsiveFontSize(2),
                      fontWeight: '500',
                      color: COLORS.white,
                      marginLeft: responsiveWidth(2),
                    }}
                  >
                    {
                      item.title
                    }
                  </Text>
                </View>)
              })
            }

            <PrimaryButton
              title="Subscribe Now"
              loading={false}
              onPress={() => {
                console.log('Send message');
              }}
              style={{
                marginTop: responsiveHeight(0),
                alignSelf: 'center',
                width: responsiveWidth(90),
              }}
              backgroundColor={COLORS.white}
              textColor={COLORS.primary}
            />

          </View>











        </ScrollView>
      </SafeAreaView>
    </GradientBackground >
  );
}
const styles = StyleSheet.create({

});
export default HomePage;
