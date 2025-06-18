import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Image
} from 'react-native';

import { useIAP, requestPurchase, purchaseUpdatedListener, purchaseErrorListener } from 'react-native-iap';
import { useIsFocused } from '@react-navigation/native';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import COLORS from '../../../../consts/colors';
import { getUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { addToken } from '../../../../Services/Auth/SignupService';
import fonts from '../../../../consts/fonts';
import Images from '../../../../consts/Images';
import PrimaryButton from '../../../../components/Button/PrimaryButton';
import { SafeAreaFrameContext } from 'react-native-safe-area-context';
import { SafeAreaView } from 'moti';


const GetInstantAccess = ({ route, navigation }) => {
  const { currentTokens } = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState('payment');
  const isFocused = useIsFocused();

  // Initialize useIAP hook
  const {
    products,
    getProducts,
    finishTransaction,
  } = useIAP();

  // const iosProductSkus = ['1_fate_token', '10_fate_tokens', '100_fate_tokens', '200_fate_tokens', '500_fate_tokens'];
  const iosProductSkus = ['com.fateapp1.skipwait'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        await getProducts({ skus: iosProductSkus });
        console.log('Products fetched: ', products);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchProducts();
    }
  }, [isFocused, getProducts]);

  // Set up purchase listeners
  useEffect(() => {
    const purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      try {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          console.log('Purchase completed:', purchase);
          await finishTransaction({ purchase, isConsumable: false });
          alert('Purchase Successful!');
          setLoading(false);
          // navigation.goBack();

          navigation.navigate('ProfileCreationLoader', {
            addUserToWaitingList: false,
          });

        }
      } catch (error) {
        console.error('Error finishing transaction:', error);
        setLoading(false);
      }
    });

    const purchaseErrorSubscription = purchaseErrorListener((error) => {
      console.warn('Purchase error:', error);
      alert('Purchase failed: ' + error.message);
      setLoading(false);
    });

    return () => {
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
    };
  }, [finishTransaction, navigation]);

  const handlePurchase = async (productId) => {
    try {
      setLoading(true);
      const purchase = await requestPurchase({ sku: productId });
      console.log('Purchase request sent:', purchase);
      // Don't set loading to false here - the purchaseUpdatedListener will handle it
    } catch (err) {
      console.error('Purchase Error:', err);
      alert('Error during purchase, please try again.');
      setLoading(false); // Only set loading to false on error
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
    <ImageBackground
      source={Images.instant}
      style={{
        flex: 1,
        width: '103%',
        height: '100%',
        backgroundColor: COLORS.black
      }}
      imageStyle={{
        resizeMode: 'cover'
      }}
    >
      <SafeAreaView
        style={{
          flex: 1
        }}
      >
        {/* Header with close button */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingHorizontal: responsiveWidth(3),
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon
              name="times"
              size={18}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Profile Image and Main Content */}
          <View style={{
            paddingHorizontal: responsiveWidth(4),
            marginTop: responsiveHeight(20),

          }}>


            {/* Main Title */}
            <Text
              style={{
                fontSize: responsiveFontSize(3.5),
                color: COLORS.white,
                fontFamily: fonts.PoppinsBold,
                marginBottom: 10,
              }}
            >
              You're Almost In
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                fontSize: responsiveFontSize(2),
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: fonts.PoppinsRegular,

                lineHeight: 24,
              }}
            >
              Based on your answers, you're a great fit for Fate, although to maintain gender balance, we are limiting new users.

            </Text>

            {/* Benefits List */}
            <View style={{
              width: '100%',
              marginHorizontal: responsiveWidth(1),
              marginTop: responsiveHeight(2),
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <View style={{

                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: responsiveWidth(4)
                }}>
                  <Image
                    source={Images.electricity}
                    style={{
                      width: 24,
                      height: 24,
                    }}
                  />
                </View>
                <Text style={{
                  fontSize: responsiveFontSize(2),
                  color: COLORS.white,
                  fontFamily: fonts.PoppinsRegular,
                }}>
                  Instant access to app
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <View style={{

                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: responsiveWidth(4)
                }}>
                  <Image
                    source={Images.target}
                    style={{
                      width: 24,
                      height: 24,
                    }}
                  />
                </View>
                <Text style={{
                  fontSize: responsiveFontSize(2),
                  color: COLORS.white,
                  fontFamily: fonts.PoppinsRegular,
                }}>
                  Get matches ready to chat
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <View style={{

                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: responsiveWidth(4)
                }}>
                  {/* <Image
                    source={Images.alarm}
                    style={{
                      width: 24,
                      height: 24,
                    }}
                  /> */}
                  <Icon
                    name="star"
                    size={24}
                    color={COLORS.warning}
                  />
                </View>
                <Text style={{
                  fontSize: responsiveFontSize(2),
                  color: COLORS.white,
                  fontFamily: fonts.PoppinsRegular,
                }}>
                  300 Free tokens, can be redeemed for premium features
                </Text>
              </View>

            </View>

            {/* Payment Options */}
            <View style={{
              width: '95%',
              alignSelf: 'center',
              marginTop: responsiveHeight(2),
            }}>
              {/* One Time Payment Option */}
              <TouchableOpacity
                onPress={() => setSelectedPaymentOption('payment')}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 15,
                  paddingHorizontal: responsiveWidth(3),
                  paddingVertical: responsiveWidth(2),
                  marginBottom: 15,
                  borderWidth: selectedPaymentOption === 'payment' ? 2 : 2,
                  borderColor: selectedPaymentOption === 'payment' ? COLORS.primary : 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <View>
                  <Text style={{
                    fontSize: responsiveFontSize(2.2),
                    color: COLORS.grey,
                    fontFamily: fonts.PoppinsMedium,
                    marginBottom: 5,
                  }}>
                    One Time Payment
                  </Text>
                  <Text style={{
                    fontSize: responsiveFontSize(2.5),
                    color: COLORS.white,
                    fontFamily: fonts.PoppinsMedium,
                  }}>
                    {
                      products[0]?.localizedPrice
                    }
                  </Text>
                </View>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: selectedPaymentOption === 'payment' ? COLORS.primary : 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: selectedPaymentOption === 'payment' ? COLORS.primary : 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {selectedPaymentOption === 'payment' && (
                    <Icon
                      name="check"
                      size={12}
                      color={COLORS.white}
                    />
                  )}
                </View>
              </TouchableOpacity>

              {/* Waitlist Option */}
              <TouchableOpacity
                onPress={() => setSelectedPaymentOption('waitlist')}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 15,
                  paddingHorizontal: responsiveWidth(3),
                  paddingVertical: responsiveWidth(2),
                  borderWidth: selectedPaymentOption === 'waitlist' ? 2 : 2,
                  borderColor: selectedPaymentOption === 'waitlist' ? COLORS.primary : 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <View>
                  <Text style={{
                    fontSize: responsiveFontSize(2.2),
                    color: COLORS.grey,
                    fontFamily: fonts.PoppinsMedium,
                    marginBottom: 5,
                  }}>
                    Don't want to Pay
                  </Text>
                  <Text style={{
                    fontSize: responsiveFontSize(2),
                    color: COLORS.grey,
                    fontFamily: fonts.PoppinsMedium,
                  }}>
                    Join waitlist <Text style={{ color: COLORS.primary }}>48 Hr</Text>
                  </Text>
                </View>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: selectedPaymentOption === 'waitlist' ? COLORS.primary : 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: selectedPaymentOption === 'waitlist' ? COLORS.primary : 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {selectedPaymentOption === 'waitlist' && (
                    <Icon
                      name="check"
                      size={12}
                      color={COLORS.white}
                    />
                  )}
                </View>
              </TouchableOpacity>
            </View>


          </View>


        </ScrollView>
        <View style={{
          paddingHorizontal: responsiveWidth(5),
          paddingBottom: Platform.OS === 'android' ? responsiveHeight(5) : responsiveHeight(1),
          paddingTop: responsiveHeight(1),
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center'
        }}>
          <PrimaryButton
            loading={loading}
            title={selectedPaymentOption === 'payment' ? 'Join' : 'Continue'}
            disabled={loading} // Disable button when loading responses
            onPress={() => {
              if (selectedPaymentOption === 'payment' && products && products.length > 0) {
                const product = products[0];
                const no = product.title.split(' ')[0];
                setActiveProduct(parseInt(no));
                handlePurchase(product.productId);
              } else {
                // Handle waitlist logic

                navigation.navigate('ProfileCreationLoader', {
                  addUserToWaitingList: true,
                });

              }
            }}
            style={{
              width: '100%',


            }}
            backgroundColor={COLORS.primary}
            textColor={COLORS.white}
          />

        </View>
      </SafeAreaView>
      {/* Activity Indicator */}
      {loading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </View>
      )}
    </ImageBackground>
  );
};

export default GetInstantAccess;
