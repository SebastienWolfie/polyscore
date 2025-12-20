// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAd7SbQQhA-A3L7VvCp9IpKWLBqTxoas4I",
  authDomain: "poly-8e297.firebaseapp.com",
  projectId: "poly-8e297",
  storageBucket: "poly-8e297.firebasestorage.app",
  messagingSenderId: "971216082470",
  appId: "1:971216082470:web:e299d20607a86675b638e7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
