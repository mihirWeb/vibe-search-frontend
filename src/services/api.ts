const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

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

export interface PaginationMeta {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface StoreItemFilters {
    category?: string[];
    brand_name?: string[];
    product_type?: string[];
    gender?: string[];
    min_price?: number;
    max_price?: number;
    search_query?: string;
}

export interface StoreItemListRequest {
    page: number;
    page_size: number;
    filters?: StoreItemFilters;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface StoreItemListResponse {
    success: boolean;
    message: string;
    items: StoreItem[];
    pagination: PaginationMeta;
    filters_applied?: any;
}

export interface FilterOptions {
    categories: string[];
    product_types: string[];
    genders: string[];
    brands: string[];
    price_range: {
        min: number;
        max: number;
    };
}

export const api = {
    async getStoreItems(request: StoreItemListRequest): Promise<StoreItemListResponse> {
        const response = await fetch(`${API_BASE_URL}/store-items/list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch store items: ${response.statusText}`);
        }

        return response.json();
    },

    async getFilterOptions(): Promise<FilterOptions> {
        const response = await fetch(`${API_BASE_URL}/store-items/filter-options`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch filter options: ${response.statusText}`);
        }

        return response.json();
    },
};