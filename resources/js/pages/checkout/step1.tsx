import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Nav from '../../components/custom/main/Nav';
import Footer from '../../components/custom/main/Footer';
import StepperNav from '../../components/custom/StepperNav';
import CheckoutForm from '../../components/custom/CheckoutForm';
import { FiShoppingCart, FiLock } from 'react-icons/fi';
import { toast } from 'sonner';
import { getCart, placeOrder, CartItem } from '../../hooks/api/cart';

const Step1 = () => {
    const [loading, setLoading] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartSummary, setCartSummary] = useState<{
        total_amount: number;
        total_discount: number;
        total_tax: number;
        grand_total: number;
    }>({
        total_amount: 0,
        total_discount: 0,
        total_tax: 0,
        grand_total: 0
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        
        if (!token) {
            toast.error('Please login to continue checkout');
            setTimeout(() => router.visit('/login'), 1500);
            return;
        }

        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const cartData = await getCart();
            if (!cartData.cart_items || cartData.cart_items.length === 0) {
                toast.error('Your cart is empty');
                setTimeout(() => router.visit('/products'), 1500);
                return;
            }
            setCartItems(cartData.cart_items);
            setCartSummary({
                total_amount: cartData.total_amount || 0,
                total_discount: cartData.total_discount || 0,
                total_tax: cartData.total_tax || 0,
                grand_total: cartData.grand_total || 0
            });
        } catch (error) {
            console.error('Error loading cart:', error);
            toast.error('Failed to load cart');
        }
    };

    const handleFormSubmit = async (formData: any) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            const user = userData ? JSON.parse(userData) : null;

            const orderData = {
                userData: {
                    city: formData.city,
                    prefecture_id: formData.prefecture_id,
                    region_id: formData.region_id,
                    postal_code: formData.postal_code,
                    address_line_1: formData.address_line_1,
                    address_line_2: formData.address_line_2,
                    name: formData.name,
                    email: formData.email,
                    mobile: formData.mobile,
                    device_name: 'web',
                    user_id: user?.id || null
                },
                paymentData: {
                    payment_gateway: formData.payment_method === 'card' ? 'stripe' : 'other',
                    due_date: null,
                    method: formData.payment_method
                },
                cart_items: cartItems.map(item => ({
                    stock_id: item.stock_id,
                    quantity: item.quantity
                }))
            };

            const response = await placeOrder(orderData);

            if (response.status === 'success') {
                // Store data in localStorage
                localStorage.setItem('payment', JSON.stringify(response.data.payment));
                localStorage.setItem('payment_intent', response.data.payment.paymentIntent);
                localStorage.setItem('paymentMethod', formData.payment_method);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('address', JSON.stringify(response.data.address));
                localStorage.setItem('orderId', response.data.payment.order_id.toString());

                // Update token if provided
                if (response.data.user.token) {
                    localStorage.setItem('token', response.data.user.token);
                }

                toast.success('Order placed successfully!');
                router.visit('/checkout/step2');
            }
        } catch (error: any) {
            console.error('Error placing order:', error);
            const errorMessage = error.response?.data?.message || 'Failed to place order';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <Nav />
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Nav />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <nav className="flex text-sm text-gray-500 mb-6">
                    <a href="/" className="hover:text-green-600">Home</a>
                    <span className="mx-2">/</span>
                    <a href="/cart" className="hover:text-green-600">Cart</a>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">Checkout</span>
                </nav>

                {/* Page Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                        <FiLock className="mr-3 text-green-600" />
                        Secure Checkout
                    </h1>
                    <p className="text-gray-600">Complete your purchase safely and securely</p>
                </div>

                {/* Stepper */}
                <StepperNav currentStep={1} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2">
                        <CheckoutForm onSubmit={handleFormSubmit} loading={loading} />
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <FiShoppingCart className="mr-2" />
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-6">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <img
                                            src={item.stock?.product?.primary_image || '/placeholder.png'}
                                            alt={item.stock?.product?.name}
                                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                                                {item.stock?.product?.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            ${(((item.stock?.web_price || 0) - ((item.stock?.web_price || 0) * (item.stock?.web_discount || 0) / 100)) * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-3">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">${(cartSummary.total_amount || 0).toFixed(2)}</span>
                                </div>
                                {(cartSummary.total_discount || 0) > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span className="font-semibold">-${(cartSummary.total_discount || 0).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-700">
                                    <span>Tax (8%)</span>
                                    <span className="font-semibold">${(cartSummary.total_tax || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Shipping</span>
                                    <span className="font-semibold">Calculated at next step</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-lg">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="font-bold text-green-600">${(cartSummary.grand_total || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-800 flex items-center">
                                    <FiLock className="mr-2" />
                                    Your payment information is secure and encrypted
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Step1;
