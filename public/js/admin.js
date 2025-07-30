const userBtn = document.getElementById("dropdownUserButton");
const userMenu = document.getElementById("dropdownUserMenu");

userBtn.addEventListener("click", () => {
    userMenu.classList.toggle("hidden");
});

// Tutup dropdown kalau klik di luar
window.addEventListener("click", function (e) {
    if (!userBtn.contains(e.target) && !userMenu.contains(e.target)) {
        userMenu.classList.add("hidden");
    }
});

const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarTitle = document.getElementById("sidebarTitle");
const sidebarTitleButton = document.getElementById("sidebarTitleButton"); // New element
const menuTextWrappers = document.querySelectorAll(".menu-text-wrapper");

sidebarToggle.addEventListener("click", () => {
    toggleSidebar();
});

// Event listener for the new ADM button
sidebarTitleButton.addEventListener("click", () => {
    if (sidebar.classList.contains("w-20")) {
        // Only toggle if sidebar is collapsed
        toggleSidebar();
    }
});

function toggleSidebar() {
    sidebar.classList.toggle("w-64");
    sidebar.classList.toggle("w-20");

    menuTextWrappers.forEach((el) => {
        el.classList.toggle("hidden-text");
        el.style.width = sidebar.classList.contains("w-20") ? "0px" : "auto";
    });

    const isMinimized = sidebar.classList.contains("w-20");

    // Sembunyikan judul sidebar dan tombol toggle saat diminimize
    sidebarTitle.classList.toggle("hidden", isMinimized);
    sidebarTitleButton.classList.toggle("hidden", !isMinimized);
    sidebarToggle.classList.toggle("hidden", isMinimized); // 🔥 ini bikin tombol << hilang pas sidebar ditutup

    sidebar.querySelectorAll(".menu-item-link").forEach((item) => {
        item.classList.toggle("justify-center", isMinimized);
    });
}