import { createContext, useContext, useState, useEffect } from 'react';
import { fetchProducts, fetchCategories, fetchStores } from '../api';

const GlobalDataContext = createContext();

export function GlobalDataProvider({ children }) {
  const [cachedProducts, setCachedProducts] = useState(null);
  const [cachedCategories, setCachedCategories] = useState(null);
  const [cachedOrders, setCachedOrders] = useState(null);
  const [cachedCart, setCachedCart] = useState(null);
  const [cachedWishlist, setCachedWishlist] = useState(null);
  const [cachedStores, setCachedStores] = useState(null);
  const [cachedAddresses, setCachedAddresses] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track loading state for each data type separately
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

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

  // Set loading to false once initial data is loaded
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
      loading,
      setCachedProducts,
      setCachedCategories,
      setCachedOrders,
      setCachedCart,
      setCachedWishlist,
      setCachedStores,
      setCachedAddresses
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