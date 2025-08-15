import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../config/email.js";

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Register user route-POST
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "user",
    });

    await sendEmail({
      to: email,
      subject: "Welcome to Bookly 📚",
      html: `<h2>Hi ${name},</h2><p>Welcome to <b>Bookly</b>! Your account is ready.</p>`,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login - POST
// If 2FA enabled -> send OTP & respond twoFactorRequired=true (no tokens yet)
// If not -> set refresh cookie & return access token
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    if (user.twoFactorEnabled) {
      const otp = generateOTP();
      user.twoFactorCode = otp;
      user.twoFactorCodeExpires = Date.now() + 5 * 60 * 60 * 1000;
      await user.save();

      await sendEmail({
        to: user.email,
        subject: "Your Bookly 2FA Code",
        html: `<p>Your verification code is: <b>${otp}</b> (valid for 5 minutes)</p>`,
      });
      return res.json({
        twoFactorRequired: true,
        message: "2FA Code sent to email",
      });
    }
    const { accessToken, refreshToken } = generateTokens(user);
    setRefreshCookie(res, refreshToken);
    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify 2FA-POST:

export const verify2FA = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.twoFactorEnabled) {
      return res
        .status(400)
        .json({ message: "2FA not enabled or invalid user" });
    }
    if (!user.twoFactorCode || user.twoFactorCodeExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP expired.Please login again." });
    }
    if (user.twoFactorCode != otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.twoFactorCode = undefined;
    user.twoFactorCodeExpires = undefined;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);
    setRefreshCookie(res, refreshToken);
    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

// Enable 2FA-POST:
export const enable2FA = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.twoFactorEnabled)
    return res.json({ message: "2FA already enabled" });

  user.twoFactorEnabled = true;
  await User.save();
  res.json({ message: "2FA enabled" });
};

// Disable 2FA - POST
export const disable2FA = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.twoFactorEnabled = false;
  user.twoFactorCode = undefined;
  user.twoFactorCodeExpires = undefined;
  await user.save();
  res.json({ message: "2FA disabled" });
};

// Refresh Access Token- POST:
export const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json("No refresh token");
  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });
    const accessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ accessToken });
  });
};

// Logout - POST:
export const logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json({ message: "Logged out" });
};

// Reset Password Request - POST
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res.json({
      message: "If the email exists, reset link has been sent",
    });
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({
    to: email,
    subject: "Password Reset Request",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link is only valid for 15 minutes.</p>`,
  });
  res.json({ message: "If the email exists, reset link has been sent" });
};

// Reset Password - POST:
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
};
