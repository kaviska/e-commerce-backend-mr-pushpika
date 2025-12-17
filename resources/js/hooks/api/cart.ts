import { api } from './api';

export interface CartItem {
    id: number;
    user_id: number;
    stock_id: number;
    quantity: number;
    stock: {
        id: number;
        product_id: number;
        quantity: number;
        web_price: number;
        web_discount: number;
        pos_price: number;
        pos_discount: number;
        product: {
            id: number;
            name: string;
            slug: string;
            primary_image: string;
            category: {
                id: number;
                name: string;
            };
            brand: {
                id: number;
                name: string;
            };
        };
        variation_stocks: Array<{
            id: number;
            stock_id: number;
            variation_option_id: number;
            image: string | null;
            variation_option: {
                id: number;
                name: string;
                variation_id: number;
                variation: {
                    id: number;
                    name: string;
                };
            };
        }>;
    };
}

export interface CartSummary {
    cart_items: CartItem[];
    total_amount: number;
    total_discount: number;
    total_tax: number;
    grand_total: number;
}

// Get cart items
export const getCart = async (): Promise<CartSummary> => {
    const response = await api.get('/carts');
    return response.data.data;
};

// Get guest cart items
export const getGuestCart = async (guestCart: Array<{ stock_id: number; quantity: number }>): Promise<CartSummary> => {
    const response = await api.get('/guest_carts', {
        params: {
            guest_cart: guestCart,
        }
    });
    return response.data.data;
};

// Add to cart
export const addToCart = async (stockId: number, quantity: number = 1): Promise<any> => {
    const response = await api.post('/carts', {
        action: 'add',
        stock_id: stockId,
        quantity: quantity,
    });
    return response.data;
};

// Update cart item quantity
export const updateCartQuantity = async (stockId: number, quantity: number): Promise<any> => {
    const response = await api.post('/carts', {
        action: 'replace',
        stock_id: stockId,
        quantity: quantity,
    });
    return response.data;
};

// Remove from cart
export const removeFromCart = async (stockId: number): Promise<any> => {
    const response = await api.post('/carts', {
        action: 'clear',
        stock_id: stockId,
    });
    return response.data;
};

// Clear entire cart
export const clearCart = async (): Promise<any> => {
    const response = await api.post('/carts', {
        action: 'clear_all',
    });
    return response.data;
};

// Checkout-related types
export interface Region {
    id: number;
    name: string;
}

export interface Prefecture {
    id: number;
    prefecture_name: string;
    shipping_fee: number;
    region_id: number;
}

export interface PostalCode {
    id: number;
    postal_code: string;
    prefecture_name_en: string;
    city_name_en: string;
}

export interface PlaceOrderData {
    userData: {
        city: string;
        prefecture_id: string;
        region_id: string;
        postal_code: string;
        address_line_1: string;
        address_line_2: string;
        name: string;
        email: string;
        mobile: string;
        device_name: string;
        user_id?: string | null;
    };
    paymentData: {
        payment_gateway: string;
        due_date: null;
        method: string;
    };
    cart_items: Array<{
        stock_id: number;
        quantity: number;
    }>;
}

export interface PlaceOrderResponse {
    status: string;
    message: string;
    data: {
        payment: {
            status: boolean;
            message: string;
            payment_id: string;
            paymentIntent: string;
            ephemeralKey: string;
            customer: string;
            amount: number;
            order_id: number;
            order_details: any;
        };
        user: {
            id: number;
            name: string;
            email: string;
            mobile: string;
            user_type: string;
            token: string | null;
        };
        address: {
            id: number;
            region_id: string;
            prefecture_id: string;
            city: string;
            postal_code: string;
            address_line_1: string;
            address_line_2: string;
            country: string;
            user_id: number;
            region: {
                id: number;
                name: string;
            };
            prefecture: {
                id: number;
                prefecture_name: string;
                shipping_fee: number;
                region_id: number;
            };
        };
    };
}

// Get regions
export const getRegions = async (): Promise<Region[]> => {
    const response = await api.get('/regions');
    return response.data.data;
};

// Get prefectures by region
export const getPrefecturesByRegion = async (regionId: string | number): Promise<Prefecture[]> => {
    const response = await api.get('/prefectures', {
        params: { region_id: regionId }
    });
    return response.data.data;
};

// Get postal codes by prefecture
export const getPostalCodesByPrefecture = async (prefectureName: string): Promise<PostalCode[]> => {
    const response = await api.get(`/postal-data-by?prefecture_name=${encodeURIComponent(prefectureName)}`);
    return response.data.data;
};

// Place order
export const placeOrder = async (orderData: PlaceOrderData): Promise<PlaceOrderResponse> => {
    const response = await api.post('/place-order', orderData);
    return response.data;
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: string, isCreateInvoice: boolean = true, isSendInvoice: boolean = true): Promise<any> => {
    const response = await api.put('/update/order-status', {
        order_id: orderId,
        status,
        isCreateInvoice,
        isSendInvoice
    });
    return response.data;
};

// Get Stripe publishable key
export const getStripeKey = async (): Promise<string> => {
    const response = await api.get('/stripe-key');
    return response.data.stripe_publishable_key;
};
