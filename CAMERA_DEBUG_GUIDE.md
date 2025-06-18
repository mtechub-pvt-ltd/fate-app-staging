# Camera Crash Debug Guide

## Common Camera Crash Issues and Solutions

### 1. **Memory Issues**
**Symptoms:** App crashes after taking a photo, especially on iOS
**Solutions:**
- Reduced image quality from 0.8 to 0.6-0.7
- Reduced max dimensions from 1200x1200 to 800x800
- Set `saveToPhotos: false` to prevent iOS memory issues
- Added file size validation (10MB limit)

### 2. **Permission Issues**
**Symptoms:** Camera opens but crashes immediately, or permission denied errors
**Solutions:**
- Added comprehensive permission checking for both platforms
- Separate handling for Android 13+ media permissions
- iOS photo library permissions with LIMITED access support
- Better error messages with settings navigation

### 3. **Timing Issues**
**Symptoms:** Camera opens but UI freezes or crashes
**Solutions:**
- Added delays before opening camera/gallery (500ms)
- Proper cleanup of loading states
- Better error recovery mechanisms

### 4. **Platform-Specific Issues**

#### iOS Specific:
- Set `saveToPhotos: false` to prevent crashes
- Use `presentationStyle: 'fullScreen'` for gallery
- Handle LIMITED photo access properly
- Added specific iOS camera configuration

#### Android Specific:
- Different permissions for Android 13+ (READ_MEDIA_IMAGES vs READ_EXTERNAL_STORAGE)
- Proper storage options configuration
- Handle NEVER_ASK_AGAIN permission state

### 5. **Error Handling Improvements**
- Comprehensive error code handling
- Better user feedback for different error types
- Proper cleanup on errors
- Graceful fallbacks

### 6. **Best Practices Implemented**
- Use CameraUtils utility class for consistent behavior
- Proper state management with loading indicators
- Memory-conscious image processing
- Platform-specific optimizations

## Testing Checklist

### Before Release:
1. Test camera on both iOS and Android devices
2. Test with different iOS photo permission states (Full, Limited, Denied)
3. Test with low memory conditions
4. Test permission denial and settings navigation
5. Test rapid camera open/close operations
6. Test with different image sizes and formats

### Debug Commands:
```bash
# iOS Simulator reset (if needed)
xcrun simctl erase all

# Android Debug
adb logcat | grep -i camera

# React Native Debug
npx react-native log-ios
npx react-native log-android
```

### Common Error Codes:
- `camera_unavailable`: Device doesn't have camera
- `permission`: Permission denied
- `others`: Generic error (often memory related)

### Memory Monitoring:
- Use Xcode Instruments for iOS memory profiling
- Monitor Android memory usage with `adb shell dumpsys meminfo`
