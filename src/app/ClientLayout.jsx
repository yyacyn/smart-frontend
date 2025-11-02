'use client'

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUser, useAuth } from "@clerk/nextjs";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { fetchCart } from "@/lib/features/cart/cartSlice";
import { fetchAddress } from "@/lib/features/address/addressSlice";
import { fetchUserRatings } from "@/lib/features/rating/ratingSlice";
import { uploadCart } from "@/lib/features/cart/cartSlice";

export default function ClientLayout({ children }) {
  const dispatch = useDispatch();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { cartItems } = useSelector(state => state.cart);

  useEffect(() => {
    console.log("Fetching products...");
    dispatch(fetchProducts({}));
  }, [dispatch]);

  // useEffect(() => {
  //   if (user) {
  //     dispatch(fetchCart({ getToken }));
  //     dispatch(fetchAddress({ getToken }));
  //     dispatch(fetchUserRatings({ getToken }));
  //   }
  // }, [user, getToken, dispatch]);

  // useEffect(() => {
  //   if (user) {
  //     dispatch(uploadCart({ getToken }));
  //   }
  // }, [cartItems, user, getToken, dispatch]);

  return <>{children}</>;
}