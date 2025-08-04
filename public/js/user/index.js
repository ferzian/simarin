document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const bodySuccess = document.body.dataset.success;
  const bodyError = document.body.dataset.error;

  // --- Notifikasi SweetAlert ---
  if (params.get('success') === 'true' || bodySuccess === 'true') {
    Swal.fire({
      title: 'Berhasil!',
      text: 'Pendaftaran magang telah disimpan.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb'
    }).then(() => {
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.href = '/user/permintaan-sertifikat';
    });
  }

  if (bodyError) {
    Swal.fire({
      icon: 'error',
      title: 'Pendaftaran Gagal!',
      text: bodyError,
      confirmButtonColor: '#e11d48'
    });
  }

  // --- Fungsi: Preview dan Drag ---
  const uploads = [
    { inputId: 'uploadPengantar', fileNameId: 'fileNamePengantar', previewId: 'previewPengantar' },
    { inputId: 'uploadFoto', fileNameId: 'fileNameFoto', previewId: 'previewFoto' },
    { inputId: 'uploadSehat', fileNameId: 'fileNameSehat', previewId: 'previewSehat' }
  ];

  uploads.forEach(({ inputId, fileNameId, previewId }) => {
    const input = document.getElementById(inputId);
    const fileNameText = document.getElementById(fileNameId);
    const previewImg = document.getElementById(previewId);
    const label = document.querySelector(`label[for="${inputId}"]`);

    if (!input || !label || !fileNameText || !previewImg) return;

    input.addEventListener("change", () => {
      handleFileChange(input, fileNameText, previewImg);
    });

    label.addEventListener('dragover', (e) => {
      e.preventDefault();
      label.classList.add('border-blue-700', 'bg-blue-50');
    });

    ['dragleave', 'drop'].forEach(event => {
      label.addEventListener(event, () => {
        label.classList.remove('border-blue-700', 'bg-blue-50');
      });
    });

    label.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileChange(input, fileNameText, previewImg);
      }
    });
  });

  function handleFileChange(input, fileNameText, previewImg) {
    if (!input.files || input.files.length === 0) {
      fileNameText.textContent = "Tidak ada file yang dipilih";
      fileNameText.classList.remove("text-green-600", "font-semibold");
      fileNameText.classList.add("text-gray-400");
      previewImg.classList.add("hidden");
      previewImg.src = "";
      return;
    }

    const file = input.files[0];
    fileNameText.textContent = file.name;
    fileNameText.classList.remove("text-gray-400");
    fileNameText.classList.add("text-green-600", "font-semibold");

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
  }
});
