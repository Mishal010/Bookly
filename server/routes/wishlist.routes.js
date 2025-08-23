import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controllers/wishlist.controller.js";

const router = express.Router();

router.get("/", verifyToken(["user", "admin"]), getWishlist);
router.post("/:bookId", verifyToken(["user", "admin"]), addToWishlist);
router.delete("/:bookId", verifyToken(["user", "admin"]), removeFromWishlist);

export default router;
