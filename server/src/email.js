import nodemailer from "nodemailer";

export async function sendCode(to, code) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: "Your sign-in code",
    text: `Your code is: ${code} (valid for 10 minutes)`,
  });
}
