// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAa0CwXzoYggODrLPmoP7UkNgtmubzJMMs",
  authDomain: "fir-1-d48ab.firebaseapp.com",
  projectId: "fir-1-d48ab",
  storageBucket: "fir-1-d48ab.firebasestorage.app",
  messagingSenderId: "423771479088",
  appId: "1:423771479088:web:c377b7b4c98bf27f7c21f5",
  measurementId: "G-XYMF8QDN71"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
