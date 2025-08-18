let currentParticipants = participantsData;
let filteredParticipants = [];
let currentPage = 1;
let genderChart;
let activityTypeChart;
let majorChart;
let currentSort = { key: null, asc: true };
let baseParticipants = participantsData;
let currentFilterPeriod = "Semua Data";

const rowsPerPage = 5;

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
const searchTableInput = document.getElementById("searchTable");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const currentPageSpan = document.getElementById("currentPage");
const totalPagesSpan = document.getElementById("totalPages");

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

document.querySelectorAll("th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
        sortData(th.getAttribute("data-sort"));
    });
});

function renderTable(data, page) {
    participantsTableBody.innerHTML = "";
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach((p) => {
        // Cek status selesai berdasarkan tanggal
        if (p.tanggalSelesai) {
            const today = new Date();
            const endDate = new Date(p.tanggalSelesai);
            if (endDate < today) {
                p.statusSelesai = true;
            }
        }

        const statusBadge = p.statusSelesai
            ? `<span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full whitespace-nowrap">Selesai</span>`
            : `<span class="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full whitespace-nowrap">Belum Selesai</span>`;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="px-4 py-2">
                <img src="${p.pasFoto ? `/uploads/user/pas-foto/${p.pasFoto}` : '/images/user.png'}" 
                     class="w-12 h-12 object-cover rounded-full border" />
            </td>
            <td class="px-3 py-2 whitespace-nowrap">${p.nama}</td>
            <td class="px-3 py-2">${p.nisNpm}</td>
            <td class="px-3 py-2 whitespace-nowrap">${p.instansi}</td>
            <td class="px-3 py-2 whitespace-nowrap">${p.kegiatan}</td>
            <td class="px-3 py-2">${p.lokasi}</td>
            <td class="px-3 py-2 whitespace-nowrap">${statusBadge}</td>
            <td class="px-3 py-2">
                <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" 
                    onclick='showDetail(${JSON.stringify(p)})'>
                    Detail
                </button>
            </td>
        `;
        participantsTableBody.appendChild(row);
    });

    currentPageSpan.textContent = page;
    totalPagesSpan.textContent = Math.ceil(data.length / rowsPerPage);
    prevPageBtn.disabled = page === 1;
    nextPageBtn.disabled = page === Math.ceil(data.length / rowsPerPage);
}


function sortData(key) {
    if (currentSort.key === key) {
        currentSort.asc = !currentSort.asc;
    } else {
        currentSort.key = key;
        currentSort.asc = true;
    }

    document.querySelectorAll(".sort-indicator").forEach(el => {
        el.textContent = "⇅";
    });

    const activeTh = document.querySelector(`th[data-sort="${key}"] .sort-indicator`);
    if (activeTh) {
        activeTh.textContent = currentSort.asc ? "▲" : "▼";
    }

    filteredParticipants.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (key.includes('tanggal')) {
            valA = new Date(valA);
            valB = new Date(valB);
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return currentSort.asc ? -1 : 1;
        if (valA > valB) return currentSort.asc ? 1 : -1;
        return 0;
    });

    renderTable(filteredParticipants, currentPage);
}

function showDetail(p) {
    document.getElementById("detailNama").textContent = p.nama;
    document.getElementById("detailNisNpm").textContent = p.nisNpm;
    document.getElementById("detailJenisKelamin").textContent = p.jenisKelamin;
    document.getElementById("detailTelepon").textContent = p.telepon;
    document.getElementById("detailEmail").textContent = p.email;
    document.getElementById("detailAlamat").textContent = p.alamat;
    document.getElementById("detailJenjang").textContent = p.jenjang;
    document.getElementById("detailInstansi").textContent = p.instansi;
    document.getElementById("detailProdi").textContent = p.prodi;
    document.getElementById("detailKegiatan").textContent = p.kegiatan;
    document.getElementById("detailLokasi").textContent = p.lokasi;
    document.getElementById("detailPeriode").textContent = `${formatIndoDate(p.tanggalMulai)} - ${formatIndoDate(p.tanggalSelesai)}`;

    document.getElementById("detailFoto").src = p.pasFoto
        ? `/uploads/user/pas-foto/${p.pasFoto}`
        : "/images/user.png";

    document.getElementById("detailSuratPengantar").href = p.suratPengantar
        ? `/uploads/user/surat-pengantar/${p.suratPengantar}`
        : "#";

    document.getElementById("detailSuratSehat").href = p.suratSehat
        ? `/uploads/user/surat-sehat/${p.suratSehat}`
        : "#";

    document.getElementById("detailModal").classList.remove("hidden");
}

document.getElementById("closeModalBtn").addEventListener("click", () => {
    document.getElementById("detailModal").classList.add("hidden");
});

document.getElementById("detailModal").addEventListener("click", (e) => {
    if (e.target.id === "detailModal") {
        document.getElementById("detailModal").classList.add("hidden");
    }
});

function updateUI(data) {
    baseParticipants = Array.isArray(data) ? data.slice() : [];
    filteredParticipants = baseParticipants.slice();
    updateSummaryCards(filteredParticipants);
    updateCharts(filteredParticipants);
    currentPage = 1;
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

searchTableInput.addEventListener("input", () => {
    const searchTerm = searchTableInput.value.trim().toLowerCase();

    if (!searchTerm) {
        filteredParticipants = baseParticipants.slice();
    } else {
        filteredParticipants = baseParticipants.filter((p) => {
            const get = (v) => (v ? String(v).toLowerCase() : "");
            return (
                get(p.nama).includes(searchTerm) ||
                get(p.nisNpm).includes(searchTerm) ||
                get(p.jenisKelamin).includes(searchTerm) ||
                get(p.telepon).includes(searchTerm) ||
                get(p.alamat).includes(searchTerm) ||
                get(p.jenjang).includes(searchTerm) ||
                get(p.instansi).includes(searchTerm) ||
                get(p.prodi).includes(searchTerm) ||
                get(p.kegiatan).includes(searchTerm) ||
                get(p.lokasi).includes(searchTerm) ||
                get(p.tanggalMulai).includes(searchTerm) ||
                get(p.tanggalSelesai).includes(searchTerm)
            );
        });
    }

    currentPage = 1;
    renderTable(filteredParticipants, currentPage);
    updateCharts(filteredParticipants);
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

function formatIndoDate(dateStr) {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("id-ID", options);
}

document.getElementById("downloadTableDataBtn").addEventListener("click", () => {
    const headers = [
        "Nama Lengkap",
        "NIS/NPM",
        "Jenis Kelamin",
        "No. Telepon",
        "Alamat Domisili",
        "Jenjang Pendidikan",
        "Asal Instansi",
        "Jurusan",
        "Jenis Kegiatan",
        "Lokasi Kegiatan",
        "Tanggal Mulai",
        "Tanggal Selesai",
    ];

    const rows = filteredParticipants.map((p) => [
        p.nama,
        p.nisNpm,
        p.jenisKelamin,
        p.telepon,
        p.alamat,
        p.jenjang,
        p.instansi,
        p.prodi,
        p.kegiatan,
        p.lokasi,
        formatIndoDate(p.tanggalMulai),
        formatIndoDate(p.tanggalSelesai),
    ]);

    // 🔎 Ambil input tanggal dari filter
    const filterDateStart = document.getElementById("filterDateStart").value;
    const filterDateEnd = document.getElementById("filterDateEnd").value;

    let periodeText = "Periode: Semua Data";
    if (filterDateStart && filterDateEnd) {
        periodeText = `Periode: ${formatIndoDate(filterDateStart)} s/d ${formatIndoDate(filterDateEnd)}`;
    }

    const sheetData = [
        ["Laporan Data Peserta SIMARIN"],
        [periodeText],
        [],
        headers,
        ...rows,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Set lebar kolom
    worksheet['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 5, 20) }));

    // Set tinggi baris untuk judul
    worksheet['!rows'] = [{ hpt: 25 }, { hpt: 20 }];

    // Merge cell judul (A1 sampai L1, disesuaikan jumlah kolom)
    worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
    ];


    // Biar kolom rapih
    const colWidths = headers.map((h) => ({ wch: h.length + 5 }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Peserta");

    XLSX.writeFile(workbook, "data_peserta_simarin.xlsx");
});


window.onload = () => {
    updateUI(participantsData);
};