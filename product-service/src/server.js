import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import cookieParser from "cookie-parser";
import logger from "./config/logger.js";
import client from "prom-client";
import cors from "cors";

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: "*" }));
// Prometheus metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
  name: "http_requests_total_product",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds_product",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
});

app.use(express.json());
app.use(cookieParser());

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

app.get("/health", (req, res) => {
  res.status(200).json({ status: "Product Service Running" });
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Product Service running on port ${PORT}`);
});