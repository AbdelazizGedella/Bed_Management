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

  if (!name || !age || !ctas || !condition) {
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
      createdAt: new Date().toISOString(),
    });

    alert("Patient added successfully!");
    document.getElementById("patient-form").reset();
  } catch (error) {
    console.error("Error adding patient:", error);
    alert("Failed to add patient.");
  }
});



const video = document.getElementById("camera");
const captureButton = document.getElementById("capture");
const uploadInput = document.getElementById("upload");

// Start the camera stream
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(error => console.error("Camera error:", error));

// Capture an image from the camera and preprocess it
captureButton.addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.filter = "contrast(150%) brightness(120%) grayscale(100%)";
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png"); // Convert image to base64
    processImage(imageData);
});

// Process uploaded images
uploadInput.addEventListener("change", event => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function () {
            processImage(reader.result);
        };
        reader.readAsDataURL(file);
    }
});

// OCR processing using Tesseract.js
async function processImage(imageData) {
    try {
        const { data: { text } } = await Tesseract.recognize(imageData, 'eng', {
            whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-:',
        });

        console.log("OCR Output:", text);
        autoFillForm(text);
    } catch (error) {
        console.error("OCR Error:", error);
        alert("Error processing image, please try again.");
    }
}

// Fill form fields automatically
function autoFillForm(extractedText) {
    document.getElementById("MRNo").value = correctText(extractField(extractedText, "File No"));
    document.getElementById("patient-name").value = correctText(extractField(extractedText, "Name"));
    document.getElementById("patient-age").value = correctText(extractField(extractedText, "Age"));
}

// Extract data from OCR text
function extractField(text, label) {
    const regex = new RegExp(`${label}\\s*:\\s*(\\w[\\w\\s-]*)`, "i");
    const match = text.match(regex);
    return match ? match[1].trim() : "";
}

// Correct common OCR errors
function correctText(text) {
    return text.replace(/Patiert/g, "Patient").replace(/0/g, "O").replace(/1/g, "I");
}

// Firebase Secure Submission
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
            createdAt: new Date().toISOString(),
        });

        alert("Patient added successfully!");
        document.getElementById("patient-form").reset();
    } catch (error) {
        console.error("Error adding patient:", error);
        alert("Failed to add patient.");
    }
});
