// Give the service worker access to Firebase Messaging
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Your Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyDPJSHCqYR79gJ_oTpLGST-AoLC5wNXH5o",
  authDomain: "metronome-app-1490a.firebaseapp.com",
  projectId: "metronome-app-1490a",
  storageBucket: "metronome-app-1490a.appspot.com",
  messagingSenderId: "1083667995230",
  appId: "1:1083667995230:web:f8d862af4ff139d44f32cf"
});

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();
