import React, { useState, useEffect } from 'react';
import Nav from '../components/custom/main/Nav';
import Footer from '../components/custom/main/Footer';
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock, FiEye, FiShoppingBag, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { toast } from 'sonner';
import { getUserOrders, Order } from '../hooks/api/order';
import { Link } from '@inertiajs/react';

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const ordersData = await getUserOrders();
            setOrders(ordersData || []);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Failed to load orders');
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
            'pending': <FiClock className="w-4 h-4" />,
            'processing': <FiPackage className="w-4 h-4" />,
            'shipped': <FiTruck className="w-4 h-4" />,
            'delivered': <FiCheckCircle className="w-4 h-4" />,
            'cancelled': <FiXCircle className="w-4 h-4" />,
            'completed': <FiCheckCircle className="w-4 h-4" />,
        };
        return statusIcons[status.toLowerCase()] || <FiPackage className="w-4 h-4" />;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredOrders = filter === 'all' 
        ? orders 
        : orders.filter(order => order.order_status.toLowerCase() === filter);

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

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Nav />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <nav className="flex text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-green-600">Home</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">My Orders</span>
                </nav>

                {/* Page Title */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
                        <FiShoppingBag className="mr-3 text-green-600" />
                        My Orders
                    </h1>
                    <p className="text-gray-600">Track and manage your orders</p>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    filter === status
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                {status === 'all' && ` (${orders.length})`}
                                {status !== 'all' && ` (${orders.filter(o => o.order_status.toLowerCase() === status).length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <FiPackage className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Found</h2>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all' 
                                ? "You haven't placed any orders yet." 
                                : `You don't have any ${filter} orders.`}
                        </p>
                        <Link 
                            href="/products" 
                            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-semibold"
                        >
                            <FiShoppingBag className="w-5 h-5 mr-2" />
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Order Header */}
                                <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    Order #{order.order_number}
                                                </h3>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.order_status)}`}>
                                                    {getStatusIcon(order.order_status)}
                                                    {order.order_status}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <FiCalendar className="w-4 h-4" />
                                                    {formatDate(order.created_at)}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <FiPackage className="w-4 h-4" />
                                                    {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                                            <div className="text-2xl font-bold text-green-600">
                                                ¥{order.total.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {order.order_items.slice(0, 2).map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 truncate mb-1">
                                                        {item.product_name}
                                                    </h4>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span>Qty: {item.unit_quantity}</span>
                                                        <span>•</span>
                                                        <span>¥{item.unit_price.toFixed(2)} each</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-900">
                                                        ¥{item.line_total.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {order.order_items.length > 2 && (
                                            <div className="text-center text-sm text-gray-500 py-2">
                                                + {order.order_items.length - 2} more {order.order_items.length - 2 === 1 ? 'item' : 'items'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Footer */}
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6 text-sm">
                                            <div>
                                                <span className="text-gray-600">Payment: </span>
                                                <span className="font-semibold text-gray-900">
                                                    {order.payment_method.toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Payment Status: </span>
                                                <span className={`font-semibold ${
                                                    order.payment_status === 'paid' 
                                                        ? 'text-green-600' 
                                                        : 'text-orange-600'
                                                }`}>
                                                    {order.payment_status}
                                                </span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-green-600 border border-green-600 rounded-full hover:bg-green-50 transition-colors font-semibold text-sm"
                                        >
                                            <FiEye className="w-4 h-4" />
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Orders;
