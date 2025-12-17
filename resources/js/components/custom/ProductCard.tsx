import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { 
  FiStar, 
  FiHeart, 
  FiShoppingCart, 
  FiEye, 
  FiPlus
} from 'react-icons/fi';
import { useWishlist } from '../../hooks/useWishlist';
import { toast } from 'sonner';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug?: string;
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
    discountPercentage?: number;
    priceRange?: string;
    originalPriceRange?: string;
    reviews_avg_rating?: number;
    reviews_count?: number;
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist(product.id));

  useEffect(() => {
    setIsWishlisted(isInWishlist(product.id));
  }, [product.id, isInWishlist]);

  const images = product.images || [product.image];
  
  // Calculate discount percentage for badge
  // Use the passed discountPercentage if available, otherwise calculate
  const discountPercentage = product.discountPercentage ?? (product.discount && product.originalPrice
    ? Math.round((product.discount / product.originalPrice) * 100)
    : 0);

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const added = toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug || '',
      primary_image: product.image,
      category_name: product.category,
      brand_name: product.brand,
      price: product.price,
      discount: discountPercentage
    });
    
    setIsWishlisted(added);
    
    if (added) {
      toast.success(`${product.name} added to wishlist`);
    } else {
      toast.info(`${product.name} removed from wishlist`);
    }
    
    onAddToWishlist?.(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onAddToCart?.(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onQuickView?.(product.id);
  };

  const renderStars = () => {
    const rating = product.reviews_avg_rating ?? product.rating ?? 0;
    return Array.from({ length: 5 }, (_, index) => (
      <FiStar
        key={index}
        className={`w-3 h-3 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getBadges = () => {
    const badges = [];
    
    if (product.isOnSale || discountPercentage > 0) {
      badges.push({ 
        text: `-${discountPercentage}%`, 
        className: 'bg-red-500 text-white' 
      });
    } else if (product.isNew) {
      badges.push({ text: 'NEW', className: 'bg-blue-500 text-white' });
    }
    return badges;
  };

  // Compact card styles
  const cardClasses = `
    group relative bg-white rounded-xl transition-all duration-300 
    hover:-translate-y-1 overflow-hidden border border-gray-100 h-full flex flex-col
    ${isHovered ? 'shadow-lg ring-1 ring-black/5' : 'shadow-sm'}
  `;

  return (
    
    <a 
      href={product.slug ? `/product/${product.slug}` : '#'}
      className={cardClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {/* Badges - Simplified */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {getBadges().map((badge, index) => (
            <span
              key={index}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide ${badge.className}`}
            >
              {badge.text}
            </span>
          ))}
        </div>

        {/* Wishlist Button - Always visible on hover or if active */}
        <button
          onClick={handleAddToWishlist}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all duration-200 ${
            isWishlisted 
              ? 'bg-red-500 text-white shadow-lg' 
              : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white opacity-0 group-hover:opacity-100'
          } ${isWishlisted ? 'opacity-100' : ''}`}
        >
          <FiHeart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Product Image */}
        <img
          src={images[currentImageIndex] ? (images[currentImageIndex].startsWith('http') || images[currentImageIndex].startsWith('/') ? images[currentImageIndex] : `/${images[currentImageIndex]}`) : '/storage/images/products/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/storage/images/products/placeholder.jpg';
          }}
        />

        {/* Quick Add Overlay - Appears on hover for desktop, always visible on mobile */}
        <div className={`absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/40 to-transparent flex justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}>
             <button
                onClick={handleQuickView}
                className="bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
              >
                <FiEye className="w-3 h-3" />
                Quick View
              </button>
        </div>
      </div>

      {/* Product Info - Compact */}
      <div className="p-3 flex-grow flex flex-col">
        {/* Category */}
        <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-medium truncate">
          {product.category}
        </div>

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight group-hover:text-primary transition-colors min-h-[2.5em]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex space-x-0.5 mr-1">
            {renderStars()}
          </div>
          <span className="text-[10px] text-gray-400">({product.reviews_count ?? product.reviewCount ?? 0})</span>
        </div>

        {/* Price & Add Button */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-gray-900">
                {product.priceRange ? (
                    <span>{product.priceRange}</span>
                ) : (
                    <>
                        ${product.price.toFixed(0)}
                        <span className="text-xs align-top">.{(product.price % 1).toFixed(2).substring(2)}</span>
                    </>
                )}
              </span>
              
              {/* Original Price / Range */}
              {(product.originalPriceRange || product.originalPrice) && (
                <span className="text-xs text-gray-400 line-through">
                  {product.originalPriceRange || `$${product.originalPrice?.toFixed(0)}`}
                </span>
              )}
            </div>
          </div>


        </div>
      </div>
    </a>
  );
};

export default ProductCard;
