import React, { useEffect, useState } from 'react';
import { Flame, ArrowUpRight, Star } from 'lucide-react';
import { api } from '@/hooks/api/api';
import { Product, calculateProductPrice } from '@/hooks/api/products';
import { Link } from '@inertiajs/react';

const TrendingOnSite = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await api.get('/products?trending_on_site=true&limit=5&with=all');
        if (response.data.status === 'success') {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch trending products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
     return <div className="py-12 bg-gray-50 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Trending On Site
            </h2>
            <div className="h-1 w-20 bg-primary mt-2 rounded-full" />
            <p className="text-sm text-gray-500 mt-2">Most popular products this week</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {products.map((product, index) => {
            const priceInfo = calculateProductPrice(product.stocks);
            const trend = priceInfo.discountPercentage > 0 ? `-${priceInfo.discountPercentage}%` : null;

            return (
              <Link 
                href={`/product/${product.slug}`}
                key={product.id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden block"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img 
                    src={product.primary_image ? `/${product.primary_image}` : '/storage/images/products/placeholder.jpg'} 
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/storage/images/products/placeholder.jpg';
                    }}
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-bold text-gray-900 flex items-center gap-1">
                    #{index + 1}
                  </div>
                  {trend && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      {trend}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-1">{product.category?.name}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 truncate" title={product.name}>{product.name}</h3>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-amber-500 font-medium">
                      <Star className="w-3 h-3 fill-current" />
                      {product.reviews_avg_rating ? Number(product.reviews_avg_rating).toFixed(1) : '0.0'}
                    </div>
                    <div className="text-gray-500 font-medium">
                      {priceInfo.priceRange || `$${priceInfo.price.toFixed(2)}`}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrendingOnSite;