// Data dummy (akan diambil dari `participantsData` global)
let currentParticipants = participantsData; // Gunakan data dummy global
let filteredParticipants = [];
let currentPage = 1;
const rowsPerPage = 5; // Jumlah baris per halaman

const totalParticipantsEl = document.getElementById("totalParticipants");
const avgDurationEl = document.getElementById("avgDuration");
const mostPopularTypeEl = document.getElementById("mostPopularType");
const genderChartCanvas = document.getElementById("genderChart");
const activityTypeChartCanvas = document.getElementById("activityTypeChart");
const majorChartCanvas = document.getElementById("majorChart");

const genderChartCtx = genderChartCanvas ? genderChartCanvas.getContext("2d") : null;
const activityTypeChartCtx = activityTypeChartCanvas ? activityTypeChartCanvas.getContext("2d") : null;
const majorChartCtx = majorChartCanvas ? majorChartCanvas.getContext("2d") : null;

const participantsTableBody = document.getElementById(
    "participantsTableBody"
);
const filterYearSelect = document.getElementById("filterYear");
const filterTypeSelect = document.getElementById("filterType");
const filterLocationSelect = document.getElementById("filterLocation");
const applyFilterBtn = document.getElementById("applyFilterBtn");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const currentPageSpan = document.getElementById("currentPage");
const totalPagesSpan = document.getElementById("totalPages");

let genderChart;
let activityTypeChart;
let majorChart;

// Fungsi untuk menghitung statistik dan update kartu ringkasan
function updateSummaryCards(data) {
    if (totalParticipantsEl) totalParticipantsEl.textContent = data.length;

    if (data.length === 0) {
        if (avgDurationEl) avgDurationEl.textContent = "0 hari";
        if (mostPopularTypeEl) mostPopularTypeEl.textContent = "N/A";
        return;
    }

    let totalDurationDays = 0;
    let typeCounts = {};

    data.forEach((p) => {
        const start = new Date(p.tanggalMulai);
        const end = new Date(p.tanggalSelesai);
        if (!isNaN(start) && !isNaN(end)) {
            totalDurationDays += (end - start) / (1000 * 60 * 60 * 24);
        }

        if (p.kegiatan) {
            typeCounts[p.kegiatan] = (typeCounts[p.kegiatan] || 0) + 1;
        }
    });

    if (avgDurationEl) avgDurationEl.textContent = `${Math.round(totalDurationDays / data.length)} hari`;

    const mostPopular = Object.keys(typeCounts).reduce(
        (a, b) => (typeCounts[a] > typeCounts[b] ? a : b),
        Object.keys(typeCounts)[0] || "N/A"
    );
    if (mostPopularTypeEl) mostPopularTypeEl.textContent = mostPopular || "N/A";
}

// Fungsi untuk memperbarui grafik
function updateCharts(data) {
    // Gender Chart
    if (genderChartCtx) {
        const genderCounts = { "Laki-Laki": 0, Perempuan: 0 };
        data.forEach((p) => {
            if (p.jenisKelamin === "Laki-Laki") genderCounts["Laki-Laki"]++;
            else if (p.jenisKelamin === "Perempuan") genderCounts["Perempuan"]++;
        });

        if (genderChart) genderChart.destroy();
        genderChart = new Chart(genderChartCtx, {
            type: "pie",
            data: {
                labels: Object.keys(genderCounts),
                datasets: [{
                    data: Object.values(genderCounts),
                    backgroundColor: ["#6366F1", "#EC4899"],
                }],
            },
        });
    }

    // Activity Type Chart
    if (activityTypeChartCtx) {
        const activityTypeCounts = {};
        data.forEach((p) => {
            activityTypeCounts[p.kegiatan] = (activityTypeCounts[p.kegiatan] || 0) + 1;
        });

        if (activityTypeChart) activityTypeChart.destroy();
        activityTypeChart = new Chart(activityTypeChartCtx, {
            type: "bar",
            data: {
                labels: Object.keys(activityTypeCounts),
                datasets: [{
                    label: "Jumlah Peserta",
                    data: Object.values(activityTypeCounts),
                    backgroundColor: ["#22C55E", "#3B82F6", "#A855F7"],
                }],
            },
        });
    }

    // Major Chart
    if (majorChartCtx) {
        const majorCounts = {};
        data.forEach((p) => {
            majorCounts[p.prodi] = (majorCounts[p.prodi] || 0) + 1;
        });
        const sortedMajors = Object.entries(majorCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        if (majorChart) majorChart.destroy();
        majorChart = new Chart(majorChartCtx, {
            type: "bar",
            data: {
                labels: sortedMajors.map((item) => item[0]),
                datasets: [{
                    label: "Jumlah Peserta",
                    data: sortedMajors.map((item) => item[1]),
                    backgroundColor: "#F97316",
                }],
            },
            options: { indexAxis: "y" },
        });
    }
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
            <td class="px-4 py-2">${p.nama}</td>
            <td class="px-4 py-2">${p.jenisKelamin}</td>
            <td class="px-4 py-2">${p.instansi}</td>
            <td class="px-4 py-2">${p.prodi}</td>
            <td class="px-4 py-2">${p.kegiatan}</td>
            <td class="px-4 py-2">${p.lokasi}</td>
            <td class="px-4 py-2">${formatIndoDate(p.tanggalMulai)} - ${formatIndoDate(p.tanggalSelesai)}</td>
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
if (applyFilterBtn) {
    applyFilterBtn.addEventListener("click", () => {
        let tempData = participantsData;

        if (filterYearSelect && filterYearSelect.value) {
            tempData = tempData.filter((p) => p.tanggalMulai.startsWith(filterYearSelect.value));
        }
        if (filterTypeSelect && filterTypeSelect.value) {
            tempData = tempData.filter((p) => p.kegiatan === filterTypeSelect.value);
        }
        if (filterLocationSelect && filterLocationSelect.value) {
            tempData = tempData.filter((p) => p.lokasi === filterLocationSelect.value);
        }

        updateUI(tempData);
    });
}

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

function formatIndoDate(dateStr) {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("id-ID", options);
}
// Inisialisasi awal UI saat halaman dimuat
window.onload = () => {
    updateUI(participantsData); // Muat data peserta awal
};