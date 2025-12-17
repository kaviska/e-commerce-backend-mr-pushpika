import React, { useState, useEffect } from 'react';
import { FiX, FiStar, FiShoppingCart, FiCheck, FiAlertCircle, FiMinus, FiPlus, FiLoader, FiShare2, FiLink } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { getProductBySlug, calculateProductPrice, Product, Stock } from '../../hooks/api/products';
import { addToCart } from '../../hooks/api/cart';
import { toast } from 'sonner';

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
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
    description?: string;
    discount?: number;
    discountPercentage?: number;
    priceRange?: string;
    originalPriceRange?: string;
  } | null;
  onAddToCart?: (productId: number) => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ isOpen, onClose, product, onAddToCart }) => {
  const [fullProduct, setFullProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [currentStock, setCurrentStock] = useState<Stock | null>(null);
  const [priceInfo, setPriceInfo] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [allImages, setAllImages] = useState<string[]>([]);

  // Reset state when modal opens with a new product
  useEffect(() => {
    if (isOpen && product?.slug) {
      loadFullProduct(product.slug);
    } else {
      // Reset state when closed
      setFullProduct(null);
      setLoading(false);
      setSelectedOptions({});
      setCurrentStock(null);
      setPriceInfo(null);
      setQuantity(1);
      setAllImages([]);
      setSelectedImage('');
    }
  }, [isOpen, product]);

  const loadFullProduct = async (slug: string) => {
    setLoading(true);
    try {
      const productData = await getProductBySlug(slug);
      if (productData) {
        setFullProduct(productData);

        // Collect images
        const images = [productData.primary_image];
        productData.stocks.forEach(stock => {
          stock.variation_stocks.forEach(vs => {
            if (vs.image && vs.image !== 'storage/images/products/placeholder.jpg' && !images.includes(vs.image)) {
              images.push(vs.image);
            }
          });
        });
        setAllImages(images);
        setSelectedImage(productData.primary_image);

        // Initialize variations
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
          
           // Set initial image from variation if available
           const variationImage = initialStock.variation_stocks.find(vs => 
            vs.image && vs.image !== 'storage/images/products/placeholder.jpg'
          )?.image;
          if (variationImage) {
            setSelectedImage(variationImage);
          }
        }
      }
    } catch (error) {
      console.error("Error loading product details:", error);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (variationName: string, optionId: number) => {
    if (!fullProduct) return;

    const newOptions = { ...selectedOptions, [variationName]: optionId };
    setSelectedOptions(newOptions);

    // Find matching stock
    const matchingStock = fullProduct.stocks.find(stock => {
      const stockOptions: Record<string, number> = {};
      stock.variation_stocks.forEach((vs: any) => {
        stockOptions[vs.variation_option.variation.name] = vs.variation_option.id;
      });
      return Object.keys(newOptions).every(key => stockOptions[key] === newOptions[key]);
    });

    if (matchingStock) {
      setCurrentStock(matchingStock);
      setPriceInfo(calculateProductPrice([matchingStock]));
      setQuantity(1);
      
      const variationImage = matchingStock.variation_stocks.find(vs => 
        vs.image && vs.image !== 'storage/images/products/placeholder.jpg'
      )?.image;
      
      if (variationImage) {
        setSelectedImage(variationImage);
      } else if (fullProduct.primary_image) {
        setSelectedImage(fullProduct.primary_image);
      }
    } else {
      setCurrentStock(null);
      setPriceInfo(null);
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
            window.location.href = '/login';
        }, 1500);
        return;
    }

    try {
        toast.loading('Adding to cart...');
        await addToCart(currentStock.id, quantity);
        toast.dismiss();
        toast.success(`Added product to cart!`, {
            action: {
                label: 'View Cart',
                onClick: () => window.location.href = '/cart'
            }
        });
        if (onAddToCart) onAddToCart(currentStock.id);
        onClose();
    } catch (error: any) {
        toast.dismiss();
        console.error('Error adding to cart:', error);
        toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareMenuPosition, setShareMenuPosition] = useState({ top: 0, left: 0 });

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (product?.slug) {
        const url = `${window.location.origin}/product/${product.slug}`;
        const title = product.name;
        const text = `Check out ${product.name} on Nippon Cars!`;

        // Try Native Share API
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url
                });
                return;
            } catch (error) {
                console.log('Error sharing:', error);
                // Fallback to menu if share fails (e.g. user cancelled or not supported)
                if ((error as any).name !== 'AbortError') {
                    toggleShareMenu();
                }
            }
        } else {
             toggleShareMenu();
        }
    }
  };

  const toggleShareMenu = () => {
      setShowShareMenu(!showShareMenu);
  };

  const handleSocialShare = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy') => {
    if (!product?.slug) return;
    const url = encodeURIComponent(`${window.location.origin}/product/${product.slug}`);
    const text = encodeURIComponent(`Check out ${product.name} on our store!`);

    let shareUrl = '';
    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            window.open(shareUrl, '_blank', 'width=600,height=400');
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
            window.open(shareUrl, '_blank', 'width=600,height=400');
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${text}%20${url}`;
            window.open(shareUrl, '_blank');
            break;
        case 'copy':
            navigator.clipboard.writeText(`${window.location.origin}/product/${product.slug}`);
            toast.success("Link copied to clipboard");
            break;
    }
    setShowShareMenu(false);
  };

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowShareMenu(false);
    if (showShareMenu) {
        window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showShareMenu]);

  const getVariations = () => {
    if (!fullProduct) return {};
    const variations: Record<string, { id: number, name: string }[]> = {};
    
    fullProduct.stocks.forEach(stock => {
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

  const renderStars = () => {
    const rating = fullProduct ? (fullProduct.reviews_avg_rating || 0) : (product?.rating || 0);
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

  if (!isOpen || !product) return null;

  const variations = getVariations();
  const displayImage = selectedImage || product.image;
  // Use priceInfo if available (from full details), otherwise fallback to passed product props
  const displayPrice = priceInfo ? priceInfo.price : product.price;
  const displayOriginalPrice = priceInfo ? priceInfo.originalPrice : product.originalPrice;
  const displayDiscountPercentage = priceInfo ? priceInfo.discountPercentage : product.discountPercentage;
  const inStock = currentStock ? currentStock.quantity > 0 : product.inStock;
  const stockCount = currentStock ? currentStock.quantity : product.stockCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto md:max-h-[600px] animate-in fade-in zoom-in duration-200">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            <div className="relative">
                <button 
                    onClick={handleShare}
                    className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                    title="Share Product"
                >
                    <FiShare2 className="w-5 h-5 text-gray-500" />
                </button>
                
                {/* Fallback Share Menu */}
                {showShareMenu && (
                    <div 
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={() => handleSocialShare('facebook')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700">
                            <FaFacebook className="w-4 h-4 text-[#1877F2]" /> Facebook
                        </button>
                        <button onClick={() => handleSocialShare('twitter')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700">
                            <FaTwitter className="w-4 h-4 text-[#1DA1F2]" /> Twitter
                        </button>
                        <button onClick={() => handleSocialShare('whatsapp')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700">
                            <FaWhatsapp className="w-4 h-4 text-[#25D366]" /> WhatsApp
                        </button>
                         <div className="border-t border-gray-100 my-1"></div>
                        <button onClick={() => handleSocialShare('copy')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700">
                            <FiLink className="w-4 h-4 text-gray-500" /> Copy Link
                        </button>
                    </div>
                )}
            </div>
            
            <button 
                onClick={onClose}
                className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
            >
                <FiX className="w-5 h-5 text-gray-500" />
            </button>
        </div>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-50 p-4 md:p-6 flex flex-col items-center justify-center relative flex-shrink-0">
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
                    <FiLoader className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : null}
          <div className="relative w-full h-48 md:h-auto md:aspect-square max-w-sm mx-auto mb-4">
            <img 
              src={displayImage.startsWith('http') || displayImage.startsWith('/') ? displayImage : `/${displayImage}`}
              alt={product.name} 
              className="w-full h-full object-contain mix-blend-multiply"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/storage/images/products/placeholder.jpg';
              }}
            />
          </div>
          
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 w-full justify-center">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 border-2 rounded-lg overflow-hidden flex-shrink-0 ${
                    selectedImage === img ? 'border-primary' : 'border-transparent hover:border-gray-300'
                  }`}
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

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto relative">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                    <FiLoader className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}
          <div className="mb-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">
              {product.category}
            </span>
            {product.brand && (
              <span className="ml-2 text-xs font-medium text-gray-500">
                {product.brand}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>

          <div className="flex items-center mb-4">
            <div className="flex mr-2">{renderStars()}</div>
            <span className="text-sm text-gray-500">({fullProduct?.reviews_count || product.reviewCount} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">
              ${displayPrice.toFixed(2)}
            </span>
            {displayOriginalPrice && (
              <span className="text-lg text-gray-400 line-through">
                ${displayOriginalPrice.toFixed(2)}
              </span>
            )}
            {displayDiscountPercentage && displayDiscountPercentage > 0 && (
              <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                -{displayDiscountPercentage}%
              </span>
            )}
          </div>

          <div className="prose prose-sm text-gray-600 mb-6 line-clamp-4">
            {fullProduct?.description || product.description || "No description available."}
          </div>

          {/* Variations */}
          {Object.entries(variations).map(([name, options]) => (
            <div key={name} className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">{name}: <span className="text-gray-500 font-normal">{options.find(o => o.id === selectedOptions[name])?.name}</span></h3>
                <div className="flex flex-wrap gap-2">
                    {options.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => handleOptionChange(name, option.id)}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
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

          <div className="flex items-center gap-2 mb-6 mt-4">
            {inStock ? (
              <span className="flex items-center text-green-600 text-sm font-medium">
                <FiCheck className="mr-1.5" /> In Stock ({stockCount} available)
              </span>
            ) : (
              <span className="flex items-center text-red-500 text-sm font-medium">
                <FiAlertCircle className="mr-1.5" /> Out of Stock
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
             {/* Quantity Selector */}
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
                    disabled={!currentStock || quantity >= (currentStock.quantity || 0)}
                >
                    <FiPlus className="w-4 h-4" />
                </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!inStock || loading}
              className={`flex-1 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                inStock && !loading
                  ? 'bg-primary text-white hover:bg-primary-600 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FiShoppingCart className="w-5 h-5" />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
