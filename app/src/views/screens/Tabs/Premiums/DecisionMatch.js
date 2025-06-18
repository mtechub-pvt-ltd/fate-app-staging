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
  Image,
  TouchableOpacity,
  Platform
} from 'react-native';
import { getUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import {
  getMatchUsersForChat,
  updateMatchByFateRullet,
  sendNewMatchReq
} from '../../../../Services/Auth/SignupService';
import { BlurView } from '@react-native-community/blur';
// use is Focus effect
import { useIsFocused } from '@react-navigation/native';




function HomePage({ route, navigation }) {
  const { currentUser, otherUser, otherUserName, otherUserImage, } = route.params;

  const isFocused = useIsFocused();
  const [fatelist, setFateList] = useState([]);
  const [activeDot, setActiveDot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jokerSuggerstion, setJokerSuggestion] = useState([]);
  const [isJokerTapped, setIsJokerTapped] = useState(false);
  const [disqualifyList, setDisqualifyList] = useState([]);
  const onRefresh = useCallback(() => {

    setLoading(loading);

  }, []);


  const refRBSheet = useRef();
  const refRBSheet_users = useRef();



  const getUserData = async () => {
    const userDetail = await getUserDetail();

  }
  const getUsers = async () => {
    const data = {
      user_id: currentUser,
    }
    const response = await getMatchUsersForChat(data);
    console.log('getMatchUsersForChat', response);
    setDisqualifyList(response?.matches);
  }
  const updateMatch = async (NewMatch) => {
    const data = {
      currentUser: currentUser,
      otherUser: otherUser,
      NewMatch: NewMatch,
    }
    const response = await updateMatchByFateRullet(data);
    console.log('updateMatchByFateRullet', response);
    if (response?.error == false) {
      refRBSheet_users.current.close();
      refRBSheet.current.open();
    }
  }
  const handleSendNewMatchReq = async (exsisting) => {
    setLoading(true);
    const data = {
      currentUserId: currentUser,
      exsistingMatchId: exsisting,
      newMatchId: otherUser,
    }
    const response = await sendNewMatchReq(data);
    console.log('updateMatchByFateRullet', response);
  }
  useEffect(() => {
    getUsers();
  }, []);




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
            <Image source={Images.rocket} style={{ width: 50, height: 50, alignSelf: 'center' }} />
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
              You have successfully added{'\n'} this user to your fatelist
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: responsiveWidth(70),
                alignSelf: 'center',
              }}>

              <PrimaryButton
                title="Confirm"
                onPress={() => {
                  refRBSheet.current.close();
                  setTimeout(() => {
                    navigation.navigate('MyTabs');
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
              responsiveHeight(70) : responsiveHeight(70)}
          ref={refRBSheet_users}
          backgroundColor={'background: rgba(255, 255, 255, 0.16)'}
        >

          <View
            style={{
              marginTop: responsiveHeight(1),
              marginHorizontal: responsiveWidth(5),
              flex: 1,
            }}>
            <FlatList
              ListHeaderComponent={() => {
                return (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingHorizontal: responsiveWidth(5),

                      // marginVertical: responsiveHeight(2),

                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: responsiveFontSize(2.5),
                        fontFamily: fonts.JostMedium,
                      }}>
                      Choose a user for{'\n'} whom you want to Swap
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        refRBSheet_users.current.close();
                      }}
                    >
                      <Icon name="times"
                        style={{
                          padding: responsiveWidth(2),
                        }}
                        size={responsiveFontSize(3)} color={COLORS.white
                        } />
                    </TouchableOpacity>
                  </View>
                )
              }}
              showsVerticalScrollIndicator={false}
              data={disqualifyList}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    style={{
                      borderBottomWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      flexDirection: 'row',
                      marginLeft: responsiveWidth(3),
                    }}
                    onPress={() => {
                      // console.log('item', item?.user_id);
                      // updateMatch(item?.user_id);
                      handleSendNewMatchReq(item?.user_id);
                      refRBSheet_users.current.close();
                    }}
                  >
                    <Image
                      source={{
                        uri: item?.profile_image
                      }}
                      style={{
                        width: 50,
                        height: 50,
                        resizeMode: 'cover',
                        alignSelf: 'center',
                        marginTop: 10,
                        borderRadius: 100,
                        backgroundColor: COLORS.white,
                      }}
                    />

                    <Text
                      style={{
                        padding: 15,
                        color: COLORS.white,
                      }}
                    >
                      {item?.name}
                      {'\n'}
                      {item?.email}
                    </Text>

                  </TouchableOpacity>
                )
              }}
              keyExtractor={item => item?.user_id.toString()}

              style={{
                // marginTop: responsiveHeight(2),
              }}
              contentContainerStyle={{
                marginTop: responsiveHeight(2),
              }}

            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
              }}>

            </View>
          </View>
        </BottomSheet>




        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: responsiveWidth(90),
            marginTop: Platform.OS === 'ios' ? responsiveHeight(0) : responsiveHeight(2),
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

            {'  '}
          </Text>
        </View>
        <Text
          style={{
            color: COLORS.white,
            fontSize: responsiveFontSize(2.5),
            fontFamily: fonts.JostMedium,
            textAlign: 'center',
          }}>
          Do you want to add this{'\n'} user as a friend?
        </Text>


        {/* <View
          style={{
            height: responsiveHeight(50),
            alignItems: 'center',
            justifyContent: 'center',
            display: loading ? 'flex' : 'none',
          }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View> */}


        {/* <FlatList
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh}
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
              <></>
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
                    height: responsiveHeight(10),
                  }}></View>

              </>
            );
          }}
          /> */}
        <View
          style={{
            flex: 1,
            marginVertical: responsiveHeight(5),
          }}

        >
          <BlurView
            style={{
              width: responsiveWidth(40),
              height: responsiveWidth(40),
              borderRadius: 60,
              display: Platform.OS === 'ios' ? 'flex' : 'none',
              alignSelf: 'center',
            }}
            overlayColor={"#00000000"}
            blurType="light"
            blurAmount={10}
          >
            <Image
              source={{
                uri: otherUserImage
              }}
              style={{
                width: 200,
                height: 200,
                resizeMode: 'cover',
                alignSelf: 'center',
                marginTop: 10,
                borderRadius: 100,
                backgroundColor: COLORS.white,
                zIndex: -1,
              }}
            />
          </BlurView>
          <View
            style={{
              display: Platform.OS === 'ios' ? 'none' : 'flex',
              backgroundColor: 'rgba(255, 255, 255, .51)',
              width: responsiveWidth(40),
              height: responsiveWidth(40),
              borderRadius: 60,
              alignSelf: 'center',
            }}
          >

          </View>
          <Text
            suppressHighlighting={true}
            style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2.5),
              fontFamily: fonts.JostMedium,
              textAlign: 'center',
              marginTop: 10,
            }}
          >
            {otherUserName}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignSelf: 'center',
            width: responsiveWidth(85),
            marginBottom: responsiveHeight(5),
          }}
        >
          <PrimaryButton
            loading={loading}
            title="Add to Fate"
            onPress={() => {
              refRBSheet_users.current.open();
            }}
            style={{
              // marginTop: responsiveHeight(5),
              alignSelf: 'center',
              width: responsiveWidth(40),
              backgroundColor: COLORS.secondary,
              padding: 0,
            }}
            color={COLORS.primary}
          />
          <PrimaryButton
            loading={loading}
            title="Start New Call"
            onPress={() => {
              navigation?.navigate('MyTabs', {
                screen: 'Premiums',
              });
            }}
            style={{
              // marginTop: responsiveHeight(5),
              alignSelf: 'center',
              width: responsiveWidth(40),
              padding: 0,
              backgroundColor: COLORS.primary,
              borderColor: COLORS.secondary,
              borderWidth: 1,
            }}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

export default HomePage;
