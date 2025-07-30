const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'm.ferzian09@gmail.com', // Email admin
    pass: 'zvlg tunj uthw ldcg',   // App Password admin
  },
});

const sendAdminNotification = async (user) => {
  const mailOptions = {
    from: `"SIMARIN Notifikasi" <${user.email}>`, // Kirim seolah-olah dari user
    to: 'm.ferzian09@gmail.com',                  // Email admin
    subject: '🛎️ Pendaftaran Baru di SIMARIN',
    html: `
      <p>Halo Admin,</p>
      <p>Ada pendaftar baru di SIMARIN:</p>
      <ul>
        <li><strong>Nama Pengguna:</strong> ${user.username}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Nomor HP:</strong> ${user.phone || '-'}</li>
        <li><strong>Tanggal Lahir:</strong> ${user.dob || '-'}</li>
      </ul>
      <p>Silakan login ke dashboard untuk proses approval.</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Notifikasi email terkirim ke admin:', info.response);
  } catch (err) {
    console.error('❌ Gagal kirim notifikasi ke admin:', err);
  }
};

module.exports = sendAdminNotification;
