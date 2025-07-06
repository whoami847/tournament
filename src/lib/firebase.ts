import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDgAVB7CoWQmlbmh6aiTRknttjuklXZedY",
  authDomain: "aff-tour.firebaseapp.com",
  projectId: "aff-tour",
  storageBucket: "aff-tour.appspot.com",
  messagingSenderId: "678740451295",
  appId: "1:678740451295:web:077cf72e8cfd0c0092ee6a"
};


// Initialize Firebase for SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Lazy-load auth to prevent build errors in server-only environments
let _auth: Auth;
const auth = (): Auth => {
    if (!_auth) {
        _auth = getAuth(app);
    }
    return _auth;
};


export { app, firestore, auth, storage, googleProvider };
