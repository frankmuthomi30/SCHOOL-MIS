// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBNyVRt6ozVeM_VuYhWbv1CWMSt0-9ANUs",
  authDomain: "vinnies-parking-system.firebaseapp.com",
  databaseURL: "https://vinnies-parking-system-default-rtdb.firebaseio.com",
  projectId: "vinnies-parking-system",
  storageBucket: "vinnies-parking-system.appspot.com",
  messagingSenderId: "988676216132",
  appId: "1:988676216132:web:01b1e596ee8dc8b7743311",
  measurementId: "G-MZG3C8WS71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// Initialize Firebase Storage
const storage = getStorage(app);

export { database, storage };
