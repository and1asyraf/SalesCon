const supabaseUrl = "https://axmxviywthnednwdvrik.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bXh2aXl3dGhuZWRud2R2cmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NzgyMjIsImV4cCI6MjA1MjA1NDIyMn0.Gx1cirBYFb4kCHF5kfwNJYmwKF0t9PxsKxdRZrjH3VM";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Sign Up
// document
//   .getElementById("signup-form")
//   ?.addEventListener("submit", async (event) => {
//     event.preventDefault();

//     const email = document.getElementById("signup-email").value;
//     const password = document.getElementById("signup-password").value;
//     const confirmPassword = document.getElementById("confirm-password").value;

//     if (password !== confirmPassword) {
//       alert("Passwords do not match!");
//       return;
//     }

//     try {
//       const { user, error } = await supabaseClient.auth.signUp({
//         email,
//         password,
//       });

//       if (error) {
//         alert(error.message);
//       } else {
//         alert("Signup successful!");
//         window.location.href = "login.html";
//       }
//     } catch (error) {
//       alert(error.message);
//     }
//   });
// Sign Up
document 
  .getElementById("signup-form")
  ?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const organizationName = document.getElementById("organization-name").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // Sign up the user
      const { data: user, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      // Get the user role from the toggle
      const userRole = document
        .querySelector(".toggle-container .active")
        .textContent.toLowerCase();

      // Insert additional user details into the "profile" table
      const { error: insertError } = await supabaseClient
        .from("profile")
        .insert([
          {
            user_id: user.user.id,
            email,
            role: userRole,
            organization_name: organizationName,
          },
        ]);

      if (insertError) {
        alert("Error saving user profile: " + insertError.message);
        return;
      }

      alert("Signup successful!");
      window.location.href = "/";
    } catch (error) {
      alert("An unexpected error occurred: " + error.message);
    }
  });

  // Login
  document
  .getElementById("login-form")
  ?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        alert(loginError.message);
        return;
      }

      // Fetch the user's profile
      const { data: profileData, error: profileError } = await supabaseClient
        .from("profile")
        .select("role")
        .eq("user_id", loginData.user.id)
        .single();

      if (profileError) {
        alert(profileError.message);
        return;
      }

      // Redirect based on the user's role
      if (profileData.role === "organizer") {
        window.location.href = "/homeAdmin";
      } else if (profileData.role === "vendor") {
        window.location.href = "/home2";
      } else {
        alert("Unknown user role!");
      }
    } catch (error) {
      alert(error.message);
    }
  });

// Reset Password
document
  .getElementById("reset-password-form")
  ?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("reset-email").value;

    try {
      const { data, error } = await supabaseClient.auth.resetPasswordForEmail(
        email
      );

      if (error) {
        alert(error.message);
      } else {
        alert("Password reset link sent to your email!");
      }
    } catch (error) {
      alert(error.message);
    }
  });
