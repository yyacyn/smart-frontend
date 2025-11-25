'use client';
// api.js
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://besukma.vercel.app';
// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
        // Fetch products to get the store information
        const productsResponse = await axios.get(`${BASE_URL}/api/products`, { headers });
        const products = Array.isArray(productsResponse.data.products) ? productsResponse.data.products : productsResponse.data;

        // Extract unique stores from products
        const storeMap = new Map();
        if (Array.isArray(products)) {
            products.forEach(product => {
                if (product.store) {
                    // Only add store if we haven't seen it before
                    if (!storeMap.has(product.store.id)) {
                        storeMap.set(product.store.id, product.store);
                    }
                }
            });
        }

        const stores = Array.from(storeMap.values());
        return { stores }; // Return in the same format as the original endpoint
    } catch (error) {
        // Check if it's an authentication error or network error
        console.warn('Could not fetch stores from products:', error.message);
        // Return an empty result or handle the error as appropriate for your use case
        return { stores: [] };
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
export const orderPost = async (orderData, token = null, retries = 3) => {
    const authToken = token || await getClerkToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    // Add timeout and retry logic for connection issues
    const axiosConfig = {
        headers,
        timeout: 30000, // 30 seconds timeout
        retry: retries,
        retryDelay: 1000 // 1 second delay between retries
    };

    try {
        const response = await axios.post(
            `${BASE_URL}/api/orders`,
            orderData,
            axiosConfig
        );
        return response.data;
    } catch (error) {
        console.error('orderPost error:', error);

        // If it's a connection error and we have retries left, try again
        if (retries > 0 && (
            error.code === 'ECONNRESET' ||
            error.code === 'NETWORK_ERROR' ||
            error.message?.includes('Connection terminated unexpectedly') ||
            error.message?.includes('Network Error')
        )) {
            console.log(`Retrying order post, ${retries} attempts left...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            return orderPost(orderData, token, retries - 1);
        }

        throw error;
    }
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
    let headers = {};
    let data;

    // Check if reportData contains files (FileList, File, or Blob objects)
    const hasFiles = reportData.attachments &&
        (reportData.attachments instanceof FileList ||
         reportData.attachments instanceof File ||
         reportData.attachments instanceof Blob ||
         (Array.isArray(reportData.attachments) &&
          reportData.attachments.some(file => file instanceof File || file instanceof Blob)));

    if (hasFiles) {
        // Use multipart/form-data for file uploads
        const formData = new FormData();

        // Add all report fields to formData
        Object.keys(reportData).forEach(key => {
            if (key === 'attachments') {
                // Handle attachments array or single file
                if (Array.isArray(reportData[key])) {
                    reportData[key].forEach(file => formData.append('attachments', file));
                } else if (reportData[key] instanceof FileList) {
                    Array.from(reportData[key]).forEach(file => formData.append('attachments', file));
                } else if (reportData[key] instanceof File) {
                    formData.append('attachments', reportData[key]);
                } else {
                    // For backward compatibility with URLs or other attachment formats
                    formData.append(key, reportData[key]);
                }
            } else {
                formData.append(key, reportData[key]);
            }
        });

        // Add token to headers if available
        if (authToken) {
            headers.Authorization = `Bearer ${authToken}`;
        }

        data = formData;
    } else {
        // Use JSON for data without files
        headers = {
            'Content-Type': 'application/json'
        };
        if (authToken) {
            headers.Authorization = `Bearer ${authToken}`;
        }

        data = reportData;
    }

    const response = await axios.post(
        `${BASE_URL}/api/reports`,
        data,
        { headers }
    );
    return response.data;
};

// Wishlist functions
// Fetch user's wishlist (GET)
export const fetchWishlist = async (token = null) => {
    const authToken = token || await getClerkToken();
    const headers = {};
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.get(`${BASE_URL}/api/wishlist`, { headers });
    return response.data;
};

// Add to wishlist (POST)
export const addToWishlist = async (productId, token = null) => {
    const authToken = token || await getClerkToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.post(
        `${BASE_URL}/api/wishlist`,
        { productId },
        { headers }
    );
    return response.data;
};

// Remove from wishlist (DELETE)
export const removeFromWishlist = async (productId, token = null) => {
    const authToken = token || await getClerkToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.delete(
        `${BASE_URL}/api/wishlist`,
        {
            headers,
            data: { productId }
        }
    );
    return response.data;
};

// Fetch users (GET)
export const fetchUsers = async (token = null) => {
    const authToken = token || (await getClerkToken());
    const headers = {};
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    try {
        const response = await axios.get(`${BASE_URL}/api/users`, { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// Fetch users and their associated stores (GET)
export const fetchUsersWithStores = async (token = null) => {
    const authToken = token || (await getClerkToken());
    const headers = {};
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    try {
        // First, fetch all users
        const usersResponse = await axios.get(`${BASE_URL}/api/users`, { headers });
        const users = usersResponse.data.users || usersResponse.data;

        // Fetch all products to get the store information
        let stores = [];
        try {
            const productsResponse = await axios.get(`${BASE_URL}/api/products`, { headers });
            const products = Array.isArray(productsResponse.data.products) ? productsResponse.data.products : productsResponse.data;

            // Extract unique stores from products
            const storeMap = new Map();
            if (Array.isArray(products)) {
                products.forEach(product => {
                    if (product.store) {
                        // Only add store if we haven't seen it before
                        if (!storeMap.has(product.store.id)) {
                            storeMap.set(product.store.id, product.store);
                        }
                    }
                });
            }

            stores = Array.from(storeMap.values());
        } catch (productsError) {
            console.warn('Could not fetch stores from products:', productsError.message);
            // If fetching products/stores fails, continue with just users
        }

        // Create a map of user ID to store for quick lookup
        const userStoreMap = {};
        if (Array.isArray(stores)) {
            stores.forEach(store => {
                if (store.userId) {
                    userStoreMap[store.userId] = store;
                }
            });
        }

        // Combine user data with store data if available
        const usersWithStores = users.map(user => {
            const store = userStoreMap[user.id];
            if (store) {
                // Use store information instead of user information
                return {
                    ...user,
                    name: store.name,
                    image: store.logo,
                    storeId: store.id,
                    hasStore: true
                };
            } else {
                // Use original user information
                return {
                    ...user,
                    hasStore: false
                };
            }
        });

        return usersWithStores;
    } catch (error) {
        console.error('Error fetching users with stores:', error);
        throw error;
    }
};

// Submit a rating (POST)
export const postRating = async (ratingData, token = null) => {
    const authToken = token || await getClerkToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.post(
        `${BASE_URL}/api/rating`,
        ratingData,
        { headers }
    );
    return response.data;
};

// Fetch ratings for a specific product (GET)
export const fetchProductRatings = async (productId, token = null) => {
    const authToken = token || await getClerkToken();
    const headers = {};
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.get(
        `${BASE_URL}/api/rating?productId=${productId}`,
        { headers }
    );
    return response.data;
};

// Fetch specific store by ID (GET) - fetch all stores and filter by ID
export const fetchStoreById = async (storeId, token = null) => {
    const authToken = token || await getClerkToken();
    const headers = {};
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    try {
        // Fetch all stores using the existing fetchStores function
        const response = await fetchStores(token);
        const stores = response.stores || response;

        // Find the store with the matching ID
        const store = stores.find(s => s.id === storeId);

        if (store) {
            return { store }; // Return in the same format as the original function
        } else {
            throw new Error(`Store with ID ${storeId} not found`);
        }
    } catch (error) {
        console.error('Error fetching store by ID:', error);
        throw error;
    }
};


