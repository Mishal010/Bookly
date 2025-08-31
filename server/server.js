import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import bookRoutes from "./routes/book.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";

dotenv.config();

const PORT = process.env.PORT;
const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL, // your React app
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
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
app.use("api/cart", cartRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on PORT : ${PORT}`);
  });
});
