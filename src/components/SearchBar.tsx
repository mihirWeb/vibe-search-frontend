"use client";

import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    onEmbeddingTestSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onEmbeddingTestSearch }) => {
    const [query, setQuery] = useState('');
    const [embeddingTestMode, setEmbeddingTestMode] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (embeddingTestMode && onEmbeddingTestSearch) {
            onEmbeddingTestSearch(query);
        } else {
            onSearch(query);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={embeddingTestMode ? "Embedding test mode - raw query..." : "Search for products, styles, or vibes..."}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-purple-500 shadow-lg"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors"
                >
                    Search
                </button>
            </form>
            
            {/* Embedding Test Toggle */}
            <div className="mt-4 flex items-center justify-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={embeddingTestMode}
                        onChange={(e) => setEmbeddingTestMode(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                        Embedding Test Mode
                    </span>
                </label>
                {embeddingTestMode && (
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                        🧪 Raw embedding search - no AI enhancement
                    </span>
                )}
            </div>
        </div>
    );
};

export default SearchBar;