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
  const auth = firebase.auth();
  

// Patient Form Submission
document.getElementById("patient-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("patient-name").value.trim();
  const MRNo = document.getElementById("MRNo").value.trim();
  const age = document.getElementById("patient-age").value.trim();
  const ctas = document.getElementById("patient-ctas").value;
  const condition = document.getElementById("patient-condition").value.trim();

  if (!name || !age || !MRNo || !ctas || !condition) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    await db.collection("patients").add({
      MRNo,
      name,
      age: parseInt(age),
      ctas,
      condition,
      status: "active",
      createdAt: new Date().toISOString(),
    });

    alert("Patient added successfully!");
    document.getElementById("patient-form").reset();
  } catch (error) {
    console.error("Error adding patient:", error);
    alert("Failed to add patient.");
  }
});



