import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity, KeyboardAvoidingView,
  FlatList, Platform, ScrollView,
  ActivityIndicator, Modal, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import { width } from '../../../../consts/Dimension';
import COLORS from '../../../../consts/colors';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import fonts from '../../../../consts/fonts';
import { node_base_url } from '../../../../consts/baseUrls';
import { launchImageLibrary } from 'react-native-image-picker';
import { BlurView } from '@react-native-community/blur';
import { getUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import {
  PhoneCall,
  Checks,
  Placeholder
} from 'phosphor-react-native';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import { reportUser, blockUser } from '../../../../Services/Auth/SignupService';

function ChatScreen({ route, navigation }) {
  const { currentUser, otherUser, otherUserName, otherUserImage, otherUserType } = route.params; // Passed as navigation parameters
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [sendingImage, setSendingImage] = useState(false)
  const [currentUserDetail, setCurrentUserDetail] = useState(null)
  const refRBSheet = useRef();
  const refMenuSheet = useRef();
  const refBlockSheet = useRef();
  const [reason, setReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [fullScreenImageVisible, setFullScreenImageVisible] = useState(false);
  const [fullScreenImageUri, setFullScreenImageUri] = useState(null);
  const [fullScreenImageLoading, setFullScreenImageLoading] = useState(true);

  const flatListRef = useRef(); // Reference to the FlatList

  // 1. List of objectionable words (plain, not regex)
  const bannedWords = [
    "sex", "fuck", "shit", "bitch", "dick", "pussy", "cock", "cunt", "asshole", "nude",
    "naked", "orgasm", "masturbate", "rape", "kill", "retard", "faggot", "homo",
    "slut", "whore", "anal", "cum", "blowjob", "porn", "escort", "prostitute",
    "cashapp", "sugar daddy", "xanax", "heroin", "weed", "cocaine", "mdma", "drug"
  ];

  // Utility: Normalize text (lowercase, remove emojis and special chars between letters)
  function normalizeForCheck(text) {
    return text
      .toLowerCase()
      .normalize("NFD") // Decompose diacritics
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9]/gi, "") // Remove all non-alphanumerics
      .trim();
  }

  // Main function
  function containsObjectionableContent(text) {
    if (!text) return false;
    const cleaned = normalizeForCheck(text);
    return bannedWords.some(word => cleaned.includes(word));
  }

  useEffect(() => {


    getUserDetail().then((user) => {
      setCurrentUserDetail(user.data);
    });

    // Initialize socket
    const newSocket = io(node_base_url);
    setSocket(newSocket);

    // Create a room name using both user IDs
    const roomName = createRoomName(currentUser, otherUser);

    // Join the chat room
    newSocket.emit('joinChat', { user1Id: currentUser, user2Id: otherUser, room: roomName });

    // Listen for messages in the chat room
    newSocket.on('message', (msg) => {
      console.log('Message stats:', msg);
      setChatMessages(prevMessages => [...prevMessages, msg]);
      setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
      setLoading(false)
      if (msg?.newData?.receiver_id != currentUser) {
        console.log('Marking messages as read');
        markMessagesAsRead(otherUser, currentUser);
      }
    });
    newSocket.on('message history', (messages) => {
      console.log('Message history:', messages);
      setChatMessages(messages);
      setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
      setLoading(false)
    });



    return () => {
      newSocket.close();
    };
  }, [currentUser, otherUser]);


  //  Mark messages as read
  const markMessagesAsRead = async (senderId, receiverId) => {
    try {
      const response = await fetch(`${node_base_url}/messages/v1/markAsRead`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ senderId, receiverId })
      });

      const jsonResponse = await response.json();
      console.log('Mark as read response:', jsonResponse);
      // if (!response.ok) {
      //   throw new Error('Network response was not ok');
      // }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };


  // Function to send message
  const sendMessage = (sms) => {
    setLoading(true)
    const roomName = createRoomName(currentUser, otherUser);
    if (socket) {
      socket.emit('sendMessage', {
        room: roomName,
        message: sms || chatMessage,
        senderId: currentUser, // Send the current user's ID as the sender ID
        receiverId: otherUser, // Send the other user's ID as the receiver ID
        timestamp1: new Date().toISOString(),
        read_status: false,
        status: 'delivered',
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
    const isCurrentUser = item.senderId === currentUser || item.sender_id === currentUser;

    return (
      <View style={{
        padding: Platform.OS === 'ios' ? responsiveHeight(1) : responsiveHeight(1.5),
        marginTop: responsiveHeight(1),
        width: width * 0.5,
        borderRadius: responsiveWidth(2),
        backgroundColor: isCurrentUser ? '#343434' : '#8C52FF',
        alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
        maxWidth: '70%',
        borderBottomRightRadius: isCurrentUser ? 0 : responsiveWidth(2),
        borderTopLeftRadius: isCurrentUser ? responsiveWidth(2) : 0,
      }}>
        {
          // check if item.content is a string or an image at start
          item.content.startsWith('http') || item.content.startsWith('data:image') || item.content.startsWith('https')

            ? (
              <TouchableOpacity
                onPress={() => {
                  setFullScreenImageUri(item.content);
                  setFullScreenImageVisible(true);
                  setFullScreenImageLoading(true);
                }}
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri: item.content,
                  }}
                  style={{
                    width: '100%',
                    height: responsiveHeight(15),
                    borderRadius: 10,
                    marginTop: responsiveHeight(1),
                    resizeMode: 'cover',
                  }}
                />
              </TouchableOpacity>
            ) : <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2),
                fontFamily: fonts.PoppinsMedium,
              }}
            >{item.content}</Text>
        }
        <Text
          style={{
            color: COLORS.grey,
            fontSize: 12,
            display: isCurrentUser && (currentUserDetail?.subscription_type !== 'free' || currentUserDetail?.subscription_type !== 'FREE') ? 'flex' : 'none',
            width: currentUserDetail?.subscription_type !== 'free' || currentUserDetail?.subscription_type !== 'FREE' ? 'none' : 'flex',
            flexDirection: 'row',
            fontFamily: fonts.PoppinsMedium,

          }}
        >

          <Checks color={COLORS.white} size={24} />

        </Text>
      </View>
    );
  };


  const openGallery = async () => {
    try {
      await launchImageLibrary(
        {
          mediaType: 'photo',
          includeBase64: false,
          maxHeight: 1200,
          maxWidth: 1200,
          selectionLimit: 1,
        },
        response => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorCode) {
            console.log('ImagePicker Error: ', response.errorCode);
          } else if (response.errorMessage) {
            console.log('ImagePicker Error: ', response.errorMessage);
          } else {
            console.log('ImagePicker Response: ', response);
            setSelectedImage(response['assets'][0]['uri']);
          }
        },
      );
    } catch (err) {
      console.error(err);
    }
  };


  const uploadImage = async (uri) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'image/jpeg',
        name: 'chatImage.jpg',
      });

      // Comment out Cloudinary upload code
      /*
      formData.append('upload_preset', 'uheajywb');
      const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dl91sgjy1/image/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadResult = await uploadResponse.json();
      
      if (uploadResult && uploadResult.secure_url) {
        return uploadResult.secure_url;
      } else {
        console.error('Error uploading image: No secure URL in response', uploadResult);
        return null;
      }
      */

      // New upload implementation using custom backend API
      const uploadResponse = await fetch('https://backend.fatedating.com/upload-file', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.error) {
        console.log('Image uploaded successfully:', uploadResult.msg);
        return uploadResult.data.fullUrl;
      } else {
        console.error('Upload error:', uploadResult);
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

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
      const response = await reportUser(data);
      setReportLoading(false);
      if (!response?.error) {
        alert('User reported successfully');
        refRBSheet.current.close();
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
        navigation.goBack();
      } else {
        alert('Failed to block user. Please try again.');
      }
    } catch (error) {
      setBlockLoading(false);
      console.error('Error blocking user:', error);
    }
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
              // backgroundColor: COLORS.red,
              width: '100%',
              paddingVertical: responsiveHeight(1),
              borderBottomWidth: 1,
              borderColor: '#FFFFFF33'
            }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                // left: responsiveWidth(2), zIndex: 9999,
                // padding: responsiveWidth(2),
                width: '10%',
                // backgroundColor: 'green',
                alignContent: 'center',
                alignItems: 'center',

              }}
            >
              <Icon
                name="chevron-left"
                size={responsiveFontSize(3)}
                color={COLORS.white}


              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={.9}
              // onPress={() => {
              //   navigation.navigate('ViewProfile', {
              //     current_user: {
              //       id: currentUser,
              //     },
              //     other_user: {
              //       id: otherUser,
              //       name: otherUserName,
              //       image: otherUserImage
              //     },
              //   });

              // }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '50%',
                // backgroundColor: 'blue'
              }}>

              <Image
                source={{
                  uri: otherUserImage,
                }}
                style={{
                  // marginLeft: responsiveWidth(5),
                  width:
                    Platform.OS === 'ios' ? responsiveWidth(15) :
                      responsiveWidth(14),
                  height: responsiveHeight(7),
                  borderRadius: 100,
                  padding: responsiveWidth(2),
                  display: otherUserType != 'ACE' ? 'flex' : 'none',

                }}
              />
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  fontFamily: fonts.PoppinsSemiBold,
                  marginLeft: responsiveWidth(2),
                  // wrap text in parent container
                  width: '60%',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  // backgroundColor: 'red',
                }}>
                {otherUserName.split(' ')[0]}
                {'\n'}
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.5),
                  }}
                >
                  Online
                </Text>
              </Text>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '40%',
                // backgroundColor: 'green',
                justifyContent: 'flex-end',


              }}
            >

              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: responsiveWidth(2),
                }}
                onPress={() =>
                  // navigation.navigate('VideoCallScreen_test', {
                  navigation.navigate('VoiceCallScreen', {
                    currentUser, otherUser,
                    otherUserName, otherUserImage,
                  })}
              >
                <PhoneCall color={COLORS.white}
                  weight="fill" size={responsiveFontSize(2.4)} />

              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: responsiveWidth(2),
                }}
                onPress={() => {

                  // Platform.OS === 'android' ?
                  //   navigation.navigate('VideoCallScreen_test', {
                  //     currentUser, otherUser,
                  //     otherUserName, otherUserImage
                  //   }) :
                  navigation.navigate('VideoCallScreen', {
                    currentUser, otherUser,
                    otherUserName, otherUserImage
                  })

                }}

              >
                <Icon name="video" size={responsiveFontSize(2.4)} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: responsiveWidth(2),
                  paddingHorizontal: responsiveWidth(3),
                  marginHorizontal: responsiveWidth(1),
                }}
                onPress={() => refMenuSheet.current.open()}
              >
                <Icon name="ellipsis-v" size={responsiveFontSize(2.4)} color={COLORS.white} />
              </TouchableOpacity>
            </View>

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
                  responsiveHeight(15)
            }} />
            }
          />
          <View
            style={{
              flexDirection: selectedImage ? 'column' : 'row',
              justifyContent: selectedImage ? 'center' : 'space-around',
              alignItems: 'center',
              alignContent: 'center',
              width: width,
              backgroundColor: COLORS.primary,
              alignSelf: 'center',
              paddingVertical: responsiveHeight(1),
              paddingBottom: responsiveHeight(2),
              padding: responsiveWidth(1),
              bottom: Platform.OS === 'ios' ? 10 : responsiveWidth(12),
              position: Platform.OS === 'ios' ? 'absolute' : 'relative',
            }}
          >
            {/* Loading Indicator for Image Upload */}
            {sendingImage && (
              <View
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: 20,
                  padding: responsiveWidth(4),
                  marginHorizontal: responsiveWidth(2),
                  marginBottom: responsiveHeight(1),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator
                  size="small"
                  color={COLORS.white}
                  animating={sendingImage}
                />
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(1.8),
                    fontFamily: fonts.PoppinsMedium,
                    marginLeft: responsiveWidth(2),
                  }}
                >
                  Uploading image...
                </Text>
              </View>
            )}

            {/* Image Preview or Gallery Button Container */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                display: sendingImage ? 'none' : 'flex',
                marginBottom: selectedImage ? responsiveHeight(2) : 0,
              }}
            >
              {/* Image Preview Container */}
              {selectedImage ? (
                <View
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 20,
                    padding: responsiveWidth(3),
                    marginHorizontal: responsiveWidth(2),
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                >
                  {/* Header with cancel button */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: responsiveHeight(1),
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: responsiveFontSize(1.8),
                        fontFamily: fonts.PoppinsMedium,
                      }}
                    >
                      Image Preview
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSelectedImage(null)}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: 15,
                        padding: responsiveWidth(2),
                      }}
                    >
                      <Icon name="times" size={responsiveFontSize(1.8)} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>

                  {/* Image Preview */}
                  <View
                    style={{
                      position: 'relative',
                      alignSelf: 'center',
                    }}
                  >
                    <Image
                      source={{ uri: selectedImage }}
                      style={{
                        width: responsiveWidth(70),
                        height: responsiveHeight(20),
                        borderRadius: 15,
                        resizeMode: 'cover',
                      }}
                    />
                    {/* Overlay gradient for better send button visibility */}
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderTopLeftRadius: 15,
                        borderBottomRightRadius: 15,
                        padding: responsiveWidth(2),
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          if (selectedImage && !sendingImage) {
                            setSendingImage(true);
                            uploadImage(selectedImage).then((imageUrl) => {
                              console.log('Image URL:', imageUrl);
                              sendMessage(imageUrl);
                              setSelectedImage(null);
                              setSendingImage(false);
                            }).catch((error) => {
                              console.error('Error uploading image:', error);
                              setSendingImage(false);
                            });
                          }
                        }}
                        style={{
                          backgroundColor: '#8C52FF',
                          borderRadius: 20,
                          padding: responsiveWidth(2.5),
                          shadowColor: '#8C52FF',
                          shadowOffset: {
                            width: 0,
                            height: 2,
                          },
                          shadowOpacity: 0.3,
                          shadowRadius: 3,
                          elevation: 4,
                        }}
                      >
                        <Icon name="paper-plane" size={responsiveFontSize(2)} color={COLORS.white} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                /* Gallery Button when no image selected */
                <TouchableOpacity
                  onPress={openGallery}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 50,


                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <Image
                    source={Images.sendImage}
                    style={{
                      width: responsiveWidth(10),
                      height: responsiveWidth(10),
                      resizeMode: 'contain',
                      tintColor: COLORS.white,

                    }}
                  />
                </TouchableOpacity>
              )}
            </View>
            {/* Text Input Container */}
            {!selectedImage && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: responsiveWidth(90),
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  padding: responsiveWidth(1),
                  borderRadius: 50,
                  marginTop: responsiveHeight(1),
                }}

              >

                <TextInput
                  value={chatMessage}
                  autoCapitalize="none"
                  keyboardType="default"
                  style={{
                    backgroundColor: 'transparent',
                    width: responsiveWidth(65),
                    padding: responsiveHeight(1.2),
                    color: 'white',
                    paddingLeft: 20,
                    fontFamily: fonts.PoppinsMedium,
                    fontSize: responsiveFontSize(1.5),
                  }}
                  placeholder="Type a message"
                  placeholderTextColor="white"
                  onChangeText={setChatMessage}
                />
                <TouchableOpacity
                  style={{
                    width: responsiveWidth(8),
                    marginLeft: responsiveWidth(1.5),
                  }}

                >
                  <Image
                    source={Images.mic}
                    style={{
                      width: responsiveWidth(5),
                      height: responsiveHeight(5),
                      resizeMode: 'contain',
                      alignSelf: 'center',
                      display: 'none',
                    }}
                  />
                </TouchableOpacity>
                <ActivityIndicator
                  size="small"
                  style={{
                    marginLeft: responsiveWidth(1.5),
                    width: responsiveWidth(8),
                    display: loading ? 'flex' : 'none',
                  }}
                  color={COLORS.white}
                  animating={loading}
                />
                {/* send message */}
                <TouchableOpacity
                  onPress={() => {
                    if (chatMessage.length > 0 && chatMessage.trim().length > 0) {
                      if (containsObjectionableContent(chatMessage)) {
                        alert('Your message contains inappropriate content and cannot be sent.');
                        return;
                      }
                      sendMessage();
                    }
                  }}
                  style={{
                    width: responsiveWidth(8),
                    marginLeft: responsiveWidth(1.5),
                    display: loading ? 'none' : 'flex',
                  }}
                >

                  <Image
                    source={Images.send}
                    style={{
                      width: responsiveWidth(5),
                      height: responsiveHeight(5),
                      resizeMode: 'contain',
                      alignSelf: 'center',

                    }}
                  />
                </TouchableOpacity>
              </View>
            )}

          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
      <BottomSheet height={responsiveHeight(60)} ref={refRBSheet}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ marginTop: responsiveHeight(3) }}>
            <Text style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(2.5),
              fontFamily: fonts.PoppinsMedium,
              textAlign: 'center',
              width: responsiveWidth(70),
              marginVertical: responsiveHeight(2),
              alignSelf: 'center',
            }}>
              {`Are you sure you want to report this user?`}
            </Text>
            <CustomInput
              mainContainerStyle={{ marginTop: responsiveHeight(2) }}
              title="Add Reason"
              titleStyle={{ marginBottom: responsiveHeight(1) }}
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
              {`Are you sure you want to block this user?`}
            </Text>
            <Text style={{
              color: COLORS.white,
              fontSize: responsiveFontSize(1.5),
              fontFamily: fonts.PoppinsMedium,
              textAlign: 'center',
              width: responsiveWidth(70),
              // marginVertical: responsiveHeight(2),
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

      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={fullScreenImageVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenImageVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Header with close button */}
          <View
            style={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? responsiveHeight(6) : responsiveHeight(4),
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: responsiveWidth(5),
              zIndex: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => setFullScreenImageVisible(false)}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: 25,
                padding: responsiveWidth(3),
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Icon name="times" size={responsiveFontSize(2.5)} color={COLORS.white} />
            </TouchableOpacity>

            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2),
                fontFamily: fonts.PoppinsMedium,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                paddingHorizontal: responsiveWidth(4),
                paddingVertical: responsiveHeight(0.8),
                borderRadius: 20,
              }}
            >
              Image Preview
            </Text>
          </View>

          {/* Full Screen Image */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setFullScreenImageVisible(false)}
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Loading indicator */}
            {fullScreenImageLoading && (
              <View
                style={{
                  position: 'absolute',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 5,
                }}
              >
                <ActivityIndicator
                  size="large"
                  color={COLORS.white}
                  animating={fullScreenImageLoading}
                />
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: responsiveFontSize(1.8),
                    fontFamily: fonts.PoppinsMedium,
                    marginTop: responsiveHeight(1),
                  }}
                >
                  Loading image...
                </Text>
              </View>
            )}

            <Image
              source={{ uri: fullScreenImageUri }}
              style={{
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height * 0.8,
                resizeMode: 'contain',
              }}
              onLoad={() => setFullScreenImageLoading(false)}
              onError={(error) => {
                console.error('Error loading full screen image:', error);
                setFullScreenImageVisible(false);
                setFullScreenImageLoading(false);
              }}
            />
          </TouchableOpacity>

          {/* Bottom info bar */}
          <View
            style={{
              position: 'absolute',
              bottom: Platform.OS === 'ios' ? responsiveHeight(8) : responsiveHeight(6),
              left: 0,
              right: 0,
              alignItems: 'center',
              paddingHorizontal: responsiveWidth(5),
            }}
          >
            <View
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: 25,
                paddingHorizontal: responsiveWidth(6),
                paddingVertical: responsiveHeight(1.2),
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(1.6),
                  fontFamily: fonts.PoppinsRegular,
                  textAlign: 'center',
                }}
              >
                Tap anywhere to close
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </GradientBackground>
  );
}

// Helper function to create a unique room name based on user IDs
const createRoomName = (userId1, userId2) => {
  const userIds = [userId1, userId2].sort();
  return `room_${userIds[0]}_${userIds[1]}`;
};

export default ChatScreen;
