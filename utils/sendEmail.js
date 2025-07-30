const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'm.ferzian09@gmail.com',
    pass: 'zvlg tunj uthw ldcg',
  },
});

// Email saat akun disetujui
const sendApprovalEmail = async (user) => {
  const mailOptions = {
    from: '"SIMARIN Admin" <m.ferzian09@gmail.com>',
    to: user.email,
    subject: '✅ Akun Anda Telah Disetujui',
    html: `
      <p>Halo <strong>${user.username}</strong>,</p>
      <p>Akun Anda di <strong>SIMARIN</strong> telah disetujui oleh admin 🎉</p>
      <p>Silakan login dan mulai gunakan sistemnya:</p>
      <a href="https://alamatwebmu.com/login" style="background-color:#3B82F6;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Login Sekarang</a>
      <p style="margin-top: 20px;">Salam hangat,<br>Tim SIMARIN</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Email saat akun ditolak
const sendRejectionEmail = async (user) => {
  const mailOptions = {
    from: '"SIMARIN Admin" <m.ferzian09@gmail.com>',
    to: user.email,
    subject: '❌ Akun Anda Ditolak',
    html: `
      <p>Halo <strong>${user.username}</strong>,</p>
      <p>Maaf, akun Anda di <strong>SIMARIN</strong> tidak disetujui oleh admin.</p>
      <p>Jika Anda merasa ini keliru, silakan hubungi kami untuk informasi lebih lanjut.</p>
      <p style="margin-top: 20px;">Salam,<br>Tim SIMARIN</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
};
