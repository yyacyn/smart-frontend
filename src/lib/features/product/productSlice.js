import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchProducts = createAsyncThunk('product/fetchProducts', async ({ storeId }, thunkAPI) => {
    try {
        const baseurl = process.env.NEXT_PUBLIC_API_URL
        console.log(baseurl)
        const { data } = await axios.get(`${baseurl}/api/products` + (storeId ? `?storeId=${storeId}` : ''))
        console.log('Fetched products:', data.products)
        return data.products
    } catch (error) {
        console.error('Error fetching products:', error)
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: [],
    },
    reducers: {
        setProduct: (state, action) => {
            state.list = action.payload
        },
        clearProduct: (state) => {
            state.list = []
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProducts.fulfilled, (state, action) => {
            state.list = action.payload
        })
    }
})

export const { setProduct, clearProduct } = productSlice.actions

export default productSlice.reducer