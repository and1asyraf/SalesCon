// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJmiTFmUodKgue5AVAp3nEaNWzoQjwYtM",
  authDomain: "salescon-6b13a.firebaseapp.com",
  projectId: "salescon-6b13a",
  storageBucket: "salescon-6b13a.firebasestorage.app",
  messagingSenderId: "476520093230",
  appId: "1:476520093230:web:a05ab332e695674c8831bf",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function showMessage(message, divId) {
  var messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(function () {
    messageDiv.style.opacity = 0;
  }, 5000);
}
