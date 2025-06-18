import { Platform, Dimensions, StatusBar } from 'react-native';

/**
 * Platform utility functions to handle iOS and Android differences
 */

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Get device dimensions
const { width, height } = Dimensions.get('window');
export const deviceWidth = width;
export const deviceHeight = height;

/**
 * Returns the appropriate value based on platform
 * @param {any} iosValue - Value to return for iOS
 * @param {any} androidValue - Value to return for Android
 * @returns {any} Platform specific value
 */
export const platformSelect = (iosValue, androidValue) => {
    return isIOS ? iosValue : androidValue;
};

/**
 * Get the height of the status bar
 * @returns {number} Status bar height
 */
export const getStatusBarHeight = () => {
    return isIOS ?
        (deviceHeight === 812 || deviceHeight === 896 || deviceHeight > 900 ? 44 : 20) :
        StatusBar.currentHeight || 0;
};

/**
 * Get the bottom inset for safe area (for iPhone X and above)
 * @returns {number} Bottom inset in pixels
 */
export const getBottomInset = () => {
    return isIOS && (deviceHeight === 812 || deviceHeight === 896 || deviceHeight > 900) ? 34 : 0;
};

/**
 * Check if the device is iPhone X or newer models with notch
 * @returns {boolean} True if device has a notch
 */
export const hasNotch = () => {
    return isIOS && (deviceHeight === 812 || deviceHeight === 896 || deviceHeight > 900);
};

/**
 * Add platform-specific styling
 * @param {Object} styles - Common styles
 * @param {Object} iosStyles - iOS specific styles
 * @param {Object} androidStyles - Android specific styles
 * @returns {Object} Combined styles for current platform
 */
export const platformStyles = (styles, iosStyles = {}, androidStyles = {}) => {
    const platformSpecific = isIOS ? iosStyles : androidStyles;
    return { ...styles, ...platformSpecific };
};

export default {
    isIOS,
    isAndroid,
    deviceWidth,
    deviceHeight,
    platformSelect,
    getStatusBarHeight,
    getBottomInset,
    hasNotch,
    platformStyles
};