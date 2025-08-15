// Data dummy (akan diambil dari `participantsData` global)
let currentParticipants = participantsData; // Gunakan data dummy global
let filteredParticipants = [];
let currentPage = 1;
const rowsPerPage = 5; // Jumlah baris per halaman

const totalParticipantsEl = document.getElementById("totalParticipants");
const avgDurationEl = document.getElementById("avgDuration");
const mostPopularTypeEl = document.getElementById("mostPopularType");
const genderChartCanvas = document.getElementById("genderChart");
const locationChartCanvas = document.getElementById("locationChart");
const activityTypeChartCanvas = document.getElementById("activityTypeChart");
const majorChartCanvas = document.getElementById("majorChart");

const genderChartCtx = genderChartCanvas ? genderChartCanvas.getContext("2d") : null;
const locationChartCtx = locationChartCanvas ? locationChartCanvas.getContext("2d") : null;
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
let locationChart;
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
    // Fungsi helper untuk filter data kosong
    const filterZeroData = (obj) => Object.entries(obj).filter(([_, count]) => count > 0);

    // Fungsi helper untuk tooltip persentase
    const tooltipPercent = {
        callbacks: {
            label: (context) => {
                let value = context.raw;
                let total = context.chart._metasets[0].total;
                let percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${value} (${percentage}%)`;
            }
        }
    };

    // Gender Chart
    if (genderChartCtx) {
        const genderCounts = { "Laki-Laki": 0, "Perempuan": 0 };
        data.forEach((p) => {
            if (p.jenisKelamin === "Laki-Laki") genderCounts["Laki-Laki"]++;
            else if (p.jenisKelamin === "Perempuan") genderCounts["Perempuan"]++;
        });

        const filtered = filterZeroData(genderCounts);

        if (genderChart) genderChart.destroy();
        genderChart = new Chart(genderChartCtx, {
            type: "pie",
            data: {
                labels: filtered.map(([label]) => label),
                datasets: [{
                    data: filtered.map(([_, count]) => count),
                    backgroundColor: ["#6366F1", "#EC4899"], // Biru, Pink
                }],
            },
            options: {
                aspectRatio: 1,
                plugins: {
                    legend: {
                        display: filtered.length > 0,
                        position: 'bottom',
                        labels: { color: '#374151', font: { size: 14 } }
                    },
                    tooltip: tooltipPercent
                }
            }
        });
    }

    // Location Chart
    if (locationChartCtx) {
        const locationCounts = { Sempur: 0, Depok: 0, Cibalagung: 0, Cijeruk: 0 };
        data.forEach((p) => {
            if (locationCounts.hasOwnProperty(p.lokasi)) {
                locationCounts[p.lokasi]++;
            }
        });

        const filtered = filterZeroData(locationCounts);

        if (locationChart) locationChart.destroy();
        locationChart = new Chart(locationChartCtx, {
            type: "pie",
            data: {
                labels: filtered.map(([label]) => label),
                datasets: [{
                    data: filtered.map(([_, count]) => count),
                    backgroundColor: ["#f87171", "#60a5fa", "#34d399", "#fbbf24"], // Merah, Biru, Hijau, Kuning
                }],
            },
            options: {
                aspectRatio: 1,
                plugins: {
                    legend: {
                        display: filtered.length > 0,
                        position: 'bottom',
                        labels: { color: '#374151', font: { size: 14 } }
                    },
                    tooltip: tooltipPercent
                }
            }
        });
    }

    // Activity Type Chart
    if (activityTypeChartCtx) {
        const activityTypeCounts = {};
        data.forEach((p) => {
            activityTypeCounts[p.kegiatan] = (activityTypeCounts[p.kegiatan] || 0) + 1;
        });

        const filtered = filterZeroData(activityTypeCounts);

        if (activityTypeChart) activityTypeChart.destroy();
        activityTypeChart = new Chart(activityTypeChartCtx, {
            type: "pie",
            data: {
                labels: filtered.map(([label]) => label),
                datasets: [{
                    data: filtered.map(([_, count]) => count),
                    backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"],
                }],
            },
            options: {
                aspectRatio: 1,
                plugins: {
                    legend: {
                        display: filtered.length > 0,
                        position: 'bottom',
                        labels: { color: '#374151', font: { size: 14 } }
                    },
                    tooltip: tooltipPercent
                }
            }
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
                labels: sortedMajors.map(([label]) => label),
                datasets: [{
                    label: "Jumlah Peserta",
                    data: sortedMajors.map(([_, count]) => count),
                    backgroundColor: "#F97316",
                }],
            },
            options: {
                indexAxis: "y",
                plugins: {
                    legend: { display: false },
                    tooltip: tooltipPercent
                },
                scales: {
                    x: { ticks: { color: '#374151' } },
                    y: { ticks: { color: '#374151' } }
                }
            }
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

// Helper: parse tanggal aman untuk "YYYY-MM-DD", "DD/MM/YYYY", "YYYY/MM/DD"
function parseDateSafe(v) {
    if (!v) return null;
    let d = new Date(v);
    if (!isNaN(d)) return d;

    const s = String(v).trim();

    // DD/MM/YYYY atau D/M/YYYY
    let m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (m) {
        let [_, dd, mm, yy] = m;
        let y = parseInt(yy, 10);
        if (y < 100) y += 2000;
        return new Date(y, parseInt(mm, 10) - 1, parseInt(dd, 10));
    }

    // YYYY/MM/DD atau YYYY-M-D
    m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (m) {
        let [_, y, mm, dd] = m;
        return new Date(parseInt(y, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
    }

    return null; // format tak dikenali
}

if (applyFilterBtn) {
    applyFilterBtn.addEventListener("click", () => {
        let tempData = participantsData.slice();

        const filterDateStart = document.getElementById("filterDateStart").value;
        const filterDateEnd = document.getElementById("filterDateEnd").value;

        if (filterTypeSelect?.value) {
            tempData = tempData.filter(p => p.kegiatan === filterTypeSelect.value);
        }
        if (filterLocationSelect?.value) {
            tempData = tempData.filter(p => p.lokasi === filterLocationSelect.value);
        }

        // Filter berdasarkan range tanggal yang dipilih
        if (filterDateStart && filterDateEnd) {
            const filterStart = new Date(filterDateStart);
            const filterEnd = new Date(filterDateEnd);

            tempData = tempData.filter(p => {
                const startDate = parseDateSafe(p.tanggalMulai);
                const endDate = parseDateSafe(p.tanggalSelesai);
                if (!startDate || !endDate) return false;

                // Contained filter: seluruh durasi kegiatan harus berada di dalam range
                return startDate >= filterStart && endDate <= filterEnd;
            });
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
    updateUI(participantsData);
};