"use client";

import React, { useState, useRef, useEffect } from 'react';

interface Message {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    imageUrl?: string;
    results?: any[];
    looks?: any[];
    isCollectionQuery?: boolean;
    timestamp: Date;
}

const ChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            type: 'assistant',
            content: '👋 Hi! I can help you find products by text or image. Just type your query or upload an image!',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showImageQueryInput, setShowImageQueryInput] = useState(false);
    const [imageQuery, setImageQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleTextSearch = async (query: string) => {
        if (!query.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: query,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query,
                    top_k: 10,
                    rerank: true
                })
            });

            if (!response.ok) {
                throw new Error(`Search failed: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('[Chat Interface] Text search response:', data);

            const isCollectionQuery = data.is_collection_query || false;
            
            let assistantContent = '';
            if (isCollectionQuery) {
                const numLooks = data.total_looks || 0;
                assistantContent = `✨ Here ${numLooks === 1 ? 'is' : 'are'} ${numLooks} complete outfit${numLooks === 1 ? '' : 's'} for "${query}"`;
            } else {
                const numResults = data.total_results || 0;
                assistantContent = `Found ${numResults} result${numResults === 1 ? '' : 's'} for "${query}"`;
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: assistantContent,
                results: isCollectionQuery ? [] : (data.matches || []),
                looks: isCollectionQuery ? (data.looks || []) : undefined,
                isCollectionQuery: isCollectionQuery,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Text search error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: '❌ Sorry, something went wrong. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const convertFileToDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    resolve(e.target.result as string);
                } else {
                    reject(new Error('Failed to read file'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('Image size should be less than 10MB');
            return;
        }

        const preview = URL.createObjectURL(file);
        setImagePreview(preview);
        setSelectedImage(file);
        setShowImageQueryInput(true);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

const handleImageSearch = async () => {
    if (!selectedImage) return;

    setShowImageQueryInput(false);
    setIsLoading(true);

    try {
        const dataUrl = await convertFileToDataURL(selectedImage);
        
        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: imageQuery.trim() || 'Searching by image...',
            imageUrl: imagePreview || undefined,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        const requestBody: any = {
            image_url: dataUrl,
            top_k: 10,
            rerank: true
        };

        // Always include query if provided (even if empty string)
        if (imageQuery.trim()) {
            requestBody.query = imageQuery.trim();
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Image search failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[Chat Interface] Image search response:', data);

        const isCollectionQuery = data.is_collection_query || false;
        
        let assistantContent = '';
        if (isCollectionQuery) {
            const numLooks = data.total_looks || 0;
            assistantContent = `✨ Here ${numLooks === 1 ? 'is' : 'are'} ${numLooks} complete outfit${numLooks === 1 ? '' : 's'} based on your image${imageQuery.trim() ? ` and "${imageQuery.trim()}"` : ''}`;
        } else {
            const numResults = data.total_results || 0;
            assistantContent = `🔍 Found ${numResults} visually similar product${numResults === 1 ? '' : 's'}${imageQuery.trim() ? ` for "${imageQuery.trim()}"` : ''}`;
        }

        const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: assistantContent,
            results: isCollectionQuery ? [] : (data.matches || []),
            looks: isCollectionQuery ? (data.looks || []) : undefined,
            isCollectionQuery: isCollectionQuery,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
        console.error('Image search error:', error);
        const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: '❌ Failed to process image. Please try again.',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
        setSelectedImage(null);
        setImagePreview(null);
        setImageQuery('');
    }
};

    const handleCancelImageUpload = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setShowImageQueryInput(false);
        setImageQuery('');
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (showImageQueryInput) {
            handleImageSearch();
        } else {
            handleTextSearch(inputText);
        }
    };

    const getImageUrl = (result: any): string | null => {
        return result.featured_image || 
               result.image_url || 
               result.imageUrl || 
               result.image || 
               null;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gradient-to-br from-purple-50 via-white to-pink-50">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-4xl mx-auto space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-3xl rounded-2xl px-4 py-3 ${
                                    message.type === 'user'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white shadow-md'
                                }`}
                            >
                                {message.imageUrl && (
                                    <img
                                        src={message.imageUrl}
                                        alt="Uploaded"
                                        className="rounded-lg mb-2 max-h-64 object-contain"
                                    />
                                )}
                                <p className="text-sm">{message.content}</p>
                                
                                {/* Unified Carousel for Both Collection and Normal Results */}
                                {message.isCollectionQuery && message.looks && message.looks.length > 0 && (
                                    <UnifiedCarousel items={message.looks} isCollection={true} />
                                )}

                                {!message.isCollectionQuery && message.results && message.results.length > 0 && (
                                    <UnifiedCarousel items={message.results} isCollection={false} />
                                )}

                                {/* Show message if no results */}
                                {message.type === 'assistant' && 
                                 !message.isCollectionQuery && 
                                 message.results && 
                                 message.results.length === 0 && (
                                    <p className="text-sm text-gray-500 mt-2 italic">No matching products found.</p>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white shadow-md rounded-2xl px-4 py-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t bg-white px-4 py-4">
                <div className="max-w-4xl mx-auto">
                    {showImageQueryInput && imagePreview && (
                        <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                            <div className="flex items-start gap-4">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-24 h-24 object-contain rounded-lg"
                                />
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Refine your search with text (optional):
                                    </label>
                                    <input
                                        type="text"
                                        value={imageQuery}
                                        onChange={(e) => setImageQuery(e.target.value)}
                                        placeholder="e.g., show me blue shoes, find me a complete outfit..."
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        💡 Try: "show me similar sneakers", "complete outfit with this", "blue shoes"
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={handleImageSearch}
                                            disabled={isLoading}
                                            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            🔍 Search
                                        </button>
                                        <button
                                            onClick={handleCancelImageUpload}
                                            disabled={isLoading}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!showImageQueryInput && (
                        <form onSubmit={handleSubmit} className="flex items-center gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Upload image"
                                disabled={isLoading}
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </button>
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type your search query..."
                                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || isLoading}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// Unified Carousel Component for Both Collection Looks and Normal Results
const UnifiedCarousel: React.FC<{ items: any[], isCollection: boolean }> = ({ items, isCollection }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextItem = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevItem = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const getImageUrl = (result: any): string | null => {
        return result.featured_image || 
               result.image_url || 
               result.imageUrl || 
               result.image || 
               null;
    };

    if (items.length === 0) return null;

    // For collection: display look items in grid
    if (isCollection) {
        const look = items[currentIndex];
        
        return (
            <div className="mt-4 relative">
                {/* Navigation Arrows */}
                {items.length > 1 && (
                    <>
                        <button
                            onClick={prevItem}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors"
                            aria-label="Previous look"
                        >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={nextItem}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors"
                            aria-label="Next look"
                        >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Counter */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">
                        Look {currentIndex + 1} of {items.length}
                    </span>
                </div>
                
                {/* Look Items Grid */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {Object.entries(look.items).map(([type, item]: [string, any]) => (
                        <div
                            key={type}
                            className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {item.is_existing ? (
                                <div className="aspect-square bg-gray-200 flex flex-col items-center justify-center p-2">
                                    <span className="text-xs font-medium text-gray-700 capitalize">{type == "hat"? "accessory" : type}</span>
                                    <span className="text-xs text-gray-500 mt-1">(Your Item)</span>
                                </div>
                            ) : (
                                <>
                                    <div
                                        className="aspect-square cursor-pointer"
                                        onClick={() => item.pdp_url && window.open(item.pdp_url, '_blank')}
                                    >
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.title || type}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-1.5">
                                        <p className="text-xs font-medium text-gray-900 line-clamp-1 capitalize">
                                            {type}
                                        </p>
                                        {item.price && (
                                            <p className="text-xs text-purple-600 font-semibold">
                                                ₹{parseFloat(item.price).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // For normal results: display in grid with carousel
    const itemsPerPage = 6;
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIdx = currentIndex * itemsPerPage;
    const endIdx = Math.min(startIdx + itemsPerPage, items.length);
    const currentItems = items.slice(startIdx, endIdx);

    return (
        <div className="mt-4 relative">
            {/* Navigation Arrows */}
            {totalPages > 1 && (
                <>
                    <button
                        onClick={prevItem}
                        disabled={currentIndex === 0}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous items"
                    >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextItem}
                        disabled={currentIndex === totalPages - 1}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next items"
                    >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Counter */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">
                        Page {currentIndex + 1} of {totalPages} ({items.length} total results)
                    </span>
                </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {currentItems.map((result, idx) => {
                    const imageUrl = getImageUrl(result);
                    
                    return (
                        <div
                            key={idx}
                            className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => result.pdp_url && window.open(result.pdp_url, '_blank')}
                        >
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={result.title || 'Product'}
                                    className="w-full h-32 object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <div className="p-2">
                                <p className="text-xs font-medium text-gray-900 line-clamp-2">
                                    {result.title || 'Untitled Product'}
                                </p>
                                {(result.lowest_price || result.price) && (
                                    <p className="text-xs text-purple-600 font-semibold mt-1">
                                        ₹{parseFloat(result.lowest_price || result.price).toLocaleString()}
                                    </p>
                                )}
                                {result.combined_score && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Match: {(result.combined_score * 100).toFixed(1)}%
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatInterface;