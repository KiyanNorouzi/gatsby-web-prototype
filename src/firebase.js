import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAoC20sD0Xo93-HJAAlG-KGrgz6EEG7diI",
    authDomain: "gatsbyparty-718f6.firebaseapp.com",
    projectId: "gatsbyparty-718f6",
    storageBucket: "gatsbyparty-718f6.appspot.com",
    messagingSenderId: "9073831292",
    appId: "1:9073831292:web:047e342b5f51da6c9e88f9",
    measurementId: "G-NMDP3YNYGF"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const sendNotification = async (userId, message) => {
    try {
        await addDoc(collection(db, 'notifications'), {
            userId,
            message,
            read: false,
            createdAt: new Date(),
        });
    } catch (error) {
        console.error('Error sending notification: ', error);
    }
};

export const addSuggestion = async (suggestion) => {
    try {
        await addDoc(collection(db, 'suggestions'), suggestion);
    } catch (error) {
        console.error('Error adding suggestion: ', error);
    }
};