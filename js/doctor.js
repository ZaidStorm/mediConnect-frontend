// ---------------- Navigation ----------------
function navigateTo(page) {
    window.location.href = page;
}

// ---------------- Download Prescription PDF ----------------
function downloadPrescriptionPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("MediConnect Clinic", 20, 20);
    doc.setFontSize(12);
    doc.text("Doctor Prescription", 20, 28);

    const lineHeight = 8;
    let y = 40;

    // Patient Info
    const name = document.getElementById("prescPatientName").value.trim();
    const age = document.getElementById("prescAge").value.trim();
    const gender = document.getElementById("prescGender").value.trim();
    const date = document.getElementById("prescDate").value.trim();

    doc.setFontSize(14);
    let hasPatientInfo = name || age || gender || date;
    if (hasPatientInfo) {
        doc.text("Patient Information:", 20, y);
        y += lineHeight;
        doc.setFontSize(12);

        if (name) { doc.text(`Name   : ${name}`, 20, y); y += lineHeight; }
        if (age) { doc.text(`Age    : ${age}`, 20, y); y += lineHeight; }
        if (gender) { doc.text(`Gender : ${gender}`, 20, y); y += lineHeight; }
        if (date) { doc.text(`Date   : ${date}`, 20, y); y += lineHeight; }

        y += 4; // extra space after patient info
    }

    // Diagnosis
    const diagnosis = document.getElementById("prescDiagnosis").value.trim();
    if (diagnosis) {
        doc.setFontSize(14);
        doc.text("Diagnosis:", 20, y);
        y += lineHeight;
        doc.setFontSize(12);
        const diagLines = doc.splitTextToSize(diagnosis, 170);
        doc.text(diagLines, 20, y);
        y += diagLines.length * lineHeight + 4;
    }

    // Medicines
    const meds = document.getElementById("prescMeds").value.trim();
    if (meds) {
        doc.setFontSize(14);
        doc.text("Medicines:", 20, y);
        y += lineHeight;
        doc.setFontSize(12);
        const medLines = doc.splitTextToSize(meds, 170);
        doc.text(medLines, 20, y);
        y += medLines.length * lineHeight + 4;
    }

    // Lab Tests
    const labs = document.getElementById("prescLabs").value.trim();
    if (labs) {
        doc.setFontSize(14);
        doc.text("Lab Tests:", 20, y);
        y += lineHeight;
        doc.setFontSize(12);
        const labLines = doc.splitTextToSize(labs, 170);
        doc.text(labLines, 20, y);
        y += labLines.length * lineHeight + 4;
    }

    // Follow-up
    const followUp = document.getElementById("prescFollowUp").value.trim();
    if (followUp) {
        doc.setFontSize(14);
        doc.text("Follow-up:", 20, y);
        y += lineHeight;
        doc.setFontSize(12);
        doc.text(followUp, 20, y);
    }

    // Save PDF
    doc.save(`${name || "patient"}_prescription.pdf`);
}