// Supabase Configuration
const supabaseUrl = "https://axmxviywthnednwdvrik.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bXh2aXl3dGhuZWRud2R2cmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NzgyMjIsImV4cCI6MjA1MjA1NDIyMn0.Gx1cirBYFb4kCHF5kfwNJYmwKF0t9PxsKxdRZrjH3VM";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Fetch Events from Supabase
async function fetchEvents() {
  const { data: events, error } = await supabaseClient
    .from("events")
    .select("*");
  if (error) {
    console.error("Error fetching events:", error);
  } else {
    renderEvents(events);
  }
}

// Render Events in the UI
function renderEvents(events) {
  const eventsList = document.getElementById("events-list");
  eventsList.innerHTML = ""; // Clear existing events

  events.forEach((event) => {
    const eventDiv = document.createElement("div");
    eventDiv.classList.add("event");
    eventDiv.innerHTML = `
      <h3>${event.name}</h3>
      <p><strong>Date:</strong> ${event.date}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p><strong>Expected Crowd:</strong> ${event.expected_crowd}</p>
      <p><strong>Attire:</strong> ${event.attire ? event.attire : "N/A"}</p>
      <p><strong>Description:</strong> ${event.description}</p>
      <p><strong>Available Slots:</strong> ${event.available_slots}</p>
      <button onclick="bookEvent(${event.id})" ${
      event.available_slots === 0 ? "disabled" : ""
    }>
        ${event.available_slots === 0 ? "Sold Out" : "Book Slot"}
      </button>
      <button onclick="openRatingModal(${event.id})">Rate Hygiene</button>
    `;
    eventsList.appendChild(eventDiv);
  });
}

// Function to handle booking an event
async function bookEvent(eventId) {
  const event = await getEventById(eventId);
  if (event && event.available_slots > 0) {
    // Show payment modal
    const paymentModal = document.getElementById("payment-modal");
    paymentModal.style.display = "flex";

    // Handle payment form submission
    const paymentForm = document.getElementById("payment-form");
    paymentForm.onsubmit = function (e) {
      e.preventDefault();
      confirmPayment(eventId);
    };
  } else {
    alert("Sorry, this event is fully booked.");
  }
}

function StatusCompletedSucceeded() {
  window.location.reload();
}

// Open the rating modal
function openRatingModal(eventId) {
  const ratingModal = document.getElementById("rating-modal");
  ratingModal.style.display = "flex";

  // Handle rating form submission
  const ratingForm = document.getElementById("rating-form");
  ratingForm.onsubmit = async function (e) {
    e.preventDefault();
    const rating = document.getElementById("rating").value;
    const feedback = document.getElementById("feedback").value;
    await submitRating(eventId, rating, feedback);
  };

  // Close the modal when cancel is clicked
  document.getElementById("close-rating-modal").onclick = function () {
    ratingModal.style.display = "none";
  };
}

// Submit rating to Supabase
async function submitRating(eventId, rating, feedback) {
  const userEmail =
    localStorage.getItem("loggedInUserEmail") || "anonymous@user.com";

  const { data, error } = await supabaseClient.from("ratings").insert([
    {
      event_id: eventId,
      user_email: userEmail,
      rating: parseInt(rating),
      feedback: feedback,
    },
  ]);

  if (error) {
    console.error("Error submitting rating:", error);
    alert("Failed to submit your rating. Please try again.");
  } else {
    alert("Thank you for your feedback!");
    const ratingModal = document.getElementById("rating-modal");
    ratingModal.style.display = "none";
  }
}

// Function to confirm payment and decrease available slots in Supabase
async function confirmPayment(eventId) {
  const event = await getEventById(eventId);

  // Simulate successful payment
  const { data, error } = await supabaseClient
    .from("events")
    .update({ available_slots: event.available_slots - 1 })
    .eq("id", eventId);

  if (error) {
    console.error("Error updating event:", error);
    return;
  }

  // Add booking to Supabase (creating a record in the bookings table)
  // const userId = "some_user_id"; Normally, you would use a real user ID if available.
  const userEmail = localStorage.getItem("loggedInUserEmail"); // Retrieve the user's email
  let userId;
  if (userEmail) {
    console.log("Logged in user's email:", userEmail);
    userId = userEmail; // Use the logged-in user's email
  } else {
    console.error("No logged-in user email found.");
    userId = "some_user_id"; // Fallback to placeholder
  }
  const { data: bookingData, error: bookingError } = await supabaseClient
    .from("bookings")
    .insert([{ user_id: userId, event_id: eventId, status: "confirmed" }]);

  if (bookingError) {
    console.error("Error creating booking:", bookingError);
  } else {
    // Close the payment modal
    const paymentModal = document.getElementById("payment-modal");
    paymentModal.style.display = "none";

    // Show payment modal
    const qrModal = document.getElementById("qr-modal");
    qrModal.style.display = "flex";

    // Show QR code confirmation

    // let qrContentInput = document.getElementById("card-number");
    // let qrGenerationForm = document.getElementById("payment-form");
    // let qrCode;

    // function generateQrCode(qrContent) {
    //   return new QRCode("qr-code", {
    //     text: qrContent,
    //     width: 256,
    //     height: 256,
    //     colorDark: "#000000",
    //     colorLight: "#ffffff",
    //     correctLevel: QRCode.CorrectLevel.H,
    //   });
    // }

    // // Event listener for form submit event
    // qrGenerationForm.addEventListener("submit", function (event) {
    //   // Prevent form submission
    //   event.preventDefault();
    //   let qrContent = qrContentInput.value;
    //   if (qrCode == null) {

    //     // Generate code initially
    //     qrCode = generateQrCode(qrContent);
    //   } else {

    //     // If code already generated then make
    //     // again using same object
    //     qrCode.makeCode(qrContent);
    //   }
    // });
    // generateQRCode(eventId);
  }
}

// Function to get event details by ID from Supabase
async function getEventById(eventId) {
  const { data: event, error } = await supabaseClient
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();
  if (error) {
    console.error("Error fetching event by ID:", error);
  }
  return event;
}

// Function to generate a QR code for booking confirmation
// function generateQRCode(eventId) {
//   const event = getEventById(eventId);
//   if (!event) return;

//   const qrContainer = document.getElementById('qr-container');
//   const qrCodeCanvas = document.getElementById('qr-code');

//   const qrCodeData = `Booking Confirmed for: ${event.name}\nDate: ${event.date}\nLocation: ${event.location}`;

//   const qrCode = jsQR(qrCodeData, qrCodeCanvas.width, qrCodeCanvas.height);
//   qrCodeCanvas.width = 200;
//   qrCodeCanvas.height = 200;
//   const ctx = qrCodeCanvas.getContext('2d');
//   ctx.clearRect(0, 0, qrCodeCanvas.width, qrCodeCanvas.height);
//   ctx.putImageData(qrCode, 0, 0);

//   qrContainer.style.display = 'block';
// }

// Function to close the modal
document.getElementById("close-modal1").onclick = function () {
  const paymentModal = document.getElementById("payment-modal");
  paymentModal.style.display = "none";
  // const qrModal = document.getElementById('qr-modal');
  // qrModal.style.display = 'none';
  StatusCompletedSucceeded();
};

document.getElementById("close-modal2").onclick = function () {
  // const paymentModal = document.getElementById('payment-modal');
  // paymentModal.style.display = 'none';
  const qrModal = document.getElementById("qr-modal");
  qrModal.style.display = "none";
  StatusCompletedSucceeded();
};

// Initial fetch of events
fetchEvents();
