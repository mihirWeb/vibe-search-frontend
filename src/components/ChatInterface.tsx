"use client";

import React, { useState, useRef, useEffect } from 'react';

interface Message {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    imageUrl?: string;
    results?: any[];
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

        // Add user message
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
            const response = await fetch('http://127.0.0.1:8000/api/v1/search/text', {
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

            // Add assistant response
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: `Found ${data.total_results || 0} results for "${query}"`,
                results: data.matches || [],
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

        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Image size should be less than 10MB');
            return;
        }

        // Create preview
        const preview = URL.createObjectURL(file);
        setImagePreview(preview);
        setSelectedImage(file);
        setShowImageQueryInput(true);
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleImageSearch = async () => {
        if (!selectedImage) return;

        setShowImageQueryInput(false);
        setIsLoading(true);

        try {
            // Convert image to Data URL (base64)
            const dataUrl = await convertFileToDataURL(selectedImage);
            
            console.log('[Chat Interface] Generated Data URL:', dataUrl.substring(0, 100) + '...');

            // Add user message with image
            const userMessage: Message = {
                id: Date.now().toString(),
                type: 'user',
                content: imageQuery.trim() || 'Searching by image...',
                imageUrl: imagePreview || undefined,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, userMessage]);

            // Send to backend
            const requestBody: any = {
                image_url: dataUrl,
                top_k: 10,
                rerank: true
            };

            // Add text query if provided
            if (imageQuery.trim()) {
                requestBody.query = imageQuery.trim();
            }

            console.log('[Chat Interface] Sending image search request...');

            const response = await fetch('http://127.0.0.1:8000/api/v1/search/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Image search failed: ${response.statusText}`);
            }

            const data = await response.json();

            console.log('[Chat Interface] Image search response:', data);

            // Add assistant response
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: `🔍 Found ${data.total_results || 0} visually similar products${imageQuery.trim() ? ` for "${imageQuery.trim()}"` : ''}`,
                results: data.matches || [],
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

    // Helper function to get image URL from result object
    const getImageUrl = (result: any): string | null => {
        // Try multiple possible field names
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
                                className={`max-w-2xl rounded-2xl px-4 py-3 ${
                                    message.type === 'user'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white shadow-md'
                                }`}
                            >
                                {message.imageUrl && (
                                    <img
                                        src={message.imageUrl}
                                        alt="Uploaded"
                                        className="rounded-lg mb-2 max-h-64 object-cover"
                                    />
                                )}
                                <p className="text-sm">{message.content}</p>
                                
                                {/* Display Results */}
                                {message.results && message.results.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {message.results.slice(0, 6).map((result, idx) => {
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
                                                            className="w-full h-32 object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                                console.error('Failed to load image:', imageUrl);
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
                                )}

                                {/* Show message if no results */}
                                {message.results && message.results.length === 0 && message.type === 'assistant' && (
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
                    {/* Image Preview and Query Input */}
                    {showImageQueryInput && imagePreview && (
                        <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                            <div className="flex items-start gap-4">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Add optional text description (recommended):
                                    </label>
                                    <input
                                        type="text"
                                        value={imageQuery}
                                        onChange={(e) => setImageQuery(e.target.value)}
                                        placeholder="e.g., blue running shoes, summer dress..."
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                                        autoFocus
                                    />
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

                    {/* Main Input Form */}
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

export default ChatInterface;