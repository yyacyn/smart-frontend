// api.js
import axios from "axios";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://besukma.vercel.app';

export const fetchProducts = async () => {
    const response = await axios.get(`${BASE_URL}/api/products`);
    return response.data;
};

export const fetchStores = async () => {
    const response = await axios.get(`${BASE_URL}/api/admin/stores`);
    return response.data;
};

export const createStore = async (formData, token) => {
    const response = await axios.post(
        `${BASE_URL}/api/store/create`,
        formData,
        { headers: { 
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
export const fetchCart = async (token) => {
    const response = await axios.get(`${BASE_URL}/api/cart`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
};

// Add to cart (POST)
export const addToCart = async (cartData, token) => {
    const response = await axios.post(
        `${BASE_URL}/api/cart`,
        cartData,
        {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
};