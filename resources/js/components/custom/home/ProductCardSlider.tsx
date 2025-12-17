import React, { useState, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiGrid, FiList } from 'react-icons/fi';
import ProductCard from './ProductCard';

interface Product {
  id: number;
  slug: string; // Added slug
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
}

interface ProductCardSliderProps {
  title?: string;
  subtitle?: string;
  products: Product[];
  slidesToShow?: number;
  autoplay?: boolean;
  autoplayInterval?: number;
  showControls?: boolean;
  showDots?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  containerClassName?: string;
  onAddToCart?: (productId: number) => void;
  onAddToWishlist?: (productId: number) => void;
  onQuickView?: (productId: number) => void;
}

import QuickViewModal from '../QuickViewModal';

const ProductCardSlider: React.FC<ProductCardSliderProps> = ({
  title = "Featured Products",
  subtitle = "Discover our hand-picked selection",
  products,
  slidesToShow = 4,
  autoplay = false,
  autoplayInterval = 5000,
  showControls = true,
  showDots = true,
  variant = 'default',
  containerClassName = "",
  onAddToCart,
  onAddToWishlist,
  onQuickView
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'slider'>('slider');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<NodeJS.Timeout>();

  const maxSlides = Math.max(0, products.length - slidesToShow);

  // Auto-play functionality
  React.useEffect(() => {
    if (autoplay && viewMode === 'slider') {
      autoplayRef.current = setInterval(() => {
        setCurrentSlide(prev => prev >= maxSlides ? 0 : prev + 1);
      }, autoplayInterval);

      return () => {
        if (autoplayRef.current) {
          clearInterval(autoplayRef.current);
        }
      };
    }
  }, [autoplay, autoplayInterval, maxSlides, viewMode]);

  const nextSlide = () => {
    if (currentSlide < maxSlides) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index <= maxSlides) {
      setCurrentSlide(index);
    }
  };

  const handleAddToCart = (productId: number) => {
    if (onAddToCart) {
      onAddToCart(productId);
    } else {
      console.log('Added to cart:', productId);
    }
  };

  const handleAddToWishlist = (productId: number) => {
    if (onAddToWishlist) {
      onAddToWishlist(productId);
    } else {
      console.log('Added to wishlist:', productId);
    }
  };

  const handleQuickView = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
        setQuickViewProduct(product);
    }
    if (onQuickView) {
      onQuickView(productId);
    }
  };

  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
  };

  const getResponsiveSlidesToShow = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 768) return 2;
      if (window.innerWidth < 1024) return 3;
      return slidesToShow;
    }
    return slidesToShow;
  };

  const responsiveSlidesToShow = getResponsiveSlidesToShow();

  return (
    <section className={`py-4 md:py-4 lg:py-4 bg-gray-50 ${containerClassName}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {title}
            </h2>
            <div className="h-1 w-20 bg-primary mt-2 rounded-full" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex hidden md:flex items-center space-x-4">
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('slider')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'slider'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Controls */}
            {showControls && viewMode === 'slider' && (
              <div className="md:flex hidden space-x-2">
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    currentSlide === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-600 hover:bg-primary hover:text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={currentSlide >= maxSlides}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    currentSlide >= maxSlides
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-600 hover:bg-primary hover:text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products Container */}
        {viewMode === 'slider' ? (
          <div className="relative">
            {/* Slider Container */}
            <div className="overflow-hidden" ref={sliderRef}>
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * (100 / responsiveSlidesToShow)}%)`
                }}
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex-none px-3"
                    style={{ width: `${100 / responsiveSlidesToShow}%` }}
                  >
                    <ProductCard
                      product={product}
                      variant={variant}
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
                      onQuickView={handleQuickView}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Navigation */}
            {showDots && (
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: maxSlides + 1 }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? 'bg-primary scale-125'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant={variant}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                onQuickView={handleQuickView}
              />
            ))}
          </div>
        )}

       
        {/* Load More Button (for grid view) */}
        {viewMode === 'grid' && products.length > 12 && (
          <div className="text-center mt-12">
            <button className="inline-flex items-center px-8 py-3 bg-primary hover:bg-primary-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
              Load More Products
              <FiChevronRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <QuickViewModal 
        isOpen={!!quickViewProduct} 
        onClose={handleCloseQuickView} 
        product={quickViewProduct}
        onAddToCart={handleAddToCart}
      />
    </section>
  );
};

export default ProductCardSlider;