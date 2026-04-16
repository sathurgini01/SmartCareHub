const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_PROVIDER || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, text }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `SmartCareHub <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

module.exports = { sendEmail };
