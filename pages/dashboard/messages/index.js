/**
 * Dashboard Messages Page
 * View and manage contact form submissions
 */

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api from '@/lib/api';

const statusColors = {
    unread: { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' },
    read: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

function MessagesPage() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
    const [unreadCount, setUnreadCount] = useState(0);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState(''); // '', 'true', 'false'
    const [expandedId, setExpandedId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const fetchSubmissions = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = { page, limit: 15, sort: 'created_at', order: 'desc' };
            if (search) params.search = search;
            if (filter !== '') params.is_read = filter;

            const res = await api.getContactSubmissions(params);
            if (res.success) {
                setSubmissions(res.data.submissions);
                setPagination(res.data.pagination);
                setUnreadCount(res.data.unread);
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setLoading(false);
        }
    }, [search, filter]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const handleToggleRead = async (id, currentIsRead) => {
        try {
            setActionLoading(id);
            await api.markContactSubmissionRead(id, !currentIsRead);
            setSubmissions(prev => prev.map(s =>
                s.id === id ? { ...s, is_read: !currentIsRead } : s
            ));
            setUnreadCount(prev => currentIsRead ? prev + 1 : prev - 1);
        } catch (error) {
            console.error('Failed to toggle read status:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        try {
            setActionLoading(id);
            const submission = submissions.find(s => s.id === id);
            await api.deleteContactSubmission(id);
            setSubmissions(prev => prev.filter(s => s.id !== id));
            setPagination(prev => ({ ...prev, total: prev.total - 1 }));
            if (submission && !submission.is_read) {
                setUnreadCount(prev => prev - 1);
            }
            setDeleteConfirmId(null);
            if (expandedId === id) setExpandedId(null);
        } catch (error) {
            console.error('Failed to delete submission:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleExpand = async (id) => {
        if (expandedId === id) {
            setExpandedId(null);
            return;
        }
        setExpandedId(id);

        // Auto-mark as read
        const submission = submissions.find(s => s.id === id);
        if (submission && !submission.is_read) {
            handleToggleRead(id, false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    };

    const totalCount = pagination.total;
    const todayCount = submissions.filter(s => {
        const d = new Date(s.created_at);
        const now = new Date();
        return d.toDateString() === now.toDateString();
    }).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                    <p className="text-gray-500 mt-1">Contact form submissions from your storefront</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Messages</p>
                        <p className="text-2xl font-bold text-gray-900">{loading ? '—' : totalCount}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Unread</p>
                        <p className="text-2xl font-bold text-gray-900">{loading ? '—' : unreadCount}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Today</p>
                        <p className="text-2xl font-bold text-gray-900">{loading ? '—' : todayCount}</p>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search messages by name, email, or subject..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                    {/* Filter */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('')}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${filter === '' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('false')}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${filter === 'false' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Unread
                        </button>
                        <button
                            onClick={() => setFilter('true')}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${filter === 'true' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Read
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages List */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="mt-3 text-gray-500">Loading messages...</p>
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No messages yet</h3>
                        <p className="text-gray-500">Messages from your contact form will appear here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {submissions.map((submission) => (
                            <div key={submission.id}>
                                {/* Message Row */}
                                <div
                                    onClick={() => handleExpand(submission.id)}
                                    className={`px-6 py-4 cursor-pointer transition-colors hover:bg-gray-50 ${!submission.is_read ? 'bg-indigo-50/40' : ''}`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${!submission.is_read
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {submission.name.charAt(0).toUpperCase()}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`font-semibold truncate ${!submission.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {submission.name}
                                                </span>
                                                {!submission.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></span>
                                                )}
                                                <span className={`ml-auto text-xs flex-shrink-0 ${!submission.is_read ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                                                    {formatDate(submission.created_at)}
                                                </span>
                                            </div>
                                            {submission.subject && (
                                                <p className={`text-sm truncate mb-0.5 ${!submission.is_read ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                                                    {submission.subject}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-500 truncate">
                                                {submission.message}
                                            </p>
                                        </div>

                                        {/* Expand Icon */}
                                        <svg
                                            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${expandedId === submission.id ? 'rotate-180' : ''}`}
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Expanded Detail */}
                                {expandedId === submission.id && (
                                    <div className="px-6 py-5 bg-gray-50 border-t border-gray-100">
                                        <div className="max-w-3xl">
                                            {/* Contact Info */}
                                            <div className="flex flex-wrap gap-4 mb-4 text-sm">
                                                {submission.email && (
                                                    <a href={`mailto:${submission.email}`} className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        {submission.email}
                                                    </a>
                                                )}
                                                {submission.phone && (
                                                    <a href={`tel:${submission.phone}`} className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                        {submission.phone}
                                                    </a>
                                                )}
                                            </div>

                                            {/* Subject */}
                                            {submission.subject && (
                                                <div className="mb-3">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                                        {submission.subject}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Message */}
                                            <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
                                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{submission.message}</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3">
                                                {submission.email && (
                                                    <a
                                                        href={`mailto:${submission.email}?subject=Re: ${submission.subject || 'Your Message'}`}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l9 6 9-6-9-6-9 6z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8" />
                                                        </svg>
                                                        Reply via Email
                                                    </a>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleRead(submission.id, submission.is_read); }}
                                                    disabled={actionLoading === submission.id}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={submission.is_read ? "M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                                                    </svg>
                                                    {submission.is_read ? 'Mark Unread' : 'Mark Read'}
                                                </button>

                                                {deleteConfirmId === submission.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-red-600">Delete?</span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(submission.id); }}
                                                            disabled={actionLoading === submission.id}
                                                            className="px-3 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                                        >
                                                            Yes
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                                                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(submission.id); }}
                                                        className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchSubmissions(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchSubmissions(pagination.page + 1)}
                                disabled={pagination.page >= pagination.pages}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DashboardMessages() {
    return (
        <DashboardLayout title="Messages" pageTitle="Messages">
            <MessagesPage />
        </DashboardLayout>
    );
}
