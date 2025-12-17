import React from 'react';
import { FiArrowRight, FiTrendingUp, FiDollarSign, FiUsers, FiCheck } from 'react-icons/fi';

const SellerCTA = () => {
  return (
    <div className="py-20 bg-white relative overflow-hidden">

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-green-50 mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-blue-50 mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute -bottom-24 right-1/4 w-80 h-80 rounded-full bg-purple-50 mix-blend-multiply filter blur-3xl opacity-70"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">

          {/* Left Content */}
          <div className="lg:col-span-6 text-center lg:text-left mb-12 lg:mb-0">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              Now accepting new sellers
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
              Turn your passion into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                a thriving business
              </span>
            </h2>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Join the fastest-growing marketplace. We provide the tools, support, and audience you need to scale your brand to new heights.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <a
                href="/seller/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-2xl text-white bg-gray-900 hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Selling
                <FiArrowRight className="ml-2 w-5 h-5" />
              </a>
              <a
                href="/seller/learn-more"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-gray-200 text-base font-semibold rounded-2xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300"
              >
                How it works
              </a>
            </div>

            <div className="mt-10 flex items-center justify-center lg:justify-start space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <FiCheck className="text-green-500 mr-2" />
                No setup fees
              </div>
              <div className="flex items-center">
                <FiCheck className="text-green-500 mr-2" />
                Secure payments
              </div>
              <div className="flex items-center">
                <FiCheck className="text-green-500 mr-2" />
                24/7 Support
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Placeholder */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto w-full max-w-md lg:max-w-full space-y-8">

              {/* Earnings Main Card */}
             

              {/* PIE + ARC Dashboard */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 z-20">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Seller Analytics</h3>

                <div className="grid grid-cols-2 gap-6">

                  {/* Pie Chart */}
                  <div className="flex flex-col items-center">
                    <svg width="120" height="120" viewBox="0 0 36 36" className="transform -rotate-90">
                      <circle cx="18" cy="18" r="16" stroke="#e5e7eb" strokeWidth="3.5" fill="transparent" />
                      <circle cx="18" cy="18" r="16" stroke="#22c55e" strokeWidth="3.5" strokeDasharray="30 100" strokeLinecap="round" fill="transparent" />
                      <circle cx="18" cy="18" r="16" stroke="#3b82f6" strokeWidth="3.5" strokeDasharray="20 100" strokeDashoffset="-30" strokeLinecap="round" fill="transparent" />
                      <circle cx="18" cy="18" r="16" stroke="#f97316" strokeWidth="3.5" strokeDasharray="15 100" strokeDashoffset="-50" strokeLinecap="round" fill="transparent" />
                    </svg>
                    <p className="mt-3 text-sm text-gray-600">Sales Distribution</p>
                  </div>

                  {/* Arc / Radial Progress */}
                  <div className="flex flex-col items-center">
                    <svg width="120" height="120" className="transform -rotate-90">
                      <circle cx="60" cy="60" r="50" stroke="#e5e7eb" strokeWidth="10" fill="transparent" />
                      <circle cx="60" cy="60" r="50" stroke="#16a34a" strokeWidth="10" strokeDasharray="220 360" strokeLinecap="round" fill="transparent" />
                    </svg>
                    <p className="mt-3 text-sm text-gray-600">Monthly Goal</p>
                  </div>

                </div>

                {/* Stats */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">12.4k</p>
                    <p className="text-xs text-gray-500">Views</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">4.8k</p>
                    <p className="text-xs text-gray-500">Clicks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">3.9%</p>
                    <p className="text-xs text-gray-500">Conversion</p>
                  </div>
                </div>
              </div>

              {/* Floating Element 1 */}
              <div className="absolute -top-12 -right-12 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 hidden sm:block animate-bounce-slow">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <FiUsers className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">New Customers</p>
                    <p className="text-lg font-bold text-gray-900">+1,240</p>
                  </div>
                </div>
              </div>

              {/* Floating Element 2 */}
              <div className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 hidden sm:block animate-pulse-slow">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600"
                      >
                        U{i}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-gray-600">Just joined!</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SellerCTA;
