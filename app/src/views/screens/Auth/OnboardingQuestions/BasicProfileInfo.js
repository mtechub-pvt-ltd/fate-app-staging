import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, SafeAreaView,
  Animated, StyleSheet, Image,
  TouchableOpacity, TextInput, Platform,
  keyboardVerticalOffset, ScrollView, KeyboardAvoidingView,
  Keyboard,
  Button,
} from 'react-native';

import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserDetail, storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import Header from '../../../../components/TopBar/Header';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import TopBar from '../../../../components/TopBar/TopBar';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import { BasicProfileInfoService } from '../../../../Services/Auth/SignupService';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  Horse, Heart, Cube,
  Eye, EyeSlash,
  SkipForward, SkipBackward,
  GenderMale,
  GenderFemale,
} from 'phosphor-react-native';
import { MenuView, MenuComponentRef } from '@react-native-menu/menu';
import { useDispatch, useSelector } from 'react-redux';
import { setPersonalDetails, setStep } from '../../../../redux/features/form/formSlice';

function BasicProfileInfo({ route, navigation }) {
  const { name } = route?.params || {}; // Use optional chaining with a fallback

  const {
    fullName: reduxFullName,
    age: reduxAge,
    gender: reduxGender,
  } = useSelector((state) => state.form);
  const menuRef = useRef(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const refBottomSheet = useRef(null);
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
      title: 'Your Full Name',
      subtitle: 'Yes, that should be your real name',
      placeholder: 'Full Name',
      actualPlaceholder: 'e.g. Oliviar Giroud',
      keyboardType: 'default',
      value: name ? name : reduxFullName || '',

      type: 'FULL_NAME',
    },
    {
      title: 'Your Age',
      subtitle: 'Your age will be visible to other users',
      placeholder: 'Age',
      actualPlaceholder: 'e.g. 21',
      keyboardType: 'number-pad',
      value: reduxAge || '',
      type: 'AGE',
    },
    {
      title: 'Your Gender',
      subtitle: 'Yes, that should be your gender',
      placeholder: 'Gender',
      keyboardType: 'default',
      value: '' || reduxGender,
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
  const UpdateBasicProfile = async () => {
    setLoading(false);
    const value = await AsyncStorage.getItem('userDetail');
    const userDetail = JSON.parse(value);

    const data = {
      email: userDetail.email,
      full_name: list[0].value,
      age: list[1].value,
      gender: list[2].value,
      images: [],
      profile_picture: '',
    };

    const x = await AsyncStorage.setItem('basic_info', JSON.stringify(data));

    if (Platform.OS == 'ios') {
      navigation.navigate('OnboardingQuestions');
      // navigation.navigate('OnboardingQuestions_Redux');
    } else {
      navigation.navigate('LoadingForQs_test');
    }

  };
  useEffect(() => { }, []);



  // data

  const data = [
    { label: 'Male', value: '1' },
    { label: 'Female', value: '2' },
  ];

  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);




  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);


  //  new redux setup 

  const dispatch = useDispatch();

  const handleNext = () => {
    const data = {
      fullName: list[0].value,
      age: list[1].value,
      gender: list[2].value,
    }
    dispatch(setPersonalDetails(data));
    dispatch(setStep(3));

    if (Platform.OS == 'ios') {
      navigation.navigate('OnboardingQuestions_Redux');
    } else {
      navigation.navigate('LoadingForQs_test');
    }
  };


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GradientBackground>
        {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}
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
        <SafeAreaView
          style={{
            flex: 1,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
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
          </View>
          <ScrollView
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{
              flexGrow: 1,

              paddingBottom: responsiveHeight(10),

            }}
            enableOnAndroid={true}
            showsVerticalScrollIndicator={false}

          >

            <Text
              style={{
                fontSize: responsiveFontSize(3.2),
                fontWeight: '500',
                color: COLORS.white,
                lineHeight: responsiveHeight(6),
                fontFamily: fonts.PoppinsRegular,
                marginTop: responsiveHeight(2),
              }}>
              {list[activeIndex].title}
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(2),
                color: COLORS.white,
                marginVertical: responsiveHeight(1),
                lineHeight: responsiveHeight(3),
                textTransform: 'lowercase',
                width: responsiveWidth(80),
                fontFamily: fonts.PoppinsRegular,
                fontWeight: '400',
              }}>
              {list[activeIndex].subtitle}
            </Text>

            {list[activeIndex]?.type == 'GENDER' ? (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                marginHorizontal: responsiveWidth(2),
                marginTop: responsiveHeight(5),
              }}>
                <TouchableOpacity
                  style={{
                    width: responsiveWidth(40),
                    padding: responsiveHeight(2),
                    backgroundColor: genderList[0].name === list[2].value ? COLORS.primary : 'rgba(255, 255, 255, 0.16)',
                    borderRadius: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: responsiveWidth(0.5),
                    borderColor: 'rgba(255, 255, 255, 0.24)',
                  }}
                  activeOpacity={0.8}

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
                >

                  <GenderMale size={32}
                    color={COLORS.white}
                  />
                  <Text
                    style={{
                      color: COLORS.white,
                      fontFamily: fonts.PoppinsRegular,
                      fontSize: responsiveFontSize(2),
                      marginTop: responsiveHeight(1)
                    }}
                  >
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
                  }}
                  style={{
                    width: responsiveWidth(40),
                    padding: responsiveHeight(2),
                    backgroundColor: genderList[1].name === list[2].value ? COLORS.primary : 'rgba(255, 255, 255, 0.16)',

                    borderRadius: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: responsiveWidth(0.5),
                    borderColor: 'rgba(255, 255, 255, 0.24)',
                  }}
                  activeOpacity={0.8}

                >

                  <GenderFemale size={32}
                    color={COLORS.white}
                  />
                  <Text
                    style={{
                      color: COLORS.white,
                      fontFamily: fonts.PoppinsRegular,
                      fontSize: responsiveFontSize(2),
                      marginTop: responsiveHeight(1)
                    }}
                  >
                    Female
                  </Text>

                </TouchableOpacity>


              </View>
            ) : (
              <CustomInput
                // inputRef={inputRef}
                mainContainerStyle={{
                  marginTop: responsiveHeight(5),
                }}
                title={list[activeIndex].placeholder}
                autoCapitalize="none"
                placeholder={list[activeIndex].actualPlaceholder}
                keyboardType={list[activeIndex].keyboardType}
                onChangeText={text => {
                  // Create a new array with updated value for the active input
                  const newList = list.map((item, index) => {
                    if (index === activeIndex) {
                      // Use spread operator to update the value for the current item
                      return { ...item, value: text };
                    }
                    return item;
                  });
                  // Update the state with the new array
                  setList(newList);
                }}
                value={list[activeIndex].value}
              />
            )}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: responsiveWidth(90),
                // marginTop: responsiveHeight(2),
                height: responsiveHeight(5),
              }}
            />
          </ScrollView>

          <View style={{
            marginVertical: responsiveHeight(3),
            backgroundColor: 'transparent',
          }}>
            <PrimaryButton
              loading={loading}
              title={'Next'}
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
                  if (list[activeIndex].type === 'AGE' && list[activeIndex].value <= 18) {
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
                  // UpdateBasicProfile();

                  handleNext();
                }
              }}
              style={{
                alignSelf: 'center',
                width: responsiveWidth(90),
              }}
              backgroundColor={COLORS.white}
              textColor={COLORS.primary}
            />
          </View>



        </SafeAreaView>
      </GradientBackground>
    </KeyboardAvoidingView>
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
export default BasicProfileInfo;
