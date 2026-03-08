import express from "express";
import axios from "axios";
import Order from "../models/Order.js";
import { publishEvent } from "../rabbitmq.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { productId, quantity, totalAmount, address } = req.body;
    const userId = req.user.id; // get from JWT token

    const userResponse = await axios.get(`${process.env.USER_SERVICE_URL}/api/users/${userId}`);
    if (!userResponse.data) {
      return res.status(404).json({ message: "User not found" });
    }

    const productResponse = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/${productId}`);
    if (!productResponse.data) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productResponse.data;
    const calculatedTotal = product.price * quantity;

    const order = await Order.create({
      userId,
      productId,
      quantity,
      totalAmount: calculatedTotal,
      address,
      status: "pending"
    });

    publishEvent({
      orderId: order._id,
      userId,
      totalAmount: calculatedTotal
    });

    res.status(201).json(order);

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get orders for logged in user
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;