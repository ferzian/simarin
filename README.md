
# 🌊 SIMARIN - Sistem Informasi Manajemen Penerimaan Peserta & Survei Kepuasan Masyarakat

**SIMARIN** adalah sistem berbasis web yang digunakan untuk mengelola proses penerimaan peserta kegiatan (seperti Magang, PKL, dan Penelitian), serta survei kepuasan masyarakat (SKM) secara efisien dan real-time. Proyek ini dikembangkan untuk mendigitalisasi proses administratif di institusi pemerintahan terutama di Balai Riset Perikanan Budidaya Air Tawar dan Penyuluhan Perikanan.

---

## ✨ Fitur

- ✅ Registrasi akun pengguna
- 📥 Formulir pendaftaran kegiatan
- 📊 Dashboard rekap data peserta & SKM secara real-time
- 📈 Visualisasi data menggunakan Chart.js
- 📄 Download data peserta & SKM dalam format Excel
- 🔔 Email notifikasi user
- 🔒 Autentikasi dan otorisasi berbasis peran (admin & user)

---

## 🧰 Teknologi yang Digunakan

- **Node.js** & **Express.js**
- **Sequelize ORM** & **MySQL**
- **EJS** templating
- **Tailwind CSS** untuk UI
- **Chart.js** untuk grafik
- **Nodemailer** untuk email
- **ExcelJS** untuk ekspor data

---

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/ferzian/simarin.git
cd simarin
```

### 2. Install Dependency

```bash
npm install
```

### 3. Setup File `.env`

Buat file `.env` dan isi dengan konfigurasi berikut:

```env
DB_NAME=simarin
DB_USER=root
DB_PASS=password_database
DB_HOST=localhost

EMAIL_USER=emailkamu@gmail.com
EMAIL_PASS=app_password_gmail
```

### 4. Migrasi Database

```bash
npx sequelize db:migrate
```

### 5. Jalankan Aplikasi

```bash
npx nodemon server.js
```

Akses: [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Proyek

```
.
├── models/             # Sequelize models
├── routes/             # Routing auth dan admin
├── views/              # Template EJS
├── public/             # Static assets (CSS, JS)
├── utils/              # Helper (email, export)
├── middleware/         # Middleware auth
├── config/             # Konfigurasi database
├── server.js           # Entry point utama
└── .env                # Konfigurasi environment
```

---

## 🤝 Kontribusi

Kontribusi sangat terbuka!

1. Fork project ini
2. Buat branch fitur baru
3. Commit perubahan
4. Push ke branch
5. Buat Pull Request

---

## 👨‍💻 Pengembang

**Ferzian**  
Mahasiswa Ilmu Komputer - Universitas Pakuan  
📬 [m.ferzian09@gmail.com]  
🔗 [https://github.com/ferzian]
ℹ️ [https://linkedin.com/in/ferzian]

---

## 📄 Lisensi

Proyek ini menggunakan lisensi **MIT License**.  
Bebas digunakan, dimodifikasi, dan disebarluaskan — dengan tetap mencantumkan atribusi kepada pengembang asli.
