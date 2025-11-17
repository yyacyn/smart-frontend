'use client';
// api.js
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://besukma.vercel.app';

// Helper function to get Clerk token on client side
const getClerkToken = async () => {
    if (typeof window !== 'undefined' && window.Clerk && window.Clerk.session) {
        try {
            const token = await window.Clerk.session.getToken();
            return token;
        } catch (error) {
            console.error('Error getting Clerk token:', error);
            return null;
        }
    }
    return null;
};

export const fetchProducts = async () => {
    const response = await axios.get(`${BASE_URL}/api/products`);
    return response.data;
};

export const fetchStores = async (token = null) => {
    const authToken = token || (await getClerkToken());
    const headers = {};
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    try {
        const response = await axios.get(
            `${BASE_URL}/api/admin/stores`,
            { headers }
        );
        return response.data;
    } catch (error) {
        // Check if it's an authentication error
        if (error.response?.status === 401) {
            console.warn('Authentication failed when fetching stores. This endpoint may require admin privileges.');
            // Return an empty result or handle the error as appropriate for your use case
            return { stores: [] };
        }
        // Re-throw other errors
        throw error;
    }
};

export const createStore = async (formData, token = null) => {
    const authToken = token || await getClerkToken();
    const headers = {
        "Content-Type": "multipart/form-data"
    };
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.post(
        `${BASE_URL}/api/store/create`,
        formData,
        { headers }
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
    const headers = {};
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.get(`${BASE_URL}/api/cart`, { headers });
    return response.data;
};

// Add to cart (POST)
export const addToCart = async (cartData, token = null) => {
    const authToken = token || await getClerkToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.post(
        `${BASE_URL}/api/cart`,
        cartData,
        { headers }
    );
    return response.data;
};

// Place an order (POST)
export const orderPost = async (orderData, token = null) => {
    const authToken = token || await getClerkToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.post(
        `${BASE_URL}/api/orders`,
        orderData,
        { headers }
    );
    return response.data;
};

export const fetchOrders = async (token = null) => {
    const authToken = token || await getClerkToken();
    const headers = {};
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.get(`${BASE_URL}/api/orders`, { headers });
    return response.data;
};

// Fetch specific order by ID (GET)
export const fetchOrderById = async (orderId, token = null) => {
    const authToken = token || await getClerkToken();
    const headers = {};
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.get(`${BASE_URL}/api/orders/${orderId}`, { headers });
    return response.data;
};

// Fetch user addresses (GET)
export const fetchAddresses = async (token = null) => {
    const authToken = token || await getClerkToken();
    const headers = {};
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.get(`${BASE_URL}/api/address`, { headers });
    return response.data;
};

// Add new address (POST)
export const addAddress = async (addressData, token = null) => {
    const authToken = token || await getClerkToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.post(
        `${BASE_URL}/api/address`,
        { address: addressData }, // Send address data wrapped in an address object
        { headers }
    );
    return response.data;
};

// Submit a report (POST)
export const submitReport = async (reportData, token = null) => {
    const authToken = token || await getClerkToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.post(
        `${BASE_URL}/api/reports`,
        reportData,
        { headers }
    );
    return response.data;
};


