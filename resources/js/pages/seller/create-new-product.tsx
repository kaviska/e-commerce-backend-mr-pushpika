import React, { useState, useEffect } from 'react';
import SellerLayout from '../../layouts/SellerLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
    Loader2, 
    Upload, 
    Plus, 
    Image as ImageIcon,
    Check,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

// Types
interface Category {
    id: number;
    name: string;
}

interface Brand {
    id: number;
    name: string;
    slug: string;
}

const CreateNewProduct = () => {
    // State
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        brand_id: '',
        web_availability: false,
        primary_image: [] as File[]
    });

    // Brand Modal State
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
    const [newBrand, setNewBrand] = useState({
        name: '',
        slug: '',
        image: null as File | null
    });
    
    const [primaryImagePreview, setPrimaryImagePreview] = useState<string | null>(null);

    // Fetch Data
    useEffect(() => {
        fetchCategories();
        fetchBrands();
    }, []);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('category_id', formData.category_id);
            data.append('brand_id', formData.brand_id);
            
            if (formData.web_availability) {
                data.append('web_availability', '1');
            }
            
            if (formData.primary_image.length > 0) {
                data.append('primary_image', formData.primary_image[0]);
            }

            const response = await axios.post('/api/add/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status === 'success') {
                toast.success('Product created successfully');
                router.visit('/seller/products/add-existing');
            } else {
                toast.error(response.data.message  || 'Failed to create product');
            }
        } catch (error: any) {
            console.error('Error creating product:', error);
            toast.error(error.response?.data?.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBrand = async () => {
        try {
            const data = new FormData();
            data.append('name', newBrand.name);
            data.append('slug', newBrand.slug);
            if (newBrand.image) {
                data.append('image', newBrand.image);
            }

            const response = await axios.post('/api/brands', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status === 'success') {
                toast.success('Brand created successfully');
                fetchBrands();
                setIsBrandModalOpen(false);
                setNewBrand({ name: '', slug: '', image: null });
            }
        } catch (error: any) {
            toast.error('Failed to create brand');
        }
    };

    // Shared styles matching add-existing-product.tsx
    const inputStyle = "h-12 bg-white shadow-sm border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl";
    const buttonStyle = "bg-green-600 hover:bg-green-700 text-white rounded-lg";

    return (
        <SellerLayout>
            <Head title="Create New Product" />
            
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create New Product</h1>
                    <p className="text-sm text-gray-500 text-lg">Add a new product to the global catalog.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                    
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-base font-medium text-gray-900">Product Name</Label>
                            <Input 
                                id="name"
                                placeholder="e.g. Premium Butter 200g"
                                className={inputStyle}
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-base font-medium text-gray-900">Description</Label>
                            <textarea 
                                id="description"
                                className={`flex min-h-[120px] w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-green-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm`}
                                placeholder="Describe the product..."
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    {/* Category & Brand */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-base font-medium text-gray-900">Category</Label>
                            <Select 
                                value={formData.category_id} 
                                onValueChange={(val) => setFormData({...formData, category_id: val})}
                            >
                                <SelectTrigger className={inputStyle}>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-medium text-gray-900">Brand</Label>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-auto p-0 text-green-600 hover:text-green-700 font-medium"
                                    onClick={() => setIsBrandModalOpen(true)}
                                >
                                    + New Brand
                                </Button>
                            </div>
                            <Select 
                                value={formData.brand_id} 
                                onValueChange={(val) => setFormData({...formData, brand_id: val})}
                            >
                                <SelectTrigger className={inputStyle}>
                                    <SelectValue placeholder="Select Brand" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.id.toString()}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label className="text-base font-medium text-gray-900 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-gray-600" />
                            Primary Image
                        </Label>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setFormData({ ...formData, primary_image: [file] });
                                        setPrimaryImagePreview(URL.createObjectURL(file));
                                    }
                                }}
                                className="cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 h-auto py-2"
                            />
                            {primaryImagePreview && (
                                <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-gray-200">
                                    <img 
                                        src={primaryImagePreview} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white rounded-full transition-colors"
                                        onClick={() => {
                                            setFormData({ ...formData, primary_image: [] });
                                            setPrimaryImagePreview(null);
                                        }}
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <Checkbox 
                            id="web_availability" 
                            checked={formData.web_availability}
                            onCheckedChange={(checked) => setFormData({...formData, web_availability: checked as boolean})}
                            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                        <Label htmlFor="web_availability" className="text-sm font-medium text-gray-700 cursor-pointer">Available on Web Store</Label>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit('/seller/products/add-existing')} className="h-12 px-6 rounded-xl border-gray-200">
                            Cancel
                        </Button>
                        <Button type="submit" className={`${buttonStyle} h-12 px-8 rounded-xl font-medium text-base`} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Create Product
                        </Button>
                    </div>
                </form>
            </div>

            {/* Create Brand Modal */}
            <Dialog open={isBrandModalOpen} onOpenChange={setIsBrandModalOpen}>
                <DialogContent className="bg-white rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Brand</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 bg-white">
                        <div className="space-y-2">
                            <Label>Brand Name</Label>
                            <Input 
                                placeholder="Brand Name"
                                className={inputStyle}
                                value={newBrand.name}
                                onChange={(e) => setNewBrand({...newBrand, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input 
                                placeholder="brand-slug"
                                className={inputStyle}
                                value={newBrand.slug}
                                onChange={(e) => setNewBrand({...newBrand, slug: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Logo</Label>
                            <Input 
                                type="file"
                                className="h-12 pt-2"
                                onChange={(e) => e.target.files && setNewBrand({...newBrand, image: e.target.files[0]})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBrandModalOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleCreateBrand} className={`${buttonStyle} rounded-xl`}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </SellerLayout>
    );
};

export default CreateNewProduct;
