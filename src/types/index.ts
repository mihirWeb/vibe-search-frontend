export interface StoreItem {
    id: number;
    sku_id: string;
    title: string;
    slug: string;
    category: string;
    sub_category?: string;
    brand_name: string;
    product_type?: string;
    gender?: string;
    colorways?: string;
    brand_sku?: string;
    model?: string;
    lowest_price: number;
    description?: string;
    is_d2c?: boolean;
    is_active?: boolean;
    is_certificate_required?: boolean;
    featured_image?: string;
    pdp_url?: string;
    quantity_left?: number;
    wishlist_num?: number;
    stock_claimed_percent?: number;
    discount_percentage?: number;
    note?: string;
    tags?: string;
    release_date?: string;
    created_at: string;
    updated_at: string;
}

export interface SearchResult {
    id: string;
    title: string;
    description: string;
    image?: string;
    price?: number;
    category?: string;
    brand?: string;
}

export interface FilterOptions {
    categories: string[];
    brands: string[];
    priceRange: [number, number];
}