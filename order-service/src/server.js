import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import orderRoutes from "./routes/orderRoutes.js";
import { connectRabbitMQ } from "./rabbitmq.js";
import cookieParser from "cookie-parser";
import logger from "./config/logger.js";
import client from "prom-client";

dotenv.config();

const app = express();

// Prometheus metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
  name: "http_requests_total_order",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds_order",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
});

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3002;

// Request logger + metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  logger.info(`${req.method} ${req.url}`);

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route: req.path, status: res.statusCode }, duration);
  });

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

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.use("/api/orders", orderRoutes);

/* -------------------- Start Server -------------------- */
app.listen(PORT, "0.0.0.0", async () => {
  logger.info(`Order Service running on port ${PORT}`);
  await connectRabbitMQ();
});