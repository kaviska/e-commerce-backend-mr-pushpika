import React, { useState, useEffect } from 'react';
import SellerLayout from '../../layouts/SellerLayout';
import { Head } from '@inertiajs/react';
import { toast } from 'sonner';
import { getProducts, getVariationOptions, getVariations, getBrands, getCategories, createBrand } from '@/hooks/api/seller';
import { 
    Search, 
    Plus, 
    Filter, 
    Loader2, 
    Package,
    Tag,
    Layers,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import StockModal from '@/components/custom/StockModal';
import VariationModal from '@/components/custom/VariationModal';

// Types
interface Product {
    id: number;
    name: string;
    slug: string;
    primary_image: string;
    category: {
        id: number;
        name: string;
    };
    brand: {
        id: number;
        name: string;
    };
    web_price?: number;
    description?: string;
    stocks?: {
        id: number;
        web_price: string;
        web_discount: string;
    }[];
}

interface VariationOption {
    id: number;
    name: string;
    variation_id: number;
    variation?: string; // variation name (for flat structure)
}

interface GroupedVariation {
    variation_id: number;
    variation_name: string;
    options: {
        id: number;
        name: string;
        variation_id: number;
    }[];
}

interface Brand {
    id: number;
    name: string;
    slug: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

const AddExistingProduct = () => {
    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreatingBrand, setIsCreatingBrand] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    
    // Variation & Brand Data
    const [groupedVariations, setGroupedVariations] = useState<GroupedVariation[]>([]);
    const [variations, setVariations] = useState<{id: number, name: string}[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Modals State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

    // New Brand Form
    const [newBrand, setNewBrand] = useState({
        name: '',
        slug: '',
        image: null as File | null
    });

    // Fetch Data
    useEffect(() => {
        fetchProducts();
        fetchVariationOptions();
        fetchVariations();
        fetchBrands();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        setIsSearching(true);
        setLoading(true);
        try {
            const data = await getProducts(searchQuery);
            if (data.status === 'success') {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    };

    const fetchVariationOptions = async () => {
        try {
            const data = await getVariationOptions(true); // Request grouped data
            if (data.status === 'success') {
                setGroupedVariations(data.data);
            }
        } catch (error) {
            console.error('Error fetching variations:', error);
        }
    };

    const fetchVariations = async () => {
        try {
            const data = await getVariations();
            if (data.status === 'success') {
                setVariations(data.data);
            }
        } catch (error) {
            console.error('Error fetching parent variations:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const data = await getBrands();
            if (data.status === 'success') {
                setBrands(data.data);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            if (data.status === 'success') {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const getPriceRange = (product: Product): string => {
        if (!product.stocks || product.stocks.length === 0) {
            return 'LKR 0.00';
        }

        const finalPrices = product.stocks.map(stock => {
            const price = parseFloat(stock.web_price);
            const discount = parseFloat(stock.web_discount);
            return price - discount;
        });

        const minPrice = Math.min(...finalPrices);
        const maxPrice = Math.max(...finalPrices);

        if (minPrice === maxPrice) {
            return `LKR ${minPrice.toFixed(2)}`;
        }

        return `LKR ${minPrice.toFixed(2)} - LKR ${maxPrice.toFixed(2)}`;
    };

    // Handlers
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProducts();
    };

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleCreateBrand = async () => {
        setIsCreatingBrand(true);
        try {
            const formData = new FormData();
            formData.append('name', newBrand.name);
            formData.append('slug', newBrand.slug);
            if (newBrand.image) {
                formData.append('image', newBrand.image);
            }

            const data = await createBrand(formData);

            if (data.status === 'success') {
                toast.success('Brand created successfully');
                fetchBrands();
                setIsBrandModalOpen(false);
                setNewBrand({ name: '', slug: '', image: null });
            }
        } catch (error: any) {
            toast.error('Failed to create brand');
        } finally {
            setIsCreatingBrand(false);
        }
    };

    return (
        <SellerLayout>
            <Head title="Add Existing Product" />
            
            <div className="space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Product Catalog</h1>
                        <p className="text-gray-500 mt-1">Browse the global catalog and add products to your inventory.</p>
                    </div>
                    {/* Optional: Add filters or other actions here */}
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative max-w-2xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                        placeholder="Search by product name, brand, or category..." 
                        className="pl-11 h-12 text-lg bg-white shadow-sm border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-2 flex items-center">
                        <Button 
                            type="submit"
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4"
                            disabled={isSearching}
                        >
                            {isSearching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Search
                        </Button>
                    </div>
                </form>

                {/* Product Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
                        <p className="text-gray-500">Loading products...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div 
                                key={product.id} 
                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full"
                            >
                                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                                    <img 
                                        src={`/${product.primary_image}`} 
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/400?text=No+Image';
                                        }}
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm shadow-sm">
                                            {product.category?.name || 'Uncategorized'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="mb-3">
                                        <h3 className="font-bold text-gray-900 line-clamp-1 text-lg group-hover:text-green-600 transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-medium">{product.brand?.name}</p>
                                    </div>
                                    
                                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <div className="text-sm">
                                            <span className="text-gray-400">Price Range:</span>
                                            <span className="ml-1 font-semibold text-gray-900">{getPriceRange(product)}</span>
                                        </div>
                                        <Button 
                                            size="sm"
                                            className="bg-gray-900 text-white hover:bg-green-600 transition-colors rounded-lg"
                                            onClick={() => handleSelectProduct(product)}
                                        >
                                            Select
                                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && products.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search terms or check back later.</p>
                    </div>
                )}
            </div>

            {/* Edit Product & Add Stock Modal */}
            <StockModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                product={selectedProduct}
                onSuccess={() => {
                    fetchVariationOptions(); // Refresh variations after success
                }}
                setIsVariationModalOpen={setIsVariationModalOpen}
                setIsBrandModalOpen={setIsBrandModalOpen}
                groupedVariations={groupedVariations}
                brands={brands}
                categories={categories}
                isNew={false}
            />

            {/* Create Variation Modal */}
            <VariationModal 
                isOpen={isVariationModalOpen}
                onClose={() => setIsVariationModalOpen(false)}
                variations={variations}
                onSuccess={() => {
                    fetchVariationOptions();
                    fetchVariations();
                }}
            />

            {/* Create Brand Modal */}
            <Dialog open={isBrandModalOpen} onOpenChange={setIsBrandModalOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Create Brand</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 bg-white">
                        <div className="space-y-2">
                            <Label>Brand Name</Label>
                            <Input 
                                placeholder="Brand Name"
                                value={newBrand.name}
                                onChange={(e) => setNewBrand({...newBrand, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input 
                                placeholder="brand-slug"
                                value={newBrand.slug}
                                onChange={(e) => setNewBrand({...newBrand, slug: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Logo</Label>
                            <Input 
                                type="file"
                                onChange={(e) => e.target.files && setNewBrand({...newBrand, image: e.target.files[0]})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBrandModalOpen(false)} disabled={isCreatingBrand}>Cancel</Button>
                        <Button onClick={handleCreateBrand} disabled={isCreatingBrand}>
                            {isCreatingBrand && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </SellerLayout>
    );
};

export default AddExistingProduct;
