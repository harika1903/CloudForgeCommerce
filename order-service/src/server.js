import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import orderRoutes from "./routes/orderRoutes.js";
import { connectRabbitMQ } from "./rabbitmq.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3002;

/* -------------------- MongoDB Connection -------------------- */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Order DB Connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

/* -------------------- Routes -------------------- */

app.get("/health", (req, res) => {
  res.json({ status: "Order Service Running" });
});

app.use("/api/orders", orderRoutes);

/* -------------------- Start Server -------------------- */

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Order Service running on port ${PORT}`);

  // connect to RabbitMQ when service starts
  await connectRabbitMQ();
});