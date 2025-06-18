import React, { useEffect, useRef, useState } from 'react';
import {
  View, TouchableOpacity, StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// import { RTCPeerConnection, mediaDevices, RTCSessionDescription } from 'react-native-webrtc';
import { RTCPeerConnection, mediaDevices, RTCSessionDescription } from '@daily-co/react-native-webrtc';
import io from 'socket.io-client';
import InCallManager from 'react-native-incall-manager';
import { node_base_url } from '../../../../consts/baseUrls';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';






const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:your.turn.server:3478', username: 'yourUsername', credential: 'yourCredential' },
  ],
};

const StartingCall = ({ route, navigation }) => {
  const { currentUser, otherUser, otherUserName, otherUserImage } = route.params;
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const peerConnection = useRef(new RTCPeerConnection(configuration));
  const socket = useRef(null);
  const roomName = useRef(`room_${[currentUser, otherUser].sort().join('_')}`);

  useEffect(() => {
    console.log('Initializing socket connection...');
    socket.current = io(node_base_url);
    socket.current.emit('joinVideoCall', { user1Id: currentUser, user2Id: otherUser });
    socket.current.on('offer', handleOffer);
    socket.current.on('answer', handleAnswer);
    socket.current.on('ice-candidate', handleIceCandidate);

    startLocalStream();

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
        socket.current.emit('ice-candidate', { room: roomName.current, candidate: event.candidate });
      }
    };
  };

  const handleOffer = async ({ offer }) => {
    console.log('Received offer:', offer);
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


  const handleEndCall = async () => {

  };
  return (
    <>

      <View style={[styles.container, {

      }]}>


        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={[styles.button, {
            paddingHorizontal: responsiveWidth(5.5),
          }]}
            onPress={toggleMicrophone}
          >
            <Icon name={isMicMuted ? "microphone-slash" : "microphone"} size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Icon name="video-camera" size={24} color="white"
              onPress={createOffer}
            />
          </TouchableOpacity>
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

export default StartingCall;
