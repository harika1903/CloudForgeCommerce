"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { api } from "../../utils/api";
import styles from "./products.module.css";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    fetchProducts();
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.getProducts({ search });
      setProducts(res.data.products || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = existingCart.find((item) => item._id === product._id);
    let updatedCart;
    if (existing) {
      updatedCart = existingCart.map((item) =>
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...existingCart, { ...product, quantity: 1 }];
    }
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Products</h1>
          <input
            type="text"
            placeholder="Search products..."
            className={styles.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
          />
        </div>

        {loading ? (
          <div className={styles.loading}>Loading products...</div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <p>No products found.</p>
            <p>Add some products via the API first!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((product) => (
              <div key={product._id} className={styles.card}>
                <div className={styles.cardImage}>
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} />
                  ) : (
                    <div className={styles.placeholder}>📦</div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <h3>{product.name}</h3>
                  <p className={styles.description}>{product.description}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.price}>₹{product.price}</span>
                    <button
                      className={styles.addBtn}
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
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