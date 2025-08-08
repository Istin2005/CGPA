// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDu86KbNSOGnXgItxIjtYsZ1b5NignOB7M",
  authDomain: "cgpa-calculator-f0239.firebaseapp.com",
  projectId: "cgpa-calculator-f0239",
  storageBucket: "cgpa-calculator-f0239.firebasestorage.app",
  messagingSenderId: "392563568117",
  appId: "1:392563568117:web:fd3f0330b873e6603084bc",
  measurementId: "G-BXTY62P34S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = firebase.auth();
const db = firebase.firestore();

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const cgpaForm = document.getElementById("cgpaForm");
const gradesInput = document.getElementById("gradesInput");
const resultDiv = document.getElementById("result");

let currentUser = null;

// Google Login
loginBtn.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      currentUser = result.user;
      showUserUI(currentUser);
    }).catch(console.error);
};

// Logout
logoutBtn.onclick = () => {
  auth.signOut().then(() => {
    currentUser = null;
    hideUserUI();
  });
};

function showUserUI(user) {
  userInfo.textContent = `Logged in as: ${user.displayName}`;
  loginBtn.style.display = "none";
  logoutBtn.style.display = "inline-block";
  cgpaForm.style.display = "block";
}

function hideUserUI() {
  userInfo.textContent = "";
  loginBtn.style.display = "inline-block";
  logoutBtn.style.display = "none";
  cgpaForm.style.display = "none";
  resultDiv.innerHTML = "";
}

cgpaForm.onsubmit = async (e) => {
  e.preventDefault();
  const input = gradesInput.value.split(",").map(Number);
  if (input.some(isNaN)) {
    resultDiv.innerHTML = "❌ Invalid input. Enter numbers like: 8.5,9.0";
    return;
  }

  const total = input.reduce((a, b) => a + b, 0);
  const cgpa = (total / input.length).toFixed(2);
  resultDiv.innerHTML = `✅ Your CGPA is: <strong>${cgpa}</strong>`;

  // Save to Firestore
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).set({
      name: currentUser.displayName,
      email: currentUser.email,
      grades: input,
      cgpa: cgpa,
      updated: new Date()
    });
  }
};

// Check if user already logged in
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    showUserUI(user);
  } else {
    hideUserUI();
  }
});