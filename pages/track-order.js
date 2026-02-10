/**
 * Track Order Page
 * Customers can track their orders using order number and phone
 */

'use client';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import storefrontApi from '@/lib/storefrontApi';
import { useStore } from '@/lib/StoreContext';

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-500', step: 1 },
    processing: { label: 'Processing', color: 'bg-blue-500', step: 2 },
    shipped: { label: 'Shipped', color: 'bg-purple-500', step: 3 },
    delivered: { label: 'Delivered', color: 'bg-green-500', step: 4 },
    cancelled: { label: 'Cancelled', color: 'bg-red-500', step: 0 },
};

const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

export default function TrackOrderPage() {
    const { store, storeSlug } = useStore();
    const [orderNumber, setOrderNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const currency = store?.currency_symbol || 'Rs. ';

    const handleTrack = async (e) => {
        e.preventDefault();

        if (!orderNumber.trim() || !phone.trim()) {
            setError('Please enter both order number and phone number');
            return;
        }

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const response = await storefrontApi.trackOrder(storeSlug, orderNumber, phone);
            if (response.success) {
                setOrder(response.data);
            } else {
                setError(response.error || 'Order not found');
            }
        } catch (err) {
            console.error('Track order error:', err);
            setError(err.message || 'Failed to track order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCurrentStep = (status) => {
        return statusConfig[status]?.step || 0;
    };

    return (
        <>
            <Head>
                <title>Track Order - {store?.name || 'Store'}</title>
            </Head>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b">
                    <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                        <Link href="/" className="text-xl font-bold text-gray-900">
                            {store?.name || 'Store'}
                        </Link>
                        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                            ← Back to Shop
                        </Link>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-4 py-8">
                    {/* Track Order Form */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Order</h1>
                        <p className="text-gray-500 mb-6">Enter your order number and phone number to track your order</p>

                        <form onSubmit={handleTrack} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Order Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., ORD-2024-1234"
                                        value={orderNumber}
                                        onChange={(e) => setOrderNumber(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-primary-900 focus:ring-2 focus:ring-primary-900/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="Your phone number"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-primary-900 focus:ring-2 focus:ring-primary-900/20 transition-all"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-primary-900 text-white font-medium hover:bg-primary-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Tracking...
                                    </span>
                                ) : 'Track Order'}
                            </button>
                        </form>
                    </div>

                    {/* Order Details */}
                    {order && (
                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                            {/* Order Header */}
                            <div className="p-6 border-b bg-gray-50">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Order Number</p>
                                        <p className="text-xl font-bold text-gray-900">{order.order_number}</p>
                                    </div>
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white ${statusConfig[order.status]?.color || 'bg-gray-500'}`}>
                                        {statusConfig[order.status]?.label || order.status}
                                    </div>
                                </div>
                            </div>

                            {/* Status Timeline */}
                            {order.status !== 'cancelled' && (
                                <div className="p-6 border-b">
                                    <h3 className="font-semibold text-gray-900 mb-6">Order Status</h3>
                                    <div className="flex items-center justify-between relative">
                                        {/* Progress Line */}
                                        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                                            <div
                                                className="h-full bg-primary-900 transition-all"
                                                style={{ width: `${((getCurrentStep(order.status) - 1) / 3) * 100}%` }}
                                            />
                                        </div>

                                        {statusSteps.map((step, index) => {
                                            const isActive = getCurrentStep(order.status) >= index + 1;
                                            const isCurrent = getCurrentStep(order.status) === index + 1;
                                            return (
                                                <div key={step} className="flex flex-col items-center relative z-10">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-400'
                                                        } ${isCurrent ? 'ring-4 ring-indigo-200' : ''}`}>
                                                        {isActive ? (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        ) : (
                                                            <span>{index + 1}</span>
                                                        )}
                                                    </div>
                                                    <p className={`mt-2 text-xs font-medium ${isActive ? 'text-primary-900' : 'text-gray-400'}`}>
                                                        {statusConfig[step].label}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Cancelled Notice */}
                            {order.status === 'cancelled' && (
                                <div className="p-6 border-b bg-red-50">
                                    <div className="flex items-center gap-3 text-red-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">This order has been cancelled</span>
                                    </div>
                                </div>
                            )}

                            {/* Order Info */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
                                    <p className="text-gray-600">{order.customer_name}</p>
                                    <p className="text-gray-500 text-sm mt-1">{order.shipping_address}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Order Info</h3>
                                    <p className="text-gray-500 text-sm">
                                        Placed on: {formatDate(order.created_at)}
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        Payment: {order.payment_method === 'COD' ? 'Cash on Delivery' : order.payment_method}
                                    </p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6 border-t">
                                <h3 className="font-semibold text-gray-900 mb-4">Items</h3>
                                <div className="space-y-3">
                                    {order.items?.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                                            <div className="flex items-center gap-3">
                                                {item.image && (
                                                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.name}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.qty || item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-medium text-gray-900">
                                                {currency}{(item.price * (item.qty || item.quantity || 1)).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="p-6 border-t bg-gray-50">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="text-gray-900">{currency}{parseFloat(order.subtotal).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Shipping</span>
                                        <span className="text-gray-900">
                                            {parseFloat(order.shipping_fee) > 0 ? `${currency}${parseFloat(order.shipping_fee).toLocaleString()}` : 'Free'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t mt-2">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="font-bold text-lg text-gray-900">{currency}{parseFloat(order.total).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

// Add getServerSideProps to resolve store
export async function getServerSideProps(context) {
    const { resolveStoreSlug } = await import('@/lib/storefrontApi');
    const host = context.req.headers.host || '';
    const storeSlug = resolveStoreSlug(host);

    return {
        props: { storeSlug }
    };
}
