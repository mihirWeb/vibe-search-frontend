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
  const { results, isLoading, search, currentPage, totalPages, totalItems } = useSearch();
  const [showFilters, setShowFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Load initial results for store tab
  useEffect(() => {
    if (activeTab === 'store') {
      search('', 1, 20);
    }
  }, [activeTab]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    search(query, 1, 20, currentFilters);
  };

  const handleFilterChange = (filters: any) => {
    setCurrentFilters(filters);
    search(searchQuery, 1, 20, filters);
  };

  const handlePageChange = (page: number) => {
    search(searchQuery, page, 20, currentFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <SearchBar onSearch={handleSearch} />
          </div>

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
            {/* Filters Sidebar */}
            <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <FilterPanel onFilterChange={handleFilterChange} />
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
                </p>
              </div>
              <SearchResults results={results} isLoading={isLoading} />
              
              {/* Pagination */}
              {totalPages > 1 && (
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