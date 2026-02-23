import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, message, text }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject,
    html: message,   // for HTML emails
    text: text,      // for plain text emails
  });
};