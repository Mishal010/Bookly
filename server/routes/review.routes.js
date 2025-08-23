import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { createReview, getReviews } from "../controllers/review.controller.js";
const router = express.Router();

router.get("/:bookId/reviews", getReviews);

router.post("/:bookId/review", verifyToken(["user", "admin"]), createReview);

export default router;
