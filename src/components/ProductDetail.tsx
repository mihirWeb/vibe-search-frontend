"use client";

import React, { useState, useEffect, useRef } from 'react';

interface ProductItem {
    id: number;
    name: string;
    brand?: string;
    category: string;
    sub_category?: string;
    product_type: string;
    gender?: string;
    style?: string[];
    colors?: string[];
    bounding_box?: number[]; // [x1, y1, x2, y2] in pixel coordinates
    confidence_score?: number;
}

interface Product {
    id: number;
    name: string;
    description?: string;
    image_url: string;
    source_url: string;
    brand?: string;
    category?: string;
    style?: string[];
    colors?: string[];
    caption?: string;
    items: ProductItem[];
}

interface ProductDetailProps {
    productId: number;
    onClose: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onClose }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<ProductItem | null>(null);
    const [hoveredItem, setHoveredItem] = useState<number | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadProductDetails();
    }, [productId]);

    const loadProductDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`http://127.0.0.1:8000/api/v1/products/${productId}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch product: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('[Product Detail] Loaded product:', data);
            console.log('[Product Detail] Items with bounding boxes:', data.items?.map((item: any) => ({
                name: item.name,
                bounding_box: item.bounding_box
            })));
            setProduct(data);

        } catch (err) {
            console.error('[Product Detail] Error loading product:', err);
            setError(err instanceof Error ? err.message : 'Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            
            const response = await fetch(`http://127.0.0.1:8000/api/v1/products/${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Failed to delete product: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('[Product Detail] Product deleted:', data);
            
            // Show success message
            alert('Product deleted successfully!');
            
            // Close the detail view
            onClose();
            
            // Reload the page to refresh the product list
            window.location.reload();

        } catch (err) {
            console.error('[Product Detail] Error deleting product:', err);
            alert(err instanceof Error ? err.message : 'Failed to delete product');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleImageLoad = () => {
        if (imageRef.current) {
            const displayWidth = imageRef.current.clientWidth;
            const displayHeight = imageRef.current.clientHeight;
            const naturalWidth = imageRef.current.naturalWidth;
            const naturalHeight = imageRef.current.naturalHeight;

            setImageDimensions({
                width: displayWidth,
                height: displayHeight,
                naturalWidth: naturalWidth,
                naturalHeight: naturalHeight
            });
            setImageLoaded(true);
            
            console.log('[Product Detail] Image dimensions:', {
                display: { width: displayWidth, height: displayHeight },
                natural: { width: naturalWidth, height: naturalHeight },
                scale: {
                    x: displayWidth / naturalWidth,
                    y: displayHeight / naturalHeight
                }
            });
        }
    };

    const getProxyImageUrl = (imageUrl: string): string => {
        return `http://127.0.0.1:8000/api/v1/products/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    };

    const getBoundingBoxStyle = (bbox: number[] | undefined): React.CSSProperties | null => {
        if (!bbox || bbox.length !== 4 || !imageLoaded) {
            console.log('[Product Detail] Cannot render bounding box:', { bbox, imageLoaded });
            return null;
        }

        const [x1, y1, x2, y2] = bbox;

        // Validate bounding box
        if (x2 <= x1 || y2 <= y1) {
            console.warn('[Product Detail] Invalid bounding box dimensions:', bbox);
            return null;
        }

        // Calculate scale factors between natural image size and displayed size
        const scaleX = imageDimensions.width / imageDimensions.naturalWidth;
        const scaleY = imageDimensions.height / imageDimensions.naturalHeight;

        // Convert pixel coordinates from natural size to display size
        const displayX1 = x1 * scaleX;
        const displayY1 = y1 * scaleY;
        const displayWidth = (x2 - x1) * scaleX;
        const displayHeight = (y2 - y1) * scaleY;

        console.log('[Product Detail] Bounding box calculation:', {
            original: { x1, y1, x2, y2 },
            scale: { scaleX, scaleY },
            display: { x: displayX1, y: displayY1, width: displayWidth, height: displayHeight }
        });

        return {
            position: 'absolute',
            left: `${displayX1}px`,
            top: `${displayY1}px`,
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
            border: '3px solid',
            borderRadius: '4px',
            pointerEvents: 'auto',
            transition: 'all 0.2s ease',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
        };
    };

    const getItemColor = (index: number): string => {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
            '#F06292', '#AED581', '#FFD54F', '#4DD0E1'
        ];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading product details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Product</h3>
                        <p className="text-gray-600 mb-4">{error || 'Product not found'}</p>
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
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Product Details</h2>
                        <div className="flex items-center gap-3">
                            {/* Delete Button */}
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={isDeleting}
                                className="text-white hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete product"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                            
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

                    {/* Delete Confirmation Modal */}
                    {showDeleteConfirm && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center">
                            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
                                        <p className="text-sm text-gray-600">This action cannot be undone</p>
                                    </div>
                                </div>
                                
                                <p className="text-gray-700 mb-6">
                                    Are you sure you want to delete <strong>{product?.name}</strong>? 
                                    This will also delete all <strong>{product?.items?.length || 0}</strong> associated items.
                                </p>
                                
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Image with Bounding Boxes */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg p-4 shadow-xl">
                                <div 
                                    ref={containerRef}
                                    className="relative inline-block w-full"
                                    style={{ lineHeight: 0 }}
                                >
                                    <img
                                        ref={imageRef}
                                        src={getProxyImageUrl(product.image_url)}
                                        alt={product.name}
                                        className="w-full h-auto rounded-lg"
                                        onLoad={handleImageLoad}
                                        onError={(e) => {
                                            console.error('[Product Detail] Failed to load image');
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="%239ca3af" font-size="20">Image unavailable</text></svg>';
                                        }}
                                    />

                                    {/* Bounding Boxes Overlay */}
                                    {imageLoaded && product.items && product.items.length > 0 && (
                                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                                            {product.items.map((item, index) => {
                                                const style = getBoundingBoxStyle(item.bounding_box);
                                                if (!style) {
                                                    console.log('[Product Detail] Skipping item without valid bbox:', item.name);
                                                    return null;
                                                }

                                                const isHovered = hoveredItem === index;
                                                const isSelected = selectedItem?.id === item.id;
                                                const color = getItemColor(index);

                                                return (
                                                    <div
                                                        key={item.id}
                                                        style={{
                                                            ...style,
                                                            borderColor: color,
                                                            backgroundColor: isHovered || isSelected 
                                                                ? `${color}20` 
                                                                : 'transparent',
                                                            borderWidth: isHovered || isSelected ? '4px' : '3px',
                                                            cursor: 'pointer',
                                                            zIndex: isHovered || isSelected ? 10 : 1
                                                        }}
                                                        onMouseEnter={() => setHoveredItem(index)}
                                                        onMouseLeave={() => setHoveredItem(null)}
                                                        onClick={() => setSelectedItem(item)}
                                                    >
                                                        {/* Item Number Badge */}
                                                        <div
                                                            className="absolute -top-7 -left-1 text-xs font-bold px-2 py-1 rounded-full shadow-lg whitespace-nowrap"
                                                            style={{
                                                                backgroundColor: color,
                                                                color: 'white'
                                                            }}
                                                        >
                                                            {index + 1}
                                                        </div>

                                                        {/* Item Name Label (on hover) */}
                                                        {(isHovered || isSelected) && (
                                                            <div
                                                                className="absolute -bottom-8 left-0 right-0 text-xs font-medium px-2 py-1 rounded shadow-lg text-center whitespace-nowrap overflow-hidden text-ellipsis"
                                                                style={{
                                                                    backgroundColor: color,
                                                                    color: 'white',
                                                                    maxWidth: '200px'
                                                                }}
                                                            >
                                                                {item.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Legend */}
                                {product.items && product.items.length > 0 && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            Detected Items ({product.items.length})
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {product.items.map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    className={`flex items-center gap-2 text-xs cursor-pointer p-2 rounded transition-all ${
                                                        hoveredItem === index || selectedItem?.id === item.id
                                                            ? 'bg-white shadow-md scale-105'
                                                            : 'hover:bg-gray-100'
                                                    }`}
                                                    onMouseEnter={() => setHoveredItem(index)}
                                                    onMouseLeave={() => setHoveredItem(null)}
                                                    onClick={() => setSelectedItem(item)}
                                                >
                                                    <div
                                                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-white flex-shrink-0"
                                                        style={{ 
                                                            backgroundColor: getItemColor(index), 
                                                            borderColor: getItemColor(index) 
                                                        }}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="truncate font-medium text-gray-900">{item.name}</p>
                                                        {item.brand && (
                                                            <p className="text-xs text-gray-500 truncate">{item.brand}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Debug Info */}
                                {imageLoaded && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        Image: {imageDimensions.naturalWidth}×{imageDimensions.naturalHeight} 
                                        (displayed as {Math.round(imageDimensions.width)}×{Math.round(imageDimensions.height)})
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Info Sidebar */}
                        <div className="space-y-4">
                            {/* Product Info Card */}
                            <div className="bg-white rounded-lg p-6 shadow-xl">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                                
                                {product.brand && (
                                    <p className="text-sm text-purple-600 font-semibold mb-3">{product.brand}</p>
                                )}

                                {product.description && (
                                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                                )}

                                {product.caption && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1 font-semibold flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                            </svg>
                                            Caption:
                                        </p>
                                        <p className="text-sm text-gray-700">{product.caption}</p>
                                    </div>
                                )}

                                {/* Attributes */}
                                <div className="space-y-3">
                                    {product.category && (
                                        <div className="flex items-start gap-2">
                                            <span className="text-xs text-gray-500 min-w-[80px]">Category:</span>
                                            <span className="text-sm font-medium text-gray-900">{product.category}</span>
                                        </div>
                                    )}

                                    {product.colors && product.colors.length > 0 && (
                                        <div className="flex items-start gap-2">
                                            <span className="text-xs text-gray-500 min-w-[80px]">Colors:</span>
                                            <div className="flex flex-wrap gap-1">
                                                {product.colors.map((color, i) => (
                                                    <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                                        {color}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {product.style && product.style.length > 0 && (
                                        <div className="flex items-start gap-2">
                                            <span className="text-xs text-gray-500 min-w-[80px]">Style:</span>
                                            <div className="flex flex-wrap gap-1">
                                                {product.style.map((s, i) => (
                                                    <span key={i} className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Source Link */}
                                <a
                                    href={product.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-6 w-full text-center bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    View Original Post
                                </a>
                            </div>

                            {/* Selected Item Details */}
                            {selectedItem && (
                                <div className="bg-white rounded-lg p-6 shadow-xl animate-fadeIn">
                                    <div className="flex items-start justify-between mb-4">
                                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                style={{ 
                                                    backgroundColor: getItemColor(
                                                        product.items.findIndex(item => item.id === selectedItem.id)
                                                    )
                                                }}
                                            >
                                                {product.items.findIndex(item => item.id === selectedItem.id) + 1}
                                            </div>
                                            Item Details
                                        </h4>
                                        <button
                                            onClick={() => setSelectedItem(null)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{selectedItem.name}</p>
                                            {selectedItem.brand && (
                                                <p className="text-xs text-purple-600">{selectedItem.brand}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div className="bg-gray-50 p-2 rounded">
                                                <span className="text-gray-500 block mb-1">Category</span>
                                                <p className="font-medium text-gray-900">{selectedItem.category}</p>
                                            </div>
                                            {selectedItem.sub_category && (
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <span className="text-gray-500 block mb-1">Sub-category</span>
                                                    <p className="font-medium text-gray-900">{selectedItem.sub_category}</p>
                                                </div>
                                            )}
                                            <div className="bg-gray-50 p-2 rounded">
                                                <span className="text-gray-500 block mb-1">Type</span>
                                                <p className="font-medium text-gray-900">{selectedItem.product_type}</p>
                                            </div>
                                            {selectedItem.gender && (
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <span className="text-gray-500 block mb-1">Gender</span>
                                                    <p className="font-medium text-gray-900">{selectedItem.gender}</p>
                                                </div>
                                            )}
                                        </div>

                                        {selectedItem.colors && selectedItem.colors.length > 0 && (
                                            <div>
                                                <span className="text-xs text-gray-500 block mb-2">Colors</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedItem.colors.map((color, i) => (
                                                        <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                                            {color}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedItem.style && selectedItem.style.length > 0 && (
                                            <div>
                                                <span className="text-xs text-gray-500 block mb-2">Style</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedItem.style.map((s, i) => (
                                                        <span key={i} className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedItem.confidence_score !== undefined && (
                                            <div>
                                                <span className="text-xs text-gray-500 block mb-2">Detection Confidence</span>
                                                <div className="bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${selectedItem.confidence_score * 100}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {(selectedItem.confidence_score * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;