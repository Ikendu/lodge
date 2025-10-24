// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
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

// Ensure auth state persists across browser sessions (explicit)
setPersistence(auth, browserLocalPersistence).catch((err) => {
  // If persistence setting fails, log but don't break the app
  console.warn("Could not set auth persistence:", err);
});

// If you want to enable analytics later, re-enable the import and
// initialization. Currently we don't use analytics in this app.

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

    // --- Persist firebase user on the server ---
    try {
      const idToken = await user.getIdToken();
      // Send idToken and uid to the backend to link/create profile
      fetch("http://localhost/lodge/save_firebase_user.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, uid: user.uid, email: user.email }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          console.log("save_firebase_user response", data);
          // After save, refresh the canonical profile from the backend
          try {
            const profRes = await fetch(
              "http://localhost/lodge/get_profile.php?uid=" +
                encodeURIComponent(user.uid)
            );
            const profJson = await profRes.json();
            if (profJson && profJson.success && profJson.profile) {
              try {
                localStorage.setItem(
                  "customerProfile",
                  JSON.stringify(profJson.profile)
                );
              } catch (e) {
                console.warn("Failed to persist profile locally", e);
              }
              // Notify the app that profile updated
              try {
                window.dispatchEvent(
                  new CustomEvent("profileUpdated", {
                    detail: profJson.profile,
                  })
                );
              } catch (e) {
                // CustomEvent may fail in very old browsers; ignore
              }
            } else {
              console.warn("get_profile returned no profile", profJson);
            }
          } catch (err) {
            console.warn("Could not refresh profile from server:", err);
          }
        })
        .catch((err) => {
          console.warn("Could not save firebase user on server:", err);
        });
    } catch (e) {
      console.warn("Could not obtain ID token from Firebase user:", e);
    }
    return user;
  } catch (error) {
    console.error("❌ Social Login Error:", error);
    alert("Login failed. Please try again.");
    throw error;
  }
};

export default app;
