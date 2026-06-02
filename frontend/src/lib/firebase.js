import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC06SgM-DrsaaPgDIQMHFP4pMzcCppMTCE",
  authDomain: "student-tutor-d124f.firebaseapp.com",
  projectId: "student-tutor-d124f",
  storageBucket: "student-tutor-d124f.firebasestorage.app",
  messagingSenderId: "635191881051",
  appId: "1:635191881051:web:d78ee3745b0cb9f59cbe7e",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);