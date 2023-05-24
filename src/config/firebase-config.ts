import { FirebaseApp, initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyA6EpyP2uhCCwXOayigMpMOUHfTEXlbgy0",
    authDomain: "avf-analysis-dashboard.firebaseapp.com",
    projectId: "avf-analysis-dashboard",
    storageBucket: "avf-analysis-dashboard.appspot.com",
    messagingSenderId: "537279672609",
    appId: "1:537279672609:web:82beab7f2764e406600e60",
};

let firebaseApp: FirebaseApp | null = null;

export default function getFirebaseApp(): FirebaseApp {
    if (firebaseApp === null) {
        firebaseApp = initializeApp(firebaseConfig);
    }
    return firebaseApp;
}
