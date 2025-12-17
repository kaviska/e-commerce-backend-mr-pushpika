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
    Archive,
    X
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VariationOption {
    id: number;
    name: string;
    variation: {
        id: number;
        name: string;
    };
}

interface VariationStock {
    id: number;
    variation_option_id: number;
    variation_option: VariationOption;
    image: string;
}

interface Product {
    id: number;
    name: string;
    primary_image: string;
    category?: {
        id: number;
        name: string;
    };
    brand?: {
        id: number;
        name: string;
    };
}

interface Stock {
    id: number;
    product_id: number;
    quantity: number;
    reserved_quantity: number;
    web_price: number;
    pos_price: number;
    web_discount: number;
    pos_discount: number;
    product: Product;
    variation_stocks: VariationStock[];
}

const ManageStocks = () => {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentStock, setCurrentStock] = useState<Stock | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    
    // Edit form state
    const [formData, setFormData] = useState({
        quantity: 0,
        web_price: 0,
        web_discount: 0
    });

    useEffect(() => {
        fetchAllStocks();
    }, []);

    const fetchAllStocks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/all-stocks', {
                params: {
                    with: 'all'
                }
            });
            if (response.data.status === 'success') {
                setStocks(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stocks', error);
            toast.error('Failed to load stocks');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (stock: Stock) => {
        setCurrentStock(stock);
        setFormData({
            quantity: Number(stock.quantity),
            web_price: Number(stock.web_price),
            web_discount: Number(stock.web_discount)
        });
        
        // Set image preview if variation stock has image
        if (stock.variation_stocks && stock.variation_stocks.length > 0 && stock.variation_stocks[0].image) {
            setImagePreview('/' + stock.variation_stocks[0].image);
        } else {
            setImagePreview(null);
        }
        
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
        if (!currentStock) return;

        setLoading(true);
        try {
            const data = {
                id: currentStock.id,
                quantity: formData.quantity,
                web_price: formData.web_price,
                pos_price: currentStock.pos_price,
                web_discount: formData.web_discount,
                pos_discount: 0
            };

            const response = await axios.put('/api/stocks', data);

            if (response.data.status === 'success') {
                toast.success('Stock updated successfully');
                setIsEditOpen(false);
                fetchAllStocks();
                resetForm();
            } else {
                toast.error(response.data.message || 'Failed to update stock');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update stock');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (stockId: number) => {
        if (!confirm('Are you sure you want to delete this stock? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await axios.delete('/api/stocks', {
                data: { id: stockId }
            });

            if (response.data.status === 'success') {
                toast.success('Stock deleted successfully');
                fetchAllStocks();
            } else {
                toast.error(response.data.message || 'Failed to delete stock');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete stock');
        }
    };

    const resetForm = () => {
        setCurrentStock(null);
        setFormData({
            quantity: 0,
            web_price: 0,
            web_discount: 0
        });
        setImagePreview(null);
        setSelectedImage(null);
    };

    const getVariationDisplay = (variationStocks: VariationStock[]) => {
        if (!variationStocks || variationStocks.length === 0) {
            return 'No Variation';
        }
        return variationStocks.map(vs => vs.variation_option?.name || 'N/A').join(' + ');
    };

    const filteredStocks = stocks.filter(stock =>
        stock.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getVariationDisplay(stock.variation_stocks).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getAvailableQuantity = (stock: Stock) => {
        return stock.quantity - (stock.reserved_quantity || 0);
    };

    return (
        <SellerLayout>
            <Head title="Manage Stocks | Seller Center" />
            
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Stocks</h1>
                        <p className="text-sm text-gray-500">Edit or delete your product stocks</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Search stocks..." 
                                className="pl-9 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Stocks Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Product</th>
                                    <th className="px-6 py-3">Variation</th>
                                    <th className="px-6 py-3">Quantity</th>
                                    <th className="px-6 py-3">Price</th>
                                    <th className="px-6 py-3">Discount</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Loading stocks...
                                        </td>
                                    </tr>
                                ) : filteredStocks.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <Archive className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                            <p className="text-lg font-medium text-gray-900">No stocks found</p>
                                            <p>{searchQuery ? 'Try a different search term' : 'Add stock to your products to get started'}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStocks.map((stock) => (
                                        <tr key={stock.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-16 w-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                                        <img 
                                                            src={stock.product?.primary_image ? '/' + stock.product.primary_image : 'https://via.placeholder.com/64?text=No+Image'} 
                                                            alt={stock.product?.name || 'Product'} 
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Img' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{stock.product?.name || 'Unknown Product'}</div>
                                                        <div className="text-gray-500 text-xs">
                                                            {stock.product?.brand?.name && (
                                                                <span className="mr-2">Brand: {stock.product.brand.name}</span>
                                                            )}
                                                            {stock.product?.category?.name && (
                                                                <span>Category: {stock.product.category.name}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                    {getVariationDisplay(stock.variation_stocks)}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-gray-900">
                                                        {getAvailableQuantity(stock)} available
                                                    </div>
                                                    {stock.reserved_quantity > 0 && (
                                                        <div className="text-xs text-orange-600">
                                                            {stock.reserved_quantity} reserved
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-gray-500">
                                                        Total: {stock.quantity}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-gray-900">
                                                        ¥{stock.web_price.toLocaleString()}
                                                    </div>
                                                    {stock.web_discount > 0 && (
                                                        <div className="text-sm text-green-600 font-medium">
                                                            Final: ¥{(stock.web_price - stock.web_discount).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {stock.web_discount > 0 ? (
                                                    <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                                                        -¥{stock.web_discount.toLocaleString()}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No discount</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-white">
                                                        <DropdownMenuItem onClick={() => handleEdit(stock)}>
                                                            <Pencil className="w-4 h-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(stock.id)}>
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
                        <DialogTitle>Edit Stock</DialogTitle>
                        <DialogDescription>
                            Update the stock details below.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[60vh] overflow-y-auto py-4">
                        <form id="edit-stock-form" onSubmit={handleUpdate} className="space-y-6">
                            {/* Product Info */}
                            {currentStock && (
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                    <div className="flex items-center gap-4">
                                        <div className="h-20 w-20 flex-shrink-0 bg-white rounded-md overflow-hidden border border-blue-200">
                                            <img 
                                                src={currentStock.product?.primary_image ? '/' + currentStock.product.primary_image : 'https://via.placeholder.com/80?text=No+Image'} 
                                                alt={currentStock.product?.name || 'Product'} 
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">{currentStock.product?.name}</div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                <span className="font-medium">Variation:</span> {getVariationDisplay(currentStock.variation_stocks)}
                                            </div>
                                            {currentStock.product?.brand?.name && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Brand: {currentStock.product.brand.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Variation Image Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="image">Variation Image</Label>
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
                                    <p className="text-xs text-gray-500">Upload a new image for this variation (optional)</p>
                                </div>
                            </div>

                            {/* Stock Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input 
                                        id="quantity" 
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.quantity} 
                                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                                        placeholder="Stock quantity"
                                        className="bg-white"
                                    />
                                    {currentStock && currentStock.reserved_quantity > 0 && (
                                        <p className="text-xs text-orange-600">
                                            Note: {currentStock.reserved_quantity} units are currently reserved in pending orders
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="web_price">Price (¥)</Label>
                                    <Input 
                                        id="web_price" 
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={formData.web_price} 
                                        onChange={(e) => setFormData({...formData, web_price: parseFloat(e.target.value) || 0})}
                                        placeholder="0.00"
                                        className="bg-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="web_discount">Discount Amount (¥)</Label>
                                    <Input 
                                        id="web_discount" 
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.web_discount} 
                                        onChange={(e) => setFormData({...formData, web_discount: parseFloat(e.target.value) || 0})}
                                        placeholder="0.00"
                                        className="bg-white"
                                    />
                                </div>
                            </div>

                            {/* Price Preview */}
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <div className="text-sm font-medium text-gray-700 mb-2">Price Preview</div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Original Price:</span>
                                        <span className="text-lg font-medium text-gray-900">¥{Number(formData.web_price).toFixed(2)}</span>
                                    </div>
                                    {formData.web_discount > 0 && (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Discount:</span>
                                                <span className="text-lg font-medium text-red-600">-¥{Number(formData.web_discount).toFixed(2)}</span>
                                            </div>
                                            <div className="border-t border-green-300 pt-2 flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Final Price:</span>
                                                <span className="text-xl font-bold text-green-700">¥{(Number(formData.web_price) - Number(formData.web_discount)).toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button form="edit-stock-form" type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Update Stock
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SellerLayout>
    );
};

export default ManageStocks;
