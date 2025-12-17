import { useState, useEffect } from 'react';

export interface WishlistItem {
    id: number;
    name: string;
    slug: string;
    primary_image: string;
    category_name?: string;
    brand_name?: string;
    price?: number;
    discount?: number;
    added_at: string;
}

const WISHLIST_KEY = 'wishlist';

export const useWishlist = () => {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = () => {
        const stored = localStorage.getItem(WISHLIST_KEY);
        if (stored) {
            try {
                setWishlist(JSON.parse(stored));
            } catch (error) {
                console.error('Error loading wishlist:', error);
                setWishlist([]);
            }
        }
    };

    const addToWishlist = (item: Omit<WishlistItem, 'added_at'>) => {
        const newItem: WishlistItem = {
            ...item,
            added_at: new Date().toISOString()
        };
        
        const updatedWishlist = [...wishlist, newItem];
        setWishlist(updatedWishlist);
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist));
        return true;
    };

    const removeFromWishlist = (productId: number) => {
        const updatedWishlist = wishlist.filter(item => item.id !== productId);
        setWishlist(updatedWishlist);
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist));
    };

    const isInWishlist = (productId: number) => {
        return wishlist.some(item => item.id === productId);
    };

    const toggleWishlist = (item: Omit<WishlistItem, 'added_at'>) => {
        if (isInWishlist(item.id)) {
            removeFromWishlist(item.id);
            return false;
        } else {
            addToWishlist(item);
            return true;
        }
    };

    const clearWishlist = () => {
        setWishlist([]);
        localStorage.removeItem(WISHLIST_KEY);
    };

    return {
        wishlist,
        wishlistCount: wishlist.length,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
        loadWishlist
    };
};
