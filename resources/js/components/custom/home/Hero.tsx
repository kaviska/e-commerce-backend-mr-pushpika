import React, { useEffect, useState } from 'react';
import { FiShoppingBag, FiArrowRight, FiStar, FiTruck, FiShield } from 'react-icons/fi';

const Hero = () => {

  // OFFER COUNTDOWN TIMER LOGIC
  const [timeLeft, setTimeLeft] = useState({
    hours: "00",
    minutes: "00",
    seconds: "00"
  });

  useEffect(() => {
    // Set offer ending time (example: 24 hours from now)
    const offerEndTime = new Date().getTime() + 24 * 60 * 60 * 1000;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = offerEndTime - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const redirectProducts = () => {
    window.location.href = '/products';
  }

  return (
    <div className="relative min-h-[500px] md:min-h-[600px] lg:h-[600px] overflow-hidden bg-gray-50">

      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700"></div>

        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-white rounded-full blur-[100px] mix-blend-overlay"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-yellow-300 rounded-full blur-[120px] mix-blend-overlay opacity-60"></div>
        </div>

        <div className="absolute top-20 left-10 w-24 h-24 border-4 border-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-16 h-16 bg-white/10 rotate-45 rounded-xl backdrop-blur-sm"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 h-full flex items-center py-12 lg:py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left Content */}
            <div className="text-white space-y-8 animate-in slide-in-from-left duration-700 fade-in">

              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                <span className="flex h-2 w-2 relative mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
                </span>
                <span className="text-sm font-medium tracking-wide">New Collection 2025</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                Discover <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100">
                  Premium
                </span> <br />
                Lifestyle
              </h1>

              <p className="text-lg md:text-lg text-gray-100 leading-relaxed max-w-lg font-light">
                Explore a curated marketplace of unique products from top-rated vendors. Quality, style, and sustainability in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button onClick={redirectProducts} className="group inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-700 font-bold rounded-full transition-all duration-300 hover:bg-yellow-50 hover:scale-105 shadow-lg hover:shadow-xl">
                  Start Shopping
                  <FiArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>

                <button className="inline-flex items-center justify-center px-8 py-4 border border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 font-semibold rounded-full transition-all duration-300">
                  View Categories
                </button>
              </div>

              {/* Trust Indicators (Mobile) */}
              <div className="pt-8 border-t border-white/10 flex md:hidden gap-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <FiTruck className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">Free Shipping</span>
                    <span className="text-xs text-white/70">On orders over $50</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <FiShield className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">Secure Payment</span>
                    <span className="text-xs text-white/70">100% protected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="relative hidden lg:block animate-in slide-in-from-right duration-1000 fade-in">
              <div className="relative z-10 transform hover:scale-[1.02] transition-transform duration-500">

                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl -mr-10"></div>

                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <p className="text-yellow-300 font-medium mb-1">Featured Deal</p>
                      <h3 className="text-3xl font-bold text-white">Summer Essentials</h3>
                    </div>
                    <div className="bg-yellow-400 text-emerald-900 font-bold px-4 py-2 rounded-lg">
                      -30% OFF
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="h-24 bg-gray-200/20 rounded-lg mb-3 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80" alt="Product" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-white font-medium text-sm">Smart Watch</p>
                      <p className="text-yellow-300 font-bold">$199.00</p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="h-24 bg-gray-200/20 rounded-lg mb-3 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80" alt="Product" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-white font-medium text-sm">Headphones</p>
                      <p className="text-yellow-300 font-bold">$299.00</p>
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div className="flex items-center justify-between text-white/80 text-sm">
                    <span>Offer ends in:</span>
                    <div className="flex gap-2 font-mono">
                      <span className="bg-black/20 px-2 py-1 rounded">{timeLeft.hours}</span>:
                      <span className="bg-black/20 px-2 py-1 rounded">{timeLeft.minutes}</span>:
                      <span className="bg-black/20 px-2 py-1 rounded">{timeLeft.seconds}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-300 rounded-full opacity-20 blur-2xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400 rounded-full opacity-20 blur-2xl"></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
