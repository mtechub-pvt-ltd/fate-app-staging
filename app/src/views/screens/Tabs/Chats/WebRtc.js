import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import io from 'socket.io-client';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCView,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';

const configuration = { "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }] };
let socket;
let pc;

const WebRtc = () => {
  const [name, setName] = useState('');
  const [users, setUsers] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    socket = io('http://192.168.18.82:3000');
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection failed:', error);
    });
    socket.on('users', users => {
      setUsers(users.filter(user => user !== name));
    });
    socket.on('incomingCall', async ({ offer, from }) => {
      Alert.alert(
        "Incoming Call",
        `Call from ${from}`,
        [
          { text: "Reject", onPress: () => console.log("Call rejected"), style: "cancel" },
          {
            text: "Accept", onPress: async () => {
              console.log("Call accepted");
              await startConnection(false); // false for using front camera for local stream
              pc.setRemoteDescription(new RTCSessionDescription(offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              socket.emit('answer', { answer, to: from });
            }
          },
        ]
      );
    });
    socket.on('answer', ({ answer }) => {
      pc.setRemoteDescription(new RTCSessionDescription(answer));
    });
    socket.on('candidate', async ({ candidate }) => {
      if (candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
    return () => socket.disconnect();
  }, []);

  const getMediaStream = async (useBackCamera) => {
    const devices = await mediaDevices.enumerateDevices();
    const videoSourceId = devices.find(device => device.kind === "videoinput" && device.facing === (useBackCamera ? "environment" : "user"));

    const constraints = {
      audio: true,
      video: {
        mandatory: {
          minWidth: 500, // Provide your own width, height, and frame rate here
          minHeight: 300,
          minFrameRate: 30
        },
        facingMode: useBackCamera ? "environment" : "user",
        optional: (videoSourceId ? [{ sourceId: videoSourceId.deviceId }] : [])
      }
    };

    return await mediaDevices.getUserMedia(constraints);
  };

  const startConnection = async (isLocal) => {
    pc = new RTCPeerConnection(configuration);
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit('candidate', { candidate, to: name });
      }
    };
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        console.log('Remote stream added.');
        setRemoteStream(event.streams[0]);
      }
    };

    const stream = await getMediaStream(isLocal);
    console.log('Stream found', stream);
    setLocalStream(stream);
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
  };

  const login = () => {
    socket.emit('register', { name });
    setLoggedIn(true);
  };

  const callUser = async (user) => {
    await startConnection(true); // true for using back camera for remote stream
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('call', { offer, to: user });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {!loggedIn ? (
        <>
          <TextInput
            style={{
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              width: 200,
              marginBottom: 20,
            }}
            placeholder="Enter your name"
            onChangeText={setName}
            value={name}
          />
          <Button title="Login" onPress={login} />
        </>
      ) : (
        <>
          <Text>Local Stream:</Text>
          {localStream && <RTCView streamURL={localStream.toURL()} style={{ width: 100, height: 150 }} />}
          <Text>Remote Stream:</Text>
          {remoteStream && <RTCView streamURL={remoteStream.toURL()} style={{ width: 100, height: 150 }} />}
          {users.map(user => (
            <Button key={user} title={`Call ${user}`} onPress={() => callUser(user)} />
          ))}
        </>
      )}
    </View>
  );
};

export default WebRtc;
