import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity, KeyboardAvoidingView,
  FlatList, Platform,
  ActivityIndicator

} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import { width } from '../../../../consts/Dimension';
import COLORS from '../../../../consts/colors';
import Icon from 'react-native-vector-icons/FontAwesome5';
import fonts from '../../../../consts/fonts';
function ChatScreen({ route, navigation }) {
  const { currentUser, otherUser, otherUserName, otherUserImage } = route.params; // Passed as navigation parameters
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false)

  const flatListRef = useRef(); // Reference to the FlatList

  useEffect(() => {
    // Initialize socket
    const newSocket = io('https://fate-be.mtechub.com');
    setSocket(newSocket);

    // Create a room name using both user IDs
    const roomName = createRoomName(currentUser, otherUser);

    // Join the chat room
    newSocket.emit('joinChat', { user1Id: currentUser, user2Id: otherUser, room: roomName });

    // Listen for messages in the chat room
    newSocket.on('message', (msg) => {

      setChatMessages(prevMessages => [...prevMessages, msg]);
      setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
      setLoading(false)
    });
    newSocket.on('message history', (messages) => {
      setChatMessages(messages);
      setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
      setLoading(false)
    });


    return () => {
      newSocket.close();
    };
  }, [currentUser, otherUser]);

  // Function to send message
  const sendMessage = () => {
    setLoading(true)
    const roomName = createRoomName(currentUser, otherUser);
    if (socket) {
      socket.emit('sendMessage', {
        room: roomName,
        message: chatMessage,
        senderId: currentUser, // Send the current user's ID as the sender ID
        receiverId: otherUser, // Send the other user's ID as the receiver ID
      });

      setChatMessage('');
    }
  };

  // Function to handle the scrolling when the content size change
  const onContentSizeChange = () => {
    flatListRef.current.scrollToEnd({ animated: true });
  };


  // Render each chat message
  const renderChatMessage = ({ item }) => {
    const isCurrentUser = item?.senderId || item?.sender_id === currentUser;
    return (
      <View style={{
        padding: Platform.OS === 'ios' ? responsiveHeight(1) : responsiveHeight(1.5),
        marginTop: responsiveHeight(1),
        width: width * 0.5,
        borderRadius: responsiveWidth(2),
        backgroundColor: isCurrentUser ? COLORS.primary : COLORS.secondary,
        alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
        borderTopLeftRadius: isCurrentUser ? responsiveWidth(2) : 0,
        borderTopRightRadius: isCurrentUser ? 0 : responsiveWidth(2),
      }}>
        <Text
          style={{
            color: COLORS.white,
            fontSize: responsiveFontSize(2),
            fontFamily: fonts.JostMedium,
          }}
        >{item.content}</Text>
      </View>
    );
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <SafeAreaView
          style={{
            flex: 1,
          }}

        >
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'flex-start',
              flexDirection: 'row',
              // backgroundColor: COLORS.primary,
              width: '100%',
              paddingVertical: responsiveHeight(2),
            }}>
            <Icon
              name="chevron-left"
              size={responsiveFontSize(3)}
              color={COLORS.white}
              style={{ left: responsiveWidth(2), zIndex: 9999 }}
              onPress={() => navigation.goBack()}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Image
                source={{
                  uri: otherUserImage,
                }}
                style={{
                  marginLeft: responsiveWidth(5),
                  width: responsiveWidth(15),
                  height: responsiveHeight(7),
                  borderRadius: 100,
                  padding: responsiveWidth(2),
                }}
              />
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(3),
                  fontFamily: fonts.JostMedium,
                  marginLeft: responsiveWidth(2),
                }}>
                {otherUserName}

              </Text>
            </View>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                right: responsiveWidth(2),
                padding: responsiveWidth(2),
              }}>
              <Icon name="video" size={responsiveFontSize(2)} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                right: responsiveWidth(15),
                padding: responsiveWidth(2),
              }}>
              <Icon
                name="phone"
                style={{
                  transform: [{ rotate: '90deg' }],
                }}
                size={responsiveFontSize(2)}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={chatMessages}
            keyExtractor={(item, index) => String(index)}
            renderItem={renderChatMessage}
            style={{
              backgroundColor: 'transparent',
            }}
            ref={flatListRef}
            onContentSizeChange={onContentSizeChange}
            ListFooterComponent={<View style={{
              height:
                Platform.OS === 'ios' ? responsiveHeight(7) :
                  responsiveHeight(2)
            }} />
            }
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              alignContent: 'center',
              width: width,
              backgroundColor: COLORS.primary,
              alignSelf: 'center',
              paddingVertical: responsiveHeight(1),
              paddingBottom: responsiveHeight(2),
              padding: responsiveWidth(1), // Add padding here if needed
              bottom: Platform.OS === 'ios' ? 0 : null,
              position: Platform.OS === 'ios' ? 'absolute' : 'relative'
              ,
            }}
          >
            <TextInput
              value={chatMessage}
              autoCapitalize="none"
              keyboardType="default"
              style={{
                backgroundColor: 'white',
                width: responsiveWidth(75),
                padding: responsiveHeight(1.2),
                borderRadius: 50,
                // marginTop: responsiveHeight(1),
                paddingLeft: 20,
                fontFamily: 'JostMedium',
                fontSize: responsiveFontSize(2),
                borderWidth: responsiveWidth(0.7),
                borderColor: COLORS.secondary,
                color: COLORS.black

              }}
              placeholder="Type a message"
              placeholderTextColor="grey"
              onChangeText={setChatMessage}
            />
            <View
              style={{
                backgroundColor: COLORS.secondary,
                padding: responsiveWidth(3),
                alignSelf: 'center',
                borderRadius: 40,
                display: loading ? 'flex' : 'none',

              }}
            >
              <ActivityIndicator
                size="small"
                style={{
                  marginRight: 10,

                }}
                color={COLORS.white}
                animating={loading}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                if (chatMessage.length > 0
                  && chatMessage.trim().length > 0
                ) {
                  sendMessage();
                }
                // sendMessage
              }}
              style={{
                backgroundColor: COLORS.secondary,
                padding: responsiveWidth(3),
                alignSelf: 'center',
                borderRadius: 40,
                display: loading ? 'none' : 'flex'
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: responsiveFontSize(2),
                  fontFamily: 'JostMedium',

                }}
              >
                Send
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

// Helper function to create a unique room name based on user IDs
const createRoomName = (userId1, userId2) => {
  const userIds = [userId1, userId2].sort();
  return `room_${userIds[0]}_${userIds[1]}`;
};

export default ChatScreen;
