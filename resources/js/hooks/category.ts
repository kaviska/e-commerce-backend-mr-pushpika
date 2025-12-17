import { api } from "./api/api";

export interface Category {
    id: number;
    name: string;
    slug: string;
    image: string;
    products_count: number;
}

export interface CategoryResponse {
    status: string;
    message: string;
    data: Category[];
}

export const fetchCategories = async (withProductCount: boolean = true): Promise<CategoryResponse> => {
    try {
        const response = await api.get<CategoryResponse>('/categories', {
            params: {
                category_with_product_count: withProductCount
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};
