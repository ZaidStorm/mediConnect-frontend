// Get report index from query string
const params = new URLSearchParams(window.location.search);
const index = params.get("index");

let reports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");
let report = reports[index];

// Populate form with current data
if (report) {
  document.getElementById("editCategory").value = report.category;

  document.getElementById("currentFilePreview").innerHTML =
    `<img src="${report.image}" style="max-width:200px;">`;
}

// Save button
document.getElementById("saveBtn").addEventListener("click", () => {
  const fileInput = document.getElementById("replaceFile");

  if (fileInput.files.length === 0) {
    alert("Please select a new file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    reports[index].image = e.target.result;  // update image
    localStorage.setItem("uploadedReports", JSON.stringify(reports));
    alert("File updated successfully!");
    window.location.href = "dashboard.html"; // redirect
  };

  reader.readAsDataURL(fileInput.files[0]);
});