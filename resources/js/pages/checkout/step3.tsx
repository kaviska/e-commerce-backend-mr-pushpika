import React, { useEffect } from 'react';
import { Link } from '@inertiajs/react';
import Nav from '../../components/custom/main/Nav';
import Footer from '../../components/custom/main/Footer';
import StepperNav from '../../components/custom/StepperNav';
import { FiCheckCircle, FiShoppingBag, FiMail } from 'react-icons/fi';

const Step3 = () => {
    const [orderInfo, setOrderInfo] = React.useState<any>(null);

    useEffect(() => {
        // Load order info from localStorage
        const payment = localStorage.getItem('payment');
        const orderId = localStorage.getItem('orderId');

        if (payment && orderId) {
            setOrderInfo({
                payment: JSON.parse(payment),
                orderId
            });

            // Clear checkout data from localStorage
            localStorage.removeItem('payment');
            localStorage.removeItem('payment_intent');
            localStorage.removeItem('paymentMethod');
            localStorage.removeItem('address');
            localStorage.removeItem('orderId');
        }
    }, []);

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
                    <span className="text-gray-900 font-medium">Confirmation</span>
                </nav>

                {/* Stepper */}
                <StepperNav currentStep={3} />

                <div className="max-w-2xl mx-auto mt-12">
                    {/* Success Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                        {/* Success Icon */}
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                            <FiCheckCircle className="w-12 h-12 text-green-600" />
                        </div>

                        {/* Success Message */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Order Placed Successfully!
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Thank you for your purchase. Your order has been confirmed and is being processed.
                        </p>

                        {/* Order Details */}
                        {orderInfo && (
                            <div className="bg-gray-50 rounded-lg p-6 mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-gray-500">Order ID</span>
                                    <span className="text-lg font-bold text-gray-900">#{orderInfo.orderId}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">Total Amount</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        ${(orderInfo.payment?.order_details?.total ?? orderInfo.payment?.amount ?? 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Email Confirmation */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-8">
                            <p className="text-sm text-blue-800 flex items-center justify-center">
                                <FiMail className="mr-2" />
                                A confirmation email has been sent to your email address
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/profile"
                                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl"
                            >
                                <FiShoppingBag className="mr-2" />
                                View My Orders
                            </Link>
                            <Link
                                href="/products"
                                className="inline-flex items-center justify-center px-8 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-full transition-all border-2 border-gray-200"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">What's Next?</h3>
                        <div className="space-y-3 text-gray-600">
                            <div className="flex items-start">
                                <span className="text-green-600 font-bold mr-3">1.</span>
                                <p>You'll receive an email confirmation with your order details</p>
                            </div>
                            <div className="flex items-start">
                                <span className="text-green-600 font-bold mr-3">2.</span>
                                <p>We'll notify you when your order is being prepared for shipment</p>
                            </div>
                            <div className="flex items-start">
                                <span className="text-green-600 font-bold mr-3">3.</span>
                                <p>Track your order status anytime from your profile</p>
                            </div>
                            <div className="flex items-start">
                                <span className="text-green-600 font-bold mr-3">4.</span>
                                <p>You'll receive a tracking number once your order ships</p>
                            </div>
                        </div>
                    </div>

                    {/* Support */}
                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>
                            Need help? Contact us at{' '}
                            <a href="mailto:info.iymart@gmail.com" className="text-green-600 hover:text-green-700 font-semibold">
                                info.iymart@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Step3;
