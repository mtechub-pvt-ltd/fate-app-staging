import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView
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
  endTheCall,
  initateTheCall,
  reportUser,
  blockUser
} from '../../../../Services/Auth/SignupService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';

import CryptoJS from 'crypto-js';
import fonts from '../../../../consts/fonts';

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
  // iceServers: [
  //   {
  //     urls: 'turn:fate-webrtc.mtechub.com:3478', // Replace with your TURN server URL
  //     username: 'username', // Generated username
  //     credential: 'password', // Generated password
  //   },
  //   {
  //     urls: "stun:stun.relay.metered.ca:80",
  //   },
  //   {
  //     urls: "turn:global.relay.metered.ca:80",
  //     username: "8de48e93590f8556378b77c2",
  //     credential: "bvcYVdciDKoMnW98",
  //   },
  //   {
  //     urls: "turn:global.relay.metered.ca:80?transport=tcp",
  //     username: "8de48e93590f8556378b77c2",
  //     credential: "bvcYVdciDKoMnW98",
  //   },
  //   {
  //     urls: "turn:global.relay.metered.ca:443",
  //     username: "8de48e93590f8556378b77c2",
  //     credential: "bvcYVdciDKoMnW98",
  //   },
  //   {
  //     urls: "turns:global.relay.metered.ca:443?transport=tcp",
  //     username: "8de48e93590f8556378b77c2",
  //     credential: "bvcYVdciDKoMnW98",
  //   }
  //   // { urls: 'stun:stun.l.google.com:19302' },
  // ],
  iceServers: [
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:global.relay.metered.ca:80",
      username: "0de4cc0fe2881b4e951fa749",
      credential: "S43gaASQtB8djAK/",
    },
    {
      urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username: "0de4cc0fe2881b4e951fa749",
      credential: "S43gaASQtB8djAK/",
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "0de4cc0fe2881b4e951fa749",
      credential: "S43gaASQtB8djAK/",
    },
    {
      urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username: "0de4cc0fe2881b4e951fa749",
      credential: "S43gaASQtB8djAK/",
    },
  ],
};


const VideoCallScreen = ({ route, navigation }) => {
  const { currentUser, otherUser, otherUserName, otherUserImage, fromNotification } = route.params;

  const refRBSheet = useRef();
  const refMenuSheet = useRef();
  const refBlockSheet = useRef();
  const [reason, setReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  // report user
  const handleReportUser = async () => {
    setReportLoading(true);
    if (reason === '') {
      alert('Please enter reason');
      setReportLoading(false);
      return;
    }
    try {
      const data = {
        reported_by_user_id: currentUser,
        reported_user_id: otherUser,
        reason: reason,
      };
      console.log('report user data:', data);
      const response = await reportUser(data);
      setReportLoading(false);
      if (!response?.error) {
        alert('User reported successfully');
        refRBSheet.current.close();
        handleEndCall();
        navigation.goBack();
      } else {
        alert('Failed to report user. Please try again.');
      }
    } catch (error) {
      setReportLoading(false);
      console.error('Error reporting user:', error);
    }
  };

  // block user
  const handleBlockUser = async () => {
    setBlockLoading(true);
    try {
      const data = {
        blocked_by_user_id: currentUser,
        blocked_user_id: otherUser,
        reason: '', // Empty reason for block user
      };
      const response = await blockUser(data);
      setBlockLoading(false);
      if (!response?.error) {
        alert('User blocked successfully');
        refBlockSheet.current.close();
        handleEndCall();
        navigation.goBack();
      } else {
        alert('Failed to block user. Please try again.');
      }
    } catch (error) {
      setBlockLoading(false);
      console.error('Error blocking user:', error);
    }
  };


  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Connecting...');
  const peerConnection = useRef(new RTCPeerConnection(configuration));
  const socket = useRef(null);
  const roomName = useRef(`room_${[currentUser, otherUser].sort().join('_')}`);

  useEffect(() => {


    AsyncStorage.removeItem('incomingCall');
    AsyncStorage.removeItem('callData');

    console.log('Initializing socket connection...');
    socket.current = io(node_base_url);
    socket.current.emit('joinAudioCall', { user1Id: currentUser, user2Id: otherUser });

    // Listen for other user joining and send offer
    socket.current.on('user-audio-joined', (data) => {
      console.log('Other user has joined the call:', data);
      // 
      setLoading(false);
      setLoadingText('');
      createOffer();
    });

    socket.current.on('offer-audio', handleOffer);
    socket.current.on('answer-audio', handleAnswer);
    socket.current.on('ice-audio-candidate', handleIceCandidate);
    socket.current.on('end-Audiocall', () => {
      console.log('Other user has ended the call');
      peerConnection.current.close();
      if (localStream) localStream.release();
      if (remoteStream) remoteStream.release();
      InCallManager.stop();
      setLoading(false);
      setLoadingText('');
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
    });

    startLocalStream();
    // after startLocalStream() initiate call

    console.log('from notification:', fromNotification);
    if (!fromNotification) {
      // disable call for time being
      initateCall();
    }

    return () => {
      console.log('Cleaning up...');
      peerConnection.current.close();
      if (localStream) localStream.release();
      if (remoteStream) remoteStream.release();
      socket.current.disconnect();
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
  const handleEndCall = async () => {
    // emit end call event
    socket.current.emit('end-Audiocall', { room: roomName.current });
    setLoading(true);
    setLoadingText('Ending call...');
    const data = {
      chat_room_name: roomName.current,
      call_type: 'AUDIO',
    }
    const endCall = await endTheCall(data);
    console.log('endCall:', endCall);
    peerConnection.current.close();
    if (localStream) localStream.release();
    if (remoteStream) remoteStream.release();
    InCallManager.stop();
    setLoading(false);
    setLoadingText('');
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
  const toggleSpeaker = () => {
    const newState = !isSpeakerEnabled;
    setIsSpeakerEnabled(newState);
    InCallManager.setForceSpeakerphoneOn(newState); // Enable or disable speakerphone
    InCallManager.setSpeakerphoneOn(newState); // Compatibility for Android
  };

  return (
    <GradientBackground>
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: responsiveHeight(6),
          right: responsiveWidth(5),
          zIndex: 9999,
          backgroundColor: 'rgba(255, 255, 255, 0.10)',
          borderRadius: 30,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.16)',
          padding: responsiveWidth(4),
          paddingHorizontal: responsiveWidth(5),
        }}
        onPress={() => {
          refMenuSheet.current.open();
        }}
      >
        <Icon
          name="ellipsis-v"
          size={responsiveFontSize(2)}
          color={COLORS.white}
        />
      </TouchableOpacity>
      <View
        style={{
          flex: 1,
          // backgroundColor: COLORS.black,
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
            top: responsiveHeight(6),
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
      <View style={[styles.container, {
        display: loading ? 'none' : 'flex',
      }]}>
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
              top: responsiveHeight(7),
              left: responsiveWidth(5),
              zIndex: 9999,

            }}
            onPress={() => {
              handleEndCall();
            }}
          />

          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
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
                fontSize: responsiveFontSize(4),
                textAlign: 'center',
              }}
            >{otherUserName}</Text>
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
        <View style={[styles.buttonsContainer, {
          display: loading ? 'none' : 'flex',
        }]}>
          <TouchableOpacity style={[styles.button, {
            // paddingHorizontal: responsiveWidth(5.5),
          }]}
            onPress={toggleMicrophone}
          >
            <Icon name={isMicMuted ? "microphone-slash" : "microphone"} size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, {
              // paddingHorizontal: responsiveWidth(5),
            }]}
            onPress={toggleSpeaker}
          >
            <Icon
              name={!isSpeakerEnabled ? "volume-up" : "volume-off"} // Adjust the icon based on the state
              size={24}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, {
            // paddingHorizontal: responsiveWidth(5),
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

      </View>

      {/* Report User Bottom Sheet */}
      <BottomSheet height={responsiveHeight(60)} ref={refRBSheet}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{
            marginTop: responsiveHeight(3),
          }}>
            <Text style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2.5),
              fontFamily: fonts.PoppinsMedium,
              textAlign: 'center',
              width: responsiveWidth(70),
              marginVertical: responsiveHeight(2),
              alignSelf: 'center',
            }}>
              Are you sure you want to{'\n'} report this user?
            </Text>
            <CustomInput
              mainContainerStyle={{
                marginTop: responsiveHeight(2),
              }}
              title="Add Reason"
              titleStyle={{
                marginBottom: responsiveHeight(1),
              }}
              autoCapitalize="none"
              keyboardType="default"
              multiline={true}
              onChangeText={setReason}
              style={{
                height: responsiveHeight(15),
                backgroundColor: '#FFFFFF29',
                width: responsiveWidth(90),
                color: COLORS.white,
                fontFamily: fonts.PoppinsRegular,
                fontSize: responsiveFontSize(2),
                borderRadius: 15,
                padding: responsiveWidth(3),
              }}
            />
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              width: responsiveWidth(70),
              alignSelf: 'center',
              marginTop: responsiveHeight(2),
              marginBottom: responsiveHeight(2),
            }}>
              <PrimaryButton
                title="Cancel"
                onPress={() => refRBSheet.current.close()}
                style={{
                  alignSelf: 'center',
                  width: responsiveWidth(30),
                  backgroundColor: COLORS.primary,
                  padding: 0,
                }}
              />
              <PrimaryButton
                title="Confirm"
                onPress={handleReportUser}
                style={{
                  alignSelf: 'center',
                  width: responsiveWidth(30),
                  padding: 0,
                }}
                loading={reportLoading}
              />
            </View>
          </View>
        </ScrollView>
      </BottomSheet>

      {/* Menu Bottom Sheet */}
      <BottomSheet height={responsiveHeight(30)} ref={refMenuSheet}>
        <View style={{ marginTop: responsiveHeight(3), paddingHorizontal: responsiveWidth(5) }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: responsiveHeight(2),
              paddingHorizontal: responsiveWidth(5),
              marginBottom: responsiveHeight(1),
              borderRadius: 15,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
            onPress={() => {
              refMenuSheet.current.close();
              setTimeout(() => refBlockSheet.current.open(), 300);
            }}
          >
            <Icon name="ban" size={responsiveFontSize(2.5)} color={COLORS.white} />
            <Text style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2.2),
              fontFamily: fonts.PoppinsMedium,
              marginLeft: responsiveWidth(4),
            }}>
              Block User
            </Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              borderRadius: 15,
              borderWidth: 1,
              borderColor: COLORS.greylight
            }}
          />
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: responsiveHeight(2),
              paddingHorizontal: responsiveWidth(5),
              marginBottom: responsiveHeight(2),
              borderRadius: 15,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
            onPress={() => {
              refMenuSheet.current.close();
              setTimeout(() => refRBSheet.current.open(), 300);
            }}
          >
            <Icon name="flag" size={responsiveFontSize(2.5)} color={COLORS.white} />
            <Text style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2.2),
              fontFamily: fonts.PoppinsMedium,
              marginLeft: responsiveWidth(4),
            }}>
              Report User
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Block User Bottom Sheet */}
      <BottomSheet height={responsiveHeight(50)} ref={refBlockSheet}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ marginTop: responsiveHeight(3) }}>
            <Icon
              name="ban"
              size={responsiveFontSize(3.5)}
              color={COLORS.white}
              style={{ alignSelf: 'center' }}
            />
            <Text style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2.5),
              fontFamily: fonts.PoppinsMedium,
              textAlign: 'center',
              width: responsiveWidth(70),
              marginVertical: responsiveHeight(2),
              alignSelf: 'center',
            }}>
              Are you sure you want to{'\n'} block this user?
            </Text>
            <Text style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(1.5),
              fontFamily: fonts.PoppinsMedium,
              textAlign: 'center',
              width: responsiveWidth(70),
              alignSelf: 'center',
            }}>
              Blocking a user will prevent you and them from sending you messages or viewing your profile.
            </Text>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              width: responsiveWidth(70),
              alignSelf: 'center',
              marginTop: responsiveHeight(2),
              marginBottom: responsiveHeight(2),
            }}>
              <PrimaryButton
                title="Cancel"
                onPress={() => refBlockSheet.current.close()}
                style={{
                  alignSelf: 'center',
                  width: responsiveWidth(30),
                  backgroundColor: COLORS.primary,
                  padding: 0,
                }}
              />
              <PrimaryButton
                title="Block"
                onPress={handleBlockUser}
                style={{
                  alignSelf: 'center',
                  width: responsiveWidth(30),
                  padding: 0,
                }}
                loading={blockLoading}
              />
            </View>
          </View>
        </ScrollView>
      </BottomSheet>
    </GradientBackground >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    // padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: responsiveWidth(15),
    borderWidth: 1,
    width: responsiveWidth(15),
    height: responsiveWidth(15),
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default VideoCallScreen;
