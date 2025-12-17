import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { toast } from 'sonner';
import { 
    getRegions, 
    getPrefecturesByRegion, 
    getPostalCodesByPrefecture,
    Region,
    Prefecture,
    PostalCode
} from '../../hooks/api/cart';

interface CheckoutFormProps {
    onSubmit: (formData: any) => void;
    loading: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        region_id: '',
        prefecture_id: '',
        postal_code: '',
        city: '',
        address_line_1: '',
        address_line_2: '',
        payment_method: 'card'
    });

    const [regions, setRegions] = useState<Region[]>([]);
    const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
    const [postalCodes, setPostalCodes] = useState<PostalCode[]>([]);
    const [loadingRegions, setLoadingRegions] = useState(false);
    const [loadingPrefectures, setLoadingPrefectures] = useState(false);
    const [loadingPostalCodes, setLoadingPostalCodes] = useState(false);

    useEffect(() => {
        loadRegions();
        
        // Pre-fill user data if logged in
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                mobile: user.mobile || ''
            }));
        }
    }, []);

    const loadRegions = async () => {
        setLoadingRegions(true);
        try {
            const data = await getRegions();
            setRegions(data);
        } catch (error) {
            console.error('Error loading regions:', error);
            toast.error('Failed to load regions');
        } finally {
            setLoadingRegions(false);
        }
    };

    const handleRegionChange = async (regionId: string) => {
        setFormData(prev => ({
            ...prev,
            region_id: regionId,
            prefecture_id: '',
            postal_code: '',
            city: ''
        }));
        setPrefectures([]);
        setPostalCodes([]);

        if (!regionId) return;

        setLoadingPrefectures(true);
        try {
            const data = await getPrefecturesByRegion(regionId);
            setPrefectures(data);
        } catch (error) {
            console.error('Error loading prefectures:', error);
            toast.error('Failed to load prefectures');
        } finally {
            setLoadingPrefectures(false);
        }
    };

    const handlePrefectureChange = async (prefectureId: string) => {
        const selectedPrefecture = prefectures.find(p => p.id.toString() === prefectureId);
        setFormData(prev => ({
            ...prev,
            prefecture_id: prefectureId,
            postal_code: '',
            city: ''
        }));
        setPostalCodes([]);

        if (!selectedPrefecture) return;

        setLoadingPostalCodes(true);
        try {
            const data = await getPostalCodesByPrefecture(selectedPrefecture.prefecture_name);
            setPostalCodes(data);
        } catch (error) {
            console.error('Error loading postal codes:', error);
            toast.error('Failed to load postal codes');
        } finally {
            setLoadingPostalCodes(false);
        }
    };

    const handlePostalCodeChange = (postalCode: string) => {
        const selectedPostalCode = postalCodes.find(pc => pc.postal_code === postalCode);
        setFormData(prev => ({
            ...prev,
            postal_code: postalCode,
            city: selectedPostalCode?.city_name_en || ''
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            toast.error('Please enter your name');
            return false;
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return false;
        }
        if (!formData.mobile.trim()) {
            toast.error('Please enter your mobile number');
            return false;
        }
        if (!formData.region_id) {
            toast.error('Please select a region');
            return false;
        }
        if (!formData.prefecture_id) {
            toast.error('Please select a prefecture');
            return false;
        }
        if (!formData.postal_code) {
            toast.error('Please select a postal code');
            return false;
        }
        if (!formData.city.trim()) {
            toast.error('City is required');
            return false;
        }
        if (!formData.address_line_1.trim()) {
            toast.error('Please enter your address');
            return false;
        }
        if (!formData.address_line_2.trim()) {
            toast.error('Please enter additional address details');
            return false;
        }
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiUser className="inline w-4 h-4 mr-1" />
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiMail className="inline w-4 h-4 mr-1" />
                            Email Address *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="john@example.com"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiPhone className="inline w-4 h-4 mr-1" />
                            Mobile Number *
                        </label>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="+81 90-1234-5678"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                    <FiMapPin className="inline w-5 h-5 mr-2" />
                    Shipping Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Region *</label>
                        <select
                            name="region_id"
                            value={formData.region_id}
                            onChange={(e) => handleRegionChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            disabled={loadingRegions}
                            required
                        >
                            <option value="">Select Region</option>
                            {regions.map(region => (
                                <option key={region.id} value={region.id}>{region.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prefecture *</label>
                        <select
                            name="prefecture_id"
                            value={formData.prefecture_id}
                            onChange={(e) => handlePrefectureChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            disabled={!formData.region_id || loadingPrefectures}
                            required
                        >
                            <option value="">Select Prefecture</option>
                            {prefectures.map(prefecture => (
                                <option key={prefecture.id} value={prefecture.id}>
                                    {prefecture.prefecture_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                        <select
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={(e) => handlePostalCodeChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            disabled={!formData.prefecture_id || loadingPostalCodes}
                            required
                        >
                            <option value="">Select Postal Code</option>
                            {postalCodes.map(pc => (
                                <option key={pc.postal_code} value={pc.postal_code}>
                                    {pc.postal_code}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                            placeholder="City"
                            readOnly
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                        <input
                            type="text"
                            name="address_line_1"
                            value={formData.address_line_1}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Street address, P.O. box"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2 *</label>
                        <input
                            type="text"
                            name="address_line_2"
                            value={formData.address_line_2}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Apartment, suite, unit, building, floor, etc."
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                    <FiCreditCard className="inline w-5 h-5 mr-2" />
                    Payment Method
                </h3>
                <div className="space-y-3">
                    {[
                        { value: 'card', label: 'Credit/Debit Card', description: 'Pay securely with Stripe' },
                        { value: 'cash_on_delivery', label: 'Cash on Delivery', description: 'Pay when you receive' },
                        { value: 'bank_transfer', label: 'Bank Transfer', description: 'Transfer to our account' },
                        { value: 'home_delivery_2', label: 'Home Delivery Payment', description: 'Available for select areas' }
                    ].map((method) => (
                        <label
                            key={method.value}
                            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                formData.payment_method === method.value
                                    ? 'border-green-600 bg-green-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <input
                                type="radio"
                                name="payment_method"
                                value={method.value}
                                checked={formData.payment_method === method.value}
                                onChange={handleInputChange}
                                className="mt-1 mr-3"
                            />
                            <div>
                                <div className="font-semibold text-gray-900">{method.label}</div>
                                <div className="text-sm text-gray-500">{method.description}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-full transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Processing...' : 'Continue to Payment'}
            </button>
        </form>
    );
};

export default CheckoutForm;
