'use client';
// api.js
import axios from "axios";


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://besukma.vercel.app';

// Helper function to get Clerk token on client side
const getClerkToken = async () => {
    if (typeof window !== 'undefined') {
        // Client side - use window.Clerk
        if (window.Clerk?.session) {
            return await window.Clerk.session.getToken();
        }
    }
    return null;
};

export const fetchProducts = async () => {
    const response = await axios.get(`${BASE_URL}/api/products`);
    return response.data;
};

export const fetchStores = async () => {
    const authToken = await getClerkToken();
    const response = await axios.get(
        `${BASE_URL}/api/admin/stores`,
        {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        }
    );
    return response.data;
};

export const createStore = async (formData, token = null) => {
    const authToken = token || await getClerkToken();
    const response = await axios.post(
        `${BASE_URL}/api/store/create`,
        formData,
        { headers: { 
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            "Content-Type": "multipart/form-data"
        }}
    );
    return response.data;
};

export const fetchCategories = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/categories`);
        return response.data;
    } catch {
        return { categories: [] };
    }
};

// Fetch cart (GET)
export const fetchCart = async (token = null) => {
    const authToken = token || await getClerkToken();
    const response = await axios.get(`${BASE_URL}/api/cart`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    });
    return response.data;
};

// Add to cart (POST)
export const addToCart = async (cartData, token = null) => {
    const authToken = token || await getClerkToken();
    const response = await axios.post(
        `${BASE_URL}/api/cart`,
        cartData,
        {
            headers: {
                ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
};

// Place an order (POST)
export const orderPost = async (orderData, token = null) => {
    const authToken = token || await getClerkToken();
    const response = await axios.post(
        `${BASE_URL}/api/orders`,
        orderData,
        {
            headers: {
                ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
};

export const fetchOrders = async (token = null) => {
    const authToken = token || await getClerkToken();
    const response = await axios.get(`${BASE_URL}/api/orders`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    });
    return response.data;
};

// Fetch specific order by ID (GET)
export const fetchOrderById = async (orderId, token = null) => {
    const authToken = token || await getClerkToken();
    const response = await axios.get(`${BASE_URL}/api/orders/${orderId}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    });
    return response.data;
};

// Fetch user addresses (GET)
export const fetchAddresses = async (token = null) => {
    const authToken = token || await getClerkToken();
    const response = await axios.get(`${BASE_URL}/api/address`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    });
    return response.data;
};

// Add new address (POST)
export const addAddress = async (addressData, token = null) => {
    const authToken = token || await getClerkToken();
    const response = await axios.post(
        `${BASE_URL}/api/address`,
        addressData,
        {
            headers: {
                ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
};