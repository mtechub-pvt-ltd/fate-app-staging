import TrackPlayer, { Event, RepeatMode, Capability } from 'react-native-track-player';

module.exports = async function () {
    // This service needs to be registered for the module to work
    // but it will be used with the web platform
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());

    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());

    TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());

    TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());

    TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());

    TrackPlayer.addEventListener(Event.RemoteJumpForward, async event => {
        await TrackPlayer.seekBy(event.interval);
    });

    TrackPlayer.addEventListener(Event.RemoteJumpBackward, async event => {
        await TrackPlayer.seekBy(-event.interval);
    });

    TrackPlayer.addEventListener(Event.RemoteSeek, event => {
        TrackPlayer.seekTo(event.position);
    });
};
