// --- Logika untuk Halaman Data Peserta ---

// Data dummy (akan diambil dari `participantsData` global)
let currentParticipants = participantsData; // Gunakan data dummy global
let filteredParticipants = [];
let currentPage = 1;
const rowsPerPage = 5; // Jumlah baris per halaman

const totalParticipantsEl = document.getElementById("totalParticipants");
const avgDurationEl = document.getElementById("avgDuration");
const mostPopularTypeEl = document.getElementById("mostPopularType");
const genderChartCtx = document
    .getElementById("genderChart")
    .getContext("2d");
const activityTypeChartCtx = document
    .getElementById("activityTypeChart")
    .getContext("2d");
const majorChartCtx = document
    .getElementById("majorChart")
    .getContext("2d");
const participantsTableBody = document.getElementById(
    "participantsTableBody"
);
const filterYearSelect = document.getElementById("filterYear");
const filterTypeSelect = document.getElementById("filterType");
const applyFilterBtn = document.getElementById("applyFilterBtn");
const searchTableInput = document.getElementById("searchTable");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const currentPageSpan = document.getElementById("currentPage");
const totalPagesSpan = document.getElementById("totalPages");

let genderChart;
let activityTypeChart;
let majorChart;

// Fungsi untuk menghitung statistik dan update kartu ringkasan
function updateSummaryCards(data) {
    totalParticipantsEl.textContent = data.length;

    if (data.length === 0) {
        avgDurationEl.textContent = "0 hari";
        mostPopularTypeEl.textContent = "N/A";
        return;
    }

    // Hitung rata-rata durasi (ini membutuhkan data tanggal yang lebih akurat, ini hanya contoh)
    let totalDurationDays = 0;
    data.forEach((p) => {
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        if (!isNaN(start) && !isNaN(end)) {
            totalDurationDays += (end - start) / (1000 * 60 * 60 * 24);
        }
    });
    avgDurationEl.textContent = `${Math.round(
        totalDurationDays / data.length
    )} hari`;

    // Hitung jenis kegiatan paling populer
    const typeCounts = {};
    data.forEach((p) => {
        typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
    });
    const mostPopular = Object.keys(typeCounts).reduce(
        (a, b) => (typeCounts[a] > typeCounts[b] ? a : b),
        Object.keys(typeCounts)[0]
    );
    mostPopularTypeEl.textContent = mostPopular || "N/A";
}

// Fungsi untuk memperbarui grafik
function updateCharts(data) {
    // Data untuk Jenis Kelamin
    const genderCounts = { "Laki-laki": 0, Perempuan: 0 };
    data.forEach((p) => {
        if (p.gender === "Laki-laki") genderCounts["Laki-laki"]++;
        else if (p.gender === "Perempuan") genderCounts["Perempuan"]++;
    });

    if (genderChart) genderChart.destroy();
    genderChart = new Chart(genderChartCtx, {
        type: "pie",
        data: {
            labels: Object.keys(genderCounts),
            datasets: [
                {
                    data: Object.values(genderCounts),
                    backgroundColor: ["#6366F1", "#EC4899"], // Indigo, Pink
                    hoverOffset: 4,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
                title: {
                    display: false,
                    text: "Distribusi Jenis Kelamin",
                },
            },
        },
    });

    // Data untuk Jenis Kegiatan
    const activityTypeCounts = {};
    data.forEach((p) => {
        activityTypeCounts[p.type] = (activityTypeCounts[p.type] || 0) + 1;
    });

    if (activityTypeChart) activityTypeChart.destroy();
    activityTypeChart = new Chart(activityTypeChartCtx, {
        type: "bar",
        data: {
            labels: Object.keys(activityTypeCounts),
            datasets: [
                {
                    label: "Jumlah Peserta",
                    data: Object.values(activityTypeCounts),
                    backgroundColor: ["#22C55E", "#3B82F6", "#A855F7"], // Green, Blue, Purple
                    borderColor: ["#16A34A", "#2563EB", "#9333EA"],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: false,
                    text: "Distribusi Jenis Kegiatan",
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                    },
                },
            },
        },
    });

    // Data untuk Jurusan Populer (Bar Chart Horizontal)
    const majorCounts = {};
    data.forEach((p) => {
        majorCounts[p.major] = (majorCounts[p.major] || 0) + 1;
    });
    const sortedMajors = Object.entries(majorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Ambil 5 teratas

    if (majorChart) majorChart.destroy();
    majorChart = new Chart(majorChartCtx, {
        type: "bar",
        data: {
            labels: sortedMajors.map((item) => item[0]),
            datasets: [
                {
                    label: "Jumlah Peserta",
                    data: sortedMajors.map((item) => item[1]),
                    backgroundColor: "#F97316", // Orange
                    borderColor: "#EA580C",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            indexAxis: "y", // Membuat bar horizontal
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: false,
                    text: "Distribusi Jurusan Populer",
                },
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                    },
                },
            },
        },
    });
}

// Fungsi untuk merender tabel peserta
function renderTable(data, page) {
    participantsTableBody.innerHTML = "";
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach((p) => {
        const row = document.createElement("tr");
        row.className = "table-row";
        row.innerHTML = `
            <td>${p.name}</td>
            <td>${p.gender}</td>
            <td>${p.major}</td>
            <td>${p.type}</td>
            <td>${p.institution}</td>
            <td>${p.startDate} - ${p.endDate}</td>
          `;
        participantsTableBody.appendChild(row);
    });

    currentPageSpan.textContent = page;
    totalPagesSpan.textContent = Math.ceil(data.length / rowsPerPage);

    prevPageBtn.disabled = page === 1;
    nextPageBtn.disabled = page === Math.ceil(data.length / rowsPerPage);
}

// Fungsi utama untuk inisialisasi dan update UI
function updateUI(data) {
    filteredParticipants = data; // Set data awal atau data setelah filter
    updateSummaryCards(filteredParticipants);
    updateCharts(filteredParticipants);
    currentPage = 1; // Reset halaman ke 1 setiap kali data berubah
    renderTable(filteredParticipants, currentPage);
}

// Event Listeners
applyFilterBtn.addEventListener("click", () => {
    const year = filterYearSelect.value;
    const type = filterTypeSelect.value;

    let tempData = participantsData;

    if (year) {
        tempData = tempData.filter((p) => p.startDate.startsWith(year)); // Filter berdasarkan tahun mulai
    }
    if (type) {
        tempData = tempData.filter((p) => p.type === type);
    }
    updateUI(tempData);
});

searchTableInput.addEventListener("keyup", () => {
    const searchTerm = searchTableInput.value.toLowerCase();
    const searchResults = filteredParticipants.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.institution.toLowerCase().includes(searchTerm) ||
            p.type.toLowerCase().includes(searchTerm)
    );
    currentPage = 1; // Reset halaman saat pencarian
    renderTable(searchResults, currentPage);
    // Perluas logika ini untuk grafik juga jika diinginkan
    updateCharts(searchResults); // Perbarui grafik dengan hasil pencarian
});

prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderTable(filteredParticipants, currentPage);
    }
});

nextPageBtn.addEventListener("click", () => {
    if (
        currentPage < Math.ceil(filteredParticipants.length / rowsPerPage)
    ) {
        currentPage++;
        renderTable(filteredParticipants, currentPage);
    }
});

document
    .getElementById("downloadTableDataBtn")
    .addEventListener("click", () => {
        const headers = [
            "Nama",
            "Jenis Kelamin",
            "Jurusan",
            "Jenis Kegiatan",
            "Asal Instansi",
            "Periode Mulai",
            "Periode Selesai",
        ];
        const rows = filteredParticipants.map((p) => [
            p.name,
            p.gender,
            p.major,
            p.type,
            p.institution,
            p.startDate,
            p.endDate,
        ]);

        let csvContent = headers.join(",") + "\n";
        rows.forEach((row) => {
            csvContent += row.map((e) => `"${e}"`).join(",") + "\n"; // Kutip nilai untuk menghindari masalah koma
        });

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            // Feature detection
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "data_peserta_simarin.csv");
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });

// Inisialisasi awal UI saat halaman dimuat
window.onload = () => {
    updateUI(participantsData); // Muat data peserta awal
};