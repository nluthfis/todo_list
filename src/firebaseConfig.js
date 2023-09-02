import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKz73cUzJYDSTXokZAS2FPvhk3uzAul8A",
  authDomain: "project-8da18.firebaseapp.com",
  projectId: "project-8da18",
  storageBucket: "project-8da18.appspot.com",
  messagingSenderId: "383417746876",
  appId: "1:383417746876:web:ea228dc7dc570d4a5d17b9",
  measurementId: "G-W6CEHYCMM3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const database = getFirestore(app);
