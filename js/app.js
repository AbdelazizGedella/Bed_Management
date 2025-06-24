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

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// CTAS Color Mapping
const ctasColors = {
  "1": "bg-blue-500",
  "2": "bg-red-500",
  "3": "bg-orange-500",
  "4": "bg-yellow-500",
  "5": "bg-green-500",
};

// Room IDs
const areaIds = [
  "P3-Exam Room 1", "P3-Exam Room 2", "P3-Exam Room 3", "Pediatric Area", "Respiratory Assessment Room",
  "P3-Exam Room 4", "P3-Exam Room 5", "P3-Exam Room 6", "P3-Exam Room 7", "Trauma Bed 1", "Trauma Bed 2", "Trauma Bed 3",
  "Fast Track Chair 1", "Fast Track Chair 2", "Fast Track Chair 3", "Fast Track Chair 4", "Fast Track Chair 5",
  "P3-Exam Room 8", "P3-Exam Room 9"
];

// Load Active Patients Only
async function loadPatients() {
  try {
    const querySnapshot = await db.collection("patients").get();

    // Clear all rooms first
    areaIds.forEach(id => {
      document.getElementById(id).innerHTML = "";
      const statusEl = document.getElementById("status-" + id);
      if (statusEl) statusEl.innerHTML = "🟩"; // Default: Available
    });

    querySnapshot.forEach((doc) => {
      const patient = doc.data();

      // ✅ Skip if status is not active
      if (patient.status !== "active") return;

      const assignedArea = patient.assignedArea;
      if (!assignedArea || !document.getElementById(assignedArea)) return;

      const ctasColor = ctasColors[patient.ctas] || "bg-gray-500";
      const patientEntry = `
        <li class="flex items-center">
          <span class="inline-block w-3 h-3 rounded-full ${ctasColor} mr-2"></span>
          ${patient.name}
        </li>
      `;

      document.getElementById(assignedArea).innerHTML += patientEntry;

      const statusEl = document.getElementById("status-" + assignedArea);
      if (statusEl) statusEl.innerHTML = "🟥"; // Room occupied
    });

  } catch (error) {
    console.error("Error fetching patients:", error);
  }
}

// Run on page load
window.onload = loadPatients;
