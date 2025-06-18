import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  FlatList,
  View,
  Image,
  ActivityIndicator
} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { encode } from 'base-64';
import COLORS from '../../../consts/colors';


import {
  callConnectSpotify
} from '../../../Services/Auth/SignupService';
import {
  getUserDetail,
  storeUserDetail
} from '../../../HelperFunctions/AsyncStorage/userDetail';



// const CLIENT_ID = '75b7acc2c38b4ae19442aa358208d7f5';
// const CLIENT_SECRET = '71953ce4efa643b68dfeb4873ed3e804';
const CLIENT_ID = 'edb2909b13fe434fbd35717fa7d727e8';
const CLIENT_SECRET = 'becd6b59fd4e4d8981d67ccd54fd0d21';
const REDIRECT_URI = 'fateapp://callback';
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=user-library-read%20playlist-read-private&show_dialog=true`;

const ConnectSpotify = ({ navigation, route }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingToken, setIsFetchingToken] = useState(false); // Prevent duplicate login issues

  // Function to exchange authorization code for access token
  const exchangeCodeForToken = async (code, retry = true) => {
    if (isFetchingToken) return;
    setIsFetchingToken(true);
    setLoading(true); // Show loader

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encode(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
        }).toString(),
      });

      const data = await response.json();

      if (data.access_token) {
        setAccessToken(data.access_token);
        console.log('✅ Access Token:', data.access_token);
      } else {
        console.error('⚠️ No token received:', data);

        // 🔁 **Auto-retry login if `invalid_grant` and retry allowed**
        if (data.error === 'invalid_grant' && retry) {
          console.log("🔄 Retrying login...");
          loginWithSpotify(false); // Retry without infinite loops
        }
      }
    } catch (error) {
      console.error('❌ Error exchanging code for token:', error);
    } finally {
      setIsFetchingToken(false);
      setLoading(false); // Hide loader
    }
  };

  // Function to log in with Spotify
  const loginWithSpotify = async (allowRetry = true) => {
    if (isFetchingToken) return; // Prevent duplicate logins

    try {
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.openAuth(AUTH_URL, REDIRECT_URI, {
          dismissButtonStyle: 'cancel',
          // Callback function for dismiss button
          onDismiss: () => {
            navigation.goBack();
          },
        });
        if (result.type === 'success' && result.url.includes('?code=')) {
          const code = result.url.split('?code=')[1];
          exchangeCodeForToken(code, allowRetry); // Pass retry flag
        } else if (result.type === 'cancel') {
          // Navigate back to the previous screen if the user cancels the login
          navigation.goBack();
        }
      } else {
        console.error('🚫 InAppBrowser not available');
      }
    } catch (error) {
      console.error('❌ Error opening InAppBrowser:', error);
    }
  };

  // Automatically log in with Spotify if autoLogin parameter is present
  useEffect(() => {
    if (route.params?.autoLogin) {
      loginWithSpotify();
    }
  }, [route.params?.autoLogin]);

  // **Automatically Fetch First Playlist & Tracks When Token is Set**
  useEffect(() => {
    if (accessToken) {
      fetchFirstPlaylist(accessToken);
    }
  }, [accessToken]); // Runs when accessToken updates

  // **Fetch first playlist and its tracks automatically**
  const fetchFirstPlaylist = async (token) => {
    try {
      setLoading(true);
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=1', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data?.items?.length > 0) {
        const firstPlaylistId = data?.items[0]?.id;
        console.log('First Playlist:', data?.items[0]?.name);

        // **Now fetch tracks from the first playlist**
        fetchPlaylistTracks(token, firstPlaylistId);
      } else {
        console.log('No playlists found');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching first playlist:', error);
      setLoading(false);
    }
  };

  // Fetch tracks from a given playlist
  const fetchPlaylistTracks = async (token, playlistId) => {
    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setTracks(data?.items);
      handleCallAPI(data?.items);
      console.log('Tracks in Playlist:', data.items);
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const logoutFromSpotify = async () => {
    try {
      // Open Spotify's official logout page to clear browser session
      const logoutUrl = 'https://accounts.spotify.com/en/logout';

      // Check if InAppBrowser is available
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(logoutUrl, {
          // Optional configs
          dismissButtonStyle: 'close',
          preferredBarTintColor: '#000000',
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalEnabled: true,
          enableBarCollapsing: false,
        });
      } else {
        console.warn('InAppBrowser not available. Cannot fully log out from Spotify session.');
      }

      // ✅ Clear local app states
      setAccessToken(null);
      setTracks([]);
      setLoading(false);
      setIsFetchingToken(false);

      console.log("✅ Logged out from Spotify and cleared local session.");

    } catch (error) {
      console.error("❌ Error logging out from Spotify:", error);
    }
  };

  const handleCallAPI = async (track) => {
    try {
      setLoading(true);
      const userDetail = await getUserDetail();


      const data = {
        user_id: userDetail?.data?.id,
        spotify_data: track
      };

      console.log('Data:', JSON.stringify(data, null, 2));
      const response = await callConnectSpotify(data);
      console.log('<<<Response>>>:', response?.data);
      if (response?.error === false) {
        await storeUserDetail(response?.data);
        setLoading(true);
        navigation.navigate('EditProfile', {
          account_connected: 'TRUE',
          account_type: 'SPOTIFY'
        });
      }
    } catch (error) {
      setLoading(true);
      console.error('Error calling API:', error);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      {!accessToken && (
        <TouchableOpacity onPress={loginWithSpotify} style={{ marginBottom: 20 }}>
          <ActivityIndicator
            size="large"

            color={COLORS.primary}
            animating={true}
          />
        </TouchableOpacity>
      )}

      {accessToken && (
        <>
          {/* <TouchableOpacity onPress={logoutFromSpotify} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, color: 'white', padding: 15, backgroundColor: 'red', borderRadius: 10 }}>
              Log Out
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCallAPI} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, color: 'white', padding: 15, backgroundColor: 'red', borderRadius: 10 }}>
              CAll API
            </Text>
          </TouchableOpacity> */}

          <ActivityIndicator
            size="large"

            color={COLORS.primary}
            animating={true}
          />

          {/* {loading && <Text style={{ fontSize: 18, color: 'black', marginVertical: 10 }}>Loading Tracks...</Text>} */}

          {/* Display Tracks Automatically */}
          {/* {tracks.length > 0 && (
            <>


              <FlatList
                data={tracks}
                keyExtractor={(item) => item.track.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      console.log('Track:', JSON.stringify(item.track, null, 2));
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#A73489',
                      borderRadius: 15,
                      padding: 10,
                      marginVertical: 5,
                      marginHorizontal: 10,
                      width: '90%',
                    }}
                  >
                 
                    <View
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 10,
                        overflow: 'hidden',
                        marginRight: 10,
                      }}
                    >
                      <Image
                        source={{ uri: item.track.album.images[0].url }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </View>

                
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: 'white',
                        }}
                      >
                        {item.track.name} - {item.track.artists[0].name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                style={{ width: '100%' }}
              />
            </>
          )} */}
        </>
      )}
    </SafeAreaView>
  );
};

export default ConnectSpotify;
