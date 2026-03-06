import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: String,
    productId: String,
    quantity: Number,
    totalAmount: Number
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;