import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import axios from 'axios';
import { toast } from 'sonner';
import { 
    Search,
    Loader2,
    Pencil,
    Trash2,
    MoreVertical,
    Package,
    ImageIcon,
    DollarSign,
    Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

interface Category {
    id: number;
    name: string;
}

interface Brand {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    primary_image: string;
    category_id: number;
    brand_id: number;
    web_availability: boolean;
    category?: Category;
    brand?: Brand;
}

const ManageProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    
    // Edit form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        brand_id: '',
        web_availability: false
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/products', {
                params: {
                    with: 'product',
                    limit: 1000
                }
            });
            if (response.data.status === 'success') {
                setProducts(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            if (response.data.status === 'success') {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await axios.get('/api/brands');
            if (response.data.status === 'success') {
                setBrands(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const handleEdit = (product: Product) => {
        setCurrentProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            category_id: product.category_id.toString(),
            brand_id: product.brand_id.toString(),
            web_availability: product.web_availability
        });
        setImagePreview(product.primary_image ? '/' + product.primary_image : null);
        setIsEditOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProduct) return;

        setLoading(true);
        try {
            const data = new FormData();
            data.append('id', currentProduct.id.toString());
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('category_id', formData.category_id);
            data.append('brand_id', formData.brand_id);
            data.append('web_availability', formData.web_availability ? '1' : '0');
            
            if (selectedImage) {
                data.append('primary_image', selectedImage);
            }

            const response = await axios.post('/api/products/update', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status === 'success') {
                toast.success('Product updated successfully');
                setIsEditOpen(false);
                fetchProducts();
                resetForm();
            } else {
                toast.error(response.data.message || 'Failed to update product');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId: number) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await axios.delete('/api/products', {
                data: { id: productId }
            });

            if (response.data.status === 'success') {
                toast.success('Product deleted successfully');
                fetchProducts();
            } else {
                toast.error(response.data.errors||response.data.message || 'Failed to delete product');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.errors || 'Failed to delete product');
        }
    };

    const resetForm = () => {
        setCurrentProduct(null);
        setFormData({
            name: '',
            description: '',
            category_id: '',
            brand_id: '',
            web_availability: false
        });
        setImagePreview(null);
        setSelectedImage(null);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SellerLayout>
            <Head title="Manage Products | Seller Center" />
            
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
                        <p className="text-sm text-gray-500">Edit or delete your products</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Search products..." 
                                className="pl-9 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Product</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Brand</th>
                                
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Loading products...
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                            <p className="text-lg font-medium text-gray-900">No products found</p>
                                            <p>{searchQuery ? 'Try a different search term' : 'Create your first product to get started'}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-16 w-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                                        <img 
                                                            src={product.primary_image ? '/' + product.primary_image : 'https://via.placeholder.com/64?text=No+Image'} 
                                                            alt={product.name} 
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Img' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-gray-500 text-xs truncate max-w-xs">{product.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {product.category?.name || 'N/A'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                    {product.brand?.name || 'N/A'}
                                                </Badge>
                                            </td>
                                          
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-white">
                                                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                                                            <Pencil className="w-4 h-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(product.id)}>
                                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-3xl bg-white">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>
                            Update the product details below.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[60vh] overflow-y-auto py-4">
                        <form id="edit-product-form" onSubmit={handleUpdate} className="space-y-6">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="image">Product Image</Label>
                            <div className="flex flex-col gap-2">
                                {imagePreview && (
                                    <div className="w-full h-40 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <Input 
                                    id="image" 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="cursor-pointer bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input 
                                    id="name" 
                                    required
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Product Name"
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea 
                                    id="description" 
                                    value={formData.description} 
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Product description..."
                                    className="h-24 bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select 
                                    value={formData.category_id} 
                                    onValueChange={(val) => setFormData({...formData, category_id: val})}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand</Label>
                                <Select 
                                    value={formData.brand_id} 
                                    onValueChange={(val) => setFormData({...formData, brand_id: val})}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {brands.map(brand => (
                                            <SelectItem key={brand.id} value={brand.id.toString()}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-2 flex items-center space-x-2">
                                <Checkbox 
                                    id="web_availability" 
                                    checked={formData.web_availability}
                                    onCheckedChange={(checked) => setFormData({...formData, web_availability: checked as boolean})}
                                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                />
                                <Label htmlFor="web_availability" className="text-sm font-medium cursor-pointer">
                                    Available on Web Store
                                </Label>
                            </div>
                        </div>
                        </form>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button form="edit-product-form" type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Update Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SellerLayout>
    );
};

export default ManageProducts;
