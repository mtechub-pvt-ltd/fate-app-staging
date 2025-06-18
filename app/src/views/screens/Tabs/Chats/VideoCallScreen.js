import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, PermissionsAndroid,
  ActivityIndicator, ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// import {RTCPeerConnection, RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription, peerConnection } from 'react-native-webrtc';
import { RTCPeerConnection, RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription, peerConnection } from '@daily-co/react-native-webrtc';
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
import CryptoJS from 'crypto-js';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
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


const setBandwidthConstraints = () => {
  const bandwidthConstraints = { audio: { bitrate: 50 }, video: { bitrate: 250 } }; // kbps
  peerConnection.current.getSenders().forEach(sender => {
    if (sender.track.kind === 'video') {
      const parameters = sender.getParameters();
      if (!parameters.encodings) parameters.encodings = [{}];
      parameters.encodings[0].maxBitrate = bandwidthConstraints.video.bitrate * 1000;
      sender.setParameters(parameters);
    }
  });
};

const configuration = {
  iceServers: [

    // { urls: 'turn:your.turn.server:3478', username: 'yourUsername', credential: 'yourCredential' },

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

const VideoCallScreen = React.memo(({ route, navigation }) => {
  const { currentUser, otherUser, otherUserName, otherUserImage, fromNotification } = route.params || {};

  const refRBSheet = useRef();
  const refMenuSheet = useRef();
  const refBlockSheet = useRef();
  const [reason, setReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

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
        handleEndCall();
        alert('User reported successfully');
        refRBSheet.current.close();
        navigation.navigate('MyTabs', {
          screen: 'HomePage',
          params: { isUpdated: true },
        });
      } else {
        alert('Failed to report user. Please try again.');
      }
    } catch (error) {
      setReportLoading(false);
      console.error('Error reporting user:', error);
    }
  };

  const handleBlockUser = async () => {
    setBlockLoading(true);
    try {
      const data = {
        blocked_by_user_id: currentUser,
        blocked_user_id: otherUser,
      };
      console.log('block user data:', data);
      const response = await blockUser(data);
      setBlockLoading(false);
      if (!response?.error) {
        handleEndCall();
        alert('User blocked successfully');
        refBlockSheet.current.close();
        navigation.navigate('MyTabs', {
          screen: 'HomePage',
          params: { isUpdated: true },
        });
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
      socket.current.off('user-joined', createOffer);
      socket.current.off('offer', handleOffer);
      socket.current.off('answer', handleAnswer);
      socket.current.off('ice-candidate', handleIceCandidate);
      socket.current.off('end-Videocall', handleEndCall);
      peerConnection.current.close();
      if (localStream) localStream.release();
      if (remoteStream) remoteStream.release();
      socket.current.disconnect();
    };
  }, []);


  const startLocalStream = useCallback(async () => {
    try {
      console.log('Accessing media devices...');
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      setLocalStream(stream);
      InCallManager.start({ media: 'video' });
      // 
      InCallManager.setForceSpeakerphoneOn(true);
      initPeerConnection(stream);
      // setTimeout(() => {
      //   setBandwidthConstraints();
      // }, 2000);

    } catch (error) {
      console.error('Error accessing media devices:', error);

      peerConnection.current.close();
      if (localStream) localStream.release();
      if (remoteStream) remoteStream.release();
      navigation.goBack();
      // goBack();

    }
  }, []);

  const initPeerConnection = (stream) => {
    console.log('Initializing peer connection...');
    stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

    peerConnection.current.ontrack = (event) => {
      console.log('Remote stream received:', event.streams[0]);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        setLoading(false); // Hide loading once remote stream is available
        InCallManager.setForceSpeakerphoneOn(true);

      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate:', event.candidate);
        socket.current.emit('ice-candidate', { room: roomName.current, candidate: event.candidate });
      }
    };
    // Add the iceConnectionState change listener here
    peerConnection.current.oniceconnectionstatechange = () => {
      const state = peerConnection.current.iceConnectionState;
      console.log(`ICE connection state: ${state}`);
      if (state === 'failed' || state === 'disconnected') {
        Alert.alert('Connection Issue', 'The connection was lost. Attempting to reconnect...');
        // Optionally, add reconnection logic here
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
              top: responsiveHeight(5),
              left: responsiveWidth(5),
              zIndex: 9999,

            }}
            onPress={() => {
              handleEndCall();
            }}
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: responsiveHeight(7),
              right: responsiveWidth(5),
              zIndex: 9999,
              backgroundColor: 'rgba(255, 255, 255, 0.10)',
              borderRadius: 30,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.16)',
              padding: responsiveWidth(2),
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
          {localStream &&
            <View
              style={{
                position: 'absolute',
                bottom:
                  Platform.OS === 'ios' ? responsiveHeight(5) :
                    0,
                right: 10,
                zIndex: 9999
              }}
            >
              <RTCView streamURL={localStream.toURL()} style={styles.localVideo} objectFit="cover" />

            </View>
          }
          {remoteStream && <RTCView streamURL={remoteStream.toURL()} style={[styles.remoteVideo, { zIndex: -999 }]} objectFit="cover" />}
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={[styles.button, {
            // paddingHorizontal: responsiveWidth(5.5),
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
            // paddingHorizontal: responsiveWidth(5),
          }]}
            onPress={switchCamera}
          >
            <Icon name="rotate-right" size={24} color="white" />
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
        <BottomSheet height={responsiveHeight(60)} ref={refRBSheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
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
                Are you sure you want to Report this user?
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
        <BottomSheet height={responsiveHeight(25)} ref={refMenuSheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{
              marginTop: responsiveHeight(3),
              paddingHorizontal: responsiveWidth(5),
            }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: responsiveHeight(2),
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(255, 255, 255, 0.1)',
                }}
                onPress={() => {
                  refMenuSheet.current.close();
                  setTimeout(() => {
                    refRBSheet.current.open();
                  }, 300);
                }}
              >
                <Icon name="flag" size={20} color={COLORS.white} style={{ marginRight: responsiveWidth(4) }} />
                <Text style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  fontFamily: fonts.PoppinsRegular,
                }}>
                  Report User
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: responsiveHeight(2),
                }}
                onPress={() => {
                  refMenuSheet.current.close();
                  setTimeout(() => {
                    refBlockSheet.current.open();
                  }, 300);
                }}
              >
                <Icon name="ban" size={20} color={COLORS.white} style={{ marginRight: responsiveWidth(4) }} />
                <Text style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  fontFamily: fonts.PoppinsRegular,
                }}>
                  Block User
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </BottomSheet>

        {/* Block User Bottom Sheet */}
        <BottomSheet height={responsiveHeight(35)} ref={refBlockSheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
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
                Are you sure you want to Block this user?
              </Text>
              <Text style={{
                color: COLORS.lightGray,
                fontSize: responsiveFontSize(1.8),
                fontFamily: fonts.PoppinsRegular,
                textAlign: 'center',
                width: responsiveWidth(80),
                marginVertical: responsiveHeight(1),
                alignSelf: 'center',
              }}>
                You won't be able to see their profile, send messages, or receive calls from them.
              </Text>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: responsiveWidth(70),
                alignSelf: 'center',
                marginTop: responsiveHeight(3),
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
                    backgroundColor: COLORS.warning,
                  }}
                  loading={blockLoading}
                />
              </View>
            </View>
          </ScrollView>
        </BottomSheet>
      </View>
    </>
  );
});

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
    justifyContent: 'space-evenly',
    marginBottom: responsiveHeight(5),

  },
  button: {
    // padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: responsiveWidth(15),
    borderWidth: 1,
    width: responsiveWidth(15),
    height: responsiveWidth(15),
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default VideoCallScreen;
