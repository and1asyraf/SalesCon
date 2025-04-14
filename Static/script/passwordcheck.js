// document.addEventListener("DOMContentLoaded", () => {
//   const signupForm = document.getElementById("signupForm");

//   const validatePasswords = (form) => {
//     const password = form.querySelector('input[name="Password"]').value;
//     const confirmPassword = form.querySelector(
//       'input[name="confirmPassword"]'
//     ).value;

//     if (password !== confirmPassword) {
//       alert("Passwords do not match. Please try again.");
//       return false;
//     }
//     return true;
//   };

//   if (signupForm) {
//     signupForm.addEventListener("submitVendor", (e) => {
//       if (!validatePasswords(signupForm)) e.preventDefault();
//     });
//   }

//   if (studentForm) {
//     signupForm.addEventListener("submitOrganizor", (e) => {
//       if (!validatePasswords(signupForm)) e.preventDefault();
//     });
//   }
// });
