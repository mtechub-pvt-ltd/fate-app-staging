import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import CookieManager from '@react-native-cookies/cookies';
import {
  callConnectInstagram
} from '../../../Services/Auth/SignupService';
import {
  getUserDetail,
  storeUserDetail
} from '../../../HelperFunctions/AsyncStorage/userDetail';
import COLORS from '../../../consts/colors';
// USAMA ONE
// const INSTAGRAM_CLIENT_ID = '1340341350644298';
// const INSTAGRAM_CLIENT_SECRET = '6f855e094b5089e63095cee4eee071fb';

// FATE ONE 
const INSTAGRAM_CLIENT_ID = '1216207446900452';
const INSTAGRAM_CLIENT_SECRET = 'bf9a4cd2551a822ffa90736479ce6670';
const REDIRECT_URI = 'https://backend.fatedating.com/instagram-redirect';
// const SCOPES = 'instagram_graph_user_profile,instagram_graph_user_media';
const SCOPES = 'instagram_business_basic';

const InstagramLogin = ({ navigation, route }) => {
  const [authCode, setAuthCode] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [userMedia, setUserMedia] = useState([]);
  const [showWebView, setShowWebView] = useState(false);
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);
  const [webViewKey, setWebViewKey] = useState(0); // Add key state to force WebView reload
  const webViewRef = useRef();

  // useEffect(() => {
  //   if (authCode) {
  //     exchangeCodeForToken(authCode);
  //   }
  // }, [authCode]);

  // Automatically log in with instagram if autoLogin parameter is present
  useEffect(() => {
    if (route.params?.autoLogin) {
      handleLoginPress();
    }
  }, [route.params?.autoLogin]);

  // Add safety timeout for blank screens
  useEffect(() => {
    let timeoutId;
    if (showWebView && isWebViewLoading) {
      // If the WebView is still loading after 15 seconds, assume something went wrong
      timeoutId = setTimeout(() => {
        if (isWebViewLoading) {
          console.log('WebView loading timed out, reloading...');
          setWebViewKey(prev => prev + 1); // Force a reload

          // If we've had multiple timeouts, give up and show an error
          if (webViewKey > 2) {
            setIsWebViewLoading(false);
            setShowWebView(false);
            Alert.alert(
              'Connection Issue',
              'We\'re having trouble connecting to Instagram. Please try again later.',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          }
        }
      }, 15000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showWebView, isWebViewLoading, webViewKey]);

  const clearCookies = async () => {
    try {
      // Clear all cookies for both platforms
      await CookieManager.clearAll();
      console.log('Cookies cleared successfully');

      // For Android, we can also try clearing specific domains if needed
      if (Platform.OS === 'android') {
        try {
          await CookieManager.clearAll(true);
          // Try to specifically clear instagram.com cookies if the above wasn't enough
          await CookieManager.clearCookies('instagram.com');
          console.log('Android-specific cookie clearing completed');
        } catch (e) {
          console.log('Android-specific cookie clearing error:', e);
        }
      }
    } catch (err) {
      console.error('Cookie clear error:', err);
    }
  };

  const handleLoginPress = async () => {
    await clearCookies();
    setIsWebViewLoading(true);
    setWebViewKey(prev => prev + 1); // Force WebView to completely reload with a new key
    setShowWebView(true);
  };

  const handleNavigationChange = (navState) => {
    const { url } = navState;
    if (url && url.startsWith(REDIRECT_URI)) {
      console.log('Redirect URL detected:', url);

      const codeMatch = url.match(/code=([^&]+)/);
      if (codeMatch) {
        const code = codeMatch[1];
        console.log('Auth code obtained:', code);
        setAuthCode(code);
        exchangeCodeForToken(code);
        setShowWebView(false);
      } else {
        // Handle case where no code is in the URL
        console.log('No code found in redirect URL');
        setShowWebView(false);
        navigation.goBack();
      }
    }
  };

  const exchangeCodeForToken = async (code) => {
    try {
      const response = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `client_id=${INSTAGRAM_CLIENT_ID}&client_secret=${INSTAGRAM_CLIENT_SECRET}&grant_type=authorization_code&redirect_uri=${REDIRECT_URI}&code=${code}`,
      });

      const responseText = await response.text(); // Read response as text for debugging
      console.log('Exchange Token Response:', responseText);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = JSON.parse(responseText); // Parse JSON if content-type is JSON
        if (data.access_token) {
          setAccessToken(data.access_token);
          const [media, profile] = await Promise.all([fetchUserMedia(data.access_token), fetchUserProfile(data.access_token)]);
          console.log('profile>>>>>>>>>>>>>>', profile);
          const instagram_data = {
            media: media,
            profile: profile,
          };
          handleCallAPI(instagram_data);
        } else {
          Alert.alert('Token Error', JSON.stringify(data));
        }
      } else {
        console.error('Non-JSON Response:', responseText);
        handleUnknownError();
      }
    } catch (err) {
      console.error('Exchange Error:', err);
      handleUnknownError();
    }
  };

  const handleUnknownError = () => {
    Alert.alert(
      'Connection Error',
      'Instagram is having some issues connecting your profile. Please try again later or ensure your account is not private.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(), // Navigate back to the previous screen
        },
      ]
    );
  };

  const fetchUserMedia = async (token) => {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,timestamp&access_token=${token}`
      );
      const data = await response.json();


      setUserMedia(data.data || []);
      return data.data;
    } catch (err) {
      Alert.alert('Fetch Media Error', err.message);
    }
  };
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`https://graph.instagram.com/me?fields=id,profile_picture_url,username,account_type,media_count&access_token=${token}`);

      const dataProfile = await response.json();

      return dataProfile;
    } catch (err) {
      Alert.alert('Fetch Media Error', err.message);
    }
  };

  const logout = async () => {
    await clearCookies();
    setAccessToken(null);
    setUserMedia([]);
    setAuthCode(null);
  };

  const renderMedia = ({ item }) => (
    <View style={styles.mediaItem}>
      {item.media_type === 'IMAGE' && (
        <Image source={{ uri: item.media_url }} style={styles.mediaImage} />
      )}
      {item.media_type === 'VIDEO' && <Text>Video URL: {item.media_url}</Text>}
      <Text>{item.caption}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );


  const handleCallAPI = async (instagram_data) => {
    try {

      const userDetail = await getUserDetail();


      const data = {
        user_id: userDetail?.data?.id,
        instagram_data: instagram_data
      };

      console.log('<<<   Data   >>>:', data);
      const response = await callConnectInstagram(data);
      console.log('<<<   Response   >>>:', response?.data);
      if (response?.error === false) {
        await storeUserDetail(response?.data);
        // navigation.navigate('Home');
        navigation.navigate('EditProfile', {
          account_connected: 'TRUE',
          account_type: 'INSTAGRAM',
        });
      }
    } catch (error) {
      console.error('Error calling API:', error);
    }
  }
  return (
    <View style={styles.container}>

      <>
        {/* <TouchableOpacity style={[styles.button, styles.logout]} onPress={logout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity> */}
        {/* <FlatList
            data={userMedia}
            renderItem={renderMedia}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.mediaList}
          /> */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />
          <Text style={styles.loadingText}>Connecting your Instagram account...</Text>
        </View>
      </>


      {showWebView && (
        <View style={styles.webviewContainer}>
          <SafeAreaView style={styles.headerContainer}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setShowWebView(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Instagram</Text>
              <View style={styles.placeholder} />
            </View>
            {isWebViewLoading && (
              <View style={styles.loadingBar}>
                <View style={styles.loadingBarFill} />
              </View>
            )}
          </SafeAreaView>
          <WebView
            key={webViewKey} // Force a full reload of the WebView when key changes
            ref={webViewRef}
            source={{
              uri: `https://www.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&response_type=code`,
            }}
            injectedJavaScript={`
              localStorage.clear();
              sessionStorage.clear();
              document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
              });
              true;
            `}
            onNavigationStateChange={(navState) => {
              setIsWebViewLoading(navState.loading);
              if (navState.url && navState.url.startsWith(REDIRECT_URI)) {
                handleNavigationChange(navState);
                return false;
              }
            }}
            onLoadStart={() => setIsWebViewLoading(true)}
            onLoadEnd={() => setIsWebViewLoading(false)}
            onShouldStartLoadWithRequest={(request) => {
              // onShouldStartLoadWithRequest works on iOS
              const { url } = request;
              if (url && url.startsWith(REDIRECT_URI)) {
                handleNavigationChange({ url });
                return false;
              }
              return true;
            }}
            startInLoadingState
            style={{ flex: 1 }}
            javaScriptEnabled
            domStorageEnabled
            incognito={true} // Use incognito mode
            cacheEnabled={false} // Disable cache
            thirdPartyCookiesEnabled={false} // Disable third party cookies
            sharedCookiesEnabled={false} // Disable shared cookies (especially important for Android)
            androidHardwareAccelerationDisabled={Platform.OS === 'android'} // May help with Android issues
            userAgent={Platform.OS === 'android' ?
              'Mozilla/5.0 (Linux; Android 10; Android SDK built for x86) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36' :
              undefined} // Custom user agent for Android to avoid webview detection
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3897f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  logout: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  mediaItem: {
    marginBottom: 20,
    alignItems: 'center',
  },
  mediaImage: {
    width: 300,
    height: 300,
  },
  timestamp: {
    fontSize: 12,
    color: '#777',
  },
  mediaList: {
    paddingBottom: 20,
  },
  webviewContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    zIndex: 999,
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 0,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  loadingBar: {
    height: 3,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  loadingBarFill: {
    height: '100%',
    backgroundColor: '#007bff',
    width: '100%',
    opacity: 0.7,
  },
});

export default InstagramLogin;
