import axios from "axios";
import { signOut } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept responses to unwrap the standard { success, message, data } format
api.interceptors.response.use(
  (response) => {
    // If the response follows the { success, message, data } format, unwrap it
    if (response.data && response.data.hasOwnProperty("success") && response.data.hasOwnProperty("data")) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - force re-login
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Clear session and redirect to login
      signOut({ callbackUrl: "/login" });
    }
    return Promise.reject(error);
  }
);

export default api;
