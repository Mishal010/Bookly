import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  cancelOrder,
  getAllOrders,
  getUserOrders,
  placeOrder,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", verifyToken(["user", "admin"]), placeOrder);
router.get("/", verifyToken(["user", "admin"]), getUserOrders);
router.get("/admin", verifyToken(["admin"]), getAllOrders);
router.patch("/:orderId/cancel", verifyToken(["user", "admin"]), cancelOrder);
router.patch("/:orderId/status", verifyToken(["admin"]), updateOrderStatus);

export default router;
