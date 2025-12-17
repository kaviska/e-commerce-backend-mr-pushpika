import axios from 'axios';

export const getProducts = async (search: string = '') => {
    const response = await axios.get('/api/products', {
        params: {
            search: search,
            limit: 20
        }
    });
    return response.data;
};

export const getVariationOptions = async (grouped: boolean = false) => {
    const params: any = {};
    if (grouped) {
        params.grouped = 1; // Send as 1/0 for boolean in Laravel
    }
    const response = await axios.get('/api/variation-options', { params });
    return response.data;
};

export const getVariations = async () => {
    const response = await axios.get('/api/variations');
    return response.data;
};

export const getBrands = async () => {
    const response = await axios.get('/api/brands');
    return response.data;
};

export const getCategories = async () => {
    const response = await axios.get('/api/categories');
    return response.data;
};

export const createBrand = async (data: FormData) => {
    const response = await axios.post('/api/brands', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const createProduct = async (data: any) => {
    const response = await axios.post('/api/products', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const addStock = async (data: any) => {
    const response = await axios.post('/api/stocks', data);
    return response.data;
};

export const createCategory = async (data: FormData) => {
    const response = await axios.post('/api/categories', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};
