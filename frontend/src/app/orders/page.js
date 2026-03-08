"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import { api } from "../../utils/api";
import styles from "./orders.module.css";

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    if (searchParams.get("success")) setSuccess(true);
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.getOrders(token);
      setOrders(res.data.orders || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#f39c12";
      case "processing": return "#3498db";
      case "completed": return "#2ecc71";
      case "cancelled": return "#e74c3c";
      default: return "#95a5a6";
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        {success && (
          <div className={styles.successBanner}>
            🎉 Order placed successfully! Your order is being processed.
          </div>
        )}
        <h1>My Orders</h1>
        {loading ? (
          <div className={styles.loading}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>
            <p>📦 No orders yet!</p>
            <button onClick={() => router.push("/products")} className={styles.shopBtn}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className={styles.orders}>
            {orders.map((order) => (
              <div key={order._id} className={styles.order}>
                <div className={styles.orderHeader}>
                  <div>
                    <span className={styles.orderId}>Order #{order._id.slice(-8).toUpperCase()}</span>
                    <span className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </span>
                  </div>
                  <span
                    className={styles.status}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status?.toUpperCase()}
                  </span>
                </div>
                <div className={styles.orderBody}>
                  <div className={styles.orderInfo}>
                    <span>📦 Product ID: {order.productId?.slice(-8) || "N/A"}</span>
                    <span>🔢 Quantity: {order.quantity}</span>
                  </div>
                  <div className={styles.orderTotal}>
                    ₹{order.totalAmount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { Suspense } = require("react");
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
}