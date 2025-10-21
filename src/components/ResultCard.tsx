"use client";

import React from 'react';

interface ResultCardProps {
    id: string;
    title: string;
    description: string;
    image?: string;
    price?: number;
    category?: string;
    brand?: string;
    pdpUrl?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({
    title,
    description,
    image,
    price,
    category,
    brand,
    pdpUrl
}) => {
    const handleClick = () => {
        if (pdpUrl) {
            window.open(pdpUrl, '_blank');
        }
    };

    return (
        <div 
            className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group relative"
            onClick={handleClick}
        >
            {/* Category Badge - Top Left */}
            {category && (
                <div className="absolute top-3 left-3 bg-indigo-700 text-white px-3 py-1 text-xs font-semibold uppercase z-10 rounded">
                    {category}
                </div>
            )}
            
            {/* Wishlist Heart - Top Right */}
            <button 
                className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                    e.stopPropagation();
                    // Add wishlist functionality here
                }}
            >
                <svg 
                    className="w-5 h-5 text-gray-700 hover:text-red-500 transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                </svg>
            </button>

            {/* Product Image */}
            <div className="relative w-full h-72 bg-gray-100 overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-image.png';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-2">
                {/* Title */}
                <h3 className="font-normal text-base text-gray-900 line-clamp-2 min-h-[3rem]">
                    {title}
                </h3>
                
                {/* Price */}
                <div className="flex items-baseline gap-2">
                    {price !== undefined && (
                        <>
                            <span className="text-lg font-semibold text-gray-900">
                                INR {price.toLocaleString()}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultCard;