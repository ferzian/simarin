// --- Logika untuk Halaman SKM ---

// Data dummy (akan diambil dari `skmData` global)
let currentSKMData = skmData; // Gunakan data dummy global
let filteredSKMData = [];
let currentSKMPage = 1;
const skmRowsPerPage = 5; // Jumlah baris per halaman

const ikmScoreEl = document.getElementById("ikmScore");
const totalSKMResponsesEl = document.getElementById("totalSKMResponses");
const satisfactionChartCtx = document
    .getElementById("satisfactionChart")
    .getContext("2d");
const skmTableBody = document.getElementById("skmTableBody");
const filterYearSKMSelect = document.getElementById("filterYearSKM");
const filterMonthSKMSelect = document.getElementById("filterMonthSKM");
const applyFilterSKMBtn = document.getElementById("applyFilterSKMBtn");
const searchSKMTableInput = document.getElementById("searchSKMTable");
const prevPageSKMBtn = document.getElementById("prevPageSKMBtn");
const nextPageSKMBtn = document.getElementById("nextPageSKMBtn");
const currentSKMPageSpan = document.getElementById("currentSKMPage");
const totalSKMPagesSpan = document.getElementById("totalSKMPages");

let satisfactionChart;

// Fungsi untuk menghitung IKM dan update kartu ringkasan
function updateIKMSummary(data) {
    totalSKMResponsesEl.textContent = data.length;

    if (data.length === 0) {
        ikmScoreEl.textContent = "0.00";
        return;
    }

    let totalScore = 0;
    data.forEach((response) => {
        switch (response.rating) {
            case "Sangat Baik":
                totalScore += 4;
                break;
            case "Baik":
                totalScore += 3;
                break;
            case "Cukup":
                totalScore += 2;
                break;
            case "Kurang Baik":
                totalScore += 1;
                break;
        }
    });
    const ikm = (totalScore / (data.length * 4)) * 100; // Hitung IKM dalam skala 0-100
    ikmScoreEl.textContent = ikm.toFixed(2);
}

// Fungsi untuk memperbarui grafik kepuasan
function updateSatisfactionChart(data) {
    const ratingCounts = {
        "Kurang Baik": 0,
        Cukup: 0,
        Baik: 0,
        "Sangat Baik": 0,
    };
    data.forEach((response) => {
        if (ratingCounts.hasOwnProperty(response.rating)) {
            ratingCounts[response.rating]++;
        }
    });

    if (satisfactionChart) satisfactionChart.destroy();
    satisfactionChart = new Chart(satisfactionChartCtx, {
        type: "doughnut", // Atau 'bar' jika ingin batang
        data: {
            labels: Object.keys(ratingCounts),
            datasets: [
                {
                    data: Object.values(ratingCounts),
                    backgroundColor: ["#EF4444", "#FCD34D", "#22C55E", "#3B82F6"], // Red, Yellow, Green, Blue
                    hoverOffset: 8,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "right", // Untuk doughnut chart, legend di kanan lebih baik
                },
                title: {
                    display: false,
                    text: "Distribusi Tanggapan Kepuasan",
                },
            },
        },
    });
}

// Fungsi untuk merender tabel SKM
function renderSKMTable(data, page) {
    skmTableBody.innerHTML = "";
    const start = (page - 1) * skmRowsPerPage;
    const end = start + skmRowsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach((response) => {
        const row = document.createElement("tr");
        row.className = "table-row";
        row.innerHTML = `
            <td>${response.date}</td>
            <td>${response.rating}</td>
            <td>${response.comment}</td>
          `;
        skmTableBody.appendChild(row);
    });

    currentSKMPageSpan.textContent = page;
    totalSKMPagesSpan.textContent = Math.ceil(data.length / skmRowsPerPage);

    prevPageSKMBtn.disabled = page === 1;
    nextPageSKMBtn.disabled =
        page === Math.ceil(data.length / skmRowsPerPage);
}

// Fungsi utama untuk inisialisasi dan update UI
function updateSKMUI(data) {
    filteredSKMData = data; // Set data awal atau data setelah filter
    updateIKMSummary(filteredSKMData);
    updateSatisfactionChart(filteredSKMData);
    currentSKMPage = 1; // Reset halaman ke 1 setiap kali data berubah
    renderSKMTable(filteredSKMData, currentSKMPage);
}

// Event Listeners
applyFilterSKMBtn.addEventListener("click", () => {
    const year = filterYearSKMSelect.value;
    const month = filterMonthSKMSelect.value;

    let tempData = skmData;

    if (year) {
        tempData = tempData.filter((response) =>
            response.date.startsWith(year)
        );
    }
    if (month) {
        tempData = tempData.filter(
            (response) => response.date.substring(5, 7) === month
        );
    }
    updateSKMUI(tempData);
});

searchSKMTableInput.addEventListener("keyup", () => {
    const searchTerm = searchSKMTableInput.value.toLowerCase();
    const searchResults = filteredSKMData.filter(
        (response) =>
            response.rating.toLowerCase().includes(searchTerm) ||
            response.comment.toLowerCase().includes(searchTerm)
    );
    currentSKMPage = 1; // Reset halaman saat pencarian
    renderSKMTable(searchResults, currentSKMPage);
    // Anda bisa memilih untuk memperbarui grafik dengan hasil pencarian atau tidak
    updateSatisfactionChart(searchResults);
});

prevPageSKMBtn.addEventListener("click", () => {
    if (currentSKMPage > 1) {
        currentSKMPage--;
        renderSKMTable(filteredSKMData, currentSKMPage);
    }
});

nextPageSKMBtn.addEventListener("click", () => {
    if (
        currentSKMPage < Math.ceil(filteredSKMData.length / skmRowsPerPage)
    ) {
        currentSKMPage++;
        renderSKMTable(filteredSKMData, currentSKMPage);
    }
});

document
    .getElementById("downloadSKMDataBtn")
    .addEventListener("click", () => {
        const headers = ["ID", "Tanggal", "Tanggapan", "Komentar"];
        const rows = filteredSKMData.map((r) => [
            r.id,
            r.date,
            r.rating,
            r.comment.replace(/"/g, '""'), // Escape double quotes for CSV
        ]);

        let csvContent = headers.join(",") + "\n";
        rows.forEach((row) => {
            csvContent += row.map((e) => `"${e}"`).join(",") + "\n";
        });

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "data_skm_simarin.csv");
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });

// Inisialisasi awal UI saat halaman dimuat
window.onload = () => {
    updateSKMUI(skmData); // Muat data SKM awal
};