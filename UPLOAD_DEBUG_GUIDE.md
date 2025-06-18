# Image Upload Debug Guide for EditProfileNew.js

## Issues Fixed

### 1. ✅ Wrong Upload Endpoint
**Problem:** EditProfileNew.js was using `https://fate-be.mtechub.com/api/v1/user/upload-image`
**Solution:** Changed to `https://backend.fatedating.com/upload-file` (same as original EditProfile.js)

### 2. ✅ Incorrect Headers
**Problem:** Adding `Content-Type: multipart/form-data` header manually
**Solution:** Removed manual header - let FormData set it automatically

### 3. ✅ Null Safety Issues
**Problem:** Code was trying to access `userData.images` when userData was null
**Solution:** Added null safety: `[...(userData?.images || []), x]`

### 4. ✅ Poor Error Handling
**Problem:** Empty catch blocks with no error feedback
**Solution:** Added comprehensive error handling with flash messages

### 5. ✅ Network Connectivity
**Problem:** No network testing before upload attempts
**Solution:** Added `testNetworkConnection()` function

## Debugging Features Added

### 1. 🔍 Comprehensive Logging
- Full request/response logging
- FormData structure inspection
- Error stack traces
- Network failure detection

### 2. 🔍 Image Picker Validation
- URI validation
- File size checking
- Type verification
- Asset existence confirmation

### 3. 🔍 Network Testing
- Pre-upload connectivity check
- Fallback connectivity tests
- Server availability verification

## How to Debug Upload Issues

### Step 1: Check Console Logs
Look for these log patterns:
```
=== PROFILE IMAGE UPLOAD START ===
URI received: file:///path/to/image.jpg
Making fetch request to: https://backend.fatedating.com/upload-file
Response status: 200
✅ Profile image uploaded successfully
```

### Step 2: Common Error Patterns

#### Network Request Failed
```
❌ NETWORK REQUEST FAILED - This usually means:
1. No internet connection
2. Server is down  
3. CORS or network policy blocking request
4. Invalid URL or endpoint
```

**Solutions:**
1. Check internet connection
2. Verify server is running
3. Check network security config
4. Validate upload endpoint

#### Image Picker Issues
```
Gallery ImagePicker Error Code: camera_unavailable
Gallery ImagePicker Error Message: Camera not available
```

**Solutions:**
1. Check camera permissions
2. Test on physical device (not simulator)
3. Verify image picker configuration

#### FormData Issues
```
FormData keys: ["file"]
IMG File object to append: {uri: "...", type: "image/jpeg", name: "..."}
```

**Verify:**
1. URI is properly formatted
2. File type is supported
3. File exists at URI

### Step 3: Testing Steps

1. **Test Network Connectivity**
   ```javascript
   const networkOk = await testNetworkConnection();
   console.log('Network test result:', networkOk);
   ```

2. **Test Image Picker**
   - Try both camera and gallery
   - Check permissions in device settings
   - Verify on physical device

3. **Test Upload Endpoint**
   - Use tools like Postman to test upload endpoint
   - Verify server is accepting multipart/form-data
   - Check server logs for errors

## Configuration Files Checked

### Android (✅ Configured)
- `android:usesCleartextTraffic="true"` in AndroidManifest.xml
- Camera and storage permissions granted

### iOS (✅ Configured)  
- `NSAllowsArbitraryLoads: true` in Info.plist
- Camera and photo library permissions configured

## Next Steps if Issues Persist

1. **Test Original EditProfile.js**
   - Compare behavior with working version
   - Check if server endpoint is accessible

2. **Network Configuration**
   - Test with different networks (WiFi vs mobile)
   - Check corporate firewall settings
   - Verify DNS resolution

3. **Server-Side Investigation**
   - Check server logs during upload attempt
   - Verify upload endpoint is working
   - Test with curl/Postman

4. **Device-Specific Testing**
   - Test on different devices
   - Check iOS vs Android behavior
   - Verify permissions are granted

## Code Locations

- **Upload Functions:** Lines ~380-480 in EditProfileNew.js
- **Image Picker Functions:** Lines ~75-350 in EditProfileNew.js
- **Error Handling:** Throughout upload functions
- **Network Testing:** Lines ~600-620 in EditProfileNew.js

## Success Indicators

When working correctly, you should see:
1. ✅ Image picker logs showing successful selection
2. ✅ Network test passing
3. ✅ Upload logs showing 200 response
4. ✅ Image URL returned from server
5. ✅ Profile/images updated in UI
