import express from "express";
import axios from "axios";
import Order from "../models/Order.js";
import { publishEvent } from "../rabbitmq.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected - only logged in users can create orders
router.post("/", protect, async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const userResponse = await axios.get(`${process.env.USER_SERVICE_URL}/api/users/${userId}`);
    if (!userResponse.data) {
      return res.status(404).json({ message: "User not found" });
    }

    const productResponse = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/${productId}`);
    if (!productResponse.data) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productResponse.data;
    const totalAmount = product.price * quantity;

    const order = await Order.create({
      userId,
      productId,
      quantity,
      totalAmount
    });

    publishEvent({
      orderId: order._id,
      userId,
      totalAmount
    });

    res.status(201).json(order);

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error });
  }
});

export default router;