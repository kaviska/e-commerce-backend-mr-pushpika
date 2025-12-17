import React, { useState } from 'react';
import { 
    Layers, 
    Type, 
    Plus, 
    Check,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import axios from 'axios';

interface Variation {
    id: number;
    name: string;
}

interface VariationModalProps {
    isOpen: boolean;
    onClose: () => void;
    variations: Variation[];
    onSuccess: () => void;
}

const VariationModal: React.FC<VariationModalProps> = ({ 
    isOpen, 
    onClose, 
    variations,
    onSuccess 
}) => {
    const [newVariation, setNewVariation] = useState({
        variation_id: '',
        name: ''
    });
    const [loading, setLoading] = useState(false);
    const [isCreatingNewType, setIsCreatingNewType] = useState(false);
    const [newVariationType, setNewVariationType] = useState('');

    const handleCreateVariationType = async () => {
        if (!newVariationType.trim()) {
            toast.error('Please enter variation type name');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/variations', {
                name: newVariationType
            });

            if (response.data.status === 'success') {
                toast.success('Variation type created successfully');
                onSuccess();
                setNewVariationType('');
                setIsCreatingNewType(false);
            } else {
                toast.error(response.data.message || 'Failed to create variation type');
            }
        } catch (error: any) {
            console.error('Error creating variation type:', error);
            toast.error(error.response?.data?.message || 'Failed to create variation type');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateVariation = async () => {
        if (!newVariation.variation_id || !newVariation.name) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/variation-options', {
                variation_id: parseInt(newVariation.variation_id),
                name: newVariation.name
            });

            if (response.data.status === 'success') {
                toast.success('Variation option created successfully');
                onSuccess();
                onClose();
                setNewVariation({ variation_id: '', name: '' });
            } else {
                toast.error(response.data.message || 'Failed to create variation');
            }
        } catch (error: any) {
            console.error('Error creating variation:', error);
            toast.error(error.response?.data?.message || 'Failed to create variation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] max-h-[90vh] flex flex-col p-0 gap-0 rounded-2xl bg-white">
                <DialogHeader className="p-6 pb-4 border-b bg-gray-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Layers className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">New Variation Option</DialogTitle>
                            <DialogDescription className="text-gray-500 mt-1">
                                Add a new option to an existing variation type.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6 bg-white overflow-y-auto flex-1">
                    <div className="space-y-4">
                        {isCreatingNewType ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">New Variation Type</Label>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => {
                                            setIsCreatingNewType(false);
                                            setNewVariationType('');
                                        }}
                                        className="h-7 px-2 text-xs"
                                    >
                                        <X className="h-3 w-3 mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                                <Input 
                                    placeholder="e.g. Color, Size, Material"
                                    className="h-11 bg-white border-gray-200 focus:border-green-500 transition-all"
                                    value={newVariationType}
                                    onChange={(e) => setNewVariationType(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateVariationType()}
                                />
                                <Button 
                                    onClick={handleCreateVariationType}
                                    disabled={loading}
                                    className="w-full bg-green-600 hover:bg-green-700 h-10"
                                >
                                    {loading ? 'Creating...' : 'Create Variation Type'}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Variation Type</Label>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setIsCreatingNewType(true)}
                                        className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        New Type
                                    </Button>
                                </div>
                                <Select 
                                    value={newVariation.variation_id}
                                    onValueChange={(val) => setNewVariation({...newVariation, variation_id: val})}
                                >
                                    <SelectTrigger className="h-11 bg-white border-gray-200 focus:border-green-500 transition-all">
                                        <SelectValue placeholder="Select type (e.g. Color, Size)" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {variations.map((variation) => (
                                            <SelectItem key={variation.id} value={variation.id.toString()}>
                                                {variation.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {!isCreatingNewType && (
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Option Name</Label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input 
                                        placeholder="e.g. Red, XL, Cotton"
                                        className="pl-9 h-11 bg-white border-gray-200 focus:border-green-500 transition-all"
                                        value={newVariation.name}
                                        onChange={(e) => setNewVariation({...newVariation, name: e.target.value})}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateVariation()}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700 flex gap-2">
                        <div className="shrink-0 mt-0.5">
                            <div className="h-4 w-4 rounded-full bg-blue-200 flex items-center justify-center text-[10px] font-bold text-blue-700">i</div>
                        </div>
                        <p>Creating a new option will make it available for all products using this variation type.</p>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-4 border-t bg-gray-50/50">
                    <Button variant="outline" onClick={onClose} className="h-11 px-6">Close</Button>
                    {!isCreatingNewType && (
                        <Button 
                            onClick={handleCreateVariation} 
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 h-11 px-6 shadow-sm shadow-green-200"
                        >
                            {loading ? 'Creating...' : 'Create Option'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default VariationModal;
