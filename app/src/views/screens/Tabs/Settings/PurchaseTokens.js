import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,

} from 'react-native';

import { useIAP, requestPurchase } from 'react-native-iap';
import { useIsFocused } from '@react-navigation/native';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import GradientBackground from '../../../../components/MainContainer/GradientBackground';
import COLORS from '../../../../consts/colors';
import { getUserDetail } from '../../../../HelperFunctions/AsyncStorage/userDetail';
import { addToken } from '../../../../Services/Auth/SignupService';
import fonts from '../../../../consts/fonts';
import Images from '../../../../consts/Images';


const PurchaseScreen = ({ route, navigation }) => {
  const { currentTokens } = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const isFocused = useIsFocused();

  // Initialize useIAP hook
  const {
    products,
    getProducts,
    currentPurchase,
    finishTransaction,
  } = useIAP();

  // const iosProductSkus = ['1_fate_token', '10_fate_tokens', '100_fate_tokens', '200_fate_tokens', '500_fate_tokens'];
  const iosProductSkus = ['100_fate_tokens_new', '1300_fate_tokens_new', '600_fate_tokens_new'];

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

  useEffect(() => {
    const completePurchase = async () => {
      if (currentPurchase) {
        try {
          await finishTransaction({ purchase: currentPurchase, isConsumable: true });
          var userDetail = await getUserDetail()
          const data = {
            user_id: userDetail?.data?.id,
            new_tokens: activeProduct,
          }

          const res = await addToken(data);
          console.log('res_______', res);
          await addToken({ token: activeProduct });
          alert('Purchase Successful!');
          navigation.goBack();

        } catch (error) {
          console.error('Error completing transaction:', error);
        } finally {
          setLoading(false);  // Make sure loading is reset even if there's an error
        }
      }
    };

    completePurchase();
  }, [currentPurchase, finishTransaction]);

  const handlePurchase = async (productId) => {
    try {
      setLoading(true);
      const purchase = await requestPurchase({ sku: productId });
      // await finishTransaction({ purchase, isConsumable: true });
      console.log('Purchase Success: ', purchase);
    } catch (err) {
      console.error('Purchase Error: ', err);
      alert('Error during purchase, please try again.');
    } finally {
      setLoading(false); // Ensure loading state is cleared
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
      {/* Header and Back Button */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          marginTop: 65,
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
          Tokens
        </Text>
      </View>
      <ScrollView>

        <ImageBackground
          source={Images.test_stars}
          imageStyle={{
            tintColor: 'rgba(255, 255, 255, 0.16)',
          }}

          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: responsiveWidth(4),
            alignItems: 'center',
            marginTop: responsiveHeight(2),
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.16)',
            borderRadius: 10,
            alignContent: 'center',
            borderRadius: 20,

          }}
        >
          <View>

            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(4),
                fontFamily: fonts.PoppinsBold,
              }}
            >
              {currentTokens}
            </Text>
            <Text
              style={{
                color: COLORS.white,
                fontSize: responsiveFontSize(2),
                fontFamily: fonts.PoppinsMedium,
              }}
            >
              Available tokens
            </Text>

          </View>

        </ImageBackground>
        <Text
          style={{
            color: COLORS.white,
            fontSize: responsiveFontSize(2),
            fontFamily: fonts.PoppinsBold,
            marginTop: responsiveWidth(2),
            marginHorizontal: responsiveWidth(3),
          }}
        >

          Available Offers

        </Text>

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
        {!loading && products && products.length > 0 ? (
          <>
            <View style={{ padding: 10 }}>
              {products.sort((a, b) => a.title.split(' ')[0] - b.title.split(' ')[0]).map((product) => (
                <ImageBackground
                  key={product.productId}
                  source={Images.test_stars}

                  imageStyle={{
                    tintColor: 'rgba(255, 255, 255, 0.16)',
                  }}

                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: responsiveWidth(4),
                    alignItems: 'center',
                    marginTop: responsiveHeight(2),
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.16)',
                    borderRadius: 10,
                    alignContent: 'center',
                    borderRadius: 20,
                  }}
                >
                  <View>

                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: responsiveFontSize(2.5),
                        fontFamily: fonts.PoppinsBold,
                      }}
                    >
                      {
                        product.title.split(' ')[0]
                      } Fate Tokens
                    </Text>
                    <Text
                      style={{
                        color: COLORS.secondary2,
                        fontSize: responsiveFontSize(2),
                        fontFamily: fonts.PoppinsMedium,
                      }}
                    >
                      {product?.localizedPrice}
                    </Text>

                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      const no = product.title.split(' ')[0];
                      setActiveProduct(parseInt(no));
                      handlePurchase(product.productId)
                    }}
                    style={{
                      backgroundColor: COLORS.white,
                      borderRadius: 50,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        padding: responsiveWidth(2),
                        paddingHorizontal: responsiveWidth(4),
                        overflow: 'hidden',
                        color: COLORS.primary,
                        fontFamily: fonts.PoppinsMedium,
                      }}
                    >
                      Buy Now
                    </Text>
                  </TouchableOpacity>
                </ImageBackground>
              ))}
            </View>



          </>

        ) : (
          <Text style={{
            display: loading ? 'none' : 'flex',
            padding: 12
          }}>No products available.</Text>
        )}
      </ScrollView>
    </GradientBackground>
  );
};

export default PurchaseScreen;
