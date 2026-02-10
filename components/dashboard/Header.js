/**
 * Dashboard Header Component
 * Top bar with search, notifications, and user actions
 */

import { useState } from 'react';
import { useAuth } from '@/lib/dashboardAuth';

export default function Header({ onMenuClick, title = 'Dashboard' }) {
    const { user } = useAuth();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Demo notifications
    const notifications = [
        { id: 1, title: 'New order received', message: 'Order #1234 - Rs. 2,500', time: '5 min ago', unread: true },
        { id: 2, title: 'Product low stock', message: 'Black Leather Bag - 2 left', time: '1 hour ago', unread: true },
        { id: 3, title: 'New review', message: '5-star review on Premium Handbag', time: '3 hours ago', unread: false },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Page Title */}
                    <h1 className="text-xl font-bold text-gray-900 hidden sm:block">{title}</h1>
                </div>

                {/* Center - Search */}
                <div className="flex-1 max-w-xl hidden md:block">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products, orders, customers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-100 border border-transparent 
                       text-gray-900 placeholder-gray-500
                       focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                       transition-all duration-200"
                        />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>

                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Mobile Search Toggle */}
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="md:hidden p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>

                    {/* Quick Add Button */}
                    <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Product</span>
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {isNotificationsOpen && (
                            <>
                                <div
                                    className="fixed inset-0"
                                    onClick={() => setIsNotificationsOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                                        <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:text-indigo-700">
                                            Mark all read
                                        </span>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${notification.unread ? 'bg-indigo-50/50' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-2 h-2 mt-2 rounded-full ${notification.unread ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                                        <p className="text-sm text-gray-500 truncate">{notification.message}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-3 border-t border-gray-100 text-center">
                                        <span className="text-sm text-indigo-600 font-medium cursor-pointer hover:text-indigo-700">
                                            View all notifications
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* User Avatar (Mobile) */}
                    <div className="lg:hidden">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search Overlay */}
            {isSearchOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 p-4 bg-white border-b border-gray-200 shadow-lg">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            className="w-full h-10 pl-10 pr-10 rounded-xl bg-gray-100 border border-transparent 
                       text-gray-900 placeholder-gray-500
                       focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                       transition-all duration-200"
                        />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <button
                            onClick={() => setIsSearchOpen(false)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
