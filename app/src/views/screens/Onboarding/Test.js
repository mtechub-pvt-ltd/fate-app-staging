import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import TrackPlayer, {
  Capability,
  State,
  useProgress,
  usePlaybackState,
  AppKilledPlaybackBehavior,
  Event,
  useTrackPlayerEvents,
} from 'react-native-track-player';

import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Icon from 'react-native-vector-icons/FontAwesome';
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions';
import COLORS from '../../../consts/colors';

// Add global initialization flag (outside component)
let isPlayerInitialized = false;

TrackPlayer.registerPlaybackService(() => async () => { });

const MusicPlayer = ({ route, navigation }) => {
  const { audioUrl } = route.params || {};
  console.log('audioUrl from route:', audioUrl);

  const defaultUrl = 'https://res.cloudinary.com/dl91sgjy1/video/upload/v1742675641/ocysnlq2ysaugdpih0vk.wav';
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentPos, setCurrentPos] = useState(0);
  const [playerState, setPlayerState] = useState('stopped'); // 'playing', 'paused', 'stopped'
  const focusCountRef = useRef(0); // Track focus count to avoid duplicate initializations
  const [isLoading, setIsLoading] = useState(false);

  const { position, duration } = useProgress(100);
  const playbackState = usePlaybackState();

  // Reset progress to 0 when track ends
  useTrackPlayerEvents([Event.PlaybackQueueEnded], async () => {
    await TrackPlayer.seekTo(0);
    setCurrentPos(0);
    setPlayerState('stopped');
  });

  // Add more event listeners to track state accurately
  useTrackPlayerEvents(
    [Event.PlaybackState],
    async (event) => {
      if (event.state === State.Playing) {
        setPlayerState('playing');
      } else if (event.state === State.Paused) {
        setPlayerState('paused');
      } else if (event.state === State.Stopped) {
        setPlayerState('stopped');
      }
      console.log('Player state changed:', event.state, 'Setting to:', playerState);
    }
  );

  // Clean up player when component unmounts
  useEffect(() => {
    // Only set up once at component mount if not already initialized
    if (!isPlayerInitialized) {
      setupPlayer();
    } else {
      // If already initialized, just mark as ready
      setIsPlayerReady(true);
    }

    return () => {
      // Only destroy when component unmounts, not on every focus change
      if (TrackPlayer && typeof TrackPlayer.destroy === 'function') {
        TrackPlayer.destroy().catch(err => console.log("Error destroying player:", err));
      } else {
        // Alternative cleanup if destroy is not available
        TrackPlayer?.reset?.().catch(err => console.log("Error resetting player:", err));
        console.log("TrackPlayer.destroy is not available");
      }
    };
  }, []);

  // Separate useEffect for loading and playing the track when focus changes
  useFocusEffect(
    useCallback(() => {
      const currentFocusCount = ++focusCountRef.current;
      const audioSource = audioUrl || defaultUrl;

      console.log(`Screen focused (${currentFocusCount}), preparing to play: ${audioSource}`);

      // Load and play track if player is ready
      if (isPlayerReady) {
        loadAndPlayTrack(audioSource);
      }

      return () => {
        console.log(`Screen is unfocused (${currentFocusCount})`);
        // Pause playback when screen loses focus
        if (isPlayerReady) {
          TrackPlayer.pause().catch(err => console.log("Error pausing on unfocus:", err));
        }
      };
    }, [audioUrl, isPlayerReady])
  );

  useEffect(() => {
    if (!isNaN(position)) {
      setCurrentPos(position);
    }
  }, [position]);

  // Setup player only once
  const setupPlayer = async () => {
    try {
      // Skip setup if already initialized
      if (isPlayerInitialized) {
        console.log("Player already initialized, skipping setup");
        setIsPlayerReady(true);
        return;
      }

      console.log("Setting up player for the first time");
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
        compactCapabilities: [Capability.Play, Capability.Pause],
        alwaysPauseOnInterruption: true,
      });

      isPlayerInitialized = true;
      setIsPlayerReady(true);
      console.log("Player setup complete");

    } catch (err) {
      console.error('Setup error:', err);
    }
  };

  // Load and play a track without reinitializing the player
  const loadAndPlayTrack = async (url) => {
    try {
      if (!url) {
        console.error("No URL provided to play");
        return;
      }

      setIsLoading(true); // Start loading indicator
      console.log(`Loading track: ${url}`);

      // Reset the player queue
      await TrackPlayer.reset();

      // Add the new track
      await TrackPlayer.add({
        id: 'trackId',
        url: url,
        title: 'Voice Note',
        artist: 'You',
      });

      setCurrentAudioUrl(url);

      // Play immediately
      await TrackPlayer.play();
      setPlayerState('playing');
      console.log(`Now playing: ${url}`);
    } catch (err) {
      console.error('Error loading or playing track:', err);
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  const handleSliderChange = async (valueArray) => {
    const value = valueArray[0];
    if (!isNaN(value) && duration > 0) {
      setCurrentPos(value);
      await TrackPlayer.seekTo(value);
    }
  };

  const formatTime = (secs) => {
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // More reliable play/stop functions
  const handlePlay = async () => {
    try {
      console.log('Play button pressed');
      await TrackPlayer.play();
      setPlayerState('playing');
    } catch (error) {
      console.error('Play error:', error);
    }
  };

  const handleStop = async () => {
    try {
      console.log('Stop button pressed');
      await TrackPlayer.pause();
      await TrackPlayer.seekTo(0);
      setCurrentPos(0);
      await TrackPlayer.stop();
      setPlayerState('stopped');
      // playerState = 'stopped';
    } catch (error) {
      console.error('Stop error:', error);
    }
  };

  // Convert playbackState to string for debugging
  const getPlaybackStateString = () => {
    if (playbackState === State.None) return "None";
    if (playbackState === State.Playing) return "Playing";
    if (playbackState === State.Paused) return "Paused";
    if (playbackState === State.Stopped) return "Stopped";
    if (playbackState === State.Buffering) return "Buffering";
    if (playbackState === State.Connecting) return "Connecting";
    return `Unknown (${JSON.stringify(playbackState)})`;
  };

  // Simplify the rendering logic
  const isPlaying = playerState === 'playing';

  // Handle goBack with track reset
  const handleBackPress = async () => {
    try {
      // Don't destroy the player, just stop and reset the current track
      if (isPlayerReady) {
        await TrackPlayer.pause();
        await TrackPlayer.seekTo(0);
        await TrackPlayer.reset();  // Use reset instead of stop to clear the queue
        setPlayerState('stopped');
        console.log('Successfully reset track before navigating back');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error resetting track before navigation:', error);
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={{
          backgroundColor: 'red',
          padding: 10,
          borderRadius: 5,
          position: 'absolute',
          top: 40,
          left: 20,
          zIndex: 999,
        }}
        onPress={handleBackPress}>
        <Text style={{ color: 'white' }}>
          Go Back
        </Text>
      </TouchableOpacity>

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading audio...</Text>
        </View>
      )}

      {/* Always show the slider, with fallback values if needed */}
      <View style={[styles.sliderContainer, isLoading && styles.dimmed]}>
        <MultiSlider
          values={[currentPos]}
          min={0}
          max={duration || 100} // Fallback to 100 if duration is not available yet
          step={1}
          sliderLength={responsiveWidth(90)}
          onValuesChangeFinish={handleSliderChange}
          selectedStyle={{ backgroundColor: COLORS.primary }}
          unselectedStyle={{ backgroundColor: '#333' }}
          trackStyle={{ height: 6 }}
          markerStyle={{
            height: 16,
            width: 16,
            borderRadius: 10,
            backgroundColor: COLORS.secondary,
            borderWidth: 0,
          }}
          // Disable the slider when loading or player not ready
          enabled={isPlayerReady && !isLoading}
        />
        <View style={[styles.controls, {
          alignItems: 'center'
        }]}>
          {isPlaying ? (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleStop}
              disabled={isLoading}
            >
              <Icon name="stop" size={30} color={isLoading ? '#666' : COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handlePlay}
              disabled={isLoading}
            >
              <Icon name="play" size={30} color={isLoading ? '#666' : COLORS.primary} />
            </TouchableOpacity>
          )}
          <Text style={styles.timeText}>
            {formatTime(currentPos)} / {formatTime(duration)}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    marginTop: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    // marginTop: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10,
  },

  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },

  dimmed: {
    opacity: 0.5,
  },
});

export default MusicPlayer;