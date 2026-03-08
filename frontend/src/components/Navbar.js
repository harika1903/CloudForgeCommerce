"use client";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={() => router.push("/products")}>
        ☁️ CloudForgeCommerce
      </div>
      <div className={styles.links}>
        <span onClick={() => router.push("/products")}>Products</span>
        <span onClick={() => router.push("/cart")}>🛒 Cart</span>
        <span onClick={() => router.push("/orders")}>Orders</span>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
}