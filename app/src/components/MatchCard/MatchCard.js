import React from 'react';
import {
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    StyleSheet,
    Text,
} from 'react-native';
import { responsiveFontSize, responsiveHeight } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../../../src/consts/colors';
import Images from '../../consts/Images';
import fonts from '../../consts/fonts';
import LottieView from 'lottie-react-native';
// import waitingLotie from '../../assets/lottie/waiting.json'

const MatchCard = ({ item, bgColor, images, onExclamationPress, isPaidUser }) => {
    const isPremiumUser = isPaidUser === 'silvermonthly12345_new' || isPaidUser === 'goldmonthly12345_new';
    const isJokerCard = item.card_type === 'JOKER';
    const isEmptyJoker = item?.name === '';
    const isJokerWaitingForMatch = isJokerCard && !item.image && !item.name; // Check if joker is null

    return (
        <View
            style={[styles.container, {
                backgroundColor: bgColor,
            }]}
        >
            <View style={styles.leftSection}>
                {/* height: '5%', */}
                <View style={[styles.topImageContainer, {
                    height:
                        item.card_type == 'ANONYMOUS' ? '50%' :
                            item.card_type == 'JOKER' ? '70%' :
                                '25%',
                    marginTop:
                        item.card_type == 'ANONYMOUS' ? '50%' :
                            item.card_type == 'JOKER' ? '50%' :
                                '25%',

                }]}>
                    <Image
                        source={images.topImage}
                        style={styles.topImage}
                        resizeMode="contain"
                    />
                </View>
            </View>

            <View style={styles.centerSection}>
                <ImageBackground
                    source={
                        isJokerWaitingForMatch || item.waitingForMatch === true
                            ? null // No background image if Lottie animation is shown
                            : {
                                uri: item?.image,
                            }
                    }
                    style={[styles.backgroundImage, {
                        justifyContent: 'flex-end',
                    }]}
                    resizeMode="cover"

                    imageStyle={styles.backgroundImageStyle}
                    blurRadius={
                        item.card_type == 'ANONYMOUS' && item.waitingForMatch != true
                            ? 40 : 0
                    }
                >
                    {(isJokerWaitingForMatch || item.waitingForMatch === true) && (
                        <LottieView
                            source={require('../../assets/lottie/waiting.json')} // Replace with actual path
                            autoPlay
                            loop
                            style={{
                                width: Platform.OS === 'ios' ? '130%' : '130%',
                                height: Platform.OS === 'ios' ? '120%' : '130%',
                                position: 'absolute',
                                left: Platform.OS === 'ios' ? '-10%' : '-15%',


                            }}
                            speed={2}
                        />
                    )}

                    {/* TAP TO SEND JOKER text for paid users with no assigned joker */}
                    {isJokerCard && isEmptyJoker && isPremiumUser && (
                        <Text
                            style={styles.tapToSendJokerText}
                        >
                            TAP TO {'\n'}SEND JOKER
                        </Text>
                    )}

                    {/* Hide the box if joker is waiting for match */}
                    {!(isJokerWaitingForMatch || item.waitingForMatch) && (
                        <View
                            style={{
                                width: '90%',
                                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                padding: 3,
                                borderRadius: 5,
                                alignSelf: 'center',
                                marginBottom: 5,
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: fonts.PoppinsRegular,
                                    fontSize: responsiveFontSize(1.2),
                                    color: COLORS.black,
                                    fontWeight: 'bold',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {item?.name?.slice(0, 10)
                                    || 'New User'}
                            </Text>
                            <Text
                                style={{
                                    fontFamily: fonts.PoppinsRegular,
                                    fontSize: responsiveFontSize(1.2),
                                    color: COLORS.black,
                                    fontWeight: '500',
                                    textTransform: 'capitalize'
                                }}
                            >
                                <View
                                    style={{
                                        width: 7,
                                        height: 7,
                                        backgroundColor: COLORS.secondary2,
                                        borderRadius: 5,

                                    }}
                                ></View> Online
                            </Text>

                        </View>
                    )}
                </ImageBackground>
            </View >

            <View style={styles.rightSection}>
                <View style={[styles.infoButtonContainer,
                {
                    height: '45%',
                    display: item.waitingForMatch === true

                        ? 'none' : 'flex',
                }
                ]}>
                    <TouchableOpacity
                        onPress={onExclamationPress}
                    >
                        <Icon
                            name="exclamation-circle"
                            size={responsiveFontSize(2.5)}
                            color={COLORS.white}
                            style={{
                                display: (isJokerCard && isPremiumUser)
                                    || isJokerWaitingForMatch || item.waitingForMatch === true
                                    ? 'none' : 'flex'
                            }}
                        />
                    </TouchableOpacity>
                </View>

                <View style={[styles.bottomImageContainer
                    ,
                {
                    height: item.card_type == 'ANONYMOUS' ? '50%' :
                        item.card_type == 'JOKER' ? '50%' :
                            '50%',
                    marginBottom: item.card_type == 'ANONYMOUS' ? '50%' :
                        item.card_type == 'JOKER' ? '50%' :
                            '50%',
                }
                ]}>
                    <Image
                        source={images.bottomImage}
                        style={[styles.bottomImage,
                        {
                            height: item.card_type == 'ANONYMOUS' ? '100%' :
                                item.card_type == 'JOKER' ? '120%' :
                                    '50%',
                        }
                        ]}
                        resizeMode="contain"

                    />
                </View>
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",

        height: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 5,
        overflow: 'hidden',
    },
    leftSection: {
        width: "15%",
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    topImageContainer: {
        width: '80%',
        height: '25%',
        alignSelf: 'center',
    },
    topImage: {
        width: '100%',
        height: '100%',
    },
    centerSection: {
        width: "70%",
        backgroundColor: 'white',
        height: '80%',
        borderRadius: 5,
        overflow: 'hidden',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        borderRadius: 5,
    },
    backgroundImageStyle: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        // top: '-10%',
        // left: '-25%',
    },
    rightSection: {
        width: "15%",
        height: '100%',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    infoButtonContainer: {
        width: '100%',
        height: '10%',
        alignSelf: 'center',
        top: responsiveHeight(1),
    },
    bottomImageContainer: {
        width: '100%',
        height: '50%',
        alignSelf: 'center',
    },
    bottomImage: {
        width: '80%',
        height: '50%',
        position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
    },
    tapToSendJokerText: {
        position: 'absolute',
        top: responsiveHeight(7),
        alignSelf: 'center',
        backgroundColor: 'transparent',
        zIndex: 999,
        padding: 5,
        textAlign: 'center',
        fontSize: responsiveFontSize(1.5),
        fontWeight: 'bold',
        color: COLORS.secondary,
    }
});

export default MatchCard;