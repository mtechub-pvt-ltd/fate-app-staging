import React from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import COLORS from '../../../../consts/colors';
import fonts from '../../../../consts/fonts';

const LoadingOverlay = ({ visible, message, subMessage }) => {
    if (!visible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.contentBox}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.messageText}>
                    {message || 'Processing...'}
                </Text>
                {subMessage && (
                    <Text style={styles.subMessageText}>
                        {subMessage}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 9999,
        elevation: 10,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    contentBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        width: responsiveWidth(80),
        alignItems: 'center',
        padding: responsiveHeight(3),
        borderRadius: responsiveWidth(5),
    },
    messageText: {
        color: COLORS.primary,
        fontSize: responsiveFontSize(2.2),
        fontWeight: '600',
        marginTop: responsiveHeight(2),
        fontFamily: fonts.PoppinsRegular,
        textAlign: 'center',
    },
    subMessageText: {
        color: COLORS.grey,
        fontSize: responsiveFontSize(1.8),
        marginTop: responsiveHeight(1),
        fontFamily: fonts.PoppinsRegular,
        textAlign: 'center',
    },
});

export default LoadingOverlay;
