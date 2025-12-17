import { api } from './api';

export interface OrderItem {
    id: number;
    order_id: number;
    stock_id: number;
    product_id: number;
    product_name: string;
    category_id: number;
    category: string;
    brand_id: number;
    brand: string;
    slug: string;
    unit_price: number;
    unit_discount: number;
    unit_quantity: number;
    line_total: number;
}

export interface Order {
    id: number;
    order_number: string;
    user_id: number;
    user_name: string;
    user_email: string;
    user_phone: string;
    user_type: string;
    user_address_id: number;
    user_address_line1: string;
    user_address_line2: string;
    user_country: string;
    user_region: string;
    user_region_id: number;
    user_prefecture: string;
    user_prefecture_id: number;
    user_city: string;
    user_postal_code: string;
    subtotal: number;
    total_discount: number;
    tax: number;
    shipping_cost: number;
    total: number;
    payment_method: string;
    payment_id: string;
    payment_status: string;
    paid_amount: number;
    currency: string;
    payment_gateway: string;
    order_status: string;
    shipping_status: string;
    type: string;
    created_at: string;
    updated_at: string;
    order_items: OrderItem[];
}

export interface OrdersResponse {
    status: string;
    message: string;
    data: Order[];
}

// Get orders for the authenticated user
export const getUserOrders = async (): Promise<Order[]> => {
    const response = await api.get('/user/orders');
    return response.data.data;
};

// Get order details by order ID
export const getOrderById = async (orderId: number): Promise<Order> => {
    const response = await api.get('/admin/orders', {
        params: { order_id: orderId }
    });
    return response.data.data;
};
