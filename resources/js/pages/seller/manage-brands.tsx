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
    Tag
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

interface Brand {
    id: number;
    name: string;
}

const ManageBrands = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
    
    // Edit form state
    const [formData, setFormData] = useState({
        name: ''
    });

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/brands');
            if (response.data.status === 'success') {
                setBrands(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch brands', error);
            toast.error('Failed to load brands');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (brand: Brand) => {
        setCurrentBrand(brand);
        setFormData({
            name: brand.name
        });
        setIsEditOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentBrand) return;

        setLoading(true);
        try {
            const response = await axios.put('/api/brands', {
                id: currentBrand.id.toString(),
                name: formData.name
            });

            if (response.data.status === 'success') {
                toast.success('Brand updated successfully');
                setIsEditOpen(false);
                fetchBrands();
                resetForm();
            } else {
                toast.error(response.data.message || 'Failed to update brand');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update brand');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (brandId: number) => {
        if (!confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await axios.delete('/api/brands', {
                data: { id: brandId.toString() }
            });

            if (response.data.status === 'success') {
                toast.success('Brand deleted successfully');
                fetchBrands();
            } else {
                toast.error(response.data.message || 'Failed to delete brand');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete brand');
        }
    };

    const resetForm = () => {
        setCurrentBrand(null);
        setFormData({
            name: ''
        });
    };

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SellerLayout>
            <Head title="Manage Brands | Seller Center" />
            
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Brands</h1>
                        <p className="text-sm text-gray-500">Edit or delete your brands</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Search brands..." 
                                className="pl-9 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Brands Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Brand Name</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Loading brands...
                                        </td>
                                    </tr>
                                ) : filteredBrands.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                            <Tag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                            <p className="text-lg font-medium text-gray-900">No brands found</p>
                                            <p>{searchQuery ? 'Try a different search term' : 'Create your first brand to get started'}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBrands.map((brand) => (
                                        <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500">#{brand.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{brand.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-white">
                                                        <DropdownMenuItem onClick={() => handleEdit(brand)}>
                                                            <Pencil className="w-4 h-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(brand.id)}>
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
                <DialogContent className="max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle>Edit Brand</DialogTitle>
                        <DialogDescription>
                            Update the brand name below.
                        </DialogDescription>
                    </DialogHeader>

                    <form id="edit-brand-form" onSubmit={handleUpdate} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Brand Name</Label>
                            <Input 
                                id="name" 
                                required
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Brand Name"
                                className="bg-white"
                            />
                        </div>
                    </form>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button form="edit-brand-form" type="submit" disabled={loading} className="bg-green-600 text-white hover:bg-green-700">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Update Brand
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SellerLayout>
    );
};

export default ManageBrands;
