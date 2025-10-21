import { useState, useCallback } from 'react';
import { api, StoreItem } from '@/services/api';

export const useSearch = () => {
    const [results, setResults] = useState<StoreItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [filters, setFilters] = useState<any>({});

    const search = useCallback(async (
        query: string = '', 
        page: number = 1, 
        pageSize: number = 20,
        appliedFilters: any = {}
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            const requestFilters: any = { ...appliedFilters };
            
            // Add search query if provided
            if (query && query.trim()) {
                requestFilters.search_query = query.trim();
            }

            const response = await api.getStoreItems({
                page,
                page_size: pageSize,
                filters: Object.keys(requestFilters).length > 0 ? requestFilters : undefined,
                sort_by: 'created_at',
                sort_order: 'desc'
            });

            setResults(response.items);
            setCurrentPage(response.pagination.current_page);
            setTotalPages(response.pagination.total_pages);
            setTotalItems(response.pagination.total_items);
            setFilters(appliedFilters);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        results,
        isLoading,
        error,
        search,
        currentPage,
        totalPages,
        totalItems,
        filters
    };
};