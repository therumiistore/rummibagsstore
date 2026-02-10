/**
 * Analytics Dashboard Page
 * Sales charts, top products, and traffic metrics
 */

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard, { StatsIcons } from '@/components/dashboard/StatsCard';

// Demo data
const salesData = {
    today: { sales: 15200, orders: 8, visitors: 245 },
    week: { sales: 87500, orders: 42, visitors: 1892 },
    month: { sales: 345000, orders: 156, visitors: 7845 },
    year: { sales: 2450000, orders: 1234, visitors: 89420 },
};

const topProducts = [
    { id: 1, name: 'Premium Leather Bag', sales: 145, revenue: 652500, growth: 12.5 },
    { id: 2, name: 'Classic Designer Clutch', sales: 98, revenue: 274400, growth: 8.3 },
    { id: 3, name: 'Elegant Evening Bag', sales: 87, revenue: 278400, growth: -2.1 },
    { id: 4, name: 'Casual Tote Bag', sales: 76, revenue: 190000, growth: 15.7 },
    { id: 5, name: 'Mini Crossbody', sales: 65, revenue: 117000, growth: 5.2 },
];

const recentActivity = [
    { type: 'order', message: 'New order #ORD-2024-156 received', time: '2 min ago' },
    { type: 'product', message: 'Product "Vintage Handbag" is low on stock', time: '15 min ago' },
    { type: 'review', message: 'New 5-star review on "Premium Leather Bag"', time: '1 hour ago' },
    { type: 'order', message: 'Order #ORD-2024-155 marked as delivered', time: '2 hours ago' },
    { type: 'visitor', message: 'Traffic spike detected from Instagram', time: '3 hours ago' },
];

function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('week');

    const currentData = salesData[timeRange];

    const timeRangeLabels = {
        today: 'Today',
        week: 'This Week',
        month: 'This Month',
        year: 'This Year',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-500 mt-1">Track your store performance</p>
                </div>

                {/* Time Range Selector */}
                <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
                    {Object.entries(timeRangeLabels).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setTimeRange(key)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${timeRange === key
                                    ? 'bg-indigo-500 text-white shadow'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                <StatsCard
                    title={`${timeRangeLabels[timeRange]} Sales`}
                    value={currentData.sales}
                    prefix="Rs. "
                    icon={StatsIcons.sales}
                    color="indigo"
                    trend="up"
                    trendValue="+12.5%"
                />
                <StatsCard
                    title={`${timeRangeLabels[timeRange]} Orders`}
                    value={currentData.orders}
                    icon={StatsIcons.orders}
                    color="purple"
                    trend="up"
                    trendValue="+8.3%"
                />
                <StatsCard
                    title={`${timeRangeLabels[timeRange]} Visitors`}
                    value={currentData.visitors}
                    icon={StatsIcons.visitors}
                    color="emerald"
                    trend="up"
                    trendValue="+15.2%"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart Placeholder */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Sales Overview</h2>
                        <select className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>Last 90 days</option>
                        </select>
                    </div>

                    {/* Placeholder Chart */}
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                        {[65, 45, 78, 52, 88, 75, 92].map((height, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all hover:from-indigo-600 hover:to-purple-600"
                                    style={{ height: `${height}%` }}
                                ></div>
                                <span className="text-xs text-gray-500">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-gray-900">Rs. 87.5K</p>
                            <p className="text-sm text-gray-500">Total Sales</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">Rs. 12.5K</p>
                            <p className="text-sm text-gray-500">Average/Day</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-600">+12.5%</p>
                            <p className="text-sm text-gray-500">vs Last Week</p>
                        </div>
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Traffic Sources</h2>

                    <div className="space-y-4">
                        {[
                            { source: 'Direct', value: 45, color: 'bg-indigo-500' },
                            { source: 'Instagram', value: 28, color: 'bg-pink-500' },
                            { source: 'Facebook', value: 15, color: 'bg-blue-500' },
                            { source: 'Google', value: 8, color: 'bg-green-500' },
                            { source: 'Others', value: 4, color: 'bg-gray-400' },
                        ].map(item => (
                            <div key={item.source}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">{item.source}</span>
                                    <span className="text-sm text-gray-500">{item.value}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.color} rounded-full transition-all`}
                                        style={{ width: `${item.value}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">Total Visitors</p>
                            <p className="text-lg font-bold text-gray-900">{currentData.visitors.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Products */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Top Selling Products</h2>
                        <span className="text-sm text-gray-500">{timeRangeLabels[timeRange]}</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">#</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Product</th>
                                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Sales</th>
                                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Revenue</th>
                                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Growth</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {topProducts.map((product, index) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' :
                                                    index === 1 ? 'bg-gray-100 text-gray-600' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                                            'bg-gray-50 text-gray-500'
                                                }`}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{product.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600">{product.sales}</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            Rs. {product.revenue.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center gap-1 text-sm font-medium ${product.growth >= 0 ? 'text-emerald-600' : 'text-red-600'
                                                }`}>
                                                {product.growth >= 0 ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                                                    </svg>
                                                )}
                                                {Math.abs(product.growth)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === 'order' ? 'bg-indigo-100 text-indigo-600' :
                                            activity.type === 'product' ? 'bg-amber-100 text-amber-600' :
                                                activity.type === 'review' ? 'bg-emerald-100 text-emerald-600' :
                                                    'bg-purple-100 text-purple-600'
                                        }`}>
                                        {activity.type === 'order' && '📦'}
                                        {activity.type === 'product' && '⚠️'}
                                        {activity.type === 'review' && '⭐'}
                                        {activity.type === 'visitor' && '👀'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900">{activity.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 text-center">
                        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                            View all activity →
                        </button>
                    </div>
                </div>
            </div>

            {/* Conversion Metrics */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Conversion Metrics</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-3xl font-bold text-gray-900">3.2%</p>
                        <p className="text-sm text-gray-500 mt-1">Conversion Rate</p>
                        <p className="text-xs text-emerald-600 mt-2">↑ 0.5% vs last period</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-3xl font-bold text-gray-900">Rs. 2,150</p>
                        <p className="text-sm text-gray-500 mt-1">Avg. Order Value</p>
                        <p className="text-xs text-emerald-600 mt-2">↑ Rs. 250 vs last period</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-3xl font-bold text-gray-900">68%</p>
                        <p className="text-sm text-gray-500 mt-1">Cart Completion</p>
                        <p className="text-xs text-red-600 mt-2">↓ 2% vs last period</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-3xl font-bold text-gray-900">24%</p>
                        <p className="text-sm text-gray-500 mt-1">Return Customers</p>
                        <p className="text-xs text-emerald-600 mt-2">↑ 3% vs last period</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AnalyticsIndex() {
    return (
        <DashboardLayout title="Analytics" pageTitle="Analytics">
            <AnalyticsPage />
        </DashboardLayout>
    );
}
