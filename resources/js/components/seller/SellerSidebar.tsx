import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Package, 
    ShoppingBag, 
    Settings, 
    LogOut,
    Store,
    BarChart3,
    ChevronDown,
    ChevronRight,
    Plus,
    List,
    Tag,
    Layers,
    Bell,
    Image,
    Archive,
    Users,
    GitBranch
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
    Collapsible, 
    CollapsibleContent, 
    CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { logout } from '@/hooks/api/auth';
import { toast } from 'sonner';

interface SidebarProps {
    className?: string;
}

const SellerSidebar = ({ className }: SidebarProps) => {
    const { url } = usePage();
    const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
        'Products': true // Default open
    });

    const toggleSubmenu = (name: string) => {
        setOpenSubmenus(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const handleLogout = async () => {
        try {
            const response = await logout();
            if (response.success) {
                toast.success('Logged out successfully');
                window.location.href = '/login';
            } else {
                toast.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('An error occurred during logout');
        }
    };

    const navigation = [
        { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
        { 
            name: 'Products', 
            icon: Package,
            children: [
                { name: 'Add Stock', href: '/seller/products/add-existing', icon: Plus },
                { name: 'Create New Product', href: '/seller/products/create', icon: List },
                { name: 'Manage Products', href: '/seller/products/manage', icon: Settings },
                { name: 'Manage Stock', href: '/seller/stocks/manage', icon: Archive },
                { name: 'Brands', href: '/seller/brands/add', icon: Tag },
                { name: 'Manage Brands', href: '/seller/brands/manage', icon: Settings },
                { name: 'Categories', href: '/seller/categories/add', icon: Layers },
                { name: 'Manage Categories', href: '/seller/categories/manage', icon: Settings },
                { name: 'Variations', href: '/seller/variations', icon: GitBranch },
            ]
        },
        { name: 'Orders', href: '/seller/orders', icon: ShoppingBag },
        { name: 'Hero Sliders', href: '/seller/hero-sliders', icon: Image },
        { name: 'Analytics', href: '/seller/analytics', icon: BarChart3 },
        { name: 'Notifications', href: '/seller/notifications', icon: Bell },
        { name: 'Admin Users', href: '/seller/users', icon: Users },
        { name: 'Shop Settings', href: '/seller/settings', icon: Store },
        { name: 'Account', href: '/seller/profile', icon: Settings },
    ];

    return (
        <div className={cn("flex flex-col h-full bg-white border-r border-gray-200", className)}>
            <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
                <Link href="/" className="flex items-center gap-2">
                    <Store className="w-8 h-8 text-green-600" />
                    <span className="text-xl font-bold text-gray-900">SellerCenter</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-2 space-y-1">
                    {navigation.map((item) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isActive = item.href ? url.startsWith(item.href) : false;
                        const isChildActive = item.children?.some(child => url.startsWith(child.href));
                        
                        if (hasChildren) {
                            return (
                                <Collapsible
                                    key={item.name}
                                    open={openSubmenus[item.name]}
                                    onOpenChange={() => toggleSubmenu(item.name)}
                                    className="space-y-1"
                                >
                                    <CollapsibleTrigger
                                        className={cn(
                                            "group flex w-full items-center justify-between px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                            isChildActive
                                                ? "bg-green-50 text-green-700"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <div className="flex items-center">
                                            <item.icon
                                                className={cn(
                                                    "mr-3 h-5 w-5 flex-shrink-0",
                                                    isChildActive ? "text-green-600" : "text-gray-400 group-hover:text-gray-500"
                                                )}
                                            />
                                            {item.name}
                                        </div>
                                        {openSubmenus[item.name] ? (
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        )}
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="space-y-1 pl-11 pr-2">
                                        {item.children?.map((child) => {
                                            const isChildLinkActive = url.startsWith(child.href);
                                            return (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    className={cn(
                                                        "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                                        isChildLinkActive
                                                            ? "text-green-700 bg-green-50"
                                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                                    )}
                                                >
                                                    {child.name}
                                                </Link>
                                            );
                                        })}
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.href!}
                                className={cn(
                                    "group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-green-50 text-green-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 h-5 w-5 flex-shrink-0",
                                        isActive ? "text-green-600" : "text-gray-400 group-hover:text-gray-500"
                                    )}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default SellerSidebar;
