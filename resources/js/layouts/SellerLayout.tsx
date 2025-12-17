import React, { useState, useEffect } from 'react';
import SellerSidebar from '../components/seller/SellerSidebar';
import SellerHeader from '../components/seller/SellerHeader';
import { cn } from '@/lib/utils';
import { usePage, router } from '@inertiajs/react';
import { SharedData } from '@/types';

interface SellerLayoutProps {
    children: React.ReactNode;
}

const SellerLayout = ({ children }: SellerLayoutProps) => {
    const { auth } = usePage<SharedData>().props;
    console.log('SellerLayout auth:', auth);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const token=localStorage.getItem('token')
        if (!token) {
            window.location.href = '/login?redirect_with=seller/dashboard';
        }
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-0 lg:pb-4">
                <SellerSidebar />
            </div>

            {/* Mobile Sidebar */}
            <div className={cn(
                "fixed inset-0 z-40 flex lg:hidden",
                sidebarOpen ? "pointer-events-auto" : "pointer-events-none"
            )}>
                <div 
                    className={cn(
                        "fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300",
                        sidebarOpen ? "opacity-100" : "opacity-0"
                    )}
                    onClick={() => setSidebarOpen(false)}
                />
                
                <div className={cn(
                    "relative flex-1 flex flex-col max-w-xs w-full bg-white transition ease-in-out duration-300 transform",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <SellerSidebar />
                </div>
            </div>

            {/* Main Column */}
            <div className="flex flex-col flex-1 w-0 overflow-hidden lg:pl-64">
                <SellerHeader onMenuClick={() => setSidebarOpen(true)} />
                
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SellerLayout;
