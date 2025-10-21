"use client";

import React from 'react';

interface NavigationProps {
    activeTab: 'store' | 'vibe-search' | 'posts' | 'instagram';
    onTabChange: (tab: 'store' | 'vibe-search' | 'posts' | 'instagram') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'store', label: 'Store', icon: '🏪' },
        { id: 'vibe-search', label: 'Vibe Search', icon: '🔍' },
        { id: 'posts', label: 'Posts', icon: '📌' },
        { id: 'instagram', label: 'Instagram', icon: '📸' }
    ];

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-4">
                    {/* Logo */}
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Vibe Search
                    </h1>

                    {/* Tab Navigation */}
                    <nav className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id as any)}
                                className={`
                                    px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm
                                    ${activeTab === tab.id
                                        ? 'bg-white text-purple-600 shadow-md'
                                        : 'text-gray-600 hover:text-purple-600'
                                    }
                                `}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    {/* Empty space for symmetry */}
                    <div className="w-32"></div>
                </div>
            </div>
        </header>
    );
};

export default Navigation;