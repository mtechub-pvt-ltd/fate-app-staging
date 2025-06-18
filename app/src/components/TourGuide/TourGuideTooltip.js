import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import COLORS from '../../consts/colors';
import fonts from '../../consts/fonts';

const TourGuideTooltip = ({
    content,
    onNext,
    onSkip,
    isLastStep = false,
    style,
}) => {
    return (
        <View style={[styles.tooltipContainer, style]}>
            <Text style={styles.tooltipText}>{content}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
                    <Text style={styles.skipButtonText}>Skip Tour</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={onNext}>
                    <Text style={styles.nextButtonText}>
                        Next
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    tooltipContainer: {
        backgroundColor: COLORS.primary,
        padding: responsiveWidth(4),
        borderRadius: 10,
        maxWidth: responsiveWidth(85),
        // height: responsiveHeight(10),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    tooltipText: {
        color: COLORS.white,
        fontSize: responsiveFontSize(1.8),
        fontFamily: fonts.PoppinsRegular,
        // marginBottom: responsiveHeight(1),
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // marginTop: responsiveHeight(2),
    },
    skipButton: {
        padding: responsiveWidth(2),
    },
    skipButtonText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: responsiveFontSize(1.5),
        fontFamily: fonts.PoppinsRegular,
    },
    nextButton: {
        backgroundColor: COLORS.white,
        paddingVertical: responsiveHeight(0.8),
        paddingHorizontal: responsiveWidth(4),
        borderRadius: 20,
    },
    nextButtonText: {
        color: COLORS.primary,
        fontSize: responsiveFontSize(1.5),
        fontFamily: fonts.PoppinsMedium,
    },
});

export default TourGuideTooltip;