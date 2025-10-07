// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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
  apiKey: "AIzaSyDiMuKD3o5WIRHLRQ4PVEZd7TuNhKnNAKk",
  authDomain: "lodge-72abe.firebaseapp.com",
  projectId: "lodge-72abe",
  storageBucket: "lodge-72abe.firebasestorage.app",
  messagingSenderId: "101703969569",
  appId: "1:101703969569:web:40ab0ed8ba62a9672a2c60",
  measurementId: "G-L2614CJ8N5",
};

// ===============================
// 🚀 Initialize Firebase
// ===============================
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firebase
const analytics = getAnalytics(app);

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
