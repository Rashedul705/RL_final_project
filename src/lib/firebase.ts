// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAU5z7bYS-Ol-7-y-PSlIKy5v2F5DuCEbg",
    authDomain: "rodelas-lifestyle.firebaseapp.com",
    projectId: "rodelas-lifestyle",
    storageBucket: "rodelas-lifestyle.firebasestorage.app",
    messagingSenderId: "522400711922",
    appId: "1:522400711922:web:b31ceddc3d3f9382d27c6b",
    measurementId: "G-7SV9221BTN"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Analytics (only on client side)
let analytics;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, auth, db, googleProvider, analytics };
