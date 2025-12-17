import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { 
  FiStar, 
  FiHeart, 
  FiShoppingCart, 
  FiEye, 
  FiShare2,
  FiTruck,
  FiShield,
  FiTag,
  FiPercent
} from 'react-icons/fi';
import { useWishlist } from '../../../hooks/useWishlist';
import { toast } from 'sonner';

interface ProductCardProps {
  product: {
    id: number;
    slug?: string; // Added slug
    name: string;
    image: string;
    images?: string[];
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
    category: string;
    brand?: string;
    inStock: boolean;
    stockCount?: number;
    isOnSale?: boolean;
    isBestSeller?: boolean;
    isNew?: boolean;
    freeShipping?: boolean;
    description?: string;
    features?: string[];
    discount?: number;
  };
  variant?: 'default' | 'compact' | 'detailed';
  showQuickActions?: boolean;
  onAddToCart?: (productId: number) => void;
  onAddToWishlist?: (productId: number) => void;
  onQuickView?: (productId: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'default',
  showQuickActions = true,
  onAddToCart,
  onAddToWishlist,
  onQuickView
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = product.images || [product.image];
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  const isWishlisted = isInWishlist(product.id);

  const handleAddToWishlist = () => {
    const isAdded = toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug || '',
      primary_image: product.image,
      category_name: product.category,
      brand_name: product.brand,
      price: product.price,
      discount: discountPercentage
    });
    
    if (isAdded) {
      toast.success('Added to wishlist');
    } else {
      toast.success('Removed from wishlist');
    }
    
    onAddToWishlist?.(product.id);
  };

  const handleAddToCart = () => {
    onAddToCart?.(product.id);
  };

  const handleQuickView = () => {
    onQuickView?.(product.id);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <FiStar
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(product.rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getBadges = () => {
    const badges = [];
    
    if (product.isNew) {
      badges.push({ text: 'NEW', className: 'bg-blue-500 text-white' });
    }
    if (product.isBestSeller) {
      badges.push({ text: 'BESTSELLER', className: 'bg-orange-500 text-white' });
    }
    if (product.isOnSale || discountPercentage > 0) {
      badges.push({ 
        text: `-${discountPercentage}%`, 
        className: 'bg-red-500 text-white' 
      });
    }
    if (!product.inStock) {
      badges.push({ text: 'OUT OF STOCK', className: 'bg-gray-500 text-white' });
    }
    
    return badges;
  };

  const cardClasses = `
    group relative bg-white rounded-2xl transition-all duration-300 
    hover:-translate-y-1 overflow-hidden border border-gray-100 h-full flex flex-col
    ${variant === 'compact' ? 'max-w-xs' : variant === 'detailed' ? 'max-w-lg' : 'max-w-sm'}
    ${isHovered ? 'shadow-xl ring-1 ring-black/5' : 'shadow-sm'}
  `;

  return (
    <div 
      className={cardClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative overflow-hidden">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {getBadges().map((badge, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-full text-xs font-bold ${badge.className}`}
            >
              {badge.text}
            </span>
          ))}
        </div>

        {/* Wishlist Button */}
        {showQuickActions && (
          <button
            onClick={handleAddToWishlist}
            className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300 ${
              isWishlisted 
                ? 'bg-red-500 text-white effect-scale' 
                : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <FiHeart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Product Image */}
        <div className="relative h-64 bg-gray-100">
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Image Navigation Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Overlay */}
        {showQuickActions && (
          <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 transform transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}>
            <div className="flex space-x-2">
              <button
                onClick={handleQuickView}
                className="flex-1 bg-white text-gray-900 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <FiEye className="w-4 h-4 mr-2" />
                Quick View
              </button>
              
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Category & Brand */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-primary font-medium">{product.category}</span>
          {product.brand && (
            <span className="text-xs text-gray-500 uppercase tracking-wider">{product.brand}</span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center space-x-1">
            {renderStars()}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {product.rating} ({product.reviewCount} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {discountPercentage > 0 && (
            <div className="flex items-center text-red-500 text-sm font-semibold">
              <FiPercent className="w-3 h-3 mr-1" />
              Save {discountPercentage}%
            </div>
          )}
        </div>

        {/* Features (for detailed variant) */}
        {variant === 'detailed' && product.features && (
          <div className="mb-4 flex-grow">
            <ul className="text-sm text-gray-600 space-y-1">
              {product.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Spacer to push content to bottom */}
        <div className="flex-grow"></div>

        {/* Stock Status */}
        <div className="mb-4">
          {product.inStock ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600 font-medium">In Stock</span>
              {product.stockCount && product.stockCount < 10 && (
                <span className="text-sm text-orange-600">
                  Only {product.stockCount} left!
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-red-600 font-medium">Out of Stock</span>
          )}
        </div>

        {/* Shipping Info */}
        {product.freeShipping && (
          <div className="flex items-center text-green-600 text-sm mb-4">
            <FiTruck className="w-4 h-4 mr-2" />
            Free Shipping
          </div>
        )}

        {/* Visit Product Button */}
        <Link
          href={product.slug ? `/product/${product.slug}` : '#'}
          className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 flex items-center justify-center ${
            product.inStock
              ? 'bg-primary hover:bg-primary-600 text-white hover:shadow-lg transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FiEye className="w-4 h-4 mr-2" />
          Visit Product
        </Link>
      </div>

      {/* Trust Indicators */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center">
            <FiShield className="w-3 h-3 mr-1" />
            Secure
          </div>
          <div className="flex items-center">
            <FiTruck className="w-3 h-3 mr-1" />
            Fast Ship
          </div>
          <div className="flex items-center">
            <FiTag className="w-3 h-3 mr-1" />
            Best Price
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;