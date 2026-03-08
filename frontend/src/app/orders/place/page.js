"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { api } from "../../../utils/api";
import styles from "./place.module.css";

export default function PlaceOrderPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (savedCart.length === 0) router.push("/cart");
    setCart(savedCart);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      for (const item of cart) {
        await api.createOrder({
          productId: item._id,
          quantity: item.quantity,
          totalAmount: item.price * item.quantity,
          address,
        }, token);
      }
      localStorage.removeItem("cart");
      router.push("/orders?success=true");
    } catch (err) {
      console.error(err);
      alert("Order failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h1>Checkout</h1>
        <div className={styles.layout}>
          <div className={styles.left}>
            <div className={styles.section}>
              <h2>Delivery Address</h2>
              <div className={styles.form}>
                <input
                  placeholder="Street Address"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className={styles.input}
                />
                <div className={styles.row}>
                  <input
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className={styles.input}
                  />
                  <input
                    placeholder="State"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <input
                  placeholder="Pincode"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.section}>
              <h2>Order Items</h2>
              {cart.map((item) => (
                <div key={item._id} className={styles.orderItem}>
                  <span>📦 {item.name} x{item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.summary}>
            <h2>Payment Summary</h2>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Delivery</span>
              <span className={styles.free}>FREE</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <div className={styles.paymentNote}>
              🔒 Mock payment — no real charge
            </div>
            <button
              className={styles.placeBtn}
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}