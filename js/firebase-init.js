
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
  import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs } 
    from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyAj2F_f7lS9oau9JJ2QPY481QN5rdOiw7g",
    authDomain: "voice-note-5a859.firebaseapp.com",
    projectId: "voice-note-5a859",
    storageBucket: "voice-note-5a859.firebasestorage.app",
    messagingSenderId: "337852597644",
    appId: "1:337852597644:web:4c06092ce73c806456c2a9",
    measurementId: "G-Q6Y8X3BYQB"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  export { db };

