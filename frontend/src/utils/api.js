import axios from "axios";

const USER_SERVICE = "https://user-service-production-94f9.up.railway.app";
const PRODUCT_SERVICE = "https://product-service-production-ae31.up.railway.app";
const ORDER_SERVICE = "https://order-service-production-b2f1.up.railway.app";

export const api = {
  // Auth
  googleLogin: () => {
    window.location.href = `${USER_SERVICE}/auth/google`;
  },

  // Products
  getProducts: (params) => axios.get(`${PRODUCT_SERVICE}/api/products`, { params }),
  getProduct: (id) => axios.get(`${PRODUCT_SERVICE}/api/products/${id}`),

  // Orders
  createOrder: (data, token) => axios.post(`${ORDER_SERVICE}/api/orders`, data, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getOrders: (token) => axios.get(`${ORDER_SERVICE}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};