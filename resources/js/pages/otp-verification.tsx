import React, { useState, useRef, useEffect } from 'react';
import { 
  FiLock, 
  FiArrowRight,
  FiCheckCircle
} from 'react-icons/fi';
import Logo from '../../../public/assets/logo.png';
import { verifyOtp, resendOtp } from '../hooks/api/auth';
import { toast } from 'sonner';

const OtpVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on Backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 4) newOtp[index] = char;
    });
    setOtp(newOtp);
    
    // Focus the last filled input or the next empty one
    const lastIndex = Math.min(pastedData.length, 3);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 4) {
        toast.error('Please enter the complete 4-digit OTP');
        return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await verifyOtp(otpString);
      
      if (response.success) {
        toast.success('Email verified successfully', {
          duration: 5000,
          description: 'You will be redirected to the dashboard',
        });
        // Redirect to home page or intended page
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
                window.location.href = '/';
            }
        }
      } else {
         if (typeof response.error === 'object' && response.error !== null) {
            const messages = Object.values(response.error).flat();
            toast.error(messages[0] as string || 'Verification failed', {
                duration: 5000,
            });
        } else {
            toast.error(response.error as string, {
                duration: 5000,
                description: 'Please try again.',
            });
        }
      }
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
        const response = await resendOtp();
        if (response.success) {
            toast.info('OTP resent successfully', {
                description: 'Please check your email inbox.',
            });
        } else {
            toast.error(response.error as string || 'Failed to resend OTP');
        }
    } catch (error) {
        console.error('Resend failed:', error);
        toast.error('Failed to resend OTP');
    } finally {
        setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - OTP Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          
          {/* Logo and Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className=" ">
                <img src={Logo} alt="Rozylo Logo" className="h-32 w-auto" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600">
              Please enter the 4-digit code sent to your email
            </p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* OTP Inputs */}
            <div className="flex justify-center space-x-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-14 h-14 text-center text-2xl font-bold border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  autoComplete="off"
                />
              ))}
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
                  Verify Email
                  <FiArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button 
                    type="button" 
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="font-medium text-green-600 hover:text-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? 'Resending...' : 'Resend OTP'}
                </button>
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
                Secure Your Account
              </h3>
              <p className="text-lg text-green-50 mb-8 leading-relaxed">
                Verifying your email helps us keep your account safe and secure.
              </p>

              {/* Features */}
              <div className="space-y-4 text-left">
                <div className="flex items-center">
                  <FiCheckCircle className="h-6 w-6 text-green-200 mr-3 flex-shrink-0" />
                  <span className="text-green-50">Enhanced security</span>
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="h-6 w-6 text-green-200 mr-3 flex-shrink-0" />
                  <span className="text-green-50">Account recovery</span>
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="h-6 w-6 text-green-200 mr-3 flex-shrink-0" />
                  <span className="text-green-50">Important notifications</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
