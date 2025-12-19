import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createBrand, getBrands } from '@/hooks/api/seller';
import { Head } from '@inertiajs/react';
import { Loader2, Plus, Search, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import SellerLayout from '../../layouts/SellerLayout';

// Types
interface Brand {
    id: number;
    name: string;
    slug: string;
    logo?: string; // Assuming logo field based on file input
}

const AddBrand = () => {
    // State
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

    // New Brand Form
    const [newBrand, setNewBrand] = useState({
        name: '',
        slug: '',
        image: null as File | null,
    });

    // Fetch Data
    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const data = await getBrands();
            if (data.status === 'success') {
                setBrands(data.data);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Failed to load brands');
        } finally {
            setLoading(false);
        }
    };

    // Filter brands based on search
    const filteredBrands = brands.filter(
        (brand) => brand.name.toLowerCase().includes(searchQuery.toLowerCase()) || brand.slug.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Handlers
    const handleCreateBrand = async () => {
        setIsCreating(true);
        try {
            const formData = new FormData();
            formData.append('name', newBrand.name);
            formData.append('slug', newBrand.slug);
            if (newBrand.image) {
                formData.append('image', newBrand.image);
            }

            const data = await createBrand(formData);

            if (data.status === 'success') {
                toast.success('Brand created successfully');
                fetchBrands();
                setIsBrandModalOpen(false);
                setNewBrand({ name: '', slug: '', image: null });
            } else {
                // Handle error response from API
                let errorMessage = 'Failed to create brand';
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
            let errorMessage = 'Failed to create brand';
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
            <Head title="Manage Brands" />

            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Brands</h1>
                        <p className="mt-1 text-gray-500">Manage product brands or create new ones.</p>
                    </div>
                    <Button onClick={() => setIsBrandModalOpen(true)} className="bg-green-600 text-white hover:bg-green-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Brand
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-2xl">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                        placeholder="Search brands..."
                        className="h-12 rounded-xl border-gray-200 bg-white pl-11 text-lg shadow-sm focus:border-green-500 focus:ring-green-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Brands Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="mb-4 h-10 w-10 animate-spin text-green-600" />
                        <p className="text-gray-500">Loading brands...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {filteredBrands.map((brand) => (
                            <div
                                key={brand.id}
                                className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
                            >
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                                    {brand.logo ? (
                                        <img src={`/${brand.logo}`} alt={brand.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <Tag className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate font-semibold text-gray-900">{brand.name}</h3>
                                    <p className="truncate text-sm text-gray-500">{brand.slug}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredBrands.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
                        <Tag className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900">No brands found</h3>
                        <p className="mt-1 text-gray-500">Try searching for something else or create a new brand.</p>
                    </div>
                )}
            </div>

            {/* Create Brand Modal */}
            <Dialog open={isBrandModalOpen} onOpenChange={setIsBrandModalOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Create Brand</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 bg-white py-4">
                        <div className="space-y-2">
                            <Label>Brand Name</Label>
                            <Input
                                placeholder="Brand Name"
                                value={newBrand.name}
                                onChange={(e) =>
                                    setNewBrand({ ...newBrand, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input
                                placeholder="brand-slug"
                                value={newBrand.slug}
                                onChange={(e) => setNewBrand({ ...newBrand, slug: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Logo</Label>
                            <Input type="file" onChange={(e) => e.target.files && setNewBrand({ ...newBrand, image: e.target.files[0] })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBrandModalOpen(false)} disabled={isCreating}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateBrand} className="bg-green-600 text-white hover:bg-green-700" disabled={isCreating}>
                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SellerLayout>
    );
};

export default AddBrand;
