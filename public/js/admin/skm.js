const tableBody = document.getElementById("skmTableBody");
const searchInput = document.getElementById("searchSKMTable");
const filterStart = document.getElementById("filterSKMDateStart");
const filterEnd = document.getElementById("filterSKMDateEnd");
const applyFilterBtn = document.getElementById("applyFilterSKMBtn");
const prevPageBtn = document.getElementById("prevPageSKMBtn");
const nextPageBtn = document.getElementById("nextPageSKMBtn");
const currentPageEl = document.getElementById("currentSKMPage");
const totalPagesEl = document.getElementById("totalSKMPages");
const downloadBtn = document.getElementById("downloadSKMDataBtn");

let filteredData = skmData;
let currentPage = 1;
const rowsPerPage = 5;

downloadBtn.addEventListener("click", () => {
  const startDate = filterStart.value;
  const endDate = filterEnd.value;
  const search = searchInput.value;

  let url = `/admin/skm/export?`;
  if (startDate) url += `startDate=${encodeURIComponent(startDate)}&`;
  if (endDate) url += `endDate=${encodeURIComponent(endDate)}&`;
  if (search) url += `search=${encodeURIComponent(search)}&`;

  window.location.href = url;
});


// Render tabel
function renderTable(data) {
  tableBody.innerHTML = "";
  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-gray-500">Tidak ada data</td></tr>`;
    return;
  }

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = data.slice(start, end);

  pageData.forEach((item, idx) => {
    const row = `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-2">${item.date || "-"}</td>
        <td class="px-4 py-2">${item.gender || "-"}</td>
        <td class="px-4 py-2">${item.age || "-"}</td>
        <td class="px-4 py-2">${item.education || "-"}</td>
        <td class="px-4 py-2">${item.location || "-"}</td>
        <td class="px-4 py-2">
          <button onclick='openSKMDetail(${JSON.stringify(item)})'
            class="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 text-sm">Detail</button>
        </td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });

  updatePagination(data.length);
}

// Pagination
function updatePagination(totalRows) {
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  currentPageEl.textContent = currentPage;
  totalPagesEl.textContent = totalPages;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable(filteredData);
  }
});

nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable(filteredData);
  }
});

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();

  filteredData = skmData.filter((item) => {
    return (
      (item.instansi && item.instansi.toLowerCase().includes(keyword)) ||
      (item.location && item.location.toLowerCase().includes(keyword)) ||
      (item.gender && item.gender.toLowerCase().includes(keyword))
    );
  });

  currentPage = 1;
  renderTable(filteredData);
  updateStats(filteredData);
});


// Filter tanggal
applyFilterBtn.addEventListener("click", () => {
  const startDate = filterStart.value;
  const endDate = filterEnd.value;

  filteredData = skmData.filter((item) => {
    if (!item.date) return false;
    const d = new Date(item.date);
    return (!startDate || d >= new Date(startDate)) && (!endDate || d <= new Date(endDate));
  });

  currentPage = 1;
  renderTable(filteredData);
  updateStats(filteredData);
});

// Modal detail
function openSKMDetail(item) {
  document.getElementById("skmDetailModal").classList.remove("hidden");
  const detailContainer = document.getElementById("skmDetailContent");
  document.getElementById("skmDetailNama").textContent = item.name || "Detail Responden";

  let html = `
    <p><strong>Tanggal:</strong> ${item.date || "-"}</p>
    <p><strong>Jenis Kelamin:</strong> ${item.gender || "-"}</p>
    <p><strong>Usia:</strong> ${item.age || "-"}</p>
    <p><strong>Pendidikan:</strong> ${item.education || "-"}</p>
    <p><strong>Lokasi:</strong> ${item.location || "-"}</p>
    <p><strong>Komentar:</strong> ${item.comment || "-"}</p>
    <hr/>
  `;

  for (let i = 1; i <= 9; i++) {
    html += `<p><strong>P${i}:</strong> ${item["q" + i] || "-"}</p>`;
  }

  detailContainer.innerHTML = html;
}

function closeSKMDetail() {
  document.getElementById("skmDetailModal").classList.add("hidden");
}

// Statistik IKM & Chart
const ikmScoreEl = document.getElementById("ikmScore");
const totalRespEl = document.getElementById("totalSKMResponses");
let chart;

function updateStats(data) {
  if (!data.length) {
    ikmScoreEl.textContent = "0.00";
    totalRespEl.textContent = "0";
    if (chart) chart.destroy();
    return;
  }

  // Hitung skor rata-rata (anggap Q1–Q9 diisi angka 1–4)
  let totalScore = 0;
  let totalCount = 0;
  let distribusi = { 1: 0, 2: 0, 3: 0, 4: 0 };

  data.forEach((item) => {
    for (let i = 1; i <= 9; i++) {
      const val = parseInt(item["q" + i]);
      if (!isNaN(val)) {
        totalScore += val;
        totalCount++;
        distribusi[val] = (distribusi[val] || 0) + 1;
      }
    }
  });

  const ikm = totalCount ? (totalScore / totalCount).toFixed(2) : "0.00";
  ikmScoreEl.textContent = ikm;
  totalRespEl.textContent = data.length;

  // Chart
  if (chart) chart.destroy();
  const ctx = document.getElementById("satisfactionChart");
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Sangat Tidak Puas (1)", "Tidak Puas (2)", "Puas (3)", "Sangat Puas (4)"],
      datasets: [
        {
          label: "Jumlah",
          data: [distribusi[1], distribusi[2], distribusi[3], distribusi[4]],
          backgroundColor: ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"],
        },
      ],
    },
  });
}

// Init
renderTable(filteredData);
updateStats(filteredData);
