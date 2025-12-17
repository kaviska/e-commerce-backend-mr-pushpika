export interface Category {
    id: number;
    name: string;
    slug: string;
    image: string;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    primary_image: string;
    category_id: number;
    brand_id: number;
    stocks?: Stock[];
}

export interface Brand {
    id: number;
    name: string;
    slug: string;
    image: string;
}

export interface Stock {
    id: number;
    product_id: number;
    quantity: number;
    web_price: number;
    pos_price: number;
    web_discount: number;
    pos_discount: number;
    reserved_quantity: number;

    variation_stocks: VariationStock[];

    variation_name: string;
    variation_option_name: string;
    variation_option_id: number;
}

export interface VariationStock {
    id: number;
    stock_id: number;
    variation_option_id: number;
    variation_option: VariationOption;
}

export interface VariationOption {
    id: number;
    name: string;
    variation_id: number;
    variation: Variation;
}

export interface Variation {
    id: number;
    name: string;
}
