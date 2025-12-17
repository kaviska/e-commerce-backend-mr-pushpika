import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '../hooks/api/api';
import Nav from '../components/custom/main/Nav';
import Footer from '../components/custom/main/Footer';
import { FiUploadCloud, FiShoppingBag, FiMapPin, FiPhone, FiMail, FiGlobe, FiCreditCard, FiFileText } from 'react-icons/fi';
import UploadImages from '../components/custom/tools/UploadImages';

const SellerRegister = () => {
    const [formData, setFormData] = useState({
        shop_name: '',
        shop_description: '',
        shop_address: '',
        shop_phone: '',
        shop_email: '',
        shop_url: '',
        bank_name: '',
        bank_account_number: '',
        bank_account_name: '',
        tax_id: '',
        shop_logo: null as File | null,
        shop_banner: null as File | null,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login?redirect_with=seller/register';
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'file') {
            const fileInput = e.target as HTMLInputElement;
            if (fileInput.files && fileInput.files[0]) {
                setFormData(prev => ({ ...prev, [name]: fileInput.files![0] }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null) {
                data.append(key, value);
            }
        });

        try {
            const response = await api.post('/seller/register', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            if (response.data.status=='success') {
                toast.success('Seller registered successfully!');
                window.location.href = '/seller/dashboard';
            } else {
                 toast.error(response.data.message || 'Registration failed');
            }

        } catch (error: any) {
            console.error('Seller registration error:', error);
            const errorMessage = error.response?.data?.message || 'An error occurred during registration';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Nav />
            <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Register Your Shop
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Join our marketplace and start selling to millions of customers.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        
                        {/* Section: Shop Information */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <FiShoppingBag className="mr-2 text-green-600" /> Shop Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="shop_name" className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
                                    <input
                                        id="shop_name"
                                        name="shop_name"
                                        type="text"
                                        required
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        placeholder="My Awesome Shop"
                                        value={formData.shop_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="shop_url" className="block text-sm font-medium text-gray-700 mb-1">Shop URL Slug</label>
                                    <div className="flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                            /shop/
                                        </span>
                                        <input
                                            type="text"
                                            name="shop_url"
                                            id="shop_url"
                                            className="flex-1 min-w-0 block w-full px-3 py-3 rounded-none rounded-r-xl focus:ring-green-500 focus:border-green-500 border-gray-300 border focus:ring-2 focus:outline-none transition-colors"
                                            placeholder="my-shop"
                                            value={formData.shop_url}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="shop_description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        id="shop_description"
                                        name="shop_description"
                                        rows={3}
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        placeholder="Tell us about your shop..."
                                        value={formData.shop_description}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Contact Details */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <FiPhone className="mr-2 text-green-600" /> Contact Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="shop_phone" className="block text-sm font-medium text-gray-700 mb-1">Shop Phone</label>
                                    <input
                                        id="shop_phone"
                                        name="shop_phone"
                                        type="tel"
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        placeholder="+1234567890"
                                        value={formData.shop_phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="shop_email" className="block text-sm font-medium text-gray-700 mb-1">Shop Email</label>
                                    <input
                                        id="shop_email"
                                        name="shop_email"
                                        type="email"
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        placeholder="shop@example.com"
                                        value={formData.shop_email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="shop_address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        id="shop_address"
                                        name="shop_address"
                                        type="text"
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        placeholder="123 Main St, City, Country"
                                        value={formData.shop_address}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Financial Details */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <FiCreditCard className="mr-2 text-green-600" /> Financial Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                    <input
                                        id="bank_name"
                                        name="bank_name"
                                        type="text"
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        placeholder="Bank of America"
                                        value={formData.bank_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="bank_account_number" className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                    <input
                                        id="bank_account_number"
                                        name="bank_account_number"
                                        type="text"
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        placeholder="123456789"
                                        value={formData.bank_account_number}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="bank_account_name" className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                                    <input
                                        id="bank_account_name"
                                        name="bank_account_name"
                                        type="text"
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        placeholder="John Doe"
                                        value={formData.bank_account_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                                    <input
                                        id="tax_id"
                                        name="tax_id"
                                        type="text"
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        placeholder="VAT-123456"
                                        value={formData.tax_id}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                         {/* Section: Branding */}
                         <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <FiUploadCloud className="mr-2 text-green-600" /> Branding
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Logo</label>
                                    <UploadImages
                                        maxFiles={1}
                                        maxSize={2097152} // 2MB
                                        uploadText="Upload Logo"
                                        onImagesUploaded={(files) => {
                                            if (files.length > 0) {
                                                setFormData(prev => ({ ...prev, shop_logo: files[0] }));
                                            } else {
                                                setFormData(prev => ({ ...prev, shop_logo: null }));
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Banner</label>
                                    <UploadImages
                                        maxFiles={1}
                                        maxSize={4194304} // 4MB
                                        uploadText="Upload Banner"
                                        onImagesUploaded={(files) => {
                                            if (files.length > 0) {
                                                setFormData(prev => ({ ...prev, shop_banner: files[0] }));
                                            } else {
                                                setFormData(prev => ({ ...prev, shop_banner: null }));
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white ${loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
                            >
                                {loading ? 'Registering...' : 'Register Shop'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SellerRegister;
