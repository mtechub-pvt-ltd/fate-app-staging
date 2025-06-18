import React, { act, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  Platform,
  Alert,
  Linking,
} from 'react-native';

import {
  initConnection,
  getSubscriptions,
  requestSubscription,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  useIAP,
} from 'react-native-iap';
import { Link, useIsFocused } from '@react-navigation/native';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import COLORS from '../../../../consts/colors';
import { getUserDetail, storeUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { addToken, updateUserSubscription } from '../../../../Services/Auth/SignupService';
import fonts from '../../../../consts/fonts';
import Images from '../../../../consts/Images';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';
import PrimaryButton from '../../../../components/Button/PrimaryButton';


const PurchaseScreen = ({ route, navigation }) => {
  const isFocused = useIsFocused();
  const { currentTokens } = route?.params || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null); // State for subscription status
  const [userDetail, setUserDetail] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Use the useIAP hook to get access to available purchases
  const { getAvailablePurchases } = useIAP();

  const getUserDetails = async () => {
    const userDetail = await getUserDetail();
    setUserDetail(userDetail);
    console.log('userDetail_______', userDetail);
  };
  useEffect(() => {
    if (isFocused) {
      getUserDetails();
    }
  }, [isFocused]);

  // Separate the initialization effect to ensure it runs only once
  useEffect(() => {
    let purchaseUpdateSubscription;
    let purchaseErrorSubscription;

    const initializeIAP = async () => {
      if (isInitialized) return; // Skip if already initialized

      try {
        setLoading(true);
        await initConnection();
        const subscriptionIds = ['silvermonthly12345_new', 'goldmonthly12345_new', 'platinummonthly12345_new'];
        const products = await getSubscriptions({ skus: subscriptionIds });
        setSubscriptions(products);
        setIsInitialized(true);
      } catch (error) {
        console.error('IAP initialization error', error);
        setError('Failed to initialize in-app purchases');
      } finally {
        setLoading(false);
      }
    };

    if (isFocused && !isInitialized) {
      initializeIAP();

      // Set up listeners only once when initializing
      purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
        try {
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            // Verify receipt with your server and unlock content
            await finishTransaction({ purchase, isConsumable: false });

            // setLoading(true);
            // const x = await getUserDetail();
            // console.log('x <<<<<< ', x);
            // const data = {
            //   user_id: x?.data?.id,
            //   subscription_type: purchase?.productId,
            // }


            // const res = await updateUserSubscription(data);
            // console.log('res_______', res);
            // if (res?.error === false) {
            //   await storeUserDetail(res.data);
            //   setTimeout(() => {
            //     navigation.navigate('Home');
            //   }, 2000);
            // }
            // setLoading(false);




          }
        } catch (error) {
          console.error('Purchase update error', error);
        }
      });

      purchaseErrorSubscription = purchaseErrorListener((error) => {
        console.error('Purchase error', error);
      });
    }

    return () => {
      // Clean up listeners when component unmounts
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
    };
  }, [isFocused, isInitialized]);

  const handleSubscriptionPurchase = async (sku) => {
    try {
      setLoading(true);
      const purchase = await requestSubscription({
        sku
      });
      console.log('purchase', purchase);
      const x = await getUserDetail();
      console.log('x <<<<<< ', x);
      const data = {
        user_id: x?.data?.id,
        subscription_type: purchase?.productId,
      }


      const res = await updateUserSubscription(data);
      console.log('res_______', res);
      if (res?.error === false) {
        await storeUserDetail(res.data);
        setTimeout(() => {
          navigation.navigate('Home');
        }, 2000);
      }
      setLoading(false);
    } catch (error) {
      console.error('Subscription purchase error>>>>>>', error);
      Alert.alert('Error', 'Failed to process subscription request');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <View>
        <Text>Error fetching products: {error}</Text>
      </View>
    );
  }

  return (

    <GradientBackground style={{ flex: 1, backgroundColor: 'white' }}>
      <SafeAreaView
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            // marginTop: responsiveWidth(4),
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                padding: 10,
                paddingHorizontal: 12,
                marginRight: 12,
              }}
            >
              <Icon
                name="chevron-left"
                style={{ padding: 4, alignSelf: 'center' }}
                size={22}
                color={COLORS.white}
              />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: responsiveFontSize(2.5),
                color: COLORS.white,
                fontFamily: fonts.PoppinsMedium,
              }}
            >
              Pricing
            </Text>
          </View>

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              onPress={async () => {
                try {
                  setLoading(true);
                  const restoredPurchases = await getAvailablePurchases();

                  if (restoredPurchases && restoredPurchases.length > 0) {
                    // Check if any subscriptions were restored
                    const restoredSubscription = restoredPurchases.find(purchase =>
                      purchase.productId && ['silvermonthly12345_new', 'goldmonthly12345_new', 'platinummonthly12345_new'].includes(purchase.productId)
                    );

                    if (restoredSubscription) {
                      const x = await getUserDetail();
                      const data = {
                        user_id: x?.data?.id,
                        subscription_type: restoredSubscription.productId,
                      };

                      const res = await updateUserSubscription(data);
                      if (res?.error === false) {
                        await storeUserDetail(res.data);
                        Alert.alert('Success', 'Your purchase has been restored successfully.');
                        getUserDetails(); // Refresh user details to show active subscription
                      }
                    } else {
                      Alert.alert('No Purchases', 'No previous purchases found to restore.');
                    }
                  } else {
                    Alert.alert('No Purchases', 'No previous purchases found to restore.');
                  }
                } catch (error) {
                  console.error('Restore purchase error:', error);
                  Alert.alert('Error', 'Failed to restore purchases. Please try again.');
                } finally {
                  setLoading(false);
                }
              }}
              style={{
                padding: 10,
                marginRight: 15,
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontFamily: fonts.PoppinsMedium,
                  fontSize: responsiveFontSize(1.8),
                }}
              >
                Restore
              </Text>
            </TouchableOpacity>
          )}
        </View>


        <ScrollView
          showsVerticalScrollIndicator={false}
        >
          {/* Header and Back Button */}



          {/* Activity Indicator */}
          {loading && (
            <ActivityIndicator
              size="large"
              color={COLORS.white}
              style={{
                marginTop: 45,
                alignSelf: 'center',
              }}
            />
          )}

          {/* Product List */}
          {!loading && subscriptions.length > 0 ? (
            <>
              <View style={{
                padding: 10,

              }}>
                {/* {subscriptions.reverse().map((product, index) => ( */}
                {
                  // order subscriptions based upon price
                  subscriptions.sort((a, b) => {
                    return a.price - b.price;
                  }).map((product, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.16)',
                        padding: responsiveWidth(2),
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.16)',
                        marginTop: responsiveWidth(3)
                      }}
                    >
                      <SimpleLineIcon
                        name="badge"
                        size={responsiveFontSize(3)}
                        color={COLORS.white}
                      />
                      <Text
                        style={{
                          color: COLORS.white,
                          fontSize: responsiveFontSize(2.2),
                          fontFamily: fonts.JostMedium,
                          marginTop: responsiveHeight(1),
                        }}>
                        {product?.title}
                      </Text>
                      <Text
                        style={{
                          color: COLORS.white,

                          marginTop: responsiveHeight(1),
                        }}>
                        <Text
                          style={{
                            fontSize: responsiveFontSize(3.5),
                            fontWeight: 'bold',
                          }}
                        >
                          {product?.localizedPrice}
                        </Text>  <Text
                          style={{
                            fontSize: responsiveFontSize(2.5),
                            fontWeight: '400',
                          }}
                        >Per Week</Text>
                      </Text>

                      <View
                        style={{
                          width: responsiveWidth(80),
                          flexDirection: 'row',
                          borderBottomWidth: 1,
                          borderBottomColor: 'rgba(255, 255, 255, 0.16)',
                          marginVertical: responsiveHeight(2),
                          alignSelf: 'center',
                        }}
                      >
                      </View>
                      <View

                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: responsiveHeight(1),
                        }}
                      >

                        <Icon
                          name="check-circle"
                          size={responsiveFontSize(2.5)}
                          color={COLORS.white}
                        />
                        <Text
                          style={{
                            fontSize: responsiveFontSize(2),
                            fontWeight: '500',
                            color: COLORS.white,
                            marginLeft: responsiveWidth(2),
                          }}
                        >
                          {
                            // find space and replace with \n
                            product?.description.split(',').join('\n')

                            // product?.productId === 'silvermonthly12345_new' ?
                            //   `Silver ${'\n'}300 tokens` :
                            //   product?.productId === 'goldmonthly12345_new' ?
                            //     `Gold ${'\n'}800 tokens` :
                            //     `Monthly ${'\n'}1700 tokens`
                          }
                        </Text>
                      </View>

                      {
                        userDetail?.data?.subscription_type === product?.productId ? (
                          <PrimaryButton
                            title="Active (Tap to Manage)"
                            loading={false}
                            onPress={async () => {
                              // open up the subscription setting screen
                              const url = Platform.select({
                                ios: 'https://apps.apple.com/account/subscriptions',
                                android: 'market://details?id=com.yourapp.package',
                              });
                              Linking.openURL(url);
                            }}
                            style={{
                              marginTop: responsiveHeight(0),
                              alignSelf: 'center',
                              width: responsiveWidth(80),
                            }}
                            backgroundColor={COLORS.secondary2}
                            textColor={COLORS.white}
                          />
                        ) :
                          <PrimaryButton
                            title="Subscribe Now"
                            loading={false}
                            onPress={async () => {
                              await setActiveSubscription(product.productId);
                              await handleSubscriptionPurchase(product.productId);

                              // const data = await getUserDetail();
                              // console.log('data', JSON.stringify(product, null, 2));
                            }}
                            style={{
                              marginTop: responsiveHeight(0),
                              alignSelf: 'center',
                              width: responsiveWidth(80),
                            }}
                            backgroundColor={COLORS.white}
                            textColor={COLORS.primary}
                          />
                      }



                    </View>
                  ))}
              </View>



            </>

          ) : (
            <Text style={{
              display: loading ? 'none' : 'flex',
              padding: 12
            }}>No products available.</Text>
          )}
          <View style={{
            height: responsiveHeight(10),
            width: '100%',
          }}
          />
        </ScrollView>
      </SafeAreaView>

    </GradientBackground>

  );
};

export default PurchaseScreen;

