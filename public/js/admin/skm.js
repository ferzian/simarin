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

let ageChart;
let questionCharts = [];
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
        <td class="px-4 py-2">${item.school || "-"}</td>
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

function openSKMDetail(item) {
  const modal = document.getElementById("skmDetailModal");
  const box = document.getElementById("skmDetailBox");
  const detailContainer = document.getElementById("skmDetailContent");
  const nameElement = document.getElementById("skmDetailNama");

  // Daftar pertanyaan dan pilihan jawaban
  const questions = [
    "Bagaimana pendapat Saudara tentang kemudahan prosedur permohonan melakukan magang/PKL ?",
    "Bagaimana pendapat Saudara tentang kecepatan waktu petugas dalam memberikan tanggapan terhadap permohonan magang/PKL ?",
    "Bagaimana pendapat Saudara tentang kesesuaian topik/tema yang diajukan dengan pelaksanaan di lapangan ?",
    "Bagaimana pendapat Saudara tentang kompetensi/kemampuan pembimbing/teknisi lapang ?",
    "Bagaimana pendapat Saudara tentang respon pembimbing/teknisi lapang terhadap pelaksanaan teknis dalam proses magang/PKL ?",
    "Bagaimana pendapat Saudara perilaku petugas dalam pelayanan dari tahap penerimaan mahasiswa sebelum ke lapangan sampai tahap seminar hasil ?",
    "Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana pendukung magang/PKL ?",
    "Bagaimana pendapat Saudara tentang penanganan pengaduan pengguna layanan magang/PKL ?",
    "Bagaimana pendapat Saudara tentang pelaksanaan seminar hasil magang/PKL ?"
  ];

  const answerOptions = {
    // Pilihan untuk pertanyaan 1 dan 3
    type1: {
      1: "Tidak mudah",
      2: "Kurang mudah",
      3: "Mudah",
      4: "Sangat mudah"
    },
    // Pilihan untuk pertanyaan 2, 4, 5, 6, 7, 8, 9
    type2: {
      1: "Tidak baik",
      2: "Kurang baik",
      3: "Baik",
      4: "Sangat baik"
    },
    // Pilihan untuk pertanyaan 3
    type3: {
      1: "Tidak sesuai",
      2: "Kurang sesuai",
      3: "Sesuai",
      4: "Sangat sesuai"
    },
    // Pilihan untuk pertanyaan 4
    type4: {
      1: "Tidak kompeten",
      2: "Kurang kompeten",
      3: "Kompeten",
      4: "Sangat kompeten"
    },
  };

  // Fungsi untuk mendapatkan teks jawaban berdasarkan nomor pertanyaan
  function getAnswerText(qNumber, answer) {
    if (!answer || answer === "-") {
      return "-";
    }
    const qIndex = qNumber - 1; // Indeks array
    if (qIndex === 0) return answerOptions.type1[answer]; // Pertanyaan 1
    if (qIndex === 2) return answerOptions.type3[answer]; // Pertanyaan 3
    if (qIndex === 3) return answerOptions.type4[answer]; // Pertanyaan 4
    return answerOptions.type2[answer]; // Pertanyaan lainnya
  }

  nameElement.textContent = item.name || "Detail Responden";

  let html = `
    <h3 class="text-lg font-semibold text-gray-800 mb-2">Data Responden</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p><strong>Tanggal:</strong> ${item.date || "-"}</p>
        <p><strong>Jenis Kelamin:</strong> ${item.gender || "-"}</p>
        <p><strong>Usia:</strong> ${item.age || "-"}</p>
        <p><strong>Pendidikan:</strong> ${item.education || "-"}</p>
        <p><strong>Instansi:</strong> ${item.school || "-"}</p>
        <p><strong>Lokasi Kegiatan:</strong> ${item.location || "-"}</p>
    </div>
    <hr class="my-6 border-gray-200"/>
    <h3 class="text-lg font-semibold text-gray-800 mb-2">Komentar</h3>
    <p class="bg-gray-50 p-4 rounded-lg">${item.comment || "-"}</p>
    <hr class="my-6 border-gray-200"/>
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Jawaban Pertanyaan</h3>
  `;

  // Iterasi untuk menampilkan setiap pertanyaan dan jawaban
  for (let i = 1; i <= 9; i++) {
    const questionText = questions[i - 1];
    const answer = item["q" + i];
    const answerText = getAnswerText(i, answer);

    html += `
        <div class="mb-4">
            <p class="font-medium text-gray-800">
              <span class="mr-2">${i}.</span>${questionText}
            </p>
            <p class="text-gray-600 pl-6">${answerText}</p>
        </div>
    `;
  }

  detailContainer.innerHTML = html;
  modal.classList.remove("hidden");

  setTimeout(() => {
    box.classList.remove("scale-95", "opacity-0");
    box.classList.add("scale-100", "opacity-100");
  }, 10);
}

function closeSKMDetail() {
  const modal = document.getElementById("skmDetailModal");
  const box = document.getElementById("skmDetailBox");

  // Animasi keluar
  box.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 200);
}

// Tutup modal kalau klik di luar box
document.getElementById("skmDetailModal").addEventListener("click", (e) => {
  if (e.target.id === "skmDetailModal") {
    closeSKMDetail();
  }
});

// Statistik IKM & Chart
const ikmScoreEl = document.getElementById("ikmScore");
const totalRespEl = document.getElementById("totalSKMResponses");
let chart;

// Mapping label jawaban per pertanyaan
const questionLabels = {
  1: ["Tidak Mudah", "Kurang Mudah", "Mudah", "Sangat Mudah"],
  2: ["Tidak Baik", "Kurang Baik", "Baik", "Sangat Baik"],
  3: ["Tidak Sesuai", "Kurang Sesuai", "Sesuai", "Sangat Sesuai"],
  4: ["Tidak Kompeten", "Kurang Kompeten", "Kompeten", "Sangat Kompeten"],
  5: ["Tidak Baik", "Kurang Baik", "Baik", "Sangat Baik"],
  6: ["Tidak Baik", "Kurang Baik", "Baik", "Sangat Baik"],
  7: ["Tidak Baik", "Kurang Baik", "Baik", "Sangat Baik"],
  8: ["Tidak Baik", "Kurang Baik", "Baik", "Sangat Baik"],
  9: ["Tidak Baik", "Kurang Baik", "Baik", "Sangat Baik"],
};

const questionTexts = {
  1: "Bagaimana pendapat Saudara tentang kemudahan prosedur permohonan melakukan magang/PKL?",
  2: "Bagaimana pendapat Saudara tentang kecepatan waktu petugas dalam memberikan tanggapan terhadap permohonan magang/PKL?",
  3: "Bagaimana pendapat Saudara tentang kesesuaian topik/tema yang diajukan dengan pelaksanaan di lapangan?",
  4: "Bagaimana pendapat Saudara tentang kompetensi/kemampuan pembimbing/teknisi lapang?",
  5: "Bagaimana pendapat Saudara tentang respon pembimbing/teknisi lapang terhadap pelaksanaan teknis dalam proses magang/PKL?",
  6: "Bagaimana pendapat Saudara perilaku petugas dalam pelayanan dari tahap penerimaan mahasiswa sebelum ke lapangan sampai tahap seminar hasil?",
  7: "Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana pendukung magang/PKL?",
  8: "Bagaimana pendapat Saudara tentang penanganan pengaduan pengguna layanan magang/PKL?",
  9: "Bagaimana pendapat Saudara tentang pelaksanaan seminar hasil magang/PKL?",
};

function updateStats(data) {
  if (!data.length) {
    ikmScoreEl.textContent = "0.00";
    totalRespEl.textContent = "0";
    if (ageChart) ageChart.destroy();
    questionCharts.forEach((ch) => ch.destroy());
    return;
  }

  // Hitung IKM
  let totalScore = 0;
  let totalCount = 0;
  data.forEach((item) => {
    for (let i = 1; i <= 9; i++) {
      const val = parseInt(item["q" + i]);
      if (!isNaN(val)) {
        totalScore += val;
        totalCount++;
      }
    }
  });
  const ikm = totalCount ? (totalScore / totalCount).toFixed(2) : "0.00";
  ikmScoreEl.textContent = ikm;
  totalRespEl.textContent = data.length;

  /* =======================
     Chart Usia
  ======================= */
  let ageGroups = {
    "<20": 0,
    "20-29": 0,
    "30-39": 0,
    "40-49": 0,
    "50+": 0,
  };

  data.forEach((item) => {
    const age = parseInt(item.age);
    if (!isNaN(age)) {
      if (age < 20) ageGroups["<20"]++;
      else if (age < 30) ageGroups["20-29"]++;
      else if (age < 40) ageGroups["30-39"]++;
      else if (age < 50) ageGroups["40-49"]++;
      else ageGroups["50+"]++;
    }
  });

  if (ageChart) ageChart.destroy();
  const ageCtx = document.getElementById("ageChart");
  ageChart = new Chart(ageCtx, {
    type: "bar",
    data: {
      labels: Object.keys(ageGroups),
      datasets: [
        {
          label: "Jumlah Responden",
          data: Object.values(ageGroups),
          backgroundColor: "#3b82f6",
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
      },
    },
  });

  /* =======================
     Chart per Pertanyaan
  ======================= */
  // Bersihkan chart lama
  questionCharts.forEach((ch) => ch.destroy());
  questionCharts = [];

  const container = document.getElementById("questionsCharts");
  container.innerHTML = "";

  for (let i = 1; i <= 9; i++) {
    let distribusi = { 1: 0, 2: 0, 3: 0, 4: 0 };
    data.forEach((item) => {
      const val = parseInt(item["q" + i]);
      if (!isNaN(val)) distribusi[val]++;
    });

    // Buat canvas baru untuk chart ini
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-xl shadow-md p-4 text-center border";
    card.innerHTML = `
  <h2 class="font-semibold text-gray-700">Pertanyaan ${i}</h2>
  <p class="text-xs text-gray-400 italic mb-3">${questionTexts[i]}</p>
  <canvas id="qChart${i}" class="max-h-56"></canvas>
`;


    container.appendChild(card);

    const ctx = document.getElementById(`qChart${i}`);
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: questionLabels[i], // ["Tidak Baik", "Kurang Baik", "Baik", "Sangat Baik"]
        datasets: [{
          data: [distribusi[1], distribusi[2], distribusi[3], distribusi[4]],
          backgroundColor: ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"],
        }],
      },
      options: {
        plugins: {
          legend: { display: false },
        },
      },
    });

    questionCharts.push(chart);
  }
}

// Init
renderTable(filteredData);
updateStats(filteredData);
