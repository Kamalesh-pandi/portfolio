import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCCOaadLveE7J-MhgdP3tnsJnKNLheniu0",
  authDomain: "portfolio-b3317.firebaseapp.com",
  projectId: "portfolio-b3317",
  storageBucket: "portfolio-b3317.firebasestorage.app",
  messagingSenderId: "907046099466",
  appId: "1:907046099466:web:c0fc46d376b1d2748d9df3",
  measurementId: "G-JSDR05N31F"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
