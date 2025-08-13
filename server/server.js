import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on PORT : ${PORT}`);
  });
});
