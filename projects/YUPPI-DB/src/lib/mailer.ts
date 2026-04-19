import nodemailer from 'nodemailer';

const user = 'sales@usktekstil.com.tr';
const pass = 'oohxmwqbhkjdfyfq';

export const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.com.tr',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user,
    pass,
  },
});

export const USK_SIGNATURE = `
<br><br>
<hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 20px;">
<div style="font-family: Arial, sans-serif; font-size: 13px; color: #444;">
  <strong>Defenni by USK Tekstil</strong><br>
  📱 +90 224 2612100<br>
  📧 <a href="mailto:sales@usktekstil.com.tr">sales@usktekstil.com.tr</a><br>
  🌎 <a href="https://defenni.com.tr">https://defenni.com.tr</a>
</div>
`;

export async function sendMail(to: string, subject: string, htmlContent: string) {
  try {
    const info = await transporter.sendMail({
      from: `"YUPPI ERP" <${user}>`,
      to,
      subject,
      html: htmlContent + USK_SIGNATURE,
    });
    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
