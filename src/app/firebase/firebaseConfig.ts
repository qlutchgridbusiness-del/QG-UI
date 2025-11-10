// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAw9xy2c8D73PjMGkSs3r98YQiuiY2srCk",
  authDomain: "qlutchgrid.firebaseapp.com",
  projectId: "qlutchgrid",
  storageBucket: "qlutchgrid.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-MGR13BFFRB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export { RecaptchaVerifier, signInWithPhoneNumber };
