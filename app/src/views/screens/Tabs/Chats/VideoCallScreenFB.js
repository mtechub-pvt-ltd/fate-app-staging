import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription, RTCPeerConnection } from 'react-native-webrtc';
import { RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription, RTCPeerConnection } from '@daily-co/react-native-webrtc';
import io from 'socket.io-client';
import { node_base_url } from '../../../../consts/baseUrls';

const VideoCallScreen = ({ route, navigation }) => {
  const { currentUser, otherUser } = route.params;
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallIncoming, setIsCallIncoming] = useState(false);
  const peerConnection = useRef(new RTCPeerConnection());
  const socket = useRef(null);

  useEffect(() => {
    console.log('Initializing socket connection...');
    socket.current = io(node_base_url);

    socket.current.on('offer', handleOffer);
    socket.current.on('answer', handleAnswer);
    socket.current.on('iceCandidate', handleIceCandidate);

    startLocalStream();

    return () => {
      if (localStream) localStream.release();
      if (remoteStream) remoteStream.release();
      socket.current.disconnect();
    };
  }, []);

  const startLocalStream = async () => {
    try {
      console.log('Accessing media devices...');
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: 'user' },
      });
      setLocalStream(stream);
      socket.current.emit('joinVideoCall', { user1Id: currentUser, user2Id: otherUser });
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const createRoomName = (userId1, userId2) => {
    const userIds = [userId1, userId2].sort();
    return `room_${userIds[0]}_${userIds[1]}`;
  };

  const handleOffer = async ({ sdpOffer }) => {
    console.log('Handling offer...');
    setIsCallIncoming(true);
    const description = new RTCSessionDescription({ type: 'offer', sdp: sdpOffer });
    await peerConnection.current.setRemoteDescription(description);
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    socket.current.emit('answer', { sdpAnswer: answer.sdp });
  };

  const handleAnswer = async ({ sdpAnswer }) => {
    console.log('Handling answer...');
    const description = new RTCSessionDescription({ type: 'answer', sdp: sdpAnswer });
    await peerConnection.current.setRemoteDescription(description);
    setIsCallIncoming(false);

  };

  const handleIceCandidate = async ({ candidate }) => {
    console.log('Adding ICE candidate...');
    const iceCandidate = new RTCIceCandidate(candidate);
    await peerConnection.current.addIceCandidate(iceCandidate);
  };

  const answerCall = async () => {
    console.log('Answering call...');
    setIsCallIncoming(false);
    // update remote stream
    peerConnection.current.ontrack = ({ streams: [stream] }) => setRemoteStream(stream);
    // create answer
    localStream.getTracks().forEach(track => peerConnection.current.addTrack(track, localStream));



  };

  const createOffer = async () => {
    console.log('Creating offer...');
    localStream.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, localStream);
    });

    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.current.emit('offer', {
        room: createRoomName(currentUser, otherUser),
        offer: offer.sdp,
      });

      peerConnection.current.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.current.emit('iceCandidate', { room: createRoomName(currentUser, otherUser), candidate });
        }
      };
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {localStream && <RTCView streamURL={localStream.toURL()} style={styles.localVideo} />}
        {remoteStream && <RTCView streamURL={remoteStream.toURL()} style={styles.remoteVideo} />}
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={createOffer}>
          <Text style={styles.buttonText}>Start Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={answerCall}>
          <Text style={styles.buttonText}>Answer Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (localStream) localStream.release();
            if (remoteStream) remoteStream.release();
            navigation.goBack();
          }}
        >
          <Text style={styles.buttonText}>End Call</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    width: 150,
    height: 200,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    padding: 15,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default VideoCallScreen;
