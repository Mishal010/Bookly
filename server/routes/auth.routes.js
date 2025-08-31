import {
  disable2FA,
  enable2FA,
  login,
  logout,
  profile,
  refresh,
  register,
  requestPasswordReset,
  resendOTP,
  resetPassword,
  verify2FA,
} from "../controllers/auth.controller.js";
import { Router } from "express";
import cookieParser from "cookie-parser";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(cookieParser());

router.get("/profile", verifyToken(), profile);

router.post("/register", register);
router.post("/login", login);
router.post("/verify-2fa", verify2FA);
router.post("/resend-2fa", resendOTP);

router.post("/refresh", refresh);
router.post("/logout", logout);

router.post("/request-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

router.post("/enable-2fa", verifyToken(), enable2FA);
router.post("/disable-2fa", verifyToken(), disable2FA);

export default router;
