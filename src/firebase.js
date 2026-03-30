import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwg6XHnc832b--vhZsCqqLxEDEw8J3pBc",
  authDomain: "sikei-proj.firebaseapp.com",
  projectId: "sikei-proj",
  storageBucket: "sikei-proj.firebasestorage.app",
  messagingSenderId: "979676773792",
  appId: "1:979676773792:web:f8d80da874d560c71038c5",
  measurementId: "G-S0WZF5Q1QL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
