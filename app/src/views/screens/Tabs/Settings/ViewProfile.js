import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Animated,
  ScrollView,
  FlatList,
  Linking,
  ActivityIndicator,

} from 'react-native';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import { getUserById, reportUser } from '../../../../Services/Auth/SignupService';
import { BlurView } from '@react-native-community/blur';

import Tts from 'react-native-tts';
import Sound from 'react-native-sound';
import { ChatCircleDots, SealCheck } from 'phosphor-react-native';
import MiniAudioPlayer from '../../../../components/AudioPlayer/MiniAudioPlayer';
import TrackPlayer from 'react-native-track-player';
import Carousel from 'react-native-snap-carousel';
import FastImage from 'react-native-fast-image';



function HomePage({ route, navigation }) {
  const { current_user, other_user } = route.params;
  const refRBSheet = useRef();
  const slider1Ref = useRef(null);
  const refAudioPlayerSheet = useRef(null);
  const [userData, setUserData] = useState(null);
  const [images, setImages] = useState([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);
  const [soundPlayer, setSoundPlayer] = useState(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);
  const [audioLoading, setAudioLoading] = useState(false);

  useEffect(() => {
    getUserByIdFunc();
  }, []);

  // Make sure audio stops when navigating away
  useEffect(() => {
    return () => {
      // Cleanup on unmounting component
      stopAudio();
      TrackPlayer?.reset(); // Reset the player when leaving the screen

      // Also ensure the bottom sheet is closed and audio player is stopped
      if (refAudioPlayerSheet.current) {
        refAudioPlayerSheet.current.close();
      }
    };
  }, []);

  const getUserByIdFunc = async () => {
    try {
      const response = await getUserById(other_user.id);
      setUserData(response.data);
      console.log('User data:', response?.data);
      // Ensure images are set correctly
      if (response?.data?.images && response.data.images.length > 0) {
        setImages(response.data.images);
      } else {
        setImages([response?.data?.image]);
      }
      setLoadingImages(false); // Set loading to false after images are fetched
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoadingImages(false); // Set loading to false even if there's an error
    }
  };

  const playAudioFromURL = (audioURL) => {
    const soundInstance = new Sound(audioURL, '', (error) => {
      if (error) {
        console.error('Error loading sound:', error);
        return;
      }

      const totalDuration = soundInstance.getDuration();
      setDuration(totalDuration);
      setSoundPlayer(soundInstance);
      animatedWidth.setValue(0);

      soundInstance.play((success) => {
        if (success) {
          console.log('Audio playback finished');
        } else {
          console.error('Audio playback failed');
        }
        setIsPlaying(false);
        clearInterval(intervalRef.current);
        animatedWidth.setValue(0);
      });

      setIsPlaying(true);

      intervalRef.current = setInterval(() => {
        soundInstance.getCurrentTime((currentTime) => {
          if (currentTime && totalDuration > 0) {
            const progress = (currentTime / totalDuration) * 100;
            animatedWidth.setValue(progress);
          }
        });
      }, 100);
    });
  };

  const stopAudio = () => {
    if (isPlaying && soundPlayer) {
      soundPlayer.stop(() => {
        clearInterval(intervalRef.current);
        animatedWidth.setValue(0);
        soundPlayer.release();
      });
      setIsPlaying(false);
    }
  };

  const playAudioInBottomSheet = () => {
    if (userData?.note) {
      // Stop any currently playing audio
      stopAudio();

      // Set auto-play to true so audio starts playing immediately when sheet opens
      setShouldAutoPlay(true);

      // Open the bottom sheet to play the audio
      // Need to make sure the sheet is open before playing
      refAudioPlayerSheet.current.open();
    } else {
      alert('No voice note available');
    }
  };

  // Enhanced handler for bottom sheet close
  const handleAudioPlayerSheetClose = () => {
    // Reset the autoPlay flag when sheet closes
    setShouldAutoPlay(false);

    // Stop any audio that might still be playing
    stopAudio();
  };

  const handleReportUser = async () => {
    setLoading(true);
    if (reason === '') {
      alert('Please enter reason');
      setLoading(false);
      return;
    }
    try {
      const data = {
        reported_by_user_id: current_user?.id,
        reported_user_id: other_user?.id,
        reason: reason,
      };
      const response = await reportUser(data);
      setLoading(false);
      if (!response?.error) {
        alert('User reported successfully');
        refRBSheet.current.close();
        navigation.navigate('MyTabs', {
          screen: 'HomePage',
          params: { isUpdated: true },
        });
      }
    } catch (error) {
      setLoading(false);
      console.error('Error reporting user:', error);
    }
  };

  return (
    <GradientBackground style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeAreaView}>
        {/* Add the bottom sheet for audio player */}
        <BottomSheet
          height={responsiveHeight(35)}
          ref={refAudioPlayerSheet}
          onClose={handleAudioPlayerSheetClose}>
          {userData?.note && <MiniAudioPlayer
            audioUrl={userData.note}
            onClose={() => refAudioPlayerSheet.current.close()}
            autoPlay={shouldAutoPlay}
          />}
        </BottomSheet>

        <BottomSheet height={responsiveHeight(60)} ref={refRBSheet}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.bottomSheetContent}>
              <Text style={styles.reportText}>
                Are you sure you want to{'\n'} Report this user?
              </Text>
              <CustomInput
                mainContainerStyle={styles.customInputContainer}
                title="Add Reason"
                titleStyle={styles.customInputTitle}
                autoCapitalize="none"
                keyboardType="default"
                multiline={true}
                onChangeText={setReason}
                style={styles.customInput}
              />
              <View style={styles.bottomSheetButtons}>
                <PrimaryButton
                  title="Cancel"
                  onPress={() => refRBSheet.current.close()}
                  style={styles.cancelButton}
                />
                <PrimaryButton
                  title="Confirm"
                  onPress={handleReportUser}
                  style={styles.confirmButton}
                  loading={loading}
                />
              </View>
            </View>
          </ScrollView>
        </BottomSheet>
        <TouchableOpacity
          onPress={() => {
            stopAudio();
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Icon name="chevron-left" style={styles.backIcon} size={responsiveFontSize(3)} color={COLORS.white} />
        </TouchableOpacity>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.imageContainer}>
            <Image
              source={Images.blur}
              style={[
                styles.blurImage,
                { display: other_user?.card_name?.toUpperCase() === 'A' ? 'flex' : 'none' },
              ]}
            />
            <View
              style={{
                width: responsiveWidth(93),
                height: responsiveHeight(75),
                borderRadius: 15,
                overflow: 'hidden',
                alignSelf: 'center',
                justifyContent: 'center', // Center the loader
                alignItems: 'center', // Center the loader
              }}
            >
              {loadingImages ? (
                <ActivityIndicator size="large" color={COLORS.white} />
              ) : (
                <Carousel
                  ref={slider1Ref}
                  data={images}
                  renderItem={(img) => {
                    console.log(img.item)
                    return (
                      <FastImage
                        source={{ uri: img?.item }}
                        style={[
                          styles.blurImage,
                          { display: other_user?.card_name?.toUpperCase() !== 'A' ? 'flex' : 'none' },
                        ]}
                        defaultSource={Images.loader}
                        defaultCacheControl={FastImage.cacheControl.immutable}
                        resizeMode="cover"
                        onLoadEnd={() => setLoadingImages(false)}
                      />
                    )
                  }}
                  sliderWidth={responsiveWidth(100)}
                  itemWidth={responsiveWidth(100)}
                />
              )}
            </View>

          </View>
          <View
            style={[
              styles.blurView,
              { display: Platform.OS === 'ios' ? 'flex' : 'none' },
            ]}
          >
            <Image
              source={Images.blur}
              style={[
                styles.profileImage,
                { display: other_user?.card_name?.toUpperCase() === 'A' ? 'flex' : 'none' },
              ]}
            />
            <Image
              source={{ uri: other_user?.image }}
              style={[
                styles.profileImage,
                { display: other_user?.card_name?.toUpperCase() !== 'A' ? 'flex' : 'none' },
              ]}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {other_user.name.split(' ')[0].toUpperCase()}{' '}
                {userData?.isVerifiedUser && (
                  <SealCheck color={COLORS.primary} style={styles.verifiedIcon} weight="fill" size={24} />
                )}
              </Text>
              {/* <Text style={styles.userCardName}>{other_user?.card_name?.toUpperCase()}</Text> */}
              <Text style={styles.userCardName}>{userData?.age}</Text>
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
              style={styles.chatButton}
            >
              <ChatCircleDots color={COLORS.white} weight="fill" size={responsiveFontSize(4)} />
            </TouchableOpacity>
          </View>
          <View style={styles.androidBlurView}>
            <Image
              source={Images.blur}
              style={[
                styles.profileImage,
                { display: other_user?.card_name?.toUpperCase() === 'A' ? 'flex' : 'none' },
              ]}
            />
            <Image
              source={{ uri: other_user?.image }}
              style={[
                styles.profileImage,
                { display: other_user?.card_name?.toUpperCase() !== 'A' ? 'flex' : 'none' },
              ]}
            />
            <View style={styles.userInfo}>
              <View style={styles.userNameContainer}>
                <Text style={styles.userName}>{other_user.name}</Text>
                {userData?.isVerifiedUser && (
                  <SealCheck color={COLORS.primary} weight="fill" size={24} />
                )}
              </View>
              <Text style={styles.userCardName}>
                {/* {other_user?.card_name?.toUpperCase() === 'A' ? 'A' : other_user?.card_name?.toUpperCase()} */}
                {userData?.age}
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
              style={styles.chatButton}
            >
              <ChatCircleDots color={COLORS.white} weight="fill" size={responsiveFontSize(4)} />
            </TouchableOpacity>
          </View>
          <View style={styles.audioContainer}>
            {userData?.note ? (
              <MiniAudioPlayer
                audioUrl={userData.note}
                autoPlay={false}
                onClose={() => { }}
              />
            ) : (
              <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                <Image
                  source={Images.alert_purple}
                  style={{
                    width: 50,
                    height: 50,
                    alignSelf: 'center',
                    marginVertical: 10,
                  }}
                />
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(1.5),
                    fontFamily: fonts.PoppinsMedium,
                    textAlign: 'center',
                  }}>
                  No voice note found
                </Text>
              </View>
            )}
            <Text style={[styles.bioText, {
              fontSize: responsiveFontSize(2),
              display: userData?.bio_notes ? 'flex' : 'none',
              marginLeft: 10,
            }]}>Bio: {userData?.bio_notes}</Text>
          </View>

          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: 'white',
              marginVertical: 10,
              marginHorizontal: 10,
              display: userData?.spotify_data || userData?.instagram_data ? 'flex' : 'none',
            }}
          >
            Social
          </Text>
          {

            userData?.spotify_data ?
              <FlatList
                horizontal  // Make the list horizonta
                showsHorizontalScrollIndicator={false}
                // data={userData?.spotify_data}
                data={userData.spotify_data.slice(-6)}  // Get the last 6 items
                keyExtractor={(item) => item?.track?.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    // onPress={() => {
                    //   console.log('Track:', JSON.stringify(item.track, null, 2));
                    // }}

                    onPress={() => {
                      const spotifyUrl = item.track.external_urls.spotify;
                      Linking.openURL(spotifyUrl).catch(err => console.error("Couldn't load page", err));
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 15,
                      padding: 10,
                      marginVertical: 5,
                      marginHorizontal: 10,
                      borderWidth: 1,
                      borderColor: 'rgba(221, 221, 225, 0.16)'
                      // width: '90%',
                    }}
                  >
                    {/* Album Image */}
                    <View
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 10,
                        overflow: 'hidden',
                        marginRight: 10,
                      }}
                    >
                      <Image
                        source={{ uri: item.track.album.images[0].url }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </View>

                    {/* Track Details */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: 'white',
                        }}
                      >
                        {item.track.name} - {item.track.artists[0].name}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          marginTop: 5,
                          alignContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Image
                          source={Images.spotify_logo2}
                          style={{
                            width: 20, height: 20,
                            backgroundColor: 'white',
                            borderRadius: 50,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            color: 'white',
                            marginLeft: 5,
                          }}
                        >
                          Spotify, Favorite Song
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                style={{
                  width: '100%',
                  // backgroundColor: "red",
                  paddingVertical: 5,
                }}
              /> : null
          }





          {

            userData?.instagram_data ?
              <View
                style={{
                  // flexDirection: 'row',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderWidth: 1,
                  borderColor: 'rgba(221, 221, 225, 0.16)',
                  width: '95%',
                  marginLeft: 10,
                  paddingVertical: 5,
                  paddingHorizontal: 10,

                  borderRadius: 15,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    Linking.openURL(`https://www.instagram.com/${userData?.instagram_data?.profile?.username}`);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Image
                    source={{ uri: userData?.instagram_data?.profile?.profile_picture_url }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 10,
                      alignSelf: 'center',
                      marginVertical: 10,
                    }}
                  />
                  <View
                    style={{
                      marginLeft: 10,

                    }}
                  >
                    <Text
                      style={{
                        fontSize: responsiveFontSize(2.5),
                        color: COLORS.white,
                        fontFamily: fonts.PoppinsMedium,
                      }}
                    >
                      {userData?.instagram_data?.profile?.username}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                      }}
                    >
                      <Image
                        source={Images.insta_logo}
                        style={{
                          width: 20, height: 20,
                          backgroundColor: 'white',
                          borderRadius: 50,
                        }}
                      />
                      <Text
                        style={{
                          color: COLORS.white,
                          fontFamily: fonts.PoppinsMedium,
                          marginLeft: 5,
                        }}
                      >

                        @{userData?.instagram_data?.profile?.username}
                      </Text>
                    </View>

                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      position: 'absolute',
                      right: 5,
                      width: responsiveWidth(15),

                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.white,
                        fontFamily: fonts.PoppinsMedium,
                        fontSize: responsiveFontSize(2),
                        marginRight: 5,
                      }}
                    >
                      Vist
                    </Text>
                    <Icon
                      name="chevron-right"
                      size={20}
                      color={COLORS.white}

                    />
                  </View>

                </TouchableOpacity>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    // backgroundColor: 'red',
                  }}
                >
                  <FlatList
                    horizontal  // Make the list horizonta
                    data={userData?.instagram_data?.media.reverse()}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View
                        style={{
                          width: 60,
                          // backgroundColor: "red",
                          display:
                            item.media_type === 'IMAGE' ? 'flex' : 'none',
                          marginRight: 10,
                        }}
                      >

                        <Image
                          source={{ uri: item.media_url }}
                          style={{
                            width: '100%',
                            height: 60,
                            borderRadius: 10,
                            marginVertical: 10,
                          }}
                        />
                      </View>
                    )}
                  />


                </View>
              </View>
              : null
          }
          <PrimaryButton
            title="Send message"
            onPress={() => {
              navigation.navigate('Chats_New', {
                currentUser: current_user?.id,
                otherUser: other_user?.id,
                otherUserImage: other_user?.image,
                otherUserName: other_user?.name,
              });
            }}
            style={styles.sendMessageButton}
            backgroundColor={COLORS.white}
            textColor={COLORS.primary}
          />
          <PrimaryButton
            title="Report"
            onPress={() => refRBSheet.current.open()}
            style={styles.reportButton}
            backgroundColor={COLORS.primary}
            textColor={COLORS.white}
          />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    backgroundColor: COLORS.primary,
  },
  safeAreaView: {
    flex: 1,
  },
  bottomSheetContent: {
    marginTop: responsiveHeight(3),
  },
  reportText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(2.5),
    fontFamily: fonts.PoppinsMedium,
    textAlign: 'center',
    width: responsiveWidth(70),
    marginVertical: responsiveHeight(2),
    alignSelf: 'center',
  },
  customInputContainer: {
    marginTop: responsiveHeight(2),
  },
  customInputTitle: {
    marginBottom: responsiveHeight(1),
  },
  customInput: {
    height: responsiveHeight(20),
    backgroundColor: '#FFFFFF29',
    width: responsiveWidth(90),
    color: COLORS.white,
    fontFamily: fonts.PoppinsRegular,
    fontSize: responsiveFontSize(2),
    borderRadius: 15,
    padding: responsiveWidth(3),
  },
  bottomSheetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: responsiveWidth(70),
    alignSelf: 'center',
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(2),
  },
  cancelButton: {
    alignSelf: 'center',
    width: responsiveWidth(30),
    backgroundColor: COLORS.primary,
    padding: 0,
  },
  confirmButton: {
    alignSelf: 'center',
    width: responsiveWidth(30),
    padding: 0,
  },
  backButton: {
    color: COLORS.white,
    fontSize: responsiveFontSize(2.5),
    fontFamily: fonts.JostMedium,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 999,
    left: responsiveWidth(2),
    top: Platform.OS === 'ios' ? responsiveHeight(8) : responsiveHeight(3),
  },
  backIcon: {
    padding: responsiveWidth(2),
    paddingHorizontal: responsiveWidth(3),
    alignSelf: 'center',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: responsiveWidth(90),
    marginTop: Platform.OS === 'ios' ? responsiveHeight(0) : responsiveHeight(2),
    alignItems: 'center',
  },
  blurImage: {
    width: responsiveWidth(100),
    height: responsiveHeight(75),
    resizeMode: 'cover',
    alignSelf: 'center',
    // borderRadius: 15,
    overflow: 'hidden',
  },
  sliderBoxImage: {
    borderWidth: 10,
    borderRadius: 15,
    borderColor: 'red',
    width: responsiveWidth(95),
    height: responsiveHeight(75),
    backgroundColor: 'red',
  },
  sliderBox: {
    width: responsiveWidth(95),
    height: responsiveHeight(75),
    resizeMode: 'contain',
    alignSelf: 'center',
    left: -10,
    borderRadius: 15,
  },
  sliderBoxDot: {
    marginBottom: responsiveHeight(7),
  },
  blurView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    marginTop: responsiveHeight(2),
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: responsiveWidth(2),

    width: responsiveWidth(90),
    alignSelf: 'center',
  },
  profileImage: {
    height: Platform.OS === 'ios' ? responsiveHeight(8) : responsiveHeight(9),
    resizeMode: 'cover',
    alignSelf: 'center',
    marginVertical: responsiveHeight(1),
    borderRadius: 150,
    width: responsiveWidth(17),
  },
  userInfo: {
    marginLeft: responsiveWidth(2),
  },
  userName: {
    fontSize: responsiveFontSize(2.5),
    color: COLORS.white,
    letterSpacing: 0.5,
    fontFamily: fonts.PoppinsMedium,
  },
  verifiedIcon: {
    display: 'flex',
  },
  userCardName: {
    fontSize: responsiveFontSize(2),
    color: COLORS.white,
    fontFamily: fonts.PoppinsRegular,
    letterSpacing: 0.5,
  },
  chatButton: {
    backgroundColor: 'rgba(140, 82, 255, 1)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'absolute',
    right: responsiveWidth(2),
    padding: responsiveWidth(2),
    width: Platform.OS === 'ios' ? responsiveWidth(12.5) : responsiveWidth(13),
  },
  androidBlurView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: responsiveWidth(2),
    // marginTop: responsiveHeight(-5),
    width: responsiveWidth(90),
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    display: Platform.OS === 'android' ? 'flex' : 'none',
  },
  userNameContainer: {
    flexDirection: 'row',
  },
  audioContainer: {
    // flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: responsiveWidth(2),
    marginTop: responsiveHeight(2),
    width: responsiveWidth(90),
    alignSelf: 'center',
    paddingBottom: responsiveHeight(1),
  },
  audioButton: {
    backgroundColor: COLORS.white,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    width: 60,
    height: 60,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioProgressContainer: {
    width: '80%',
    alignSelf: 'center',
  },
  audioProgressBar: {
    width: '100%',
    height: responsiveHeight(1),
    backgroundColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  audioStatusText: {
    fontSize: responsiveFontSize(1.2),
    width: '100%',
    marginTop: responsiveHeight(1),
    color: COLORS.white,
  },
  bioText: {
    fontSize: responsiveFontSize(1.2),
    width: '100%',
    marginTop: responsiveHeight(1),
    color: COLORS.white,
  },
  sendMessageButton: {
    marginTop: responsiveHeight(2),
    alignSelf: 'center',
    width: responsiveWidth(90),
  },
  reportButton: {
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(6),
    alignSelf: 'center',
    width: responsiveWidth(90),
    backgroundColor: '#FFFFFF1F',
    borderColor: '#FFFFFF29',
    borderWidth: 1,
    fontFamily: fonts.PoppinsMedium,
  },
});

export default HomePage;
