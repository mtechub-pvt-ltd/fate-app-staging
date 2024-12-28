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
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import OcticonsIcon from 'react-native-vector-icons/Octicons';
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
import { getUserById, reportUser } from '../../../../Services/Auth/SignupService';
import RBSheet from 'react-native-raw-bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import { SliderBox } from "react-native-image-slider-box";
import { ScrollView } from 'react-native-gesture-handler';
import Tts from 'react-native-tts';
import Sound from 'react-native-sound';
import { ChatCircleDots, SealCheck } from 'phosphor-react-native';



function HomePage({ route, navigation }) {
  const { current_user, other_user } = route.params;
  const refRBSheet = useRef();
  // const images = [other_user.image];current_user, other_userot

  const [userData, setUserData] = useState(null);
  const [images, setImages] = useState([other_user.image]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const getUserByIdFunc = async () => {
    const z = getUserById(other_user.id)
      .then((response) => {
        console.log('response', response.data);
        setUserData(response.data);
      })
      .catch((error) => {
        console.log('error', error);
      });
  }
  Tts.addEventListener('tts-start', (event) => console.log('start', event));
  Tts.addEventListener('tts-cancel', (event) => console.log('cancel', event));
  useEffect(() => {
    getUserByIdFunc();
  }, []);


  // for sound

  const [soundPlayer, setSoundPlayer] = useState(null);

  const playAudioFromURL = (audioURL) => {
    console.log('audioURL', audioURL);

    const soundInstance = new Sound(audioURL, '', (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
        return;
      }
      console.log('Sound loaded successfully');

      // Play the sound and automatically handle stop when done
      soundInstance.play((success) => {
        if (success) {
          console.log('Sound finished playing successfully');
        } else {
          console.log('Sound playback failed');
        }
        setIsPlaying(false); // Automatically set isPlaying to false when finished
        soundInstance.release(); // Release the sound player to free up resources
      });

      setIsPlaying(true); // Set playing status
      setSoundPlayer(soundInstance); // Store the sound instance for future use
    });
  };

  const stopAudio = () => {
    if (isPlaying) {
      soundPlayer.stop(() => {
        soundPlayer.release();
        console.log('Sound stopped');
      });
      setIsPlaying(false);
    }
  };

  const handleReportUser = async () => {
    setLoading(true);

    if (reason === '') {
      alert('Please enter reason');
      return;
    }
    try {
      const data = {
        reported_by_user_id: current_user?.id,
        reported_user_id: other_user?.id,
        reason: reason,
      }
      const response = await reportUser(data);
      setLoading(false);
      if (response?.error == false) {

        alert('User reported successfully');
        refRBSheet.current.close();
        navigation.navigate('MyTabs', {
          screen: 'HomePage',
          params: {
            isUpdated: true,
          },
        });
      }
    }
    catch (error) {
      setLoading(false);
      console.log('error', error);
    }
  }


  return (
    <GradientBackground
      style={{
        backgroundColor: COLORS.primary,
      }}
    >
      <SafeAreaView
        style={{
          flex: 1,
        }}>
        <BottomSheet
          height={responsiveHeight(50)}
          ref={refRBSheet}>
          <View
            style={{
              marginTop: responsiveHeight(3),
            }}>
            {/* <Image source={Images.warning} style={{ width: 50, height: 50, alignSelf: 'center' }} /> */}
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2.5),
                fontFamily: fonts.PoppinsMedium,
                textAlign: 'center',
                width: responsiveWidth(70),
                marginVertical: responsiveHeight(2),
                alignSelf: 'center',
              }}>
              Are you sure you want to{'\n'} Report this user?
            </Text>
            <CustomInput
              mainContainerStyle={{ marginTop: responsiveHeight(2) }}
              title="Add Reason"
              titleStyle={{
                marginBottom: responsiveHeight(1),
              }}
              autoCapitalize="none"
              keyboardType="default"
              multiline={true}
              onChangeText={text => {
                setReason(text);
              }}
              style={{
                height: responsiveHeight(20),
                backgroundColor: '#FFFFFF29',
                width: responsiveWidth(90),
                color: COLORS.white,
                fontFamily: fonts.PoppinsRegular,
                fontSize: responsiveFontSize(2),
                borderRadius: 15,
                padding: responsiveWidth(3),
              }}

            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: responsiveWidth(70),
                alignSelf: 'center',
                marginTop: responsiveHeight(2),
              }}>
              <PrimaryButton
                title="Cancel"
                onPress={() => {
                  refRBSheet.current.close();
                }}
                style={{
                  // marginTop: responsiveHeight(5),
                  alignSelf: 'center',
                  width: responsiveWidth(30),
                  backgroundColor: COLORS.primary,
                  padding: 0,
                }}
              />
              <PrimaryButton
                title="Confirm"
                onPress={() => {
                  handleReportUser();
                }}
                style={{
                  // marginTop: responsiveHeight(5),
                  alignSelf: 'center',
                  width: responsiveWidth(30),
                  padding: 0,
                }}
                loading={loading}
              />
            </View>
          </View>
        </BottomSheet>
        <TouchableOpacity
          onPress={async () => {
            stopAudio();
            navigation.goBack();

          }}
          style={{
            color: COLORS.white,
            fontSize: responsiveFontSize(2.5),
            fontFamily: fonts.JostMedium,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 5,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            zIndex: 999,
            left: responsiveWidth(2),
            top: Platform.OS === 'ios' ? responsiveHeight(8) : responsiveHeight(3),
          }}>
          <Icon name="chevron-left"
            style={{
              // marginRight: responsiveWidth(2),
              padding: responsiveWidth(2),
              paddingHorizontal: responsiveWidth(3),
              alignSelf: 'center',
            }}
            size={responsiveFontSize(3)} color={COLORS.white} />

        </TouchableOpacity>
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: responsiveWidth(90),
              marginTop: Platform.OS === 'ios' ? responsiveHeight(0) : responsiveHeight(2),
              alignItems: 'center',
            }}>


            <SliderBox
              images={images}
              ImageComponentStyle={{
                borderWidth: 10,
                borderRadius: 15,
                borderColor: 'red',
                width: responsiveWidth(95),
                height: responsiveHeight(75),
              }}
              onCurrentImagePressed={index => console.log(`image ${index} pressed`)}
              currentImageEmitter={index => console.log(`current pos is: ${index}`)}
              sliderBoxHeight={responsiveHeight(80)}
              dotColor={COLORS.primary}
              style={{
                width: responsiveWidth(95),
                height: responsiveHeight(75),
                resizeMode: 'contain',
                alignSelf: 'center',
                left: -10,
                borderRadius: 15,
              }}

              imageLoadingColor={COLORS.primary}
              dotStyle={{
                marginBottom: responsiveHeight(7),
              }}
            />

          </View>
          <BlurView


            blurType="light"
            blurAmount={12}
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              display: Platform.OS === 'ios' ? 'flex' : 'none',
              alignItems: 'center',
              borderRadius: 15,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: responsiveWidth(2),
              marginTop: responsiveHeight(-5),
              width: responsiveWidth(90),
              alignSelf: 'center',
            }}
          >
            <Image
              source={{
                uri: other_user.image,
              }}
              style={{
                height: responsiveHeight(8),
                resizeMode: 'cover',
                alignSelf: 'center',
                marginVertical: responsiveHeight(1),
                borderRadius: 150,
                width: responsiveWidth(17),
                // backgroundColor: COLORS.primary,
              }}
            />

            <View
              style={{
                marginLeft: responsiveWidth(2),
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(2.5),
                  color: COLORS.white,
                  letterSpacing: .5,
                  fontFamily: fonts.PoppinsMedium,

                }}
              >
                {
                  other_user.name
                }
                <SealCheck color={COLORS.primary}
                  style={{
                    display: userData?.isVerifiedUser == 1 ? 'flex' : 'none',
                  }}
                  weight='fill' size={24} />
                {/* <TouchableOpacity
                  onPress={() => {
                    console.log('verified', userData?.isVerifiedUser);
                  }}
                  style={{
                    backgroundColor: COLORS.success,
                    borderRadius: 20,
                    paddingHorizontal: responsiveWidth(1.5),
                    paddingVertical: responsiveHeight(.6),
                    alignContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    display: userData?.isVerifiedUser == 1 ? 'flex' : 'none',
                  }}
                >
                  <Icon name="check"
                    size={responsiveFontSize(1.5)}
                    color={COLORS?.black} />

                </TouchableOpacity> */}
              </Text>
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  color: COLORS.white,
                  fontFamily: fonts.PoppinsRegular,
                  letterSpacing: .5,

                }}
              >
                {
                  other_user?.card_name?.toUpperCase()
                }
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Chats_New', {
                  currentUser: current_user?.id,
                  otherUser: other_user?.id,
                  otherUserImage: other_user?.image,
                  otherUserName: other_user?.name,
                });


              }}
              style={{
                backgroundColor: 'rgba(140, 82, 255, 1)',
                borderRadius: 50,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                position: 'absolute',
                right: responsiveWidth(2),
                padding: responsiveWidth(2),
                width:
                  Platform.OS === 'ios' ? responsiveWidth(12.5) : responsiveWidth(13),

              }}
            >
              <ChatCircleDots color={COLORS.white}
                weight="fill" size={responsiveFontSize(4)} />
            </TouchableOpacity>

          </BlurView>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              display: Platform.OS === 'ios' ? 'none' : 'flex',
              alignItems: 'center',
              borderRadius: 15,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.32)',
              paddingHorizontal: responsiveWidth(2),
              marginTop: responsiveHeight(-5),
              width: responsiveWidth(90),
              alignSelf: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <Image
              source={{
                uri: other_user.image,
              }}
              style={{
                height: responsiveHeight(8),
                resizeMode: 'cover',
                alignSelf: 'center',
                marginVertical: responsiveHeight(1),
                borderRadius: 150,
                width: responsiveWidth(17),
                // backgroundColor: COLORS.primary,
              }}
            />

            <View
              style={{
                marginLeft: responsiveWidth(2),
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: 'auto',
                }}
              >
                <Text
                  style={{
                    fontSize: responsiveFontSize(2.5),
                    color: COLORS.white,
                    letterSpacing: .5,
                    fontFamily: fonts.PoppinsMedium,

                  }}
                >
                  {
                    other_user.name
                  }

                </Text>
                <SealCheck color={COLORS.primary}
                  style={{
                    display: userData?.isVerifiedUser == 1 ? 'flex' : 'none',
                  }}
                  weight='fill' size={24} />
              </View>
              {/* <TouchableOpacity
                onPress={() => {
                  console.log('verified', userData?.isVerifiedUser);
                }}
                style={{
                  backgroundColor: COLORS.success,
                  borderRadius: 20,
                  paddingHorizontal: responsiveWidth(1.5),
                  paddingVertical: responsiveHeight(.6),
                  alignContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  // display: userData?.isVerifiedUser == false ? 'none' : 'flex',
                }}
              >
                <Icon name="check"
                  size={responsiveFontSize(1.5)}
                  color={COLORS?.black} />

              </TouchableOpacity> */}
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  color: COLORS.white,
                  fontFamily: fonts.PoppinsRegular,
                  letterSpacing: .5,

                }}
              >
                {
                  other_user?.card_name?.toUpperCase()
                }
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Chats_New', {
                  currentUser: current_user?.id,
                  otherUser: other_user?.id,
                  otherUserImage: other_user?.image,
                  otherUserName: other_user?.name,
                });
              }}
              style={{
                backgroundColor: 'rgba(140, 82, 255, 1)',
                borderRadius: 50,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                position: 'absolute',
                right: responsiveWidth(2),
                padding: responsiveWidth(3),
                // width:
                //   Platform.OS === 'ios' ? responsiveWidth(15) : responsiveWidth(13),

              }}
            >
              <ChatCircleDots color={COLORS.white}
                weight="fill" size={responsiveFontSize(4)} />
            </TouchableOpacity>

          </View>
          <View
            style={{

              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 15,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: responsiveWidth(2),
              marginTop: responsiveHeight(2),
              width: responsiveWidth(90),
              alignSelf: 'center',
              paddingBottom: responsiveHeight(2),
            }}
          >

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginVertical: responsiveHeight(2),
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: 50,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  marginLeft: responsiveWidth(11),
                }}
                onPress={() => {
                  isPlaying ? stopAudio() :
                    playAudioFromURL(userData?.note);

                }}
              >
                <Icon
                  name={isPlaying ? 'pause' : 'play'}
                  size={responsiveFontSize(3)}
                  color={'rgba(105, 61, 191, 1)'}
                  style={{
                    padding: responsiveWidth(3),
                    paddingHorizontal: responsiveWidth(3.5),
                    alignSelf: 'center',

                  }}
                />
              </TouchableOpacity>
              <Image
                source={Images.voice_animation}
                style={{
                  width: responsiveWidth(75),
                  height: responsiveHeight(5),
                  resizeMode: 'contain',
                  alignSelf: 'center',
                  display: isPlaying ? 'flex' : 'none'
                }}
              />
              <Text
                style={{
                  display: isPlaying ? 'none' : 'flex',
                  width: responsiveWidth(65),
                  marginHorizontal: responsiveWidth(2),
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  textTransform: 'capitalize',

                }}
              >
                {/* {userData?.note} */}
                Please click on play button to listen to the voice note
              </Text>
            </View>


          </View>
          <PrimaryButton
            title="Send message"
            loading={false}
            onPress={() => {
              // otherUserDetail, currentUser

              // console.log('current_user', current_user);
              // console.log('other_user', other_user);
              navigation.navigate('Chats_New', {
                currentUser: current_user.id,
                otherUser: other_user.id,
                otherUserImage: other_user.image,
                otherUserName: other_user.name,
              });

            }}
            style={{
              marginTop: responsiveHeight(2),
              alignSelf: 'center',
              width: responsiveWidth(90),
            }}
            backgroundColor={COLORS.white}
            textColor={COLORS.primary}
          />
          <PrimaryButton
            title="Report"
            loading={false}
            onPress={() => {
              refRBSheet.current.open();
            }}
            style={{
              marginTop: responsiveHeight(2),
              marginBottom: responsiveHeight(6),
              alignSelf: 'center',
              width: responsiveWidth(90),
              backgroundColor: '#FFFFFF1F',
              borderColor: '#FFFFFF29',
              borderWidth: 1,
              fontFamily: fonts.PoppinsMedium,
            }}
            backgroundColor={COLORS.primary}
            textColor={COLORS.white}
          />



        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
const styles = StyleSheet.create({

});
export default HomePage;
