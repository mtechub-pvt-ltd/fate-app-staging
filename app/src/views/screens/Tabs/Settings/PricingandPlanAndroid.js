import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
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

} from 'react-native-iap';
import { useIsFocused } from '@react-navigation/native';
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
  const [activeSubscription, setActiveSubscription] = useState(false); // State for subscription status
  const [userDetail, setUserDetail] = useState(null);
  const getUserDetails = async () => {
    const userDetail = await getUserDetail();
    setUserDetail(userDetail);
    console.log('userDetail', userDetail);
    // const data = {
    //   user_id: userDetail?.data?.id
    // }
    //   const response = await getAllTokens(data);
    //   console.log('response_____', response?.tokens?.length);

    //   setTokens(response)

  };
  useEffect(() => {
    getUserDetails();
  }, [isFocused]);


  useEffect(() => {
    const initializeIAP = async () => {
      try {
        await initConnection();
        const subscriptionIds = ['silvermonthly12345_new', 'goldmonthly12345_new', 'platinummonthly12345_new'];
        const products = await getSubscriptions({ skus: subscriptionIds });
        setSubscriptions(products);


      } catch (error) {
        console.error('IAP initialization error', error);
      }
    };

    initializeIAP();

    const purchaseUpdate = purchaseUpdatedListener(async (purchase) => {
      try {
        setLoading(true);
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          // Verify receipt with your server and unlock content
          await finishTransaction({ purchase, isConsumable: false });

          // Get user details and update subscription in API
          const userData = await getUserDetail();
          const data = {
            user_id: userData?.data?.id,
            subscription_type: purchase?.productId,
          };

          // Update subscription in backend
          const response = await updateUserSubscription(data);
          console.log('Subscription update response:', response);

          if (response?.error === false) {
            await storeUserDetail(response.data);
            Alert.alert('Success', 'Your subscription was successful!');
            setUserDetail(response.data);
            setTimeout(() => {
              navigation.navigate('Home');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Purchase update error', error);
        Alert.alert('Error', 'There was a problem with your purchase');
      } finally {
        setLoading(false);
      }
    });

    const purchaseError = purchaseErrorListener((error) => {
      console.error('Purchase error', error);
    });

    return () => {
      purchaseUpdate.remove();
      purchaseError.remove();
    };
  }, []);

  const handleSubscriptionPurchase = async (sku, offerToken) => {
    try {
      setLoading(true);
      const purchase = await requestSubscription({
        sku,
        subscriptionOffers: [{ sku, offerToken }],
      });
      console.log('purchase', purchase);

      // Get user details for API call
      const userData = await getUserDetail();
      console.log('userData:', userData);

      // Prepare data for API call
      const data = {
        user_id: userData?.data?.id,
        subscription_type: sku, // Using the SKU as subscription_type
      };

      // Call the API to update subscription
      const response = await updateUserSubscription(data);
      console.log('API Response:', response);

      // Update local storage and navigate if successful
      if (response?.error === false) {
        await storeUserDetail(response.data);
        setActiveSubscription(true);
        setTimeout(() => {
          navigation.navigate('Home');
        }, 2000);
      }

    } catch (error) {
      console.error('Subscription purchase error:', error);
      // Show error message to user
      Alert.alert('Error', 'Failed to complete subscription purchase');
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
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          marginTop: responsiveWidth(4),
          alignItems: 'center',
        }}
      >
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

      <ScrollView>
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
              {/* sort subsiction by pricingPhases.pricingPhaseList[0].formattedPrice */}
              {subscriptions.sort((a, b) => {
                const priceA = parseFloat(a.subscriptionOfferDetails[0].pricingPhases.pricingPhaseList[0].formattedPrice.replace(/[^0-9.-]+/g, ''));
                const priceB = parseFloat(b.subscriptionOfferDetails[0].pricingPhases.pricingPhaseList[0].formattedPrice.replace(/[^0-9.-]+/g, ''));
                return priceA - priceB;
              }
              ).map((product) => (
                <View

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
                    {product?.name}
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
                      {product?.subscriptionOfferDetails[0]?.pricingPhases?.pricingPhaseList[0]?.formattedPrice}
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
                        product?.description?.split(',')?.join('\n')
                      }
                    </Text>
                  </View>

                  {userDetail?.data?.subscription_type === product?.productId ? (
                    <PrimaryButton
                      title="Active (Tap to Manage)"
                      loading={false}
                      onPress={() => {
                        // Open subscription management in Google Play Store
                        const url = 'market://details?id=' + 'com.fate.dating';
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
                  ) : (
                    <PrimaryButton
                      title="Subscribe Now"
                      loading={loading && activeSubscription === product.productId}
                      onPress={() => {
                        const offerToken = product.subscriptionOfferDetails?.[0]?.offerToken;
                        if (offerToken) {
                          setActiveSubscription(product.productId);
                          handleSubscriptionPurchase(product.productId, offerToken);
                        } else {
                          console.error('No available subscription offers for this product.');
                          Alert.alert('Error', 'No subscription offers available for this product');
                        }
                      }}
                      style={{
                        marginTop: responsiveHeight(0),
                        alignSelf: 'center',
                        width: responsiveWidth(80),
                      }}
                      backgroundColor={COLORS.white}
                      textColor={COLORS.primary}
                    />
                  )}
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

    </GradientBackground>
  );
};

export default PurchaseScreen;
