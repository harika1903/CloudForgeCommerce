import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import passport from "./config/passport.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "User Service Running" });
});

// User routes
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});