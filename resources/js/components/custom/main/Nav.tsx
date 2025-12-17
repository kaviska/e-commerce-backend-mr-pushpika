import React, { useState, useEffect, useRef } from 'react';
import { 
  FiSearch, 
  FiShoppingCart, 
  FiHeart, 
  FiGift, 
  FiUser, 
  FiMenu, 
  FiX,
  FiChevronDown,
  FiMapPin,
  FiArrowRight,
  FiLogOut,
  FiPackage
} from 'react-icons/fi';
import CategoryBar from '../home/CategoryBar';
import Logo from '../../../../../public/assets/logo.png';
import { logout } from '../../../hooks/api/auth';
import { searchProducts } from '../../../hooks/search';
import { toast } from 'sonner';
import { Link } from '@inertiajs/react';
import { useLocation } from '../../../hooks/useLocation';
import { getCart } from '../../../hooks/api/cart';
import { useWishlist } from '../../../hooks/useWishlist';

const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { wishlistCount } = useWishlist();
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { city, country, loading: locationLoading } = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      loadCartCount();
    }
  }, []);

  const loadCartCount = async () => {
    try {
      const cartData = await getCart();
      setCartCount(cartData.cart_items?.length || 0);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleLanguage = () => setIsLanguageOpen(!isLanguageOpen);

  const handleRedirectAuth = () => {
    if(isLoggedIn){
      window.location.href = '/profile';
    }else{
      window.location.href = '/login';
    }
  };

  const handleLogout = async () => {
    try {
        const response = await logout();
        if (response.success) {
            toast.success('Logged out successfully');
            setIsLoggedIn(false);
            window.location.href = '/login';
        } else {
            toast.error('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        toast.error('An error occurred during logout');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Search Handler with Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        // setIsSearching(true); // Already set in onChange
        try {
          const response = await searchProducts(searchQuery);
          if (response.status === 'success') {
             setSearchResults(response.data);
             // setShowResults(true); // Already set in onChange
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <>
      <div className="sticky top-0 z-50 will-change-transform">
        <nav className={`bg-white transition-all duration-300 ${
          isScrolled ? 'shadow-lg backdrop-blur-sm bg-white/95' : 'shadow-md'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-14 lg:h-16' : 'h-16 lg:h-20'
          }`}>
          
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <img src={Logo} className='md:w-30 md:ml-0 ml-7 md:h-30 w-24 h-24'/>
              </div>
            </div>


            {/* Location Tag */}
            <div className="hidden lg:flex items-center ml-0 pl-0 ">
              <FiMapPin className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-600">
                {locationLoading ? 'Locating...' : city && country ? `${city}, ${country}` : 'Select Location'}
              </span>
            </div>
          </div>

          {/* Center Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim().length > 0) {
                        setIsSearching(true);
                        setShowResults(true);
                    } else {
                        setShowResults(false);
                    }
                }}
                onFocus={() => {
                    if (searchQuery.trim().length > 0) setShowResults(true);
                }}
                placeholder="Search for products, brands and more..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                style={{ borderRadius: '40px' }}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button className="bg-primary text-white p-1.5 rounded-full hover:bg-primary-600 transition-colors opacity-0 group-focus-within:opacity-100 transform scale-90 group-focus-within:scale-100 duration-200">
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

             {/* Search Results Dropdown */}
            {showResults && (
                <div className="absolute top-full left-0 w-full mt-4 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden z-50 ring-1 ring-black/5 transform transition-all duration-300 origin-top">
                    {isSearching ? (
                        <div className="p-10 text-center">
                            <div className="relative w-12 h-12 mx-auto mb-4">
                                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <p className="text-sm font-medium text-gray-500 animate-pulse">Searching for products...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <>
                            <div className="px-6 py-4 bg-white/50 backdrop-blur-md border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Products Found</span>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/10">
                                    {searchResults.length} RESULTS
                                </span>
                            </div>
                            
                            <ul className="max-h-[32rem] overflow-y-auto p-3 custom-scrollbar space-y-2">
                                {searchResults.map((product) => (
                                    <li key={product.id}>
                                        <Link 
                                            href={`/product/${product.slug}`} 
                                            className="flex items-center p-3 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-primary/5 border border-transparent hover:border-primary/10 transition-all duration-300 group relative overflow-hidden"
                                            onClick={() => setShowResults(false)}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:via-primary/5 transition-all duration-500" />
                                            
                                            <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group-hover:border-primary/20 transition-colors relative z-10 shadow-sm">
                                                <img 
                                                    src={`/${product.primary_image}`} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                                                    }}
                                                />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0 ml-4 relative z-10">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm font-bold text-gray-900 truncate pr-4 group-hover:text-primary transition-colors duration-300">
                                                        {product.name}
                                                    </p>
                                                    {product.stocks && product.stocks.length > 0 && (
                                                        <span className="text-xs font-bold text-white bg-gradient-to-r from-green-500 to-green-600 px-2.5 py-1 rounded-full shadow-sm shadow-green-500/20 whitespace-nowrap">
                                                            ${product.stocks[0].web_price}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center mt-1.5 gap-2">
                                                    <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                                                        {product.category?.name}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="ml-3 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-primary">
                                                <FiArrowRight className="w-5 h-5" />
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <div className="p-3 bg-white/80 backdrop-blur-md border-t border-gray-100">
                                <Link 
                                    href="/products" 
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 text-gray-600 text-sm font-semibold hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group"
                                    onClick={() => setShowResults(false)}
                                >
                                    View All Results 
                                    <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="p-12 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50" />
                            <div className="relative z-10">
                                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] ring-4 ring-gray-50">
                                    <FiSearch className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No matches found</h3>
                                <p className="text-gray-500 text-sm mb-6 max-w-[200px] mx-auto">
                                    We couldn't find any products matching "{searchQuery}"
                                </p>
                                <Link 
                                    href="/products" 
                                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                                    onClick={() => setShowResults(false)}
                                >
                                    Browse Catalog
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}

          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            
            {/* Language Switcher - Hidden on mobile */}
            <div className="relative hidden md:block">
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 text-gray-700 hover:text-primary p-2 rounded-lg hover:bg-gray-100"
              >
                <span className="text-lg">🇺🇸</span>
                <span className="text-sm font-medium">EN</span>
                <FiChevronDown size={14} />
              </button>
              
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="mr-3">🇺🇸</span>
                      English
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="mr-3">🇪🇸</span>
                      Español
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="mr-3">🇫🇷</span>
                      Français
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Icon */}
            <button 
                onClick={handleRedirectAuth}
                className="text-gray-700 hover:text-primary p-2 rounded-lg hover:bg-gray-100 relative group"
            >
              <FiUser size={20} />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {isLoggedIn ? 'Profile' : 'Sign In'}
              </span>
            </button>

            {/* Orders Icon */}
            {isLoggedIn && (
                <Link 
                    href="/orders"
                    className="text-gray-700 hover:text-primary p-2 rounded-lg hover:bg-gray-100 relative group"
                >
                    <FiPackage size={20} />
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        My Orders
                    </span>
                </Link>
            )}

            {/* Logout Icon */}
            {isLoggedIn && (
                <button 
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100 relative group"
                >
                    <FiLogOut size={20} />
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Logout
                    </span>
                </button>
            )}

            {/* Wishlist Icon */}
            <Link href="/wishlist" className="text-gray-700 hover:text-primary p-2 rounded-lg hover:bg-gray-100 relative group">
              <FiHeart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Wishlist
              </span>
            </Link>

            {/* Gift Icon */}
            <button className="text-gray-700 hover:text-primary p-2 rounded-lg hover:bg-gray-100 relative group hidden sm:block">
              <FiGift size={20} />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Gifts
              </span>
            </button>

            {/* Cart Icon */}
            <a href="/cart" className="text-gray-700 hover:text-primary p-2 rounded-lg hover:bg-gray-100 relative group">
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Cart
              </span>
            </a>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-4 mt-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length > 0) {
                      setIsSearching(true);
                      setShowResults(true);
                  } else {
                      setShowResults(false);
                  }
              }}
              onFocus={() => {
                  if (searchQuery.trim().length > 0) setShowResults(true);
              }}
              placeholder="Search for products..."
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700 placeholder-gray-500"
              style={{ borderRadius: '40px' }}
            />
             {/* Mobile Search Results Dropdown */}
             {showResults && (
                <div className="absolute top-full left-0 w-full mt-3 rounded-3xl bg-white/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden z-50 animate-[fadeIn_0.18s_ease-out] max-h-[60vh] overflow-y-auto ring-1 ring-black/5">
                    {isSearching ? (
                        <div className="p-8 text-center">
                            <div className="relative w-10 h-10 mx-auto mb-3">
                                <div className="absolute inset-0 border-3 border-primary/20 rounded-full"></div>
                                <div className="absolute inset-0 border-3 border-primary rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <p className="text-xs font-medium text-gray-500 animate-pulse">Searching...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <>
                            <div className="px-5 py-3 border-b border-gray-100/50 bg-white/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Results</span>
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                    {searchResults.length}
                                </span>
                            </div>
                            <ul className="divide-y divide-gray-50">
                                {searchResults.map((product) => (
                                    <li key={product.id}>
                                        <Link 
                                            href={`/product/${product.slug}`} 
                                            className="flex items-center px-4 py-3 active:bg-gray-50 transition-all duration-200"
                                            onClick={() => setShowResults(false)}
                                        >
                                            <div className="w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm relative">
                                                <img 
                                                    src={`/${product.primary_image}`} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 ml-3.5">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className="text-sm font-bold text-gray-900 truncate pr-2">{product.name}</p>
                                                    {product.stocks && product.stocks.length > 0 && (
                                                        <span className="text-[10px] font-bold text-white bg-gradient-to-r from-green-500 to-green-600 px-2 py-0.5 rounded-full shadow-sm shadow-green-500/20 whitespace-nowrap">
                                                            ${product.stocks[0].web_price}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{product.category?.name}</p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="p-3 bg-white/80 backdrop-blur-md border-t border-gray-100 sticky bottom-0 z-10">
                                <Link 
                                    href="/products" 
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all duration-200"
                                    onClick={() => setShowResults(false)}
                                >
                                    View All Results 
                                    <FiArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="bg-gray-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                                <FiSearch className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-gray-900 font-bold text-sm mb-1">No matches found</p>
                            <p className="text-gray-500 text-xs mb-4">Try checking your spelling or use different keywords</p>
                            <Link 
                                href="/products" 
                                className="text-primary text-xs font-bold hover:underline uppercase tracking-wide"
                                onClick={() => setShowResults(false)}
                            >
                                Browse All Products
                            </Link>
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              
              {/* Mobile Language Switcher */}
              <div className="block md:hidden">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center justify-between w-full px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🇺🇸</span>
                    <span className="text-sm font-medium">Language</span>
                  </div>
                  <FiChevronDown size={14} />
                </button>
                
                {isLanguageOpen && (
                  <div className="mt-2 pl-4 space-y-1">
                    <button className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
                      <span className="mr-3">🇺🇸</span>
                      English
                    </button>
                    <button className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
                      <span className="mr-3">🇪🇸</span>
                      Español
                    </button>
                    <button className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
                      <span className="mr-3">🇫🇷</span>
                      Français
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Navigation Links */}
              <button onClick={handleRedirectAuth} className="flex items-center px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg">
                <FiUser className="mr-3" size={18} />
                My Account
              </button>
              {isLoggedIn && (
                <Link href="/orders" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg">
                  <FiPackage className="mr-3" size={18} />
                  My Orders
                </Link>
              )}
              <Link href="/wishlist" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg">
                <FiHeart className="mr-3" size={18} />
                Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
              <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg">
                <FiGift className="mr-3" size={18} />
                Gift Cards
              </a>
              <a href="/cart" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg">
                <FiShoppingCart className="mr-3" size={18} />
                Cart ({cartCount})
              </a>
            </div>
          </div>
        )}
        </div>
        </nav>
      </div>
      <CategoryBar />
    </>
  );
};

export default Nav;
