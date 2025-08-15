import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: String(process.env.EMAIL_SECURE) === "true", // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const info = await transporter.sendMail({ from, to, subject, html });
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error; // rethrow so the caller knows it failed
  }
};
