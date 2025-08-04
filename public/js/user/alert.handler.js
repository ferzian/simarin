document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get('success');
    const error = document.body.dataset.error;
  
    if (isSuccess === 'true') {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pendaftaran magang Anda telah dikirim.',
        confirmButtonColor: '#3085d6'
      });
      window.history.replaceState(null, null, window.location.pathname);
    }
  
    if (error && error !== 'undefined' && error !== '') {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error,
        confirmButtonColor: '#d33'
      });
    }
  });
  