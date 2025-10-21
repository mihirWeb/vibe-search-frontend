"use client";

import React, { useState } from 'react';

interface ScrapeInstagramModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const ScrapeInstagramModal: React.FC<ScrapeInstagramModalProps> = ({ onClose, onSuccess }) => {
    const [url, setUrl] = useState('');
    const [postLimit, setPostLimit] = useState(20);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!url.trim()) {
            setError('Please enter an Instagram URL');
            return;
        }

        if (!url.includes('instagram.com')) {
            setError('Please enter a valid Instagram URL');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('http://127.0.0.1:8000/api/v1/scraping/scrape?save_to_db=true', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: url.trim(),
                    post_limit: postLimit,
                    use_api: true
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to scrape Instagram');
            }

            const data = await response.json();
            console.log('[Scrape Modal] Scraping completed:', data);

            // Success
            alert(`Successfully scraped ${data.total_posts} posts!`);
            onSuccess();
            onClose();

        } catch (err) {
            console.error('[Scrape Modal] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to scrape Instagram');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Scrape Instagram Posts</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instagram Profile URL
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://instagram.com/username"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Enter an Instagram profile or hashtag URL
                        </p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Posts (1-100)
                        </label>
                        <input
                            type="number"
                            value={postLimit}
                            onChange={(e) => setPostLimit(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                            min="1"
                            max="100"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Scraping...
                                </>
                            ) : (
                                'Scrape Posts'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                        ℹ️ Scraping may take a few moments. Posts will be saved to the database automatically.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ScrapeInstagramModal;