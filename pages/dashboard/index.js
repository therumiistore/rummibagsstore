/**
 * Dashboard Home Page
 * Overview with stats, recent orders, and quick actions
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard, { StatsIcons } from '@/components/dashboard/StatsCard';
import { useAuth } from '@/lib/dashboardAuth';
import api from '@/lib/api';

const statusColors = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
    shipped: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
    delivered: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

function DashboardHome() {
    const { user, store } = useAuth();
    const [timeOfDay, setTimeOfDay] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        pendingOrders: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setTimeOfDay('morning');
        else if (hour < 17) setTimeOfDay('afternoon');
        else setTimeOfDay('evening');
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch order stats
            const orderStatsRes = await api.getOrderStats();
            if (orderStatsRes.success) {
                setStats({
                    totalSales: parseFloat(orderStatsRes.data.confirmed_revenue) || 0,
                    totalOrders: parseInt(orderStatsRes.data.total_orders) || 0,
                    pendingOrders: parseInt(orderStatsRes.data.pending) || 0,
                    totalProducts: 0, // Will be set below
                });
            }

            // Fetch products count
            const productsRes = await api.getProducts({ limit: 1 });
            if (productsRes.success) {
                setStats(prev => ({
                    ...prev,
                    totalProducts: productsRes.data.pagination.total || 0,
                }));
            }

            // Fetch recent orders
            const ordersRes = await api.getOrders({ limit: 5, sort: 'created_at', order: 'desc' });
            if (ordersRes.success) {
                setRecentOrders(ordersRes.data.orders.map(order => ({
                    id: order.order_number,
                    customer: order.customer_name,
                    amount: parseFloat(order.total),
                    status: order.status,
                    date: formatRelativeTime(order.created_at),
                    items: order.items?.length || 0,
                })));
            }

            // Fetch top products (just get active products for now)
            const topProductsRes = await api.getProducts({ limit: 3, sort: 'created_at', order: 'desc' });
            if (topProductsRes.success) {
                setTopProducts(topProductsRes.data.products.map(p => ({
                    id: p.id,
                    name: p.name,
                    sales: 0, // Would need analytics for this
                    revenue: parseFloat(p.price) || 0,
                    image: p.thumbnail,
                })));
            }

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    const getGreeting = () => {
        switch (timeOfDay) {
            case 'morning': return '🌅 Good morning';
            case 'afternoon': return '☀️ Good afternoon';
            case 'evening': return '🌙 Good evening';
            default: return 'Hello';
        }
    };

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <svg className="absolute right-0 top-0 h-full" viewBox="0 0 400 400" fill="none">
                        <circle cx="400" cy="0" r="300" stroke="white" strokeWidth="2" />
                        <circle cx="400" cy="0" r="200" stroke="white" strokeWidth="2" />
                        <circle cx="400" cy="0" r="100" stroke="white" strokeWidth="2" />
                    </svg>
                </div>

                <div className="relative">
                    <h1 className="text-2xl lg:text-3xl font-bold">
                        {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋
                    </h1>
                    <p className="mt-2 text-white/80 max-w-xl">
                        Here&apos;s what&apos;s happening with {store?.name || 'your store'} today.
                        {stats.pendingOrders > 0 && (
                            <span className="font-semibold text-white"> You have {stats.pendingOrders} order{stats.pendingOrders > 1 ? 's' : ''} pending.</span>
                        )}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                            href="/dashboard/orders"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium hover:bg-white/30 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            View Orders
                        </Link>
                        <Link
                            href="/dashboard/products"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Product
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatsCard
                    title="Total Sales"
                    value={stats.totalSales}
                    prefix={store?.currency_symbol || 'Rs. '}
                    icon={StatsIcons.sales}
                    color="indigo"
                    loading={loading}
                />
                <StatsCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={StatsIcons.orders}
                    color="purple"
                    loading={loading}
                />
                <StatsCard
                    title="Products"
                    value={stats.totalProducts}
                    icon={StatsIcons.products}
                    color="emerald"
                    loading={loading}
                />
                <StatsCard
                    title="Pending"
                    value={stats.pendingOrders}
                    icon={StatsIcons.visitors}
                    color="amber"
                    loading={loading}
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                        <Link
                            href="/dashboard/orders"
                            className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                        >
                            View all →
                        </Link>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading...</div>
                        ) : recentOrders.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No orders yet</div>
                        ) : (
                            recentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                                                {order.customer.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{order.customer}</span>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]?.bg || 'bg-gray-100'} ${statusColors[order.status]?.text || 'text-gray-700'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${statusColors[order.status]?.dot || 'bg-gray-500'}`}></span>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">{order.id} • {order.items} items</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">{store?.currency_symbol || 'Rs. '}{order.amount.toLocaleString()}</p>
                                            <p className="text-sm text-gray-500">{order.date}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Products & Quick Actions */}
                <div className="space-y-6">
                    {/* Top Products */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Recent Products</h2>
                            <Link
                                href="/dashboard/products"
                                className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                            >
                                See all →
                            </Link>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">Loading...</div>
                            ) : topProducts.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No products yet</div>
                            ) : (
                                topProducts.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                            </div>
                                            <p className="font-semibold text-gray-900 text-sm">{store?.currency_symbol || 'Rs. '}{product.revenue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link
                                href="/dashboard/products"
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Add new product</p>
                                    <p className="text-sm text-gray-500">List a new item for sale</p>
                                </div>
                            </Link>

                            <Link
                                href="/dashboard/categories"
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Manage categories</p>
                                    <p className="text-sm text-gray-500">Organize your products</p>
                                </div>
                            </Link>

                            <Link
                                href="/dashboard/settings"
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Store settings</p>
                                    <p className="text-sm text-gray-500">Configure your store</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardIndex() {
    return (
        <DashboardLayout title="Overview" pageTitle="Dashboard">
            <DashboardHome />
        </DashboardLayout>
    );
}
