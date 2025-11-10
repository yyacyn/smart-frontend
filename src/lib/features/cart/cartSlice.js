import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

let debouceTimer = null
const baseurl = process.env.NEXT_PUBLIC_API_URL
export const uploadCart = createAsyncThunk('cart/uploadCart', async ( { getToken }, thunkAPI) => {
    try {
        clearTimeout(debouceTimer)
        debouceTimer = setTimeout(async () => {
            const { cartItems } = thunkAPI.getState().cart
            const token = await getToken()
            await axios.post(`${baseurl}/api/cart`, { cart: cartItems }, { headers: { Authorization: `Bearer ${token}` } })
        }, 1000);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const fetchCart = createAsyncThunk('cart/fetchCart', async ( { getToken }, thunkAPI) => {
    try {
        const token = await getToken()
        const { data } = await axios.get(`${baseurl}/api/cart`, { headers: { Authorization: `Bearer ${token}` } })
        return data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},
        isInitialized: false, // Track if cart has been loaded from backend
    },
    reducers: {
        // Increase quantity by 1 (alias of addToCart)
        increaseQuantity: (state, action) => {
            const { productId } = action.payload
            state.cartItems[productId] = (state.cartItems[productId] || 0) + 1
            state.total += 1
        },
        // Decrease quantity by 1, remove item when reaches 0
        decreaseQuantity: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]--
                state.total = Math.max(0, state.total - 1)
                if (state.cartItems[productId] <= 0) {
                    delete state.cartItems[productId]
                }
            }
        },
        addToCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]++    
            } else {
                state.cartItems[productId] = 1
            }
            state.total += 1
        },
        removeFromCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]--
                if (state.cartItems[productId] === 0) {
                    delete state.cartItems[productId]
                }
            }
            state.total -= 1
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload
            state.total -= state.cartItems[productId] ? state.cartItems[productId] : 0
            delete state.cartItems[productId]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCart.fulfilled, (state, action) => {
            state.cartItems = action.payload.cart
            state.total = Object.values(action.payload.cart).reduce((acc, item) => acc + item, 0)
            state.isInitialized = true // Mark as initialized after successful fetch
        })
    }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart, increaseQuantity, decreaseQuantity } = cartSlice.actions

export default cartSlice.reducer
