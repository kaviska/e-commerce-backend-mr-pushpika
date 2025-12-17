import React, { useState } from 'react';
import { 
  FiUser,
  FiMail, 
  FiPhone,
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiArrowRight,
  FiCheckCircle,
  FiFacebook,
  FiTwitter,
  FiKey
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import Logo from '../../../public/assets/logo.png';
import { register } from '../hooks/api/auth';
import { toast } from 'sonner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    password_confirmation: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (pass.length >= 10) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const generateStrongPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: password, password_confirmation: password }));
    setShowPassword(true);
    setShowConfirmPassword(true);
    setPasswordStrength(calculatePasswordStrength(password));
    // Clear password errors
    setErrors(prev => ({ ...prev, password: '', password_confirmation: '' }));
    
    toast.success('Strong password generated', {
        description: 'Password has been copied to clipboard',
    });
    navigator.clipboard.writeText(password);
  };

  const validateField = (name: string, value: any) => {
    let error = '';
    switch (name) {
        case 'email':
            if (!value) error = 'Email is required';
            else if (!/\S+@\S+\.\S+/.test(value)) error = 'Please enter a valid email';
            break;
        case 'password':
            if (!value) error = 'Password is required';
            else if (value.length < 6) error = 'Password must be at least 6 characters';
            break;
        case 'password_confirmation':
            if (formData.password && value !== formData.password) {
                error = 'Passwords do not match';
            }
            break;
        case 'mobile':
            if (!value) error = 'Mobile number is required';
            break;
        case 'name':
            if (!value) error = 'Name is required';
            break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Real-time validation
    validateField(name, newValue);

    if (name === 'password') {
        setPasswordStrength(calculatePasswordStrength(value));
        if (formData.password_confirmation && value !== formData.password_confirmation) {
             setErrors(prev => ({ ...prev, password_confirmation: 'Passwords do not match' }));
        } else if (formData.password_confirmation && value === formData.password_confirmation) {
             setErrors(prev => ({ ...prev, password_confirmation: '' }));
        }
    }
    
    if (name === 'password_confirmation') {
         if (formData.password && value !== formData.password) {
             setErrors(prev => ({ ...prev, password_confirmation: 'Passwords do not match' }));
         } else {
             setErrors(prev => ({ ...prev, password_confirmation: '' }));
         }
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.mobile) {
        newErrors.mobile = 'Mobile number is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    const device_name = navigator.userAgent;
    
    try {
      const response = await register(
        formData.name, 
        formData.email, 
        formData.mobile,
        formData.password, 
        formData.password_confirmation, 
        device_name
      );
      
      if (response.success) {
        toast.success('Registration successful', {
          duration: 5000,
          description: 'Please verify your email.',
        });
        window.location.href = '/otp-verification';
      } else {
         // Handle object errors (validation errors) or string error
         if (typeof response.error === 'object' && response.error !== null) {
            // If it's an object, it's likely validation errors. 
            // We can display the first one or map them.
            // For simplicity in toast, we might just show a generic message or the first error.
            // But let's try to set form errors if keys match.
            const apiErrors: { [key: string]: string } = {};
            let firstErrorMessage = '';
            
            Object.entries(response.error).forEach(([key, messages]) => {
                const message = Array.isArray(messages) ? messages[0] : messages as string;
                apiErrors[key] = message;
                if (!firstErrorMessage) firstErrorMessage = message;
            });
            
            setErrors(prev => ({ ...prev, ...apiErrors }));
            
            toast.error(firstErrorMessage || 'Registration failed', {
                duration: 5000,
                description: 'Please check the form for errors.',
            });

        } else {
            toast.error(response.error as string, {
                duration: 5000,
                description: 'Please try again.',
            });
        }
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Register with ${provider}`);
    // Handle social login
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 py-12">
        <div className="max-w-md w-full space-y-8">
          
          {/* Logo and Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className=" ">
                <img src={Logo} alt="Rozylo Logo" className="h-32 w-auto" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">
              Join us to start your shopping journey
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Mobile Field */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  autoComplete="tel"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.mobile ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your mobile number"
                />
              </div>
              {errors.mobile && (
                <p className="mt-2 text-sm text-red-600">{errors.mobile}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={generateStrongPassword}
                  className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center"
                >
                  <FiKey className="mr-1" /> Suggest Strong Password
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator & Requirements */}
              {formData.password && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
                  <ul className="space-y-1">
                    {[
                      { label: "At least 6 characters", valid: formData.password.length >= 6 },
                      { label: "At least one uppercase letter", valid: /[A-Z]/.test(formData.password) },
                      { label: "At least one number", valid: /[0-9]/.test(formData.password) },
                      { label: "At least one special character", valid: /[^A-Za-z0-9]/.test(formData.password) },
                    ].map((req, index) => (
                      <li 
                        key={index} 
                        className={`text-xs flex items-center transition-colors duration-200 ${
                          req.valid ? 'text-green-600 font-medium' : 'text-gray-500'
                        }`}
                      >
                        {req.valid ? (
                          <FiCheckCircle className="mr-2 h-3 w-3 text-green-500" />
                        ) : (
                          <div className="mr-2 h-1.5 w-1.5 rounded-full bg-gray-300" />
                        )}
                        <span className={req.valid ? 'line-through opacity-75' : ''}>
                            {req.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Strength Bar */}
                  <div className="mt-3">
                    <div className="flex space-x-1 h-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                        <div
                            key={level}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                            passwordStrength >= level
                                ? passwordStrength <= 2
                                ? 'bg-red-500'
                                : passwordStrength <= 3
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                        />
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                        {passwordStrength <= 2 && 'Weak'}
                        {passwordStrength === 3 && 'Medium'}
                        {passwordStrength >= 4 && 'Strong'}
                    </p>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="mt-2 text-sm text-red-600">{errors.password_confirmation}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-green-600 hover:text-green-500">
                  Terms and Conditions
                </a>
              </label>
            </div>
            {errors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <FiArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or register with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-500 hover:bg-gray-50 hover:border-green-500 transition-all"
              >
                <FcGoogle className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('Facebook')}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-500 hover:bg-gray-50 hover:border-green-500 transition-all"
              >
                <FiFacebook className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('Twitter')}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-500 hover:bg-gray-50 hover:border-green-500 transition-all"
              >
                <FiTwitter className="h-5 w-5" />
              </button>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Brand Section */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-green-600 to-green-700">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full p-12 text-white">
            <div className="text-center max-w-md">
              <h3 className="text-3xl font-bold mb-6">
                Start Your Journey
              </h3>
              <p className="text-lg text-green-50 mb-8 leading-relaxed">
                Join thousands of satisfied customers and experience the best in online shopping.
              </p>

              {/* Features */}
              <div className="space-y-4 text-left">
                <div className="flex items-center">
                  <FiCheckCircle className="h-6 w-6 text-green-200 mr-3 flex-shrink-0" />
                  <span className="text-green-50">Exclusive deals and offers</span>
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="h-6 w-6 text-green-200 mr-3 flex-shrink-0" />
                  <span className="text-green-50">Track your orders easily</span>
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="h-6 w-6 text-green-200 mr-3 flex-shrink-0" />
                  <span className="text-green-50">Secure payment options</span>
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="h-6 w-6 text-green-200 mr-3 flex-shrink-0" />
                  <span className="text-green-50">Personalized recommendations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
