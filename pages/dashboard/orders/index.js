/**
 * Orders Management Page
 * View and manage customer orders with API integration
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Modal from '@/components/dashboard/Modal';
import { useAuth } from '@/lib/dashboardAuth';
import api from '@/lib/api';

const statusConfig = {
    pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    processing: { label: 'Processing', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
    shipped: { label: 'Shipped', bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
    delivered: { label: 'Delivered', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const statusFlow = ['pending', 'processing', 'shipped', 'delivered'];

function OrdersPage() {
    const { store } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0 });
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

    const currency = store?.currency_symbol || 'Rs. ';

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, searchQuery, pagination.page]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.getOrderStats();
            if (response.success) {
                setStats({
                    total: parseInt(response.data.total_orders) || 0,
                    pending: parseInt(response.data.pending) || 0,
                    processing: parseInt(response.data.processing) || 0,
                    shipped: parseInt(response.data.shipped) || 0,
                    delivered: parseInt(response.data.delivered) || 0,
                });
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                sort: 'created_at',
                order: 'desc',
            };
            if (searchQuery) params.search = searchQuery;
            if (statusFilter !== 'all') params.status = statusFilter;

            const response = await api.getOrders(params);
            if (response.success) {
                setOrders(response.data.orders.map(o => ({
                    ...o,
                    total: parseFloat(o.total),
                    items: o.items || [],
                })));
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsDetailModalOpen(true);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
            fetchStats();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!confirm('Are you sure you want to delete this order? This cannot be undone.')) return;

        try {
            await api.deleteOrder(orderId);
            setOrders(orders.filter(order => order.id !== orderId));
            if (selectedOrder?.id === orderId) {
                setIsDetailModalOpen(false);
                setSelectedOrder(null);
            }
            fetchStats();
        } catch (error) {
            console.error('Failed to delete order:', error);
            alert('Failed to delete order');
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;

        try {
            await api.cancelOrder(orderId);
            const newStatus = 'cancelled';
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
            fetchStats();
            alert('Order cancelled and stock restored successfully.');
        } catch (error) {
            console.error('Failed to cancel order:', error);
            alert('Failed to cancel order');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-PK', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-500 mt-1">Manage and track customer orders</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                    { label: 'All Orders', value: stats.total, filter: 'all' },
                    { label: 'Pending', value: stats.pending, filter: 'pending' },
                    { label: 'Processing', value: stats.processing, filter: 'processing' },
                    { label: 'Shipped', value: stats.shipped, filter: 'shipped' },
                    { label: 'Delivered', value: stats.delivered, filter: 'delivered' },
                ].map(stat => (
                    <button
                        key={stat.label}
                        onClick={() => setStatusFilter(stat.filter)}
                        className={`p-4 rounded-2xl border transition-all ${statusFilter === stat.filter
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                    >
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
                            placeholder="Search by order ID or customer name..."
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

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading orders...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Order</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Customer</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Items</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Total</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="text-gray-400">
                                                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <p className="text-lg font-medium text-gray-600 mb-1">No orders found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-mono text-sm font-medium text-gray-900">{order.order_number}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">{order.customer_name}</p>
                                                <p className="text-sm text-gray-500">{order.customer_phone}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-600">{order.items?.length || 0} items</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900">{currency}{order.total.toLocaleString()}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig[order.status]?.bg || 'bg-gray-100'} ${statusConfig[order.status]?.text || 'text-gray-700'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[order.status]?.dot || 'bg-gray-500'}`}></span>
                                                    {statusConfig[order.status]?.label || order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewOrder(order)}
                                                        className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                            className="text-sm px-2 py-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:border-indigo-500"
                                                        >
                                                            {statusFlow.map(status => (
                                                                <option key={status} value={status}>{statusConfig[status].label}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

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
                    <span className="px-4 py-2 text-gray-600">Page {pagination.page} of {pagination.pages}</span>
                    <button
                        onClick={() => setPagination(p => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
                        disabled={pagination.page === pagination.pages}
                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Order Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title={`Order ${selectedOrder?.order_number}`}
                size="lg"
            >
                {selectedOrder && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium mt-1 ${statusConfig[selectedOrder.status]?.bg} ${statusConfig[selectedOrder.status]?.text}`}>
                                    <span className={`w-2 h-2 rounded-full ${statusConfig[selectedOrder.status]?.dot}`}></span>
                                    {statusConfig[selectedOrder.status]?.label}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Order Date</p>
                                <p className="font-medium text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium text-gray-900">{selectedOrder.customer_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium text-gray-900">{selectedOrder.customer_phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">{selectedOrder.customer_email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment</p>
                                    <p className="font-medium text-gray-900">{selectedOrder.payment_method || 'COD'}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-gray-500">Delivery Address</p>
                                <p className="font-medium text-gray-900">{selectedOrder.shipping_address}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Product</th>
                                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Qty</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {selectedOrder.items?.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    <div className="font-medium">{item.product_name || item.name}</div>
                                                    {item.selectedConfiguration && Object.keys(item.selectedConfiguration).length > 0 && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {Object.entries(item.selectedConfiguration).map(([key, value]) => {
                                                                // Handle object values (custom variants with {name, price})
                                                                const displayValue = typeof value === 'object' && value !== null
                                                                    ? value.name
                                                                    : value;
                                                                return (
                                                                    <span key={key} className="mr-3 inline-block">
                                                                        <span className="capitalize">{key}:</span> {displayValue}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity || item.qty}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{currency}{parseFloat(item.price).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan={2} className="px-4 py-3 text-right font-semibold text-gray-900">Total</td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-900">{currency}{selectedOrder.total.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500">Update Status:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {statusFlow.map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                                                disabled={selectedOrder.status === status}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedOrder.status === status
                                                    ? `${statusConfig[status].bg} ${statusConfig[status].text}`
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {statusConfig[status].label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleCancelOrder(selectedOrder.id)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                >
                                    Cancel Order
                                </button>
                            </div>
                        )}

                        {selectedOrder.status === 'cancelled' && (
                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Delete Permanently
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default function OrdersIndex() {
    return (
        <DashboardLayout title="Orders" pageTitle="Orders">
            <OrdersPage />
        </DashboardLayout>
    );
}
