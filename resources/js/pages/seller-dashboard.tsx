import React from 'react';
import SellerLayout from '../layouts/SellerLayout';
import { 
    DollarSign, 
    ShoppingBag, 
    Package, 
    TrendingUp, 
    ArrowUpRight, 
    ArrowDownRight,
    MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SellerDashboard = () => {
    // Dummy Data
    const stats = [
        { 
            name: 'Total Revenue', 
            value: '$45,231.89', 
            change: '+20.1%', 
            trend: 'up',
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        { 
            name: 'Orders', 
            value: '+2350', 
            change: '+180.1%', 
            trend: 'up',
            icon: ShoppingBag,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        { 
            name: 'Products', 
            value: '12', 
            change: '-4.5%', 
            trend: 'down',
            icon: Package,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        },
        { 
            name: 'Active Now', 
            value: '+573', 
            change: '+201', 
            trend: 'up',
            icon: TrendingUp,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
        },
    ];

    const recentOrders = [
        { id: '#ORD-7352', product: 'Wireless Headphones', customer: 'Alice Smith', date: '2 mins ago', amount: '$120.00', status: 'Pending' },
        { id: '#ORD-7351', product: 'Smart Watch Series 7', customer: 'Bob Johnson', date: '15 mins ago', amount: '$350.00', status: 'Processing' },
        { id: '#ORD-7350', product: 'Mechanical Keyboard', customer: 'Charlie Brown', date: '1 hour ago', amount: '$89.99', status: 'Completed' },
        { id: '#ORD-7349', product: 'USB-C Hub', customer: 'Diana Prince', date: '3 hours ago', amount: '$45.50', status: 'Completed' },
        { id: '#ORD-7348', product: 'Gaming Mouse', customer: 'Evan Wright', date: '5 hours ago', amount: '$60.00', status: 'Cancelled' },
    ];

    return (
        <SellerLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500">Overview of your shop's performance.</p>
                </div>

                {/* Under Development Notice */}
                <div className="flex items-center justify-center p-20 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
                    <div className="text-center max-w-md">
                        <Package className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Dashboard Under Development</h2>
                        <p className="text-gray-500 text-lg">We're working on bringing you an amazing dashboard experience. Stay tuned!</p>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerDashboard;
