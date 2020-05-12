import firebase from "firebase/app";
import "firebase/auth";
import "firebase/analytics";
import "firebase/database";

firebase.initializeApp({
  apiKey: "AIzaSyAd8cKSc_v9xIAdtHhigCj1x4CQm6Lo-nY",
  authDomain: "partay-live.firebaseapp.com",
  databaseURL: "https://partay-live.firebaseio.com",
  projectId: "partay-live",
  storageBucket: "partay-live.appspot.com",
  messagingSenderId: "806369079746",
  appId: "1:806369079746:web:cc4b067efbeb454490a65b",
  measurementId: "G-87BQDW5YYD",
});

const db = firebase.database();
const SERVER_TIMESTAMP: number = (firebase.database.ServerValue
  .TIMESTAMP as unknown) as number;
const auth = firebase.auth();
const analytics = firebase.analytics();
const logEvent = analytics.logEvent;
export { analytics, logEvent, auth, db, SERVER_TIMESTAMP };
