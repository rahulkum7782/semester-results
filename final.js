let rollCounter = 1;
let reusableRolls = [];

const subjectSelect = document.getElementById("subject");
const otherSubjectInput = document.getElementById("otherSubject");

subjectSelect.addEventListener("change", () => {
  otherSubjectInput.style.display = subjectSelect.value === "Other" ? "inline-block" : "none";
  updateRoll();
});

function updateRoll() {
  const rollInput = document.getElementById("roll");

  if (reusableRolls.length > 0) {
    rollInput.value = reusableRolls[0];
  } else {
    rollInput.value = "24CS" + rollCounter;
  }
}

updateRoll();

function getDivisionClass(marks) {
  if (marks > 100 || marks < 0) {
    return { division: "Error", className: "error" }; // Invalid marks
  } else if (marks >= 60) {
    return { division: "First Division", className: "first" };
  } else if (marks > 45 && marks < 60) {
    return { division: "Second Division", className: "second" };
  } else if (marks >= 30 && marks <= 45) {
    return { division: "Pass", className: "pass" };
  } else {
    return { division: "Fail", className: "fail" };
  }
}

function addStudent() {
  let name = document.getElementById("name").value.trim();
  let roll = document.getElementById("roll").value.trim();
  let subject =
    subjectSelect.value === "Other"
      ? otherSubjectInput.value.trim()
      : subjectSelect.value;
  let marks = Number(document.getElementById("marks").value);

  if (!name || !subject || (!marks && marks !== 0)) {
    alert("Please fill all fields");
    return;
  }

  const divObj = getDivisionClass(marks);

  let table = document
    .getElementById("studentTable")
    .querySelector("tbody");
  let row = table.insertRow();

  row.insertCell(0).innerText = name;
  let rollCell = row.insertCell(1);
  rollCell.innerText = roll;
  rollCell.contentEditable = true;

  row.insertCell(2).innerText = subject;

  let marksCell = row.insertCell(3);
  marksCell.innerText = marks;
  marksCell.contentEditable = true;
  marksCell.className = divObj.className;

  let divCell = row.insertCell(4);
  divCell.innerText = divObj.division;
  divCell.className = divObj.className;

  let actionCell = row.insertCell(5);
  actionCell.innerHTML = `<button onclick="updateDivision(this)">Update</button>
                          <button onclick="deleteRow(this)">Delete</button>`;

  // Clear inputs
  document.getElementById("name").value = "";
  document.getElementById("marks").value = "";
  subjectSelect.value = "IWD";
  otherSubjectInput.style.display = "none";
  otherSubjectInput.value = "";

  if (reusableRolls.length > 0) reusableRolls.shift();
  else rollCounter++;
  updateRoll();
}

function updateDivision(btn) {
  let row = btn.parentNode.parentNode;
  let marks = Number(row.cells[3].innerText);
  const divObj = getDivisionClass(marks);
  row.cells[4].innerText = divObj.division;
  row.cells[3].className = divObj.className;
  row.cells[4].className = divObj.className;
}

function deleteRow(btn) {
  let row = btn.parentNode.parentNode;
  reusableRolls.push(row.cells[1].innerText);
  row.remove();
  updateRoll();
}

function resetTable() {
  document
    .getElementById("studentTable")
    .querySelector("tbody").innerHTML = "";
  rollCounter = 1;
  reusableRolls = [];
  updateRoll();
}

function deleteByRoll() {
  let rollToDelete = document.getElementById("deleteRoll").value.trim();
  if (!rollToDelete) {
    alert("Enter Roll No");
    return;
  }

  let table = document.getElementById("studentTable").querySelector("tbody");
  let rows = Array.from(table.rows);
  let found = false;
  rows.forEach((row) => {
    if (row.cells[1].innerText === rollToDelete) {
      reusableRolls.push(rollToDelete);
      row.remove();
      found = true;
    }
  });

  alert(found ? `Roll No ${rollToDelete} deleted` : `Roll No ${rollToDelete} not found`);
  document.getElementById("deleteRoll").value = "";
  updateRoll();
}

function downloadCSV() {
  let csv = [];
  document.querySelectorAll("#studentTable tbody tr").forEach((row) => {
    let cols = row.querySelectorAll("td");
    let data = [];
    cols.forEach((cell, index) => {
      if (index !== 5) data.push(cell.innerText);
    });
    csv.push(data.join(","));
  });
  let csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
  let downloadLink = document.createElement("a");
  downloadLink.download = "students.csv";
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add table header
  const headers = [["Name", "Roll No", "Subject", "Marks", "Division"]];
  const rows = [];

  document.querySelectorAll("#studentTable tbody tr").forEach((row) => {
    const rowData = [];
    row.querySelectorAll("td").forEach((cell, index) => {
      if (index !== 5) rowData.push(cell.innerText);
    });
    rows.push(rowData);
  });

  doc.autoTable({
    head: headers,
    body: rows,
    startY: 20,
    theme: "grid",
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    styles: { fontSize: 10 },
    didParseCell: function (data) {
      if (data.column.index === 3 || data.column.index === 4) {
        if (data.cell.section === "body") {
          let marks = Number(data.row.raw[3]);

          if (marks < 0 || marks > 100) {
            data.cell.styles.fillColor = [248, 113, 113]; // Red for error
          } else if (marks < 30) {
            data.cell.styles.fillColor = [248, 113, 113]; // Red for fail
          } else if (marks >= 30 && marks <= 45) {
            data.cell.styles.fillColor = [253, 230, 138]; // Yellow
          } else if (marks > 45 && marks < 60) {
            data.cell.styles.fillColor = [96, 165, 250]; // Blue
          } else if (marks >= 60) {
            data.cell.styles.fillColor = [52, 211, 153]; // Green
          }
        }
      }
    },
  });

  doc.save("students.pdf");
}
