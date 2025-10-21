"use client";

import React, { useState, useEffect } from 'react';

interface InstagramPostDetailProps {
    postId: string;
    onClose: () => void;
}

const InstagramPostDetail: React.FC<InstagramPostDetailProps> = ({ postId, onClose }) => {
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isExtracted, setIsExtracted] = useState(false);

    useEffect(() => {
        loadPostDetails();
    }, [postId]);

    const loadPostDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`http://127.0.0.1:8000/api/v1/instagram/${postId}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch post: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('[Instagram Post Detail] Loaded post:', data);
            setPost(data.post);
            setIsExtracted(data.post.is_extracted || false);

        } catch (err) {
            console.error('[Instagram Post Detail] Error loading post:', err);
            setError(err instanceof Error ? err.message : 'Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    const handleExtractProducts = async () => {
        try {
            setIsExtracting(true);
            
            const response = await fetch('http://127.0.0.1:8000/api/v1/products/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instagram_post_id: postId
                })
            });

            if (response.ok) {
                // Mark as extracted after successful extraction
                setIsExtracted(true);
                console.log('[Instagram Post Detail] Products extracted successfully');
            } else {
                console.log('[Instagram Post Detail] Product extraction failed');
            }
            
        } catch (err) {
            console.log('[Instagram Post Detail] Product extraction error');
        } finally {
            setIsExtracting(false);
        }
    };

    const getProxyImageUrl = (imageUrl: string): string => {
        return `http://127.0.0.1:8000/api/v1/products/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading post details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Post</h3>
                        <p className="text-gray-600 mb-4">{error || 'Post not found'}</p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Instagram Post Details</h2>
                        <div className="flex items-center gap-3">
                            {/* Extract Products Button - Only show if not extracted */}
                            {!isExtracted ? (
                                <button
                                    onClick={handleExtractProducts}
                                    disabled={isExtracting}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    title="Extract products from this post"
                                >
                                    {isExtracting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Extracting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            Extract Products
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="bg-green-100 text-green-700 px-6 py-2 rounded-lg flex items-center gap-2 border border-green-300">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">Products Extracted</span>
                                </div>
                            )}
                            
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
                                title="Close"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Image */}
                        <div className="bg-white rounded-lg p-4 shadow-xl">
                            <img
                                src={getProxyImageUrl(post.display_url)}
                                alt="Instagram post"
                                className="w-full h-auto rounded-lg"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="%239ca3af" font-size="20">Image unavailable</text></svg>';
                                }}
                            />
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            {/* Extraction Status Badge */}
                            {isExtracted && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-900">Products Extracted</p>
                                            <p className="text-sm text-green-700">This post has already been processed</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Owner Info */}
                            <div className="bg-white rounded-lg p-6 shadow-xl">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                                        {post.owner_username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{post.owner_full_name}</h3>
                                        <p className="text-sm text-purple-600">@{post.owner_username}</p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-6 mb-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium">{post.likes_count.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span className="font-medium">{post.comments_count.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500">
                                    <p>Posted: {formatDate(post.timestamp)}</p>
                                    <p>Scraped: {formatDate(post.scraped_date)}</p>
                                </div>
                            </div>

                            {/* Caption */}
                            {post.caption && (
                                <div className="bg-white rounded-lg p-6 shadow-xl">
                                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        Caption
                                    </h4>
                                    <p className="text-gray-700 whitespace-pre-wrap">{post.caption}</p>
                                </div>
                            )}

                            {/* Hashtags */}
                            {post.hashtags && post.hashtags.length > 0 && (
                                <div className="bg-white rounded-lg p-6 shadow-xl">
                                    <h4 className="font-bold text-gray-900 mb-3">Hashtags ({post.hashtags.length})</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {post.hashtags.map((tag: string, index: number) => (
                                            <span key={index} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Latest Comments */}
                            {post.latest_comments && post.latest_comments.length > 0 && (
                                <div className="bg-white rounded-lg p-6 shadow-xl max-h-96 overflow-y-auto">
                                    <h4 className="font-bold text-gray-900 mb-3">Latest Comments ({post.latest_comments.length})</h4>
                                    <div className="space-y-3">
                                        {post.latest_comments.map((comment: any, index: number) => (
                                            <div key={index} className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-sm font-medium text-purple-600 mb-1">@{comment.ownerUsername || 'user'}</p>
                                                <p className="text-sm text-gray-700">{comment.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* View on Instagram */}
                            <a
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    View on Instagram
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstagramPostDetail;