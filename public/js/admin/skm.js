document.addEventListener("DOMContentLoaded", () => {
  // Ambil data SKM dari EJS yang dilempar server
  let skmData = [];
  if (typeof window.skmDataJSON !== "undefined") {
    skmData = JSON.parse(window.skmDataJSON);
  }

  const skmTableBody = document.getElementById("skmTableBody");
  const searchInput = document.getElementById("searchSKMTable");
  const currentPageEl = document.getElementById("currentSKMPage");
  const totalPagesEl = document.getElementById("totalSKMPages");
  const prevBtn = document.getElementById("prevPageSKMBtn");
  const nextBtn = document.getElementById("nextPageSKMBtn");
  const ikmScoreEl = document.getElementById("ikmScore");
  const totalResponsesEl = document.getElementById("totalSKMResponses");

  const detailModal = document.getElementById("skmDetailModal");
  const detailContent = document.getElementById("skmDetailContent");

  let filteredData = skmData;
  let currentPage = 1;
  const rowsPerPage = 5;

  function renderTable() {
    skmTableBody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);

    pageData.forEach(row => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="px-4 py-2">${row.date || "-"}</td>
        <td class="px-4 py-2">${row.gender || "-"}</td>
        <td class="px-4 py-2">${row.age || "-"}</td>
        <td class="px-4 py-2">${row.education || "-"}</td>
        <td class="px-4 py-2">${row.location || "-"}</td>
        <td class="px-4 py-2">
          <button class="text-blue-600 hover:underline" data-id="${row.id}">Detail</button>
        </td>
      `;
      skmTableBody.appendChild(tr);
    });

    currentPageEl.textContent = currentPage;
    totalPagesEl.textContent = Math.ceil(filteredData.length / rowsPerPage);

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= Math.ceil(filteredData.length / rowsPerPage);
  }

  function updateIKMScore() {
    // hitung IKM berdasarkan rata-rata jawaban q1..q9
    if (!skmData.length) {
      ikmScoreEl.textContent = "0.00";
      totalResponsesEl.textContent = "0";
      return;
    }

    let totalScore = 0;
    skmData.forEach(row => {
      let sum = 0;
      let count = 0;
      for (let i = 1; i <= 9; i++) {
        const val = parseInt(row[`q${i}`], 10);
        if (!isNaN(val)) {
          sum += val;
          count++;
        }
      }
      if (count > 0) {
        totalScore += sum / count;
      }
    });

    const ikm = (totalScore / skmData.length).toFixed(2);
    ikmScoreEl.textContent = ikm;
    totalResponsesEl.textContent = skmData.length;
  }

  function openDetail(id) {
    const data = skmData.find(d => d.id === id);
    if (!data) return;

    detailContent.innerHTML = `
      <p><strong>Nama:</strong> ${data.name || "-"}</p>
      <p><strong>Instansi/Sekolah:</strong> ${data.school || "-"}</p>
      <p><strong>Tanggal:</strong> ${data.date || "-"}</p>
      <p><strong>Lokasi:</strong> ${data.location || "-"}</p>
      <p><strong>Jenis Kelamin:</strong> ${data.gender || "-"}</p>
      <p><strong>Usia:</strong> ${data.age || "-"}</p>
      <p><strong>Pendidikan:</strong> ${data.education || "-"}</p>
      <p><strong>Komentar:</strong> ${data.comment || "-"}</p>
      <hr>
      ${[...Array(9)].map((_, i) => `<p><strong>Pertanyaan ${i+1}:</strong> ${data[`q${i+1}`] || "-"}</p>`).join("")}
    `;
    detailModal.classList.remove("hidden");
  }

  window.closeSKMDetail = () => {
    detailModal.classList.add("hidden");
  };

  // Event search
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    filteredData = skmData.filter(row =>
      (row.comment && row.comment.toLowerCase().includes(term)) ||
      (row.gender && row.gender.toLowerCase().includes(term))
    );
    currentPage = 1;
    renderTable();
  });

  // Event pagination
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });
  nextBtn.addEventListener("click", () => {
    if (currentPage < Math.ceil(filteredData.length / rowsPerPage)) {
      currentPage++;
      renderTable();
    }
  });

  // Event detail button
  skmTableBody.addEventListener("click", (e) => {
    if (e.target.dataset.id) {
      openDetail(parseInt(e.target.dataset.id, 10));
    }
  });

  // Init
  renderTable();
  updateIKMScore();
});
