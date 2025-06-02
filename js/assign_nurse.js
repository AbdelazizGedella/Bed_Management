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
let selectedNurseId = null;

// Fetch Patients
async function loadPatients() {
  const selectPatient = document.getElementById("select-patient");
  selectPatient.innerHTML = `<option disabled selected>Select a Patient</option>`;

  try {
    const querySnapshot = await db.collection("patients").get();
    querySnapshot.forEach((doc) => {
      const patient = doc.data();
      selectPatient.innerHTML += `<option value="${doc.id}">${patient.name} (MRNo: ${patient.MRNo})</option>`;
    });

    selectPatient.addEventListener("change", (e) => {
      selectedPatientId = e.target.value;
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
  }
}

// Fetch Nurses
async function loadNurses() {
  const selectNurse = document.getElementById("select-nurse");
  selectNurse.innerHTML = `<option disabled selected>Select a Nurse</option>`;

  try {
    const querySnapshot = await db.collection("users").get();
    querySnapshot.forEach((doc) => {
      const nurse = doc.data();
      selectNurse.innerHTML += `<option value="${doc.id}">${nurse.name} (ID: ${doc.id})</option>`;
    });

    selectNurse.addEventListener("change", (e) => {
      selectedNurseId = e.target.value;
    });
  } catch (error) {
    console.error("Error fetching nurses:", error);
  }
}

// Assign Nurse to Patient
document.getElementById("confirm-assign-nurse").addEventListener("click", async () => {
  if (!selectedPatientId || !selectedNurseId) {
    alert("Please select both a patient and a nurse.");
    return;
  }

  try {
    await db.collection("patients").doc(selectedPatientId).update({
      assignedNurse: selectedNurseId,
      assignedAt: new Date().toISOString(),
    });

    alert("Nurse assigned successfully!");
  } catch (error) {
    console.error("Error assigning nurse:", error);
  }
});

// Load Data on Page Load
window.onload = () => {
  loadPatients();
  loadNurses();
};
