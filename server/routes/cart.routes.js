import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", verifyToken(["user"]), getCart);

router.post("/:bookId", verifyToken(["user"]), addToCart);

router.patch("/:itemId", verifyToken(["user"]), updateCartItemQuantity);

router.delete("/:itemId", verifyToken(["user"]), removeCartItem);
router.delete("/", verifyToken(["user"]), clearCart);

export default router;
