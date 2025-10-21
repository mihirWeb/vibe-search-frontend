"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';

interface FilterPanelProps {
    onFilterChange: (filters: any) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange }) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    
    // Filter options from API
    const [categories, setCategories] = useState<string[]>([]);
    const [brands, setBrands] = useState<string[]>([]);
    const [genders, setGenders] = useState<string[]>([]);
    const [maxPrice, setMaxPrice] = useState<number>(10000);
    const [loading, setLoading] = useState(true);

    // Track if filters have changed
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        loadFilterOptions();
    }, []);

    useEffect(() => {
        // Check if any filters are selected
        const hasActiveFilters = 
            selectedCategories.length > 0 || 
            selectedBrands.length > 0 || 
            selectedGenders.length > 0 ||
            priceRange[0] > 0 || 
            priceRange[1] < maxPrice;
        
        setHasChanges(hasActiveFilters);
    }, [selectedCategories, selectedBrands, selectedGenders, priceRange, maxPrice]);

    const loadFilterOptions = async () => {
        try {
            setLoading(true);
            const options = await api.getFilterOptions();
            
            setCategories(options.categories || []);
            setBrands(options.brands || []);
            setGenders(options.genders || []);
            
            const maxPriceValue = options.price_range?.max || 10000;
            setMaxPrice(maxPriceValue);
            setPriceRange([0, maxPriceValue]);
        } catch (error) {
            console.error('Failed to load filter options:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (category: string) => {
        const newCategories = selectedCategories.includes(category)
            ? selectedCategories.filter(c => c !== category)
            : [...selectedCategories, category];
        setSelectedCategories(newCategories);
    };

    const toggleBrand = (brand: string) => {
        const newBrands = selectedBrands.includes(brand)
            ? selectedBrands.filter(b => b !== brand)
            : [...selectedBrands, brand];
        setSelectedBrands(newBrands);
    };

    const toggleGender = (gender: string) => {
        const newGenders = selectedGenders.includes(gender)
            ? selectedGenders.filter(g => g !== gender)
            : [...selectedGenders, gender];
        setSelectedGenders(newGenders);
    };

    const handleShowResults = () => {
        const filters: any = {};
        
        if (selectedCategories.length > 0) {
            filters.category = selectedCategories;
        }
        if (selectedBrands.length > 0) {
            filters.brand_name = selectedBrands;
        }
        if (selectedGenders.length > 0) {
            filters.gender = selectedGenders;
        }
        if (priceRange[0] > 0 || priceRange[1] < maxPrice) {
            filters.min_price = priceRange[0];
            filters.max_price = priceRange[1];
        }
        
        onFilterChange(filters);
    };

    const handleClearFilters = () => {
        setSelectedCategories([]);
        setSelectedBrands([]);
        setSelectedGenders([]);
        setPriceRange([0, maxPrice]);
        onFilterChange({});
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-xl font-bold mb-4">Filters</h3>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading filters...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md sticky top-4 flex flex-col max-h-[calc(100vh-2rem)]">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-6 pb-4 border-b">
                <h3 className="text-xl font-bold">Filters</h3>
                {hasChanges && (
                    <button
                        onClick={handleClearFilters}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                        Clear All
                    </button>
                )}
            </div>
            
            {/* Scrollable Filter Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {/* Categories */}
                {categories.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-semibold mb-3 text-gray-800">Categories</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {categories.map((category) => (
                                <label key={category} className="flex items-center space-x-2 cursor-pointer hover:bg-purple-50 p-1 rounded transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(category)}
                                        onChange={() => toggleCategory(category)}
                                        className="rounded text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700">{category}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Genders */}
                {genders.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-semibold mb-3 text-gray-800">Gender</h4>
                        <div className="space-y-2">
                            {genders.map((gender) => (
                                <label key={gender} className="flex items-center space-x-2 cursor-pointer hover:bg-purple-50 p-1 rounded transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedGenders.includes(gender)}
                                        onChange={() => toggleGender(gender)}
                                        className="rounded text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm capitalize text-gray-700">{gender}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Brands */}
                {brands.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-semibold mb-3 text-gray-800">Brands</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {brands.map((brand) => (
                                <label key={brand} className="flex items-center space-x-2 cursor-pointer hover:bg-purple-50 p-1 rounded transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedBrands.includes(brand)}
                                        onChange={() => toggleBrand(brand)}
                                        className="rounded text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700">{brand}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Price Range */}
                <div className="mb-4">
                    <h4 className="font-semibold mb-3 text-gray-800">Price Range</h4>
                    <div className="space-y-3">
                        <input
                            type="range"
                            min="0"
                            max={maxPrice}
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                            className="w-full accent-purple-600"
                        />
                        <div className="flex justify-between text-sm font-medium text-gray-700">
                            <span>₹{priceRange[0].toLocaleString()}</span>
                            <span>₹{priceRange[1].toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Show Results Button - Fixed at Bottom */}
            <div className="p-6 pt-4 border-t bg-white">
                <button
                    onClick={handleShowResults}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                    Show Results
                </button>
            </div>
        </div>
    );
};

export default FilterPanel;