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
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
import LinearGradient from 'react-native-linear-gradient';
import AppTextLogo from '../../../../components/AppLogo/AppTextLogo';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import { getMatchUsers, getUsersforJokerCard } from '../../../../Services/Auth/SignupService';
import RBSheet from 'react-native-raw-bottom-sheet';



function HomePage({ route, navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [match_list, setMatchList] = useState([]);
  const [activeDot, setActiveDot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jokerSuggerstion, setJokerSuggestion] = useState([]);
  const refRBSheet = useRef();
  const refRBSheet_reasons = useRef();
  const refRBSheet_jokerList = useRef();
  const refRBSheet_JokerSent = useRef();



  const disqualifyList = [
    {
      id: 1,
      content: 'Not my type(looks)',
    },
    {
      id: 2,
      content: 'Rude',
    },
    {
      id: 3,
      content: 'Not feeling safe',
    },
    {
      id: 4,
      content: 'Not Interesting / Engaging enough',
    },
    {
      id: 5,
      content: 'Do not like user profile',
    },
    {
      id: 6,
      content: 'Incompatible lifestyle - e.g.Smoking, Drinking, Exercise',
    },
    {
      id: 7,
      content: 'Not ambitious(career or education)',
    },
    {
      id: 8,
      content: 'Our values don’t match - e.g.religion, politics',
    },
  ]

  const getMatchUsersList = async () => {
    setLoading(true);
    const userDetail = await getUserDetail();
    const data = {
      // user_id: 245,
      // current_user_gender: 'MALE',
      user_id: userDetail?.data?.id,
      current_user_gender: userDetail?.data?.gender,
    };
    setCurrentUser(userDetail?.data);

    const response = await getMatchUsers(data);
    console.log('match users', response);
    if (userDetail?.data?.gender == 'MALE') {
      const newMatchList = response.matches.map((user, index) => {
        const cardNames = ['fate', 'K', 'J', '10', 'A'];
        const cardTypes = ['FATE', 'NORMAL', 'NORMAL', 'NORMAL', 'ANONYMOUS'];

        return {
          id: user.user_id,
          image: user.profile_image,
          name: user.name,
          status: 'Online',
          card_name: cardNames[index % cardNames.length],
          card_type: cardTypes[index % cardTypes.length],
        };
      });
      const jokerEntry = {
        id: 6,
        image: 'https://res.cloudinary.com/dl91sgjy1/image/upload/f_jpg/v1711394451/wkfvduatkhl1ztgqnaew.jpg',
        name: 'Lia',
        status: 'Online',
        card_name: 'Joker',
        card_type: 'JOKER',
      };

      newMatchList.push(jokerEntry);

      setMatchList(newMatchList);
    } else {
      const newMatchList = response.matches.map((user, index) => {
        const cardNames = ['fate', 'K', 'J', '10', '9', '8', 'A'];
        const cardTypes = ['FATE', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'ANONYMOUS'];

        return {
          id: user.user_id,
          image: user.profile_image,
          name: user.name,
          status: 'Online',
          card_name: cardNames[index % cardNames.length],
          card_type: cardTypes[index % cardTypes.length],
          disqualifyStatus: false,
        };
      });
      const jokerEntry = {
        id: 6,
        image: 'https://res.cloudinary.com/dl91sgjy1/image/upload/f_jpg/v1711394452/qdyx6olrunykjavtuw4o.jpg',
        name: 'Jhon',
        status: 'Online',
        card_name: 'Joker',
        card_type: 'JOKER',
        disqualifyStatus: false,
      };

      newMatchList.push(jokerEntry);

      setMatchList(newMatchList);
    }

    setLoading(false);
  };
  const disqualifyUser = async () => {
    refRBSheet_reasons.current.close();
    setLoading(true);
    console.log('disqualifyUser', activeDot);
    setMatchList(prevState => {
      return prevState.map(item => {
        if (item.id === activeDot.id) {
          return {
            ...item,
            disqualifyStatus: true,
          };
        }
        return item;
      });
    });
    setTimeout(() => {
      setLoading(false);

    }, 1000);
    // setLoading(true);
    // const userDetail = await getUserDetail();
    // const data = {
    //   // user_id: 245,
    //   // current_user_gender: 'MALE',
    //   user_id: userDetail?.data?.id,
    //   current_user_gender: userDetail?.data?.gender,
    // };

    // const response = await getMatchUsers(data);
    // console.log('match users', response);
    // if (userDetail?.data?.gender == 'MALE') {
    //   const newMatchList = response.matches.map((user, index) => {
    //     const cardNames = ['fate', 'K', 'J', '10', 'A'];
    //     const cardTypes = ['FATE', 'NORMAL', 'NORMAL', 'NORMAL', 'ANONYMOUS'];

    //     return {
    //       id: user.user_id,
    //       image: user.profile_image,
    //       name: user.name,
    //       status: 'Online',
    //       card_name: cardNames[index % cardNames.length],
    //       card_type: cardTypes[index % cardTypes.length],
    //     };
    //   });
    //   const jokerEntry = {
    //     id: 6,
    //     image: 'https://res.cloudinary.com/dl91sgjy1/image/upload/f_jpg/v1711394451/wkfvduatkhl1ztgqnaew.jpg',
    //     name: 'Lia',
    //     status: 'Online',
    //     card_name: 'Joker',
    //     card_type: 'JOKER',
    //   };

    //   newMatchList.push(jokerEntry);

    //   setMatchList(newMatchList);
    // } else {
    //   const newMatchList = response.matches.map((user, index) => {
    //     const cardNames = ['fate', 'K', 'J', '10', '9', '8', 'A'];
    //     const cardTypes = ['FATE', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'ANONYMOUS'];

    //     return {
    //       id: user.user_id,
    //       image: user.profile_image,
    //       name: user.name,
    //       status: 'Online',
    //       card_name: cardNames[index % cardNames.length],
    //       card_type: cardTypes[index % cardTypes.length],
    //     };
    //   });
    //   const jokerEntry = {
    //     id: 6,
    //     image: 'https://res.cloudinary.com/dl91sgjy1/image/upload/f_jpg/v1711394452/qdyx6olrunykjavtuw4o.jpg',
    //     name: 'Jhon',
    //     status: 'Online',
    //     card_name: 'Joker',
    //     card_type: 'JOKER',
    //   };

    //   newMatchList.push(jokerEntry);

    //   setMatchList(newMatchList);
    // }

    // setLoading(false);
  };
  const callGetUsersforJokerCard = async (id) => {
    setLoading(true);
    const userDetail = await getUserDetail();
    const response = await getUsersforJokerCard(userDetail?.data?.id);
    console.log('getUsersforJokerCard', response.data);
    setJokerSuggestion(response.data);
    refRBSheet_jokerList.current.open();

    setLoading(false);
  };
  useEffect(() => {
    // SplashScreen.hide();
    console.log('HomePage');
    getMatchUsersList();
  }, []);

  const DisqualifyComponent = () => {
    return (<TouchableOpacity activeOpacity={0.9} style={styles.fate_card_main_container}>
      <LinearGradient
        colors={[COLORS.white, COLORS.white]}
        style={{
          flex: 1,
          paddingLeft: 15,
          paddingRight: 15,
          borderRadius: 5,
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 5,
          borderRadius: 10,
          borderColor: COLORS.secondary,
        }}
      >


        <Text
          style={{
            textAlign: 'center',
            fontSize: responsiveFontSize(2.5),
            fontWeight: 'bold',
            color: COLORS.secondary,
          }}
          fontFamily={'Jost-Medium'}>
          User{'\n'}
          Disqualified
        </Text>
        <Text color={'red'}
          style={{
            textAlign: 'center',
            fontSize: responsiveFontSize(1.5),
            marginTop: responsiveHeight(2),
          }}
          fontFamily={'Jost-Medium'}>
          The New User will be shown in 1 Hour
        </Text>
      </LinearGradient>


    </TouchableOpacity>
    )
  }


  return (
    <GradientBackground>
      <SafeAreaView
        style={{
          flex: 1,
        }}>

        <BottomSheet ref={refRBSheet}>
          <View
            style={{
              marginTop: responsiveHeight(3),
            }}>
            <Image source={Images.warning} style={{ width: 50, height: 50, alignSelf: 'center' }} />
            <Text
              style={{
                color: COLORS.black,
                fontSize: responsiveFontSize(2.5),
                fontFamily: fonts.JostMedium,
                textAlign: 'center',
                width: responsiveWidth(70),
                marginVertical: responsiveHeight(2),
                alignSelf: 'center',
              }}>
              Are you sure you want to disqualify this user?
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
              }}>
              <PrimaryButton
                title="Cancel"
                onPress={() => {
                  refRBSheet.current.close();
                }}
                style={{
                  // marginTop: responsiveHeight(5),
                  alignSelf: 'center',
                  width: responsiveWidth(40),
                  backgroundColor: COLORS.primary,
                }}
              />
              <PrimaryButton
                title="Confirm"
                onPress={() => {
                  refRBSheet.current.close();
                  setTimeout(() => {

                    refRBSheet_reasons.current.open();
                  }, 500);
                }}
                style={{
                  // marginTop: responsiveHeight(5),
                  alignSelf: 'center',
                  width: responsiveWidth(40),
                }}
              />
            </View>
          </View>
        </BottomSheet>

        <BottomSheet
          height={responsiveHeight(60)}
          ref={refRBSheet_reasons}>
          <View
            style={{
              marginTop: responsiveHeight(1),
              marginHorizontal: responsiveWidth(5),
            }}>

            <Text
              style={{
                color: COLORS.black,
                fontSize: responsiveFontSize(2.5),
                fontFamily: fonts.JostMedium,
                textAlign: 'left',
                // width: responsiveWidth(70),
                // marginVertical: responsiveHeight(2),
                // alignSelf: 'center',
              }}>
              Select a reason for Disqualification
            </Text>
            {
              disqualifyList.map((item, index) => {
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      borderBottomWidth: 1,
                      borderColor: COLORS.dark + 30,
                    }}
                    onPress={disqualifyUser}
                  >
                    <Text
                      style={{
                        padding: 15,
                        color: COLORS.black,
                      }}
                    >{
                        item.content
                      }</Text>
                  </TouchableOpacity>
                )
              })
            }
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
              }}>

            </View>
          </View>
        </BottomSheet>
        <BottomSheet
          height={responsiveHeight(20)}
          ref={refRBSheet_JokerSent}>
          <View
            style={{
              marginTop: responsiveHeight(3),
            }}>
            <Image source={Images.app_logo} style={{ width: 50, height: 50, alignSelf: 'center' }} />
            <Text
              style={{
                color: COLORS.black,
                fontSize: responsiveFontSize(2.5),
                fontFamily: fonts.JostMedium,
                textAlign: 'center',
                width: responsiveWidth(70),
                marginVertical: responsiveHeight(2),
                alignSelf: 'center',
              }}>
              Joker Card Sent Successfully
            </Text>

          </View>
        </BottomSheet>
        <RBSheet
          ref={refRBSheet_jokerList}
          height={responsiveHeight(60)}
          openDuration={250}
          customStyles={{
            container: {
              backgroundColor: COLORS.dark,
              width: responsiveWidth(90),
              borderRadius: 20,
              padding: 20,
              marginBottom: responsiveHeight(20),
              alignSelf: 'center',
              height: responsiveHeight(60),
            },
          }}


          animationType={'fade'}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              // alignItems: 'fl',
              marginBottom: responsiveHeight(2),

            }}
          >
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2),
                fontFamily: fonts.JostMedium,
              }}
            >
              Select a profile {'\n'}to send a
              Joker Card
            </Text>
            <TouchableOpacity
              style={{
                padding: 10,
              }}
              onPress={() => {
                refRBSheet_jokerList.current.close();

              }}
            >
              <Icon name="times" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <FlatList
            showsVerticalScrollIndicator={false}
            data={jokerSuggerstion}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginHorizontal: responsiveWidth(2),
                    flexDirection: 'row',
                    paddingVertical: responsiveHeight(1.4),
                    borderBottomWidth: .5,
                    borderColor: COLORS.white + 10,
                  }}
                  onPress={() => {
                    refRBSheet_jokerList.current.close();
                    setLoading(true);
                    setTimeout(() => {
                      refRBSheet_JokerSent.current.open();
                    }, 500);
                    setTimeout(() => {
                      setLoading(false);
                      refRBSheet_JokerSent.current.close();
                    }, 2500);
                  }}
                >
                  <Image
                    source={{
                      uri: item.profile_image,
                    }}
                    style={{
                      width: responsiveWidth(15),
                      height: responsiveHeight(7),
                      borderRadius: 100,
                      resizeMode: 'cover',
                    }}
                  />
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: responsiveFontSize(2),
                      fontFamily: fonts.JostMedium,
                      marginTop: responsiveHeight(0.5),
                      marginHorizontal: responsiveWidth(3),
                    }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={item => item.id}
            style={{}}
            ListFooterComponent={() => {
              return (
                <View
                  style={{
                    height: responsiveHeight(10),
                  }}></View>
              );
            }}
          />



        </RBSheet>
        <View
          style={{
            height: responsiveHeight(50),
            alignItems: 'center',
            justifyContent: 'center',
            display: loading ? 'flex' : 'none',
          }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
        <FlatList
          ListHeaderComponent={() => {
            return (
              <View style={{}}>
                <AppTextLogo
                  style={{
                    alignSelf: 'center',
                    marginVertical: responsiveHeight(1),
                  }}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: responsiveFontSize(2.5),
                      fontFamily: fonts.JostMedium,
                    }}>
                    Matches
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <TouchableOpacity
                      style={{
                        padding: 10,
                        marginRight: responsiveWidth(1),
                      }}>
                      <Icon name="search" size={responsiveFontSize(2.5)} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        padding: 10,
                      }}>
                      <Icon name="bell" size={responsiveFontSize(2.5)} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
          data={match_list}
          renderItem={({ item }) => {
            return item.card_type === 'FATE' ?
              item.disqualifyStatus ? <DisqualifyComponent /> :
                <TouchableOpacity activeOpacity={0.9}
                  onPress={() => {
                    // console.log('currentUser', currentUser.id);
                    // console.log('otherUser', item.id);
                    // navigation.navigate('Chats_New', {
                    //   currentUser: currentUser.id,
                    //   otherUser: item.id,
                    //   otherUserName: item.name,

                    // });
                    navigation.navigate('HomePage1', {
                      otherUser: item.id,
                      currentUser: currentUser.id,
                      otherUser: item.id,
                      otherUserName: item.name,
                    });

                  }}
                  style={styles.fate_card_main_container}>
                  <LinearGradient
                    colors={[COLORS.primary, '#D491C7']}
                    style={{
                      flex: 1,
                      paddingLeft: 15,
                      paddingRight: 15,
                      borderRadius: 5,
                    }}
                  />
                  <View style={styles.fate_card_header_container}>
                    <Image source={Images.app_logo} style={styles.fate_card_header_image} />
                    <Text color={'white'} fontSize={16} fontFamily={'Jost-Medium'}>
                      fate
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setActiveDot(item);
                        refRBSheet.current.open();
                      }}>
                      <Ionicons name={'alert-circle'} size={20} color={'white'} />
                    </TouchableOpacity>
                  </View>

                  <ImageBackground
                    source={{
                      uri: item.image,
                    }}
                    style={[
                      styles.fate_card_body_bkg_image,
                      {
                        backgroundColor: 'white',
                      },
                    ]}
                    resizeMode="cover"
                    imageStyle={styles.fate_card_body_bkg_image_style}>
                    <View style={styles.fate_card_body_main_blurview}>
                      <View
                        style={{
                          backgroundColor: 'rgba(255,255,255, 0.7)',
                          height: '100%',
                          width: '100%',
                        }}>
                        <Text style={styles.fate_card_body_blurview_heading}>{item.name}</Text>
                        <Text style={styles.fate_card_body_blurview_text}>{item.status}</Text>
                      </View>
                    </View>
                  </ImageBackground>

                  <View style={styles.fate_card_footer_container}>
                    <Image source={Images.app_logo} style={styles.fate_card_footer_img} />
                  </View>
                </TouchableOpacity>

              : item.card_type === 'NORMAL' ?
                item.disqualifyStatus ? <DisqualifyComponent /> :
                  <TouchableOpacity activeOpacity={0.9}
                    onPress={() => {
                      navigation.navigate('HomePage1', {
                        otherUser: item.id,
                        currentUser: currentUser.id,
                        otherUser: item.id,
                        otherUserName: item.name,
                      });
                      //   navigation.navigate('Chats_New', {
                      //     currentUser: currentUser.id,
                      //     otherUser: item.id,
                      //   });

                    }}
                    style={styles.normal_card_main_container}>
                    <View style={styles.normal_card_left_header}>
                      <Text color={'black'} fontSize={16} fontFamily={'Jost-Medium'}>
                        {item.card_name}
                      </Text>
                      <Image source={Images.app_logo} style={styles.normal_card_left_header_image} />
                    </View>

                    <ImageBackground
                      source={{
                        uri: item.image,
                      }}
                      style={[
                        styles.normal_card_body_bkg_image,
                        {
                          backgroundColor: 'white',
                          borderWidth: 0.5,
                          borderColor: '#e754caff',
                        },
                      ]}
                      resizeMode="cover"
                      imageStyle={styles.normal_card_body_bkg_image_style}>
                      <View style={styles.normal_card_body_main_blurview}>
                        <View
                          style={{
                            backgroundColor: 'rgba(255,255,255, 0.7)',
                            height: '100%',
                            width: '100%',
                          }}>
                          <Text style={styles.fate_card_body_blurview_heading}>{item.name}</Text>
                          <Text style={styles.fate_card_body_blurview_text}>{item.status}</Text>
                        </View>
                      </View>
                    </ImageBackground>

                    <View style={styles.normal_card_right_header_container}>
                      <TouchableOpacity
                        style={styles.normal_card_right_header_alert_icon}
                        onPress={() => {
                          setActiveDot(item);
                          refRBSheet.current.open();
                        }}>
                        <Ionicons name={'alert-circle'} size={20} color={'#e754caff'} />
                      </TouchableOpacity>
                      <Image source={Images.app_logo} style={styles.normal_card_right_header_image} />
                      <Text
                        color={'black'}
                        style={styles.normal_card_right_header_text}
                        fontSize={16}
                        fontFamily={'Jost-Medium'}>
                        {item.card_name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                : item.card_type === 'ANONYMOUS' ?
                  item.disqualifyStatus ? <DisqualifyComponent /> :
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        // navigation.navigate('Chats_New', {
                        //   currentUser: currentUser.id,
                        //   otherUser: item.id,
                        // });
                        navigation.navigate('HomePage1', {
                          otherUser: item.id,
                          currentUser: currentUser.id,
                          otherUser: item.id,
                          otherUserName: item.name,
                        });
                      }}
                      style={[
                        styles.anoymous_card_main_container,
                        {
                          overflow: 'hidden',
                        },
                      ]}>
                      <LinearGradient
                        colors={['#E7C8A9', '#ffff']}
                        style={{
                          flex: 1,
                          paddingLeft: 15,
                          paddingRight: 15,
                          borderRadius: 5,
                        }}
                      />

                      <View style={styles.normal_card_left_header}>
                        <Text color={'black'} fontSize={16} fontFamily={'Jost-Medium'}>
                          {item.card_name}
                        </Text>
                        <Image source={Images.app_logo} style={styles.normal_card_left_header_image} />
                      </View>

                      <ImageBackground
                        source={Images.app_logo}
                        style={[
                          styles.normal_card_body_bkg_image,
                          {
                            backgroundColor: 'white',
                            borderWidth: 0.5,
                            borderColor: '#ffc12e',
                          },
                        ]}
                        resizeMode="contain"
                        imageStyle={styles.normal_card_body_bkg_image_style}>
                        <View style={styles.normal_card_body_main_blurview}>
                          <View
                            style={{
                              backgroundColor: 'rgba(255,255,255, 0.7)',
                              height: '100%',
                              width: '100%',
                            }}>
                            <Text style={styles.fate_card_body_blurview_heading}>{item.name}</Text>
                            <Text style={styles.fate_card_body_blurview_text}>{item.status}</Text>
                          </View>
                        </View>
                      </ImageBackground>

                      <View style={styles.normal_card_right_header_container}>
                        <TouchableOpacity
                          style={styles.normal_card_right_header_alert_icon}
                          onPress={() => {
                            setActiveDot(item);
                            refRBSheet.current.open();
                          }}>
                          <Ionicons name={'alert-circle'} size={20} color={'#e754caff'} />
                        </TouchableOpacity>
                        <Image source={Images.app_logo} style={styles.normal_card_right_header_image} />
                        <Text
                          color={'black'}
                          style={styles.normal_card_right_header_text}
                          fontSize={16}
                          fontFamily={'Jost-Medium'}>
                          {item.card_name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  : item.card_type === 'JOKER' ? (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        // refRBSheet_jokerList.current.open();
                        callGetUsersforJokerCard()
                      }}
                      style={[
                        styles.anoymous_card_main_container,
                        {
                          overflow: 'hidden',
                        },
                      ]}>
                      <LinearGradient
                        colors={['#E7C8A9', '#ffff']}
                        style={{
                          flex: 1,
                          paddingLeft: 15,
                          paddingRight: 15,
                          borderRadius: 5,
                        }}
                      />

                      <View
                        style={[
                          styles.normal_card_left_header,
                          {
                            width: responsiveWidth(7),
                          },
                        ]}>
                        <Text color={'black'} fontSize={16} fontFamily={'Jost-Medium'}>
                          {item.card_name.split('').join('\n')}
                        </Text>
                      </View>

                      <ImageBackground
                        source={{
                          uri: item.image,
                        }}
                        style={[
                          styles.normal_card_body_bkg_image,
                          {
                            // backgroundColor: 'white',
                            borderWidth: 0.5,
                            borderColor: '#ffc12e',
                          },
                        ]}
                        resizeMode="cover"
                        imageStyle={styles.normal_card_body_bkg_image_style}>
                        <View style={styles.normal_card_body_main_blurview}>
                          <View
                            style={{
                              backgroundColor: 'rgba(255,255,255, 0.7)',
                              height: '100%',
                              width: '100%',
                            }}>
                            <Text style={styles.fate_card_body_blurview_heading}>{item.name}</Text>
                            <Text style={styles.fate_card_body_blurview_text}>{item.status}</Text>
                          </View>
                        </View>
                      </ImageBackground>

                      <View style={styles.normal_card_right_header_container}>

                        <Text
                          color={'black'}
                          style={styles.normal_card_right_header_text}
                          fontSize={16}
                          fontFamily={'Jost-Medium'}>
                          {item.card_name.split('').join('\n')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : null;
          }}
          keyExtractor={item => item.id}
          numColumns={2}
          style={{
            alignSelf: 'center',
            flex: 1,
            // flexWrap: 'wrap',
            width: responsiveWidth(100),

            // flexDirection: 'row',
          }}
          contentContainerStyle={{
            alignSelf: 'center',
            justifyContent: 'space-between',
            display: loading ? 'none' : 'flex',
          }}
          ListFooterComponent={() => {
            return (
              <>
                <View
                  style={{
                    height: responsiveHeight(10),
                  }}></View>

              </>
            );
          }}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.7,
    backgroundColor: 'black',
  },
  fate_card_main_container: {
    width: responsiveWidth(40),
    height: responsiveHeight(30),
    marginHorizontal: responsiveWidth(2),
    // marginLeft: "2%",
    backgroundColor: '#e754caff',
    marginVertical: responsiveHeight(1),
    borderRadius: 10,
  },
  fate_card_header_container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: responsiveWidth(1),
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  fate_card_header_image: {
    width: responsiveWidth(4),
    height: responsiveHeight(2),
    resizeMode: 'contain',
  },
  fate_card_body_bkg_image: {
    width: '70%',
    alignSelf: 'center',
    position: 'absolute',
    top: responsiveHeight(3),
    height: responsiveHeight(24),
    overflow: 'hidden',
    borderRadius: 10,
  },
  fate_card_body_bkg_image_style: {
    width: '100%',
    height: 'auto',
  },
  fate_card_body_main_blurview: {
    position: 'absolute',
    bottom: -1,
    width: '100%', // Set the width you desire
    height: responsiveHeight(5), // Set the height you desire
    borderRadius: 10, // This will be the border radius for the container
    overflow: 'hidden',
  },
  fate_card_body_blurview: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    // backgroundColor: "rgba(0, 0, 255, 0.5)",
    paddingLeft: responsiveWidth(2),
    paddingTop: responsiveWidth(0.5),
  },
  fate_card_body_blurview_heading: {
    color: 'black',
    fontSize: responsiveFontSize(1.6),
    fontFamily: 'Jost-Medium',
    position: 'absolute',
    top: 0,
    left: responsiveWidth(2),
  },
  fate_card_body_blurview_text: {
    color: 'black',
    fontSize: responsiveFontSize(1.2),
    fontFamily: 'Jost-Medium',
    position: 'absolute',
    bottom: responsiveHeight(0.5),
    left: responsiveWidth(2),
  },
  fate_card_footer_container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: responsiveWidth(1),
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  fate_card_footer_img: {
    width: responsiveWidth(4),
    height: responsiveHeight(2),
    resizeMode: 'contain',
    transform: [{ rotate: '180deg' }],
  },

  normal_card_main_container: {
    width: responsiveWidth(40),
    height: responsiveHeight(30),
    marginHorizontal: responsiveWidth(2),
    // marginLeft: "2%",
    backgroundColor: 'white',
    marginVertical: responsiveHeight(1),
    borderRadius: 10,
  },
  anoymous_card_main_container: {
    width: responsiveWidth(40),
    height: responsiveHeight(30),
    marginHorizontal: responsiveWidth(2),
    // marginLeft: "2%",
    backgroundColor: 'red',
    marginVertical: responsiveHeight(1),
    borderRadius: 10,
  },
  normal_card_left_header: {
    // flexDirection: "row",
    justifyContent: 'flex-start',
    padding: responsiveWidth(1),
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    // width: "100%",
    height: '100%',
  },
  normal_card_left_header_image: {
    width: responsiveWidth(4),
    height: responsiveHeight(2),
    resizeMode: 'contain',
    marginTop: responsiveHeight(1),
  },
  normal_card_body_bkg_image: {
    width: '70%',
    alignSelf: 'center',
    position: 'absolute',
    top: responsiveHeight(3),
    height: responsiveHeight(24),
    overflow: 'hidden',
    borderRadius: 10,
  },
  normal_card_body_bkg_image_style: {
    width: '100%',
    height: 'auto',
  },
  normal_card_body_main_blurview: {
    position: 'absolute',
    bottom: -1,
    width: '100%', // Set the width you desire
    height: responsiveHeight(5), // Set the height you desire
    borderRadius: 10, // This will be the border radius for the container
    overflow: 'hidden',
  },
  normal_card_body_blurview: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    // backgroundColor: "rgba(0, 0, 255, 0.5)",
    paddingLeft: responsiveWidth(2),
    paddingTop: responsiveWidth(0.5),
  },
  normal_card_body_blurview_heading: {
    color: 'black',
    fontSize: responsiveFontSize(1.6),
    fontFamily: 'Jost-Medium',
    position: 'absolute',
    top: 0,
    left: responsiveWidth(2),
  },
  normal_card_body_blurview_text: {
    color: 'black',
    fontSize: responsiveFontSize(1.2),
    fontFamily: 'Jost-Medium',
    position: 'absolute',
    bottom: responsiveHeight(0.5),
    left: responsiveWidth(2),
  },
  normal_card_right_header_container: {
    justifyContent: 'flex-end',
    padding: responsiveWidth(1),
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    width: responsiveWidth(7),
    height: '100%',
  },
  normal_card_right_header_alert_icon: {
    position: 'absolute',
    top: responsiveHeight(0.6),
    zIndex: 9999,
  },
  normal_card_right_header_image: {
    width: responsiveWidth(4),
    height: responsiveHeight(2),
    resizeMode: 'contain',
    transform: [{ rotate: '180deg' }],
  },
  normal_card_right_header_text: {
    transform: [{ rotate: '180deg' }],
    marginTop: responsiveHeight(1),
  },
});
export default HomePage;
