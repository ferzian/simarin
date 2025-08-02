// --- SweetAlert: Notifikasi Berhasil ---
const params = new URLSearchParams(window.location.search);
if (params.get('success') === 'true') {
  Swal.fire({
    title: 'Berhasil!',
    text: 'Pendaftaran magang telah disimpan.',
    icon: 'success',
    confirmButtonText: 'OK',
  }).then(() => {
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.href = '/auth/user/sertifikat';
  });
}

// --- Fungsi: Handle Perubahan File Upload + Preview ---
function handleFileChange(inputId, fileNameId, previewId) {
  const input = document.getElementById(inputId);
  const fileNameText = document.getElementById(fileNameId);
  const previewImg = document.getElementById(previewId);

  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    fileNameText.textContent = file.name;

    // Tampilkan preview jika file gambar
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewImg.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    } else {
      previewImg.classList.add("hidden");
      previewImg.src = "";
    }

    fileNameText.classList.remove("text-gray-400");
    fileNameText.classList.add("text-green-600", "font-semibold");
  } else {
    fileNameText.textContent = "Tidak ada file yang dipilih";
    fileNameText.classList.remove("text-green-600", "font-semibold");
    fileNameText.classList.add("text-gray-400");
    previewImg.classList.add("hidden");
    previewImg.src = "";
  }
}

// --- Fungsi: Drag-over feedback style ---
function applyDragEvents(label) {
  ['dragenter', 'dragover'].forEach(event => {
    label.addEventListener(event, (e) => {
      e.preventDefault();
      label.classList.add('border-blue-700', 'bg-blue-50');
    });
  });

  ['dragleave', 'drop'].forEach(event => {
    label.addEventListener(event, () => {
      label.classList.remove('border-blue-700', 'bg-blue-50');
    });
  });
}

// --- Daftar Upload yang Akan Diproses ---
const uploads = [
  { inputId: 'uploadPengantar', fileNameId: 'fileNamePengantar', previewId: 'previewPengantar' },
  { inputId: 'uploadFoto', fileNameId: 'fileNameFoto', previewId: 'previewFoto' },
  { inputId: 'uploadSehat', fileNameId: 'fileNameSehat', previewId: 'previewSehat' },
];

// --- Inisialisasi Semua Input Upload ---
uploads.forEach(({ inputId, fileNameId, previewId }) => {
  const input = document.getElementById(inputId);
  const label = document.querySelector(`label[for="${inputId}"]`);

  if (input && label) {
    input.addEventListener("change", () =>
      handleFileChange(inputId, fileNameId, previewId)
    );
    applyDragEvents(label);

    // --- Tambahan: Tangani File Saat Di-Drop ---
    label.addEventListener('drop', (e) => {
      e.preventDefault();
      label.classList.remove('border-blue-700', 'bg-blue-50');

      const file = e.dataTransfer.files[0];
      if (file) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;

        handleFileChange(inputId, fileNameId, previewId);
      }
    });
  }
});
