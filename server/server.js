import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import bookRoutes from "./routes/book.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";

dotenv.config();

const PORT = process.env.PORT;
const app = express();
// app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Testing:
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Route Middleware
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/books", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on PORT : ${PORT}`);
  });
});
