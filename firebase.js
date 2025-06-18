import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    // apiKey: "AIzaSyB197nN16ujZqiwAFaOEz872w_SO6nEVnc",
    // authDomain: "fate-app-23e57.firebaseapp.com",
    // projectId: "fate-app-23e57",
    // storageBucket: "fate-app-23e57.appspot.com",
    // messagingSenderId: "735734481931",
    // appId: "1:735734481931:web:faa84d64f1939d602cb30e",
    // measurementId: "G-ERRMJ13W6E"
    apiKey: "AIzaSyAVXQqKBTM3afanWVkTdUzrdjf4ZB8Fues",
    authDomain: "fate-app-909c1.firebaseapp.com",
    projectId: "fate-app-909c1",
    storageBucket: "fate-app-909c1.firebasestorage.app",
    messagingSenderId: "358283258942",
    appId: "1:358283258942:web:7830d74e3a51ffe9a1f56f",
    measurementId: "G-9PX4X5081Q"
};
const app = initializeApp(firebaseConfig);
export default app;