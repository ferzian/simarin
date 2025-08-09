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
        row.innerHTML = `
  <td class="px-4 py-2">
    <img src="${p.pasFoto ? `/uploads/user/pas-foto/${p.pasFoto}` : '/images/no-image.png'}" 
         class="w-12 h-12 object-cover rounded-full border" />
  </td>
  <td class="px-4 py-2">${p.nama}</td>
  <td class="px-4 py-2">${p.nipNim}</td>
  <td class="px-4 py-2">${p.instansi}</td>
  <td class="px-4 py-2">${p.kegiatan}</td>
  <td class="px-4 py-2">${p.lokasi}</td>
  <td class="px-4 py-2">
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

// Tampilkan modal
function showDetail(p) {
    document.getElementById("detailNama").textContent = p.nama;
    document.getElementById("detailNipNim").textContent = p.nipNim;
    document.getElementById("detailJenisKelamin").textContent = p.jenisKelamin;
    document.getElementById("detailTelepon").textContent = p.telepon;
    document.getElementById("detailAlamat").textContent = p.alamat;
    document.getElementById("detailJenjang").textContent = p.jenjang;
    document.getElementById("detailInstansi").textContent = p.instansi;
    document.getElementById("detailProdi").textContent = p.prodi;
    document.getElementById("detailKegiatan").textContent = p.kegiatan;
    document.getElementById("detailLokasi").textContent = p.lokasi;
    document.getElementById("detailPeriode").textContent = `${formatIndoDate(p.tanggalMulai)} - ${formatIndoDate(p.tanggalSelesai)}`;

    // FOTO
    document.getElementById("detailFoto").src = p.pasFoto
        ? `/uploads/user/pas-foto/${p.pasFoto}`
        : "/images/no-image.png";

    // LINK FILE
    document.getElementById("detailSuratPengantar").href = p.suratPengantar
        ? `/uploads/user/surat-pengantar/${p.suratPengantar}`
        : "#";

    document.getElementById("detailSuratSehat").href = p.suratSehat
        ? `/uploads/user/surat-sehat/${p.suratSehat}`
        : "#";

    // TAMPILKAN MODAL
    document.getElementById("detailModal").classList.remove("hidden");
}


// Tutup modal dengan tombol X
document.getElementById("closeModalBtn").addEventListener("click", () => {
    document.getElementById("detailModal").classList.add("hidden");
});

// Tutup modal dengan klik di luar konten
document.getElementById("detailModal").addEventListener("click", (e) => {
    // Cek apakah yang diklik adalah area overlay (bukan konten modal)
    if (e.target.id === "detailModal") {
        document.getElementById("detailModal").classList.add("hidden");
    }
});


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

searchTableInput.addEventListener("keyup", () => {
    const searchTerm = searchTableInput.value.toLowerCase();
    const searchResults = filteredParticipants.filter(
        (p) =>
            p.nama.toLowerCase().includes(searchTerm) ||
            p.nipNim.toLowerCase().includes(searchTerm) ||
            p.jenisKelamin.toLowerCase().includes(searchTerm) ||
            p.telepon.toLowerCase().includes(searchTerm) ||
            p.alamat.toLowerCase().includes(searchTerm) ||
            p.jenjang.toLowerCase().includes(searchTerm) ||
            p.instansi.toLowerCase().includes(searchTerm) ||
            p.prodi.toLowerCase().includes(searchTerm) ||
            p.kegiatan.toLowerCase().includes(searchTerm) ||
            p.lokasi.toLowerCase().includes(searchTerm) ||
            p.tanggalMulai.toLowerCase().includes(searchTerm) ||
            p.tanggalSelesai.toLowerCase().includes(searchTerm)
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

function formatIndoDate(dateStr) {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("id-ID", options);
}

document.getElementById("downloadTableDataBtn").addEventListener("click", () => {
    const headers = [
        "Nama Lengkap",
        "NIS/NIM",
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
        p.nipNim,
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

    // Buat worksheet dan workbook
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Peserta");

    // Simpan sebagai file Excel
    XLSX.writeFile(workbook, "data_peserta_simarin.xlsx");
});


// Inisialisasi awal UI saat halaman dimuat
window.onload = () => {
    updateUI(participantsData); // Muat data peserta awal
};