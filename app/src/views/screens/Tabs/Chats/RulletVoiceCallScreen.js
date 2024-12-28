import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, Platform, PermissionsAndroid,
  ActivityIndicator,
  SafeAreaView,
  ImageBackground
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import fonts from '../../../../consts/fonts';
import { RTCPeerConnection, RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import io from 'socket.io-client';
import InCallManager from 'react-native-incall-manager';
import { node_base_url } from '../../../../consts/baseUrls';
import COLORS from '../../../../consts/colors';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import {
  answerTheCall,
  endTheCall,
  initateTheCall,
  getMatchUsers, getUsersforJokerCard, getMatchUsersForChat,
  addrulletLog,
  matchdecisionAfterRullet
} from '../../../../Services/Auth/SignupService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import {
  Microphone,
  MicrophoneSlash,
  SpeakerHigh,
  SpeakerNone,
  PhoneDisconnect
} from 'phosphor-react-native';
import CryptoJS from 'crypto-js';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import Images from '../../../../consts/Images';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import Swiper from 'react-native-swiper'
import LinearGradient from 'react-native-linear-gradient';
import FlashMessages from '../../../../components/FlashMessages/FlashMessages';




const generateTurnCredentials = (secret) => {
  const timestamp = Math.floor(Date.now() / 1000) + 3600; // Valid for 1 hour in the future
  const username = timestamp.toString(); // Unix timestamp as username

  // Generate HMAC-SHA1 password using the secret and timestamp
  const hmac = CryptoJS.HmacSHA1(username, secret);
  const credential = CryptoJS.enc.Base64.stringify(hmac); // Convert to base64

  return { username, credential };
};

// Replace with your static-auth-secret
const staticAuthSecret = 'E2zAl0q66Wjm5Z2hp1KRYjyf0KxEirzcibgueHY72NrUH4dV8Vec4AAy7RIm1kuX';

// Generate the credentials
const { username, credential } = generateTurnCredentials(staticAuthSecret);



const configuration = {
  iceServers: [

    // { urls: 'turn:your.turn.server:3478', username: 'yourUsername', credential: 'yourCredential' },
    {
      urls: 'turn:fate-webrtc.mtechub.com:3478', // Replace with your TURN server URL
      username: 'username', // Generated username
      credential: 'password', // Generated password
    },
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:global.relay.metered.ca:80",
      username: "8de48e93590f8556378b77c2",
      credential: "bvcYVdciDKoMnW98",
    },
    {
      urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username: "8de48e93590f8556378b77c2",
      credential: "bvcYVdciDKoMnW98",
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "8de48e93590f8556378b77c2",
      credential: "bvcYVdciDKoMnW98",
    },
    {
      urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username: "8de48e93590f8556378b77c2",
      credential: "bvcYVdciDKoMnW98",
    }
    // { urls: 'stun:stun.l.google.com:19302' },
  ],
};


const RulletVoiceCallScreen = ({ route, navigation }) => {
  const refRBSheet = useRef();
  const refRBSheetList = useRef();
  const { currentUser,
    otherUser,
    otherUserName,
    otherUserImage,
    fromNotification
  } = route.params;
  // const { currentUser,
  //   otherUser,
  //   otherUserName,
  //   otherUserImage,
  //   fromNotification
  // } = {
  //   currentUser: 209,
  //   otherUser: 2,
  //   otherUserName: 'test',
  //   otherUserImage: 'https://fate-profile-images.s3.ap-south-1.amazonaws.com/1627580000_1.jpg',
  //   fromNotification: false
  // }
  const [bothUsersJoined, setBothUsersJoined] = useState(false); // New state to track both users
  // const [bothUsersJoined, setBothUsersJoined] = useState(true); // New state to track both users
  const timerRef = useRef(null); // Ref to store the interval ID
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [remainingTime, setRemainingTime] = useState(600);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(false);
  // const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const peerConnection = useRef(new RTCPeerConnection(configuration));
  const socket = useRef(null);
  const roomName = useRef(`room_${[currentUser, otherUser].sort().join('_')}`);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [falshMessage, setFalshMessage] = useState(false);
  const [falshMessageData, setFalshMessageData] = useState(null)

  useEffect(() => {


    AsyncStorage.removeItem('incomingCall');
    AsyncStorage.removeItem('callData');

    console.log('Initializing socket connection...');
    socket.current = io(node_base_url);
    socket.current.emit('joinAudioCall', { user1Id: currentUser, user2Id: otherUser });

    // Listen for other user joining and send offer
    socket.current.on('user-audio-joined', (data) => {
      setLoading(false);
      setLoadingText('');
      createOffer();
      // Set the state to indicate both users have joined
      if (!bothUsersJoined) {
        setBothUsersJoined(true);
      }
    });

    socket.current.on('offer-audio', handleOffer);
    socket.current.on('answer-audio', handleAnswer);
    socket.current.on('ice-audio-candidate', handleIceCandidate);
    socket.current.on('end-Audiocall', () => {

      console.log('Other user has ended the call');
      peerConnection.current.close();
      if (localStream) {
        localStream.release()
        setLocalStream(null);
      };
      if (remoteStream) {
        remoteStream.release()
        setRemoteStream(null);
      };
      InCallManager.stop();
      setLoading(false);
      setLoadingText('');
      socket.current.disconnect();
      refRBSheet.current.open();
    });

    startLocalStream();

    // if (!fromNotification) {
    //   initateCall();
    // }

    return () => {
      console.log('Cleaning up...');
      peerConnection.current.close();
      peerConnection.current = null;

      if (localStream) localStream.release();
      if (remoteStream) remoteStream.release();
      socket.current.disconnect();
    };
  }, []);


  const getUserChatList = async () => {
    const data = {
      user_id: currentUser,
    }
    const response = await getMatchUsersForChat(data);
    console.log('response:', response);
    setCurrentMatch(response?.matches);

  }
  useEffect(() => {
    getUserChatList();


  }, []);
  useEffect(() => {

    if (bothUsersJoined) {
      setBothUsersJoined(true);
      setLoading(false); // Stop loading once both users have joined
      setLoadingText(''); // Reset loading text
      startCountdown(); // Start the countdown
    }

    return () => {
      // Clean up the timer on unmount
      clearInterval(timerRef.current);
    };
  }, [bothUsersJoined]); // This will run when `bothUsersJoined` changes


  // count down 
  const startCountdown = () => {
    // const timer = setInterval(() => {
    //   setCountdown(prev => {
    //     if (prev <= 1) {
    //       clearInterval(timer);
    //       handleEndCall();
    //       return 0;
    //     }
    //     return prev - 1;
    //   });
    // }, 1000);
    setIsTimerActive(true);
    timerRef.current = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          handleEndCall('TIMEOUT');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startLocalStream = async () => {
    try {
      console.log('Accessing media devices...');
      const stream = await mediaDevices.getUserMedia({ audio: true, video: { facingMode: 'user' } });
      setLocalStream(stream);
      InCallManager.start();
      // 
      InCallManager.setForceSpeakerphoneOn(isSpeakerEnabled);
      initPeerConnection(stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      peerConnection.current.close();
      if (localStream) localStream.release();
      if (remoteStream) remoteStream.release();
      // navigation.goBack();
      // goBack();

    }
  };

  const initPeerConnection = (stream) => {
    console.log('Initializing peer connection...');
    stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

    peerConnection.current.ontrack = (event) => {
      console.log('Remote stream received:', event.streams[0]);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate:', event.candidate);
        socket.current.emit('ice-audio-candidate', { room: roomName.current, candidate: event.candidate });
      }
    };
  };

  const handleOffer = async ({ offer }) => {
    console.log('Received offer:', offer);
    setLoading(false);
    setLoadingText('');
    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      console.log('Sending answer:', answer);
      socket.current.emit('answer-audio', { room: roomName.current, answer });

    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async ({ answer }) => {
    console.log('Received answer:', answer);

    setLoading(false);
    setLoadingText('');
    try {
      const data = {
        chat_room_name: roomName.current,
        call_type: 'AUDIO',
      }
      const answerCall = await answerTheCall(data);
      console.log('answerCall:', answerCall);
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async ({ candidate }) => {
    console.log('Received ICE candidate:', candidate);
    try {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      setBothUsersJoined(true);
    } catch (error) {
      console.error('Error adding received ICE candidate:', error);
    }
  };

  const createOffer = async () => {
    console.log('Creating offer...');
    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      console.log('Sending offer:', offer);
      socket.current.emit('offer-audio', { room: roomName.current, offer });
    } catch (error) {
      console.error('Error creating or sending offer:', error);
    }
  };

  const switchCamera = () => {
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack._switchCamera();
    }
  };
  const toggleMicrophone = () => {
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicMuted(!audioTrack.enabled);
    }
  };
  const handleEndCall = async () => {
    // emit end call event
    socket.current.emit('end-Audiocall', { room: roomName.current });
    setLoading(true);
    setLoadingText('Ending call...');


    peerConnection.current.close();
    if (localStream) localStream.release();
    if (remoteStream) remoteStream.release();
    InCallManager.stop();
    setLoading(false);
    setLoadingText('');
    refRBSheet.current.open();
  };
  const initateCall = async () => {

    setLoading(true);
    setLoadingText(`Initiating & Connecting ${'\n'} call with ${otherUserName}...`);
    const data = {
      callerId: currentUser,
      receiverId: otherUser,
      callType: 'AUDIO', // or 'AUDIO'
    }
    const response = await initateTheCall(data);
    console.log('response:', response);


  };


  const addrulletLogData = async (e) => {

    setLoading(true);

    try {
      const data = {
        chatroom_id: roomName.current,
        action_from: currentUser,
        action_response: e.action_response,
        new_match_user_id: otherUser,
        with_swap_match_user_id: e.with_swap_match_user_id,
      }
      const response = await addrulletLog(data);
      console.log('response:', response);

      if (response?.error === false) {
        if (response?.otherUserStillDeciding === true) {
          setFalshMessageData({
            message: 'Success',
            description: response.msg,
            type: 'success',
            icon: 'success',
            backgroundColor: COLORS.success,
            textColor: COLORS.white,
          });
          setFalshMessage(true);

          setTimeout(() => {
            setLoading(false);
            setFalshMessage(false);
            navigation.navigate('MyTabs');
          }, 3000);
        } else if (response?.otherUserStillDeciding === false) {


          // check if both user have CONFIRM 
          if (response?.data?.currentUserResponse?.action_response === 'CONFIRM' &&
            response?.data?.otherUserResponse?.action_response === 'CONFIRM') {
            // call api that will add both user in match list and replace the existing user with new user
            setLoading(false);
            const data = {
              currentUserResponse: response?.data?.currentUserResponse,
              otherUserResponse: response?.data?.otherUserResponse,
            }
            const res = await matchdecisionAfterRullet(data);
            console.log('res:', res);
          } else {

            const data = {
              currentUserResponse: response?.data?.currentUserResponse,
              otherUserResponse: response?.data?.otherUserResponse,
            }
            const res = await matchdecisionAfterRullet(data);
            console.log('res:', res);
          }
          setTimeout(() => {
            setLoading(false);

            navigation.navigate('MyTabs');
          }, 3000);
        }
      }

    }
    catch (error) {
      console.log('error:', error);
    }


  }
  useEffect(() => {
    console.log('data>>>>>>>', route.params);
  }, []);
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.black,
      }}
    >
      {falshMessage && <FlashMessages falshMessageData={falshMessageData} />}
      <BottomSheet
        height={responsiveHeight(45)}
        ref={refRBSheet}>
        <View
          style={{
            marginTop: responsiveHeight(3),
          }}>
          <Image source={{
            uri: otherUserImage,
          }} style={{
            width: responsiveWidth(30),
            height: responsiveWidth(30),
            alignSelf: 'center',
            borderRadius: responsiveWidth(30),
          }} />
          <Text
            style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2.5),
              textAlign: 'center',
              width: responsiveWidth(70),
              marginVertical: responsiveHeight(2),
              alignSelf: 'center',
            }}>
            Do you want to add this{'\n'} user as a match?
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              width: responsiveWidth(70),
              alignSelf: 'center',
            }}>
            <PrimaryButton
              title="No"
              onPress={() => {
                refRBSheet.current.close();
                const e = {
                  action_response: "CANCEL",
                  with_swap_match_user_id: null
                }
                addrulletLogData(e);
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
              title="Yes"
              onPress={() => {
                refRBSheet.current.close();

                setTimeout(() => {
                  refRBSheetList.current.open();
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
        height={responsiveHeight(95)}
        ref={refRBSheetList}
        backgroundColor={COLORS.red}
      >
        <GradientBackground >
          <View
            style={{
              flex: 1,
              zIndex: 9,
              // justifyContent: 'center',

            }}
          >
            <TouchableOpacity
              style={{
                marginHorizontal: responsiveWidth(2),
                marginVertical: responsiveHeight(2),
              }}
              onPress={() => {
                // handleEndCall();\
                refRBSheetList.current.close();
              }}
            >
              <Icon
                name="chevron-left"
                size={responsiveFontSize(2.5)}
                color={COLORS.white}
                style={{
                  padding: 15,
                }}

              />
            </TouchableOpacity>
            <View
              style={{
                // height: responsiveHeight(30),
                marginHorizontal: Platform.OS === 'ios' ? responsiveWidth(5) : responsiveWidth(2),
              }}>

              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(3),
                  fontFamily: fonts.PoppinsRegular,
                  fontWeight: 'bold',
                  // marginTop: responsiveHeight(3),
                }}>
                Please swap the match
              </Text>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2.5),
                  fontFamily: fonts.PoppinsRegular,
                }}>
                Select the match you would like to swap your caller with
              </Text>

            </View>
            <View
              style={{
                height: responsiveHeight(60),
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: responsiveHeight(2),

              }}
            >
              <Swiper style={styles.wrapper}
                loop={false}
                showsPagination={false}  // Hide pagination dots
                autoplay={false}
              >
                {
                  currentMatch && currentMatch.map((item, index) => {
                    return (
                      <View style={styles.slide}
                        key={index}
                      >
                        <ImageBackground
                          source={{ uri: item?.profile_image }}
                          style={{
                            width: '100%',
                            height: '90%',
                            alignSelf: 'center',
                            borderRadius: responsiveWidth(5),
                            overflow: 'hidden',
                            backgroundColor: COLORS.black
                          }}
                          imageStyle={{
                            borderRadius: responsiveWidth(5),
                            width: '100%',
                            height: '100%',
                            overflow: 'hidden',
                          }}
                          resizeMode="cover">

                          <LinearGradient colors={[
                            'rgba(0, 0, 0, 0)',
                            'rgba(0, 0, 0, 0)',
                            'rgba(0, 0, 0, 0)',
                            'rgba(0, 0, 0, 0.8)',
                          ]} style={styles.linearGradient}>

                            <Text
                              style={{
                                color: COLORS.white,
                                fontSize: responsiveFontSize(2.5),
                                fontFamily: fonts.PoppinsRegular,
                                fontWeight: 'bold',
                                // marginTop: responsiveHeight(3),
                              }}>
                              {item?.name} <Text
                                style={{
                                  color: COLORS.secondary2,
                                  fontSize: responsiveFontSize(2.2),
                                  fontFamily: fonts.PoppinsRegular,
                                  // marginTop: responsiveHeight(3),
                                }}>
                                {item?.age}
                              </Text>
                            </Text>

                          </LinearGradient>


                        </ImageBackground>
                        <View

                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            width: responsiveWidth(70),
                            alignSelf: 'center',
                            marginVertical: responsiveHeight(2),
                          }}>
                          <PrimaryButton
                            title="No"
                            onPress={() => {
                              refRBSheetList.current.close();
                              const e = {
                                action_response: "CANCEL",
                                with_swap_match_user_id: item?.user_id
                              }
                              addrulletLogData(e);
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
                            title="Yes"
                            onPress={() => {
                              refRBSheetList.current.close();
                              const e = {
                                action_response: "CONFIRM",
                                with_swap_match_user_id: item?.user_id
                              }
                              addrulletLogData(e);

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
                    )
                  })

                }


              </Swiper>
            </View>
          </View>
        </GradientBackground>
      </BottomSheet>
      <View
        style={{
          flex: 1,
          zIndex: 9,
          position: 'absolute',
          width: '100%',
          height: responsiveHeight(100),
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: bothUsersJoined === false
            || loading === false
            ? 'none' : 'flex',
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />

      </View>

      <GradientBackground style={styles.container}>
        {/* <TouchableOpacity
          style={{
            backgroundColor: COLORS.primary,
            width: responsiveWidth(40),
            padding: responsiveWidth(5),
            borderRadius: responsiveWidth(5),
            position: 'absolute',
            bottom: responsiveHeight(15),
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
          onPress={() => {
            initateCall()
          }}
        >
          <Text
            style={{
              color: COLORS.white,
            }}
          >
            INITIATE CALL
          </Text>
        </TouchableOpacity> */}
        {/* <Icon
          name="chevron-left"
          size={responsiveFontSize(2.5)}
          color={COLORS.white}
          style={{
            padding: 15,
            backgroundColor: 'rgba(255, 255, 255, 0.10)',
            borderRadius: responsiveWidth(2),
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.16)',
            overflow: 'hidden',
            position: 'absolute',
            top: responsiveHeight(2),
            left: responsiveWidth(2),
            zIndex: 9999,

          }}
          onPress={() => {
            handleEndCall();
          }}
        /> */}
        <View style={[styles.videoContainer]}>
          <View
            style={{
              flexDirection: 'row',
              marginTop: responsiveHeight(10),
              width: '100%',
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              marginVertical: responsiveHeight(5),
            }}
          >
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(3),
                textAlign: 'center',
                marginRight: responsiveWidth(2),
              }}
            >
              we have found you a caller
            </Text>
            <Icon name="heart" size={responsiveFontSize(3)} color={COLORS.primary} />
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: responsiveHeight(5),
              width: '85%',

            }}
          >


            <Image
              source={{ uri: otherUserImage }}
              style={{
                width: responsiveWidth(40),
                height: responsiveWidth(40),
                borderRadius: responsiveWidth(40),
                marginBottom: responsiveHeight(3),

              }}
            />
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(3),
                textAlign: 'center',
              }}
            >
              {formatTime(remainingTime)} / 10:00
            </Text>
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2),
                textAlign: 'center',
                marginVertical: responsiveHeight(2),
              }}
            >
              Swapping before 10 minutes will allow you to disqualify someone in your existing pool for this caller, you will then be able to see their profile.
            </Text>
          </View>
          {/* {localStream &&
            <View
              style={{
                position: 'absolute',
                bottom: responsiveHeight(5),
                right: 10,
                zIndex: 1,


              }}
            >
              <RTCView streamURL={localStream.toURL()} style={styles.localVideo} objectFit="cover" />

            </View>
          } */}
          {/* {remoteStream && <RTCView streamURL={remoteStream.toURL()} style={styles.remoteVideo} objectFit="cover" />} */}
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={[styles.button, {
            paddingHorizontal: responsiveWidth(5.5),
          }]}
            onPress={toggleMicrophone}
          >
            {isMicMuted ?
              <Microphone

                color={COLORS.white} weight="fill" size={24} />
              :
              <MicrophoneSlash
                color={COLORS.white} weight="fill" size={24} />
            }
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.button}>
            <Icon name="video-camera" size={24} color="white"
              onPress={createOffer}
            />
          </TouchableOpacity> */}

          <TouchableOpacity style={[styles.button, {
            paddingHorizontal: responsiveWidth(5.5),
          }]}
            onPress={switchCamera}
          >
            {isSpeakerEnabled ?
              <SpeakerHigh

                color={COLORS.white} weight="fill" size={24} />
              :
              <SpeakerNone
                color={COLORS.white} weight="fill" size={24} />
            }
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, {
            paddingHorizontal: responsiveWidth(5),
          }]}
            onPress={() => {
              handleEndCall();
              // refRBSheet.current.open();
            }}
          >
            <PhoneDisconnect
              color={COLORS.white} weight="fill" size={24} />
          </TouchableOpacity>


        </View>

      </GradientBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',

  },
  localVideo: {
    width: 170,
    height: 200,
    borderRadius: responsiveWidth(5),
    overflow: 'hidden',
  },
  remoteVideo: {
    width: '100%',
    height: responsiveHeight(100),
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: responsiveHeight(5),
    width: '70%',
    alignSelf: 'center',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: responsiveWidth(25),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    width: responsiveWidth(15),
    height: responsiveWidth(15),
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  wrapper: {

  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: responsiveWidth(5),
    overflow: 'hidden',
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold'
  },
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    padding: 10,
    paddingLeft: 20,
  },
});

export default RulletVoiceCallScreen;
