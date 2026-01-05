import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Nav from '@/components/custom/main/Nav';
import Footer from '@/components/custom/main/Footer';
import { fetchCategories, Category } from '@/hooks/category';
import { ShoppingBag, ArrowRight } from 'lucide-react';

const CategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await fetchCategories();
                if (response.status === 'success') {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error("Failed to load categories", error);
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="All Categories" />
            <Nav />

            <main className="md:pt-8 pt-40  pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
                        <p className="mt-2 text-gray-600">Explore our wide range of product categories</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {categories.map((category) => (
                                <Link
                                    href={`/products?category_ids[]=${category.id}`}
                                    key={category.id}
                                    className="group relative bg-white rounded-2xl p-4 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col"
                                >
                                    <div className="aspect-square mb-4 overflow-hidden rounded-xl bg-gray-100 relative">
                                        <img
                                            src={`/${category.image}`}
                                            alt={category.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                    </div>

                                    <div className="text-center mt-auto">
                                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors text-lg">
                                            {category.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-medium">
                                            {category.products_count} Products
                                        </p>
                                    </div>

                                    <div className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-sm text-gray-400 group-hover:text-primary group-hover:scale-110 transition-all duration-300">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CategoriesPage;
