const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'm.ferzian09@gmail.com',
    pass: 'zvlg tunj uthw ldcg',
  },
});

const sendApprovalParticipantEmail = async (user) => {
  const mailOptions = {
    from: '"SIMARIN Admin" <m.ferzian09@gmail.com>',
    to: user.email,
    subject: '✅ Pengajuan Magang Anda Telah Disetujui!',
    html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #10B981; color: white; padding: 20px; text-align: center;">
          <h2>✅ Pengajuan Diterima</h2>
        </div>
        <div style="padding: 20px;">
          <p>Halo <strong>${user.username}</strong>,</p>
          <p>Selamat! Pengajuan magang Anda di <strong>SIMARIN</strong> telah <strong>disetujui</strong> oleh admin.</p>
          <p>Silakan login untuk melihat detail dan informasi lebih lanjut.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://g46grdgx-3000.asse.devtunnels.ms/login" style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Buka Dashboard
            </a>
          </p>
          <p>Jika ada pertanyaan, jangan ragu untuk menghubungi tim kami.</p>
          <p>Salam hangat,<br>Tim SIMARIN</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          Email ini dikirim otomatis oleh sistem.
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendRejectionParticipantEmail = async (user) => {
  const mailOptions = {
    from: '"SIMARIN Admin" <m.ferzian09@gmail.com>',
    to: user.email,
    subject: '❌ Pengajuan Magang Anda Ditolak',
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc2626; color: #fff; padding: 20px; text-align: center;">
          <h2>Pengajuan Magang Ditolak</h2>
        </div>
        <div style="padding: 20px;">
          <p>Halo <strong>${user.username}</strong>,</p>
          <p>Mohon maaf, pengajuan magang atau kerja praktik Anda melalui <strong>SIMARIN</strong> <strong>tidak dapat disetujui</strong> oleh admin.</p>
          <p>Silakan periksa kembali data yang Anda kirimkan, atau hubungi pihak terkait untuk informasi lebih lanjut.</p>
          <p style="margin-top: 20px;">Terima kasih atas pengertiannya.</p>
          <p>Salam hormat,<br>Tim SIMARIN</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};



module.exports = {
  // sendApprovalEmail,
  // sendRejectionEmail,
  sendApprovalParticipantEmail,
  sendRejectionParticipantEmail
};
