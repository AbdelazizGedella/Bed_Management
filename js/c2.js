
  // Firebase Config
  const firebaseConfig = {
    apiKey: "AIzaSyAa7vp7Feilxw0jqWVarQvQxm7FyoROsWc",
    authDomain: "shawarshop-1fb5a.firebaseapp.com",
    projectId: "shawarshop-1fb5a",
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // Load Patients
  async function loadPatients() {
    const tableBody = document.getElementById("patient-table-body");
    tableBody.innerHTML = "";

    try {
      const snapshot = await db.collection("patients").orderBy("createdAt", "desc").get();
      snapshot.forEach((doc) => renderRow(doc));
    } catch (err) {
      console.error("Load error:", err);
    }
  }

  // Render Row in UTC
  function renderRow(doc) {
    const patient = doc.data();
    const ctasColors = {
      "1": "bg-blue-500",
      "2": "bg-red-500",
      "3": "bg-orange-500",
      "4": "bg-yellow-500",
      "5": "bg-green-500",
    };

    const arrivalUTC = patient.arrival_time
      ? new Date(patient.arrival_time.toDate()).toISOString().slice(0, 16)
      : "";

const createdAtDate = patient.createdAt instanceof Date
  ? patient.createdAt
  : patient.createdAt.toDate?.() || new Date(patient.createdAt);

const createdUTC = createdAtDate.toISOString().replace("T", " ").slice(0, 19);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${patient.MRNo}</td>
      <td>${patient.name}</td>
      <td>${patient.age}</td>
      <td class="text-white px-2 py-1 rounded ${ctasColors[patient.ctas] || 'bg-gray-600'}">${patient.ctas}</td>
      <td>${patient.condition}</td>
      <td>${createdUTC}</td>
      <td>
        <input type="datetime-local" id="arrival-${doc.id}" value="${arrivalUTC}" class="input input-sm input-bordered text-black" />
      </td>
      <td>
        <button class="btn btn-xs btn-accent" onclick="saveArrivalTime('${doc.id}')">Save</button>
      </td>
    `;
    document.getElementById("patient-table-body").appendChild(row);
  }

  // Save Arrival Time (stored in UTC)
  async function saveArrivalTime(docId) {
    const val = document.getElementById(`arrival-${docId}`).value;
    if (!val) return alert("Pick a date!");

    try {
      await db.collection("patients").doc(docId).update({
        arrival_time: new Date(val) // Always saved in UTC
      });
      alert("Arrival time saved!");
    } catch (err) {
      console.error("Error updating:", err);
    }
  }

  // Filter by UTC Arrival Time
  async function filterByArrival() {
    const startInput = document.getElementById("filter-start").value;
    const endInput = document.getElementById("filter-end").value;

    if (!startInput || !endInput) return alert("Please select both start and end dates");

    const start = new Date(startInput);
    const end = new Date(endInput);

    const tableBody = document.getElementById("patient-table-body");
    tableBody.innerHTML = "";

    try {
      const snapshot = await db.collection("patients")
        .where("arrival_time", ">=", start)
        .where("arrival_time", "<=", end)
        .orderBy("arrival_time", "desc")
        .get();

      snapshot.forEach((doc) => renderRow(doc));
    } catch (err) {
      console.error("Filter error:", err);
    }
  }

  // Load on page start
  window.onload = loadPatients;
