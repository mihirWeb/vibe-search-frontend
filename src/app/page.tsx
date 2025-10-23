"use client";

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';
import FilterPanel from '@/components/FilterPanel';
import ChatInterface from '@/components/ChatInterface';
import PostsGallery from '@/components/PostGallery';
import InstagramGallery from '@/components/InstagramGallery';
import { useSearch } from '@/hooks/useSearch';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'store' | 'vibe-search' | 'posts' | 'instagram'>('store');
  const { results, isLoading, search, setDirectResults, currentPage, totalPages, totalItems } = useSearch();
  const [showFilters, setShowFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [embeddingTestActive, setEmbeddingTestActive] = useState(false);

  // Load initial results for store tab
  useEffect(() => {
    if (activeTab === 'store' && !embeddingTestActive) {
      search('', 1, 20);
    }
  }, [activeTab, embeddingTestActive]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setEmbeddingTestActive(false);
    search(query, 1, 20, currentFilters);
  };

  const handleEmbeddingTestSearch = async (query: string) => {
    setSearchQuery(query);
    setEmbeddingTestActive(true);
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/search/embedding-test?query=${encodeURIComponent(query)}&top_k=20`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Embedding test search failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Embedding Test] Response:', data);

      // Transform the results to match StoreItem interface
      const transformedResults = data.matches.map((match: any) => ({
        id: match.product_id,
        sku_id: match.product_id,
        title: match.title,
        description: '',
        category: match.category,
        sub_category: match.sub_category,
        brand_name: match.brand,
        product_type: '',
        gender: match.gender,
        colorways: match.colorways,
        lowest_price: match.price,
        featured_image: match.image_url,
        pdp_url: match.pdp_url,
        wishlist_num: 0,
        tags: '',
        textual_embedding: null,
        visual_embedding: null
      }));

      console.log('[Embedding Test] Transformed results:', transformedResults);
      
      // Update results using the new method
      setDirectResults(transformedResults, data.total_results);
      
    } catch (error) {
      console.error('[Embedding Test] Error:', error);
      alert('Embedding test search failed. Please try again.');
    }
  };

  const handleFilterChange = (filters: any) => {
    setCurrentFilters(filters);
    if (!embeddingTestActive) {
      search(searchQuery, 1, 20, filters);
    }
  };

  const handlePageChange = (page: number) => {
    if (!embeddingTestActive) {
      search(searchQuery, page, 20, currentFilters);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Store Tab */}
      {activeTab === 'store' && (
        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Your Perfect Style
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Search with intelligence, find with precision
            </p>
            <SearchBar 
              onSearch={handleSearch} 
              onEmbeddingTestSearch={handleEmbeddingTestSearch}
            />
          </div>

          {/* Embedding Test Mode Banner */}
          {embeddingTestActive && (
            <div className="mb-6 bg-purple-100 border-l-4 border-purple-600 p-4 rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧪</span>
                  <div>
                    <h3 className="font-semibold text-purple-900">Embedding Test Mode Active</h3>
                    <p className="text-sm text-purple-700">
                      Showing raw embedding search results without AI enhancement
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEmbeddingTestActive(false);
                    search(searchQuery, 1, 20, currentFilters);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Exit Test Mode
                </button>
              </div>
            </div>
          )}

          {/* Filters Toggle Button (Mobile) */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Results Section */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar - Disable in embedding test mode */}
            <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'} ${embeddingTestActive ? 'opacity-50 pointer-events-none' : ''}`}>
              <FilterPanel onFilterChange={handleFilterChange} />
              {embeddingTestActive && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Filters disabled in test mode
                </p>
              )}
            </aside>

            {/* Search Results */}
            <div className="flex-1">
              <div className="mb-6">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{results.length}</span> of{' '}
                  <span className="font-semibold">{totalItems}</span> results
                  {searchQuery && (
                    <span className="ml-2">
                      for "<span className="font-semibold">{searchQuery}</span>"
                    </span>
                  )}
                  {embeddingTestActive && (
                    <span className="ml-2 text-purple-600 font-semibold">
                      (Embedding Test)
                    </span>
                  )}
                </p>
              </div>
              <SearchResults results={results} isLoading={isLoading} />
              
              {/* Pagination - Disable in embedding test mode */}
              {!embeddingTestActive && totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-purple-600 text-white rounded-lg">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Vibe Search Tab */}
      {activeTab === 'vibe-search' && <ChatInterface />}

      {/* Posts Tab */}
      {activeTab === 'posts' && <PostsGallery />}

      {/* Instagram Tab */}
      {activeTab === 'instagram' && <InstagramGallery />}

      {/* Footer - Only show on store tab */}
      {activeTab === 'store' && (
        <footer className="bg-gray-900 text-white mt-16 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">© 2025 Vibe Search. All rights reserved.</p>
            <div className="flex justify-center gap-6 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}