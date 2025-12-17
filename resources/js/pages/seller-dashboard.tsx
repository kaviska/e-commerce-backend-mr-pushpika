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

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.name} className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="flex items-baseline justify-between pt-4">
                                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                <div className={`flex items-center text-xs font-medium ${
                                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                    {stat.change}
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">from last month</p>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    
                    {/* Chart Placeholder (Visual Representation) */}
                    <div className="col-span-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
                            <Button variant="outline" size="sm">Download</Button>
                        </div>
                        <div className="h-[300px] flex items-end justify-between gap-2 px-2">
                            {/* Dummy Bar Chart Visual */}
                            {[40, 65, 45, 80, 55, 70, 40, 60, 75, 50, 85, 60].map((height, i) => (
                                <div key={i} className="w-full bg-green-50 hover:bg-green-100 rounded-t-md relative group transition-all">
                                    <div 
                                        className="absolute bottom-0 w-full bg-green-500 rounded-t-md transition-all duration-500 group-hover:bg-green-600"
                                        style={{ height: `${height}%` }}
                                    ></div>
                                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="col-span-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">View All</Button>
                        </div>
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-gray-200">
                                            <ShoppingBag className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                                            <p className="text-xs text-gray-500">{order.product}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">{order.amount}</p>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerDashboard;
