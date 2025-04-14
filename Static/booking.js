
const supabaseUrl = "https://axmxviywthnednwdvrik.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bXh2aXl3dGhuZWRud2R2cmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NzgyMjIsImV4cCI6MjA1MjA1NDIyMn0.Gx1cirBYFb4kCHF5kfwNJYmwKF0t9PxsKxdRZrjH3VM";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Get the query string from the current URL
const urlParams = new URLSearchParams(window.location.search);

// Get individual parameters
const bookingId = urlParams.get('id');  // get booking id

async function fetchBooking() {
    const { data: booking, error } = await supabaseClient.from('bookings').select('*').eq('id', bookingId);
    if (error) {
        alert("Error fetching booking:", error);
    } else {
        booking.forEach(b => {
            // console.log(b);
            fetchEvent(b.event_id);
            fetchBookingInfo(b.booking_info_id);
        });
        renderBooking(booking);
    }
}

async function fetchEvent(eventId) {
    const { data: event, error } = await supabaseClient.from('events').select('*').eq('id', eventId);
    if (error) {
        alert("Error fetching events:", error);
    } else {
        renderEvent(event);
    }
}

async function fetchBookingInfo(bookingInfoId) {
    const { data: bookingInfo, error } = await supabaseClient.from('bookinginfo').select('*').eq('id', bookingInfoId);
    if (error) {
        alert("Error fetching events:", error);
    } else {
        renderBookingInfo(bookingInfo);
    }
}

// Render Booking in the UI
function renderBooking(booking) {
    const bookingList = document.getElementById('booking-list');
    bookingList.innerHTML = ''; // Clear existing events
  
    booking.forEach(booking => {
        let date = new Date(booking.booking_date);
        // let formattedDate = date.toLocaleString();

        // Extract date components
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        let year = date.getFullYear();

        // Extract time components
        let hours = date.getHours();
        let minutes = String(date.getMinutes()).padStart(2, '0');

        // Determine AM/PM
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;  // Convert to 12-hour format
        hours = hours ? hours : 12;  // Handle 0 as 12 (for midnight)
        
        // Build the formatted string: dd/mm/yyyy hh:mm a
        let formattedDate = `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;

        const bookingDiv = document.createElement('div');
        bookingDiv.classList.add('booking');
        bookingDiv.innerHTML = `
            <p><strong>Booking Status: </strong> ${booking.status}</p>
            <p><strong>Booked At: </strong> ${formattedDate}</p>
        `;
        bookingList.appendChild(bookingDiv);
    });
}



// Render Events in the UI
function renderEvent(events) {
    const eventsList = document.getElementById('events-list');
    eventsList.innerHTML = ''; // Clear existing events
  
    events.forEach(event => {
      const eventDiv = document.createElement('div');
      eventDiv.classList.add('event');
      eventDiv.innerHTML = `
        <p><strong>Event Name: </strong>${event.name}</p>
        <p><strong>Date: </strong> ${event.date}</p>
        <p><strong>Location: </strong> ${event.location}</p>
        <p><strong>Expected Crowd: </strong> ${event.expected_crowd}</p>
        <p><strong>Attire: </strong> ${event.attire ? event.attire:"N/A"}</p>
        <p><strong>Description: </strong> ${event.description}</p>
      `;
      eventsList.appendChild(eventDiv);
    });
  }

// Render Booking Info in the UI
function renderBookingInfo(bookingInfo) {
    const bookingInfoList = document.getElementById('info-list');
    bookingInfoList.innerHTML = ''; // Clear existing events
  
    bookingInfo.forEach(bookingInfo => {
      const bookingInfoDiv = document.createElement('div');
      bookingInfoDiv.classList.add('bookingInfo');
      bookingInfoDiv.innerHTML = `
        <p><strong>Booked By :</strong> ${bookingInfo.first_name} ${bookingInfo.last_name}</p>
        <p><strong>Stall Name :</strong> ${bookingInfo.stall_name}</p>
        <p><strong>Email :</strong> ${bookingInfo.email}</p>
      `;
      bookingInfoList.appendChild(bookingInfoDiv);
    });
  }

document.querySelectorAll('.close-modal.qrmodal').forEach( (e) => {
e.onclick = function() {
    const qrModal = document.getElementById('booking_page');
    window.location.href = 'home.html';
    // qrModal.style.display = 'none';
    StatusCompletedSucceeded();
}
});

fetchBooking();