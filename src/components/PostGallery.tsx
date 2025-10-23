"use client";

import React, { useState, useEffect } from 'react';
import ProductDetail from './ProductDetail';

interface ProductPost {
    id: number;
    image_url: string;
    name: string;
    brand?: string;
    category?: string;
}

const PostsGallery: React.FC = () => {
    const [posts, setPosts] = useState<ProductPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

    useEffect(() => {
        loadPosts(1);
    }, []);

    const getImageProxyUrl = (imageUrl: string | null | undefined): string | null => {
        if (!imageUrl) return null;
        return `${process.env.NEXT_PUBLIC_API_URL}/products/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    };

    const loadPosts = async (page: number) => {
        try {
            setLoading(true);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: page,
                    page_size: 50,
                    sort_by: 'created_at',
                    sort_order: 'desc'
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.statusText}`);
            }

            const data = await response.json();
            
            console.log('[Posts Gallery] Loaded products:', data);
            
            const formattedPosts = data.products
                .filter((product: any) => product.image_url)
                .map((product: any) => ({
                    id: product.id,
                    image_url: product.image_url,
                    name: product.name,
                    brand: product.brand,
                    category: product.category
                }));
            
            if (page === 1) {
                setPosts(formattedPosts);
            } else {
                setPosts(prev => [...prev, ...formattedPosts]);
            }
            
            setCurrentPage(data.pagination.current_page);
            setTotalPages(data.pagination.total_pages);
            setHasMore(data.pagination.has_next);
            
        } catch (error) {
            console.error('Failed to load posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (hasMore && !loading) {
            loadPosts(currentPage + 1);
        }
    };

    const handlePostClick = (productId: number) => {
        setSelectedProductId(productId);
    };

    const handleCloseDetail = () => {
        setSelectedProductId(null);
    };

    if (loading && posts.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading posts...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Fashion Gallery</h2>
                        <p className="text-gray-600">
                            Showing {posts.length} products {totalPages > 1 && `(Page ${currentPage} of ${totalPages})`}
                        </p>
                    </div>

                    {/* Masonry Grid - Pinterest Style */}
                    <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                        {posts.map((post) => {
                            const proxyImageUrl = getImageProxyUrl(post.image_url);
                            
                            return (
                                <div
                                    key={post.id}
                                    className="break-inside-avoid mb-4 group cursor-pointer"
                                    onClick={() => handlePostClick(post.id)}
                                >
                                    <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow bg-white">
                                        {proxyImageUrl ? (
                                            <img
                                                src={proxyImageUrl}
                                                alt={post.name || 'Product'}
                                                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    console.error('Failed to load image:', post.image_url);
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end p-4">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-white text-sm font-medium line-clamp-2">
                                                    {post.name}
                                                </p>
                                                {post.brand && (
                                                    <p className="text-white text-xs mt-1">
                                                        {post.brand}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* View Details Badge */}
                                        <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                            Click to view details
                                        </div>

                                        {/* Heart Icon */}
                                        <button 
                                            className="absolute top-3 right-3 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-gray-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('[Posts Gallery] Liked product:', post.id);
                                            }}
                                        >
                                            <svg className="w-5 h-5 text-gray-700 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Load More Button */}
                    {posts.length > 0 && hasMore && (
                        <div className="text-center mt-8">
                            <button
                                onClick={handleLoadMore}
                                disabled={loading}
                                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Loading...
                                    </span>
                                ) : (
                                    'Load More'
                                )}
                            </button>
                        </div>
                    )}

                    {/* No More Posts Message */}
                    {posts.length > 0 && !hasMore && (
                        <div className="text-center mt-8">
                            <p className="text-gray-500">You've reached the end! 🎉</p>
                        </div>
                    )}

                    {/* No Posts Message */}
                    {posts.length === 0 && !loading && (
                        <div className="text-center py-16">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg">No products found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Detail Modal */}
            {selectedProductId && (
                <ProductDetail
                    productId={selectedProductId}
                    onClose={handleCloseDetail}
                />
            )}
        </>
    );
};

export default PostsGallery;