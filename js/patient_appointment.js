// Generate time slots (4:30 PM – 9:00 PM, 15-min interval)
function generateTimeSlots(selectedDate) {
  const select = document.getElementById("appointmentTime");
  select.innerHTML = '<option value="">Select Time Slot</option>';

  // Get reserved slots for the date
  const reserved = JSON.parse(localStorage.getItem('reservedSlots') || '{}');
  const reservedForDate = (selectedDate && reserved[selectedDate]) || [];

  let start = new Date();
  start.setHours(16, 30, 0); // 4:30 PM
  let end = new Date();
  end.setHours(21, 0, 0); // 9:00 PM

  while (start <= end) {
    const formatted = formatTime12(start);
    const option = document.createElement("option");
    option.value = formatted;
    if (reservedForDate.includes(formatted)) {
      option.disabled = true;
      option.textContent = `${formatted} (Reserved)`;
    } else {
      option.textContent = formatted;
    }
    select.appendChild(option);
    start.setMinutes(start.getMinutes() + 15);
  }
}

// Format time to 12-hour with AM/PM
function formatTime12(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minStr = minutes < 10 ? "0" + minutes : minutes;
  return `${hours}:${minStr} ${ampm}`;
}

// Generate unique patient ID if not exists
function generateOrGetPatientId(name, phone) {
  const patientDb = JSON.parse(localStorage.getItem('patientDatabase') || '{}');
  // Check if patient already exists by name+phone combo
  for (const [id, patient] of Object.entries(patientDb)) {
    if (patient.name === name && patient.phone === phone) {
      return id;
    }
  }
  // Generate new ID
  const newId = 'P' + Date.now().toString().slice(-8);
  patientDb[newId] = { name, phone, registeredDate: new Date().toISOString() };
  localStorage.setItem('patientDatabase', JSON.stringify(patientDb));
  return newId;
}

// Book appointment & download PDF
function bookAppointment() {
  const name = document.getElementById("patientName").value.trim();
  const phone = document.getElementById("patientPhone").value.trim();
  const doctor = document.getElementById("doctorId").value;
  const date = document.getElementById("appointmentDate").value;
  const time = document.getElementById("appointmentTime").value;

  if (!name || !phone || !date || !time) {
    alert("Please fill all fields and select date/time");
    return;
  }

  // Prevent booking a reserved time (safety check)
  const timeSelect = document.getElementById('appointmentTime');
  const selectedOption = timeSelect.options[timeSelect.selectedIndex];
  if (selectedOption && selectedOption.disabled) {
    alert('Selected time is reserved. Please choose another slot.');
    return;
  }

  const appointment = { name, phone, doctor, date, time };

  // Generate or get patient ID
  const patientId = generateOrGetPatientId(name, phone);
  appointment.patientId = patientId;

  // Show glassy modal
  showBookingModal();

  // Download PDF after slight delay to allow user to see modal
  setTimeout(() => {
    downloadSlip(appointment, patientId);
    // Clear form fields
    document.getElementById("patientName").value = "";
    document.getElementById("patientPhone").value = "";
    document.getElementById("appointmentTime").value = "";
    document.getElementById("appointmentDate").value = "";

    // Mark slot reserved for that date
    if (date && time) {
      const reserved = JSON.parse(localStorage.getItem('reservedSlots') || '{}');
      reserved[date] = reserved[date] || [];
      // avoid duplicates
      if (!reserved[date].includes(time)) reserved[date].push(time);
      localStorage.setItem('reservedSlots', JSON.stringify(reserved));
    }
  }, 500);
}

// Show modal and auto-hide after 7 sec
function showBookingModal() {
  const modal = document.getElementById("bookingModal");
  modal.style.display = "flex";

  // Auto hide after 7 seconds
  setTimeout(() => {
    modal.style.display = "none";
  }, 7000);
}

// Close modal manually
function closeBookingModal() {
  document.getElementById("bookingModal").style.display = "none";
}

// Download PDF
function downloadSlip(appointment, patientId) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("MediConnect Appointment Slip", 20, 20);
  doc.setFontSize(12);
  doc.text(`Patient ID: ${patientId}`, 20, 35);
  doc.text(`Name   : ${appointment.name}`, 20, 45);
  doc.text(`Phone  : ${appointment.phone}`, 20, 55);
  doc.text(`Doctor : ${appointment.doctor}`, 20, 65);
  doc.text(`Date   : ${appointment.date}`, 20, 75);
  doc.text(`Time   : ${appointment.time}`, 20, 85);
  doc.save(`${patientId}_${appointment.name}_appointment.pdf`);
}

// Initialize slots on page load and update when date changes
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('appointmentDate');
  generateTimeSlots(dateInput.value);

  dateInput.addEventListener('change', () => generateTimeSlots(dateInput.value));

  // Add reset button for sample convenience
  const container = document.querySelector('.card-custom');
  if (container) {
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-secondary mt-3 w-100';
    resetBtn.textContent = 'Reset Slots (dev)';
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all reserved slots now?')) {
        localStorage.removeItem('reservedSlots');
        generateTimeSlots(dateInput.value);
        alert('Slots reset');
      }
    });
    container.appendChild(resetBtn);
  }
});