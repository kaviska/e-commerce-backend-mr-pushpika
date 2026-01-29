import React, { useState, useEffect } from 'react';
import Nav from '../components/custom/main/Nav';
import Footer from '../components/custom/main/Footer';
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock, FiMapPin, FiUser, FiPhone, FiMail, FiCalendar, FiDollarSign, FiCreditCard, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'sonner';
import { getOrderById, Order } from '../hooks/api/order';
import { Link, router } from '@inertiajs/react';

interface OrderDetailsProps {
    orderId: number;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId }) => {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            const orderData = await getOrderById(orderId);
            setOrder(orderData);
        } catch (error) {
            console.error('Error loading order details:', error);
            toast.error('Failed to load order details');
            setTimeout(() => router.visit('/orders'), 2000);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const statusColors: { [key: string]: string } = {
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'processing': 'bg-blue-100 text-blue-800 border-blue-200',
            'shipped': 'bg-purple-100 text-purple-800 border-purple-200',
            'delivered': 'bg-green-100 text-green-800 border-green-200',
            'cancelled': 'bg-red-100 text-red-800 border-red-200',
            'completed': 'bg-green-100 text-green-800 border-green-200',
        };
        return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status: string) => {
        const statusIcons: { [key: string]: React.ReactNode } = {
            'pending': <FiClock className="w-5 h-5" />,
            'processing': <FiPackage className="w-5 h-5" />,
            'shipped': <FiTruck className="w-5 h-5" />,
            'delivered': <FiCheckCircle className="w-5 h-5" />,
            'cancelled': <FiXCircle className="w-5 h-5" />,
            'completed': <FiCheckCircle className="w-5 h-5" />,
        };
        return statusIcons[status.toLowerCase()] || <FiPackage className="w-5 h-5" />;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Nav />
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Nav />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <FiXCircle className="w-20 h-20 mx-auto text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                        <Link href="/orders" className="text-green-600 hover:text-green-700 font-semibold">
                            Return to Orders
                        </Link>
                    </div>
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
                    <Link href="/" className="hover:text-green-600">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/orders" className="hover:text-green-600">My Orders</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">Order #{order.order_number}</span>
                </nav>

                {/* Back Button */}
                <Link
                    href="/orders"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 font-medium"
                >
                    <FiArrowLeft className="w-5 h-5" />
                    Back to Orders
                </Link>

                {/* Order Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-6 md:p-8 mb-6 text-white">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Order #{order.order_number}</h1>
                            <div className="flex items-center gap-2 text-green-100">
                                <FiCalendar className="w-4 h-4" />
                                <span>Placed on {formatDate(order.created_at)}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-green-100 text-sm mb-1">Total Amount</div>
                            <div className="text-4xl font-bold">LKR {order.total.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Status */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status</h2>
                            <div className="flex items-center gap-4">
                                <div className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 ${getStatusColor(order.order_status)}`}>
                                    {getStatusIcon(order.order_status)}
                                    <span className="font-bold text-lg uppercase">{order.order_status}</span>
                                </div>
                                <div className={`px-4 py-2 rounded-lg border ${
                                    order.payment_status === 'paid' 
                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                        : 'bg-orange-50 text-orange-700 border-orange-200'
                                }`}>
                                    <span className="font-semibold">Payment: {order.payment_status.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <FiPackage className="text-green-600" />
                                    Order Items ({order.order_items.length})
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {order.order_items.map((item) => (
                                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 text-lg mb-2">
                                                    {item.product_name}
                                                </h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                                    <div>
                                                        <span className="font-medium">Category:</span> {item.category}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Brand:</span> {item.brand}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600">Unit Price:</span>
                                                        <span className="font-bold text-gray-900">LKR {item.unit_price.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600">Quantity:</span>
                                                        <span className="font-bold text-gray-900">{item.unit_quantity}</span>
                                                    </div>
                                                    {item.unit_discount > 0 && (
                                                        <div className="flex items-center gap-2 text-green-600">
                                                            <span>Discount:</span>
                                                            <span className="font-bold">{item.unit_discount}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-600 mb-1">Subtotal</div>
                                                <div className="text-2xl font-bold text-green-600">
                                                    LKR {item.line_total.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">LKR {order.subtotal.toFixed(2)}</span>
                                </div>
                                {order.total_discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span className="font-semibold">-LKR {order.total_discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-700">
                                    <span>Tax</span>
                                    <span className="font-semibold">LKR {order.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Shipping</span>
                                    <span className="font-semibold">LKR {order.shipping_cost.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-lg">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="font-bold text-green-600">LKR {order.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FiCreditCard className="text-green-600" />
                                Payment Info
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Method</span>
                                    <span className="font-semibold text-gray-900 uppercase">{order.payment_method}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Gateway</span>
                                    <span className="font-semibold text-gray-900 uppercase">{order.payment_gateway || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment ID</span>
                                    <span className="font-mono text-xs text-gray-900">{order.payment_id || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Currency</span>
                                    <span className="font-semibold text-gray-900 uppercase">{order.currency}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FiMapPin className="text-green-600" />
                                Shipping Address
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <FiUser className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="font-semibold text-gray-900">{order.user_name}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <FiPhone className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div className="text-gray-700">{order.user_phone}</div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <FiMail className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div className="text-gray-700 break-all">{order.user_email}</div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <FiMapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div className="text-gray-700">
                                        <div>{order.user_address_line1}</div>
                                        {order.user_address_line2 && <div>{order.user_address_line2}</div>}
                                        <div>{order.user_city}, {order.user_prefecture}</div>
                                        <div>{order.user_region}</div>
                                        <div>{order.user_postal_code}</div>
                                        <div>{order.user_country}</div>
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

export default OrderDetails;
