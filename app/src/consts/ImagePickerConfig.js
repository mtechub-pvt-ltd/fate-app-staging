/**
 * Memory optimization configuration for React Native Image Picker
 * This helps prevent camera crashes on both iOS and Android
 */

import { Platform } from 'react-native';

export const IMAGE_PICKER_CONFIG = {
    // Reduce memory usage by limiting image dimensions
    MAX_IMAGE_HEIGHT: Platform.OS === 'ios' ? 800 : 1000,
    MAX_IMAGE_WIDTH: Platform.OS === 'ios' ? 800 : 1000,

    // Lower quality to reduce memory footprint
    IMAGE_QUALITY: Platform.OS === 'ios' ? 0.6 : 0.7,

    // File size limit (10MB)
    MAX_FILE_SIZE: 10 * 1024 * 1024,

    // Common camera options
    CAMERA_OPTIONS: {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: Platform.OS === 'ios' ? 800 : 1000,
        maxWidth: Platform.OS === 'ios' ? 800 : 1000,
        quality: Platform.OS === 'ios' ? 0.6 : 0.7,
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
    },

    // Common gallery options
    GALLERY_OPTIONS: {
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
    }
};

export default IMAGE_PICKER_CONFIG;
