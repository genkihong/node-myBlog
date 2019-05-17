const firebase = require('firebase');
require('dotenv').config();

// Initialize Firebase
// const firebaseConfig = {
//   apiKey: "AIzaSyDxnGIiUcUtke7-3mW94QRCvx-ITceNYz0",
//   authDomain: "member-20190506.firebaseapp.com",
//   databaseURL: "https://member-20190506.firebaseio.com",
//   projectId: "member-20190506",
//   storageBucket: "member-20190506.appspot.com",
//   messagingSenderId: "1023030583933",
//   appId: "1:1023030583933:web:ebee2a2812d526ea"
// };
// firebase.initializeApp(firebaseConfig);
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASEURL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: "blog-20190508.appspot.com",
  messagingSenderId: "695627113548",
  appId: "1:695627113548:web:b54ae2c938879c63"
};
firebase.initializeApp(firebaseConfig);

module.exports = firebase;
