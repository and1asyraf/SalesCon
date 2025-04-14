const supabaseUrl = "https://axmxviywthnednwdvrik.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bXh2aXl3dGhuZWRud2R2cmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NzgyMjIsImV4cCI6MjA1MjA1NDIyMn0.Gx1cirBYFb4kCHF5kfwNJYmwKF0t9PxsKxdRZrjH3VM";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Function to fetch and display user profile
async function loadUserProfile() {
  const { data: { user } } = await supabaseClient.auth.getUser();

  if (user) {
    const { data: profileData, error: profileError } = await supabaseClient
      .from("profile")
      .select("email, organization_name, role")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile data:", profileError);
      document.getElementById("error-message").style.display = "block";
    } else {
      document.getElementById("user-name").textContent = profileData.organization_name || "N/A";
      document.getElementById("user-email").textContent = profileData.email || "N/A";
      document.getElementById("user-role").textContent = profileData.role || "N/A";
    }
  } else {
    console.error("No user is logged in.");
    document.getElementById("error-message").style.display = "block";
  }
}

// Call the function to load user profile on page load
loadUserProfile();

// Sign Out
document.getElementById('signout-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      alert(error.message);
    } else {
      alert("Sign Out Successful!");
      window.location.href = "/";
    }
  } catch (error) {
    alert(error.message);
  }
});