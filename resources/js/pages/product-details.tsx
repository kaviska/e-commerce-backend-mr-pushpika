import React, { useState, useEffect } from 'react';
import Nav from '../components/custom/main/Nav';
import Footer from '../components/custom/main/Footer';
import ProductCard from '../components/custom/ProductCard';
import { FiStar, FiShoppingCart, FiHeart, FiShare2, FiCheck, FiTruck, FiShield, FiRefreshCw, FiMinus, FiPlus, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'sonner';
import { getProductBySlug, getRelatedProducts, Product, Stock, calculateProductPrice } from '../hooks/api/products';
import { getReviews, submitReview, Review } from '../hooks/api/reviews';
import { addToCart } from '../hooks/api/cart';
import QuickViewModal from '../components/custom/QuickViewModal';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface ProductDetailsProps {
  slug: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ slug }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [allImages, setAllImages] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  // Variation State
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [currentStock, setCurrentStock] = useState<Stock | null>(null);
  const [priceInfo, setPriceInfo] = useState<any>(null);

  // Review State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Image Animation State
  const [isImageAnimating, setIsImageAnimating] = useState(false);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Slider State
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left' 
        ? sliderRef.current.scrollLeft - scrollAmount 
        : sliderRef.current.scrollLeft + scrollAmount;
      
      sliderRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleImageChange = (newImage: string) => {
    // Always trigger animation to give feedback, even if image is same
    setIsImageAnimating(true);
    setTimeout(() => {
        setSelectedImage(newImage);
        setIsImageAnimating(false);
    }, 200);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const productData = await getProductBySlug(slug);
        if (productData) {
          setProduct(productData);
          
          // Collect all images: primary image + variation images
          const images = [productData.primary_image];
          
          // Add unique variation images
          productData.stocks.forEach(stock => {
            stock.variation_stocks.forEach(vs => {
                if (vs.image && vs.image !== 'storage/images/products/placeholder.jpg' && !images.includes(vs.image)) {
                    images.push(vs.image);
                }
            });
          });
          
          setAllImages(images);
          setSelectedImage(productData.primary_image);

          // Initialize variations with first available stock
          if (productData.stocks.length > 0) {
            const initialStock = productData.stocks[0];
            const initialOptions: Record<string, number> = {};
            
            initialStock.variation_stocks.forEach((vs: any) => {
              const variationName = vs.variation_option.variation.name;
              initialOptions[variationName] = vs.variation_option.id;
            });
            
            setSelectedOptions(initialOptions);
            setCurrentStock(initialStock);
            setPriceInfo(calculateProductPrice([initialStock]));
            
            // Set initial image: use variation image if available, otherwise primary
            const variationImage = initialStock.variation_stocks.find(vs => 
              vs.image && vs.image !== 'storage/images/products/placeholder.jpg'
            )?.image;
            if (variationImage) {
              setSelectedImage(variationImage);
            }
          }

          // Fetch related products
          if (productData.category_id) {
            const related = await getRelatedProducts(productData.category_id);
            setRelatedProducts(related.filter(p => p.id !== productData.id));
          }
        }
      } catch (error) {
        console.error("Error loading product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (slug) loadData();
  }, [slug]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (product?.id) {
        getReviews(product.id).then(setReviews).catch(console.error);
    }
  }, [product?.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (userRating === 0) {
        toast.error("Please select a rating");
        return;
    }

    setIsSubmittingReview(true);
    try {
        await submitReview({
            product_id: product.id,
            rating: userRating,
            comment: userComment
        });
        toast.success("Review submitted successfully");
        setUserRating(0);
        setUserComment('');
        // Refresh reviews
        const updatedReviews = await getReviews(product.id);
        setReviews(updatedReviews);
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
        setIsSubmittingReview(false);
    }
  };

  // Handle option change
  const handleOptionChange = (variationName: string, optionId: number) => {
    const newOptions = { ...selectedOptions, [variationName]: optionId };
    setSelectedOptions(newOptions);

    // Find matching stock
    if (product) {
      const matchingStock = product.stocks.find(stock => {
        // Check if all selected options match this stock's variation options
        const stockOptions: Record<string, number> = {};
        stock.variation_stocks.forEach((vs: any) => {
          stockOptions[vs.variation_option.variation.name] = vs.variation_option.id;
        });
        
        // All selected options must match the stock's options
        return Object.keys(newOptions).every(key => stockOptions[key] === newOptions[key]);
      });

      if (matchingStock) {
        setCurrentStock(matchingStock);
        setPriceInfo(calculateProductPrice([matchingStock]));
        setQuantity(1); // Reset quantity on variation change
        
        // Update image: prioritize variation-specific image, fallback to primary
        const variationImage = matchingStock.variation_stocks.find(vs => 
          vs.image && vs.image !== 'storage/images/products/placeholder.jpg'
        )?.image;
        
        if (variationImage) {
          handleImageChange(variationImage);
        } else if (product.primary_image) {
          handleImageChange(product.primary_image);
        }
      } else {
        setCurrentStock(null);
        setPriceInfo(null);
      }
    }
  };

  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (!currentStock) return;
    
    if (type === 'inc' && quantity < currentStock.quantity) {
      setQuantity(prev => prev + 1);
    } else if (type === 'dec' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!currentStock) {
        toast.error("Please select valid options");
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        toast.error("Please login to add items to cart");
        setTimeout(() => {
            window.location.href = '/login?redirect_with='  + 'product/' + slug;
        }, 1500);
        return;
    }

    try {
        toast.loading('Adding to cart...');
        await addToCart(currentStock.id, quantity);
        toast.dismiss();
        toast.success(`Added ${quantity} ${product?.name} to cart!`, {
            action: {
                label: 'View Cart',
                onClick: () => window.location.href = '/cart'
            }
        });
    } catch (error: any) {
        toast.dismiss();
        console.error('Error adding to cart:', error);
        toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const renderStars = (rating: number = 0) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FiStar
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Extract available variations
  const getVariations = () => {
    if (!product) return {};
    const variations: Record<string, { id: number, name: string }[]> = {};
    
    product.stocks.forEach(stock => {
      stock.variation_stocks.forEach((vs: any) => {
        const vName = vs.variation_option.variation.name;
        const option = { id: vs.variation_option.id, name: vs.variation_option.name };
        
        if (!variations[vName]) {
          variations[vName] = [];
        }
        
        if (!variations[vName].find(o => o.id === option.id)) {
          variations[vName].push(option);
        }
      });
    });
    
    return variations;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <a href="/products" className="text-primary hover:underline">Back to Products</a>
      </div>
    );
  }

  const variations = getVariations();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Nav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <a href="/" className="hover:text-primary">Home</a>
          <span className="mx-2">/</span>
          <a href="/products" className="hover:text-primary">Products</a>
          <span className="mx-2">/</span>
          {product.category ? (
            <a href={`/products?category_ids[]=${product.category.id}`} className="hover:text-primary cursor-pointer">
              {product.category.name}
            </a>
          ) : (
            <span className="text-gray-500">Uncategorized</span>
          )}
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
            
            {/* Left Column: Image Gallery */}
            <div className="p-6 lg:p-8 bg-gray-50/50">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-white mb-4 shadow-sm border border-gray-100 group">
                <img 
                  src={selectedImage ? (selectedImage.startsWith('http') || selectedImage.startsWith('/') ? selectedImage : `/${selectedImage}`) : '/storage/images/products/placeholder.jpg'} 
                  alt={product.name} 
                  className={`w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-all duration-300 ${isImageAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/storage/images/products/placeholder.jpg';
                  }}
                />
                {priceInfo?.discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    -{priceInfo.discountPercentage}%
                  </div>
                )}
              </div>
              
              {allImages.length > 0 && (
                <div className="grid grid-cols-5 gap-3">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleImageChange(img)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === img 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-transparent hover:border-gray-300'
                      } bg-white`}
                    >
                      <img 
                        src={img.startsWith('http') || img.startsWith('/') ? img : `/${img}`} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/storage/images/products/placeholder.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Info */}
            <div className="p-6 lg:p-8 flex flex-col">
              <div className="mb-1">
                <span className="text-sm font-medium text-primary uppercase tracking-wider">
                  {product.brand?.name}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {renderStars(reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0)}
                  <span className="text-sm font-medium text-gray-900 ml-2">
                    {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
                  </span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">{reviews.length} Reviews</span>
                <span className="text-gray-300">|</span>
                {currentStock && currentStock.quantity > 0 ? (
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <FiCheck className="w-4 h-4" /> In Stock ({currentStock.quantity})
                    </span>
                ) : (
                    <span className="text-sm text-red-500 font-medium flex items-center gap-1">
                    <FiAlertCircle className="w-4 h-4" /> Out of Stock
                    </span>
                )}
              </div>

              <div className="flex items-baseline gap-4 mb-8">
                {priceInfo ? (
                    <>
                        <span className="text-4xl font-bold text-gray-900">
                        ${priceInfo.price.toFixed(2)}
                        </span>
                        {priceInfo.originalPrice && (
                        <span className="text-xl text-gray-400 line-through">
                            ${priceInfo.originalPrice.toFixed(2)}
                        </span>
                        )}
                    </>
                ) : (
                    <span className="text-2xl text-gray-400">Unavailable</span>
                )}
              </div>

              <p className="text-gray-600 mb-8 leading-relaxed line-clamp-4">
                {product.description}
              </p>

              <div className="space-y-6 border-t border-gray-100 pt-6 mb-8">
                {/* Variations */}
                {Object.entries(variations).map(([name, options]) => (
                  <div key={name}>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">{name}: <span className="text-gray-500 font-normal">{options.find(o => o.id === selectedOptions[name])?.name}</span></h3>
                    <div className="flex flex-wrap gap-3">
                      {options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleOptionChange(name, option.id)}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            selectedOptions[name] === option.id
                              ? 'border-primary bg-primary/5 text-primary' 
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Quantity & Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border border-gray-300 rounded-xl w-fit">
                    <button 
                      onClick={() => handleQuantityChange('dec')}
                      className="p-3 hover:bg-gray-50 text-gray-600 transition-colors rounded-l-xl disabled:opacity-50"
                      disabled={quantity <= 1 || !currentStock}
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange('inc')}
                      className="p-3 hover:bg-gray-50 text-gray-600 transition-colors rounded-r-xl disabled:opacity-50"
                      disabled={!currentStock || quantity >= currentStock.quantity}
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>

                  <button 
                    onClick={handleAddToCart}
                    disabled={!currentStock || currentStock.quantity === 0}
                    className={`flex-1 py-3 px-8 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        currentStock && currentStock.quantity > 0
                        ? 'bg-primary text-white hover:bg-primary-600 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    {currentStock && currentStock.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>

                  <button className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors">
                    <FiHeart className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <FiTruck className="w-6 h-6 text-primary" />
                  <span className="text-xs font-medium text-gray-600">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <FiShield className="w-6 h-6 text-primary" />
                  <span className="text-xs font-medium text-gray-600">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <FiRefreshCw className="w-6 h-6 text-primary" />
                  <span className="text-xs font-medium text-gray-600">Easy Returns</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tabs */}
          <div className="border-t border-gray-100">
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 text-sm font-medium capitalize transition-colors relative whitespace-nowrap ${
                    activeTab === tab 
                      ? 'text-primary' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              ))}
            </div>
            <div className="p-8 bg-gray-50/30">
              {activeTab === 'description' && (
                <div className="prose max-w-none text-gray-600">
                  <p>{product.description}</p>
                </div>
              )}
              {activeTab === 'specifications' && (
                <div className="text-gray-500 italic">
                  No specifications available.
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="max-w-3xl mx-auto">
                  {/* Reviews List */}
                  <div className="space-y-8 mb-12">
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                            {review.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{review.user.name}</h4>
                                            <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex text-yellow-400">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <FiStar key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No reviews yet. Be the first to review!
                        </div>
                    )}
                  </div>

                  {/* Add Review Form */}
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Write a Review</h3>
                    {isLoggedIn ? (
                        <form onSubmit={handleSubmitReview}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setUserRating(star)}
                                            className={`text-2xl transition-colors ${userRating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                                <textarea
                                    value={userComment}
                                    onChange={(e) => setUserComment(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    rows={4}
                                    placeholder="Share your thoughts about this product..."
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmittingReview}
                                className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-600 mb-4">Please log in to write a review.</p>
                            <a href="/login" className="text-primary font-medium hover:underline">Log In</a>
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
            <div className="mb-12 relative group/slider">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => scrollSlider('left')}
                            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                            <FiChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => scrollSlider('right')}
                            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                            <FiChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                <div 
                    ref={sliderRef}
                    className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {relatedProducts.map(related => {
                        const priceInfo = calculateProductPrice(related.stocks);
                        
                        const cardProduct = {
                            id: related.id,
                            name: related.name,
                            slug: related.slug,
                            image: related.primary_image || "https://via.placeholder.com/300",
                            images: [related.primary_image],
                            price: priceInfo.price,
                            originalPrice: priceInfo.originalPrice,
                            rating: 0, // API doesn't return rating for related products yet
                            reviewCount: 0,
                            category: related.category?.name || '',
                            brand: related.brand?.name,
                            inStock: priceInfo.inStock,
                            stockCount: priceInfo.stockCount,
                            isOnSale: (priceInfo.discount || 0) > 0,
                            discount: priceInfo.discount,
                            discountPercentage: priceInfo.discountPercentage,
                            priceRange: priceInfo.priceRange,
                            originalPriceRange: priceInfo.originalPriceRange
                        };

                        return (
                            <div key={related.id} className="min-w-[280px] w-[280px] snap-start">
                                <ProductCard 
                                    product={cardProduct} 
                                    variant="compact"
                                    onQuickView={() => {
                                        setQuickViewProduct(cardProduct);
                                        setIsQuickViewOpen(true);
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

      </main>

      <QuickViewModal 
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={quickViewProduct}
        onAddToCart={(id) => {
            toast.success(`Added product ${id} to cart`);
            setIsQuickViewOpen(false);
        }}
      />

      <Footer />
    </div>
  );
};

export default ProductDetails;
