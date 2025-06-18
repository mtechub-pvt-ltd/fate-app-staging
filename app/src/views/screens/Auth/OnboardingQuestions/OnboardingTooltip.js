import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { responsiveWidth, responsiveHeight, responsiveFontSize } from 'react-native-responsive-dimensions';
import COLORS from '../../../../consts/colors';

const OnboardingTooltip = () => {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <Modal
            transparent
            visible={isVisible}
            animationType="fade"
            onRequestClose={() => setIsVisible(false)}
        >
            <View style={styles.modalBackground}>
                <View style={styles.tooltipContainer}>
                    <Text style={styles.tooltipText}>Talk to Fate so we can help you find your Fate</Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setIsVisible(false)}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    tooltipContainer: {
        width: responsiveWidth(80),
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        padding: responsiveWidth(5),
        alignItems: 'center',
        marginBottom: responsiveHeight(15),
    },
    tooltipText: {
        color: 'white',
        fontSize: responsiveFontSize(2),
        textAlign: 'center',
        marginBottom: responsiveHeight(2),
    },
    closeButton: {
        backgroundColor: 'white',
        paddingVertical: responsiveHeight(1),
        paddingHorizontal: responsiveWidth(5),
        borderRadius: 5,
    },
    closeButtonText: {
        color: COLORS.primary,
        fontSize: responsiveFontSize(2),
        textAlign: 'center',
    },
});

export default OnboardingTooltip;