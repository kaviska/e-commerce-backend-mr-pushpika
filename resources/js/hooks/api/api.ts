import axios from "axios";
import { router } from "@inertiajs/react";

export const api = axios.create({
    baseURL: "/api",
    timeout: 100000,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

import { getUserId } from "@/lib/auth";

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user)?.id : null;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // if (userId) {
    //     config.params = { ...config.params, user_id: userId };
    // }

    return config;
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth data
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("user-token");
            
            // Redirect to login page
            router.visit("/login");
        }
        return Promise.reject(error);
    }
);
