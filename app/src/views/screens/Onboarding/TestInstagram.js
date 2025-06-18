import React, { useState, useEffect } from 'react';
import { View, Text, Button, Linking, Alert, Image } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';

const IG_APP_ID = '606060608979366';
const IG_APP_SECRET = '6f855e094b5089e63095cee4eee071fb';
// WARNING: Not secure to store secret here in production.
const REDIRECT_URI = 'https://backend.fatedating.com/instagram-redirect'; // Use the custom URI scheme
// Must match your Android/iOS deep link and the "Valid OAuth Redirect URI" in your FB dev app.
const SCOPES = ['pages_show_list', 'instagram_basic'].join(',');

export default function InstagramSinglePageFlow() {
  const [authCode, setAuthCode] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [media, setMedia] = useState([]);

  // 1. Listen for the deep link "myapp://instagram-auth?code=XYZ"
  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url; // e.g. "myapp://instagram-auth?code=XYZ&granted_scopes=..."
      console.log('Deep link URL:', url);
      if (url.includes('code=')) {
        // Parse out the "code" param
        const codeParam = url.split('code=')[1];
        if (codeParam) {
          const code = codeParam.split('&')[0]; // just in case
          console.log('Parsed auth code:', code);
          setAuthCode(code);
        }
        // Close the in-app browser if it's still open
        InAppBrowser.close();
      }
    };

    // Subscribe to Linking events
    Linking.addEventListener('url', handleDeepLink);
    return () => {
      Linking.removeEventListener('url', handleDeepLink);
    };
  }, []);

  // 2. When we get "authCode", exchange it for an access token
  // useEffect(() => {
  //   if (authCode) {
  //     (async () => {
  //       try {
  //         console.log('Exchanging auth code for access token...');
  //         // POST to exchange code for short-lived token
  //         const response = await fetch(
  //           `https://api.instagram.com/v22.0/oauth/access_token?client_id=${IG_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${IG_APP_SECRET}&code=${authCode}`,
  //           { method: 'POST' }
  //         );
  //         const data = await response.json();
  //         if (data.access_token) {
  //           console.log('Access token received:', data.access_token);
  //           setAccessToken(data.access_token);
  //         } else {
  //           console.error('Token Exchange Error:', data);
  //           Alert.alert('Token Exchange Error', JSON.stringify(data));
  //         }
  //       } catch (err) {
  //         console.error('Network Error:', err);
  //         Alert.alert('Network Error', err.message);
  //       }
  //     })();
  //   }
  // }, [authCode]);

  const getAccessToken = async () => {
    try {
      console.log('Exchanging auth code for access token...');
      // POST to exchange code for short-lived token
      // const response = await fetch(`https://graph.facebook.com/v22.0/oauth/access_token?client_id=1340341350644298&client_secret=${IG_APP_SECRET}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code=${authCode}`, {
      const response = await fetch(`https://api.instagram.com/oauth/access_token?client_id=1340341350644298&client_secret=${IG_APP_SECRET}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code=${authCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: '1340341350644298',
          client_secret: '6f855e094b5089e63095cee4eee071fb',
          grant_type: 'authorization_code',
          redirect_uri: 'https://backend.fatedating.com/instagram-redirect',
          code: authCode,
        }),
      });

      const data = await response.json();
      console.log('Data:', data);

      if (data.access_token) {
        console.log('Access token received:', data.access_token);
        setAccessToken(data.access_token);
      } else {
        console.error('Token Exchange Error:', data);
        Alert.alert('Token Exchange Error', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Network Error:', err);
      Alert.alert('Network Error', err.message);
    }
  };

  // 3. Once we have an access token, fetch IG user data & media
  // useEffect(() => {
  //   if (accessToken) {
  //     (async () => {
  //       try {
  //         console.log('Fetching IG user data and media...');
  //         // 3a) Get IG User ID from the Facebook Pages
  //         let resp = await fetch(
  //           `https://api.instagram.com/v22.0/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
  //         );
  //         let json = await resp.json();
  //         console.log('Fetched IG User ID:', json);
  //         const igAccount = json.data?.[0]?.instagram_business_account?.id;
  //         if (!igAccount) {
  //           console.error('No linked Instagram Business account found:', json);
  //           Alert.alert('Error', 'No linked Instagram Business account found.');
  //           return;
  //         }

  //         // 3b) Fetch username + profile pic
  //         resp = await fetch(
  //           `https://api.instagram.com/v22.0/${igAccount}?fields=username,profile_picture_url&access_token=${accessToken}`
  //         );
  //         let userData = await resp.json();
  //         console.log('Fetched IG User Data:', userData);
  //         setUserInfo(userData);

  //         // 3c) Fetch recent media
  //         resp = await fetch(
  //           `https://api.instagram.com/v22.0/${igAccount}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink&access_token=${accessToken}`
  //         );
  //         let mediaData = await resp.json();
  //         console.log('Fetched IG Media Data:', mediaData);
  //         setMedia(mediaData.data || []);
  //       } catch (err) {
  //         console.error('Error fetching IG data:', err);
  //         Alert.alert('Error fetching IG data', err.message);
  //       }
  //     })();
  //   }
  // }, [accessToken]);

  const getUserData = async () => {
    try {
      console.log('Fetching IG user data and media...');
      // 3a) Get IG User ID from the Facebook Pages
      let resp = await fetch(
        `https://api.instagram.com/v22.0/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
      );
      let json = await resp.json();
      console.log('Fetched IG User ID:', json);
      const igAccount = json.data?.[0]?.instagram_business_account?.id;
      if (!igAccount) {
        console.error('No linked Instagram Business account found:', json);
        Alert.alert('Error', 'No linked Instagram Business account found.');
        return;
      }

      // 3b) Fetch username + profile pic
      resp = await fetch(
        `https://graph.facebook.com/v22.0/${igAccount}?fields=username,profile_picture_url&access_token=${accessToken}`
      );
      let userData = await resp.json();
      console.log('Fetched IG User Data:', userData);
      setUserInfo(userData);

      // 3c) Fetch recent media
      resp = await fetch(
        `https://graph.facebook.com/v22.0/${igAccount}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink&access_token=${accessToken}`
      );
      let mediaData = await resp.json();
      console.log('Fetched IG Media Data:', mediaData);
      setMedia(mediaData.data || []);
    } catch (err) {
      console.error('Error fetching IG data:', err);
      Alert.alert('Error fetching IG data', err.message);
    }
  };

  // Function to open the Facebook/Instagram OAuth in an in-app browser
  const handleLoginWithInstagram = async () => {
    const authUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${IG_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPES}&response_type=code`;

    try {
      console.log('Opening InAppBrowser with URL:', authUrl);
      const result = await InAppBrowser.openAuth(authUrl.trim(), REDIRECT_URI, {
        // optional custom in-app browser configs
        // Add onNavigationStateChange to track URL changes
        onNavigationStateChange: (event) => {
          console.log('InAppBrowser URL changed:', event.url);
          if (event.url.includes('code=')) {
            console.log('Redirect URI matched, closing browser...');
            InAppBrowser.close();
          }
        },
      });

      if (result.type === 'success' && result.url) {
        // result.url will be "myapp://instagram-auth?code=XYZ..."
        // parse out the code here
        const codeParam = result.url.split('code=')[1];
        if (codeParam) {
          const code = codeParam.split('&')[0];
          console.log('Got auth code:', code);
          setAuthCode(code);
        }
      }
    } catch (error) {
      Alert.alert('InAppBrowser Error', error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, marginTop: 50 }}>
      {!accessToken && (
        <Button title="Login with Instagram" onPress={handleLoginWithInstagram} />
      )}
      <Button title="Get Token" onPress={getAccessToken} />
      <Button title="Get User Data" onPress={getUserData} />

      {userInfo && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>Username: {userInfo.username}</Text>
          {userInfo.profile_picture_url && (
            <Image
              source={{ uri: userInfo.profile_picture_url }}
              style={{ width: 80, height: 80, borderRadius: 40, marginTop: 10 }}
            />
          )}
        </View>
      )}

      {media.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Latest Posts:</Text>
          {media.map((m) => (
            <View key={m.id} style={{ marginBottom: 20 }}>
              {m.caption && <Text>{m.caption}</Text>}
              {m.media_type === 'IMAGE' || m.media_type === 'CAROUSEL_ALBUM' ? (
                <Image
                  source={{ uri: m.media_url }}
                  style={{ width: 200, height: 200, marginVertical: 10 }}
                />
              ) : m.media_type === 'VIDEO' ? (
                <Text>Video URL: {m.media_url}</Text>
              ) : null}
              <Text>Posted: {m.timestamp}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
