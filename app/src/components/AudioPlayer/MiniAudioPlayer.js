import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
} from 'react-native';

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
import COLORS from '../../consts/colors';

// Global player state management following official standards
let isPlayerSetup = false;
let setupPromise = null;

const MiniAudioPlayer = ({ audioUrl, onClose, autoPlay = false }) => {
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [currentPos, setCurrentPos] = useState(0);
    const [playerState, setPlayerState] = useState('stopped');
    const [isLoading, setIsLoading] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [trackLoaded, setTrackLoaded] = useState(false);
    const componentMountedRef = useRef(true);
    const currentTrackId = useRef(null);

    const { position, duration } = useProgress();
    const playbackState = usePlaybackState();

    // Event listeners following official standards
    useTrackPlayerEvents([Event.PlaybackQueueEnded, Event.PlaybackTrackChanged], async (event) => {
        if (!componentMountedRef.current) return;

        if (event.type === Event.PlaybackQueueEnded) {
            console.log('🎵 Track ended - resetting player state');
            setCurrentPos(0);
            setPlayerState('stopped');
            setIsLoading(false);
            setIsBuffering(false);
            // Reset track position to beginning when it ends
            try {
                await TrackPlayer.seekTo(0);
            } catch (error) {
                console.warn('Error seeking to start:', error);
            }
        }
    });

    useTrackPlayerEvents([Event.PlaybackState], async (event) => {
        if (!componentMountedRef.current) return;

        const { state } = event;
        console.log('🎵 Playback state changed to:', state);

        switch (state) {
            case State.Playing:
                setPlayerState('playing');
                setIsLoading(false);
                setIsBuffering(false);
                break;
            case State.Paused:
                setPlayerState('paused');
                setIsBuffering(false);
                break;
            case State.Stopped:
                console.log('🎵 Player stopped - resetting position');
                setPlayerState('stopped');
                setIsBuffering(false);
                setCurrentPos(0);
                break;
            case State.Buffering:
            case State.Connecting:
                setIsBuffering(true);
                break;
            case State.Ready:
                setIsBuffering(false);
                setTrackLoaded(true);
                break;
            default:
                break;
        }
    });

    // Setup player following official documentation
    const setupPlayer = useCallback(async () => {
        try {
            if (setupPromise) {
                await setupPromise;
                setIsPlayerReady(true);
                return;
            }

            if (isPlayerSetup) {
                setIsPlayerReady(true);
                return;
            }

            console.log("Setting up TrackPlayer...");
            setupPromise = TrackPlayer.setupPlayer({
                // Optional setup options
            });

            await setupPromise;

            // Configure player options following official standards
            await TrackPlayer.updateOptions({
                android: {
                    appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
                },
                capabilities: [
                    Capability.Play,
                    Capability.Pause,
                    Capability.Stop,
                    Capability.SeekTo,
                ],
                compactCapabilities: [Capability.Play, Capability.Pause],
                alwaysPauseOnInterruption: true,
            });

            // Set repeat mode to no repeat
            await TrackPlayer.setRepeatMode(0);

            isPlayerSetup = true;
            setIsPlayerReady(true);
            console.log("TrackPlayer setup complete");
        } catch (error) {
            if (error.message?.includes('already been initialized')) {
                console.log("TrackPlayer already initialized");
                isPlayerSetup = true;
                setIsPlayerReady(true);
            } else {
                console.error('TrackPlayer setup error:', error);
            }
        } finally {
            setupPromise = null;
        }
    }, []);

    // Initialize player on mount
    useEffect(() => {
        componentMountedRef.current = true;
        setupPlayer();

        return () => {
            componentMountedRef.current = false;
            // Clean up current track when component unmounts
            if (currentTrackId.current) {
                TrackPlayer.pause().catch(console.warn);
            }
        };
    }, [setupPlayer]);

    // Load track when audioUrl changes
    useEffect(() => {
        if (isPlayerReady && audioUrl && componentMountedRef.current) {
            const trackId = `track_${Date.now()}_${Math.random()}`;
            currentTrackId.current = trackId;

            console.log(`🎵 MiniAudioPlayer: Loading new audio URL: ${audioUrl}`);
            console.log(`🎵 MiniAudioPlayer: File extension: ${audioUrl.split('.').pop()}`);

            if (autoPlay) {
                loadAndPlayTrack(audioUrl, trackId);
            } else {
                loadTrack(audioUrl, trackId);
            }
        }
    }, [isPlayerReady, audioUrl, autoPlay]);

    // Update position
    useEffect(() => {
        if (componentMountedRef.current && !isNaN(position)) {
            setCurrentPos(position);

            // Check if track has ended naturally (position reached duration)
            if (duration > 0 && position >= duration - 0.5 && playerState === 'playing') {
                console.log('🎵 Track reached end naturally - stopping playback');
                setPlayerState('stopped');
                setCurrentPos(0);
                TrackPlayer.stop().catch(console.warn);
            }
        }
    }, [position, duration, playerState]);

    // Load track without playing (following official API)
    const loadTrack = useCallback(async (url, trackId) => {
        if (!componentMountedRef.current || !url) return;

        try {
            setIsLoading(true);
            setTrackLoaded(false);
            console.log(`Loading track: ${url}`);

            // Clear current queue
            await TrackPlayer.reset();

            // Add new track following official format
            await TrackPlayer.add({
                id: trackId,
                url: url,
                title: 'Voice Note',
                artist: 'User',
                duration: 0, // Will be populated when loaded
            });

            setCurrentPos(0);
            setPlayerState('stopped');
            setIsLoading(false); // ✅ Set loading to false after track is added
            setTrackLoaded(true); // ✅ Mark track as loaded
            console.log(`Track loaded: ${trackId}`);

        } catch (error) {
            console.error('Error loading track:', error);
            setIsLoading(false);
            setTrackLoaded(false);
        }
    }, []);

    // Load and play track
    const loadAndPlayTrack = useCallback(async (url, trackId) => {
        if (!componentMountedRef.current || !url) return;

        try {
            setIsLoading(true);
            setTrackLoaded(false);
            console.log(`Loading and playing track: ${url}`);

            // Clear current queue
            await TrackPlayer.reset();

            // Add new track
            await TrackPlayer.add({
                id: trackId,
                url: url,
                title: 'Voice Note',
                artist: 'User',
                duration: 0,
            });

            // Start playing
            await TrackPlayer.play();
            setPlayerState('playing');
            setTrackLoaded(true); // ✅ Mark track as loaded
            console.log(`Playing track: ${trackId}`);

            // Note: setIsLoading(false) will be handled by the PlaybackState event

        } catch (error) {
            console.error('Error loading and playing track:', error);
            setIsLoading(false);
            setTrackLoaded(false);
        }
    }, []);

    // Control handlers
    const handlePlay = useCallback(async () => {
        if (!componentMountedRef.current) return;

        try {
            console.log('Play button pressed');
            console.log('Current player state:', playerState);
            console.log('Current position:', currentPos);
            console.log('Track duration:', duration);

            // If track has ended (position is at or near the end), reset to beginning
            if (duration > 0 && (currentPos >= duration - 1 || playerState === 'stopped')) {
                console.log('🎵 Track at end or stopped - seeking to beginning');
                await TrackPlayer.seekTo(0);
                setCurrentPos(0);
            }

            await TrackPlayer.play();
            console.log('🎵 Play command sent successfully');
        } catch (error) {
            console.error('Play error:', error);
        }
    }, [playerState, currentPos, duration]);

    const handlePause = useCallback(async () => {
        if (!componentMountedRef.current) return;

        try {
            console.log('Pause button pressed');
            await TrackPlayer.pause();
        } catch (error) {
            console.error('Pause error:', error);
        }
    }, []);

    const handleStop = useCallback(async () => {
        if (!componentMountedRef.current) return;

        try {
            console.log('Stop button pressed');
            await TrackPlayer.stop();
            await TrackPlayer.seekTo(0);
            setCurrentPos(0);
            setPlayerState('stopped');
            console.log('🎵 Player stopped and reset to beginning');
        } catch (error) {
            console.error('Stop error:', error);
        }
    }, []);

    const handleSliderChange = useCallback(async (values) => {
        if (!componentMountedRef.current || !trackLoaded) return;

        const value = values[0];
        if (!isNaN(value) && duration > 0) {
            try {
                await TrackPlayer.seekTo(value);
                setCurrentPos(value);
            } catch (error) {
                console.error('Seek error:', error);
            }
        }
    }, [duration, trackLoaded]);

    const formatTime = useCallback((secs) => {
        if (isNaN(secs) || secs < 0) return '00:00';
        const min = Math.floor(secs / 60);
        const sec = Math.floor(secs % 60);
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }, []);

    // Render states
    const isPlaying = playerState === 'playing';
    const isPaused = playerState === 'paused';
    const showLoading = isLoading || isBuffering;

    return (
        <View style={styles.container}>
            {/* Loading indicator */}
            {showLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading audio...</Text>
                </View>
            )}

            {/* Audio controls */}
            <View style={[styles.sliderContainer, showLoading && styles.dimmed]}>
                <View style={styles.controls}>
                    {isPlaying ? (
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={handleStop}
                            disabled={showLoading}
                        >
                            <Icon name="stop" size={24} color={showLoading ? '#666' : COLORS.orange} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={handlePlay}
                            disabled={showLoading || !trackLoaded}
                        >
                            <Icon name="play" size={24} color={showLoading ? '#666' : COLORS.secondary2} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.sliderSection}>
                    <MultiSlider
                        values={[currentPos]}
                        min={0}
                        max={duration || 100}
                        step={1}
                        sliderLength={responsiveWidth(60)}
                        onValuesChangeFinish={handleSliderChange}
                        selectedStyle={{
                            backgroundColor: COLORS.secondary2,
                            height: 6,
                            borderRadius: 10,
                        }}
                        unselectedStyle={{
                            backgroundColor: COLORS.white,
                            borderRadius: 0,
                        }}
                        trackStyle={{
                            height: 6,
                        }}
                        markerStyle={{
                            height: 12,
                            width: 12,
                            borderRadius: 6,
                            backgroundColor: COLORS.secondary2,
                            borderWidth: 2,
                            borderColor: COLORS.white,
                        }}
                        enabled={isPlayerReady && !showLoading && trackLoaded}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: responsiveWidth(2),
        marginTop: responsiveWidth(2),
        width: '100%',
        alignItems: 'center',
        position: 'relative',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: 20,
        // backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    loadingText: {
        color: 'white',
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    sliderContainer: {
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: responsiveWidth(2),
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: responsiveWidth(3),
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sliderSection: {
        flex: 1,
        alignItems: 'center',
    },
    dimmed: {
        opacity: 0.5,
    },
});

export default MiniAudioPlayer;
