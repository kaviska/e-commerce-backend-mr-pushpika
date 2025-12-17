import React, { useState, useEffect } from 'react';
import Nav from '../components/custom/main/Nav';
import Footer from '../components/custom/main/Footer';
import ProductCard from '../components/custom/ProductCard';
import Slider from '../components/ui/slider';
import QuickViewModal from '../components/custom/QuickViewModal';
import { FiFilter, FiChevronDown, FiGrid, FiList, FiX, FiLoader, FiCheck } from 'react-icons/fi';
import { getProducts, getCategories, getBrands, calculateProductPrice, Product as ApiProduct, Category, Brand } from '../hooks/api/products';
import { toast } from 'sonner';

const Product = () => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Quick View State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  // Filter Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Filter State
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<{min?: number, max?: number}>({});
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);

  // Load initial data and parse URL params
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catData, brandData] = await Promise.all([
          getCategories(),
          getBrands()
        ]);
        
        if (catData.status === 'success') setCategories(catData.data);
        if (brandData.status === 'success') setBrands(brandData.data);

        // Parse URL params
        const params = new URLSearchParams(window.location.search);
        
        const catIds = params.getAll('category_ids[]').map(Number);
        if (catIds.length) setSelectedCategories(catIds);

        const brandIds = params.getAll('brand_ids[]').map(Number);
        if (brandIds.length) setSelectedBrands(brandIds);

        const min = params.get('web_price_min');
        const max = params.get('web_price_max');
        if (min || max) setPriceRange({ min: min ? Number(min) : undefined, max: max ? Number(max) : undefined });

        if (params.get('in_stock') === '1') setInStock(true);
        if (params.get('has_web_discount') === '1') setOnSale(true);

      } catch (error) {
        console.error("Error loading filter data:", error);
      }
    };

    loadData();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Update URL
        const params = new URLSearchParams();
        selectedCategories.forEach(id => params.append('category_ids[]', id.toString()));
        selectedBrands.forEach(id => params.append('brand_ids[]', id.toString()));
        if (priceRange.min) params.append('web_price_min', priceRange.min.toString());
        if (priceRange.max) params.append('web_price_max', priceRange.max.toString());
        if (inStock) params.append('in_stock', '1');
        if (onSale) params.append('has_web_discount', '1');

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);

        const response = await getProducts({
          category_ids: selectedCategories,
          brand_ids: selectedBrands,
          web_price_min: priceRange.min,
          web_price_max: priceRange.max,
          in_stock: inStock,
          has_web_discount: onSale
        });

        if (response.status === 'success') {
          setProducts(response.data);
        } else {
          toast.error('Failed to load products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('An error occurred while loading products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategories, selectedBrands, priceRange, inStock, onSale]);

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleBrand = (id: number) => {
    setSelectedBrands(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({});
    setInStock(false);
    setOnSale(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Nav />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumbs & Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span className="hover:text-primary cursor-pointer">Home</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">All Products</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
              <p className="text-gray-500 mt-1">
                {loading ? 'Loading products...' : `Showing ${products.length} products`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                className="md:hidden flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <FiFilter className="mr-2" />
                Filters
              </button>
              
              <div className="hidden md:flex bg-white border border-gray-200 rounded-lg p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
            
            {/* Active Filters Summary */}
            {(selectedCategories.length > 0 || selectedBrands.length > 0 || inStock || onSale) && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-gray-900">Active Filters</h3>
                        <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear All</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {inStock && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">In Stock</span>}
                        {onSale && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">On Sale</span>}
                        {selectedCategories.length > 0 && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{selectedCategories.length} Categories</span>}
                        {selectedBrands.length > 0 && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{selectedBrands.length} Brands</span>}
                    </div>
                </div>
            )}

            {/* Categories */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center group cursor-pointer">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(category.id) ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}>
                        {selectedCategories.includes(category.id) && <FiCheck className="w-3 h-3 text-white" />}
                    </div>
                    <input 
                        type="checkbox" 
                        className="hidden"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                    />
                    <span className={`ml-3 text-sm transition-colors ${selectedCategories.includes(category.id) ? 'text-primary font-medium' : 'text-gray-600 group-hover:text-primary'}`}>
                        {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            {/* Price Range */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Price Range</h3>
                <span className="text-sm text-gray-500">
                    ${priceRange.min ?? 0} - ${priceRange.max ?? 5000}
                </span>
              </div>
              <div className="px-2">
                <Slider
                    min={0}
                    max={5000}
                    step={10}
                    value={[priceRange.min ?? 0, priceRange.max ?? 5000]}
                    onValueChange={([min, max]) => setPriceRange({ min, max })}
                />
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            {/* Status Filters */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Status</h3>
                <div className="space-y-3">
                    <label className="flex items-center group cursor-pointer">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${inStock ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}>
                            {inStock && <FiCheck className="w-3 h-3 text-white" />}
                        </div>
                        <input 
                            type="checkbox" 
                            className="hidden"
                            checked={inStock}
                            onChange={() => setInStock(!inStock)}
                        />
                        <span className="ml-3 text-sm text-gray-600 group-hover:text-primary">In Stock Only</span>
                    </label>
                    <label className="flex items-center group cursor-pointer">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${onSale ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}>
                            {onSale && <FiCheck className="w-3 h-3 text-white" />}
                        </div>
                        <input 
                            type="checkbox" 
                            className="hidden"
                            checked={onSale}
                            onChange={() => setOnSale(!onSale)}
                        />
                        <span className="ml-3 text-sm text-gray-600 group-hover:text-primary">On Sale</span>
                    </label>
                </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            {/* Brands */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Brands</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {brands.map((brand) => (
                  <label key={brand.id} className="flex items-center group cursor-pointer">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedBrands.includes(brand.id) ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}>
                        {selectedBrands.includes(brand.id) && <FiCheck className="w-3 h-3 text-white" />}
                    </div>
                    <input 
                        type="checkbox" 
                        className="hidden"
                        checked={selectedBrands.includes(brand.id)}
                        onChange={() => toggleBrand(brand.id)}
                    />
                    <span className={`ml-3 text-sm transition-colors ${selectedBrands.includes(brand.id) ? 'text-primary font-medium' : 'text-gray-600 group-hover:text-primary'}`}>
                        {brand.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Active Filters Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategories.map(id => {
                  const cat = categories.find(c => c.id === id);
                  return cat ? (
                    <span key={id} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700">
                        {cat.name}
                        <button onClick={() => toggleCategory(id)} className="ml-2 hover:text-red-500"><FiX className="w-3 h-3" /></button>
                    </span>
                  ) : null;
              })}
              {selectedBrands.map(id => {
                  const brand = brands.find(b => b.id === id);
                  return brand ? (
                    <span key={id} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700">
                        {brand.name}
                        <button onClick={() => toggleBrand(id)} className="ml-2 hover:text-red-500"><FiX className="w-3 h-3" /></button>
                    </span>
                  ) : null;
              })}
              {inStock && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700">
                      In Stock
                      <button onClick={() => setInStock(false)} className="ml-2 hover:text-red-500"><FiX className="w-3 h-3" /></button>
                  </span>
              )}
              {onSale && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700">
                      On Sale
                      <button onClick={() => setOnSale(false)} className="ml-2 hover:text-red-500"><FiX className="w-3 h-3" /></button>
                  </span>
              )}
              {(selectedCategories.length > 0 || selectedBrands.length > 0 || inStock || onSale) && (
                <button onClick={clearFilters} className="text-sm text-primary hover:underline ml-2">Clear All</button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <FiLoader className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'} gap-4`}>
                {products.map((product) => {
                  const priceInfo = calculateProductPrice(product.stocks);
                  
                  // Map API product to ProductCard props
                  const cardProduct = {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    image: product.primary_image || "https://via.placeholder.com/300", // Fallback image
                    images: [product.primary_image], // We could add more images if available
                    price: priceInfo.price,
                    originalPrice: priceInfo.originalPrice,
                    rating: product.reviews_avg_rating || 0,
                    reviewCount: product.reviews_count || 0,
                    category: product.category?.name || 'Uncategorized',
                    brand: product.brand?.name,
                    inStock: priceInfo.inStock,
                    stockCount: priceInfo.stockCount,
                    isOnSale: (priceInfo.discount || 0) > 0,
                    isBestSeller: false, // Not in API
                    isNew: false, // Not in API
                    freeShipping: false, // Not in API
                    description: product.description,
                    discount: priceInfo.discount,
                    discountPercentage: priceInfo.discountPercentage,
                    priceRange: priceInfo.priceRange,
                    originalPriceRange: priceInfo.originalPriceRange
                  };

                  return (
                    <ProductCard 
                      key={product.id} 
                      product={cardProduct} 
                      variant={viewMode === 'grid' ? 'compact' : 'detailed'}
                      onQuickView={() => {
                        setSelectedProduct(cardProduct);
                        setIsQuickViewOpen(true);
                      }}
                    />
                  );
                })}
              </div>
            )}
            
            {!loading && products.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No products found matching your filters.</p>
                    <button onClick={clearFilters} className="mt-4 text-primary hover:underline font-medium">Clear Filters</button>
                </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Slide-over */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            {/* Mobile Filter Content */}
            <div className="space-y-8">
              {/* Categories */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                      />
                      <span className="ml-3 text-gray-600">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Status</h3>
                <div className="space-y-2">
                    <label className="flex items-center group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={inStock}
                        onChange={() => setInStock(!inStock)}
                      />
                      <span className="ml-3 text-gray-600">In Stock Only</span>
                    </label>
                    <label className="flex items-center group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={onSale}
                        onChange={() => setOnSale(!onSale)}
                      />
                      <span className="ml-3 text-gray-600">On Sale</span>
                    </label>
                </div>
              </div>
              
              {/* Brands */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Brands</h3>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <label key={brand.id} className="flex items-center group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedBrands.includes(brand.id)}
                        onChange={() => toggleBrand(brand.id)}
                      />
                      <span className="ml-3 text-gray-600">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button 
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal 
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={selectedProduct}
        onAddToCart={(id) => {
            toast.success(`Added product ${id} to cart`);
            setIsQuickViewOpen(false);
        }}
      />

      <Footer />
    </div>
  );
};

export default Product;
