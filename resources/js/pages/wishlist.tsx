import React, { useState, useEffect } from 'react';
import Nav from '../components/custom/main/Nav';
import Footer from '../components/custom/main/Footer';
import { FiHeart, FiTrash2, FiShoppingCart, FiPackage, FiX } from 'react-icons/fi';
import { toast } from 'sonner';
import { useWishlist, WishlistItem } from '../hooks/useWishlist';
import { Link } from '@inertiajs/react';
import { addToCart } from '../hooks/api/cart';

const Wishlist = () => {
    const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    const handleRemoveItem = (productId: number, productName: string) => {
        removeFromWishlist(productId);
        toast.success(`${productName} removed from wishlist`);
    };

    const handleClearWishlist = () => {
        if (!window.confirm('Are you sure you want to clear your wishlist?')) return;
        
        clearWishlist();
        toast.success('Wishlist cleared');
    };

    const handleAddToCart = async (item: WishlistItem) => {
        try {
            // Since we don't have stock_id in wishlist, we'll need to get it
            // For now, showing a message to view the product
            toast.info('Please visit the product page to add to cart');
            window.location.href = `/product/${item.slug}`;
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getImageUrl = (image: string) => {
        if (image.startsWith('http') || image.startsWith('/')) {
            return image;
        }
        return `/${image}`;
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

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Nav />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <nav className="flex text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-green-600">Home</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">Wishlist</span>
                </nav>

                {/* Page Title */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <FiHeart className="mr-3 text-red-500" />
                            My Wishlist
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                        </p>
                    </div>
                    {wishlist.length > 0 && (
                        <button
                            onClick={handleClearWishlist}
                            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                        >
                            <FiTrash2 className="w-4 h-4 mr-1" />
                            Clear Wishlist
                        </button>
                    )}
                </div>

                {/* Wishlist Items */}
                {wishlist.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <FiHeart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
                        <p className="text-gray-600 mb-6">Save your favorite products to buy them later!</p>
                        <Link 
                            href="/products" 
                            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-semibold"
                        >
                            <FiPackage className="w-5 h-5 mr-2" />
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                            >
                                {/* Product Image */}
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                    <Link href={`/product/${item.slug}`}>
                                        <img
                                            src={getImageUrl(item.primary_image)}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400';
                                            }}
                                        />
                                    </Link>
                                    
                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemoveItem(item.id, item.name)}
                                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors group/remove"
                                    >
                                        <FiX className="w-5 h-5 text-gray-600 group-hover/remove:text-red-600" />
                                    </button>

                                    {/* Discount Badge */}
                                    {item.discount && item.discount > 0 && (
                                        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                            {item.discount}% OFF
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <Link href={`/product/${item.slug}`}>
                                        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 hover:text-green-600 transition-colors">
                                            {item.name}
                                        </h3>
                                    </Link>
                                    
                                    {item.category_name && (
                                        <p className="text-sm text-gray-600 mb-2">{item.category_name}</p>
                                    )}

                                    {item.brand_name && (
                                        <p className="text-xs text-gray-500 mb-3">Brand: {item.brand_name}</p>
                                    )}

                                    {/* Price */}
                                    {item.price && (
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2">
                                                {item.discount && item.discount > 0 ? (
                                                    <>
                                                        <span className="text-2xl font-bold text-green-600">
                                                            ¥{(item.price * (1 - item.discount / 100)).toFixed(2)}
                                                        </span>
                                                        <span className="text-sm text-gray-500 line-through">
                                                            ¥{item.price.toFixed(2)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-2xl font-bold text-green-600">
                                                        ¥{item.price.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="space-y-2">
                                        <Link
                                            href={`/product/${item.slug}`}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-semibold text-sm"
                                        >
                                            <FiShoppingCart className="w-4 h-4" />
                                            View Product
                                        </Link>
                                        <button
                                            onClick={() => handleRemoveItem(item.id, item.name)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors font-semibold text-sm"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                            Remove
                                        </button>
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

export default Wishlist;
