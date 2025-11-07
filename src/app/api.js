
// api.js
import axios from "axios";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://besukma.vercel.app';

export const fetchProducts = async () => {
    const response = await axios.get(`${BASE_URL}/api/products`);
    return response.data;
};
