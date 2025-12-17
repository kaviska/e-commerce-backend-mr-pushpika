import { api } from "./api";

export interface Review {
    id: number;
    user_id: number;
    product_id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        avatar?: string;
    };
}

export interface ReviewResponse {
    status: string;
    message: string;
    data: Review[];
}

export const getReviews = async (productId: number): Promise<Review[]> => {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data.data;
};

export const submitReview = async (data: { product_id: number; rating: number; comment: string }) => {
    const response = await api.post('/reviews', data);
    return response.data;
};
