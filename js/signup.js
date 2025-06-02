const firebaseConfig = {
  apiKey: "AIzaSyAa7vp7Feilxw0jqWVarQvQxm7FyoROsWc",
  authDomain: "shawarshop-1fb5a.firebaseapp.com",
  databaseURL: "https://shawarshop-1fb5a.firebaseio.com",
  projectId: "shawarshop-1fb5a",
  storageBucket: "shawarshop-1fb5a.appspot.com",
  messagingSenderId: "571165045817",
  appId: "1:571165045817:web:20866848b539bdc2dc49e8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function signup() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userId = user.uid;
            
            // Store user data in Firestore with canCreateSpaces set to false
            return db.collection("users").doc(userId).set({
                name: name,
                email: email,
                admin: false, // Default Admin Status
                profilePic: "https://i.imgur.com/6VBx3io.png", // Default profile pic
                createdAt: new Date().toISOString(),
                position: "SN",
                canCreateSpaces: false // 🚫 Default: Users cannot create spaces
            });
        })
        .then(() => {
            alert("Signup successful!");
            window.location.href = "Dashboard.html"; // Redirect to dashboard
        })
        .catch((error) => {
            console.error("Error signing up:", error);
            alert("Signup failed: " + error.message);
        });
}