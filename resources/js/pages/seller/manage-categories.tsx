import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import axios from 'axios';
import { toast } from 'sonner';
import { 
    Search,
    Loader2,
    Pencil,
    Trash2,
    MoreVertical,
    Layers,
    ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Category {
    id: number;
    name: string;
    slug: string;
    image: string;
}

const ManageCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    
    // Edit form state
    const [formData, setFormData] = useState({
        name: '',
        slug: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/categories');
            if (response.data.status === 'success') {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category: Category) => {
        setCurrentCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug
        });
        setImagePreview(category.image ? '/' + category.image : null);
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
        if (!currentCategory) return;

        setLoading(true);
        try {
            const data = new FormData();
            data.append('id', currentCategory.id.toString());
            data.append('name', formData.name);
            data.append('slug', formData.slug);
            
            if (selectedImage) {
                data.append('image', selectedImage);
            }

            const response = await axios.post('/api/categories/update', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status === 'success') {
                toast.success('Category updated successfully');
                setIsEditOpen(false);
                fetchCategories();
                resetForm();
            } else {
                toast.error(response.data.message || 'Failed to update category');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update category');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (categoryId: number) => {
        if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await axios.delete('/api/categories', {
                data: { id: categoryId }
            });

            if (response.data.status === 'success') {
                toast.success('Category deleted successfully');
                fetchCategories();
            } else {
                toast.error(response.data.errors || 'Failed to delete category');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.errors || 'Failed to delete category');
        }
    };

    const resetForm = () => {
        setCurrentCategory(null);
        setFormData({
            name: '',
            slug: ''
        });
        setImagePreview(null);
        setSelectedImage(null);
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SellerLayout>
            <Head title="Manage Categories | Seller Center" />
            
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
                        <p className="text-sm text-gray-500">Edit or delete your categories</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Search categories..." 
                                className="pl-9 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Categories Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Slug</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Loading categories...
                                        </td>
                                    </tr>
                                ) : filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                            <Layers className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                            <p className="text-lg font-medium text-gray-900">No categories found</p>
                                            <p>{searchQuery ? 'Try a different search term' : 'Create your first category to get started'}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((category) => (
                                        <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-16 w-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                                        <img 
                                                            src={category.image ? '/' + category.image : 'https://via.placeholder.com/64?text=No+Image'} 
                                                            alt={category.name} 
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Img' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{category.name}</div>
                                                        <div className="text-xs text-gray-500">ID: {category.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                    {category.slug}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-white">
                                                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                                                            <Pencil className="w-4 h-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(category.id)}>
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
                <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update the category details below.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[60vh] overflow-y-auto py-4">
                        <form id="edit-category-form" onSubmit={handleUpdate} className="space-y-6">
                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="image">Category Image</Label>
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
                                    <Label htmlFor="name">Category Name</Label>
                                    <Input 
                                        id="name" 
                                        required
                                        value={formData.name} 
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="Category Name"
                                        className="bg-white"
                                    />
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input 
                                        id="slug" 
                                        required
                                        value={formData.slug} 
                                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                        placeholder="category-slug"
                                        className="bg-white"
                                    />
                                    <p className="text-xs text-gray-500">
                                        URL-friendly version of the name (e.g., "my-category")
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button form="edit-category-form" type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Update Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SellerLayout>
    );
};

export default ManageCategories;
