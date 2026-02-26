// ---------- Load Counts ----------
function loadDashboardCounts() {
  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
  const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
  const reports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");

  if (document.getElementById("totalAppointments"))
    document.getElementById("totalAppointments").textContent = appointments.length;

  if (document.getElementById("totalFeedbacks"))
    document.getElementById("totalFeedbacks").textContent = feedbacks.length;

  if (document.getElementById("totalReports"))
    document.getElementById("totalReports").textContent = reports.length;

  if (document.getElementById("analyticsAppointments"))
    document.getElementById("analyticsAppointments").textContent = appointments.length;

  if (document.getElementById("analyticsFeedbacks"))
    document.getElementById("analyticsFeedbacks").textContent = feedbacks.length;

  if (document.getElementById("analyticsReports"))
    document.getElementById("analyticsReports").textContent = reports.length;
}

// ---------- Render Appointments ----------
function renderAdminAppointments() {
  const table = document.getElementById("adminAppointmentsTable");
  if (!table) return;

  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
  table.innerHTML = "";

  appointments.forEach((appt, index) => {
    const row = document.createElement("tr");

    // show a disabled Sent button when already sent
    const actionButton = appt.sent ?
      `<button class="btn btn-success btn-sm" disabled>Sent</button>` :
      `<button class="btn btn-info btn-sm ms-2" onclick="sendAppointmentToDoctor(${index})">Send to Doctor</button>`;

    row.innerHTML = `
      <td>${appt.name}</td>
      <td>${appt.phone}</td>
      <td>${appt.doctor}</td>
      <td>${appt.date}</td>
      <td>${appt.time}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="removeAppointment(${index})">Delete</button>
        ${actionButton}
      </td>
    `;

    table.appendChild(row);
  });
}

// Send appointment to doctor's inbox (doctorInbox)
function sendAppointmentToDoctor(index) {
  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
  if (!appointments[index]) return alert("Appointment not found");

  const inbox = JSON.parse(localStorage.getItem("doctorInbox") || "[]");
  inbox.push(appointments[index]);
  localStorage.setItem("doctorInbox", JSON.stringify(inbox));

  // Mark appointment as sent in admin list
  appointments[index].sent = true;
  localStorage.setItem("appointments", JSON.stringify(appointments));

  // re-render UI
  renderAdminAppointments();
  loadDashboardCounts();

  alert("Appointment sent to doctor inbox.");
}

function removeAppointment(index) {
  let appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
  if (confirm("Delete this appointment?")) {
    appointments.splice(index, 1);
    localStorage.setItem("appointments", JSON.stringify(appointments));
    renderAdminAppointments();
    loadDashboardCounts();
  }
}

// ---------- Render Feedback ----------
function renderAdminFeedback() {
  const table = document.getElementById("adminFeedbackTable");
  if (!table) return;

  const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
  table.innerHTML = "";

  feedbacks.forEach((fb, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${fb.doctor}</td>
      <td>${fb.rating}</td>
      <td>${fb.comments}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="removeFeedback(${index})">Delete</button>
      </td>
    `;

    table.appendChild(row);
  });
}

function removeFeedback(index) {
  let feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
  if (confirm("Delete this feedback?")) {
    feedbacks.splice(index, 1);
    localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
    renderAdminFeedback();
    loadDashboardCounts();
  }
}

// ---------- Render Reports grouped by Patient ID ----------
function renderAdminReports() {
  const container = document.getElementById("adminReportSection");
  if (!container) return;

  const reports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");
  const patientDb = JSON.parse(localStorage.getItem("patientDatabase") || "{}");
  container.innerHTML = "";

  // Group reports by patientId
  const reportsByPatient = {};
  reports.forEach(report => {
    if (!reportsByPatient[report.patientId]) {
      reportsByPatient[report.patientId] = [];
    }
    reportsByPatient[report.patientId].push(report);
  });

  // Create a card for each patient with their reports
  Object.entries(reportsByPatient).forEach(([patientId, patientReports]) => {
    const patient = patientDb[patientId];
    const patientName = patient ? `${patient.name} (${patientId})` : patientId;
    const col = document.createElement("div");
    col.className = "col-md-4 mb-3";

    let reportHtml = '';
    patientReports.forEach((report, idx) => {
      reportHtml += `
        <div class="report-item mb-2">
          <img src="${report.image}" style="height: 100px; object-fit: cover; border-radius: 4px; cursor: pointer;" onclick="openModal('${report.image}')">
          <small>${report.category}</small>
        </div>
      `;
    });

    col.innerHTML = `
      <div class="patient-report-card p-3 border rounded" style="background: #f9f9f9;">
        <h5 class="mb-1">${patientName}</h5>
        <small class="text-muted">Reports: ${patientReports.length}</small>
        <div class="mt-2" style="max-height: 250px; overflow-y: auto;">
          ${reportHtml}
        </div>
        <div class="mt-3 gap-2 d-flex">
          <button class="btn btn-sm btn-info" onclick="sendReportsToDoctor('${patientId}')">Send to Doctor</button>
          <button class="btn btn-sm btn-danger" onclick="removePatientReports('${patientId}')">Remove All</button>
        </div>
      </div>
    `;

    container.appendChild(col);
  });
}

function sendReportsToDoctor(patientId) {
  const reports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");
  const patientDb = JSON.parse(localStorage.getItem("patientDatabase") || "{}");
  
  const patientReports = reports.filter(r => r.patientId === patientId);
  if (!patientReports.length) return alert("No reports to send");

  // Create report package for doctor
  const doctorReports = JSON.parse(localStorage.getItem("doctorReports") || "[]");
  doctorReports.push({
    patientId: patientId,
    patientName: patientDb[patientId]?.name || patientId,
    reports: patientReports,
    sentAt: new Date().toISOString(),
    sent: true
  });
  localStorage.setItem("doctorReports", JSON.stringify(doctorReports));

  alert(`Reports for patient ${patientId} sent to doctor.`);
}

function removePatientReports(patientId) {
  let reports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");
  if (confirm(`Delete all reports for patient ${patientId}?`)) {
    reports = reports.filter(r => r.patientId !== patientId);
    localStorage.setItem("uploadedReports", JSON.stringify(reports));
    renderAdminReports();
    loadDashboardCounts();
  }
}

// Modal for viewing reports
function openModal(src) {
  const modal = document.getElementById("imageModal");
  if (!modal) {
    const newModal = document.createElement("div");
    newModal.id = "imageModal";
    newModal.className = "modal-overlay";
    newModal.innerHTML = `
      <div class="modal-content text-center">
        <span class="modal-close" onclick="closeModal()">×</span>
        <img id="modalImage" style="max-width:100%; max-height:400px;">
      </div>
    `;
    document.body.appendChild(newModal);
  }
  document.getElementById("modalImage").src = src;
  document.getElementById("imageModal").style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("imageModal");
  if (modal) modal.style.display = "none";
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardCounts();
  renderAdminAppointments();
  renderAdminFeedback();
  renderAdminReports();
});
