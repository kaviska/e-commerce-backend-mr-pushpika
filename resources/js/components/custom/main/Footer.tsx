import React from 'react';
import { 
  FiFacebook, 
  FiTwitter, 
  FiInstagram, 
  FiLinkedin, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiHeart,
  FiShield,
  FiTruck,
  FiCreditCard,
  FiChevronRight
} from 'react-icons/fi';
import Logo from '../../../../../public/assets/logo.png';
import { toast } from 'sonner';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-green-600 to-green-700 text-white mt-4">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left mb-8 lg:mb-0">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Stay Updated with Rozylo
              </h3>
              <p className="text-green-50 text-lg">
                Get exclusive deals, new arrivals, and special offers delivered to your inbox.
              </p>
            </div>
            
            <div className="w-full lg:w-auto lg:ml-8">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-green-100 focus:outline-none focus:ring-2 focus:ring-white border border-white/30"
                />
                <button 
                  onClick={() => toast.success('Subscribed successfully!', { description: 'Thank you for subscribing to our newsletter.' })}
                  className="bg-white text-green-600 px-6 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors duration-300 whitespace-nowrap shadow-lg">
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                  <img src={Logo} className='w-32 h-auto' alt="Rozylo Logo" />
                </div>
              </div>
              
              <p className="text-green-50 mb-6 leading-relaxed">
                Your trusted partner for quality shopping. We're committed to bringing you the best products with excellent service.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center text-green-50">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <FiMapPin className="w-4 h-4" />
                  </div>
                  <span>Japan - Premium Shopping Experience</span>
                </div>
                <div className="flex items-center text-green-50">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <FiPhone className="w-4 h-4" />
                  </div>
                  <span>+81 (0) 123-456-789</span>
                </div>
                <div className="flex items-center text-green-50">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <FiMail className="w-4 h-4" />
                  </div>
                  <span>hello@rozylo.jp</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  'About Us',
                  'Contact',
                  'Blog',
                  'Careers',
                  'Press',
                  'Gift Cards',
                  'Site Map'
                ].map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-green-50 hover:text-white transition-colors duration-300 flex items-center group"
                    >
                      <FiChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform text-green-300" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-xl font-semibold mb-6">Customer Service</h4>
              <ul className="space-y-3">
                {[
                  'Help Center',
                  'Track Your Order',
                  'Returns & Exchanges',
                  'Shipping Info',
                  'Size Guide',
                  'Product Care',
                  'FAQ'
                ].map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-green-50 hover:text-white transition-colors duration-300 flex items-center group"
                    >
                      <FiChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform text-green-300" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* My Account */}
            <div>
              <h4 className="text-xl font-semibold mb-6">My Account</h4>
              <ul className="space-y-3">
                {[
                  'Sign In',
                  'Create Account',
                  'Order History',
                  'Wishlist',
                  'Account Settings',
                  'Address Book',
                  'Payment Methods'
                ].map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-green-50 hover:text-white transition-colors duration-300 flex items-center group"
                    >
                      <FiChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform text-green-300" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="border-t border-green-400/30 py-8 bg-green-600/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 border border-white/30">
                <FiTruck className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-semibold">Free Shipping</h5>
                <p className="text-green-50 text-sm">On orders over LKR 5,000</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 border border-white/30">
                <FiShield className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-semibold">Secure Payment</h5>
                <p className="text-green-50 text-sm">100% secure checkout</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 border border-white/30">
                <FiHeart className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-semibold">Easy Returns</h5>
                <p className="text-green-50 text-sm">30-day return policy</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 border border-white/30">
                <FiCreditCard className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-semibold">Best Prices</h5>
                <p className="text-green-50 text-sm">Price match guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media & Bottom */}
      <div className="border-t border-green-400/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            
            {/* Social Media */}
            <div className="mb-6 lg:mb-0">
              <h5 className="text-lg font-semibold mb-4 text-center lg:text-left">Follow Us</h5>
              <div className="flex space-x-4 justify-center lg:justify-start">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/30 backdrop-blur-sm"
                >
                  <FiFacebook className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/30 backdrop-blur-sm"
                >
                  <FiTwitter className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/30 backdrop-blur-sm"
                >
                  <FiInstagram className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/30 backdrop-blur-sm"
                >
                  <FiLinkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Payment Methods & Copyright */}
            <div className="text-center lg:text-right">
              <div className="mb-4">
                <h6 className="text-sm font-semibold mb-2">We Accept</h6>
                <div className="flex space-x-3 justify-center lg:justify-end">
                  <div className="w-10 h-6 bg-white rounded text-xs flex items-center justify-center text-gray-800 font-bold">
                    VISA
                  </div>
                  <div className="w-10 h-6 bg-white rounded text-xs flex items-center justify-center text-gray-800 font-bold">
                    MC
                  </div>
                  <div className="w-10 h-6 bg-white rounded text-xs flex items-center justify-center text-gray-800 font-bold">
                    AMEX
                  </div>
                  <div className="w-10 h-6 bg-white rounded text-xs flex items-center justify-center text-gray-800 font-bold">
                    PP
                  </div>
                </div>
              </div>
              
              <div className="text-green-50 text-sm space-y-1">
                <p>&copy; {currentYear} Rozylo.jp. All rights reserved.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  <span className="hidden sm:inline">•</span>
                  <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                  <span className="hidden sm:inline">•</span>
                  <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;