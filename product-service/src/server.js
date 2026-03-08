import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import cookieParser from "cookie-parser";
import logger from "./config/logger.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());

// Request logger middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "Product Service Running" });
});

app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Product Service running on port ${PORT}`);
});