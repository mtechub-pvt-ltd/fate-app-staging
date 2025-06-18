import React, {
  useEffect, useState, useRef
} from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import Header from '../../../../components/TopBar/Header';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import TopBar from '../../../../components/TopBar/TopBar';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import { updateUserProfilePerference } from '../../../../Services/Auth/SignupService';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {
  GenderMale,
  GenderFemale,
} from 'phosphor-react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  setPreferences
} from '../../../../redux/features/form/formSlice';
// import RangeSlider from '@jesster2k10/react-native-range-slider';

function ProfilePreference({ navigation }) {
  const dispatch = useDispatch();
  const [activeIndex, setActiveIndex] = useState(0);
  const { min: reduxMin, max: reduxMax } = useSelector(
    (state) => state.form.preferences.preferredAgeRange
  );
  const reduxPreferredGender = useSelector(
    (state) => state.form.preferences.preferredGender
  );
  // Get user's gender from Redux store
  const userGender = useSelector((state) => state.form.gender);
  // const [age, setAge] = useState({
  //   min: reduxMin,
  //   max: reduxMax,
  // });
  const inputRef = useRef(null);
  const refBottomSheet = useRef(null);
  const genderList = [
    { name: 'Male' },
    { name: 'Female' },
  ];

  const [list, setList] = useState([
    {
      title: `Your Preferred ${'\n'}Age for Dating`,
      subtitle: 'We will show you results based on your selection.',
      placeholder: 'Age',
      actualPlaceholder: 'e.g. 21',
      keyboardType: 'number-pad',
      value: 'Select_Age',
      type: 'AGE',
    },
    {
      title: `What is your  ${'\n'}preferred gender?`,
      subtitle: 'We will only show you people in this gender',
      placeholder: 'Gender',
      keyboardType: 'default',
      value: 'Select_Gender',
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
  // Handle value change
  const onValuesChange = (values) => {
    // setAge({
    //   min: values[0],
    //   max: values[1],
    // });
    dispatch(setPreferences({
      preferredAgeRange: {
        min: values[0],
        max: values[1],
      },
      preferredGender: reduxPreferredGender,
    }));
  };

  const selectGender = (gender) => {
    dispatch(setPreferences({
      preferredGender: gender,
    }));
  };



  const UpdateProfilePreference = async () => {
    setLoading(true);
    const value = await AsyncStorage.getItem('userDetail');
    const userDetail = JSON.parse(value);
    const data = {
      user_id: userDetail.id,
      prefered_min_age: age.min,
      prefered_max_age: age.max,
      prefered_gender: list[1].value.toUpperCase()
    }

    const reponse = await updateUserProfilePerference(data);
    setLoading(false);

    if (reponse.error === false) {
      // console.log('reponse++++++++++', reponse)
      await storeUserDetail(reponse?.user);
      Platform.OS === 'android' ?
        navigation.navigate('OnboardingVoiceNotesTest') :
        navigation.navigate('OnboardingVoiceNotesIOS');
      // navigation.navigate('OnboardingVoiceNotes');

      // navigation.replace('MyTabs');
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
        <TopBar
          onPress={() => {
            // decrease index
            if (activeIndex > 0) {
              setActiveIndex(activeIndex - 1);
            } else {
              navigation.goBack();
            }
          }}
        />
        <Header
          mainContainerStyle={{
            // marginTop: responsiveHeight(2),
          }}
          title={list[activeIndex].title}
          subtitle={list[activeIndex].subtitle}
        />

        {list[activeIndex]?.type == 'GENDER' ? (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            marginHorizontal: responsiveWidth(2),
            marginTop: responsiveHeight(5),
          }}>
            {genderList.map((gender) => (
              <TouchableOpacity
                key={gender.name}
                onPress={() => selectGender(gender.name)}
                style={{
                  width: responsiveWidth(40),
                  padding: responsiveHeight(2),
                  backgroundColor: reduxPreferredGender === gender.name ? COLORS.primary : 'rgba(255, 255, 255, 0.16)',
                  borderRadius: 15,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: responsiveWidth(0.5),
                  borderColor: 'rgba(255, 255, 255, 0.24)',
                }}
              >
                {gender.name === 'Male' ? <GenderMale size={32} color={COLORS.white} /> : <GenderFemale size={32} color={COLORS.white} />}
                <Text style={{ color: COLORS.white, marginTop: responsiveHeight(1) }}>{gender.name}</Text>
              </TouchableOpacity>
            ))}


          </View>
        ) : (

          <>
            <View
              style={{
                marginVertical: responsiveHeight(2),
                justifyContent: 'center',
                alignContent: 'center',
                width: responsiveWidth(90),
                alignSelf: 'center',
              }}
            >
              <MultiSlider
                values={[reduxMin, reduxMax]}
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
                {
                  reduxMin
                }
              </Text>
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  color: COLORS.white,
                }}
              >
                {
                  reduxMax}
              </Text>
            </View>
          </>
        )}
        <View
          style={{
            position: 'absolute',
            bottom: responsiveHeight(5),
          }}
        >
          <PrimaryButton
            loading={loading}
            title={activeIndex < list.length - 1 ? 'Next' : 'Continue'}
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
              } else {
                if (reduxPreferredGender == 'SELECT_GENDER') {
                  setFalshMessageData({
                    message: 'Error',
                    description: 'Please Select Gender',
                    type: 'info',
                    icon: 'info',
                    backgroundColor: COLORS.red,
                    textColor: COLORS.white,
                  });
                  setFalshMessage(true);
                  setTimeout(() => {
                    setFalshMessage(false);
                  }, 3000);
                } else {
                  navigation.navigate('OnboardingVoiceNotesIOS');

                }

              }
            }}

            style={{
              alignSelf: 'center',
              width: responsiveWidth(90),
              marginTop: responsiveHeight(5),
            }}
            backgroundColor={COLORS.white}
            textColor={COLORS.primary}
          />
        </View>
      </SafeAreaView>
    </GradientBackground >
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
export default ProfilePreference;
