import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, SafeAreaView, StyleSheet,
  TouchableOpacity, Platform, ScrollView, KeyboardAvoidingView,
  Keyboard, Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import TopBar from '../../../../components/TopBar/TopBar';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';
import {
  GenderMale,
  GenderFemale,
} from 'phosphor-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setPersonalDetails, setStep } from '../../../../redux/features/form/formSlice';

function BasicProfileInfo({ route, navigation }) {
  const { name } = route?.params || {}; // Name from sign-in provider (Google/Apple) if available
  const nameFromPreviousScreen = name; // true only if name came from provider

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
      subtitle: '',
      placeholder: 'Full Name',
      actualPlaceholder: 'e.g. Oliver Giroud',
      keyboardType: 'default',
      value: nameFromPreviousScreen ? name : reduxFullName || '',
      type: 'FULL_NAME',
      editable: !nameFromPreviousScreen, // editable if not provider name
    },
    {
      title: 'Your Age',
      subtitle: '',
      placeholder: 'Age',
      actualPlaceholder: 'e.g. 21',
      keyboardType: 'number-pad',
      value: reduxAge || '',
      type: 'AGE',
      editable: true,
    },
    {
      title: 'Your Gender',
      subtitle: '',
      placeholder: 'Gender',
      keyboardType: 'default',
      value: reduxGender,
      type: 'GENDER',
      editable: true,
    },
  ]);

  const [loading, setLoading] = useState(false);
  // message state
  const [flashMessage, setFlashMessage] = useState(false);
  const [flashMessageData, setFlashMessageData] = useState({
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
  useEffect(() => {
    // Ensure "Male" is preselected by default with COLORS.primary
    const newList = list.map(item => {
      if (item.type === 'GENDER' && !item.value) {
        return { ...item, value: 'Male' };
      }
      return item;
    });
    setList(newList);
  }, []);

  useEffect(() => {
    // Update the active gender button's background color
    if (list[2]?.type === 'GENDER' && list[2]?.value === '') {
      const updatedList = [...list];
      updatedList[2].value = 'Male';
      setList(updatedList);
    }
  }, [list]);

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




    // PREVICIOUS NAVIGATION LOGIC

    // if (Platform.OS === 'ios') {
    //   try {
    //     navigation.navigate('OnboardingQuestions_Redux');
    //   } catch (error) {
    //     console.log('Navigation error, trying alternative route');
    //   }
    // } else {
    //   navigation.navigate('LoadingForQs_test');
    // }


    // NEW LOGGIC FOR NAVIGATION 
    navigation.navigate('ChooseHowToAnswer');
  };


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GradientBackground>
        {flashMessage && <FlashMessages flashMessageData={flashMessageData} />}

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
                marginHorizontal: responsiveWidth(3)
              }}>
              {list[activeIndex].title}
            </Text>

            {/* {list[activeIndex].subtitle} */}
            {list[activeIndex].type === 'FULL_NAME' && nameFromPreviousScreen && (
              <Text style={{
                color: COLORS.white, fontStyle: 'italic',
                fontSize: responsiveFontSize(2),
                width: responsiveWidth(80)
              }}>
                {"\n"}(This name was provided automatically and cannot be edited)
              </Text>
            )}


            {list[activeIndex]?.type == 'GENDER' ? (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                marginHorizontal: responsiveWidth(2),
                marginTop: responsiveHeight(2),
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
                  marginTop: responsiveHeight(2),
                }}
                title={list[activeIndex].placeholder}
                autoCapitalize="none"
                placeholder={list[activeIndex].actualPlaceholder}
                keyboardType={list[activeIndex].keyboardType}
                editable={list[activeIndex].editable}
                onFocus={() => {
                  // Show alert if user tries to edit non-editable name field
                  if (list[activeIndex].type === 'FULL_NAME' && !list[activeIndex].editable) {
                    Alert.alert(
                      "Cannot Edit Name",
                      "This name was provided by your authentication method and cannot be edited.",
                      [{ text: "OK", style: "default" }]
                    );
                  }
                }}
                onChangeText={text => {
                  // Only allow editing if the field is editable
                  if (list[activeIndex].editable) {
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
                  }
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
                  setFlashMessageData({
                    message: 'Error',
                    description: 'Name must be at least 3 characters long',
                    type: 'info',
                    icon: 'info',
                    backgroundColor: COLORS.red,
                    textColor: COLORS.white,
                  });
                  setFlashMessage(true);
                  setTimeout(() => {
                    setFlashMessage(false);
                  }, 3000);
                  return;
                }

                if (activeIndex < list.length - 1) {
                  if (list[activeIndex].type === 'AGE' && list[activeIndex].value < 18) {
                    setFlashMessageData({
                      message: 'Error',
                      description: 'Age should be greater than 18',
                      type: 'info',
                      icon: 'info',
                      backgroundColor: COLORS.red,
                      textColor: COLORS.white,
                    });
                    setFlashMessage(true);
                    setTimeout(() => {
                      setFlashMessage(false);
                    }, 3000);
                    return;
                  }
                  if (list[activeIndex].type === 'AGE' && list[activeIndex].value > 50) {
                    setFlashMessageData({
                      message: 'Error',
                      description: 'Age should be less than 50',
                      type: 'info',
                      icon: 'info',
                      backgroundColor: COLORS.red,
                      textColor: COLORS.white,
                    });
                    setFlashMessage(true);
                    setTimeout(() => {
                      setFlashMessage(false);
                    }, 3000);
                    return;
                  }
                  setActiveIndex(activeIndex + 1);

                  // empty the input field
                } else {
                  if (list[activeIndex].type === 'GENDER' && list[activeIndex].value === 'Select_Gender') {
                    setFlashMessageData({
                      message: 'Error',
                      description: 'Please select Gender',
                      type: 'info',
                      icon: 'info',
                      backgroundColor: COLORS.red,
                      textColor: COLORS.white,
                    });
                    setFlashMessage(true);
                    setTimeout(() => {
                      setFlashMessage(false);
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
