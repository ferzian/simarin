// slider
function slider() {
  return {
    images: [
      'https://images.bisnis.com/posts/2020/01/23/1193248/antara-tangkapan-nelayan-tradisional-mtb.jpg',
      'http://www.wwf.id/sites/default/files/slider/24.MARINE%26FISHERIES_TENTANG%20LAUT.jpg',
      'https://kkp.go.id/storage/foto/foto-65f117df90a2f.jpg',
    ],
    current: 0,
    interval: null,
    start() {
      this.interval = setInterval(() => {
        this.next();
      }, 3000);
    },
    next() {
      this.current = (this.current + 1) % this.images.length;
    },
    prev() {
      this.current = (this.current - 1 + this.images.length) % this.images.length;
    },
    goTo(index) {
      this.current = index;
    }
  };
}

// SweetAlert logout
function confirmLogout() {
  Swal.fire({
    title: 'Yakin ingin logout?',
    text: "Kamu akan kembali ke halaman login.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Ya',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      fetch('/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
      }).then(() => {
        window.location.href = '/auth/login';
      });
    }
  });
}

// Event listener tombol logout (kalau pakai tombol dengan id)
document.getElementById('logoutBtn')?.addEventListener('click', function (e) {
  e.preventDefault();
  confirmLogout();
});
