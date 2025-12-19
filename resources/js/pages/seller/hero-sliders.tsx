import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import SellerSidebar from '@/components/seller/SellerSidebar';
import {
    Image as ImageIcon,
    Trash2,
    Plus,
    Upload,
    X,
    AlertCircle,
    Edit,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Alert,
    AlertDescription,
} from "@/components/ui/alert";
import axios from 'axios';

interface HeroSlider {
    id: number;
    image: string;
    heading: string | null;
    sub_heading: string | null;
    created_at: string;
    updated_at: string;
}

interface ApiResponse {
    status: string;
    message: string;
    data?: HeroSlider[];
}

const HeroSliders = () => {
    const [sliders, setSliders] = useState<HeroSlider[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSlider, setEditingSlider] = useState<HeroSlider | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        heading: '',
        sub_heading: '',
        image: null as File | null,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch sliders
    const fetchSliders = async () => {
        try {
            setLoading(true);
            const response = await axios.get<ApiResponse>('/api/hero-sliders');
            if (response.data.status === 'success' && response.data.data) {
                setSliders(response.data.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch hero sliders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSliders();
    }, []);

    // Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Open dialog for creating new slider
    const handleOpenCreateDialog = () => {
        setEditingSlider(null);
        setFormData({ heading: '', sub_heading: '', image: null });
        setImagePreview(null);
        setIsDialogOpen(true);
    };

    // Open dialog for editing existing slider
    const handleOpenEditDialog = (slider: HeroSlider) => {
        setEditingSlider(slider);
        setFormData({
            heading: slider.heading || '',
            sub_heading: slider.sub_heading || '',
            image: null,
        });
        setImagePreview(`/storage/${slider.image}`);
        setIsDialogOpen(true);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!formData.image && !editingSlider) {
            setError('Please select an image');
            return;
        }

        setSubmitting(true);

        try {
            const submitData = new FormData();
            if (formData.image) submitData.append('image', formData.image);
            if (formData.heading) submitData.append('heading', formData.heading);
            if (formData.sub_heading) submitData.append('sub_heading', formData.sub_heading);

            let response;
            if (editingSlider) {
                // Update existing slider
                response = await axios.post(`/api/hero-sliders/update?id=${editingSlider.id}`, submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setSuccess('Hero slider updated successfully');
            } else {
                // Create new slider
                response = await axios.post('/api/hero-sliders', submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setSuccess('Hero slider created successfully');
            }

            if (response.data.status === 'success') {
                setFormData({ heading: '', sub_heading: '', image: null });
                setImagePreview(null);
                setEditingSlider(null);
                setIsDialogOpen(false);
                fetchSliders();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${editingSlider ? 'update' : 'create'} hero slider`);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this hero slider?')) {
            return;
        }

        setDeletingId(id);
        try {
            const response = await axios.delete(`/api/hero-sliders/${id}`);
            if (response.data.status === 'success') {
                setSuccess('Hero slider deleted successfully');
                fetchSliders();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete hero slider');
        } finally {
            setDeletingId(null);
        }
    };

    // Clear messages after 3 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccess(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    return (
        <>
            <Head title="Hero Sliders" />
            <div className="flex h-screen bg-gray-50">
                <SellerSidebar className="w-64 flex-shrink-0" />

                <div className="flex-1 overflow-auto">
                    <div className="p-8">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Hero Sliders</h1>
                                <p className="text-gray-600 mt-1">Manage your homepage hero sliders</p>
                            </div>

                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button 
                                        onClick={handleOpenCreateDialog}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add New Slider
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl bg-white">
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingSlider ? 'Edit Hero Slider' : 'Add New Hero Slider'}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {editingSlider 
                                                ? 'Update the hero slider details' 
                                                : 'Upload an image and add optional heading text'}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Image Upload */}
                                        <div className="space-y-2">
                                            <Label htmlFor="image">
                                                Image {!editingSlider && '*'}
                                            </Label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                {imagePreview ? (
                                                    <div className="relative">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            className="max-h-64 mx-auto rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setImagePreview(null);
                                                                setFormData({ ...formData, image: null });
                                                            }}
                                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                                        <label htmlFor="image" className="cursor-pointer">
                                                            <span className="text-green-600 hover:text-green-700 font-medium">
                                                                Click to upload
                                                            </span>
                                                            <span className="text-gray-500"> or drag and drop</span>
                                                        </label>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            PNG, JPG, GIF up to 2MB
                                                        </p>
                                                    </div>
                                                )}
                                                <input
                                                    id="image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                            </div>
                                        </div>

                                        {/* Heading */}
                                        <div className="space-y-2">
                                            <Label htmlFor="heading">Heading</Label>
                                            <Input
                                                id="heading"
                                                value={formData.heading}
                                                onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                                                placeholder="Enter main heading"
                                            />
                                        </div>

                                        {/* Sub Heading */}
                                        <div className="space-y-2">
                                            <Label htmlFor="sub_heading">Sub Heading</Label>
                                            <Input
                                                id="sub_heading"
                                                value={formData.sub_heading}
                                                onChange={(e) => setFormData({ ...formData, sub_heading: e.target.value })}
                                                placeholder="Enter sub heading"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsDialogOpen(false)}
                                                disabled={submitting}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={submitting}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                {submitting 
                                                    ? (editingSlider ? 'Updating...' : 'Creating...') 
                                                    : (editingSlider ? 'Update Slider' : 'Create Slider')}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Alerts */}
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

                        {/* Sliders Grid */}
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                            </div>
                        ) : sliders.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">No hero sliders yet</h3>
                                    <p className="text-gray-500 mb-4">Get started by creating your first hero slider</p>
                                    <Button
                                        onClick={() => setIsDialogOpen(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Your First Slider
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sliders.map((slider) => (
                                    <Card key={slider.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="relative aspect-video bg-gray-100">
                                            <img
                                                src={`/storage/${slider.image}`}
                                                alt={slider.heading || 'Hero slider'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <CardContent className="p-4">
                                            {slider.heading && (
                                                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                                    {slider.heading}
                                                </h3>
                                            )}
                                            {slider.sub_heading && (
                                                <p className="text-gray-600 text-sm mb-3">
                                                    {slider.sub_heading}
                                                </p>
                                            )}
                                            <div className="flex justify-between items-center pt-3 border-t">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(slider.created_at).toLocaleDateString()}
                                                </span>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenEditDialog(slider)}
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        disabled={deletingId === slider.id || submitting}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(slider.id)}
                                                        disabled={deletingId === slider.id || submitting}
                                                    >
                                                        {deletingId === slider.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default HeroSliders;
