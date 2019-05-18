const firebase = require('firebase');
require('dotenv').config();

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
