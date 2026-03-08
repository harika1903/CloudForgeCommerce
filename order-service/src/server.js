import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import orderRoutes from "./routes/orderRoutes.js";
import { connectRabbitMQ } from "./rabbitmq.js";
import cookieParser from "cookie-parser";
import logger from "./config/logger.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3002;

// Request logger middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

/* -------------------- MongoDB Connection -------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info("Order DB Connected");
  })
  .catch((err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

/* -------------------- Routes -------------------- */
app.get("/health", (req, res) => {
  res.json({ status: "Order Service Running" });
});

app.use("/api/orders", orderRoutes);

/* -------------------- Start Server -------------------- */
app.listen(PORT, "0.0.0.0", async () => {
  logger.info(`Order Service running on port ${PORT}`);
  await connectRabbitMQ();
});