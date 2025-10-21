"use client";

import React, { useState, useEffect } from 'react';
import InstagramPostDetail from './InstagramPostDetail';
import ScrapeInstagramModal from './ScrapeInstagramModal';

interface InstagramPost {
    id: string;
    type: string;
    url: string;
    display_url: string;
    caption?: string;
    likes_count: number;
    comments_count: number;
    timestamp: string;
    owner_username: string;
    owner_full_name: string;
    scraped_date: string;
}

const InstagramGallery: React.FC = () => {
    const [posts, setPosts] = useState<InstagramPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [showScrapeModal, setShowScrapeModal] = useState(false);

    useEffect(() => {
        loadPosts(1);
    }, []);

    const getImageProxyUrl = (imageUrl: string | null | undefined): string | null => {
        if (!imageUrl) return null;
        return `http://127.0.0.1:8000/api/v1/products/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    };

    const loadPosts = async (page: number) => {
        try {
            setLoading(true);
            
            const response = await fetch('http://127.0.0.1:8000/api/v1/instagram/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: page,
                    page_size: 50,
                    sort_by: 'scraped_date',
                    sort_order: 'desc'
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch Instagram posts: ${response.statusText}`);
            }

            const data = await response.json();
            
            console.log('[Instagram Gallery] Loaded posts:', data);
            
            if (page === 1) {
                setPosts(data.posts);
            } else {
                setPosts(prev => [...prev, ...data.posts]);
            }
            
            setCurrentPage(data.pagination.current_page);
            setTotalPages(data.pagination.total_pages);
            setHasMore(data.pagination.has_next);
            
        } catch (error) {
            console.error('Failed to load Instagram posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (hasMore && !loading) {
            loadPosts(currentPage + 1);
        }
    };

    const handlePostClick = (postId: string) => {
        setSelectedPostId(postId);
    };

    const handleCloseDetail = () => {
        setSelectedPostId(null);
    };

    const handleScrapeSuccess = () => {
        // Reload posts after scraping
        loadPosts(1);
    };

    if (loading && posts.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading Instagram posts...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
                <div className="container mx-auto px-4">
                    {/* Header with Scrape Button */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="text-center flex-1">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Instagram Posts</h2>
                            <p className="text-gray-600">
                                Showing {posts.length} posts {totalPages > 1 && `(Page ${currentPage} of ${totalPages})`}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowScrapeModal(true)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Scrape Instagram
                        </button>
                    </div>

                    {/* Masonry Grid - Pinterest Style */}
                    <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                        {posts.map((post) => {
                            const proxyImageUrl = getImageProxyUrl(post.display_url);
                            
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
                                                alt={post.caption || 'Instagram post'}
                                                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
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
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity w-full">
                                                <p className="text-white text-sm font-medium line-clamp-2">
                                                    @{post.owner_username}
                                                </p>
                                                {post.caption && (
                                                    <p className="text-white text-xs mt-1 line-clamp-2">
                                                        {post.caption}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 text-white text-xs">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                        </svg>
                                                        {post.likes_count.toLocaleString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                        {post.comments_count.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* View Details Badge */}
                                        <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                            Click to view details
                                        </div>
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
                            <p className="text-gray-500 text-lg mb-4">No Instagram posts found</p>
                            <button
                                onClick={() => setShowScrapeModal(true)}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Scrape Your First Post
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Instagram Post Detail Modal */}
            {selectedPostId && (
                <InstagramPostDetail
                    postId={selectedPostId}
                    onClose={handleCloseDetail}
                />
            )}

            {/* Scrape Instagram Modal */}
            {showScrapeModal && (
                <ScrapeInstagramModal
                    onClose={() => setShowScrapeModal(false)}
                    onSuccess={handleScrapeSuccess}
                />
            )}
        </>
    );
};

export default InstagramGallery;