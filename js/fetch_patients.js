async function loadPatients() {
  try {
    const querySnapshot = await db.collection("patients").get();
    
    const areaIds = [
      "P3-Exam Room 1", "P3-Exam Room 2", "P3-Exam Room 3", "Pediatric Area", "Respiratory Assessment Room",
      "P3-Exam Room 4", "P3-Exam Room 5", "P3-Exam Room 6", "P3-Exam Room 7", "Trauma Bed 1", "Trauma Bed 2", "Trauma Bed 3",
      "Fast Track Chair 1", "Fast Track Chair 2", "Fast Track Chair 3", "Fast Track Chair 4", "Fast Track Chair 5",
      "P3-Exam Room 8", "P3-Exam Room 9"
    ];

    areaIds.forEach(id => {
      document.getElementById(id).innerHTML = "";
      document.getElementById("status-" + id).innerHTML = "🟩"; // Default to available
    });

    querySnapshot.forEach((doc) => {
      const patient = doc.data();
      const assignedArea = patient.assignedArea;      
      const ctasColor = ctasColors[patient.ctas] || "bg-gray-500";

      if (!assignedArea || !document.getElementById(assignedArea)) return;

      // Get createdAt and format if it's a Firestore Timestamp
      let createdAt = patient.createdAt;
      if (createdAt && typeof createdAt.toDate === "function") {
        createdAt = createdAt.toDate().toLocaleString();
      } else if (!createdAt) {
        createdAt = "";
      }
      const patientEntry = `<li class="flex items-center">
        <span class="inline-block w-3 h-3 rounded-full ${ctasColor} mr-2"></span>
        <button class="text-white hover:underline patient-btn" data-id="${doc.id}" data-name="${patient.name}"
          data-mrno="${patient.MRNo}" data-ctas="${patient.ctas}" data-condition="${patient.condition}" data-createdat="${createdAt}" data-assignedNurse="${patient.assignedNurse || ""}">
          ${patient.name}
        </button>
      </li>`;

      document.getElementById(assignedArea).innerHTML += patientEntry;
      document.getElementById("status-" + assignedArea).innerHTML = "🟥";
    });

    // Add event listeners for patient details display
    // Load all patient details into a cache object for quick access
    const patientDetailsCache = {};
    querySnapshot.forEach((doc) => {
      const patient = doc.data();
      patientDetailsCache[doc.id] = patient;
    });

    document.querySelectorAll(".patient-btn").forEach(btn => {
      btn.addEventListener("click", async function () {
        // Get createdAt attribute and format as "Date (hh:mm AM/PM)"
        let createdAt = this.getAttribute("data-createdat");
        let assignedArea = this.parentElement.parentElement.id || "";
        let createdAtDisplay = "N/A";
        if (createdAt) {
          const dateObj = new Date(createdAt);
          if (!isNaN(dateObj)) {
        const dateStr = dateObj.toLocaleDateString();
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        createdAtDisplay = `${dateStr} (${timeStr})`;
          }
        }

        // Fetch assigned nurse name from users collection if assignedNurse exists
        const assignedNurseId = this.getAttribute("data-assignedNurse");
        let assignedNurseName = "N/A";
        if (assignedNurseId) {
          try {
        const nurseDoc = await db.collection("users").doc(assignedNurseId).get();
        if (nurseDoc.exists) {
          assignedNurseName = nurseDoc.data().name || assignedNurseName;
        }
          } catch (e) {
        console.error("Error fetching nurse name:", e);
          }
        }

        // Fetch and display Red Crescent status if present
        let redCrescentStatus = "N/A";
        try {
          const patientDoc = await db.collection("patients").doc(this.getAttribute("data-id")).get();
          if (patientDoc.exists && patientDoc.data().redcrescent) {
        redCrescentStatus = patientDoc.data().redcrescent;
          }
        } catch (e) {
          console.error("Error fetching Red Crescent status:", e);
        }

        // Fetch and display AMA status if present
        let amastatus = "N/A";
        try {
          const patientDoc = await db.collection("patients").doc(this.getAttribute("data-id")).get();
          if (patientDoc.exists && patientDoc.data().ama) {
        amastatus = patientDoc.data().ama;
          }
        } catch (e) {
          console.error("Error fetching AMA status:", e);
        }


             // Fetch and display AMA status if present
        let dischargestatus = "N/A";
        try {
          const patientDoc = await db.collection("patients").doc(this.getAttribute("data-id")).get();
          if (patientDoc.exists && patientDoc.data().dischargeMethod) {
        dischargestatus = patientDoc.data().dischargeMethod;
          }
        } catch (e) {
          console.error("Error fetching AMA status:", e);
        }


        // Fetch assigned nurse and physician names from patient document
        let assignedNurseDisplay = assignedNurseName;
        let assignedPhysicianName = "N/A";
        try {
          const patientDoc = await db.collection("patients").doc(this.getAttribute("data-id")).get();
          if (patientDoc.exists) {
            const data = patientDoc.data();
            if (data.assignedNurseName) assignedNurseDisplay = data.assignedNurseName;
            if (data.assignedPhysicianName) assignedPhysicianName = data.assignedPhysicianName;
          }
        } catch (e) {
          console.error("Error fetching nurse/physician names:", e);
        }

        document.getElementById("case-details-content").innerHTML = `
          <h2 class="text-sm text-center text-gray-500 ">${this.getAttribute("data-mrno")}</h2>
          <h1 class="text-3xl font-bold text-center">${this.getAttribute("data-name")}</h1>    
          <h2 class="text-xl text-center">CTAS ${this.getAttribute("data-ctas")}</h2>  
          <p class="text-center text-gray-500">${createdAtDisplay}</p>
          <h1 class="text-3xl font-bold text-center" id="condition-display"> ${this.getAttribute("data-condition")}</h1>  
          <div class="flex justify-center mt-2">
            <button id="edit-condition-btn" class="bg-blue-500 text-white px-2 py-1 rounded text-xs">Edit Condition</button>
          </div>
          <div id="edit-condition-container" style="display:none; margin-top:8px; text-align:center;">
            <input type="text" id="edit-condition-input" class="border px-2 py-1 rounded w-2/3" placeholder="Enter new condition..." />
            <button id="save-condition-btn" class="bg-green-600 text-white px-2 py-1 rounded ml-2">Save</button>
            <button id="cancel-condition-btn" class="bg-gray-400 text-white px-2 py-1 rounded ml-2">Cancel</button>
          </div>

          <div class="flex items-center mb-4">
            <h1 class="text-2xl font-bold mr-4">Diagnosis</h1>
          </div>
          <p>
            <strong>Diagnosis:</strong> <span id="diagnosis-display"></span>
            <button id="edit-diagnosis-btn" class="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs">Edit</button>
          </p>
          <div id="edit-diagnosis-container" style="display:none; margin-top:8px; text-align:center;">
            <input type="text" id="edit-diagnosis-input" class="border px-2 py-1 rounded w-2/3" placeholder="Enter diagnosis..." />
            <button id="save-diagnosis-btn" class="bg-green-600 text-white px-2 py-1 rounded ml-2">Save</button>
            <button id="cancel-diagnosis-btn" class="bg-gray-400 text-white px-2 py-1 rounded ml-2">Cancel</button>
          </div>
          <hr class="my-4 border-gray-300">

          <div class="flex items-center mb-4">
            <h1 class="text-2xl font-bold mr-4">Team</h1>
          </div>
          <p>
            <strong>Assigned Area:</strong> ${assignedArea}
          </p>
          <p>
            <strong>Assigned Nurse:</strong> <span id="assigned-nurse-name">${assignedNurseDisplay}</span>
            <button id="add-nurse-btn" class="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs">+Add</button>
          </p>
          <div id="add-nurse-input-container" style="display:none; margin-top:4px;">
            <input type="text" id="add-nurse-input" class="border px-2 py-1 rounded w-2/3" placeholder="Enter nurse name..." />
            <button id="save-nurse-btn" class="bg-green-600 text-white px-2 py-1 rounded ml-2">Save</button>
            <button id="cancel-nurse-btn" class="bg-gray-400 text-white px-2 py-1 rounded ml-2">Cancel</button>
          </div>
          <p>
            <strong>Assigned Physician:</strong> <span id="assigned-physician-name">${assignedPhysicianName}</span>
            <button id="add-physician-btn" class="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs">+Add</button>
          </p>
          <div id="add-physician-input-container" style="display:none; margin-top:4px;">
            <input type="text" id="add-physician-input" class="border px-2 py-1 rounded w-2/3" placeholder="Enter physician name..." />
            <button id="save-physician-btn" class="bg-green-600 text-white px-2 py-1 rounded ml-2">Save</button>
            <button id="cancel-physician-btn" class="bg-gray-400 text-white px-2 py-1 rounded ml-2">Cancel</button>
          </div>
          <hr class="my-4 border-gray-300">
          <div class="flex items-center mb-4">
            <h1 class="text-2xl font-bold mr-4">Status</h1>
          </div>
          <p><strong>Red Crescent Status:</strong> <span style="color:gray">${redCrescentStatus}</span></p>
          <p><strong>AMA Status:</strong> <span style="color:gray">${amastatus}</span>
            <span id="ama-reason-display"></span>
          </p>

          <hr class="my-4 border-gray-300">
          <div class="flex items-center mb-4">
            <h1 class="text-2xl font-bold mr-4">Control</h1>
          </div>
          <div class="mt-4">
            <label class="font-semibold mr-2">AMA:</label>
            <div class="flex gap-2">
              <button id="ama-yes" class="bg-green-600 text-white px-3 py-1 rounded w-full">Yes</button>
              <button id="ama-no" class="bg-red-600 text-white px-3 py-1 rounded w-full">No</button>
            </div>
            <div id="ama-reason-container" style="display:none; margin-top:8px;">
              <input type="text" id="ama-reason-input" class="border px-2 py-1 rounded w-full" placeholder="Enter AMA reason..." />
              <button id="ama-reason-save" class="bg-blue-600 text-white px-2 py-1 rounded ml-2 w-full mt-2">Save Reason</button>
            </div>
          </div>
          <div class="mt-4">
            <label class="font-semibold mr-2">Red Crescent:</label>
            <div class="flex gap-2">
              <button id="red-crescent-yes" class="bg-green-600 text-white px-3 py-1 rounded w-full">Yes</button>
              <button id="red-crescent-no" class="bg-red-600 text-white px-3 py-1 rounded w-full">No</button>
            </div>
          </div>
          <hr class="my-4 border-gray-300">
          <div class="flex items-center mb-4">
            <h1 class="text-2xl font-bold mr-4">Discharge Status</h1>
          </div>
          <p><strong>Discharge Status:</strong> <span style="color:gray">${dischargestatus}</span></p>
          <div class="mt-4">
            <label class="font-semibold mr-2">Discharge Method:</label>
            <select id="discharge-method" class="border px-2 py-1 rounded w-full">
              <option value="">Select method...</option>
              <option value="home">Discharged Home</option>
              <option value="transfer">Transfer to Another Hospital</option>
              <option value="mortality">Mortality</option>
            </select>
          </div>
          <div id="discharge-extra-fields" class="mt-4"></div>
          <button id="save-discharge" class="bg-blue-600 text-white px-3 py-1 rounded w-full mt-2">Save Discharge Status</button>
        `;

        // --- Edit Condition Logic ---
        const editConditionBtn = document.getElementById("edit-condition-btn");
        const editConditionContainer = document.getElementById("edit-condition-container");
        const editConditionInput = document.getElementById("edit-condition-input");
        const saveConditionBtn = document.getElementById("save-condition-btn");
        const cancelConditionBtn = document.getElementById("cancel-condition-btn");
        const conditionDisplay = document.getElementById("condition-display");
        if (editConditionBtn && editConditionContainer && editConditionInput && saveConditionBtn && cancelConditionBtn && conditionDisplay) {
          editConditionBtn.onclick = () => {
            editConditionInput.value = conditionDisplay.textContent.trim();
            editConditionContainer.style.display = "block";
            editConditionInput.focus();
          };
          cancelConditionBtn.onclick = () => {
            editConditionContainer.style.display = "none";
          };
          saveConditionBtn.onclick = async () => {
            const newCondition = editConditionInput.value.trim();
            if (!newCondition) {
              alert("Please enter a condition.");
              return;
            }
            try {
              await db.collection("patients").doc(this.getAttribute("data-id")).update({ condition: newCondition });
              conditionDisplay.textContent = newCondition;
              editConditionContainer.style.display = "none";
              alert("Condition updated.");
            } catch (e) {
              alert("Failed to update condition: " + e.message);
            }
          };
        }

        // Add event listeners for nurse and physician add/save/cancel
        document.getElementById("add-nurse-btn").onclick = () => {
          document.getElementById("add-nurse-input-container").style.display = "block";
          document.getElementById("add-nurse-input").focus();
        };
        document.getElementById("cancel-nurse-btn").onclick = () => {
          document.getElementById("add-nurse-input-container").style.display = "none";
        };
        document.getElementById("save-nurse-btn").onclick = async () => {
          const nurseName = document.getElementById("add-nurse-input").value.trim();
          if (!nurseName) {
            alert("Please enter nurse name.");
            return;
          }
          try {
            await db.collection("patients").doc(this.getAttribute("data-id")).update({ assignedNurseName: nurseName });
            document.getElementById("assigned-nurse-name").textContent = nurseName;
            document.getElementById("add-nurse-input-container").style.display = "none";
            alert("Nurse updated.");
          } catch (e) {
            alert("Failed to update nurse: " + e.message);
          }
        };

        // Add event listeners for physician add/save/cancel
        document.getElementById("add-physician-btn").onclick = () => {
          document.getElementById("add-physician-input-container").style.display = "block";
          document.getElementById("add-physician-input").focus();
        };
        document.getElementById("cancel-physician-btn").onclick = () => {
          document.getElementById("add-physician-input-container").style.display = "none";
        };
        document.getElementById("save-physician-btn").onclick = async () => {
          const physicianName = document.getElementById("add-physician-input").value.trim();
          if (!physicianName) {
            alert("Please enter physician name.");
            return;
          }
          try {
            await db.collection("patients").doc(this.getAttribute("data-id")).update({ assignedPhysicianName: physicianName });
            document.getElementById("assigned-physician-name").textContent = physicianName;
            document.getElementById("add-physician-input-container").style.display = "none";
            alert("Physician updated.");
          } catch (e) {
            alert("Failed to update physician: " + e.message);
          }
        };

        // --- Diagnosis Logic ---
        const diagnosisDisplay = document.getElementById("diagnosis-display");
        const diagnosisBtn = document.getElementById("edit-diagnosis-btn");
        const diagnosisContainer = document.getElementById("edit-diagnosis-container");
        const diagnosisInput = document.getElementById("edit-diagnosis-input");
        const saveDiagnosisBtn = document.getElementById("save-diagnosis-btn");
        const cancelDiagnosisBtn = document.getElementById("cancel-diagnosis-btn");
        const patientId = this.getAttribute("data-id");

        // Fetch and display diagnosis
        try {
          const patientDoc = await db.collection("patients").doc(patientId).get();
          let diagnosis = "N/A";
          if (patientDoc.exists && patientDoc.data().diagnosis) {
            diagnosis = patientDoc.data().diagnosis;
          }
          if (diagnosisDisplay) diagnosisDisplay.textContent = diagnosis;
        } catch (e) {
          if (diagnosisDisplay) diagnosisDisplay.textContent = "N/A";
        }

        if (diagnosisBtn && diagnosisContainer && diagnosisInput && saveDiagnosisBtn && cancelDiagnosisBtn && diagnosisDisplay) {
          diagnosisBtn.onclick = () => {
            diagnosisInput.value = diagnosisDisplay.textContent.trim() === "N/A" ? "" : diagnosisDisplay.textContent.trim();
            diagnosisContainer.style.display = "block";
            diagnosisInput.focus();
          };
          cancelDiagnosisBtn.onclick = () => {
            diagnosisContainer.style.display = "none";
          };
          saveDiagnosisBtn.onclick = async () => {
            const newDiagnosis = diagnosisInput.value.trim();
            if (!newDiagnosis) {
              alert("Please enter a diagnosis.");
              return;
            }
            try {
              await db.collection("patients").doc(patientId).update({ diagnosis: newDiagnosis });
              diagnosisDisplay.textContent = newDiagnosis;
              diagnosisContainer.style.display = "none";
              alert("Diagnosis updated.");
            } catch (e) {
              alert("Failed to update diagnosis: " + e.message);
            }
          };
        }

        // Fetch and display AMA reason if present
        let amaReason = "";
        try {
          const patientDoc = await db.collection("patients").doc(this.getAttribute("data-id")).get();
          if (patientDoc.exists && patientDoc.data().amaReason) {
        amaReason = patientDoc.data().amaReason;
        document.getElementById("ama-reason-display").innerHTML = `<br><strong>Reason:</strong> ${amaReason}`;
          }
        } catch (e) {
          console.error("Error fetching AMA reason:", e);
        }

        // Show input for AMA reason if "Yes" is clicked
        document.getElementById("ama-yes").onclick = async () => {
          document.getElementById("ama-reason-container").style.display = "block";
          document.getElementById("ama-reason-input").focus();
        };
        document.getElementById("ama-reason-save").onclick = async () => {
          const reason = document.getElementById("ama-reason-input").value.trim();
          if (!reason) {
        alert("Please enter a reason for AMA.");
        return;
          }
          try {
        await db.collection("patients").doc(this.getAttribute("data-id")).update({ ama: "yes", amaReason: reason });
        document.getElementById("ama-reason-display").innerHTML = `<br><strong>Reason:</strong> ${reason}`;
        alert("AMA set to Yes with reason");
        document.getElementById("ama-reason-container").style.display = "none";
          } catch (e) {
        alert("Failed to update AMA: " + e.message);
          }
        };
        document.getElementById("ama-no").onclick = async () => {
          try {
        await db.collection("patients").doc(this.getAttribute("data-id")).update({ ama: "no", amaReason: "" });
        document.getElementById("ama-reason-display").innerHTML = "";
        alert("AMA set to No");
        document.getElementById("ama-reason-container").style.display = "none";
          } catch (e) {
        alert("Failed to update AMA: " + e.message);
          }
        };

        // Add event listeners for Red Crescent buttons
        document.getElementById("red-crescent-yes").onclick = async () => {
          try {
        await db.collection("patients").doc(this.getAttribute("data-id")).update({ redcrescent: "yes" });
        alert("Red Crescent set to Yes");
          } catch (e) {
        alert("Failed to update Red Crescent: " + e.message);
          }
        };
        document.getElementById("red-crescent-no").onclick = async () => {
          try {
        await db.collection("patients").doc(this.getAttribute("data-id")).update({ redcrescent: "no" });
        alert("Red Crescent set to No");
          } catch (e) {
        alert("Failed to update Red Crescent: " + e.message);
          }
        };
      // Move discharge method logic inside the patient button click handler
      // Attach discharge method logic after rendering the HTML
      const dischargeMethodEl = document.getElementById("discharge-method");
      const extraFieldsEl = document.getElementById("discharge-extra-fields");
      let dischargeData = {};

      if (dischargeMethodEl) {
        dischargeMethodEl.onchange = function () {
          const method = this.value;
          dischargeData = { method };
          extraFieldsEl.innerHTML = "";

          if (method === "transfer") {
            extraFieldsEl.innerHTML = `
              <div class="mt-2">
                <label class="font-semibold">Hospital Name:</label>
                <input type="text" id="transfer-hospital" class="border px-2 py-1 rounded w-full" placeholder="Enter hospital name..." />
              </div>
              <div class="mt-2">
                <label class="font-semibold">Transfer Initiated Time:</label>
                <input type="datetime-local" id="transfer-initiated" class="border px-2 py-1 rounded w-full" />
              </div>
              <div class="mt-2">
                <label class="font-semibold">Arrival at Other Hospital:</label>
                <input type="datetime-local" id="transfer-arrival" class="border px-2 py-1 rounded w-full" />
              </div>
              <div class="mt-2">
                <label class="font-semibold">Return to Our Hospital (if applicable):</label>
                <input type="datetime-local" id="transfer-return" class="border px-2 py-1 rounded w-full" />
              </div>
            `;
          } else if (method === "mortality") {
            extraFieldsEl.innerHTML = `
              <div class="mt-2">
                <label class="font-semibold">Time of Death:</label>
                <input type="datetime-local" id="mortality-time" class="border px-2 py-1 rounded w-full" />
              </div>
            `;
          }
        };
      }

      const saveDischargeBtn = document.getElementById("save-discharge");

      // If discharge method is "mortality", set patient status to "expired"
      if (saveDischargeBtn) {
        const patientId = this.getAttribute("data-id");
        saveDischargeBtn.onclick = async () => {
          const method = dischargeMethodEl.value;
          if (!method) {
        alert("Please select a discharge method.");
        return;
          }
          let updateObj = { dischargeMethod: method };

          if (method === "transfer") {
        const hospital = document.getElementById("transfer-hospital").value.trim();
        const initiated = document.getElementById("transfer-initiated").value;
        const arrival = document.getElementById("transfer-arrival").value;
        const ret = document.getElementById("transfer-return").value;
        if (!hospital || !initiated || !arrival) {
          alert("Please fill all required transfer fields.");
          return;
        }
        updateObj = {
          ...updateObj,
          transferHospital: hospital,
          transferInitiated: initiated,
          transferArrival: arrival,
          transferReturn: ret
        };
          } else if (method === "mortality") {
        const deathTime = document.getElementById("mortality-time").value;
        if (!deathTime) {
          alert("Please enter time of death.");
          return;
        }
        updateObj = {
          ...updateObj,
          mortalityTime: deathTime,
          status: "expired" // Set status to expired
        };
          }

          try {
        await db.collection("patients").doc(patientId).update(updateObj);
        alert("Discharge status saved.");
          } catch (e) {
        alert("Failed to save discharge status: " + e.message);
          }
        };
      }
   });
  });

  } catch (error) {
    console.error("Error fetching patients:", error);
  }
}

// Load Data on Page Load
window.onload = loadPatients;
