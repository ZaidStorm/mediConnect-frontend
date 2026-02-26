const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const categorySelect = document.getElementById('category');
const shareSection = document.getElementById('shareSection');

let uploadedReports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");
// Get logged-in patient ID from session or prompt
function getOrPromptPatientId() {
  // Try to get from sessionStorage if available
  let patientId = sessionStorage.getItem('currentPatientId');
  if (!patientId) {
    patientId = prompt('Enter your Patient ID (from appointment slip):');
    if (!patientId) return null;
    sessionStorage.setItem('currentPatientId', patientId);
  }
  return patientId;
}
// Handle file selection
fileInput.addEventListener('change', () => {
  const patientId = getOrPromptPatientId();
  if (!patientId) {
    alert('Patient ID is required to upload reports.');
    return;
  }

  const files = Array.from(fileInput.files);
  const category = categorySelect.value;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const report = {
        id: Date.now() + Math.random(),
        patientId: patientId,
        name: file.name,
        category: category,
        image: e.target.result,
        uploadedAt: new Date().toISOString()
      };
      uploadedReports.push(report);
      localStorage.setItem("uploadedReports", JSON.stringify(uploadedReports));
      renderPreview();
      renderShareSection();
    };
    reader.readAsDataURL(file);
  });

  fileInput.value = '';
});

// Render Thumbnail Preview
function renderPreview() {
  filePreview.innerHTML = '';

  uploadedReports.forEach(report => {
    const col = document.createElement('div');
    col.className = 'col-md-3';

    col.innerHTML = `
      <div class="report-card">
        <img src="${report.image}" onclick="openModal('${report.image}')">
        <div class="report-info">
          <small>${report.category}</small>
          <button class="btn btn-sm btn-danger mt-2" onclick="removeReport(${report.id})">Remove</button>
        </div>
      </div>
    `;

    filePreview.appendChild(col);
  });
}

// Remove Report
function removeReport(id) {
  uploadedReports = uploadedReports.filter(r => r.id !== id);
  localStorage.setItem("uploadedReports", JSON.stringify(uploadedReports));
  renderPreview();
  renderShareSection();
}

// Preview All
function previewAll() {
  if (!uploadedReports.length) {
    alert("No reports uploaded.");
    return;
  }
  openModal(uploadedReports[0].image);
}

// Modal
function openModal(src) {
  document.getElementById("modalImage").src = src;
  document.getElementById("imageModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("imageModal").style.display = "none";
}

// Share Section
function renderShareSection() {
  shareSection.innerHTML = '';

  uploadedReports.forEach(report => {
    const col = document.createElement('div');
    col.className = 'col-md-2';

    col.innerHTML = `
      <div class="share-card">
        <img src="${report.image}">
        <small>${report.category}</small>
      </div>
    `;

    shareSection.appendChild(col);
  });
}
// Upload Button Function (Final Step)
function uploadFiles() {
  if (!uploadedReports.length) {
    alert("Please select at least one file before uploading.");
    return;
  }

  alert("Files uploaded successfully!");

  // Clear session patient ID on success
  sessionStorage.removeItem('currentPatientId');

  // Redirect to Dashboard
  window.location.href = "dashboard.html"; 
}

// Initial render
renderPreview();
renderShareSection();