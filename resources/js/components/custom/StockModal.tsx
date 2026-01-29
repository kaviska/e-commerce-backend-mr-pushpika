import React, { useState, useEffect } from 'react';
import { 
    Package, 
    Layers, 
    Tag, 
    Plus, 
    Check,
    X,
    Trash2,
    AlertCircle,
    Edit3,
    Image as ImageIcon,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import axios from 'axios';
import { api } from '@/hooks/api/api';

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
}

interface VariationOption {
    id: number;
    name: string;
    variation_id: number;
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

interface VariationStock {
    id: string;
    selectedVariations: number[];
    quantity: number;
    web_price: number;
    web_discount: number;
    images: File[];
}

interface Brand {
    id: number;
    name: string;
    slug: string;
}

interface Category {
    id: number;
    name: string;
}

interface StockModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onSuccess: () => void;
    setIsVariationModalOpen: (open: boolean) => void;
    setIsBrandModalOpen: (open: boolean) => void;
    groupedVariations: GroupedVariation[];
    brands?: Brand[];
    categories?: Category[];
    isNew?: boolean;
}

const StockModal: React.FC<StockModalProps> = ({ 
    isOpen, 
    onClose, 
    product, 
    onSuccess,
    setIsVariationModalOpen,
    setIsBrandModalOpen,
    groupedVariations = [],
    brands = [],
    categories = [],
    isNew = true
}) => {
    const [hasVariations, setHasVariations] = useState<'yes' | 'no'>('no');
    const [variationStocks, setVariationStocks] = useState<VariationStock[]>([]);
    const [variationImageKey, setVariationImageKey] = useState(0);
    
    // Product details editing
    const [isEditingProduct, setIsEditingProduct] = useState(false);
    const [productDetails, setProductDetails] = useState({
        name: '',
        description: '',
        brand_id: 0,
        category_id: 0,
        primary_image: [] as File[],
    });
    
    // Simple stock form (no variations)
    const [simpleStock, setSimpleStock] = useState({
        quantity: 0,
        web_price: 0,
        web_discount: 0,
        images: [] as File[],
    });

    // Current variation being configured
    const [currentVariation, setCurrentVariation] = useState<{
        selectedVariations: number[];
        quantity: number;
        web_price: number;
        web_discount: number;
        images: File[];
    }>({
        selectedVariations: [],
        quantity: 0,
        web_price: 0,
        web_discount: 0,
        images: [],
    });
    
    // Image Previews
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
    const [simpleStockImagePreview, setSimpleStockImagePreview] = useState<string | null>(null);
    const [variationImagePreview, setVariationImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (product && isOpen) {
            setHasVariations('no');
            setIsEditingProduct(false);
            setProductDetails({
                name: product.name || '',
                description: product.description || '',
                brand_id: product.brand?.id || 0,
                category_id: product.category?.id || 0,
                primary_image: [],
            });
            setSimpleStock({
                quantity: 0,
                web_price: product.web_price || 0,
                web_discount: 0,
                images: [],
            });
            setVariationStocks([]);
            setCurrentVariation({
                selectedVariations: [],
                quantity: 0,
                web_price: product.web_price || 0,
                web_discount: 0,
                images: [],
            });
            setProductImagePreview(null);
            setSimpleStockImagePreview(null);
            setVariationImagePreview(null);
        }
    }, [product, isOpen]);

    const handleStockSubmit = async () => {
        if (!product) return;

        const user = localStorage.getItem("user");
        const userId = (user ? JSON.parse(user)?.id : null) || 1;

        // if (!userId) {
        //     toast.error('User not logged in');
        //     return;
        // }

        try {
            let newProductId: number;

            if (isNew) {
                // Step 1: Create a new product for this seller
                const productFormData = new FormData();
                productFormData.append('name', productDetails.name);
                productFormData.append('description', productDetails.description);
                productFormData.append('category_id', productDetails.category_id.toString());
                productFormData.append('brand_id', productDetails.brand_id.toString());
                productFormData.append('user_id', userId.toString());
                
                // Add primary image if available
                if (productDetails.primary_image.length > 0) {
                    productFormData.append('primary_image', productDetails.primary_image[0]);
                } else {
                    // If no image provided, we need to handle this - for now show error
                    toast.error('Please upload a primary product image');
                    return;
                }

                toast.loading('Creating product...');
                
                const productResponse = await api.post('/products', productFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });

                if (productResponse.data.status !== 'success') {
                    toast.dismiss();
                    toast.error('Failed to create product');
                    return;
                }

                newProductId = productResponse.data.data.id;
            } else {
                // Use existing product ID
                newProductId = product.id;
            }
            
            toast.dismiss();
            toast.loading('Adding stock...');

            // Step 2: Create stocks for the new product
            if (hasVariations === 'no') {
                // Submit simple stock without variations
                if (simpleStock.quantity <= 0) {
                    toast.dismiss();
                    toast.error('Please enter a valid quantity');
                    return;
                }

                const formData = new FormData();
                formData.append('product_id', newProductId.toString());
                formData.append('quantity', simpleStock.quantity.toString());
                formData.append('web_price', simpleStock.web_price.toString());
                formData.append('pos_price', '0');
                formData.append('web_discount', simpleStock.web_discount.toString());
                formData.append('pos_discount', '0');
                formData.append('variations[]', '1'); // Default variation option ID
                formData.append('user_id', userId.toString());
                
                // Add image if available
                if (simpleStock.images.length > 0) {
                    formData.append('variation_images[]', simpleStock.images[0]);
                }

                await api.post('/stocks', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
                
                toast.dismiss();
                toast.success('Product and stock added successfully');
                onSuccess();
                onClose();
            } else {
                // Submit variation stocks
                if (variationStocks.length === 0) {
                    toast.dismiss();
                    toast.error('Please add at least one variation stock');
                    return;
                }

                // Submit each variation stock separately
                for (const varStock of variationStocks) {
                    const formData = new FormData();
                    formData.append('product_id', newProductId.toString());
                    formData.append('quantity', varStock.quantity.toString());
                    formData.append('web_price', varStock.web_price.toString());
                    formData.append('pos_price', '0');
                    formData.append('web_discount', varStock.web_discount.toString());
                    formData.append('pos_discount', '0');
                    formData.append('user_id', userId.toString());
                    
                    // Add variations
                    varStock.selectedVariations.forEach(varId => {
                        formData.append('variations[]', varId.toString());
                    });
                    
                    // Add image if available (single image for all variations in this stock)
                    if (varStock.images.length > 0) {
                        formData.append('variation_images[]', varStock.images[0]);
                    }

                    await api.post('/stocks', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        }
                    });
                }

                toast.dismiss();
                toast.success(`Product created with ${variationStocks.length} stock variant(s)`);
                onSuccess();
                onClose();
            }
        } catch (error: any) {
            toast.dismiss();
            console.error('Error adding product/stock:', error);
            toast.error(error.response?.data?.message || 'Failed to add product/stock');
        }
    };

    const addVariationStock = () => {
        if (currentVariation.selectedVariations.length === 0) {
            toast.error('Please select at least one variation option');
            return;
        }

        if (currentVariation.quantity <= 0) {
            toast.error('Please enter a valid quantity');
            return;
        }

        // Check for duplicate variation combinations
        const isDuplicate = variationStocks.some(stock => 
            stock.selectedVariations.length === currentVariation.selectedVariations.length &&
            stock.selectedVariations.every(v => currentVariation.selectedVariations.includes(v))
        );

        if (isDuplicate) {
            toast.error('This variation combination already exists');
            return;
        }

        const newStock: VariationStock = {
            id: Date.now().toString(),
            ...currentVariation,
        };

        setVariationStocks([...variationStocks, newStock]);
        
        // Reset current variation and force image field to clear
        setCurrentVariation({
            selectedVariations: [],
            quantity: 0,
            web_price: product?.web_price || 0,
            web_discount: 0,
            images: [],
        });

        setVariationImagePreview(null); // Clear preview after adding
        setVariationImageKey(prev => prev + 1); // Force input reset

        toast.success('Variation stock added to list');
    };

    const removeVariationStock = (id: string) => {
        setVariationStocks(variationStocks.filter(stock => stock.id !== id));
        toast.info('Variation stock removed');
    };

    const toggleVariationSelection = (id: number) => {
        setCurrentVariation(prev => {
            const exists = prev.selectedVariations.includes(id);
            if (exists) {
                return { 
                    ...prev, 
                    selectedVariations: prev.selectedVariations.filter(v => v !== id) 
                };
            } else {
                return { 
                    ...prev, 
                    selectedVariations: [...prev.selectedVariations, id] 
                };
            }
        });
    };

    const getVariationNames = (variationIds: number[]) => {
        const names: string[] = [];
        groupedVariations.forEach(group => {
            group.options.forEach(option => {
                if (variationIds.includes(option.id)) {
                    names.push(option.name);
                }
            });
        });
        return names.join(' + ');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1000px] max-h-[95vh] flex flex-col p-0 gap-0 rounded-2xl bg-white">
                <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 shrink-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Package className="h-6 w-6 text-green-600" />
                                Add Stock to Inventory
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 mt-1">
                                Configure product details and inventory for <span className="font-semibold text-gray-900">{product?.name}</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6 bg-white overflow-y-auto flex-1">
                    {/* Product Details Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden">
                        <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm border-b border-blue-200">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                Product Details
                            </h3>
                                {isNew && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditingProduct(!isEditingProduct)}
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 h-8"
                                    >
                                        <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                                        {isEditingProduct ? 'View Mode' : 'Edit Product'}
                                    </Button>
                                )}
                        </div>
                        
                        <div className="p-5 space-y-4">
                            {!isEditingProduct ? (
                                /* View Mode */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Product Name</p>
                                        <p className="text-base font-semibold text-gray-900">{product?.name}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Brand</p>
                                        <p className="text-base font-semibold text-gray-900">{product?.brand?.name || 'No Brand'}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Category</p>
                                        <p className="text-base font-semibold text-gray-900">{product?.category?.name || 'Uncategorized'}</p>
                                    </div>
                                    {/* <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Base Price</p>
                                        <p className="text-base font-semibold text-green-600">${product?.web_price || '0.00'}</p>
                                    </div> */}
                                    {product?.description && (
                                        <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm md:col-span-2">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Description</p>
                                            <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Edit Mode */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-xs font-semibold text-gray-700">Product Name</Label>
                                        <Input
                                            placeholder="Enter product name"
                                            className="h-11 bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                                            value={productDetails.name}
                                            onChange={(e) => setProductDetails({...productDetails, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold text-gray-700">Brand</Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsBrandModalOpen(true)}
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 h-7 text-xs font-semibold -mt-1"
                                            >
                                                <Plus className="h-3.5 w-3.5 mr-1" />
                                                Add Brand
                                            </Button>
                                        </div>
                                        <div className="[&_button]:h-11 [&_button]:bg-white [&_button]:border-blue-200 [&_button]:hover:bg-blue-50">
                                            <FormGenerator
                                                name="brand_id"
                                                label=""
                                                type="selector"
                                                value={productDetails.brand_id?.toString() || ''}
                                                onChange={(e) => setProductDetails({...productDetails, brand_id: parseInt(e.target.value)})}
                                                selectOptions={brands}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-700">Category</Label>
                                        <div className="[&_button]:h-11 [&_button]:bg-white [&_button]:border-blue-200 [&_button]:hover:bg-blue-50">
                                            <FormGenerator
                                                name="category_id"
                                                label=""
                                                type="selector"
                                                value={productDetails.category_id?.toString() || ''}
                                                onChange={(e) => setProductDetails({...productDetails, category_id: parseInt(e.target.value)})}
                                                selectOptions={categories}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-xs font-semibold text-gray-700">Description (Optional)</Label>
                                        <Textarea
                                            placeholder="Enter product description..."
                                            className="min-h-[80px] bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                                            value={productDetails.description}
                                            onChange={(e) => setProductDetails({...productDetails, description: e.target.value})}
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4 text-blue-600" />
                                            Primary Product Image (Optional)
                                        </Label>
                                        <div className="bg-white rounded-lg border border-blue-200 p-3 space-y-3">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setProductDetails({ ...productDetails, primary_image: [file] });
                                                        setProductImagePreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                                className="cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                            {productImagePreview && (
                                                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                                                    <img 
                                                        src={productImagePreview} 
                                                        alt="Preview" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white rounded-full"
                                                        onClick={() => {
                                                            setProductDetails({ ...productDetails, primary_image: [] });
                                                            setProductImagePreview(null);
                                                        }}
                                                    >
                                                        <X className="h-4 w-4 text-gray-500" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    {/* Variation Type Selection */}
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <Label className="text-sm font-semibold text-gray-900">Does this product have variations?</Label>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant={hasVariations === 'no' ? 'default' : 'outline'}
                                className={`flex-1 h-11 ${hasVariations === 'no' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-gray-50'}`}
                                onClick={() => {
                                    setHasVariations('no');
                                    setVariationStocks([]);
                                }}
                            >
                                {hasVariations === 'no' && <Check className="h-4 w-4 mr-2" />}
                                No variations
                            </Button>
                            <Button
                                type="button"
                                variant={hasVariations === 'yes' ? 'default' : 'outline'}
                                className={`flex-1 h-11 ${hasVariations === 'yes' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-gray-50'}`}
                                onClick={() => {
                                    setHasVariations('yes');
                                    setVariationStocks([]);
                                }}
                            >
                                {hasVariations === 'yes' && <Check className="h-4 w-4 mr-2" />}
                                Has variations
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 flex items-start gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            Select "Has variations" if your product comes in different colors, sizes, or other options
                        </p>
                    </div>

                    {hasVariations === 'no' ? (
                        /* Simple Stock Form - No Variations */
                        <div className="space-y-5 bg-gradient-to-br from-gray-50 to-slate-50 p-5 rounded-xl border border-gray-200">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Package className="h-5 w-5 text-green-600" />
                                Stock Configuration
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                        Quantity <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        type="number" 
                                        min="0"
                                        placeholder="100"
                                        className="h-11 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 font-medium"
                                        value={simpleStock.quantity || ''}
                                        onChange={(e) => setSimpleStock({...simpleStock, quantity: parseInt(e.target.value) || 0})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                        Price <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">LKR</span>
                                        <Input 
                                            type="number" 
                                            min="0"
                                            step="0.01"
                                            placeholder="99.99"
                                            className="pl-8 h-11 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 font-medium"
                                            value={simpleStock.web_price || ''}
                                            onChange={(e) => setSimpleStock({...simpleStock, web_price: parseFloat(e.target.value) || 0})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-gray-700">Discount</Label>
                                    <div className="relative">
                                        <Input 
                                            type="number" 
                                            min="0"
                                            max="100"
                                            placeholder="10"
                                            className="pr-8 h-11 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 font-medium"
                                            value={simpleStock.web_discount || ''}
                                            onChange={(e) => setSimpleStock({...simpleStock, web_discount: parseFloat(e.target.value) || 0})}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium"></span>
                                    </div>
                                </div>
                            </div>
                            
                            {simpleStock.web_discount > 0 && simpleStock.web_price > 0 && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-green-700 uppercase tracking-wider">Final Price After Discount</p>
                                        <p className="text-2xl font-bold text-green-600 mt-1">
                                            ${(simpleStock.web_price * (1 - simpleStock.web_discount / 100)).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        {simpleStock.web_discount} OFF
                                    </div>
                                </div>
                            )}


                            
                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4 text-gray-600" />
                                    Product Image (Optional)
                                </Label>
                                <div className="bg-white rounded-lg border border-gray-300 p-3 space-y-3">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setSimpleStock({ ...simpleStock, images: [file] });
                                                setSimpleStockImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                        className="cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                    />
                                    {simpleStockImagePreview && (
                                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                                            <img 
                                                src={simpleStockImagePreview} 
                                                alt="Preview" 
                                                className="w-full h-full object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white rounded-full"
                                                onClick={() => {
                                                    setSimpleStock({ ...simpleStock, images: [] });
                                                    setSimpleStockImagePreview(null);
                                                }}
                                            >
                                                <X className="h-4 w-4 text-gray-500" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Variation Stock Form */
                        <div className="space-y-5">
                            {/* Variation Selection */}
                            <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-green-600" />
                                        Select Variation Options
                                    </h3>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setIsVariationModalOpen(true)}
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 h-7 text-xs"
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Create New
                                    </Button>
                                </div>
                                
                                {groupedVariations.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {groupedVariations.map((group) => (
                                            <div key={group.variation_id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">{group.variation_name}</h4>
                                                <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                                                    {group.options.map((option) => (
                                                        <label 
                                                            key={option.id} 
                                                            className={`flex items-center space-x-2 p-2 rounded-md transition-all cursor-pointer ${
                                                                currentVariation.selectedVariations.includes(option.id)
                                                                    ? 'bg-green-100 border border-green-300' 
                                                                    : 'bg-white hover:bg-gray-100 border border-transparent'
                                                            }`}
                                                        >
                                                            <Checkbox 
                                                                id={`var-${option.id}`} 
                                                                checked={currentVariation.selectedVariations.includes(option.id)}
                                                                onCheckedChange={() => toggleVariationSelection(option.id)}
                                                                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                                            />
                                                            <span className="text-sm text-gray-700 font-medium">
                                                                {option.name}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        <Layers className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 mb-2">No variation options available</p>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setIsVariationModalOpen(true)} 
                                            className="text-green-600 border-green-600 hover:bg-green-50"
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Create variation
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Stock Details for Current Variation */}
                            <div className="space-y-4 bg-gradient-to-br from-gray-50 to-slate-50 p-5 rounded-xl border border-gray-200">
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-green-600" />
                                    Stock Configuration for Selected Variations
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                            Quantity <span className="text-red-500">*</span>
                                        </Label>
                                        <Input 
                                            type="number" 
                                            min="0"
                                            placeholder="50"
                                            className="h-11 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 font-medium"
                                            value={currentVariation.quantity || ''}
                                            onChange={(e) => setCurrentVariation({...currentVariation, quantity: parseInt(e.target.value) || 0})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                            Price <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">LKR</span>
                                            <Input 
                                                type="number" 
                                                min="0"
                                                step="0.01"
                                                placeholder="99.99"
                                                className="pl-8 h-11 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 font-medium"
                                                value={currentVariation.web_price || ''}
                                                onChange={(e) => setCurrentVariation({...currentVariation, web_price: parseFloat(e.target.value) || 0})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-700">Discount (%)</Label>
                                        <div className="relative">
                                            <Input 
                                                type="number" 
                                                min="0"
                                                max="100"
                                                placeholder="10"
                                                className="pr-8 h-11 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 font-medium"
                                                value={currentVariation.web_discount || ''}
                                                onChange={(e) => setCurrentVariation({...currentVariation, web_discount: parseFloat(e.target.value) || 0})}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium"></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Image Upload for Variation */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4 text-gray-600" />
                                        Variation Image (Optional)
                                    </Label>
                                    <div className="bg-white rounded-lg border border-gray-300 p-3 space-y-3">
                                        <Input
                                            key={variationImageKey}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setCurrentVariation({ ...currentVariation, images: [file] });
                                                    setVariationImagePreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                        />
                                        {variationImagePreview && (
                                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                                                <img 
                                                    src={variationImagePreview} 
                                                    alt="Preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white rounded-full"
                                                    onClick={() => {
                                                        setCurrentVariation({ ...currentVariation, images: [] });
                                                        setVariationImagePreview(null);
                                                    }}
                                                >
                                                    <X className="h-4 w-4 text-gray-500" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button 
                                    onClick={addVariationStock}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 text-base font-semibold shadow-lg shadow-green-200"
                                    disabled={currentVariation.selectedVariations.length === 0}
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Add This Variation to List
                                </Button>
                            </div>

                            {/* Added Variation Stocks List */}
                            {variationStocks.length > 0 && (
                                <div className="space-y-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-5 rounded-xl border-2 border-green-300 shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                            <Check className="h-5 w-5 text-green-600" />
                                            Added Variations ({variationStocks.length})
                                        </h3>
                                        <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                            {variationStocks.length} Stock{variationStocks.length !== 1 ? 's' : ''} Ready
                                        </div>
                                    </div>
                                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                                        {variationStocks.map((stock) => (
                                            <div key={stock.id} className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-md hover:shadow-lg transition-shadow">
                                                <div className="flex items-start gap-4">
                                                    {/* Image Preview */}
                                                    {stock.images.length > 0 && (
                                                        <div className="shrink-0">
                                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                                                                <img
                                                                    src={URL.createObjectURL(stock.images[0])}
                                                                    alt="Variation"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-base text-gray-900 truncate mb-2">
                                                            {getVariationNames(stock.selectedVariations)}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200">
                                                                Qty: {stock.quantity}
                                                            </span>
                                                            <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
                                                                ${stock.web_price}
                                                            </span>
                                                            {stock.web_discount > 0 && (
                                                                <span className="bg-gradient-to-r from-orange-100 to-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold border border-red-200">
                                                                    {stock.web_discount} OFF
                                                                </span>
                                                            )}
                                                            {stock.images.length > 0 && (
                                                                <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold border border-purple-200 flex items-center gap-1">
                                                                    <ImageIcon className="h-3 w-3" />
                                                                    1 Image
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => removeVariationStock(stock.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 w-9 p-0 shrink-0 rounded-lg border border-red-200"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                <DialogFooter className="p-6 pt-4 border-t bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        {hasVariations === 'yes' && variationStocks.length > 0 && (
                            <p className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600" />
                                <span><strong>{variationStocks.length}</strong> variation stock{variationStocks.length !== 1 ? 's' : ''} ready to submit</span>
                            </p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="h-11 px-8 font-semibold border-2">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleStockSubmit} 
                            className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white h-11 px-10 shadow-lg shadow-green-300 font-bold text-base"
                            disabled={hasVariations === 'yes' && variationStocks.length === 0}
                        >
                            <Check className="h-5 w-5 mr-2" />
                            {hasVariations === 'yes' 
                                ? `Submit ${variationStocks.length} Stock${variationStocks.length !== 1 ? 's' : ''}`
                                : 'Add Stock to Inventory'
                            }
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default StockModal;
