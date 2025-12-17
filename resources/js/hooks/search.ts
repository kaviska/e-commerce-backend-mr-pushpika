import { api } from './api/api';

export const searchProducts = async (query: string) => {
    const response = await api.get(`/products?search=${query}`);
    return response.data;
};
