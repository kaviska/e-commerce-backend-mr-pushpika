import React, { useEffect, useState } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { api } from '@/hooks/api/api';
import { Product, calculateProductPrice } from '@/hooks/api/products';
import { Link } from '@inertiajs/react';

const FutureInYourHands = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout configuration for the 4 grid items
  const layoutConfig = [
    { size: "col-span-2 row-span-2", badge: "New Arrival" },
    { size: "col-span-1 row-span-1", badge: "Featured" },
    { size: "col-span-1 row-span-1", badge: null },
    { size: "col-span-2 row-span-1", badge: "Trending" }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products?latest_product=true&limit=4&with=all');
        if (response.data.status === 'success') {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch future products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
     return <div className="py-16 bg-white flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">
                Innovation
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Future In Your Hands
            </h2>
            <div className="h-1 w-20 bg-primary mt-2 rounded-full" />
            <p className="text-gray-500 max-w-lg mt-4">
              Discover the latest tech gadgets and smart devices that are shaping the future of living.
            </p>
          </div>
          <Link href="/products?latest_product=true" className="hidden md:flex items-center px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
            Explore Collection
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {products.slice(0, 4).map((product, index) => {
            const priceInfo = calculateProductPrice(product.stocks);
            const config = layoutConfig[index] || { size: "col-span-1 row-span-1", badge: null };
            
            return (
              <Link 
                href={`/product/${product.slug}`}
                key={product.id}
                className={`group relative overflow-hidden rounded-3xl bg-gray-100 ${config.size} block`}
              >
                <img 
                  src={product.primary_image ? `/${product.primary_image}` : '/storage/images/products/placeholder.jpg'} 
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                      (e.target as HTMLImageElement).src = '/storage/images/products/placeholder.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300" />
                
                <div className="absolute top-4 left-4">
                  {(config.badge || priceInfo.discountPercentage > 0) && (
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30">
                      {priceInfo.discountPercentage > 0 ? `-${priceInfo.discountPercentage}%` : config.badge}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-gray-300 text-sm font-medium mb-1">{product.category?.name}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-white font-medium">
                        {priceInfo.priceRange || `$${priceInfo.price.toFixed(2)}`}
                      </p>
                    </div>
                    <button className="p-3 bg-white text-gray-900 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white transform translate-x-4 group-hover:translate-x-0">
                      <Zap className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <Link href="/products?latest_product=true" className="w-full md:hidden mt-8 flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
          Explore Collection
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default FutureInYourHands;