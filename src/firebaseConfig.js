import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBY8Njk-R08selLOcYhMrHGzhYvJnkgm40",
  authDomain: "todolist-44bb0.firebaseapp.com",
  projectId: "todolist-44bb0",
  storageBucket: "todolist-44bb0.appspot.com",
  messagingSenderId: "954944520457",
  appId: "1:954944520457:web:22f2d9d99954dcca0753d8",
  measurementId: "G-VTZR2Z52DS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const database = getFirestore(app);
