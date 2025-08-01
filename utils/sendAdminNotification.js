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
    from: `"SIMARIN Notifikasi" <${user.email}>`,
    to: 'm.ferzian09@gmail.com',
    subject: '🔔 Pendaftaran Pengguna Baru di SIMARIN',
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4CAF50; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px;">🔔 Pendaftar Baru di SIMARIN!</h2>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 16px;">Halo Admin,</p>
          <p style="font-size: 16px;">Ada pengguna baru yang mendaftar di SIMARIN. Berikut detailnya:</p>
          <ul style="list-style: none; padding: 0; margin: 20px 0;">
            <li style="margin-bottom: 10px; padding: 10px; background-color: #f9f9f9; border-left: 4px solid #4CAF50; border-radius: 4px;">
              <strong>Nama Pengguna:</strong> <span style="font-weight: normal;">${user.username}</span>
            </li>
            <li style="margin-bottom: 10px; padding: 10px; background-color: #f9f9f9; border-left: 4px solid #4CAF50; border-radius: 4px;">
              <strong>Email:</strong> <span style="font-weight: normal;">${user.email}</span>
            </li>
            <li style="margin-bottom: 10px; padding: 10px; background-color: #f9f9f9; border-left: 4px solid #4CAF50; border-radius: 4px;">
              <strong>Nomor HP:</strong> <span style="font-weight: normal;">${user.phone || '-'}</span>
            </li>
            <li style="margin-bottom: 0; padding: 10px; background-color: #f9f9f9; border-left: 4px solid #4CAF50; border-radius: 4px;">
              <strong>Tanggal Lahir:</strong> <span style="font-weight: normal;">${user.dob || '-'}</span>
            </li>
          </ul>
          <p style="font-size: 16px;">Mohon segera login ke dashboard Anda untuk meninjau dan melakukan proses persetujuan.</p>
          <p style="text-align: center; margin-top: 30px;">
            <a href="https://g46grdgx-3000.asse.devtunnels.ms/login" style="display: inline-block; background-color: #4CAF50; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">
              Menuju Dashboard Admin
            </a>
          </p>
        </div>
        <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 12px; border-top: 1px solid #eee;">
          Pesan ini dikirim otomatis oleh sistem SIMARIN.
        </div>
      </div>
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
