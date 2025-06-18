import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Platform,
  ScrollView,
} from 'react-native';
import { getUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Images from '../../../../consts/Images';
import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import fonts from '../../../../consts/fonts';
import { getMatchUsersForChat } from '../../../../Services/Auth/SignupService';
import { useIsFocused } from '@react-navigation/native';
import { BlurView } from '@react-native-community/blur';
import { X as CloseIcon } from 'phosphor-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { nextChatStep, skipChatTour, startPremiumTour } from '../../../../redux/features/tourGuide/tourGuideSlice';
// Import our custom tooltip components instead of the library
import { CustomTooltip, useTooltip } from '../../../../components/CustomTooltip';
import TourGuideTooltip from '../../../../components/TourGuide/TourGuideTooltip';

function ChatList({ navigation }) {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  // Redux tour guide
  const {
    showChatTour,
    currentChatStep,
    chatSteps,
    shouldNavigateToPremium
  } = useSelector((state) => state.tourGuide);

  // Navigate to PremiumNew when tour is completed
  useEffect(() => {
    if (shouldNavigateToPremium) {
      // Navigate to PremiumNew screen and start its tour
      navigation.navigate('PremiumNew');
      dispatch(startPremiumTour());
    }
  }, [shouldNavigateToPremium, navigation]);

  // Create a ref for the Conversations header element
  const conversationsHeaderRef = useRef(null);
  const [headerMeasurements, setHeaderMeasurements] = useState(null);

  const [showTooltip, setShowTooltip] = useState({
    chatList: false
  });

  // Set which tooltip to show based on current step
  useEffect(() => {
    if (showChatTour) {
      const currentTarget = chatSteps[currentChatStep]?.target;
      setShowTooltip({
        chatList: currentTarget === 'chat-list'
      });

      // Measure the position of the conversations header
      if (currentTarget === 'chat-list' && conversationsHeaderRef.current) {
        setTimeout(() => {
          conversationsHeaderRef.current.measure((x, y, width, height, pageX, pageY) => {
            setHeaderMeasurements({
              x: pageX,
              y: pageY,
              width,
              height
            });
          });
        }, 100);
      }
    } else {
      setShowTooltip({
        chatList: false
      });
    }
  }, [currentChatStep, showChatTour]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [match_list1, setMatchList1] = useState([]);
  const [activeDot, setActiveDot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jokerSuggerstion, setJokerSuggestion] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [actualUsers, setActualUsers] = useState([]);
  const [searchable, setSearchable] = useState(false);
  const [searchText, setSearchText] = useState('');
  const refRBSheet = useRef();

  // Handler for tooltip next button
  const handleNextStep = () => {
    dispatch(nextChatStep());
  };

  // Handler for tooltip skip button
  const handleSkipTour = () => {
    dispatch(skipChatTour());
  };

  const getMatchUsersList = async () => {
    setLoading(true);
    const userDetail = await getUserDetail();
    const data = {
      user_id: userDetail?.data?.id,
      current_user_gender: userDetail?.data?.gender,
    };
    setCurrentUser(userDetail?.data);
    const response = await getMatchUsersForChat(data);
    setUsers(response.matches);
    setActualUsers(response.matches);
    setLoading(false);
  };

  useEffect(() => {
    getMatchUsersList();
  }, [isFocused]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    try {
      // Create a Date object from the timestamp (assuming it's in UTC or server timezone)
      const serverDate = new Date(timestamp);

      // Check if the date is valid
      if (isNaN(serverDate.getTime())) {
        return '';
      }

      // Convert to user's local time and format
      const localHours = serverDate.getHours();
      const minutes = serverDate.getMinutes();

      // Format minutes with leading zero if needed
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

      // Convert to 12-hour format
      const ampm = localHours >= 12 ? 'PM' : 'AM';
      const formattedHours = localHours % 12 || 12;

      return `${formattedHours}:${formattedMinutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Chat</Text>
            <View style={styles.searchContainer}>
              {searchable && (
                <View style={styles.searchInputContainer}>
                  <TextInput
                    value={searchText}
                    autoCapitalize="none"
                    keyboardType="default"
                    style={styles.searchInput}
                    placeholder="Search ..."
                    placeholderTextColor="white"
                    onChangeText={(e) => {
                      setSearchText(e);
                      if (e.trim() === '') {
                        setUsers(actualUsers);
                      } else {
                        const filtered = actualUsers.filter((item) =>
                          item?.name?.toLowerCase().includes(e.toLowerCase())
                        );
                        setUsers(filtered);
                      }
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setSearchable(!searchable);
                      setSearchText('');
                      setUsers(actualUsers);
                    }}
                    style={styles.closeIconContainer}
                  >
                    <CloseIcon size={24} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              )}
              {!searchable && (
                <TouchableOpacity
                  onPress={() => setSearchable(!searchable)}
                  style={styles.searchIconContainer}
                >
                  <Icon name="search" size={responsiveFontSize(2.5)} color={COLORS.white} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={[styles.chatListContainer, {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, .5)',
            marginTop: responsiveHeight(2),
            borderRadius: 15
          }]}>
            {/* Use our custom Tooltip component with the conversations header */}

            {/* Custom tooltip displayed based on measurements */}
            <CustomTooltip
              isVisible={showTooltip.chatList}
              content={
                <TourGuideTooltip
                  content={chatSteps[currentChatStep]?.content}
                  onNext={handleNextStep}
                  onSkip={handleSkipTour}
                  isLastStep={currentChatStep === chatSteps.length - 1}
                />
              }
              placement="bottom"
              onClose={() => { }}
              targetMeasurements={headerMeasurements}
              backgroundColor="rgba(0,0,0,0.5)"
              contentStyle={{ backgroundColor: '#F46CE3' }}
              tooltipStyle={{ minHeight: 0 }}
              arrowSize={{ width: 24, height: 12 }}
            />

            <ScrollView
              horizontal={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              style={styles.scrollView}
              refreshControl={
                <RefreshControl tintColor={COLORS.white} refreshing={loading} onRefresh={getMatchUsersList} />
              }
            >
              {users?.length > 0 ? (
                users.map((item, index) => (
                  <>
                    <TouchableOpacity
                      key={index}
                      onPress={() => {

                        // console.log('User ID:', item);
                        setSearchText('');
                        setSearchable(false);
                        navigation.navigate('Chats_New', {
                          currentUser: currentUser.id,
                          otherUser: item.user_id,
                          otherUserImage: item?.profile_image,
                          otherUserName: item?.name,
                          otherUserType: item.role,
                        });
                      }}
                      activeOpacity={0.8}
                      style={[styles.conversationItem, {
                        display: item.user_id == undefined || item.user_id == null ? 'none' : 'flex',
                      }]}
                    >
                      <View style={styles.imageContainer}>

                        <Image
                          source={item.profile_image === null ? Images.user : { uri: item.profile_image }}
                          style={styles.profileImage}
                          blurRadius={index == 4 ? 20 : 0}
                        />

                      </View>
                      <View style={[styles.conversationDetails, {
                        // backgroundColor: 'red'
                      }]}>
                        <View style={styles.conversationHeader}>
                          <Text style={styles.conversationName} numberOfLines={1} ellipsizeMode="tail">
                            {item?.name || 'New User'}
                          </Text>
                          <Text style={styles.conversationTime}>{formatTime(item?.lastMessage?.timestamp1)}</Text>
                        </View>
                        <View
                        >
                          <Text
                            style={{
                              backgroundColor:
                                index == 0 ? '#FF348A' :
                                  index == 1 ? '#8C52FF' :
                                    index == 2 ? '#2FA1FF' :
                                      index == 3 ? '#02C96C' :
                                        index == 4 ? '#FE7637' : '#88818F',
                              paddingHorizontal: responsiveWidth(2),
                              paddingVertical: responsiveWidth(.5),
                              marginVertical: responsiveWidth(2),
                              width: 'auto',
                              alignSelf: 'flex-start', // makes it grow only as much as needed
                              color: COLORS.white,
                              borderRadius: 12,
                              overflow: 'hidden',
                              fontFamily: fonts.PoppinsMedium
                            }}
                          >
                            {
                              index == 0 ? 'Fate Match' :
                                index == 1 ? '2nd Match' :
                                  index == 2 ? '3rd Match' :
                                    index == 3 ? '4th Match' :
                                      index == 4 ? 'Annon Match' : 'Joker Match'
                            }
                          </Text>
                        </View>
                        <View style={styles.conversationMessageContainer}>
                          <Text style={styles.conversationMessage} numberOfLines={1} ellipsizeMode="tail">
                            {item?.lastMessage?.content
                              ? item?.lastMessage?.content?.startsWith('http') || item?.lastMessage?.content?.startsWith('https')
                                ? '🗾 Image'
                                : item?.lastMessage?.content
                              : 'No new message'}
                          </Text>
                          {item?.lastMessage?.content && (
                            <View style={styles.messageStatusContainer}>
                              <Icon name="check" size={responsiveFontSize(1.2)} color={COLORS.grey} />
                              <Icon name="check" size={responsiveFontSize(1.2)} color={COLORS.grey} />
                            </View>
                          )}
                        </View>

                      </View>

                    </TouchableOpacity>
                    <View
                      style={{
                        height: 1,
                        backgroundColor: 'rgba(255, 255, 255, .3)',
                        padding: 1,
                        width: '77%',
                        alignSelf: 'flex-end',
                        marginRight: responsiveWidth(5)
                      }} />
                  </>
                ))
              ) : (
                !loading && (
                  <View style={styles.noConversationsContainer}>
                    <Text style={styles.noConversationsText}>No conversations yet</Text>
                  </View>
                )
              )}
              <View style={styles.bottomSpacer}></View>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: responsiveWidth(90),
    marginTop: Platform.OS === 'ios' ? responsiveHeight(0) : responsiveHeight(2),
    alignItems: 'center',
    // paddingHorizontal: responsiveWidth(2), // Removed to allow search bar to take available space
  },
  headerText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(2.7),
    fontFamily: fonts.PoppinsMedium,
    marginRight: responsiveWidth(2), // Added to create space between title and search bar
  },
  searchContainer: {
    flexDirection: 'row',
    flex: 1, // Allow search container to take available space
    justifyContent: 'flex-end', // Align search icon/bar to the right
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Allow search input container to take available space within searchContainer
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 50,
    paddingLeft: responsiveWidth(4),
    // paddingRight: responsiveWidth(1), // Adjusted to ensure close icon is nicely spaced
  },
  searchInput: {
    flex: 1,
    paddingVertical: responsiveHeight(1.5),
    color: 'white',
    fontFamily: 'JostMedium',
    fontSize: responsiveFontSize(1.5),
  },
  closeIconContainer: {
    paddingVertical: responsiveHeight(1.2), // Adjusted for better vertical centering
    paddingHorizontal: responsiveWidth(3), // Adjusted for better touch area and spacing
    // marginLeft: responsiveWidth(2), // Removed, spacing handled by parent's padding/flex
  },
  searchIconContainer: {
    paddingVertical: 10,
    paddingHorizontal: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  scrollView: {
    height: Platform.OS === 'ios' ? responsiveHeight(75) : responsiveHeight(80),
    width: responsiveWidth(92),
    marginTop: responsiveHeight(1),
  },
  conversationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: responsiveWidth(90),
    marginTop: Platform.OS === 'ios' ? responsiveHeight(1) : responsiveHeight(2),
  },
  conversationsHeaderText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(2.2),
    fontFamily: fonts.PoppinsMedium,
    fontWeight: '500',
  },
  conversationItem: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    marginTop: responsiveHeight(1.3),
    padding: responsiveWidth(2.5),
    borderRadius: 10,
    // backgroundColor: 'rgba(255, 255, 255, 0.04)',
    // borderWidth: 1,
    // borderColor: 'rgba(255, 255, 255, 0.16)',
    width: '100%',
  },
  blurView: {
    display: 'flex',
    overflow: 'hidden',
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  profileImage: {
    width: responsiveWidth(17),
    height: responsiveWidth(17),
    borderRadius: 100,
    resizeMode: 'cover',
  },
  conversationDetails: {
    flex: 1,
    marginLeft: responsiveWidth(2),
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '95%',
  },
  conversationName: {
    color: COLORS.white,
    fontSize: responsiveFontSize(1.9),
    fontFamily: fonts.PoppinsMedium,
    flex: 1,
  },
  conversationTime: {
    color: COLORS.white,
    fontSize: responsiveFontSize(1.7),
    fontFamily: fonts.PoppinsMedium,
  },
  conversationMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: responsiveHeight(0.5),
    width: '100%',
  },
  conversationMessage: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: responsiveFontSize(1.4),
    fontFamily: fonts.PoppinsMedium,
    flex: 1,
  },
  messageStatusContainer: {
    flexDirection: 'row',
    width: '10%',
    marginRight: responsiveWidth(2),
  },
  bottomSpacer: {
    height: responsiveHeight(10),
  },
  chatListContainer: {
    flex: .87,
    height: responsiveHeight(80),
    width: responsiveWidth(92),
    backgroundColor: 'red'
  },
  imageContainer: {
    marginRight: 0,
  },
  noConversationsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: responsiveHeight(50),
  },
  noConversationsText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(2),
    fontFamily: fonts.PoppinsMedium,
  },
  tooltipOverlay: {
    position: 'absolute',
    top: responsiveHeight(10),
    left: responsiveWidth(5),
    right: responsiveWidth(5),
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: responsiveWidth(4),
    zIndex: 1000,
  },
  tooltipContent: {
    alignItems: 'center',
  },
  tooltipText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(2),
    fontFamily: fonts.PoppinsMedium,
    textAlign: 'center',
    marginBottom: responsiveHeight(2),
  },
  tooltipButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  skipButton: {
    backgroundColor: COLORS.grey,
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(4),
    borderRadius: 5,
  },
  skipButtonText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(1.5),
    fontFamily: fonts.PoppinsMedium,
  },
  finishButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(4),
    borderRadius: 5,
  },
  finishButtonText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(1.5),
    fontFamily: fonts.PoppinsMedium,
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -responsiveHeight(2),
    left: '50%',
    marginLeft: -responsiveWidth(2),
    width: 0,
    height: 0,
    borderLeftWidth: responsiveWidth(2),
    borderRightWidth: responsiveWidth(2),
    borderBottomWidth: responsiveHeight(2),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(0, 0, 0, 0.8)',
  },
});

export default ChatList;
