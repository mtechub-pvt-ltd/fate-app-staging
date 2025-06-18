import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
    Platform,
} from 'react-native';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import COLORS from '../../consts/colors';
import fonts from '../../consts/fonts';

const { width, height } = Dimensions.get('window');

const CustomTooltip = ({
    isVisible,
    content,
    placement = 'top',
    onClose = () => { },
    targetRef,
    targetMeasurements,
    children,
    childrenWrapperStyle = {},
    backgroundColor = 'rgba(0, 0, 0, 0.5)',
    tooltipStyle = {},
    contentStyle = {},
    arrowSize = { width: 16, height: 8 },
}) => {
    // Calculate tooltip position based on target measurements
    const getTooltipPosition = () => {
        if (!targetMeasurements) {
            return { top: height / 2 - 100, left: width / 2 - 150 };
        }

        const { x, y, width: targetWidth, height: targetHeight } = targetMeasurements;

        // Default tooltip dimensions - can be adjusted
        const tooltipWidth = 300;
        const tooltipHeight = 150;

        let tooltipX = x + (targetWidth / 2) - (tooltipWidth / 2);
        let tooltipY;

        // Keep tooltip within screen bounds
        tooltipX = Math.max(20, Math.min(tooltipX, width - tooltipWidth - 20));

        let arrowLeft = x + targetWidth / 2 - tooltipX;

        // Position tooltip based on placement
        if (placement === 'top') {
            tooltipY = y - tooltipHeight - 10;
        } else if (placement === 'bottom') {
            tooltipY = y + targetHeight + 10;
        } else if (placement === 'left') {
            tooltipX = x - tooltipWidth - 10;
            tooltipY = y + (targetHeight / 2) - (tooltipHeight / 2);
        } else if (placement === 'right') {
            tooltipX = x + targetWidth + 10;
            tooltipY = y + (targetHeight / 2) - (tooltipHeight / 2);
        } else if (placement === 'center') {
            tooltipY = y + (targetHeight / 2) - (tooltipHeight / 2);
        }

        // Make sure tooltip is visible on screen
        tooltipY = Math.max(50, Math.min(tooltipY, height - tooltipHeight - 50));

        return {
            tooltipPosition: {
                top: tooltipY,
                left: tooltipX
            },
            arrowPosition: {
                left: arrowLeft,
            }
        };
    };

    const { tooltipPosition, arrowPosition } = getTooltipPosition();

    // Render the arrow based on placement
    const renderArrow = () => {
        if (!targetMeasurements) return null;

        const arrowStyle = {
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            position: 'absolute',
        };

        if (placement === 'bottom') {
            return (
                <View
                    style={[
                        arrowStyle,
                        {
                            top: -arrowSize.height,
                            left: arrowPosition.left - arrowSize.width / 2,
                            borderLeftWidth: arrowSize.width / 2,
                            borderRightWidth: arrowSize.width / 2,
                            borderBottomWidth: arrowSize.height,
                            borderLeftColor: 'transparent',
                            borderRightColor: 'transparent',
                            borderBottomColor: COLORS.primary,
                        }
                    ]}
                />
            );
        } else if (placement === 'top') {
            return (
                <View
                    style={[
                        arrowStyle,
                        {
                            bottom: -arrowSize.height,
                            left: arrowPosition.left - arrowSize.width / 2,
                            borderLeftWidth: arrowSize.width / 2,
                            borderRightWidth: arrowSize.width / 2,
                            borderTopWidth: arrowSize.height,
                            borderLeftColor: 'transparent',
                            borderRightColor: 'transparent',
                            borderTopColor: COLORS.primary,
                        }
                    ]}
                />
            );
        }

        return null;
    };

    return (
        <>
            {/* Wrap children in a View to measure position */}
            <View ref={targetRef} style={childrenWrapperStyle}>
                {children}
            </View>

            {/* Modal for tooltip */}
            {isVisible && (
                <Modal
                    transparent
                    visible={isVisible}
                    animationType="fade"
                    onRequestClose={onClose}
                >
                    <TouchableWithoutFeedback onPress={onClose}>
                        <View style={[styles.modalBackground, { backgroundColor }]}>
                            <TouchableWithoutFeedback>
                                <View
                                    style={[
                                        styles.tooltipContainer,
                                        tooltipStyle,
                                        tooltipPosition
                                    ]}
                                >
                                    {renderArrow()}
                                    <View style={[styles.tooltipContent, contentStyle, { alignItems: 'center', justifyContent: 'center', textAlign: 'center' }]}>
                                        {typeof content === 'string' ? (
                                            <Text style={{ color: COLORS.white, fontSize: responsiveFontSize(2), fontFamily: fonts.PoppinsRegular }}>
                                                {content}
                                            </Text>
                                        ) : (
                                            content
                                        )}
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    tooltipContainer: {
        position: 'absolute',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        width: responsiveWidth(80),
    },
    tooltipContent: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        padding: responsiveWidth(4),
        width: '100%',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 5,
            },
        }),
    }
});

export default CustomTooltip;