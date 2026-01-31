import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SellerHeaderProps {
    onMenuClick: () => void;
}

const SellerHeader = ({ onMenuClick }: SellerHeaderProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    className="p-2 -ml-2 text-gray-500 rounded-md lg:hidden hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
                    onClick={onMenuClick}
                >
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="w-6 h-6" />
                </button>

                {/* Real-time Date & Time Display */}
                <div className="hidden md:flex items-center gap-4 pl-4 border-l border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 bg-green-50 rounded-md">
                            <Calendar className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="font-medium text-gray-700">{formatDate(currentTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 bg-blue-50 rounded-md">
                            <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-mono font-semibold text-gray-700 tabular-nums">{formatTime(currentTime)}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
               
                {/* <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100">
                                <User className="h-5 w-5 text-gray-500" />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">Seller Account</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    seller@example.com
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu> */}
            </div>
        </header>
    );
};

export default SellerHeader;
