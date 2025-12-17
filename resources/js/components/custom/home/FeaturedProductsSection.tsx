import React, { useEffect, useState } from 'react';
import ProductCardSlider from './ProductCardSlider';
import { api } from '@/hooks/api/api';
import { Product, calculateProductPrice } from '@/hooks/api/products';

const FeaturedProductsSection = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/products?featured=true&limit=10&with=all');
        if (response.data.status === 'success') {
          // Map API products to the format expected by ProductCardSlider
          const mappedProducts = response.data.data.map((product: Product) => {
             const priceInfo = calculateProductPrice(product.stocks);
             
             return {
               id: product.id,
               name: product.name,
               slug: product.slug, // Ensure slug is passed if needed by card
               image: product.primary_image ? `/${product.primary_image}` : '/storage/images/products/placeholder.jpg',
               images: [product.primary_image ? `/${product.primary_image}` : '/storage/images/products/placeholder.jpg'],
               price: priceInfo.price,
               originalPrice: priceInfo.originalPrice,
               rating: product.reviews_avg_rating ? Number(product.reviews_avg_rating) : 0,
               reviewCount: product.reviews_count || 0,
               category: product.category?.name || 'Uncategorized',
               brand: product.brand?.name || '',
               inStock: priceInfo.inStock,
               stockCount: priceInfo.stockCount,
               isOnSale: (priceInfo.discount || 0) > 0,
               isBestSeller: false,
               freeShipping: false,
               description: product.description,
               features: [] // API doesn't have features list yet
             };
          });
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  // Handle product interactions
  const handleAddToCart = (productId: number) => {
    console.log('Added to cart:', productId);
  };

  const handleAddToWishlist = (productId: number) => {
    console.log('Added to wishlist:', productId);
  };

  const handleQuickView = (productId: number) => {
    console.log('Quick view:', productId);
  };

  if (loading) return null; // Or a skeleton loader
  if (products.length === 0) return null;

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCardSlider
          title="Featured Products"
          subtitle="Top rated products loved by our customers"
          products={products}
          slidesToShow={4}
          autoplay={true}
          autoplayInterval={5000}
          variant="default"
          containerClassName="bg-transparent"
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
          onQuickView={handleQuickView}
        />
      </div>
    </div>
  );
};

export default FeaturedProductsSection;