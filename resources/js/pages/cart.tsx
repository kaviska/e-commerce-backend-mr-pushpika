import React, { useState, useEffect } from 'react';
import Nav from '../components/custom/main/Nav';
import Footer from '../components/custom/main/Footer';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowRight, FiPackage, FiAlertCircle, FiX } from 'react-icons/fi';
import { toast } from 'sonner';
import { getCart, CartItem, updateCartQuantity, removeFromCart, clearCart } from '../hooks/api/cart';
import { Link } from '@inertiajs/react';

const Cart = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Summary state
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalDiscount, setTotalDiscount] = useState(0);
    const [totalTax, setTotalTax] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        if (token) {
            loadCart();
        } else {
            setLoading(false);
        }
    }, []);

    const loadCart = async () => {
        try {
            const cartData = await getCart();
            setCartItems(cartData.cart_items || []);
            setTotalAmount(cartData.total_amount || 0);
            setTotalDiscount(cartData.total_discount || 0);
            setTotalTax(cartData.total_tax || 0);
            setGrandTotal(cartData.grand_total || 0);
        } catch (error) {
            console.error('Error loading cart:', error);
            toast.error('Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (stockId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        
        setUpdating(stockId);
        try {
            await updateCartQuantity(stockId, newQuantity);
            await loadCart();
            toast.success('Cart updated');
        } catch (error) {
            console.error('Error updating cart:', error);
            toast.error('Failed to update cart');
        } finally {
            setUpdating(null);
        }
    };

    const handleRemoveItem = async (stockId: number) => {
        try {
            await removeFromCart(stockId);
            await loadCart();
            toast.success('Item removed from cart');
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Failed to remove item');
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm('Are you sure you want to clear your cart?')) return;
        
        try {
            await clearCart();
            await loadCart();
            toast.success('Cart cleared');
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error('Failed to clear cart');
        }
    };

    const getVariationText = (item: CartItem): string => {
        if (!item.stock.variation_stocks || item.stock.variation_stocks.length === 0) {
            return '';
        }
        return item.stock.variation_stocks
            .map(vs => `${vs.variation_option.variation.name}: ${vs.variation_option.name}`)
            .join(' • ');
    };

    const getProductImage = (item: CartItem): string => {
        // Check for variation image first
        if (item.stock.variation_stocks && item.stock.variation_stocks.length > 0) {
            const variationImage = item.stock.variation_stocks[0].image;
            if (variationImage) {
                return variationImage.startsWith('http') || variationImage.startsWith('/') 
                    ? variationImage 
                    : `/${variationImage}`;
            }
        }
        
        // Fall back to product primary image
        const primaryImage = item.stock?.product?.primary_image || '/placeholder-image.png';
        return primaryImage.startsWith('http') || primaryImage.startsWith('/') 
            ? primaryImage 
            : `/${primaryImage}`;
    };

    const getItemPrice = (item: CartItem): number => {
        const price = item.stock.web_price;
        const discount = item.stock.web_discount;
        return price - (price * discount / 100);
    };

    const getItemOriginalPrice = (item: CartItem): number => {
        return item.stock.web_price;
    };

    const hasDiscount = (item: CartItem): boolean => {
        return item.stock.web_discount > 0;
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

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <Nav />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <FiShoppingCart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h2>
                        <p className="text-gray-600 mb-6">You need to be logged in to view your cart</p>
                        <Link href="/login?redirect_with=cart" className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-semibold">
                            Log In to Continue
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <Nav />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <FiShoppingCart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
                        <p className="text-gray-600 mb-6">Add some products to get started!</p>
                        <Link href="/products" className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-semibold">
                            <FiPackage className="w-5 h-5 mr-2" />
                            Browse Products
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
                    <span className="text-gray-900 font-medium">Shopping Cart</span>
                </nav>

                {/* Page Title */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <FiShoppingCart className="mr-3 text-green-600" />
                        Shopping Cart
                    </h1>
                    {cartItems.length > 0 && (
                        <button
                            onClick={handleClearCart}
                            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                        >
                            <FiTrash2 className="w-4 h-4 mr-1" />
                            Clear Cart
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-700">
                                    {cartItems.length} Item{cartItems.length !== 1 ? 's' : ''} in Cart
                                </p>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex gap-4">
                                            {/* Product Image */}
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={getProductImage(item)}
                                                    alt={item.stock?.product?.name || 'Product'}
                                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                                />
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <Link 
                                                    href={`/product/${item.stock?.product?.slug || '#'}`}
                                                    className="text-lg font-semibold text-gray-900 hover:text-green-600 line-clamp-2"
                                                >
                                                    {item.stock?.product?.name || 'Product Name'}
                                                </Link>
                                                
                                                {getVariationText(item) && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {getVariationText(item)}
                                                    </p>
                                                )}

                                                {item.stock?.product?.brand && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-sm text-gray-500">Brand:</span>
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {item.stock.product.brand.name}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Price */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xl font-bold text-green-600">
                                                        ${getItemPrice(item).toFixed(2)}
                                                    </span>
                                                    {hasDiscount(item) && (
                                                        <>
                                                            <span className="text-sm text-gray-400 line-through">
                                                                ${getItemOriginalPrice(item).toFixed(2)}
                                                            </span>
                                                            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                                                                {item.stock.web_discount}% OFF
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-4 mt-4">
                                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.stock_id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1 || updating === item.stock_id}
                                                            className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <FiMinus className="w-4 h-4 text-gray-600" />
                                                        </button>
                                                        <span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.stock_id, item.quantity + 1)}
                                                            disabled={item.quantity >= item.stock.quantity || updating === item.stock_id}
                                                            className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <FiPlus className="w-4 h-4 text-gray-600" />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRemoveItem(item.stock_id)}
                                                        className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                                                    >
                                                        <FiX className="w-4 h-4" />
                                                        Remove
                                                    </button>
                                                </div>

                                                {/* Stock Warning */}
                                                {item.stock.quantity < 10 && (
                                                    <div className="flex items-center gap-1 mt-2 text-orange-600 text-sm">
                                                        <FiAlertCircle className="w-4 h-4" />
                                                        <span>Only {item.stock.quantity} left in stock</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Subtotal */}
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500 mb-1">Subtotal</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    ${(getItemPrice(item) * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                                </div>
                                {totalDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span className="font-semibold">-${totalDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-700">
                                    <span>Tax (8%)</span>
                                    <span className="font-semibold">${totalTax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-lg">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="font-bold text-green-600">${grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => window.location.href = "/checkout/step1"}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                Proceed to Checkout
                                <FiArrowRight className="w-5 h-5" />
                            </button>

                            <Link 
                                href="/products" 
                                className="block w-full text-center text-green-600 hover:text-green-700 font-semibold py-3 mt-3"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Cart;
