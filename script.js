import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, get, ref } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCza4SsjUWoGds6GWFO2UvQ06c-KuGKJQQ",
  authDomain: "nokatgdeda.firebaseapp.com",
  databaseURL: "https://nokatgdeda.firebaseio.com",
  projectId: "nokatgdeda",
  storageBucket: "nokatgdeda.appspot.com",
  messagingSenderId: "379489698261",
  appId: "1:379489698261:web:c8fb7afcf34b32c28b3d5c"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function testFirebaseConnection() {
    get(ref(database, '/')).then((snapshot) => {
         if (snapshot.exists()) {
             console.log("Firebase connection successful.");
         } else {
             console.log("Connected, but no data found.");
         }
    }).catch((error) => {
         console.error("Firebase connection failed:", error);
    });
}

testFirebaseConnection();
