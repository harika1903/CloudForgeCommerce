"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.push("/products");
  }, []);

const handleGoogleLogin = () => {
  window.location.href = "https://user-service-production-94f9.up.railway.app/api/users/auth/google";
};

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>☁️</div>
        <h1 className={styles.title}>CloudForgeCommerce</h1>
        <p className={styles.subtitle}>Sign in to start shopping</p>
        <button className={styles.googleBtn} onClick={handleGoogleLogin}>
          <img src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} />
          Continue with Google
        </button>
      </div>
    </div>
  );
}