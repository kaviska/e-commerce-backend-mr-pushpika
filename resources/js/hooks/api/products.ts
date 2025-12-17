import { api } from "./api";

export interface Category {
    id: number;
    name: string;
    slug: string;
    image: string;
}

export interface Brand {
    id: number;
    name: string;
}

export interface VariationStock {
    id: number;
    stock_id: number;
    variation_option_id: number;
    image: string | null;
    variation_option: {
        id: number;
        name: string;
        variation: {
            id: number;
            name: string;
        }
    }
}

export interface Stock {
    id: number;
    product_id: number;
    quantity: number;
    web_price: number;
    pos_price: number;
    web_discount: number;
    pos_discount: number;
    cost: number;
    alert_quantity: number;
    seller_id: number;
    variation_stocks: VariationStock[];
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    primary_image: string;
    category_id: number;
    brand_id: number;
    type: string;
    seller_id: number;
    category: Category;
    brand: Brand;
    brand: Brand;
    stocks: Stock[];
    reviews_avg_rating?: number;
    reviews_count?: number;
}

export interface ProductResponse {
    status: string;
    message: string;
    data: Product[];
}

export interface PriceInfo {
    price: number;
    originalPrice?: number;
    discount?: number;
    discountPercentage?: number;
    inStock: boolean;
    stockCount: number;
    priceRange?: string;
    originalPriceRange?: string;
}

export interface ProductFilters {
    category_ids?: number[];
    brand_ids?: number[];
    web_price_min?: number;
    web_price_max?: number;
    in_stock?: boolean;
    has_web_discount?: boolean;
    search?: string;
}

export const getProducts = async (filters: ProductFilters = {}): Promise<ProductResponse> => {
    const params = new URLSearchParams();
    params.append("with", "all");
    params.append("limit", "100000");

    if (filters.category_ids?.length) {
        filters.category_ids.forEach(id => params.append("category_ids[]", id.toString()));
    }
    if (filters.brand_ids?.length) {
        filters.brand_ids.forEach(id => params.append("brand_ids[]", id.toString()));
    }
    if (filters.web_price_min !== undefined) params.append("web_price_min", filters.web_price_min.toString());
    if (filters.web_price_max !== undefined) params.append("web_price_max", filters.web_price_max.toString());
    if (filters.in_stock) params.append("in_stock", "1");
    if (filters.has_web_discount) params.append("has_web_discount", "1");

    if (filters.search) params.append("search", filters.search);

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
    const response = await api.get(`/products?slug=${slug}&with=all`);
    if (response.data.status === 'success' && response.data.data.length > 0) {
        return response.data.data[0];
    }
    return null;
};

export const getRelatedProducts = async (categoryId: number): Promise<Product[]> => {
    const response = await api.get(`/products?category_ids[]=${categoryId}&limit=10&with=all`);
    return response.data.data || [];
};

export const getCategories = async () => {
    const response = await api.get("/categories?limit=10000");
    return response.data;
};

export const getBrands = async () => {
    const response = await api.get("/brands?limit=10000");
    return response.data;
};

export const calculateProductPrice = (stocks: Stock[]): PriceInfo => {
    const totalStock = stocks.reduce((acc, stock) => acc + stock.quantity, 0);
    const inStock = totalStock > 0;

    if (!inStock) {
        return {
            price: 0,
            inStock: false,
            stockCount: 0,
            priceRange: "Out of Stock"
        };
    }

    // Calculate selling price for each stock
    const stockPrices = stocks.map(stock => {
        const original = stock.web_price;
        const discountPercent = stock.web_discount || 0;
        const discountAmount = (original * discountPercent) / 100;
        const selling = original - discountAmount;
        return { original, selling, discount: discountAmount, discountPercent };
    });

    const sellingPrices = stockPrices.map(s => s.selling);
    const minSelling = Math.min(...sellingPrices);
    const maxSelling = Math.max(...sellingPrices);

    const originalPrices = stockPrices.map(s => s.original);
    const minOriginal = Math.min(...originalPrices);
    const maxOriginal = Math.max(...originalPrices);

    // If only one stock variant or all have same selling price
    if (stocks.length === 1 || minSelling === maxSelling) {
        const stock = stockPrices.find(s => s.selling === minSelling)!;
        const discountPercentage = stock.discountPercent;

        return {
            price: stock.selling,
            originalPrice: stock.discountPercent > 0 ? stock.original : undefined,
            discount: stock.discount,
            discountPercentage,
            inStock: true,
            stockCount: totalStock
        };
    }

    // Multiple variants with different prices
    // Check if there are discounts
    const hasDiscount = stockPrices.some(s => s.discountPercent > 0);

    // Calculate max discount percentage
    const maxDiscountPercentage = stockPrices.reduce((max, s) => {
        return s.discountPercent > max ? s.discountPercent : max;
    }, 0);

    return {
        price: minSelling, // Base price for sorting
        priceRange: `$${minSelling} - $${maxSelling}`,
        originalPriceRange: hasDiscount ? `$${minOriginal} - $${maxOriginal}` : undefined,
        inStock: true,
        stockCount: totalStock,
        discount: hasDiscount ? (minOriginal - minSelling) : 0,
        discountPercentage: maxDiscountPercentage
    };
};
