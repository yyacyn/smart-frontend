import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

let debounceTimer = null
const baseurl = process.env.NEXT_PUBLIC_API_URL

export const uploadWishlist = createAsyncThunk('wishlist/uploadWishlist', async ( { token }, thunkAPI) => {
    try {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(async () => {
            const { wishlistItems } = thunkAPI.getState().wishlist
            // Convert wishlist items to the expected format (only product IDs)
            const wishlistProductIds = Object.keys(wishlistItems).map(id => ({ productId: parseInt(id) }))
            await axios.post(`${baseurl}/api/wishlist`, { wishlist: wishlistProductIds }, { headers: { Authorization: `Bearer ${token}` } })
        }, 1000);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async ( { token }, thunkAPI) => {
    try {
        const { data } = await axios.get(`${baseurl}/api/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
        return data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const addToWishlistAPI = createAsyncThunk('wishlist/addToWishlistAPI', async ( { productId, token }, thunkAPI) => {
    try {
        const { data } = await axios.post(`${baseurl}/api/wishlist`, { productId }, { headers: { Authorization: `Bearer ${token}` } })
        return data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const removeFromWishlistAPI = createAsyncThunk('wishlist/removeFromWishlistAPI', async ( { productId, token }, thunkAPI) => {
    try {
        await axios.delete(`${baseurl}/api/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { productId }
        })
        return productId
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        total: 0,
        wishlistItems: {},
        isInitialized: false, // Track if wishlist has been loaded from backend
    },
    reducers: {
        addToWishlist: (state, action) => {
            const { productId } = action.payload
            if (!state.wishlistItems[productId]) {
                state.wishlistItems[productId] = true
                state.total += 1
            }
        },
        removeFromWishlist: (state, action) => {
            const { productId } = action.payload
            if (state.wishlistItems[productId]) {
                delete state.wishlistItems[productId]
                state.total = Math.max(0, state.total - 1)
            }
        },
        clearWishlist: (state) => {
            state.wishlistItems = {}
            state.total = 0
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                // Action.payload is an array of wishlist items
                const wishlistObj = {}
                action.payload.forEach(item => {
                    wishlistObj[item.productId] = true
                })
                state.wishlistItems = wishlistObj
                state.total = action.payload.length
                state.isInitialized = true // Mark as initialized after successful fetch
            })
            .addCase(addToWishlistAPI.fulfilled, (state, action) => {
                // When successfully added to backend, update the local state
                const productId = action.payload.productId || action.meta.arg.productId
                if (!state.wishlistItems[productId]) {
                    state.wishlistItems[productId] = true
                    state.total += 1
                }
            })
            .addCase(removeFromWishlistAPI.fulfilled, (state, action) => {
                // When successfully removed from backend, update the local state
                const productId = action.payload
                if (state.wishlistItems[productId]) {
                    delete state.wishlistItems[productId]
                    state.total = Math.max(0, state.total - 1)
                }
            })
    }
})

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions

export default wishlistSlice.reducer