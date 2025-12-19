import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import axios from 'axios';
import { toast } from 'sonner';
import { 
    Plus, 
    Search,
    Loader2,
    Calendar,
    Link as LinkIcon,
    MoreVertical,
    Pencil,
    Trash2,
    Megaphone,
    ChevronDown,
    ChevronUp,
    ImageIcon
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

interface Notice {
    id: number;
    title: string;
    description: string;
    image: string;
    link: string;
    section: string;
    button_text?: string;
    additional_field_1?: string;
    additional_field_2?: string;
    additional_field_3?: string;
    additional_field_4?: string;
    status: 'active' | 'inactive';
    start_date: string;
    end_date: string;
}

const SellerNotifications = () => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentNotice, setCurrentNotice] = useState<Partial<Notice>>({});
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form states
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        link: '',
        section: 'new_arrival_banner',
        button_text: '',
        additional_field_1: '',
        additional_field_2: '',
        additional_field_3: '',
        additional_field_4: '',
        status: 'active',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/notices', {
                params: {
                    all: true,
                    status: 'all'
                }
            });
            if (response.data.status === 'success') {
                setNotices(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notices', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedImage && !isEdit) {
            toast.error('Please upload an image');
            return;
        }

        setIsSubmitting(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('link', formData.link);
        data.append('section', formData.section);
        if(formData.button_text) data.append('button_text', formData.button_text);
        if(formData.additional_field_1) data.append('additional_field_1', formData.additional_field_1);
        if(formData.additional_field_2) data.append('additional_field_2', formData.additional_field_2);
        if(formData.additional_field_3) data.append('additional_field_3', formData.additional_field_3);
        if(formData.additional_field_4) data.append('additional_field_4', formData.additional_field_4);
        data.append('status', formData.status);
        data.append('start_date', formData.start_date);
        data.append('end_date', formData.end_date);
        
        if (selectedImage) {
            data.append('image', selectedImage);
        }

        try {
            let response;
            if (isEdit && currentNotice.id) {
                data.append('id', currentNotice.id.toString());
                response = await axios.post('/api/notices/update', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                response = await axios.post('/api/notices', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            if (response.data.status === 'success') {
                toast.success(isEdit ? 'Notification updated successfully' : 'Notification created successfully');
                setIsCreateOpen(false);
                resetForm();
                fetchNotices();
            } else {
                toast.error(response.data.message || 'Operation failed');
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this notification? This action cannot be undone.')) return;
        
        setDeletingId(id);
        try {
            const response = await axios.delete('/api/notices', {
                data: { id }
            });
            
            if (response.data.status === 'success') {
                toast.success('Notification deleted successfully');
                fetchNotices();
            } else {
                toast.error(response.data.message || 'Failed to delete notification');
            }
        } catch (error: any) {
            console.error('Delete error', error);
            toast.error(error.response?.data?.message || 'Failed to delete notification');
        } finally {
            setDeletingId(null);
        }
    };

    const editNotice = (notice: Notice) => {
        setIsEdit(true);
        setCurrentNotice(notice);
        setFormData({
            title: notice.title,
            description: notice.description,
            link: notice.link,
            section: notice.section,
            button_text: notice.button_text || '',
            additional_field_1: notice.additional_field_1 || '',
            additional_field_2: notice.additional_field_2 || '',
            additional_field_3: notice.additional_field_3 || '',
            additional_field_4: notice.additional_field_4 || '',
            status: notice.status,
            start_date: notice.start_date.split(' ')[0], // simple date extraction
            end_date: notice.end_date.split(' ')[0]
        });
        setImagePreview('/' + notice.image);
        setIsCreateOpen(true);
    };

    const resetForm = () => {
        setIsEdit(false);
        setCurrentNotice({});
        setFormData({
            title: '',
            description: '',
            link: '',
            section: 'new_arrival_banner',
            button_text: '',
            additional_field_1: '',
            additional_field_2: '',
            additional_field_3: '',
            additional_field_4: '',
            status: 'active',
            start_date: '',
            end_date: ''
        });
        setImagePreview(null);
        setSelectedImage(null);
    };

    return (
        <SellerLayout>
            <Head title="Notifications | Seller Center" />
            
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-sm text-gray-500">Manage your promotional banners and notices</p>
                    </div>
                    <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="bg-green-600 text-white hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Notification
                    </Button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Filters & Search - Placeholder for now */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Search notifications..." 
                                className="pl-9 bg-white"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Details</th>
                                    <th className="px-6 py-3">Section</th>
                                    <th className="px-6 py-3">Duration</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Loading notifications...
                                        </td>
                                    </tr>
                                ) : notices.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <Megaphone className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                            <p className="text-lg font-medium text-gray-900">No notifications found</p>
                                            <p>Create your first notification or banner to engage customers.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    notices.map((notice) => (
                                        <tr key={notice.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-16 w-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                                        <img 
                                                            src={'/' + notice.image} 
                                                            alt={notice.title} 
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Img' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{notice.title}</div>
                                                        <div className="text-gray-500 text-xs truncate max-w-xs">{notice.description}</div>
                                                        {notice.link && (
                                                            <div className="flex items-center text-xs text-blue-600 mt-1">
                                                                <LinkIcon className="w-3 h-3 mr-1" />
                                                                {notice.link}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {notice.section.replace(/_/g, ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col text-xs text-gray-600">
                                                    <span className="flex items-center">
                                                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                                        {new Date(notice.start_date).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-gray-400 pl-4">to</span>
                                                    <span className="flex items-center">
                                                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                                        {new Date(notice.end_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={
                                                    notice.status === 'active' 
                                                    ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" 
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                                                }>
                                                    {notice.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500" disabled={deletingId === notice.id}>
                                                            {deletingId === notice.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => editNotice(notice)} disabled={deletingId !== null}>
                                                            <Pencil className="w-4 h-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(notice.id)} disabled={deletingId !== null}>
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

            {/* Create/Edit Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="max-w-4xl bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{isEdit ? 'Edit Notification' : 'Create Notification'}</DialogTitle>
                        <DialogDescription>
                            {isEdit ? 'Update the notification details below.' : 'Enter the details for your notification banner.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[70vh] overflow-y-auto py-4">
                        <form id="notice-form" onSubmit={handleSubmit} className="space-y-6">
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="image" className="text-base font-medium flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4 text-gray-600" />
                                        Banner Image {!isEdit && <span className="text-red-500">*</span>}
                                    </Label>
                                    <div className="flex flex-col gap-2">
                                        {imagePreview && (
                                            <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <Input 
                                            id="image" 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 h-auto py-2"
                                        />
                                        <p className="text-xs text-gray-500">Recommended size: 1920x600px. Max file size: 2MB</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="title" className="text-base font-medium">
                                            Title <span className="text-red-500">*</span>
                                        </Label>
                                        <Input 
                                            id="title" 
                                            required
                                            value={formData.title} 
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            placeholder="e.g., Summer Sale - Up to 50% Off"
                                            className="bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="description" className="text-base font-medium">
                                            Description <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea 
                                            id="description" 
                                            required
                                            value={formData.description} 
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            placeholder="Enter a detailed description for this notification..."
                                            className="h-24 bg-white resize-none"
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <Label htmlFor="link" className="text-base font-medium">Link URL</Label>
                                        <Input 
                                            id="link" 
                                            value={formData.link} 
                                            onChange={(e) => setFormData({...formData, link: e.target.value})}
                                            placeholder="https://..."
                                            className="bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <Label htmlFor="button_text" className="text-base font-medium">Button Text</Label>
                                        <Input 
                                            id="button_text" 
                                            value={formData.button_text} 
                                            onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                                            placeholder="e.g. Shop Now"
                                            className="bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="section" className="text-base font-medium">
                                            Placement Section <span className="text-red-500">*</span>
                                        </Label>
                                        <Select 
                                            value={formData.section} 
                                            onValueChange={(val) => setFormData({...formData, section: val})}
                                        >
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Select section" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                <SelectItem value="new_arrival_banner">New Arrival Banner</SelectItem>
                                                <SelectItem value="home_slider">Home Page Slider</SelectItem>
                                                <SelectItem value="offer_section">Offer Section</SelectItem>
                                                <SelectItem value="shop_offer">Shop Offer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="start_date" className="text-base font-medium">
                                            Start Date <span className="text-red-500">*</span>
                                        </Label>
                                        <Input 
                                            id="start_date" 
                                            type="date"
                                            required
                                            value={formData.start_date} 
                                            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                            className="bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end_date" className="text-base font-medium">
                                            End Date <span className="text-red-500">*</span>
                                        </Label>
                                        <Input 
                                            id="end_date" 
                                            type="date"
                                            required
                                            value={formData.end_date} 
                                            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                            className="bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-base font-medium">
                                            Status <span className="text-red-500">*</span>
                                        </Label>
                                        <Select 
                                            value={formData.status} 
                                            onValueChange={(val) => setFormData({...formData, status: val})}
                                        >
                                            <SelectTrigger className="bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Additional Fields (Simple Toggle) */}
                                <div className="pt-4 border-t border-gray-200">
                                    <button 
                                        type="button" 
                                        className="text-sm text-green-600 font-medium hover:text-green-700 flex items-center gap-1 transition-colors"
                                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                    >
                                        {isAdvancedOpen ? 'Hide Advanced Fields' : 'Show Advanced Fields'}
                                        {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>

                                    {isAdvancedOpen && (
                                        <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            {[1, 2, 3, 4].map((num) => (
                                                <div key={num} className="space-y-2">
                                                    <Label htmlFor={`additional_field_${num}`} className="text-xs text-gray-600">
                                                        Additional Field {num}
                                                    </Label>
                                                    <Input 
                                                        id={`additional_field_${num}`}
                                                        // @ts-ignore
                                                        value={formData[`additional_field_${num}`]} 
                                                        // @ts-ignore
                                                        onChange={(e) => setFormData({...formData, [`additional_field_${num}`]: e.target.value})}
                                                        placeholder={`Value ${num}`}
                                                        className="bg-white"
                                                    />
                                                </div>
                                            ))}
                                            <div className="col-span-2 text-xs text-gray-500">
                                                * These fields are used for specific component logic and custom data.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => { setIsCreateOpen(false); resetForm(); }}
                            type="button"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            form="notice-form" 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {isEdit ? 'Update Notification' : 'Create Notification'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SellerLayout>
    );
};

export default SellerNotifications;
