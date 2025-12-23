import { createContext, useContext, useState, useEffect } from 'react';
import { fetchProducts, fetchCategories, fetchStores, fetchWishlist, addToWishlist, removeFromWishlist } from '../api';
import { useAuth } from '@clerk/nextjs';

const GlobalDataContext = createContext();

export function GlobalDataProvider({ children }) {
  const [cachedProducts, setCachedProducts] = useState(null);
  const [cachedCategories, setCachedCategories] = useState(null);
  const [cachedOrders, setCachedOrders] = useState(null);
  const [cachedCart, setCachedCart] = useState(null);
  const [cachedWishlist, setCachedWishlist] = useState(null); // This will store the wishlist items as an object { productId: true, ... }
  const [cachedStores, setCachedStores] = useState(null);
  const [cachedAddresses, setCachedAddresses] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track loading state for each data type separately
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);

  // Initialize Clerk auth
  const { getToken, userId } = useAuth();

  // Load wishlist data when user is authenticated
  useEffect(() => {
    const loadWishlist = async () => {
      setWishlistLoaded(false); // Start with not loaded

      if (getToken && userId) {
        try {
          const token = await getToken();
          if (token) {
            const wishlistData = await fetchWishlist(token);
            // Convert the fetched wishlist to the expected format
            const wishlistObj = {};
            if (Array.isArray(wishlistData) && wishlistData.length > 0) {
              wishlistData.forEach(item => {
                wishlistObj[item.productId] = true;
              });
            }
            setCachedWishlist(wishlistObj);
          }
        } catch (error) {
          console.error('Error loading wishlist:', error);
          setCachedWishlist({});
        } finally {
          setWishlistLoaded(true); // Mark as loaded regardless of success/failure
        }
      } else {
        // If user is not authenticated, set an empty wishlist and mark as loaded
        setCachedWishlist({});
        setWishlistLoaded(true);
      }
    };
    loadWishlist();
  }, [getToken, userId]);

  // Function to add item to wishlist
  const addToWishlistContext = async (productId) => {
    if (!userId) {
      console.error('User not authenticated');
      return false;
    }

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available');
      }

      await addToWishlist(productId, token);

      // Update cached wishlist state
      setCachedWishlist(prev => ({
        ...prev,
        [productId]: true
      }));

      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };

  // Function to remove item from wishlist
  const removeFromWishlistContext = async (productId) => {
    if (!userId) {
      console.error('User not authenticated');
      return false;
    }

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available');
      }

      await removeFromWishlist(productId, token);

      // Update cached wishlist state
      setCachedWishlist(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });

      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  // Function to check if a product is in wishlist
  const isWishlisted = (productId) => {
    return cachedWishlist && cachedWishlist[productId] === true;
  };

  // Function to get wishlist count
  const getWishlistCount = () => {
    return cachedWishlist ? Object.keys(cachedWishlist).length : 0;
  };

  useEffect(() => {
    async function loadInitialData() {
      if (!cachedProducts) {
        try {
          const productsData = await fetchProducts();
          if (productsData && productsData.products) {
            setCachedProducts(productsData.products);
          } else {
            setCachedProducts([]); // Ensure products is at least an empty array
          }
        } catch (error) {
          console.error("Error fetching products:", error);
          setCachedProducts([]); // Ensure products is at least an empty array
        } finally {
          setProductsLoaded(true);
        }
      } else {
        setProductsLoaded(true);
      }

      if (!cachedCategories) {
        try {
          const categoriesResponse = await fetchCategories();
          if (categoriesResponse && categoriesResponse.success && Array.isArray(categoriesResponse.data)) {
            setCachedCategories(categoriesResponse.data);
          } else {
            setCachedCategories([]); // Ensure categories is at least an empty array
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
          setCachedCategories([]); // Ensure categories is at least an empty array
        } finally {
          setCategoriesLoaded(true);
        }
      } else {
        setCategoriesLoaded(true);
      }
    }

    loadInitialData();
  }, []);

  // Separate effect to handle the loading state independently
  useEffect(() => {
    if (productsLoaded && categoriesLoaded) {
      setLoading(false);
    }
  }, [productsLoaded, categoriesLoaded]);

  return (
    <GlobalDataContext.Provider value={{
      cachedProducts,
      cachedCategories,
      cachedOrders,
      cachedCart,
      cachedWishlist,
      cachedStores,
      cachedAddresses,
      loading, // This is for products/categories loading only
      setCachedProducts,
      setCachedCategories,
      setCachedOrders,
      setCachedCart,
      setCachedWishlist,
      setCachedStores,
      setCachedAddresses,
      addToWishlistContext,
      removeFromWishlistContext,
      isWishlisted,
      getWishlistCount,
      wishlistLoading: !wishlistLoaded // Add separate loading state for wishlist
    }}>
      {children}
    </GlobalDataContext.Provider>
  );
}

export function useGlobalData() {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error("useGlobalData must be used within a GlobalDataProvider");
  }
  return context;
}