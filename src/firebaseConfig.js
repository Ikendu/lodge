// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// ===============================
// 🔧 YOUR FIREBASE CONFIGURATION
// Replace these values with your actual Firebase project settings
// (found in Firebase Console > Project Settings > General)
// ===============================
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_PROJECT.firebaseapp.com",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
};

// ===============================
// 🚀 Initialize Firebase
// ===============================
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ===============================
// 🔐 Authentication Providers
// ===============================

// Google (Gmail)
export const googleProvider = new GoogleAuthProvider();

// Yahoo
export const yahooProvider = new OAuthProvider("yahoo.com");

// Apple (iPhone Login)
export const appleProvider = new OAuthProvider("apple.com");

// Facebook
export const facebookProvider = new FacebookAuthProvider();

// X (Twitter)
export const twitterProvider = new TwitterAuthProvider();

// ===============================
// ✨ Generic Social Login Helper
// Use this function to handle popup sign-in for any provider
// ===============================
export const socialSignIn = async (provider) => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // You can store user info in localStorage or your backend
    console.log("✅ Login Successful:", user);
    alert(`Welcome ${user.displayName || "User"}!`);
    return user;
  } catch (error) {
    console.error("❌ Social Login Error:", error);
    alert("Login failed. Please try again.");
    throw error;
  }
};

export default app;
