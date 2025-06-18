import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, Platform,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// import { RTCPeerConnection, mediaDevices, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import { RTCPeerConnection, mediaDevices, RTCIceCandidate, RTCSessionDescription } from '@daily-co/react-native-webrtc';
import io from 'socket.io-client';
import InCallManager from 'react-native-incall-manager';
import { node_base_url } from '../../../../consts/baseUrls';
import COLORS from '../../../../consts/colors';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import {
  answerTheCall,
  initateRulletCall
} from '../../../../Services/Auth/SignupService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import { BlurView } from '@react-native-community/blur';




const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:your.turn.server:3478', username: 'yourUsername', credential: 'yourCredential' },
  ],
};

const VideoCallScreen = ({ route, navigation }) => {
  const { currentUser, otherUser, otherUserName, otherUserImage, fromNotification } = route.params;
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('');
  const peerConnection = useRef(new RTCPeerConnection(configuration));
  const socket = useRef(null);
  const roomName = useRef(`room_${[currentUser, otherUser].sort().join('_')}`);

  // useEffect(() => {


  //   AsyncStorage.removeItem('incomingCall');
  //   AsyncStorage.removeItem('callData');

  //   console.log('Initializing socket connection...');
  //   socket.current = io(node_base_url);
  //   socket.current.emit('joinAudioCall', { user1Id: currentUser, user2Id: otherUser });

  //   // Listen for other user joining and send offer
  //   socket.current.on('user-audio-joined', (data) => {
  //     console.log('Other user has joined the call:', data);

  //     // deleteToken  
  //     // get current user token
  //     const getUser =  await getUserDetail();
  //     const userDetail = getUser.data;

  //     setLoading(false);
  //     setLoadingText('');
  //     createOffer();
  //   });

  //   socket.current.on('offer-audio', handleOffer);
  //   socket.current.on('answer-audio', handleAnswer);
  //   socket.current.on('ice-audio-candidate', handleIceCandidate);
  //   socket.current.on('end-rullet-Audiocall', (data) => {
  //     console.log('Other user has ended the call', data);
  //     peerConnection.current.close();
  //     if (localStream) localStream.release();
  //     if (remoteStream) remoteStream.release();
  //     InCallManager.stop();
  //     setLoading(false);
  //     setLoadingText('');
  //     if (data.endType === 'TIMEOUT') {
  //       navigation.navigate('DecisionMatch', {
  //         currentUser: currentUser,
  //         otherUser: otherUser,
  //         otherUserName: otherUserName,
  //         otherUserImage: otherUserImage,
  //       })
  //     } else {
  //       navigation.goBack();
  //     }
  //   });

  //   startLocalStream();
  //   // after startLocalStream() initiate call

  //   console.log('from notification:', fromNotification);
  //   if (!fromNotification) {
  //     initateCall();
  //   }

  //   return () => {
  //     console.log('Cleaning up...');
  //     peerConnection.current.close();
  //     if (localStream) localStream.release();
  //     if (remoteStream) remoteStream.release();
  //     socket.current.disconnect();
  //   };
  // }, []);


  useEffect(() => {
    const initializeSocketConnection = async () => {
      AsyncStorage.removeItem('incomingCall');
      AsyncStorage.removeItem('callData');

      console.log('Initializing socket connection...');
      socket.current = io(node_base_url);
      socket.current.emit('joinAudioCall', { user1Id: currentUser, user2Id: otherUser });

      // Ensure only one listener for these events
      socket.current.on('user-audio-joined', handleUserJoined);
      socket.current.on('offer-audio', handleOffer);
      socket.current.on('answer-audio', handleAnswer);
      socket.current.on('ice-audio-candidate', handleIceCandidate);
      socket.current.on('end-rullet-Audiocall', handleEndCallEvent);

      await startLocalStream();
      console.log('from notification:', fromNotification);

      if (!fromNotification) {
        await initateCall();
      }
    };

    initializeSocketConnection();

    return () => {
      console.log('Cleaning up...');
      if (peerConnection.current) peerConnection.current.close();
      if (localStream) localStream.release();
      if (remoteStream) remoteStream.release();
      if (socket.current) socket.current.disconnect();
    };
  }, []);




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

  const handleIceCandidate = ({ candidate }) => {
    console.log('Received ICE candidate:', candidate);

    try {
      peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
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
  const handleEndCall = async (type) => {
    // emit end call event
    socket.current.emit('end-rullet-Audiocall', {
      room: roomName.current,
      endType: type ? type : null,
    });
    setLoading(true);
    setLoadingText('Ending call...');
    // const data = {
    //   chat_room_name: roomName.current,
    //   call_type: 'AUDIO',
    // }
    // const endCall = await endTheCall(data);
    // console.log('endCall:', endCall);
    peerConnection.current.close();
    if (localStream) localStream.release();
    if (remoteStream) remoteStream.release();
    InCallManager.stop();

    setLoading(false);
    setLoadingText('');

    if (type === 'TIMEOUT') {
      navigation.navigate('DecisionMatch', {
        currentUser: currentUser,
        otherUser: otherUser,
        otherUserName: otherUserName,
        otherUserImage: otherUserImage,
      })
    } else {
      // navigation.goBack();
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'MyTabs',
            params: {
              screen: 'Home',
            },
          },
        ],
      });

    }

  };
  const initateCall = async () => {

    setLoading(true);
    setLoadingText(`Initiating & Connecting ${'\n'} call with ${otherUserName}...`);
    const data = {
      callerId: currentUser,
      receiverId: otherUser,
      callType: 'RULLET-AUDIO', // or 'AUDIO'
    }
    const response = await initateRulletCall(data);
    console.log('response:', response);


  };


  // Function to format seconds into MM:SS

  const [timer, setTimer] = useState(null);
  // total time in seconds for the call 10 minutes
  // const totalTimeInSeconds = 10 * 60;


  // total time in seconds for the call 10 seconds
  const totalTimeInSeconds = 50;
  const [remainingTime, setRemainingTime] = useState(totalTimeInSeconds);
  const [isTimerActive, setIsTimerActive] = useState(true);

  useEffect(() => {
    const startTimer = () => {
      setIsTimerActive(true);
      setRemainingTime(totalTimeInSeconds);

      const timerId = setInterval(() => {
        setRemainingTime(prevTime => {
          if (prevTime <= 0) {
            clearInterval(timerId);
            setIsTimerActive(false);

            handleEndCall('TIMEOUT');
          }
          return prevTime - 1;
        });
      }, 1000);

      setTimer(timerId);
    };

    startTimer();

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.black,
          alignContent: 'center',
          justifyContent: 'center',
          display: loading ? 'flex' : 'none',
        }}
      >
        <Icon
          name="chevron-left"
          size={responsiveFontSize(2.5)}
          color={COLORS.white}
          style={{
            padding: 15,
            backgroundColor: 'rgba(255, 255, 255, 0.10)',
            borderRadius: responsiveWidth(5),
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.16)',
            overflow: 'hidden',
            position: 'absolute',
            top: responsiveHeight(7),
            left: responsiveWidth(5),
            zIndex: 9999,
            display:
              // display if loaidng text has words initiating or connecting
              loadingText.includes('Initiating') || loadingText.includes('Connecting') ? 'flex' : 'none'
            ,
          }}
          onPress={() => {
            handleEndCall();
          }}
        />
        <ActivityIndicator size="large" color="white" />
        <Text
          style={{
            color: COLORS.white,
            fontSize: responsiveFontSize(2),
            textAlign: 'center',
            lineHeight: responsiveFontSize(3),
            marginTop: responsiveHeight(2),
          }}
        >
          {loadingText}
        </Text>
      </View>
      <GradientBackground style={[styles.container, {
        display: loading ? 'none' : 'flex',
      }]}>


        <View style={[styles.videoContainer, {
          display: loading ? 'none' : 'flex',
        }]}>
          <Icon
            name="chevron-left"
            size={responsiveFontSize(2.5)}
            color={COLORS.white}
            style={{
              padding: 15,
              backgroundColor: 'rgba(255, 255, 255, 0.10)',
              borderRadius: responsiveWidth(5),
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.16)',
              overflow: 'hidden',
              position: 'absolute',
              top: Platform.OS === 'ios' ? responsiveHeight(7) :
                responsiveHeight(3),
              left: responsiveWidth(5),
              zIndex: 9999,

            }}
            onPress={() => {
              handleEndCall();
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              width: responsiveWidth(90),
              // marginTop: Platform.OS === 'ios' ? responsiveHeight(6) : responsiveHeight(2),
              alignItems: 'center',
              paddingHorizontal: responsiveWidth(2),
              paddingVertical: responsiveHeight(5),
            }}>
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(4),
                fontWeight: '600',
                alignItems: 'center',
                alignContent: 'center',
              }}>
              We’ve found you a caller  <Icon name="heart"
                style={{
                  marginLeft: responsiveWidth(2),
                  padding: responsiveWidth(2),
                  color: COLORS.primary,

                }}
                size={responsiveFontSize(3)}
              />
            </Text>

          </View>


          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <BlurView
              style={{
                width: responsiveWidth(40),
                height: responsiveWidth(40),
                borderRadius: 60,
                display: Platform.OS === 'ios' ? 'flex' : 'none',
              }}
              overlayColor={"#00000000"}
              blurType="light"
              blurAmount={10}
            >
              <Image
                source={{ uri: otherUserImage }}
                style={{
                  width: responsiveWidth(40),
                  height: responsiveWidth(40),
                  borderRadius: responsiveWidth(40),
                  marginBottom: responsiveHeight(3),
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
              }}
            >
              <Image
                source={{ uri: otherUserImage }}
                style={{

                  borderRadius: responsiveWidth(40),
                  marginBottom: responsiveHeight(3),

                }}
              />
            </View>
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(4),
                textAlign: 'center',
              }}
            >{otherUserName}
              TEFEgr
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              width: responsiveWidth(90),
              // marginTop: Platform.OS === 'ios' ? responsiveHeight(6) : responsiveHeight(2),
              alignItems: 'center',
              paddingHorizontal: responsiveWidth(2),
              paddingVertical: responsiveHeight(2),
            }}>
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(3),
                fontWeight: '600',
                alignItems: 'center',
                alignContent: 'center',
              }}>
              {formatTime(remainingTime)} / {formatTime(totalTimeInSeconds)}
            </Text>
          </View>
          <PrimaryButton
            loading={loading}
            textColor={COLORS.primary}
            title="Swap"
            onPress={() => {
              handleEndCall();
              navigation.navigate('Premiums');
              // getFateRulletUserForCall();
            }}
            style={{
              // marginTop: responsiveHeight(5),
              alignSelf: 'center',
              width: responsiveWidth(40),
              backgroundColor: COLORS.white,
              padding: 0,
            }}
            icon="sync"
          />
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
        <View style={[styles.buttonsContainer, {
          display: loading ? 'none' : 'flex',
        }]}>
          <TouchableOpacity style={[styles.button, {
            paddingHorizontal: responsiveWidth(5.5),
          }]}
            onPress={toggleMicrophone}
          >
            <Icon name={isMicMuted ? "microphone-slash" : "microphone"} size={24} color="white" />
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.button}>
            <Icon name="video-camera" size={24} color="white"
              onPress={createOffer}
            />
          </TouchableOpacity> */}

          <TouchableOpacity style={[styles.button, {
            paddingHorizontal: responsiveWidth(5),
          }]}
            onPress={() => {
              handleEndCall();
            }}
          >
            <Icon name="phone"
              style={{
                // rotation: 90,
                transform: [{ rotate: '130deg' }],

              }}
              size={26} color="white" />
          </TouchableOpacity>


        </View>

      </GradientBackground>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
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
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: responsiveWidth(15),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default VideoCallScreen;
