// api.js

const BASE_URL = 'https://backend-go-gin-production.up.railway.app';

// Example API endpoints

export const fetchProducts = async () => {
    const response = await fetch(`${BASE_URL}/products`);
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    return response.json();
};
