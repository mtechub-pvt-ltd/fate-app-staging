import { Platform, Alert, PermissionsAndroid, Linking } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';

/**
 * Utility class for handling camera and gallery operations with proper error handling and memory management
 */
class CameraUtils {

    /**
     * Request camera permissions for both Android and iOS
     */
    static async requestCameraPermission() {
        try {
            if (Platform.OS === 'ios') {
                const result = await request(PERMISSIONS.IOS.CAMERA);
                console.log('iOS Camera permission status:', result);

                if (result === RESULTS.GRANTED) {
                    return { success: true };
                } else if (result === RESULTS.DENIED || result === RESULTS.BLOCKED) {
                    return {
                        success: false,
                        message: 'Camera permission is required to take photos. Please enable it in Settings.',
                        showSettings: true
                    };
                }
                return { success: false, message: 'Camera permission not granted.' };
            }

            if (Platform.OS === 'android') {
                // Check if permission is already granted
                const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);

                if (hasPermission) {
                    return { success: true };
                }

                // Request permission
                const result = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'This app needs access to camera to take photos',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );

                if (result === PermissionsAndroid.RESULTS.GRANTED) {
                    return { success: true };
                } else {
                    return {
                        success: false,
                        message: 'Camera permission is required to take photos.',
                        showSettings: result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
                    };
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Error requesting camera permission:', error);
            return {
                success: false,
                message: 'Failed to request camera permission. Please try again.'
            };
        }
    }

    /**
     * Request gallery/photo library permissions
     */
    static async requestGalleryPermission() {
        try {
            if (Platform.OS === 'ios') {
                const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
                console.log('iOS Photo Library permission status:', result);

                if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
                    return { success: true };
                } else if (result === RESULTS.DENIED || result === RESULTS.BLOCKED) {
                    return {
                        success: false,
                        message: 'Photo library access is required to select photos. Please enable it in Settings.',
                        showSettings: true
                    };
                }
                return { success: false, message: 'Photo library permission not granted.' };
            }

            if (Platform.OS === 'android') {
                // For Android 13+ (API level 33), use READ_MEDIA_IMAGES
                const permission = Platform.Version >= 33
                    ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                    : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

                const hasPermission = await PermissionsAndroid.check(permission);
                if (hasPermission) {
                    return { success: true };
                }

                const result = await PermissionsAndroid.request(permission, {
                    title: 'Gallery Permission',
                    message: 'This app needs access to your photo library to select photos',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                });

                if (result === PermissionsAndroid.RESULTS.GRANTED) {
                    return { success: true };
                } else {
                    return {
                        success: false,
                        message: 'Gallery permission is required to select photos.',
                        showSettings: result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
                    };
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Error requesting gallery permission:', error);
            return {
                success: false,
                message: 'Failed to request gallery permission. Please try again.'
            };
        }
    }

    /**
     * Launch camera with optimized settings to prevent crashes
     */
    static launchCameraWithOptions(callback, customOptions = {}) {
        const defaultOptions = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 800,  // Reduced to prevent memory issues
            maxWidth: 800,   // Reduced to prevent memory issues
            quality: 0.7,    // Reduced to prevent memory issues
            saveToPhotos: false, // Prevents iOS crashes
            ...(Platform.OS === 'android' && {
                storageOptions: {
                    skipBackup: true,
                    path: 'images',
                },
            }),
            ...(Platform.OS === 'ios' && {
                cameraType: 'back',
                durationLimit: 0,
            }),
            ...customOptions
        };

        // Add delay to ensure UI is ready
        setTimeout(() => {
            launchCamera(defaultOptions, (response) => {
                console.log('Camera response:', response);

                try {
                    // Handle user cancellation
                    if (response.didCancel) {
                        console.log('User cancelled camera');
                        callback({ success: false, cancelled: true });
                        return;
                    }

                    // Handle errors with specific messages
                    if (response.errorCode) {
                        console.log('Camera Error Code:', response.errorCode);
                        let errorMessage = 'Camera error occurred. Please try again.';

                        switch (response.errorCode) {
                            case 'camera_unavailable':
                                errorMessage = 'Camera is not available on this device.';
                                break;
                            case 'permission':
                                errorMessage = 'Camera permission is required. Please enable it in settings.';
                                break;
                            case 'others':
                                errorMessage = 'An unexpected error occurred. Please restart the app and try again.';
                                break;
                            default:
                                errorMessage = `Camera error: ${response.errorCode}`;
                        }

                        callback({ success: false, error: errorMessage });
                        return;
                    }

                    if (response.errorMessage) {
                        console.log('Camera Error Message:', response.errorMessage);
                        callback({ success: false, error: response.errorMessage });
                        return;
                    }

                    // Validate response structure
                    if (!response.assets || !Array.isArray(response.assets) || response.assets.length === 0) {
                        console.log('No image captured or invalid response structure');
                        callback({ success: false, error: 'No image was captured. Please try again.' });
                        return;
                    }

                    const asset = response.assets[0];
                    if (!asset || !asset.uri) {
                        console.log('No image URI received');
                        callback({ success: false, error: 'Failed to get image. Please try again.' });
                        return;
                    }

                    // Validate image file size
                    if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) { // 10MB limit
                        callback({ success: false, error: 'Image is too large. Please select an image smaller than 10MB.' });
                        return;
                    }

                    // Success case
                    callback({
                        success: true,
                        uri: asset.uri,
                        asset: asset
                    });

                } catch (error) {
                    console.error('Error processing camera response:', error);
                    callback({ success: false, error: 'Failed to process the captured image. Please try again.' });
                }
            });
        }, 300);
    }

    /**
     * Launch gallery with optimized settings
     */
    static launchGalleryWithOptions(callback, customOptions = {}) {
        const defaultOptions = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 1200,
            maxWidth: 1200,
            quality: 0.8,
            selectionLimit: 1,
            presentationStyle: 'fullScreen',
            ...(Platform.OS === 'android' && {
                storageOptions: {
                    skipBackup: true,
                    path: 'images',
                },
            }),
            ...customOptions
        };

        // Add delay to ensure UI is ready
        setTimeout(() => {
            launchImageLibrary(defaultOptions, (response) => {
                console.log('Gallery response:', response);

                try {
                    if (response.didCancel) {
                        console.log('User cancelled gallery');
                        callback({ success: false, cancelled: true });
                        return;
                    }

                    if (response.errorCode) {
                        console.log('Gallery Error Code:', response.errorCode);
                        callback({ success: false, error: `Gallery error: ${response.errorCode}` });
                        return;
                    }

                    if (response.errorMessage) {
                        console.log('Gallery Error Message:', response.errorMessage);
                        callback({ success: false, error: response.errorMessage });
                        return;
                    }

                    if (!response.assets || response.assets.length === 0) {
                        console.log('No image selected');
                        callback({ success: false, cancelled: true });
                        return;
                    }

                    const asset = response.assets[0];
                    if (!asset.uri) {
                        console.log('No image URI received');
                        callback({ success: false, error: 'Failed to get image. Please try again.' });
                        return;
                    }

                    // Validate image file size
                    if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) { // 10MB limit
                        callback({ success: false, error: 'Image is too large. Please select an image smaller than 10MB.' });
                        return;
                    }

                    // Success case
                    callback({
                        success: true,
                        uri: asset.uri,
                        asset: asset
                    });

                } catch (error) {
                    console.error('Error processing gallery response:', error);
                    callback({ success: false, error: 'Failed to process the selected image. Please try again.' });
                }
            });
        }, 300);
    }

    /**
     * Show permission alert with option to open settings
     */
    static showPermissionAlert(message, showSettings = false) {
        const buttons = [{ text: 'Cancel', style: 'cancel' }];

        if (showSettings) {
            buttons.push({
                text: 'Open Settings',
                onPress: () => {
                    if (Platform.OS === 'ios') {
                        Linking.openURL('app-settings:');
                    } else {
                        openSettings();
                    }
                }
            });
        }

        Alert.alert('Permission Required', message, buttons);
    }
}

export default CameraUtils;
