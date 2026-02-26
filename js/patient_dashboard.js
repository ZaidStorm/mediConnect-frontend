// ---------- Feedback Function ----------
function submitFeedback() {
  const doctor = document.getElementById("doctorId").value;
  const rating = document.getElementById("rating").value;
  const comments = document.getElementById("comments").value;

  if (!rating || !comments) {
    alert("Please fill in all fields!");
    return;
  }

  alert(`Feedback submitted!\nDoctor: ${doctor}\nRating: ${rating}\nComments: ${comments}`);

  document.getElementById("rating").value = "";
  document.getElementById("comments").value = "";
}

// ---------- Upcoming Appointments JS ----------
function renderUpcomingAppointments() {
  const table = document.getElementById("upcomingAppointmentsTable");
  if (!table) return; // Prevent errors if the table doesn't exist

  table.innerHTML = "";
  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");

  // Show only today or future appointments
  const today = new Date().toISOString().split("T")[0];
  const upcoming = appointments.filter(appt => appt.date >= today);

  upcoming.forEach((appt, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${appt.name}</td>
      <td>${appt.doctor}</td>
      <td>${appt.date}</td>
      <td>${appt.time}</td>
      <td>
        <button class="btn btn-danger btn-sm me-1" onclick="removeAppointment(${index})">Remove</button>
        <button class="btn btn-secondary btn-sm" onclick="downloadAppointment(${index})">Download</button>
      </td>
    `;
    table.appendChild(row);
  });
}

function removeAppointment(index) {
  let appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
  if (confirm("Are you sure you want to remove this appointment?")) {
    appointments.splice(index, 1);
    localStorage.setItem("appointments", JSON.stringify(appointments));
    renderUpcomingAppointments();
  }
}

function downloadAppointment(index) {
  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
  const appt = appointments[index];

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Appointment Details", 20, 20);
  doc.setFontSize(12);
  doc.text(`Name: ${appt.name}`, 20, 40);
  doc.text(`Doctor: ${appt.doctor}`, 20, 50);
  doc.text(`Date: ${appt.date}`, 20, 60);
  doc.text(`Time: ${appt.time}`, 20, 70);

  doc.save(`Appointment_${appt.name}.pdf`);
}

// Render appointments on page load
document.addEventListener("DOMContentLoaded", () => {
  renderUpcomingAppointments();
  renderDashboardReports();
});

// ---------- Render Shared Reports on Dashboard ----------
function renderDashboardReports() {
  const container = document.getElementById("dashboardShareSection");
  if (!container) return;

  const reports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");

  container.innerHTML = "";

  reports.forEach((report, index) => {   // <-- added index here
    const col = document.createElement("div");
    col.className = "col-md-2";

    col.innerHTML = `
      <div class="share-card">
        <img src="${report.image}" 
             style="cursor:pointer"
             onclick="openDashboardModal('${report.image}')">
        <small>${report.category}</small>

        <div class="d-flex justify-content-between mt-2">
          <button class="btn btn-danger btn-sm"
                  onclick="removeDashboardReport(${index})">
            Remove
          </button>

          <a href="edit_uploaded_file.html?index=${index}"
             class="btn btn-warning btn-sm">
             Edit
          </a>
        </div>
      </div>
    `;

    container.appendChild(col);
  });
}

// ---------- Dashboard Image Modal ----------
function openDashboardModal(src) {
  document.getElementById("dashboardModalImage").src = src;
  document.getElementById("dashboardImageModal").style.display = "flex";
}

function closeDashboardModal() {
  document.getElementById("dashboardImageModal").style.display = "none";
}

// Remove Report From Dashboard
function removeDashboardReport(index) {
  let reports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");

  if (confirm("Are you sure you want to remove this report?")) {
    reports.splice(index, 1);
    localStorage.setItem("uploadedReports", JSON.stringify(reports));
    renderDashboardReports();
  }
}