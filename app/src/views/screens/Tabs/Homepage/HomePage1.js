import {
  StyleSheet, Text, View,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native'
import React, { useState, useEffect } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome5';
import { StoryContainer } from 'react-native-stories-view';
import COLORS from '../../../../consts/colors';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import fonts from '../../../../consts/fonts';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import { getUserById } from '../../../../Services/Auth/SignupService';
import { SafeAreaView } from 'react-native-safe-area-context';



export default function HomePage1({
  route,
  navigation }) {
  console.log('route', route.params)
  const {
    width,
    height
  } = Dimensions.get('window');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const getUser = async () => {
    setLoading(true);
    const response = await getUserById(route?.params?.otherUser);
    console.log('response', response)
    setUserData(response.data);
    setTimeout(() => {
      setLoading(false);
    }, 1000);

  };

  const data = [
    'https://i.pinimg.com/564x/6a/aa/ab/6aaaab354709ef2fa16fbd72299c8f55.jpg',
    'https://i.pinimg.com/564x/29/e0/78/29e0784cc1f82f89eb594abf7af91ee4.jpg',
    'https://i.pinimg.com/564x/29/e0/78/29e0784cc1f82f89eb594abf7af91ee4.jpg',
    'https://marketplace.canva.com/EAEtlMvlBDg/1/0/450w/canva-pastel-peach-watercolour-mobile-phone-wallpaper-UCwKSXi1aH8.jpg'
  ]
  const [activeImage, setActiveImage] = useState(0);
  useEffect(() => {
    getUser();
  }, [])
  return (
    <SafeAreaView>

      <View
        style={{
          backgroundColor: 'transparent',
          height: height,
        }}
      >
        {
          loading ?
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              loading={loading}
            /> :
            <ImageBackground
              source={{
                uri: userData?.images[activeImage],
              }}
              style={{
                flex: 1,
                resizeMode: 'cover',
                padding: 10,
                width: width,
                height: height,
              }}
              imageStyle={{
                height: height,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  width: width - 30,
                  alignItems: 'center',
                  overflow: 'hidden',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack()
                  }}
                >
                  <Icon
                    name='chevron-left'
                    size={25}
                    color={COLORS.white}

                    style={{
                      padding: 5,
                      marginRight: 10,
                    }}
                  />
                </TouchableOpacity>
                {
                  userData?.images.map((item, index) => {
                    return (<View
                      key={index}
                      style={{
                        width: width / userData?.images.length - 20,
                        height: 5,
                        backgroundColor: COLORS.primary,
                        borderRadius: 10,
                        marginRight: 5,
                        opacity: activeImage == index ? 1 : 0.5,
                      }}
                    >
                    </View>)
                  })
                }
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: width - 25,
                  alignItems: 'center',
                  marginTop: 10,

                }}
              >
                <TouchableOpacity
                  style={{
                    width: width / 3.5,
                    padding: 10,
                    backgroundColor: 'transparent',
                    height: height / 1.5,
                    alignContent: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    activeImage == 0 ? null :
                      setActiveImage(activeImage - 1)
                  }}
                >
                  <Icon
                    name='chevron-left'
                    size={25}
                    color={COLORS.white}

                    style={{
                      padding: 5,
                      marginRight: 10,
                    }}
                  />

                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: width / 3.5,
                    padding: 10,
                    backgroundColor: 'transparent',
                    height: height / 1.5,
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    activeImage == userData?.images.length - 1 ? null :
                      setActiveImage(activeImage + 1)
                  }}
                >
                  <Icon
                    name='chevron-right'
                    size={25}
                    color={COLORS.white}

                  />
                </TouchableOpacity>
              </View>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={{
                      uri: userData?.profile_image ? userData?.profile_image : null,
                    }}
                    style={{
                      marginLeft: 20,  // Adjust margin as needed
                      width: 50,      // Set the width of the image
                      height: 50,     // Set the height of the image
                      borderRadius: 50,  // Rounded corners to make it circular
                      borderWidth: 2,  // Set border width to make it visible
                      borderColor: COLORS.primary,  // Set border color to indicate it's currently viewing
                      overflow: 'hidden',  // Keep the image within the bounds of the border

                    }}
                  />
                  <View>
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: responsiveFontSize(2),
                        fontFamily: fonts.JostMedium,
                        marginLeft: responsiveWidth(2),
                        fontWeight: 'bold'
                      }}>
                      User name
                    </Text>
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: responsiveFontSize(1.5),
                        fontFamily: fonts.JostMedium,
                        marginLeft: responsiveWidth(2),
                        fontWeight: 'bold'
                      }}>
                      Age : 20
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: COLORS.primary,
                      borderRadius: 20,
                      marginLeft: 10,
                    }}
                  >
                    <Text
                      style={{
                        padding: 6,
                        color: COLORS.white,
                        fontFamily: fonts.JostMedium,
                        paddingHorizontal: 10
                      }}
                    >
                      Report
                    </Text>
                  </TouchableOpacity>
                </View>
                <PrimaryButton
                  title="Send Message"
                  backgroundColor={COLORS.primary}
                  onPress={() => {
                    // console.log('Logout')
                    navigation.navigate('Chats_New', {
                      currentUser: route.params.currentUser,
                      otherUser: route.params.otherUser,
                      otherUserName: userData?.name,
                      otherUserImage: userData?.profile_image,

                    });
                  }}
                  style={{
                    marginTop: responsiveHeight(1),
                    alignSelf: 'center',
                    width: responsiveWidth(90),


                  }}
                />
              </View>
            </ImageBackground>
        }


      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})