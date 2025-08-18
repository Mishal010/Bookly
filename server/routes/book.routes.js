import express from "express";
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook,
} from "../controllers/book.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllBooks);
router.get("/:id", getBookById);

router.post("/", verifyToken(["admin"]), createBook);
router.patch("/:id", verifyToken(["admin"]), updateBook);
router.delete("/:id", verifyToken(["admin"]), deleteBook);

export default router;
