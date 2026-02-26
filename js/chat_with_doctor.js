// ---------- chat_with_doctor.js ----------
const chatBox = document.getElementById('chatBox');
const patientMessage = document.getElementById('patientMessage');
const uploadedFiles = document.getElementById('uploadedFiles');
const ratingSection = document.getElementById('ratingSection');

let selectedRating = 0;
let files = [
  { name: 'Blood_Test_Report.pdf', url: 'uploaded_files/blood_test.pdf' },
  { name: 'MRI_Scan.jpg', url: 'uploaded_files/mri_scan.jpg' }
]; // Example files, replace dynamically from backend in real app

// Add a chat message
function addMessage(sender, text) {
  const div = document.createElement('div');
  div.className = 'chat-message ' + sender;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Send patient message
function sendPatientMessage() {
  const msg = patientMessage.value.trim();
  if (!msg) return;
  addMessage('patient', msg);
  patientMessage.value = '';

  // Simulate doctor response
  setTimeout(() => addMessage('doctor', 'Doctor response to: "' + msg + '"'), 500);
}

// Set star rating
function setRating(rating) {
  selectedRating = rating;
  const stars = document.querySelectorAll('.rating-stars span');
  stars.forEach((star, index) => {
    star.classList.toggle('selected', index < rating);
  });
}

// Submit rating
function submitRating() {
  if (selectedRating === 0) {
    alert('Please select a rating.');
    return;
  }
  alert('Thank you! You rated the chat ' + selectedRating + ' stars.');
  ratingSection.style.display = 'none';
}

// Display uploaded files as clickable cards
function displayFiles() {
  uploadedFiles.innerHTML = '<h5>Uploaded Files</h5>';
  files.forEach(file => {
    const card = document.createElement('div');
    card.className = 'file-card';
    card.textContent = file.name;
    card.onclick = () => window.location.href = '../patient/manage_uploaded_file.html?file=' + encodeURIComponent(file.url);
    uploadedFiles.appendChild(card);
  });
}

// Initialize
displayFiles();