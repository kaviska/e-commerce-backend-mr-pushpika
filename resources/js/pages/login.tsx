import React, { useState } from 'react';
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiArrowRight,
  FiCheckCircle,
  FiFacebook,
  FiTwitter
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import Logo from '../../../public/assets/logo.png';
import { login } from '../hooks/api/auth';
import { toast } from 'sonner';

const Login = () => {
  const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return { num1, num2, answer: num1 + num2 };
  };

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; captcha?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [mathQuestion, setMathQuestion] = useState(generateMathQuestion());
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; captcha?: string } = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!captchaAnswer) {
      newErrors.captcha = 'Please solve the math question';
    } else if (parseInt(captchaAnswer) !== mathQuestion.answer) {
      newErrors.captcha = 'Incorrect answer. Please try again.';
      // Generate new question on wrong answer
      setMathQuestion(generateMathQuestion());
      setCaptchaAnswer('');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    const device_name=navigator.userAgent;
    
    try {
      const response = await login(formData.email, formData.password,device_name);
      console.log('Login response:', response);
        if (response.success) {
        toast.success('Login successful',{
          duration: 5000,
          description: 'You will be redirected...',
          
        });
       
        
        const urlParams = new URLSearchParams(window.location.search);
        const redirectWith = urlParams.get('redirect_with');

        if (redirectWith) {
            window.location.href = `/${redirectWith}`;
        } else {
            const redirectUrl = localStorage.getItem('redirectUrl');
            if (redirectUrl) {
                localStorage.removeItem('redirectUrl');
                window.location.href = redirectUrl;
            } else {
                window.location.href = '/seller/dashboard';
            }
        }
      }
      else{
        toast.error(response.error,{
          duration: 5000,
          description: 'Please check your credentials',
          
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Handle social login
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          
          {/* Logo and Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              {/* <div className=" ">
                <img src={Logo} alt="Rozylo Logo" className="h-32 w-auto" />
              </div> */}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-600">
              Sign in to your account to continue shopping
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
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

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
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
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Math Captcha */}
            <div>
              <label htmlFor="captcha" className="block text-sm font-medium text-gray-700 mb-2">
                Security Check
              </label>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-xl border border-gray-300">
                  <span className="text-lg font-semibold text-gray-700">
                    {mathQuestion.num1} + {mathQuestion.num2} =
                  </span>
                </div>
                <input
                  id="captcha"
                  name="captcha"
                  type="number"
                  value={captchaAnswer}
                  onChange={(e) => {
                    setCaptchaAnswer(e.target.value);
                    if (errors.captcha) {
                      setErrors(prev => ({ ...prev, captcha: '' }));
                    }
                  }}
                  className={`block w-24 px-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.captcha ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="?"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMathQuestion(generateMathQuestion());
                    setCaptchaAnswer('');
                  }}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                  title="Generate new question"
                >
                  🔄
                </button>
              </div>
              {errors.captcha && (
                <p className="mt-2 text-sm text-red-600">{errors.captcha}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-yellow-400 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-green-600 hover:text-yellow-400 font-medium transition-colors">
                Forgot password?
              </a>
            </div>

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
                  Sign In
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
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-500 hover:bg-gray-50 hover:border-yellow-400 transition-all"
              >
                <FcGoogle className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('Facebook')}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-500 hover:bg-gray-50 hover:border-yellow-400 transition-all"
              >
                <FiFacebook className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('Twitter')}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-500 hover:bg-gray-50 hover:border-yellow-400 transition-all"
              >
                <FiTwitter className="h-5 w-5" />
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/register" className="font-medium text-green-600 hover:text-yellow-400 transition-colors">
                  Sign up here
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
                Join Our Community
              </h3>
              <p className="text-lg text-green-50 mb-8 leading-relaxed">
                Discover amazing products from trusted vendors around the world. Your shopping journey starts here.
              </p>

              {/* Features */}
              <div className="space-y-4 text-left">
                <div className="flex items-center">
                  <FiCheckCircle className="h-6 w-6 secondary mr-3 flex-shrink-0" />
                  <span className="text-green-50">Secure and trusted platform</span>
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="h-6 w-6 secondary mr-3 flex-shrink-0" />
                  <span className="text-green-50">Thousands of quality products</span>
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="h-6 w-6 secondary mr-3 flex-shrink-0" />
                  <span className="text-green-50">Fast and reliable shipping</span>
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="h-6 w-6 secondary mr-3 flex-shrink-0" />
                  <span className="text-green-50">24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
