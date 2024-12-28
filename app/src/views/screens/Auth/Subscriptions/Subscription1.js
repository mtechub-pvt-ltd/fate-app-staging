import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
} from 'react-native';

import {
  PurchaseError,
  requestSubscription,
  useIAP,
  validateReceiptIos,
} from 'react-native-iap';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/FontAwesome';

import COLORS from '../../../../consts/colors';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth
} from 'react-native-responsive-dimensions';
import Images from '../../../../consts/Images';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import { useIsFocused } from '@react-navigation/native';
import { updateUserSubscription } from '../../../../Services/Auth/SignupService';
import {
  getUserDetail,
  storeUserDetail
} from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import fonts from '../../../../consts/fonts';



const errorLog = ({ message, error }) => {
  console.error('An error happened', message, error);
};

const isIos = Platform.OS === 'ios';

//product id from appstoreconnect app->subscriptions
const subscriptionSkus = Platform.select({
  ios: ['silvermonthly12345', 'platinummonthly12345', 'goldmonthly12345'],
});
const dataArray = [
  {
    productId: 'platinummonthly12345',
    feature: [
      'Read receipt',
      'Weekly Disqualification insight',
      `⁠10 fate roulette tokens per day ${'\n'} (1 token per roullete spin and joker card)`,
    ]
  },
  {
    productId: 'silvermonthly12345',
    feature: [
      'Read receipt',
      'Weekly Disqualification insight',
      '⁠2 extra matches in pool',
      'Joker card',
      `25 fate roulette tokens per day${'\n'} (1 token per roullete spin and joker card)`,
    ]
  },
  {
    productId: 'goldmonthly12345',
    feature:
      [
        'Weekly Disqualification insight',
        'Read receipt',
        'Joker card',
        '⁠2 extra matches in pool',
        '⁠AI prompt feature',
        `⁠50 fate roulette tokens per day${'\n'} (1 token per roullete spin and joker card)`,
      ]
  },
]
  ;

const Subscription1 = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [userDetail, setUserDetail] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null); // Add this state to track active subscription

  //useIAP - easy way to access react-native-iap methods to
  //get your products, purchases, subscriptions, callback
  //and error handlers.
  const {
    connected,
    subscriptions, //returns subscriptions for this app.
    getSubscriptions, //Gets available subsctiptions for this app.
    currentPurchase, //current purchase for the tranasction
    finishTransaction,
    purchaseHistory, //return the purchase history of the user on the device (sandbox user in dev)
    getPurchaseHistory, //gets users purchase history
  } = useIAP();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const handleGetPurchaseHistory = async () => {
    console.log('handleGetPurchaseHistory');
    try {
      await getPurchaseHistory();
      // Check for active subscription in purchase history
      const activePurchase = purchaseHistory.find(purchase =>
        subscriptionSkus.includes(purchase.productId)
      );
      if (activePurchase) {
        setActiveSubscription(activePurchase.productId); // Set the active subscription
      }
    } catch (error) {
      errorLog({ message: 'Error fetching purchase history', error });
    }
  };

  const handleGetSubscriptions = async () => {
    console.log('handleGetSubscriptions');
    setLoadingData(true);
    try {
      await getSubscriptions({ skus: subscriptionSkus });

      setLoadingData(false);
    } catch (error) {
      errorLog({ message: 'handleGetSubscriptions', error });
    }

  };

  const handleBuySubscription = async productId => {
    console.log('handleBuySubscription_________________-');
    try {
      const t = await requestSubscription({
        sku: productId,
      });
      console.log('t', t);
      if (t.transactionReceipt) {
        alert('you are Subscribed to this plan!');
        // await finishTransaction(t);
        await updateSubscription(t.productId);
        await handleGetPurchaseHistory()

      }
    } catch (error) {
      if (error instanceof PurchaseError) {
        errorLog({ message: `[${error.code}]: ${error.message}`, error });
        alert(error.message);
      } else {
        setLoading(false);
        errorLog({ message: 'handleBuySubscription', error });
      }
    }
  };

  useEffect(() => {
    // handleGetPurchaseHistory();
    loadingDtaas()
  }, [connected, isFocused]);

  const getUser = async () => {
    try {
      const user = await getUserDetail();
      setUserDetail(user?.data)
    } catch (e) {
      // error reading value
      console.log('error', e);
    }
  }

  useEffect(() => {
    handleGetSubscriptions();
    loadingDtaas()
    getUser()
  }, [connected, isFocused]);

  const goToScreen = async () => {
    try {
      const x = await AsyncStorage.getItem('userId')
      if (x !== null) {
        navigation.navigate('TabNavigator');
      } else {
        navigation.navigate('Login');
      }
    } catch (e) {
      console.log('error', e);
    }
  };
  const loadingDtaas = async () => {
    setTimeout(() => {
      setLoadingData(false);
    }, 4000);
  };
  useEffect(() => {

    // ... listen if connected, purchaseHistory and subscriptions exist
    if (
      purchaseHistory.find(
        x => x.productId === (subscriptionSkus[0] || subscriptionSkus[1]),
      )
    ) {
      setLoading(false)
      // navigation.navigate('TabNavigator');
      console.log('navigate to home ..');
      // goToScreen();


    }
    loadingDtaas()
  }, [connected, purchaseHistory, subscriptions]);


  const updateSubscription = async (productId) => {
    setLoading(true);
    const user = await getUserDetail();
    const data = {
      user_id: user?.data?.id,
      subscription_type: productId,
    };
    const response = await updateUserSubscription(data);
    console.log('response', response);
    setUserDetail(response.data);
    await storeUserDetail(response.data);
    setLoading(false);
  }


  useEffect(() => {
    const checkCurrentPurchase = async purchase => {

      if (purchase) {
        try {
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            if (Platform.OS === 'ios') {
              const isTestEnvironment = __DEV__;

              //send receipt body to apple server to validete
              const appleReceiptResponse = await validateReceiptIos(
                {
                  'receipt-data': receipt,
                  password: 'd64a37b32c164776be5cb8197fe2541b',
                },
                isTestEnvironment,
              );

              //if receipt is valid
              if (appleReceiptResponse) {
                const { status } = appleReceiptResponse;
                if (status) {
                  setLoading(false)
                  console.log('currnet purchase');
                  // nravigation.navigate('Signup');
                }
              }

              return;
            }
          }
        } catch (error) {
          console.log('error', error);
        }
      }
    };
    checkCurrentPurchase(currentPurchase);
    loadingDtaas()
  }, [currentPurchase, finishTransaction]);
  useEffect(() => {
    if (connected && isFocused) {
      handleGetPurchaseHistory(); // Fetch purchase history on page load
      // handleGetSubscriptions();
    }
  }, [connected, isFocused]);


  return (
    <GradientBackground
      style={{
        flex: 1,
        backgroundColor: 'white',
      }}>
      {
        loadingData === false ? null :

          <ActivityIndicator size="large" />

      }

      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            // width: responsiveWidth(90),
            marginTop: Platform.OS === 'ios' ? responsiveHeight(5) : responsiveHeight(2),
            alignItems: 'center',
          }}>


          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={{
              padding: responsiveWidth(1.5),
              paddingHorizontal: responsiveWidth(1.5),
              marginRight: responsiveWidth(4),
            }}
          >
            <Icon2 name="chevron-left"
              style={{
                // marginRight: responsiveWidth(2),
                padding: responsiveWidth(2),
                paddingHorizontal: responsiveWidth(2),
                alignSelf: 'center',
              }}
              size={responsiveFontSize(3)} color={COLORS.white} />

          </TouchableOpacity>
          <Text
            style={{
              fontSize: responsiveFontSize(3),
              color: COLORS.white,
              fontWeight: '500',
              fontFamily: fonts.PoppinsRegular
            }}
          >
            Pricing
          </Text>


        </View>
        <View style={{ padding: 10 }}>

          <View style={{ marginTop: 10 }}>
            {subscriptions.map((subscription, index) => {
              const owned = purchaseHistory.find(
                (s) => s?.productId === subscription.productId,
              );

              return (
                <View style={styles.box} key={index}>
                  <Image
                    source={Images.medal}
                    style={{
                      width: 40,
                      height: 40,
                      alignSelf: 'flex-start',
                      marginBottom: 10,
                      resizeMode: 'contain',
                    }}

                  />
                  {subscription?.introductoryPriceSubscriptionPeriodIOS && (
                    <>
                      {/* <Text style={styles.specialTag}>SPECIAL OFFER</Text> */}
                    </>
                  )}
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "column",
                      justifyContent: "space-between",
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{
                        paddingBottom: 10,
                        fontWeight: '600',
                        fontSize: 18,
                        textTransform: "uppercase",
                        color: COLORS.white,
                      }}
                    >
                      {subscription?.title}
                    </Text>
                    <Text
                      style={{
                        paddingBottom: 20,
                        fontWeight: "bold",
                        fontSize: responsiveFontSize(4),
                        color: COLORS.white,

                      }}
                    >
                      {subscription?.localizedPrice}
                      <Text
                        style={{
                          paddingBottom: 20,
                          fontWeight: "bold",
                          fontSize: responsiveFontSize(2),
                          color: COLORS.white,

                        }}
                      > Per {subscription?.subscriptionPeriodUnitIOS.toLowerCase()}
                      </Text>
                    </Text>

                  </View>

                  {subscription?.introductoryPriceSubscriptionPeriodIOS && (
                    <Text
                      style={{
                        fontSize: 18,
                        color: COLORS.white,
                        marginBottom: 10,
                      }}
                    >
                      Free for {subscription?.introductoryPriceNumberOfPeriodsIOS}{" "}
                      {subscription?.introductoryPriceSubscriptionPeriodIOS}
                    </Text>
                  )}

                  <View
                    style={{
                      width: '100%',
                      height: 1,
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      marginVertical: 10,
                    }}
                  />
                  {dataArray.map((item, index) => {
                    if (item.productId === subscription.productId) {

                      return (
                        item.feature.map((newitem, indexx) => {
                          return (
                            <View
                              key={indexx}
                              style={{
                                flexDirection: 'row',
                                marginVertical: 5,
                                alignItems: 'flex-start',

                              }}>
                              <Icon
                                name="star"
                                size={16}
                                color={COLORS.white}
                              />
                              <Text style={styles.listItem}>{newitem}</Text>
                            </View>
                          );
                        })
                      )

                    }

                  }
                  )}

                  {owned && (
                    <Text style={{
                      textAlign: "center",
                      marginBottom: 10,
                      backgroundColor: COLORS.primary,
                      padding: 20,
                      fontSize: 18,
                      color: COLORS.white,
                      fontWeight: 'bold',
                      borderRadius: 20,
                      overflow: 'hidden',
                    }}>
                      You are Subscribed to this plan!
                    </Text>
                  )}

                  {loading && <ActivityIndicator size="large" />}
                  {!loading && !owned && isIos && (

                    <PrimaryButton
                      title={'Subscribe'}
                      loading={loading}
                      onPress={() => {
                        setLoading(true);
                        handleBuySubscription(subscription.productId);
                      }}
                      style={{
                        marginTop: responsiveHeight(2),
                        alignSelf: 'center',
                        width: responsiveWidth(75),
                        // backgroundColor: subscription.productId === userDetail?.subscription_type ? COLORS.primary : COLORS.white,
                        backgroundColor: COLORS.white,
                      }}
                      backgroundColor={COLORS.white}
                      // textColor={subscription.productId != userDetail?.subscription_type ? COLORS.primary : COLORS.white}
                      textColor={COLORS.primary}
                    />
                  )}
                </View>
              );
            })}
          </View>


        </View>
      </ScrollView>
    </GradientBackground>
  );
};
export default Subscription1;
const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  listItem: {
    fontSize: 16,
    paddingLeft: 8,
    paddingBottom: 3,
    textAlign: 'left',
    color: 'white',
  },
  box: {
    margin: 10,
    marginBottom: 5,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',

  },
  button: {
    alignItems: 'center',
    backgroundColor: 'mediumseagreen',
    borderRadius: 8,
    padding: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
  },
  specialTag: {
    color: 'white',
    backgroundColor: 'crimson',
    width: 125,
    padding: 4,
    fontWeight: 'bold',
    fontSize: 12,
    borderRadius: 7,
    marginBottom: 2,
  },
  CardProfile: {
    backgroundColor: COLORS.secondary,
    height: '10%',
    //justifyContent:'center',
    borderBottomLeftRadius: '12%',
    borderBottomRightRadius: '12%',
  },
  cardProfileContent: {
    marginTop: '7%',
    marginHorizontal: '2%',
  },
  bottom_bg: {
    width: '12%',
    height: '10%',
    position: 'absolute',
    right: 0,
    opacity: 0.2,
    bottom: 0,
    resizeMode: 'contain',
    //top: -StatusBar.currentHeight,
  },
});


