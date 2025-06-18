import React, {
  useEffect, useState, useRef
} from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import Header from '../../../../components/TopBar/Header';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import { updateUserProfilePerference } from '../../../../Services/Auth/SignupService';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {
  GenderMale,
  GenderFemale,
} from 'phosphor-react-native';
// import RangeSlider from '@jesster2k10/react-native-range-slider';





function UpdateProfilePreference({ route, navigation }) {
  const userDetail = route.params.userDetail;
  console.log('userDetail_________ ', userDetail);
  const [activeIndex, setActiveIndex] = useState(1);

  const [age, setAge] = useState({
    min: userDetail?.prefered_min_age == 18 ? 18 : userDetail?.prefered_min_age + 1,
    max: userDetail?.prefered_max_age + 1 > 58 ? 58 : userDetail?.prefered_max_age + 1,
  });
  const inputRef = useRef(null);
  const refBottomSheet = useRef(null);
  const [selectedGender, setSelectedGender] = useState(userDetail?.prefered_gender?.toLowerCase());

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
  };
  const genderList = [
    {
      name: 'Male',
    },
    {
      name: 'Female',
    },
  ];

  const [list, setList] = useState([
    {
      title: `Your Preferred ${'\n'}Age for Dating`,
      subtitle: 'based on this age, we will show you potential matches',
      placeholder: 'Age',
      actualPlaceholder: 'e.g. 21',
      keyboardType: 'number-pad',
      value: age,
      type: 'AGE',
    },
    {
      title: `What is your  ${'\n'}preferred gender?`,
      subtitle: 'We will only show you people in this gender',
      placeholder: 'Gender',
      keyboardType: 'default',
      value: userDetail.prefered_gender.toLowerCase(),
      type: 'GENDER',
    },
  ]);

  const [loading, setLoading] = useState(false);
  // message state
  const [falshMessage, setFalshMessage] = useState(false);
  const [falshMessageData, setFalshMessageData] = useState({
    message: '',
    description: '',
    type: '',
    icon: '',
  });


  // slider value
  const onChange = (min, max) => {
    setAge({
      min: min,
      max: max,
    })
  }

  const onValuesChange = (values) => {
    setAge({
      min: values[0],
      max: values[1],
    });
  };




  const UpdateProfilePreference = async () => {
    setLoading(true);
    const value = await AsyncStorage.getItem('userDetail');
    const userD = JSON.parse(value);
    const data = {
      user_id: userD.id,
      prefered_min_age: age.min - 1,
      prefered_max_age: age.max - 1,
      prefered_gender: selectedGender.toUpperCase(),
    }
    console.log('data_________ ', data);


    const reponse = await updateUserProfilePerference(data);
    setLoading(false);

    if (reponse.error === false) {
      await storeUserDetail(reponse.user);
      console.log('userDetail_________ form api ', reponse.user);
      navigation.navigate('MyTabs', {
        screen: 'Home',
        params: { isUpdated: true },
      });

    } else {
      alert(reponse.msg)
    }

  };




  useEffect(() => { }, []);
  return (
    <GradientBackground>
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}


      <SafeAreaView
        style={{
          flex: 1,
        }}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack()
          }}
          style={{
            width: responsiveWidth(10),
            alignContent: 'center',
            alignItems: 'center',
            zIndex: 999,
            marginTop: Platform.OS === 'ios' ? responsiveHeight(2) : responsiveHeight(5),
          }}>
          <Icon name="chevron-left" size={responsiveFontSize(3)} color={COLORS.white} />
        </TouchableOpacity>
        <Header
          mainContainerStyle={{
            marginTop: responsiveHeight(-5),
            marginHorizontal: responsiveWidth(1),
          }}
          title={'Update Profile Preferences'}
          subtitle={`Based on this information,${'\n'}we will show you potential matches`}
        />

        <View
          style={{
            marginHorizontal: responsiveWidth(1),
            padding: responsiveHeight(1),
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2.3),
              fontFamily: fonts.PoppinsMedium,
            }}
          >
            Update Age Preference :
          </Text>

        </View>
        <>
          <View
            style={{
              marginVertical: responsiveHeight(2),
              justifyContent: 'center',
              alignContent: 'center',
            }}
          >

            <MultiSlider
              values={[age.min, age.max]}
              min={18}
              max={58}
              step={1}
              onValuesChange={onValuesChange}
              selectedStyle={{
                backgroundColor: COLORS.primary,
              }}  // Custom color for selected range
              unselectedStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.24)',
                borderRadius: 10,
              }}  // Custom color for unselected range
              markerStyle={{
                backgroundColor: COLORS.primary,
                borderWidth: Platform.OS === 'ios' ? 4 : 2,
                padding: 10,
                borderColor: COLORS.white,
              }}  // Custom marker style
              containerStyle={{
                alignSelf: 'center',
              }}
              sliderLength={responsiveWidth(85)}
              trackStyle={{
                height: 10,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: responsiveWidth(5),
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(2),
                color: COLORS.white,
              }}
            >
              {age.min}
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(2),
                color: COLORS.white,
              }}
            >
              {age.max}
            </Text>
          </View>
        </>

        <Text
          style={{
            color: COLORS.white,
            fontSize: responsiveFontSize(2.3),
            fontFamily: fonts.PoppinsMedium,
            marginVertical: responsiveHeight(2),
            marginHorizontal: responsiveWidth(3),
          }}
        >
          Update Gender Preferences
        </Text>



        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginHorizontal: responsiveWidth(2),
          marginTop: responsiveHeight(2),
        }}>
          <TouchableOpacity
            onPress={() => handleGenderSelect('male')}
            style={{
              width: responsiveWidth(40),
              padding: responsiveHeight(1.5),
              backgroundColor: selectedGender === 'male' ? COLORS.primary : 'rgba(255, 255, 255, 0.16)',
              borderRadius: 15,
              justifyContent: 'space-evenly',
              alignItems: 'center',
              borderWidth: responsiveWidth(0.5),
              borderColor: 'rgba(255, 255, 255, 0.24)',
              flexDirection: 'row',
              alignContent: 'center',
            }}
            activeOpacity={0.8}
          >
            <GenderMale size={32} color={COLORS.white} />
            <Text
              style={{
                color: COLORS.white,
                fontFamily: fonts.PoppinsRegular,
                fontSize: responsiveFontSize(2),

              }}
            >
              Male
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleGenderSelect('female')}
            style={{
              width: responsiveWidth(40),
              padding: responsiveHeight(1.5),
              backgroundColor: selectedGender === 'female' ? COLORS.primary : 'rgba(255, 255, 255, 0.16)',
              borderRadius: 15,
              justifyContent: 'space-evenly',
              alignItems: 'center',
              alignContent: 'center',
              borderWidth: responsiveWidth(0.5),
              borderColor: 'rgba(255, 255, 255, 0.24)',
              flexDirection: 'row',
            }}
            activeOpacity={0.8}
          >
            <GenderFemale size={32} color={COLORS.white} />
            <Text
              style={{
                color: COLORS.white,
                fontFamily: fonts.PoppinsRegular,
                fontSize: responsiveFontSize(2),

              }}
            >
              Female
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
              onPress={() => {
                refBottomSheet.current.open();
              }}
              activeOpacity={0.8}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                width: responsiveWidth(90),
                padding: responsiveHeight(1.2),
                borderRadius: 15,
                marginTop: responsiveHeight(1),
                paddingLeft: 20,
                fontFamily: fonts.JostMedium,
                fontSize: responsiveFontSize(2),
                justifyContent: 'space-between',
                flexDirection: 'row',
                borderWidth: responsiveWidth(0.2),
                borderColor: 'rgba(255, 255, 255, 0.24)'
              }}>
              <Text
                style={{
                  fontFamily: fonts.PoppinsRegular,
                  padding: responsiveHeight(0.7),
                  color: COLORS.white,
                }}>
                {list[activeIndex].value === 'Select_Gender' ? 'Select Gender' : list[activeIndex].value}
              </Text>
              <Icon
                name="chevron-down"
                style={{
                  padding: responsiveHeight(0.7),
                }}
                size={20}
                color={COLORS.white}
              />
            </TouchableOpacity> */}
        </View>



        <PrimaryButton
          loading={loading}
          title={activeIndex < list.length - 1 ? 'Next' : 'Update'}
          onPress={() => {
            if (
              list[activeIndex].type === 'FULL_NAME' &&
              (list[activeIndex].value.trim().length < 3 || list[activeIndex].value.trim() === '')
            ) {
              setFalshMessageData({
                message: 'Error',
                description: 'Name must be at least 3 characters long',
                type: 'info',
                icon: 'info',
                backgroundColor: COLORS.red,
                textColor: COLORS.white,
              });
              setFalshMessage(true);
              setTimeout(() => {
                setFalshMessage(false);
              }, 3000);
              return;
            }

            if (activeIndex < list.length - 1) {
              if (list[activeIndex].type === 'AGE' && list[activeIndex].value < 18) {
                setFalshMessageData({
                  message: 'Error',
                  description: 'Age should be greater than 18',
                  type: 'info',
                  icon: 'info',
                  backgroundColor: COLORS.red,
                  textColor: COLORS.white,
                });
                setFalshMessage(true);
                setTimeout(() => {
                  setFalshMessage(false);
                }, 3000);
                return;
              }
              if (list[activeIndex].type === 'AGE' && list[activeIndex].value >= 50) {
                setFalshMessageData({
                  message: 'Error',
                  description: 'Age should be less than 50',
                  type: 'info',
                  icon: 'info',
                  backgroundColor: COLORS.red,
                  textColor: COLORS.white,
                });
                setFalshMessage(true);
                setTimeout(() => {
                  setFalshMessage(false);
                }, 3000);
                return;
              }
              setActiveIndex(activeIndex + 1);

              // empty the input field
            } else {
              if (list[activeIndex].type === 'GENDER' && list[activeIndex].value === 'Select_Gender') {
                setFalshMessageData({
                  message: 'Error',
                  description: 'Please select Gender',
                  type: 'info',
                  icon: 'info',
                  backgroundColor: COLORS.red,
                  textColor: COLORS.white,
                });
                setFalshMessage(true);
                setTimeout(() => {
                  setFalshMessage(false);
                }, 3000);
                return;
              }
              UpdateProfilePreference()

              // navigation.navigate('OnboardingQuestions');
            }
          }}
          style={{
            alignSelf: 'center',
            width: responsiveWidth(90),
            bottom: responsiveHeight(5),
            position: 'absolute',
          }}
          backgroundColor={COLORS.white}
          textColor={COLORS.primary}
        />
        <BottomSheet height={250} ref={refBottomSheet}>
          <View
            style={{
              justifyContent: 'space-between',
              flexDirection: 'row',
              width: responsiveWidth(100),
            }}
          >
            <Text
              style={{
                padding: responsiveHeight(2),
                fontSize: responsiveFontSize(2.5),
                // fontFamily: fonts.JostMedium,
                color: COLORS.primary,
                alignSelf: 'center',
              }}
            >
              Select Gender
            </Text>
            <TouchableOpacity
              onPress={() => {
                refBottomSheet.current.close();
              }}
              style={{
                padding: responsiveHeight(2),
              }}
            >
              <Icon
                name="times"
                size={20}
                color={COLORS.white}


              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              const newList = list.map(item => {
                if (item.type === 'GENDER') {
                  return { ...item, value: genderList[0].name };
                }
                return item;
              });
              setList(newList);
              refBottomSheet.current.close();
            }}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255, 255, 255, 0.24)',
            }}>
            <Text
              style={{
                padding: responsiveHeight(2),
                fontSize: responsiveFontSize(2),
                // fontFamily: fonts.JostMedium,
                color: COLORS.white,
              }}>
              Male
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const newList = list.map(item => {
                if (item.type === 'GENDER') {
                  return { ...item, value: genderList[1].name };
                }
                return item;
              });
              setList(newList);
              refBottomSheet.current.close();
            }}>
            <Text
              style={{
                padding: responsiveHeight(2),
                fontSize: responsiveFontSize(2),
                // fontFamily: fonts.JostMedium,
                color: COLORS.white,
              }}>
              {genderList[1].name}
            </Text>
          </TouchableOpacity>
        </BottomSheet>
      </SafeAreaView>
    </GradientBackground>
  );
}
var styles = StyleSheet.create({
  buttonText: {
    fontSize: 18,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
});
export default UpdateProfilePreference;
