import React, { useState, useEffect } from 'react';
import SellerLayout from '../../layouts/SellerLayout';
import { Head } from '@inertiajs/react';
import { toast } from 'sonner';
import { getCategories, createCategory } from '@/hooks/api/seller';
import { 
    Search, 
    Plus, 
    Loader2, 
    Layers,
    Image as ImageIcon
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

// Types
interface Category {
    id: number;
    name: string;
    slug: string;
    image?: string;
}

const AddCategory = () => {
    // State
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    // New Category Form
    const [newCategory, setNewCategory] = useState({
        name: '',
        slug: '',
        image: null as File | null
    });

    // Fetch Data
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            if (data.status === 'success') {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    // Filter categories based on search
    const filteredCategories = categories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        category.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handlers
    const handleCreateCategory = async () => {
        setIsCreating(true);
        try {
            const formData = new FormData();
            formData.append('name', newCategory.name);
            formData.append('slug', newCategory.slug);
            if (newCategory.image) {
                formData.append('image', newCategory.image);
            }

            const data = await createCategory(formData);

            if (data.status === 'success') {
                toast.success('Category created successfully');
                fetchCategories();
                setIsCategoryModalOpen(false);
                setNewCategory({ name: '', slug: '', image: null });
            } else {
                // Handle error response from API
                let errorMessage = 'Failed to create category';
                if (typeof data.errors === 'string') {
                    errorMessage = data.errors;
                } else if (typeof data.errors === 'object' && data.errors !== null) {
                    // Extract first error message from validation errors object
                    const firstError = Object.values(data.errors)[0];
                    errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                } else if (data.message) {
                    errorMessage = data.message;
                }
                toast.error(errorMessage);
            }
        } catch (error: any) {
            // Handle network or unexpected errors
            let errorMessage = 'Failed to create category';
            const errorData = error.response?.data?.errors;
            
            if (typeof errorData === 'string') {
                errorMessage = errorData;
            } else if (typeof errorData === 'object' && errorData !== null) {
                // Extract first error message from validation errors object
                const firstError = Object.values(errorData)[0];
                errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <SellerLayout>
            <Head title="Manage Categories" />
            
            <div className="space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Categories</h1>
                        <p className="text-gray-500 mt-1">Manage product categories or create new ones.</p>
                    </div>
                     <Button 
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Category
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-2xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                        placeholder="Search categories..." 
                        className="pl-11 h-12 text-lg bg-white shadow-sm border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Categories Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
                        <p className="text-gray-500">Loading categories...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredCategories.map((category) => (
                            <div 
                                key={category.id} 
                                className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex items-center gap-4"
                            >
                                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                     {category.image ? (
                                        <img src={`/${category.image}`} alt={category.name} className="h-full w-full object-cover" />
                                     ) : (
                                        <Layers className="h-6 w-6 text-gray-400" />
                                     )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">
                                        {category.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 truncate">{category.slug}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredCategories.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No categories found</h3>
                        <p className="text-gray-500 mt-1">Try searching for something else or create a new category.</p>
                    </div>
                )}
            </div>

            {/* Create Category Modal */}
            <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Create Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 bg-white">
                        <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input 
                                placeholder="Category Name"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input 
                                placeholder="category-slug"
                                value={newCategory.slug}
                                onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Image</Label>
                            <Input 
                                type="file"
                                onChange={(e) => e.target.files && setNewCategory({...newCategory, image: e.target.files[0]})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)} disabled={isCreating}>Cancel</Button>
                        <Button onClick={handleCreateCategory} className="bg-green-600 hover:bg-green-700 text-white" disabled={isCreating}>
                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </SellerLayout>
    );
};

export default AddCategory;
