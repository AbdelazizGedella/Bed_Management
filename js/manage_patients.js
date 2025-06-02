// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAa7vp7Feilxw0jqWVarQvQxm7FyoROsWc",
  authDomain: "shawarshop-1fb5a.firebaseapp.com",
  databaseURL: "https://shawarshop-1fb5a.firebaseio.com",
  projectId: "shawarshop-1fb5a",
  storageBucket: "shawarshop-1fb5a.appspot.com",
  messagingSenderId: "571165045817",
  appId: "1:571165045817:web:20866848b539bdc2dc49e8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Fetch Patient Data
async function loadPatients() {
  const tableBody = document.getElementById("patient-table-body");
  tableBody.innerHTML = ""; // Clear table before loading new data

  try {
    const querySnapshot = await db.collection("patients").orderBy("createdAt", "desc").get();
    querySnapshot.forEach((doc) => {
      const patient = doc.data();
      
      // CTAS Color Mapping
      const ctasColors = {
        "1": "bg-blue-500",
        "2": "bg-red-500",
        "3": "bg-orange-500",
        "4": "bg-yellow-500",
        "5": "bg-green-500",
      };

      // Create Row
      const row = `
        <tr class="hover:bg-gray-700">
          <td>${patient.MRNo}</td>
          <td>${patient.name}</td>
          <td>${patient.age}</td>
          <td class="text-white px-2 py-1 rounded ${ctasColors[patient.ctas]}">${patient.ctas}</td>
          <td>${patient.condition}</td>
          <td>${new Date(patient.createdAt).toLocaleString()}</td>
        </tr>
      `;

      tableBody.innerHTML += row;
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
  }
}

// Load Patient Data on Page Load
window.onload = loadPatients;
