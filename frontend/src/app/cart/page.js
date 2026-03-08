"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import styles from "./cart.module.css";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return removeItem(id);
    const updated = cart.map((item) =>
      item._id === id ? { ...item, quantity } : item
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cart.filter((item) => item._id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h1>Your Cart</h1>
        {cart.length === 0 ? (
          <div className={styles.empty}>
            <p>🛒 Your cart is empty!</p>
            <button onClick={() => router.push("/products")} className={styles.shopBtn}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className={styles.cartLayout}>
            <div className={styles.items}>
              {cart.map((item) => (
                <div key={item._id} className={styles.item}>
                  <div className={styles.itemImage}>📦</div>
                  <div className={styles.itemDetails}>
                    <h3>{item.name}</h3>
                    <p>₹{item.price}</p>
                  </div>
                  <div className={styles.quantity}>
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                  </div>
                  <div className={styles.itemTotal}>
                    ₹{item.price * item.quantity}
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeItem(item._id)}>🗑️</button>
                </div>
              ))}
            </div>
            <div className={styles.summary}>
              <h2>Order Summary</h2>
              <div className={styles.summaryRow}>
                <span>Items ({cart.length})</span>
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
              <button
                className={styles.checkoutBtn}
                onClick={() => router.push("/orders/place")}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}