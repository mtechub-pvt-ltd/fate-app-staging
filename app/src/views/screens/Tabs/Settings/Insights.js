import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { getUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';

import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import { getUserInsights } from '../../../../Services/Auth/SignupService';
import { ScrollView } from 'react-native-gesture-handler';






function HomePage({ route, navigation }) {

  const disqualifyList = [
    {
      id: 1,
      content: 'Not my type (looks)',
      type: 'NOT_MY_TYPE',
    },
    {
      id: 2,
      content: 'Rude',
      type: 'RUDE',
    },
    {
      id: 3,
      content: 'Not feeling safe',
      type: 'NOT_FEELING_SAFE',
    },
    {
      id: 4,
      content: 'Not Interesting / Engaging enough',
      type: 'NOT_INTERESTING',
    },
    {
      id: 5,
      content: 'Do not like user profile',
      type: 'DO_NOT_LIKE_USER_PROFILE',
    },
    {
      id: 6,
      content: 'Incompatible lifestyle - e.g.Smoking, Drinking, Exercise',
      type: 'INCOMPATIBLE_LIFESTYLE',
    },
    {
      id: 7,
      content: 'Not ambitious(career or education)',
      type: 'NOT_AMBITIOUS',
    },
    {
      id: 8,
      content: 'Our values don’t match - e.g.religion, politics',
      type: 'OUR_VALUES_DONOT_MATCH',
    },
  ]

  const dates = [
    'DAILY', 'WEEKLY', 'MONTHLY'];
  const [selectedDate, setSelectedDate] = useState('DAILY');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newDisqualifyList, setNewDisqualifyList] = useState([]);

  const handleDate = (item) => {
    setSelectedDate(item);
    callInsights();
  }

  const callInsights = async () => {
    setLoading(true);
    try {
      const userDetail = await getUserDetail();
      const data = {
        user_id: userDetail?.data?.id,
        date_type: selectedDate === 'DAILY' ? 'day' : selectedDate === 'WEEKLY' ? 'week' : 'month',
      };
      const response = await getUserInsights(data);
      if (response.error === false) {

        setInsights(response?.data);

        let data = disqualifyList.map((item, index) => {
          return {
            ...item,
            count: response?.data?.totalDisqualifyUsersType?.map((item1, index1) => {
              if (item.type === item1.type) {
                return parseInt(item1.count);
              }
            })
          }
        });

        let sortedData = data?.sort((a, b) => {
          return b.count - a.count;
        });

        setNewDisqualifyList(sortedData);





      } else {
        setInsights(null);
        alert(response.msg);
      }
      setLoading(false);
    } catch (error) {
      console.log('error', error);
      setLoading(false);
    }





  }
  useEffect(() => {
    callInsights();
  }, []);

  return (
    <GradientBackground>
      <SafeAreaView
        style={{
          flex: 1,
        }}>

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
              fontSize: responsiveFontSize(3.5),
              fontFamily: fonts.PoppinsMedium,
            }}>
            {' '}Insights
          </Text>

        </View>

        {/* data */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: responsiveHeight(2),
          }}
        >
          {
            dates.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    handleDate(item);
                  }}
                >
                  <Text
                    style={{
                      padding: responsiveWidth(2),
                      color: COLORS.white,
                      fontSize: responsiveFontSize(2),
                      borderWidth: 0,
                      borderColor: selectedDate === item ? COLORS.white : COLORS.black,
                      width: responsiveWidth(30),
                      textAlign: 'center',
                      borderRadius: 10,
                      overflow: 'hidden',
                      fontFamily: fonts.PoppinsRegular,
                      backgroundColor: selectedDate === item ? COLORS.secondary2 : 'transparent',
                    }}
                  >
                    {item.toLowerCase().split('')[0].toUpperCase() + item.toLowerCase().slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })
          }



        </View>

        <View
          style={{
            height: responsiveHeight(50),
            alignItems: 'center',
            justifyContent: 'center',
            display: loading ? 'flex' : 'none',
          }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            display: loading ? 'none' : 'flex',
          }}
        >

          <View
            style={{
              marginVertical: responsiveHeight(2),
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                width: responsiveWidth(44),
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: responsiveWidth(3),
                borderRadius: 10,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <Icon
                  name="heart-broken"
                  size={responsiveFontSize(5)}
                  color={COLORS.secondary2}
                  style={{
                    marginLeft: responsiveWidth(2),
                  }}
                />
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(5),
                    fontFamily: fonts.PoppinsLight,
                    marginLeft: responsiveWidth(2),
                  }}>
                  {
                    insights?.totalDisqualifyUsers
                  }
                </Text>
              </View>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(1.7),
                  marginLeft: responsiveWidth(2),
                }}>
                Total Disqualification
              </Text>

            </View>
            <View
              style={{
                width: responsiveWidth(44),
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: responsiveWidth(3),
                borderRadius: 10,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >

                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(5),
                    fontFamily: fonts.PoppinsLight,
                    marginLeft: responsiveWidth(2),
                  }}>
                  {
                    insights?.totalDisqualifyUsersTypeCount
                  }
                </Text>
              </View>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(1.7),
                  marginLeft: responsiveWidth(2),
                }}>
                Selected Reasons
              </Text>

            </View>
          </View>

          {/* map disqualifyList with insights totalDisqualifyUsersType
           */}
          {
            newDisqualifyList?.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: responsiveWidth(3),
                    borderRadius: 10,
                    marginVertical: responsiveHeight(1),
                  }}
                  activeOpacity={0.8}

                >
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: responsiveFontSize(2.5),
                      marginLeft: responsiveWidth(2),
                    }}>
                    {
                      item?.count
                    }
                  </Text>
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: responsiveFontSize(1.6),
                      marginLeft: responsiveWidth(2),
                      marginTop: responsiveHeight(1),
                    }}>
                    {item?.content}
                  </Text>
                </TouchableOpacity>
              );
            }
            )
          }


        </ScrollView>
      </SafeAreaView>
    </GradientBackground >

  );
}
const styles = StyleSheet.create({

});
export default HomePage;
