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
    Plus,
    Layers
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

interface Variation {
    id: number;
    name: string;
}

const ManageVariations = () => {
    const [variations, setVariations] = useState<Variation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentVariation, setCurrentVariation] = useState<Variation | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: ''
    });

    useEffect(() => {
        fetchVariations();
    }, []);

    const fetchVariations = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/variations');
            if (response.data.status === 'success') {
                setVariations(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch variations', error);
            toast.error('Failed to load variations');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Variation name is required');
            return;
        }

        setIsCreating(true);
        try {
            const response = await axios.post('/api/variations', {
                name: formData.name
            });

            if (response.data.status === 'success') {
                toast.success('Variation created successfully');
                setIsCreateOpen(false);
                fetchVariations();
                resetForm();
            } else {
                toast.error(response.data.message || 'Failed to create variation');
            }
        } catch (error: any) {
            console.error('Create error:', error);
            const errorMessage = error.response?.data?.errors?.name?.[0] || 
                               error.response?.data?.message || 
                               'Failed to create variation';
            toast.error(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    const handleEdit = (variation: Variation) => {
        setCurrentVariation(variation);
        setFormData({
            name: variation.name
        });
        setIsEditOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentVariation) return;

        setIsUpdating(true);
        try {
            const response = await axios.put('/api/variations', {
                id: currentVariation.id.toString(),
                name: formData.name
            });

            if (response.data.status === 'success') {
                toast.success('Variation updated successfully');
                setIsEditOpen(false);
                fetchVariations();
                resetForm();
            } else {
                toast.error(response.data.message || 'Failed to update variation');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            const errorMessage = error.response?.data?.errors?.name?.[0] || 
                               error.response?.data?.message || 
                               'Failed to update variation';
            toast.error(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (variationId: number) => {
        if (!confirm('Are you sure you want to delete this variation? This action cannot be undone.')) {
            return;
        }

        setDeletingId(variationId);
        try {
            const response = await axios.delete('/api/variations', {
                data: { id: variationId.toString() }
            });

            if (response.data.status === 'success') {
                toast.success('Variation deleted successfully');
                fetchVariations();
            } else {
                toast.error(response.data.message || 'Failed to delete variation');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            const errorMessage = error.response?.data?.errors || 
                               error.response?.data?.message || 
                               'Failed to delete variation';
            toast.error(errorMessage);
        } finally {
            setDeletingId(null);
        }
    };

    const resetForm = () => {
        setCurrentVariation(null);
        setFormData({
            name: ''
        });
    };

    const filteredVariations = variations.filter(variation =>
        variation.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SellerLayout>
            <Head title="Manage Variations | Seller Center" />
            
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Variations</h1>
                        <p className="text-sm text-gray-500">Create and manage product variations (e.g., Size, Color, Material)</p>
                    </div>
                    <Button 
                        onClick={() => {
                            resetForm();
                            setIsCreateOpen(true);
                        }}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Variation
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Search variations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Variations List */}
                <div className="bg-white rounded-lg border shadow-sm">
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : filteredVariations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <Layers className="w-12 h-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {searchQuery ? 'No variations found' : 'No variations yet'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                {searchQuery 
                                    ? 'Try adjusting your search terms' 
                                    : 'Get started by creating your first variation'}
                            </p>
                            {!searchQuery && (
                                <Button 
                                    onClick={() => {
                                        resetForm();
                                        setIsCreateOpen(true);
                                    }}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Variation
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Variation Name
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredVariations.map((variation) => (
                                        <tr key={variation.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Layers className="w-5 h-5 text-gray-400 mr-3" />
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {variation.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEdit(variation)}
                                                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(variation.id)}
                                                        disabled={deletingId === variation.id}
                                                        className="text-red-600 hover:text-red-900 hover:bg-red-50"
                                                    >
                                                        {deletingId === variation.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Variation</DialogTitle>
                        <DialogDescription>
                            Add a new product variation like Size, Color, Material, etc.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-name">
                                    Variation Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="create-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ name: e.target.value })}
                                    placeholder="e.g., Size, Color, Material"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsCreateOpen(false);
                                    resetForm();
                                }}
                                disabled={isCreating}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create Variation
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Variation</DialogTitle>
                        <DialogDescription>
                            Update the variation name
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">
                                    Variation Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ name: e.target.value })}
                                    placeholder="e.g., Size, Color, Material"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditOpen(false);
                                    resetForm();
                                }}
                                disabled={isUpdating}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Update Variation
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </SellerLayout>
    );
};

export default ManageVariations;
