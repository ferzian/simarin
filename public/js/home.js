const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('registered') === 'success') {
    Swal.fire({
        icon: 'success',
        title: 'Registrasi Berhasil!',
        text: 'Silakan tunggu admin untuk menyetujui akun Anda.',
        confirmButtonColor: '#3B82F6', // Tailwind Blue-500
    });
}

function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector(".eye-icon");

    if (input.type === "password") {
        input.type = "text";
        icon.outerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 eye-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.41-4.362M9.88 9.88a3 3 0 104.24 4.24" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 3l18 18" />
        </svg>`;
    } else {
        input.type = "password";
        icon.outerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 eye-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>`;
    }
}

function validateForm() {
    const pw = document.getElementById("password").value;
    const cpw = document.getElementById("confirmPassword").value;

    if (pw !== cpw) {
        alert("Konfirmasi password tidak cocok!");
        return false;
    }
    return true;
}