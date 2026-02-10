/**
 * Products Management Page
 * List, search, filter, and manage products with API integration
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Modal, { ConfirmModal } from '@/components/dashboard/Modal';
import { useAuth } from '@/lib/dashboardAuth';
import api from '@/lib/api';

const statusConfig = {
    active: { label: 'Active', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    out_of_stock: { label: 'Out of Stock', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
};

function ProductsPage() {
    const { store } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('created_at');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deleteProduct, setDeleteProduct] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

    // New product form state - extended with all fields
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        original_price: '',
        description: '',
        short_description: '',
        category_id: '',
        subcategory: '',
        stock: 0,
        sku: '',
        status: 'active',
        is_featured: false,
        seo_title: '',
        seo_description: ''
    });
    const [saving, setSaving] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // Track if editing

    // Sizes state (array of {size, pricebysize})
    const [sizes, setSizes] = useState([]);
    // Colors state (array of strings)
    const [colors, setColors] = useState([]);
    // SEO section collapsed state
    const [showSeoSection, setShowSeoSection] = useState(false);

    // Image upload state
    const [selectedImages, setSelectedImages] = useState([]); // File objects
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]); // Preview URLs (blob or http)
    const [existingImages, setExistingImages] = useState([]); // Existing image URLs (strings)
    const [inputImageUrl, setInputImageUrl] = useState(''); // Text input for URL
    const [uploadingImages, setUploadingImages] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Custom variant types (from store settings) and values (for current product)
    const [customVariantTypes, setCustomVariantTypes] = useState([]);
    const [customVariants, setCustomVariants] = useState({});

    useEffect(() => {
        fetchCategories();
        fetchProducts();
        fetchCustomVariantTypes();
    }, [searchQuery, selectedCategory, sortBy, pagination.page]);

    const fetchCategories = async () => {
        try {
            const response = await api.getCategories();
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    // Fetch custom variant types from store settings
    const fetchCustomVariantTypes = async () => {
        try {
            const response = await api.getSettings();
            if (response.success && response.data?.appearance?.customVariantTypes) {
                setCustomVariantTypes(response.data.appearance.customVariantTypes);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                sort: sortBy,
                order: sortBy === 'name' ? 'asc' : 'desc',
            };
            if (searchQuery) params.search = searchQuery;
            if (selectedCategory) params.category = selectedCategory;

            const response = await api.getProducts(params);
            if (response.success) {
                setProducts(response.data.products.map(p => ({
                    ...p,
                    price: parseFloat(p.price),
                    original_price: p.original_price ? parseFloat(p.original_price) : null,
                })));
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (deleteProduct) {
            try {
                await api.deleteProduct(deleteProduct.id);
                setProducts(products.filter(p => p.id !== deleteProduct.id));
                setDeleteProduct(null);
            } catch (error) {
                console.error('Failed to delete product:', error);
            }
        }
    };

    // Image file selection handler
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files || []);
        addImagesToSelection(files);
    };

    // Add images to selection (with preview)
    const addImagesToSelection = (files) => {
        const remainingSlots = 10 - (selectedImages.length + existingImages.length); // Increase limit to 10
        if (remainingSlots <= 0) return;

        const validFiles = files.filter(file =>
            file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
        ).slice(0, remainingSlots);

        if (validFiles.length === 0) return;

        // Create preview URLs
        const newPreviews = validFiles.map(file => ({
            type: 'file',
            url: URL.createObjectURL(file),
            file: file
        }));

        setSelectedImages(prev => [...prev, ...validFiles]);
        setImagePreviewUrls(prev => [...prev, ...newPreviews]);
    };

    // Add image from URL
    const addImageUrl = () => {
        if (!inputImageUrl.trim()) return;

        // Basic validation
        if (selectedImages.length + existingImages.length >= 10) return;

        setExistingImages(prev => [...prev, inputImageUrl.trim()]);
        setImagePreviewUrls(prev => [...prev, {
            type: 'url',
            url: inputImageUrl.trim()
        }]);
        setInputImageUrl('');
    };

    // Remove image from selection
    const removeImage = (index) => {
        const imageToRemove = imagePreviewUrls[index];

        if (imageToRemove.type === 'file') {
            URL.revokeObjectURL(imageToRemove.url);
            // Find index in selectedImages
            const fileIndex = selectedImages.indexOf(imageToRemove.file);
            if (fileIndex !== -1) {
                const newSelected = [...selectedImages];
                newSelected.splice(fileIndex, 1);
                setSelectedImages(newSelected);
            }
        } else {
            // Remove from existingImages
            const urlIndex = existingImages.indexOf(imageToRemove.url);
            if (urlIndex !== -1) {
                const newExisting = [...existingImages];
                newExisting.splice(urlIndex, 1);
                setExistingImages(newExisting);
            }
        }

        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    // Drag and drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addImagesToSelection(Array.from(e.dataTransfer.files));
        }
    };

    // Reset form state
    const resetForm = () => {
        setNewProduct({
            name: '', price: '', original_price: '', description: '', short_description: '',
            category_id: '', subcategory: '', stock: 0, sku: '', status: 'active', is_featured: false,
            seo_title: '', seo_description: ''
        });
        setSizes([]);
        setColors([]);
        setCustomVariants({});
        setShowSeoSection(false);
        setEditingProduct(null);
        setInputImageUrl('');
        // Clean up preview URLs
        imagePreviewUrls.forEach(item => {
            if (item.type === 'file') URL.revokeObjectURL(item.url);
        });
        setSelectedImages([]);
        setExistingImages([]);
        setImagePreviewUrls([]);
    };

    // Size handlers
    const addSize = () => {
        setSizes([...sizes, { size: '', pricebysize: '' }]);
    };

    const updateSize = (index, field, value) => {
        const updated = [...sizes];
        updated[index][field] = value;
        setSizes(updated);
    };

    const removeSize = (index) => {
        setSizes(sizes.filter((_, i) => i !== index));
    };

    // Color handlers
    const addColor = () => {
        setColors([...colors, '']);
    };

    const updateColor = (index, value) => {
        const updated = [...colors];
        updated[index] = value;
        setColors(updated);
    };

    const removeColor = (index) => {
        setColors(colors.filter((_, i) => i !== index));
    };

    // Custom Variant handlers (like sizes, each variant type has array of {name, price})
    const addCustomVariantEntry = (variantTypeName) => {
        setCustomVariants(prev => ({
            ...prev,
            [variantTypeName]: [...(prev[variantTypeName] || []), { name: '', price: '' }]
        }));
    };

    const updateCustomVariantEntry = (variantTypeName, index, field, value) => {
        setCustomVariants(prev => {
            const entries = [...(prev[variantTypeName] || [])];
            entries[index] = { ...entries[index], [field]: value };
            return { ...prev, [variantTypeName]: entries };
        });
    };

    const removeCustomVariantEntry = (variantTypeName, index) => {
        setCustomVariants(prev => {
            const entries = (prev[variantTypeName] || []).filter((_, i) => i !== index);
            return { ...prev, [variantTypeName]: entries };
        });
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name,
            price: product.price,
            original_price: product.original_price || '',
            description: product.description || '',
            short_description: product.short_description || '',
            category_id: product.category_id || '',
            subcategory: product.subcategory || '',
            stock: product.stock,
            sku: product.sku || '',
            status: product.status || 'active',
            is_featured: product.is_featured || false,
            seo_title: product.seo_title || '',
            seo_description: product.seo_description || ''
        });

        // Restore attributes
        if (product.attributes) {
            if (product.attributes.sizes) {
                setSizes(product.attributes.sizes);
            }
            if (product.attributes.colors) {
                setColors(product.attributes.colors);
            }
            if (product.attributes.customVariants) {
                setCustomVariants(product.attributes.customVariants);
            }
        }

        // Restore images
        if (product.images && Array.isArray(product.images)) {
            setExistingImages(product.images);
            setImagePreviewUrls(product.images.map(url => ({ type: 'url', url })));
        }

        setIsAddModalOpen(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price) return;

        try {
            setSaving(true);
            let uploadedImages = [];
            let thumbnail = null;

            // Upload images first if any new files
            if (selectedImages.length > 0) {
                setUploadingImages(true);
                try {
                    const uploadResponse = await api.uploadProductImagesStandalone(selectedImages);
                    if (uploadResponse.success) {
                        uploadedImages = uploadResponse.data.images;
                        // Use backend thumbnail if provided, otherwise logic below handles it
                        if (!thumbnail) thumbnail = uploadResponse.data.thumbnail;
                    }
                } catch (uploadError) {
                    console.error('Failed to upload images:', uploadError);
                }
                setUploadingImages(false);
            }

            // Combine existing images with newly uploaded ones
            // Respect the order in imagePreviewUrls if possible, but for simplicity we append new to old
            // Ideally we should reconstruct the order from imagePreviewUrls

            const finalImages = [];
            // We can iterate through imagePreviewUrls to maintain order
            // If type is 'url', it's in existingImages (or added via URL input)
            // If type is 'file', it should be in uploadedImages (but uploadedImages is just a list of new URLs)

            // Simpler approach: Merge existingImages (which includes URL inputs) + uploadedImages
            // Note: existingImages state is updated when we add URL input or remove image.

            const allImages = [...existingImages, ...uploadedImages];
            // If no thumbnail set yet, use first image
            if (!thumbnail && allImages.length > 0) {
                thumbnail = allImages[0];
            }

            // Package sizes and colors into attributes
            const attributes = {};
            if (sizes.length > 0) {
                attributes.sizes = sizes.filter(s => s.size.trim() !== '').map(s => ({
                    size: s.size,
                    pricebysize: parseFloat(s.pricebysize) || 0
                }));
            }
            if (colors.length > 0) {
                attributes.colors = colors.filter(c => c.trim() !== '');
            }
            // Add custom variants (filter out empty values)
            const filteredCustomVariants = {};
            Object.entries(customVariants).forEach(([key, value]) => {
                if (Array.isArray(value) && value.length > 0) {
                    filteredCustomVariants[key] = value;
                } else if (typeof value === 'string' && value.trim()) {
                    filteredCustomVariants[key] = value.trim();
                }
            });
            if (Object.keys(filteredCustomVariants).length > 0) {
                attributes.customVariants = filteredCustomVariants;
            }

            const productData = {
                name: newProduct.name,
                description: newProduct.description,
                short_description: newProduct.short_description,
                price: parseFloat(newProduct.price),
                original_price: newProduct.original_price ? parseFloat(newProduct.original_price) : null,
                category_id: newProduct.category_id || null,
                subcategory: newProduct.subcategory || null,
                stock: parseInt(newProduct.stock) || 0,
                sku: newProduct.sku,
                status: newProduct.status,
                is_featured: newProduct.is_featured,
                images: allImages,
                thumbnail: thumbnail,
                attributes: Object.keys(attributes).length > 0 ? attributes : null,
                seo_title: newProduct.seo_title,
                seo_description: newProduct.seo_description,
            };

            let response;
            if (editingProduct) {
                response = await api.updateProduct(editingProduct.id, productData);
            } else {
                response = await api.createProduct(productData);
            }

            if (response.success) {
                setIsAddModalOpen(false);
                resetForm();
                fetchProducts();
            }
        } catch (error) {
            console.error('Failed to save product:', error);
        } finally {
            setSaving(false);
            setUploadingImages(false);
        }
    };

    const handleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => p.id));
        }
    };

    const handleSelectProduct = (productId) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    const getProductStatus = (product) => {
        if (product.stock === 0) return 'out_of_stock';
        return product.status || 'active';
    };

    const currency = store?.currency_symbol || 'Rs. ';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500 mt-1">Manage your product catalog ({pagination.total} products)</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    {/* Sort & View Mode */}
                    <div className="flex items-center gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="price">Price</option>
                            <option value="stock">Stock Level</option>
                            <option value="created_at">Newest</option>
                        </select>

                        <div className="flex items-center rounded-xl bg-gray-100 p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Display */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading products...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-4">Get started by adding your first product.</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="text-indigo-600 font-medium hover:text-indigo-700"
                    >
                        Add Product
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map(product => {
                        const status = getProductStatus(product);
                        return (
                            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300">
                                <div className="relative aspect-square bg-gray-100">
                                    {product.thumbnail ? (
                                        <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${statusConfig[status]?.bg || 'bg-gray-100'} ${statusConfig[status]?.text || 'text-gray-700'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[status]?.dot || 'bg-gray-500'}`}></span>
                                            {statusConfig[status]?.label || status}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleEditClick(product)}
                                            className="p-2 bg-white rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setDeleteProduct(product)}
                                            className="p-2 bg-white rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="text-xs text-gray-500 mb-1">{product.category_name || 'Uncategorized'}</p>
                                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="font-bold text-gray-900">{currency}{product.price.toLocaleString()}</span>
                                        {product.original_price && (
                                            <span className="text-sm text-gray-400 line-through">{currency}{product.original_price.toLocaleString()}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                        <span className="text-sm text-gray-500">{product.stock} in stock</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Product</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Category</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Price</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Stock</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map(product => {
                                const status = getProductStatus(product);
                                return (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                                                    {product.thumbnail ? (
                                                        <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <p className="font-medium text-gray-900">{product.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{product.category_name || 'Uncategorized'}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{currency}{product.price.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{product.stock}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${statusConfig[status]?.bg} ${statusConfig[status]?.text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[status]?.dot}`}></span>
                                                {statusConfig[status]?.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(product)}
                                                    className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setDeleteProduct(product)}
                                                    className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-gray-600">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => setPagination(p => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
                        disabled={pagination.page === pagination.pages}
                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteProduct}
                onClose={() => setDeleteProduct(null)}
                onConfirm={handleDeleteProduct}
                title="Delete Product"
                message={`Are you sure you want to delete "${deleteProduct?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
            />

            {/* Add/Edit Product Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); resetForm(); }}
                title={editingProduct ? "Edit Product" : "Add New Product"}
                size="xl"
            >
                <form onSubmit={handleSaveProduct} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Basic Information
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                            <input
                                type="text"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                placeholder="Enter product name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                            <input
                                type="text"
                                value={newProduct.short_description}
                                onChange={(e) => setNewProduct({ ...newProduct, short_description: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                placeholder="Brief product summary (max 500 chars)"
                                maxLength={500}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                <input
                                    type="text"
                                    value={newProduct.sku}
                                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="e.g., PROD-001"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={newProduct.category_id}
                                    onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value, subcategory: '' })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Subcategory - Only show if selected category has subcategories */}
                        {(() => {
                            const selectedCategory = categories.find(cat => cat.id === newProduct.category_id);
                            const subcats = selectedCategory?.subcategories || [];

                            if (subcats.length > 0) {
                                return (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                                        <select
                                            value={newProduct.subcategory}
                                            onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                        >
                                            <option value="">None (No subcategory)</option>
                                            {subcats.map((subcat, idx) => (
                                                <option key={idx} value={subcat}>{subcat}</option>
                                            ))}
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">Optional: Select a subcategory for more specific categorization</p>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>

                    {/* Pricing & Stock Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pricing & Stock
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newProduct.original_price}
                                    onChange={(e) => setNewProduct({ ...newProduct, original_price: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="Compare at price"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                <input
                                    type="number"
                                    value={newProduct.stock}
                                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={newProduct.status}
                                    onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="active">Active</option>
                                    <option value="draft">Draft</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                </select>
                            </div>
                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newProduct.is_featured}
                                        onChange={(e) => setNewProduct({ ...newProduct, is_featured: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Featured Product</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Variants Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            Variants
                        </h3>

                        {/* Sizes */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">Sizes</label>
                                <button
                                    type="button"
                                    onClick={addSize}
                                    className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    + Add Size
                                </button>
                            </div>
                            {sizes.length === 0 ? (
                                <p className="text-xs text-gray-500">No sizes added. Click "Add Size" to create size variants.</p>
                            ) : (
                                <div className="space-y-2">
                                    {sizes.map((size, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={size.size}
                                                onChange={(e) => updateSize(index, 'size', e.target.value)}
                                                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                                                placeholder="Size name (e.g., Small)"
                                            />
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={size.pricebysize}
                                                onChange={(e) => updateSize(index, 'pricebysize', e.target.value)}
                                                className="w-28 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                                                placeholder="Price"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSize(index)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Colors */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">Colors</label>
                                <button
                                    type="button"
                                    onClick={addColor}
                                    className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    + Add Color
                                </button>
                            </div>
                            {colors.length === 0 ? (
                                <p className="text-xs text-gray-500">No colors added. Click "Add Color" to create color variants.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {colors.map((color, index) => (
                                        <div key={index} className="flex items-center gap-1 bg-gray-50 rounded-lg pl-3 pr-1 py-1">
                                            <input
                                                type="text"
                                                value={color}
                                                onChange={(e) => updateColor(index, e.target.value)}
                                                className="w-24 px-0 py-1 text-sm bg-transparent border-0 focus:ring-0"
                                                placeholder="Color"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeColor(index)}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Custom Variants (Dynamic from settings - like Sizes with name + price) */}
                    {customVariantTypes.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Custom Variants
                            </h3>
                            {customVariantTypes.map((variantType) => (
                                <div key={variantType.id}>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {variantType.name}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => addCustomVariantEntry(variantType.name)}
                                            className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                        >
                                            + Add {variantType.name}
                                        </button>
                                    </div>
                                    {(!customVariants[variantType.name] || customVariants[variantType.name].length === 0) ? (
                                        <p className="text-xs text-gray-500">No {variantType.name.toLowerCase()} variants added. Click "Add {variantType.name}" to create variants.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {customVariants[variantType.name].map((entry, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={entry.name}
                                                        onChange={(e) => updateCustomVariantEntry(variantType.name, index, 'name', e.target.value)}
                                                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                                                        placeholder={`${variantType.name} name (e.g., 2 Liters)`}
                                                    />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={entry.price}
                                                        onChange={(e) => updateCustomVariantEntry(variantType.name, index, 'price', e.target.value)}
                                                        className="w-28 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                                                        placeholder="Price"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCustomVariantEntry(variantType.name, index)}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <p className="text-xs text-gray-500">
                                Add variant options with their prices. Customers will be able to choose from these on the storefront.
                            </p>
                        </div>
                    )}

                    {/* Image Upload Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Product Images
                        </h3>

                        {/* Drag and Drop Zone */}
                        <div className="space-y-3">
                            {/* URL Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputImageUrl}
                                    onChange={(e) => setInputImageUrl(e.target.value)}
                                    placeholder="Enter image URL..."
                                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addImageUrl();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={addImageUrl}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                                >
                                    Add URL
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 text-center">- OR -</p>

                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${dragActive
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                                    } ${selectedImages.length + existingImages.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={selectedImages.length + existingImages.length >= 10}
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB (max 10 images)</p>
                                </div>
                            </div>
                        </div>

                        {/* Image Previews */}
                        {imagePreviewUrls.length > 0 && (
                            <div className="grid grid-cols-5 gap-3">
                                {imagePreviewUrls.map((item, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                                        <img src={item.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                        {index === 0 && (
                                            <span className="absolute top-1 left-1 px-1.5 py-0.5 text-xs font-medium bg-indigo-500 text-white rounded">
                                                Thumbnail
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {uploadingImages && (
                            <div className="flex items-center gap-2 text-sm text-indigo-600">
                                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                Uploading images...
                            </div>
                        )}
                    </div>

                    {/* Description Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            Description
                        </h3>
                        <textarea
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            placeholder="Detailed product description..."
                        />
                    </div>

                    {/* SEO Section (Collapsible) */}
                    <div className="pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setShowSeoSection(!showSeoSection)}
                            className="flex items-center justify-between w-full text-left"
                        >
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                SEO Settings
                                <span className="text-xs font-normal text-gray-500">(optional)</span>
                            </h3>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${showSeoSection ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {showSeoSection && (
                            <div className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                                    <input
                                        type="text"
                                        value={newProduct.seo_title}
                                        onChange={(e) => setNewProduct({ ...newProduct, seo_title: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="Custom title for search engines"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                                    <textarea
                                        value={newProduct.seo_description}
                                        onChange={(e) => setNewProduct({ ...newProduct, seo_description: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="Custom description for search engines"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white pb-2">
                        <button
                            type="button"
                            onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
                        >
                            {saving ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </span>
                            ) : (editingProduct ? 'Save Changes' : 'Add Product')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div >
    );
}

export default function ProductsIndex() {
    return (
        <DashboardLayout title="Products" pageTitle="Products">
            <ProductsPage />
        </DashboardLayout>
    );
}
