import React, {
  useEffect,
  useState,
  useRef,
  useCallback
} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Platform,
  RefreshControl,
  Alert,
  TouchableHighlight,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import LinearGradient from 'react-native-linear-gradient';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import {
  getMatchUsers,
  disQualifyUser,
  getUserJokerCard,
  assignJokerToUser,
  addToken
} from '../../../../Services/Auth/SignupService';
import RBSheet from 'react-native-raw-bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import { useIsFocused } from '@react-navigation/native';
import {
  House
} from 'phosphor-react-native';
import FastImage from 'react-native-fast-image';
import Tooltip from 'react-native-walkthrough-tooltip';



function HomePage({ route, navigation }) {
  const { isUpdated } = route?.params || false;
  console.log('isUpdated', isUpdated);

  // Device detection for responsive design
  const { width, height } = Dimensions.get('window');
  const isTablet = width >= 768; // Standard tablet detection threshold

  // tooltip
  const [toolTipVisible, setToolTipVisible] = useState(false);

  const isFocused = useIsFocused();
  const [currentUser, setCurrentUser] = useState(null);
  const [fatelist, setFateList] = useState([]);
  const [activeDot, setActiveDot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jokerSuggerstion, setJokerSuggestion] = useState([]);
  const [isJokerTapped, setIsJokerTapped] = useState(false);
  const onRefresh = useCallback(() => {
    if (!loading) {
      setLoading(true); // Start loading
      getMatchUsersList().finally(() => setLoading(false)); // Stop loading after the fetch
    }
  }, [loading]);



  const refRBSheet = useRef();
  const refRBSheet_reasons = useRef();
  const refRBSheet_jokerList = useRef();
  const refRBSheet_JokerSent = useRef();





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

  const getMatchUsersList = async () => {

    setLoading(true);
    const userDetail = await getUserDetail();
    const data = {
      user_id: userDetail?.data?.id,
      prefered_gender: userDetail?.data?.prefered_gender,
    };

    setCurrentUser(userDetail?.data);
    console.log('userDetail', data);

    const response = await getMatchUsers(data);

    console.log('getMatchUsers', response);

    const cardNames = ['fate', 'K', 'J', '10', 'A'];
    const cardTypes = ['FATE', 'NORMAL', 'NORMAL', 'NORMAL', 'ANONYMOUS'];
    const maxCards = cardNames.length;

    const newMatchList = response.matches.map((user, index) => {
      const cardName = cardNames[index % cardNames.length];
      const cardType = cardTypes[index % cardTypes.length];
      const cardImageKey = 'f_' + cardName;
      return {
        id: user.user_id,
        image: user.profile_image,
        name: user.name,
        status: 'Online',
        card_name: cardNames[index % cardNames.length],
        card_type: cardTypes[index % cardTypes.length],
        card_image: Images[cardImageKey],
        waitingForMatch: false,
      };
    });

    // Add dummy entries if the number of matches is less than maxCards
    for (let i = newMatchList.length; i < maxCards; i++) {
      newMatchList.push({
        id: i + 1, // Dummy ID
        image: 'https://w7.pngwing.com/pngs/414/888/png-transparent-waiting-illustration-thumbnail.png',
        name: 'Waiting...',
        status: 'Offline',
        card_name: cardNames[i % cardNames.length],
        card_type: cardTypes[i % cardTypes.length],
        card_image: Images['f_' + cardNames[i % cardNames.length]],
        waitingForMatch: true,
      });
    }

    const jokerEntry = {
      id: 6,
      image: null,
      name: '',
      status: 'Offline',
      card_name: 'Joker',
      card_type: 'JOKER',
      card_image: Images.joker,
    };

    newMatchList.push(jokerEntry);

    console.log('newMatchList', newMatchList);

    setFateList(newMatchList);


    await callUserJokerCard(false);
    setLoading(false);

    setToolTipVisible(true);
  };


  //  Store the disqualification timestamp
  const storeDisqualifyTimestamp = async () => {
    const now = new Date();
    const disqualifyTimestamp = now.getTime(); // Store the current time in milliseconds
    await AsyncStorage.setItem('lastDisqualifyTimestamp', JSON.stringify(disqualifyTimestamp));
  };
  //  Check if the user has disqualified someone within the last 48 hours
  const canDisqualify = async () => {
    const lastDisqualifyTimestamp = await AsyncStorage.getItem('lastDisqualifyTimestamp');
    if (lastDisqualifyTimestamp) {
      const now = new Date().getTime();
      const hoursSinceLastDisqualify = (now - JSON.parse(lastDisqualifyTimestamp)) / (1000 * 60 * 60);

      if (hoursSinceLastDisqualify < 48) {
        Alert.alert('You cannot disqualify another user within 48 hours.');
        return false;
      }
    }
    return true; // User can disqualify if 48 hours have passed
  };



  // previous code for disqualify user

  // const disqualifyUserHandler = async (reason, type) => {
  //   refRBSheet_reasons.current.close();

  //   setLoading(true);
  //   const userDetail = await getUserDetail();
  //   const data = {
  //     user_id: userDetail?.data?.id,
  //     disqualify_user_id: activeDot.id,
  //     reason: reason,
  //     type: type,
  //   };

  //   const response = await disQualifyUser(data);
  //   console.log('disQualifyUser', response);
  //   await getMatchUsersList();
  //   setLoading(false);

  // };


  const disqualifyUserHandler = async (reason, type) => {


    refRBSheet_reasons.current.close();
    setLoading(true);
    const userDetail = await getUserDetail();
    const data = {
      user_id: userDetail?.data?.id,
      disqualify_user_id: activeDot.id,
      reason: reason,
      type: type,
    };

    const response = await disQualifyUser(data);
    console.log('disQualifyUser', response);

    if (response?.error == false) {
      // remove 30 tokens
      //
      const data = {
        user_id: userDetail?.data?.id,
        new_tokens: -30
      }
      const res = await addToken(data);
      console.log('addToken', res);
      await storeDisqualifyTimestamp(); // Store timestamp of this disqualification
      await getMatchUsersList();
    }

    setLoading(false);
  };

  const callUserJokerCard = async (from_home) => {
    from_home ? setLoading(true) : null;

    try {
      const userDetail = await getUserDetail();
      const data = {
        user_id: userDetail?.data?.id,
        prefered_gender: userDetail?.data?.prefered_gender,
        isSystemAssigned: userDetail?.data?.subscription_type == null || userDetail?.data?.subscription_type == 'free' || userDetail?.data?.subscription_type == 'FREE' ? 'TRUE' : 'FALSE',
      };
      const response = await getUserJokerCard(data);

      console.log('getUserJokerCard', JSON.stringify(response, null, 2));

      from_home ? setLoading(false) : null;
      if (response?.isSystemAssigned === 'TRUE' && (response?.alreadyAssigned == true
        || response?.alreadyAssigned == false)
      ) {
        setFateList((prev) => {
          return prev.map((user) => {
            if (user.id === 6) {
              return {
                id: response?.newJokerCard?.user_id || response?.newJokerCard?.id,
                image: response?.newJokerCard?.profile_image,
                name: response?.newJokerCard?.name,
                status: 'Online',
                card_name: 'Joker',
                card_type: 'JOKER',
                card_image: Images.joker,
              };
            }
            return user;
          });
        });
      }
      else if (response?.isSystemAssigned === 'FALSE' && response?.alreadyAssigned == true) {
        setFateList((prev) => {
          return prev.map((user) => {
            if (user.id === 6) {
              return {
                id: response?.newJokerCard?.user_id || response?.newJokerCard?.id,
                image: response?.newJokerCard?.profile_image,
                name: response?.newJokerCard?.name,
                status: 'Online',
                card_name: 'Joker',
                card_type: 'JOKER',
                card_image: Images.joker,
              };
            }

            return user;
          });
        });
      }
      else if (response?.isSystemAssigned === 'FALSE' && response?.alreadyAssigned == false) {
        if (from_home == false) {
          // null
        }
        else {
          setJokerSuggestion(response.jokerCards);
          refRBSheet_jokerList.current.open();
        }
      }
    }
    catch (error) {
      console.log('error', error);
      from_home ? setLoading(false) : null;
    }


  };
  const addJokerToUser = async (item) => {
    setLoading(true);
    refRBSheet_jokerList.current.close();
    const userDetail = await getUserDetail();
    const data = {
      from_user_id: userDetail?.data?.id,
      to_user_id: userDetail?.data?.id,
      jokercard: {
        user_id: item?.user_id
      },
      isSystemAssigned: userDetail?.data?.subscription_type == null || userDetail?.data?.subscription_type == 'free' || userDetail?.data?.subscription_type == 'FREE' ? 'TRUE' : 'FALSE',
    };
    const response = await assignJokerToUser(data);
    console.log('assignJokerToUser', response)
    // remove 60 tokens
    const data1 = {
      user_id: userDetail?.data?.id,
      new_tokens: -60
    }
    const res = await addToken(data1);
    console.log('addToken', res);
    setLoading(false);
    if (response.error === false) {


      setTimeout(async () => {
        await callUserJokerCard(false);
        refRBSheet_JokerSent.current.open();
      }, 500);
      setTimeout(() => {
        refRBSheet_JokerSent.current.close();
      }, 3000);
    }


  };

  useEffect(() => {
    console.log('HomePage');
    getMatchUsersList();
  }, []);
  useEffect(() => {
    if (isUpdated && !loading) {
      getMatchUsersList();
      navigation.setParams({ isUpdated: false });
    }
    // remvoe user form the rullet 
  }, [isFocused]);




  const getUserData = async () => {
    const userDetail = await getUserDetail();
    setCurrentUser(userDetail?.data);

    // remvoe user form the rullet
    console.log('userDetail', userDetail?.data?.id);
    const data = {
      user_id: userDetail?.data?.id,
    }
    // const response = await removeUserFromFateRullet(data);
    // console.log('removeUserFromFateRullet', response);
    // check current screen name 





  }
  useEffect(() => {
    // getUserData()
  }, [isFocused]);

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
                color: COLORS.white,
                fontSize: responsiveFontSize(2.5),
                fontFamily: fonts.PoppinsMedium,
                textAlign: 'center',
                width: responsiveWidth(70),
                marginVertical: responsiveHeight(2),
                alignSelf: 'center',
              }}>
              Are you sure you want to{'\n'} disqualify this user?
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: responsiveWidth(70),
                alignSelf: 'center',
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
                  refRBSheet.current.close();
                  setTimeout(() => {

                    refRBSheet_reasons.current.open();
                  }, 500);
                }}
                style={{
                  // marginTop: responsiveHeight(5),
                  alignSelf: 'center',
                  width: responsiveWidth(30),
                  padding: 0,
                }}
              />
            </View>
          </View>
        </BottomSheet>

        <BottomSheet
          height={
            Platform.OS === 'ios' ?
              responsiveHeight(60) : responsiveHeight(80)}
          ref={refRBSheet_reasons}
          backgroundColor={'red'}
        >
          <GradientBackground
            style={{
              marginTop: responsiveHeight(1),
              marginHorizontal: responsiveWidth(5),
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>




            <FlatList
              ListHeaderComponent={() => {
                return (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      // backgroundColor: 'red',
                      width: responsiveWidth(90),
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: responsiveFontSize(2),
                        fontFamily: fonts.PoppinsMedium,
                        paddingVertical: responsiveHeight(2),
                        width: responsiveWidth(70),
                      }}>
                      Select a reason for Disqualifications
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        refRBSheet_reasons.current.close();
                      }}
                      style={{
                        paddingVertical: 5,
                        paddingHorizontal: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.16)',
                        borderRadius: 50,
                        // width: 40,
                        alignItems: 'center',
                      }}
                    >
                      <Icon name="times" size={18} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                )
              }}

              showsVerticalScrollIndicator={false}
              data={disqualifyList}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      borderBottomWidth: 1,
                      borderColor: COLORS.grey,
                    }}
                    onPress={() => {
                      disqualifyUserHandler(item.content, item.type);
                    }}
                  >
                    <Text
                      style={{
                        padding: 15,
                        color: COLORS.white,
                        fontFamily: fonts.PoppinsMedium,
                      }}
                    >{
                        item.content
                      }</Text>
                  </TouchableOpacity>
                )
              }}
              keyExtractor={item => item.id.toString()}

              style={{
                marginTop: responsiveHeight(1),
              }}
              contentContainerStyle={{

              }}


            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
              }}>

            </View>
          </GradientBackground>
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
                color: COLORS.white,
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
          height={responsiveHeight(70)}
          openDuration={250}
          customStyles={{
            container: {
              backgroundColor: 'transparent',
              width: responsiveWidth(90),
              borderRadius: 20,
              // padding: 20,
              marginBottom: responsiveHeight(15),
              alignSelf: 'center',
              height: responsiveHeight(70),
              borderRadius: 20,
              borderWidth: 1,
              overflow: 'hidden',
              borderColor: COLORS.light,
            },
          }}
          animationType={'fade'}
        >
          <GradientBackground
            gradientStyle={{
              width: responsiveWidth(90),
              alignSelf: 'center',
              height: '100%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                width: responsiveWidth(80),
                zIndex: 999,
                marginVertical: responsiveHeight(1),
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  fontWeight: '600',
                  width: responsiveWidth(100),
                  // fontFamily: fonts.JostMedium,
                }}
              >
                Select a profile to {'\n'}send a Joker Card
              </Text>
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  position: 'absolute',
                  right: 0,
                }}
                onPress={() => {
                  refRBSheet_jokerList.current.close();
                }}
              >
                <Icon name="times" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <FlatList
              // ListHeaderComponent={() => {
              //   return ()
              // }}
              showsVerticalScrollIndicator={true}
              data={jokerSuggerstion}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      flexDirection: 'row',
                      marginTop: responsiveHeight(1),
                    }}
                    onPress={() => {
                      console.log('item', item);
                      addJokerToUser(item);
                      // refRBSheet_jokerList.current.close();

                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        width: '80%',
                      }}
                    >
                      <Image
                        source={{
                          uri: item?.profile_image === null ? Images.app_logo : item?.profile_image,
                        }}
                        style={{
                          width: Platform.OS === 'ios' ? responsiveWidth(15) : responsiveWidth(13),

                          height: responsiveHeight(7),
                          borderRadius: 100,
                          resizeMode: 'cover',
                        }}
                      />
                      <View>
                        <Text
                          style={{
                            color: COLORS.white,
                            fontSize: responsiveFontSize(2),
                            marginTop: responsiveHeight(0.5),
                            marginHorizontal: responsiveWidth(3),
                            fontWeight: '600',
                          }}>
                          {item.name}
                        </Text>
                        <Text
                          style={{
                            color: COLORS.white,
                            fontSize: responsiveFontSize(1.6),
                            marginTop: responsiveHeight(0.5),
                            marginHorizontal: responsiveWidth(3),
                            display: item?.age === null ? 'none' : 'flex',

                          }}>
                          {item?.age} Year | {item?.user_id}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        justifyContent: 'center',
                        flexDirection: 'row',
                        width: '20%',
                      }}
                    >

                      <Icon name="paper-plane"
                        style={{
                          padding: 10,
                          backgroundColor: 'rgba(255, 255, 255, 0.16)',
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.06)',
                          overflow: 'hidden',
                        }}
                        size={20} color={COLORS.white} />

                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
              style={{
                // marginTop: Platform.OS === 'ios' ? responsiveHeight(2) :
                //   responsiveHeight(3),
                width: '100%',
                // paddingHorizontal: responsiveWidth(2),
                // paddingTop: responsiveHeight(2),

              }}

              ListFooterComponent={() => {
                return (
                  <View
                    style={{
                      height: responsiveHeight(10),
                    }}></View>
                );
              }}
            />
          </GradientBackground>
        </RBSheet>





        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: responsiveWidth(90),
              marginTop: Platform.OS === 'ios' ? responsiveHeight(0) : responsiveHeight(2),
            }}>

            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2.5),
                fontFamily: fonts.PoppinsMedium,
              }}>
              {/* <Icon name="home"
                style={{
                  marginRight: responsiveWidth(2),
                }}
                size={responsiveFontSize(3)} color={COLORS.white} /> */}
              <House color={COLORS.white}
                weight='fill' size={24} />
              {'  '}Home
            </Text>



          </View>
          <Text
            style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2.7),
              marginTop: responsiveHeight(1),
              marginBottom: responsiveHeight(1),
              fontWeight: '600',
              fontFamily: fonts.PoppinsMedium,

            }}
          >
            Matches
          </Text>

          {/* <Tooltip
            contentStyle={{
              backgroundColor: COLORS.white,
              padding: 10,
              borderRadius: 10,
              width: responsiveWidth(60),
              alignItems: 'center',

            }}
            isVisible={toolTipVisible}
            content={
              <Text
                style={{
                  color: COLORS.secondary,
                  textAlign: 'center',
                }}
              >See All Your Matches Here {'\n'}Tap on any card to view profile</Text>
            }
            placement="top"
            onClose={() => setToolTipVisible(false)}
          >

            <Text></Text>
          </Tooltip> */}
        </View>


        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={loading}
              tintColor="#fff"
              titleColor="#fff"
              onRefresh={onRefresh}
              style={{
                marginTop: responsiveHeight(2),
                display: 'none',
              }}
            />
          }

          showsVerticalScrollIndicator={false}
          data={fatelist}
          renderItem={({ key, item }) => {
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (item.card_type === 'JOKER') {

                    // check if subscription is free
                    if (currentUser?.subscription_type == null ||
                      currentUser?.subscription_type == 'free' ||
                      currentUser?.subscription_type == 'FREE' ||
                      currentUser?.subscription_type == 'silvermonthly12345_new'


                    ) {
                      console.log('current user', currentUser);
                      navigation.navigate('ViewProfile', {
                        current_user: currentUser,
                        other_user: item,
                      });

                    } else if (item?.name != '') {

                      navigation.navigate('ViewProfile', {
                        current_user: currentUser,
                        other_user: item,
                      });
                      return;
                    } else {
                      if (currentUser?.subscription_type == 'silvermonthly12345_new' ||
                        currentUser?.subscription_type == 'goldmonthly12345_new') {
                        callUserJokerCard();
                      }
                    }
                  }
                  else if (item?.waitingForMatch != true) {
                    console.log('item', item);
                    console.log('current user', currentUser);
                    navigation.navigate('ViewProfile', {
                      current_user: currentUser,
                      other_user: item,
                    });
                  }
                }}
              >
                {/* card rendering */}
                <ImageBackground
                  source={{
                    uri: item.image === null ? null : item.image
                  }}
                  style={{
                    width: isTablet ? responsiveWidth(35) : responsiveWidth(42),
                    height: isTablet ? responsiveHeight(24) : Platform.OS === 'ios' ? responsiveHeight(26.5) : responsiveHeight(28),
                    marginVertical: isTablet ? responsiveHeight(1.5) : responsiveHeight(1),
                    marginHorizontal: isTablet ? responsiveWidth(2.5) : responsiveWidth(2),
                    display: item.waitingForMatch != true ? 'flex' : 'none',
                    borderRadius: 5,
                    overflow: 'hidden',
                  }}
                  imageStyle={{
                    borderRadius: item.image === null ? 100 : 5,
                    backgroundColor: 'red',
                    width: item.image === null ? 50 : responsiveWidth(33),
                    alignSelf: 'center',
                    height: 'auto',
                    resizeMode: item.image === null ? "contain" : 'contain',
                    left: item.image === null ? '35%' : "10%",
                    zIndex: -1,
                  }}
                >
                  {/* tap to sejd joekr  */}
                  <Text
                    style={{
                      display: item.card_type === 'JOKER'
                        && (
                          currentUser?.subscription_type == 'silvermonthly12345_new' ||
                          currentUser?.subscription_type == 'goldmonthly12345_new'
                        )
                        && item?.name === ''
                        ? 'flex' : 'none',
                      position: 'absolute',
                      top: responsiveHeight(10),
                      left: responsiveWidth(10),
                      backgroundColor: 'transparent',
                      zIndex: 999,
                      padding: 5,
                      textAlign: 'center',
                      fontSize: responsiveFontSize(1.5),
                      fontWeight: 'bold',
                      color: COLORS.secondary,
                    }}
                  >
                    TAP TO {'\n'}SEND JOKER
                  </Text>

                  {/* 
                  anonymous user
                  */}
                  <BlurView


                    style={{
                      // zIndex: 999,
                      display: item.card_type === 'ANONYMOUS' ? 'flex' : 'none',
                    }}
                    blurType="light"
                    blurAmount={10}
                    reducedTransparencyFallbackColor="white"
                  >

                    <Image
                      source={item.card_image}
                      style={{
                        width: responsiveWidth(42),
                        height: Platform.OS === 'ios' ? responsiveHeight(26.5) : responsiveHeight(28),
                        // marginVertical: responsiveHeight(1),
                        // marginHorizontal: responsiveWidth(2),
                        backgroundColor: 'transparent',
                        resizeMode: 'cover',

                      }}
                    />
                  </BlurView>

                  <Image
                    source={item.card_image}
                    style={{
                      width: responsiveWidth(42),
                      height: Platform.OS === 'ios' ? responsiveHeight(26.5) : responsiveHeight(28),
                      backgroundColor: 'transparent',
                      resizeMode: 'contain',
                      display: item.card_type != 'ANONYMOUS' ? 'flex' : 'none',
                      overflow: 'hidden',
                      borderRadius: 10,
                    }}
                  />
                  <BlurView
                    reducedTransparencyFallbackColor="white"
                    style={{
                      position: 'absolute',
                      bottom: responsiveHeight(3.2),
                      left: responsiveWidth(7.5),
                      width: '65%',
                      height: responsiveHeight(4.5),
                      borderRadius: 5,
                      padding: 5,
                      zIndex: -1,
                      display: Platform.OS === 'ios' ? 'flex' : 'none',
                      // usama data
                      // backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                    blurType="light"
                    blurAmount={10}

                  >
                    <Text
                      style={{
                        color: COLORS.black,
                        fontSize: responsiveFontSize(1.3),
                        fontFamily: fonts.PoppinsSemiBold,
                      }}
                    >
                      {
                        item?.name === null ? 'New User' :
                          item?.name?.split(' ')[0]} {'\n'}
                      <Text
                        style={{
                          color: COLORS.black,
                          fontSize: responsiveFontSize(1),
                          fontFamily: fonts.PoppinsRegular
                        }}
                      >
                        <View
                          style={{
                            padding: 4,
                            backgroundColor: COLORS.secondary2,
                            borderRadius: 5,
                          }}
                        ></View> Online {item.id}
                      </Text>
                    </Text>
                  </BlurView>
                  <View

                    style={{
                      position: 'absolute',
                      bottom: responsiveHeight(3.2),
                      left: responsiveWidth(7.5),
                      width: '65%',
                      // height: responsiveHeight(4.5),
                      borderRadius: 5,
                      padding: 5,
                      zIndex: 999,
                      display: Platform.OS === 'ios' ? 'none' : 'flex',
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.black,
                        fontSize: responsiveFontSize(1.3),
                        fontFamily: fonts.PoppinsSemiBold,
                      }}
                    >
                      {
                        item?.name === null ? 'New User' :
                          item?.name?.split(' ')[0]
                      } {'\n'}
                      <Text
                        style={{
                          color: COLORS.black,
                          fontSize: responsiveFontSize(1),
                          fontFamily: fonts.PoppinsRegular
                        }}
                      >
                        <View
                          style={{
                            padding: 4,
                            backgroundColor: COLORS.secondary2,
                            borderRadius: 5,

                          }}
                        ></View> Online {item.id}
                      </Text>
                    </Text>
                  </View>
                  <Icon name="exclamation-circle"
                    size={responsiveFontSize(2.5)}
                    color={COLORS.white}
                    style={{
                      position: 'absolute',
                      top: responsiveHeight(1),
                      // right: responsiveWidth(2), // Fixed positioning
                      // padding: 8, // Add padding for easier touch target
                      zIndex: 999, // Ensure it's above other elements
                      backgroundColor: 'rgba(0,0,0,0.2)', // Semi-transparent background
                      // borderRadius: 50, // Make it circular
                      overflow: 'hidden', // Keep the background within the circle
                      display: item.card_type === 'JOKER'
                        && (
                          currentUser?.subscription_type == 'silvermonthly12345_new' ||
                          currentUser?.subscription_type == 'goldmonthly12345_new'
                        )
                        ? 'none' : 'flex',
                    }}
                    onPress={async () => {
                      const canProceed = await canDisqualify(); // Check if user can disqualify another user
                      if (!canProceed) {
                        return; // Stop the disqualification process if within 48 hours
                      } else {
                        setActiveDot(item);
                        refRBSheet.current.open();
                      }

                    }}
                  />
                </ImageBackground>

                <View
                  style={{
                    width: responsiveWidth(42),
                    height: Platform.OS === 'ios' ? responsiveHeight(26.5) : responsiveHeight(28),
                    marginVertical: responsiveHeight(1),
                    marginHorizontal: responsiveWidth(2),
                    backgroundColor: COLORS.white,
                    borderRadius: 15,
                    overflow: 'hidden',
                    display: item.waitingForMatch === true ? 'flex' : 'none',
                  }}
                >
                  {/* FastImage as the background */}
                  <FastImage
                    source={require('../../../../assets/waitingForatch.gif')}
                    style={[StyleSheet.absoluteFillObject, {
                      width: responsiveWidth(42),
                      height: Platform.OS === 'ios' ? responsiveHeight(26.5) : responsiveHeight(28),
                      borderRadius: 5,
                      overflow: 'hidden',
                    }]}
                    resizeMode={FastImage.resizeMode.contain}
                  />

                  {/* Overlay components */}
                  <Image
                    source={item.card_image}
                    style={{
                      width: responsiveWidth(42),
                      height: Platform.OS === 'ios' ? responsiveHeight(26.5) : responsiveHeight(28),
                      resizeMode: 'contain',
                      borderRadius: 5,
                      overflow: 'hidden',
                    }}
                  />
                  <View style={{ position: 'absolute', display: 'none' }}>
                    <Icon
                      name="exclamation-circle"
                      size={responsiveFontSize(3.5)}
                      color={COLORS.white}
                      style={{
                        position: 'absolute',
                        top: responsiveHeight(7),
                        left: responsiveWidth(17),
                        alignSelf: 'center',
                      }}
                    />
                    <Text
                      style={{
                        position: 'absolute',
                        top: responsiveHeight(12),
                        left: responsiveWidth(11),
                        color: COLORS.white,
                        fontSize: responsiveFontSize(1.6),
                        textAlign: 'center',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        lineHeight: responsiveHeight(2),
                      }}
                    >
                      Waiting {'\n'}for match
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          }}
          keyExtractor={item => item.id}
          numColumns={2}
          style={{
            alignSelf: 'center',
            flex: 1,
            width: responsiveWidth(100),

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
                    height: responsiveHeight(20),
                  }}></View>

              </>
            );
          }}

        />
      </SafeAreaView>
    </GradientBackground >
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
