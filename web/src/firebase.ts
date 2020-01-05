import * as firebase from "firebase/app"
import "firebase/auth"
import "firebase/database"

firebase.initializeApp({
  apiKey: "AIzaSyAd8cKSc_v9xIAdtHhigCj1x4CQm6Lo-nY",
  authDomain: "partay-live.firebaseapp.com",
  databaseURL: "https://partay-live.firebaseio.com",
  projectId: "partay-live",
  storageBucket: "partay-live.appspot.com",
  messagingSenderId: "806369079746",
  appId: "1:806369079746:web:cc4b067efbeb454490a65b",
  measurementId: "G-87BQDW5YYD"
});

const db = firebase.database();
const auth = firebase.auth();

export {firebase, db, auth}
