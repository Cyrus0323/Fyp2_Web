import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/database'

const firebaseConfig = {
  apiKey: process.env.FIREBASE_APIKEY,
  authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.asia-southeast1.firebasedatabase.app`,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  // measurementId: process.env.FIREBASE_MEASUREMENT_ID
}

const initFirebase = () => {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
  }
}

initFirebase()

export { firebase }
