import React, { useEffect, useState } from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { fetchCategories, Category } from '@/hooks/category';
import { Link } from '@inertiajs/react';

const TodayCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        if (response.status === 'success') {
            // Take only first 6 categories for the home page
            setCategories(response.data.slice(0, 6));
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
      return (
        <section className="py-12 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-8">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse hidden md:block"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        </section>
      );
  }

  return (
    <section className="py-12 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Shop by Category
            </h2>
            <div className="h-1 w-20 bg-primary mt-2 rounded-full" />
          </div>
          <Link href="/categories" className="hidden md:flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors group">
            View All Categories
            <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link 
              href={`/categories/${category.slug}`}
              key={category.id}
              className="group relative bg-white rounded-2xl p-4 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 cursor-pointer overflow-hidden"
            >
              <div className="aspect-square mb-4 overflow-hidden rounded-xl bg-gray-100">
                <img 
                  src={`/${category.image}`} 
                  alt={category.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                  }}
                />
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors truncate">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {category.products_count} items
                </p>
              </div>

              <div className={`absolute top-4 right-4 p-2 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300`}>
                <ShoppingBag className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

        <Link href="/categories" className="w-full md:hidden mt-8 flex items-center justify-center px-6 py-3 border border-gray-200 rounded-full text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
          View All Categories
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default TodayCategories;