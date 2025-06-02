// Initialize Firebase
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

let selectedPatientId = null;

// Load Patient Data
async function loadPatients() {
  const tableBody = document.getElementById("patient-table-body");
  tableBody.innerHTML = ""; // Clear table before loading new data

  try {
    const querySnapshot = await db.collection("patients").get();
    querySnapshot.forEach((doc) => {
      const patient = doc.data();
      const patientId = doc.id;

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
        <tr>
          <td>${patient.MRNo}</td>
          <td>${patient.name}</td>
          <td>${patient.age}</td>
          <td class="text-white px-2 py-1 rounded ${ctasColors[patient.ctas]}">${patient.ctas}</td>
          <td>${patient.condition}</td>
          <td>${patient.assignedArea || "Not Assigned"}</td>
          <td>
            <button class="btn btn-sm btn-primary assign-btn" data-id="${patientId}" data-name="${patient.name}">Assign</button>
          </td>
        </tr>
      `;

      tableBody.innerHTML += row;
    });

    // Add Event Listeners for Assign Buttons
    document.querySelectorAll(".assign-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        selectedPatientId = btn.getAttribute("data-id");
        document.getElementById("assign-patient-name").innerText = `Assign ${btn.getAttribute("data-name")}`;
        document.getElementById("assign-modal").classList.remove("hidden");
      });
    });

  } catch (error) {
    console.error("Error fetching patients:", error);
  }
}

// Confirm Assignment
document.getElementById("confirm-assign").addEventListener("click", async () => {
  const selectedArea = document.getElementById("assign-area").value;
  if (!selectedPatientId || selectedArea === "Select Area") return alert("Please select an area");

  try {
    await db.collection("patients").doc(selectedPatientId).update({
      assignedArea: selectedArea,
    });

    alert("Patient successfully assigned!");
    document.getElementById("assign-modal").classList.add("hidden");
    loadPatients(); // Refresh table with updated data
  } catch (error) {
    console.error("Error assigning patient:", error);
  }
});

// Close Modal
document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("assign-modal").classList.add("hidden");
});

// Load Data on Page Load
window.onload = loadPatients;
