// Firebase configuration and initialization for Justama Import and Export Sdn Bhd
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCKLKsWwdKaxfKuxBkNqnlneZtpmL1j9c",
  authDomain: "jutasama.firebaseapp.com",
  projectId: "jutasama",
  storageBucket: "jutasama.firebasestorage.app",
  messagingSenderId: "969133258939",
  appId: "1:969133258939:web:2d202ade5c22dbae60919e",
  measurementId: "G-FMY0N4WQSN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
