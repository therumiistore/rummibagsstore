/**
 * Inventory Management Page
 * View and manage product stock levels
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Modal from '@/components/dashboard/Modal';
import { useAuth } from '@/lib/dashboardAuth';
import api from '@/lib/api';

const stockStatusConfig = {
    in_stock: { label: 'In Stock', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    low_stock: { label: 'Low Stock', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    out_of_stock: { label: 'Out of Stock', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

function getStockStatus(stock) {
    if (stock <= 0) return 'out_of_stock';
    if (stock <= 5) return 'low_stock';
    return 'in_stock';
}

function InventoryPage() {
    const { store } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newStock, setNewStock] = useState('');
    const [updating, setUpdating] = useState(false);

    const currency = store?.currency_symbol || 'Rs. ';
    const lowStockThreshold = 5;

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.getProducts({ limit: 500 });
            if (response.success) {
                setProducts(response.data.products || []);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStock = async () => {
        if (!selectedProduct || newStock === '') return;

        setUpdating(true);
        try {
            const response = await api.updateProduct(selectedProduct.id, {
                stock: parseInt(newStock)
            });
            if (response.success) {
                setProducts(products.map(p =>
                    p.id === selectedProduct.id
                        ? { ...p, stock: parseInt(newStock) }
                        : p
                ));
                setIsEditModalOpen(false);
                setSelectedProduct(null);
                setNewStock('');
            }
        } catch (error) {
            console.error('Failed to update stock:', error);
        } finally {
            setUpdating(false);
        }
    };

    const openStockModal = (product) => {
        setSelectedProduct(product);
        setNewStock(product.stock?.toString() || '0');
        setIsEditModalOpen(true);
    };

    // Calculate stats
    const stats = {
        total: products.length,
        inStock: products.filter(p => getStockStatus(p.stock) === 'in_stock').length,
        lowStock: products.filter(p => getStockStatus(p.stock) === 'low_stock').length,
        outOfStock: products.filter(p => getStockStatus(p.stock) === 'out_of_stock').length,
        totalValue: products.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0),
    };

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = !searchQuery ||
            product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku?.toLowerCase().includes(searchQuery.toLowerCase());

        const status = getStockStatus(product.stock);
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'in_stock' && status === 'in_stock') ||
            (statusFilter === 'low_stock' && status === 'low_stock') ||
            (statusFilter === 'out_of_stock' && status === 'out_of_stock');

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
                <p className="text-gray-500 mt-1">Manage product stock levels</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                    { label: 'Total Products', value: stats.total, filter: 'all' },
                    { label: 'In Stock', value: stats.inStock, filter: 'in_stock', color: 'text-emerald-600' },
                    { label: 'Low Stock', value: stats.lowStock, filter: 'low_stock', color: 'text-amber-600' },
                    { label: 'Out of Stock', value: stats.outOfStock, filter: 'out_of_stock', color: 'text-red-600' },
                    { label: 'Inventory Value', value: `${currency}${stats.totalValue.toLocaleString()}`, isValue: true },
                ].map(stat => (
                    <button
                        key={stat.label}
                        onClick={() => !stat.isValue && setStatusFilter(stat.filter)}
                        disabled={stat.isValue}
                        className={`p-4 rounded-2xl border transition-all ${!stat.isValue && statusFilter === stat.filter
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-100 bg-white hover:border-gray-200'
                            } ${stat.isValue ? 'cursor-default' : ''}`}
                    >
                        <p className={`text-2xl font-bold ${stat.color || 'text-gray-900'}`}>
                            {stat.value}
                        </p>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search by product name or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading inventory...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Product</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">SKU</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Stock</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Price</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Value</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="text-gray-400">
                                                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                                <p className="text-lg font-medium text-gray-600 mb-1">No products found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map(product => {
                                        const status = getStockStatus(product.stock);
                                        const stockValue = (product.stock || 0) * (product.price || 0);
                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {product.thumbnail && (
                                                            <img
                                                                src={product.thumbnail}
                                                                alt={product.name}
                                                                className="w-10 h-10 rounded-lg object-cover"
                                                            />
                                                        )}
                                                        <p className="font-medium text-gray-900 truncate max-w-[200px]">
                                                            {product.name}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-500 font-mono">
                                                        {product.sku || '-'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`text-lg font-bold ${status === 'out_of_stock' ? 'text-red-600' :
                                                            status === 'low_stock' ? 'text-amber-600' : 'text-gray-900'
                                                        }`}>
                                                        {product.stock || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${stockStatusConfig[status]?.bg} ${stockStatusConfig[status]?.text}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${stockStatusConfig[status]?.dot}`}></span>
                                                        {stockStatusConfig[status]?.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="font-medium text-gray-900">
                                                        {currency}{parseFloat(product.price || 0).toLocaleString()}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="font-medium text-gray-600">
                                                        {currency}{stockValue.toLocaleString()}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end">
                                                        <button
                                                            onClick={() => openStockModal(product)}
                                                            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                        >
                                                            Update Stock
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Update Stock Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedProduct(null);
                    setNewStock('');
                }}
                title="Update Stock"
                size="sm"
            >
                {selectedProduct && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            {selectedProduct.thumbnail && (
                                <img
                                    src={selectedProduct.thumbnail}
                                    alt={selectedProduct.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                />
                            )}
                            <div>
                                <p className="font-medium text-gray-900">{selectedProduct.name}</p>
                                <p className="text-sm text-gray-500">
                                    Current stock: <span className="font-semibold">{selectedProduct.stock || 0}</span>
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Stock Quantity
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={newStock}
                                onChange={(e) => setNewStock(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-lg font-semibold text-center focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateStock}
                                disabled={updating || newStock === ''}
                                className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {updating ? 'Updating...' : 'Update Stock'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default function InventoryIndex() {
    return (
        <DashboardLayout title="Inventory" pageTitle="Inventory">
            <InventoryPage />
        </DashboardLayout>
    );
}
