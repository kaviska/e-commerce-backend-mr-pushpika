import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Nav from '../../components/custom/main/Nav';
import Footer from '../../components/custom/main/Footer';
import StepperNav from '../../components/custom/StepperNav';
import { FiCreditCard, FiDollarSign, FiBriefcase, FiHome, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'sonner';
import { updateOrderStatus, getStripeKey } from '../../hooks/api/cart';

const Step2 = () => {
    const [payment, setPayment] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [orderId, setOrderId] = useState<string>('');
    const [stripePromise, setStripePromise] = useState<any>(null);
    const [clientSecret, setClientSecret] = useState<string>('');

    useEffect(() => {
        // Load data from localStorage
        const paymentData = localStorage.getItem('payment');
        const method = localStorage.getItem('paymentMethod');
        const orderIdData = localStorage.getItem('orderId');
        const paymentIntent = localStorage.getItem('payment_intent');

        if (!paymentData || !method || !orderIdData) {
            toast.error('No order data found');
            router.visit('/cart');
            return;
        }

        setPayment(JSON.parse(paymentData));
        setPaymentMethod(method);
        setOrderId(orderIdData);
        setClientSecret(paymentIntent || '');

        // Load Stripe for card payments
        if (method === 'card' && paymentIntent) {
            loadStripeKey();
        }
    }, []);

    const loadStripeKey = async () => {
        try {
            const key = await getStripeKey();
            if (!key) {
                console.error('Stripe key is missing');
                toast.error('Payment configuration error');
                return;
            }
            const stripe = loadStripe(key);
            setStripePromise(stripe);
        } catch (error) {
            console.error('Error loading Stripe key:', error);
            toast.error('Failed to load payment processor');
        }
    };

    const handleNonCardPayment = async () => {
        try {
            await updateOrderStatus(orderId, 'completed', true, true);
            toast.success('Order confirmed!');
            router.visit('/checkout/step3');
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order status');
        }
    };

    const appearance = {
        theme: 'stripe' as const,
    };

    const options = {
        clientSecret,
        appearance,
    };

    if (!payment) {
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
                    <a href="/checkout/step1" className="hover:text-green-600">Checkout</a>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">Payment</span>
                </nav>

                {/* Page Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
                    <p className="text-gray-600">Choose your preferred payment method</p>
                </div>

                {/* Stepper */}
                <StepperNav currentStep={2} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Left Column: Payment Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            {paymentMethod === 'card' && clientSecret && stripePromise && (
                                <Elements stripe={stripePromise} options={options}>
                                    <StripePaymentForm orderId={orderId} />
                                </Elements>
                            )}

                            {paymentMethod === 'cash_on_delivery' && (
                                <div className="text-center py-8">
                                    <FiDollarSign className="w-20 h-20 mx-auto text-green-600 mb-4" />
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Cash on Delivery</h3>
                                    <div className="max-w-md mx-auto text-left bg-gray-50 rounded-lg p-6 mb-6">
                                        <h4 className="font-semibold text-gray-900 mb-3">Instructions:</h4>
                                        <ul className="space-y-2 text-gray-600">
                                            <li className="flex items-start">
                                                <span className="text-green-600 mr-2">•</span>
                                                Please have the exact amount ready when the delivery arrives
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-green-600 mr-2">•</span>
                                                You can pay in cash to the delivery person
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-green-600 mr-2">•</span>
                                                Make sure to check the items before making payment
                                            </li>
                                        </ul>
                                    </div>
                                    <button
                                        onClick={handleNonCardPayment}
                                        className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl"
                                    >
                                        Confirm Order
                                    </button>
                                </div>
                            )}

                            {paymentMethod === 'bank_transfer' && (
                                <div className="text-center py-8">
                                    <FiBriefcase className="w-20 h-20 mx-auto text-green-600 mb-4" />
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Bank Transfer</h3>
                                    <div className="max-w-md mx-auto text-left bg-gray-50 rounded-lg p-6 mb-6">
                                        <h4 className="font-semibold text-gray-900 mb-3">Bank Details:</h4>
                                        <div className="space-y-3 text-gray-700">
                                            <div>
                                                <span className="font-medium">Account Number:</span>
                                                <span className="ml-2">10680-49703751</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Account Name:</span>
                                                <span className="ml-2">バッデヴィターナ　イーシャン　ヤハジーワ</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Branch Code:</span>
                                                <span className="ml-2">068</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                            <p className="text-sm text-blue-800">
                                                <FiAlertCircle className="inline mr-1" />
                                                Please email your receipt to <strong>info.iymart@gmail.com</strong> with your order ID: <strong>{orderId}</strong>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleNonCardPayment}
                                        className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl"
                                    >
                                        I've Made the Transfer
                                    </button>
                                </div>
                            )}

                            {paymentMethod === 'home_delivery_2' && (
                                <div className="text-center py-8">
                                    <FiHome className="w-20 h-20 mx-auto text-green-600 mb-4" />
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Home Delivery Payment</h3>
                                    <div className="max-w-md mx-auto text-left bg-gray-50 rounded-lg p-6 mb-6">
                                        <h4 className="font-semibold text-gray-900 mb-3">Available Prefectures:</h4>
                                        <ul className="space-y-2 text-gray-600">
                                            {['CHIBA KEN', 'SAITAMA KEN', 'TOKYO TO', 'IBARAKI KEN', 'KANAGAWA KEN'].map(pref => (
                                                <li key={pref} className="flex items-center">
                                                    <span className="text-green-600 mr-2">✓</span>
                                                    {pref}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                            <p className="text-sm text-blue-800">
                                                <FiAlertCircle className="inline mr-1" />
                                                Our delivery person will collect payment when delivering your order
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleNonCardPayment}
                                        className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl"
                                    >
                                        Confirm Order
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                            <div className="space-y-3 mb-6">
                                {payment.order_details ? (
                                    <>
                                        <div className="flex justify-between text-gray-700">
                                            <span>Subtotal</span>
                                            <span className="font-semibold">${payment.order_details.subtotal?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-700">
                                            <span>Shipping Fee</span>
                                            <span className="font-semibold">${payment.order_details.shipping_cost?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-700">
                                            <span>Tax</span>
                                            <span className="font-semibold">${payment.order_details.tax?.toFixed(2)}</span>
                                        </div>
                                        {payment.order_details.total_discount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount</span>
                                                <span className="font-semibold">-${payment.order_details.total_discount?.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-sm text-gray-500 italic mb-2">
                                        Order breakdown not available
                                    </div>
                                )}
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-lg">
                                        <span className="font-bold text-gray-900">Total Amount</span>
                                        <span className="font-bold text-green-600">
                                            ${(payment.order_details?.total ?? payment.amount ?? 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// Stripe Payment Form Component
const StripePaymentForm: React.FC<{ orderId: string }> = ({ orderId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + '/checkout/step3',
                },
                redirect: 'if_required',
            });

            if (error) {
                toast.error(error.message || 'Payment failed');
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Update order status
                await updateOrderStatus(orderId, 'completed', true, true);
                toast.success('Payment successful!');
                router.visit('/checkout/step3');
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            toast.error(error.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FiCreditCard className="mr-2" />
                    Credit/Debit Card Payment
                </h3>
                <div className="p-4 border border-gray-200 rounded-lg">
                    <PaymentElement />
                </div>
            </div>
            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-full transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {processing ? 'Processing...' : 'Pay Now'}
            </button>
        </form>
    );
};

export default Step2;
