import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, PermissionsAndroid,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// import { RTCPeerConnection, RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import { RTCPeerConnection, RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription } from '@daily-co/react-native-webrtc';
import io from 'socket.io-client';
import InCallManager from 'react-native-incall-manager';
import { node_base_url } from '../../../../consts/baseUrls';
import COLORS from '../../../../consts/colors';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import {
  answerTheCall,
  endTheCall,
  initateTheCall
} from '../../../../Services/Auth/SignupService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

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
    // { urls: 'stun:stun.l.google.com:19302' },
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

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);

      return (
        granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true; // Assume permissions are granted on iOS
  };

  const roomName = useRef(`room_${[currentUser, otherUser].sort().join('_')}`);

  // useEffect(() => {


  //   AsyncStorage.removeItem('incomingCall');
  //   AsyncStorage.removeItem('callData');

  //   console.log('Initializing socket connection...');
  //   socket.current = io(node_base_url);
  //   socket.current.emit('joinVideoCall', { user1Id: currentUser, user2Id: otherUser });

  //   // Listen for other user joining and send offer
  //   socket.current.on('user-joined', (data) => {
  //     console.log('Other user has joined the call:', data);
  //     // 
  //     setLoading(false);
  //     setLoadingText('');
  //     createOffer();
  //   });

  //   socket.current.on('offer', handleOffer);
  //   socket.current.on('answer', handleAnswer);
  //   socket.current.on('ice-candidate', handleIceCandidate);
  //   socket.current.on('end-Videocall', () => {
  //     console.log('Other user has ended the call');
  //     peerConnection.current.close();
  //     if (localStream) localStream.release();
  //     if (remoteStream) remoteStream.release();
  //     InCallManager.stop();
  //     setLoading(false);
  //     setLoadingText('');
  //     navigation.goBack();
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
    const initializeCall = async () => {
      // Check and request permissions
      const permissionsGranted = await requestPermissions();
      if (!permissionsGranted) {
        Alert.alert(
          'Permissions Required',
          'Camera and microphone permissions are needed to make a video call.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      AsyncStorage.removeItem('incomingCall');
      AsyncStorage.removeItem('callData');

      console.log('Initializing socket connection...');
      socket.current = io(node_base_url);
      socket.current.emit('joinVideoCall', { user1Id: currentUser, user2Id: otherUser });

      socket.current.on('user-joined', (data) => {
        console.log('Other user has joined the call:', data);
        setLoading(false);
        setLoadingText('');
        createOffer();
      });

      socket.current.on('offer', handleOffer);
      socket.current.on('answer', handleAnswer);
      socket.current.on('ice-candidate', handleIceCandidate);
      socket.current.on('end-Videocall', () => {
        console.log('Other user has ended the call');
        peerConnection.current.close();
        if (localStream) localStream.release();
        if (remoteStream) remoteStream.release();
        InCallManager.stop();
        setLoading(false);
        setLoadingText('');
        navigation.goBack();
      });

      // Start local stream after permissions are granted
      await startLocalStream();

      console.log('from notification:', fromNotification);
      if (!fromNotification) {
        initateCall();
      }
    };

    initializeCall();

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
      const stream = await mediaDevices.getUserMedia({
        audio: true, video: {
          width: { ideal: 640 }, // Set width to 640 for 480p
          height: { ideal: 480 }, // Set height to 480 for 480p
          facingMode: 'user'
        }
      });
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
        socket.current.emit('ice-candidate', { room: roomName.current, candidate: event.candidate });
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
      socket.current.emit('answer', { room: roomName.current, answer });

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
        call_type: 'VIDEO',
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
      socket.current.emit('offer', { room: roomName.current, offer });
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
    socket.current.emit('end-Videocall', { room: roomName.current });
    setLoading(true);
    setLoadingText('Ending call...');
    const data = {
      chat_room_name: roomName.current,
      call_type: 'VIDEO',
    }
    const endCall = await endTheCall(data);
    console.log('endCall:', endCall);
    peerConnection.current.close();
    if (localStream) localStream.release();
    if (remoteStream) remoteStream.release();
    InCallManager.stop();
    setLoading(false);
    setLoadingText('');
    navigation.goBack();
  };
  const initateCall = async () => {

    setLoading(true);
    setLoadingText(`Initiating & Connecting ${'\n'} call with ${otherUserName}...`);
    const data = {
      callerId: currentUser,
      receiverId: otherUser,
      callType: 'VIDEO', // or 'AUDIO'
    }
    const response = await initateTheCall(data);
    console.log('response:', response);


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
        <View style={styles.videoContainer}>
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
          {localStream &&
            <View
              style={{
                position: 'absolute',
                bottom:
                  Platform.OS === 'ios' ? responsiveHeight(5) :
                    0,
                right: 10,
              }}
            >
              <RTCView streamURL={localStream.toURL()} style={[styles.localVideo,
              Platform.OS === 'ios' ? { transform: [{ scaleX: -1 }] } : {
                zIndex: 2
              },
              ]} objectFit="cover" />

            </View>
          }
          {remoteStream && <RTCView streamURL={remoteStream.toURL()} style={[styles.remoteVideo, { zIndex: -1 }]} objectFit="cover" />}
        </View>
        <View style={styles.buttonsContainer}>
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
            onPress={switchCamera}
          >
            <Icon name="rotate-right" size={24} color="white" />
          </TouchableOpacity>
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

      </View>
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
