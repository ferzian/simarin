// Data dummy (akan diambil dari `participantsData` global)
let currentParticipants = participantsData; // Gunakan data dummy global
let filteredParticipants = [];
let currentPage = 1;
const rowsPerPage = 5; // Jumlah baris per halaman

const participantsTableBody = document.getElementById(
    "participantsTableBody"
);
const searchTableInput = document.getElementById("searchTable");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const currentPageSpan = document.getElementById("currentPage");
const totalPagesSpan = document.getElementById("totalPages");

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

searchTableInput.addEventListener("keyup", () => {
    const searchTerm = searchTableInput.value.toLowerCase();
    const searchResults = filteredParticipants.filter(
        (p) =>
            p.nama.toLowerCase().includes(searchTerm) ||
            p.instansi.toLowerCase().includes(searchTerm) ||
            p.kegiatan.toLowerCase().includes(searchTerm)
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
        "Nama",
        "Jenis Kelamin",
        "Asal Instansi",
        "Jurusan",
        "Jenis Kegiatan",
        "Lokasi Kegiatan",
        "Tanggal Mulai",
        "Tanggal Selesai",
    ];

    const rows = filteredParticipants.map((p) => [
        p.nama,
        p.jenisKelamin,
        p.instansi,
        p.prodi,
        p.kegiatan,
        p.lokasi,
        formatIndoDate(p.tanggalMulai),
        formatIndoDate(p.tanggalSelesai),
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
        csvContent += row.map((e) => `"${e}"`).join(",") + "\n"; // Bungkus kutip biar aman
    });

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    if (link.download !== undefined) {
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