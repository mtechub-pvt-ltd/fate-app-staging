
import { AppRegistry } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import { name as appName } from './app.json';

// Register the TrackPlayer service
TrackPlayer.registerPlaybackService(() => require('./app/src/Services/TrackPlayerService'));

AppRegistry.registerComponent(appName, () => App);
