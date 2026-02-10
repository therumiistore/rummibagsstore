/**
 * Store Settings Page
 * Configure store branding, contact info, and preferences with API integration
 */

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/lib/dashboardAuth';
import api from '@/lib/api';

// Production domain for store URLs
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'websitse.com';

function SettingsPage() {
    const { user, store } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    const [settings, setSettings] = useState({
        store_name: '',
        description: '',
        tagline: '',
        email: '',
        phone: '',
        whatsapp: '',
        address: '',
        facebook: '',
        instagram: '',
        twitter: '',
        whatsapp_social: '',
        currency: 'PKR',
        currency_symbol: 'Rs.',
        free_shipping_threshold: 5000,
        shipping_fee: 250,
        cod_enabled: true,
    });

    // Domain settings state
    const [storeSlug, setStoreSlug] = useState('');
    const [newSlug, setNewSlug] = useState('');
    const [slugStatus, setSlugStatus] = useState('idle'); // idle, checking, available, taken, invalid
    const [slugError, setSlugError] = useState('');
    const [customDomain, setCustomDomain] = useState('');
    const [newDomain, setNewDomain] = useState('');
    const [domainStatus, setDomainStatus] = useState('idle');
    const [domainError, setDomainError] = useState('');
    const [slugTimeout, setSlugTimeout] = useState(null);
    const [domainTimeout, setDomainTimeout] = useState(null);
    const [slugSaving, setSlugSaving] = useState(false);
    const [domainSaving, setDomainSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.getSettings();
            if (response.success && response.data) {
                setSettings({
                    store_name: response.data.store_name || store?.name || '',
                    description: response.data.description || '',
                    tagline: response.data.tagline || '',
                    email: response.data.email || user?.email || '',
                    phone: response.data.phone || '',
                    whatsapp: response.data.whatsapp || '',
                    address: response.data.address || '',
                    facebook: response.data.social_links?.facebook || '',
                    instagram: response.data.social_links?.instagram || '',
                    twitter: response.data.social_links?.twitter || '',
                    whatsapp_social: response.data.social_links?.whatsapp || '',
                    currency: response.data.currency || 'PKR',
                    currency_symbol: response.data.currency_symbol || 'Rs.',
                    free_shipping_threshold: parseFloat(response.data.free_shipping_threshold) || 5000,
                    shipping_fee: parseFloat(response.data.shipping_fee) || 250,
                    cod_enabled: response.data.cod_enabled ?? true,
                });
            }
            // Domain settings
            if (response.data) {
                setStoreSlug(response.data.slug || '');
                setNewSlug(response.data.slug || '');
                setCustomDomain(response.data.custom_domain || '');
                setNewDomain(response.data.custom_domain || '');
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    // Check slug availability with debounce
    useEffect(() => {
        if (!newSlug || newSlug === storeSlug) {
            setSlugStatus('idle');
            setSlugError('');
            return;
        }

        const slug = newSlug.toLowerCase().trim();
        if (slug.length < 3) {
            setSlugStatus('invalid');
            setSlugError('Must be at least 3 characters');
            return;
        }

        if (/\s/.test(slug) || !/^[a-z0-9-]+$/.test(slug)) {
            setSlugStatus('invalid');
            setSlugError('Only lowercase letters, numbers, and hyphens');
            return;
        }

        if (slugTimeout) clearTimeout(slugTimeout);
        setSlugStatus('checking');

        const timeout = setTimeout(async () => {
            try {
                const response = await api.checkSlugAvailability(slug);
                if (response.success) {
                    setSlugStatus(response.available ? 'available' : 'taken');
                    setSlugError(response.error || '');
                }
            } catch {
                setSlugStatus('idle');
            }
        }, 500);

        setSlugTimeout(timeout);
        return () => clearTimeout(timeout);
    }, [newSlug, storeSlug]);

    // Check domain availability with debounce
    useEffect(() => {
        if (!newDomain || newDomain === customDomain) {
            setDomainStatus('idle');
            setDomainError('');
            return;
        }

        const domain = newDomain.toLowerCase().trim();
        if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]*(\.[a-z]{2,})+$/.test(domain)) {
            setDomainStatus('invalid');
            setDomainError('Invalid format. Use: example.com');
            return;
        }

        if (domainTimeout) clearTimeout(domainTimeout);
        setDomainStatus('checking');

        const timeout = setTimeout(async () => {
            try {
                const response = await api.checkDomainAvailability(domain);
                if (response.success) {
                    setDomainStatus(response.available ? 'available' : 'taken');
                    setDomainError(response.error || '');
                }
            } catch {
                setDomainStatus('idle');
            }
        }, 500);

        setDomainTimeout(timeout);
        return () => clearTimeout(timeout);
    }, [newDomain, customDomain]);

    const handleSaveSlug = async () => {
        if (slugStatus !== 'available' && newSlug !== storeSlug) return;
        setSlugSaving(true);
        try {
            const response = await api.updateSlug(newSlug);
            if (response.success) {
                setStoreSlug(response.data.slug);
                setSlugStatus('idle');
            }
        } catch (err) {
            setSlugError(err.message);
        } finally {
            setSlugSaving(false);
        }
    };

    const handleSaveDomain = async () => {
        if (domainStatus !== 'available' && domainStatus !== 'idle') return;
        setDomainSaving(true);
        try {
            const response = await api.updateCustomDomain(newDomain || null);
            if (response.success) {
                setCustomDomain(response.data.custom_domain || '');
                setDomainStatus('idle');
            }
        } catch (err) {
            setDomainError(err.message);
        } finally {
            setDomainSaving(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaveSuccess(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                ...settings,
                social_links: {
                    facebook: settings.facebook,
                    instagram: settings.instagram,
                    twitter: settings.twitter,
                    whatsapp: settings.whatsapp_social
                }
            };
            await api.updateSettings(payload);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        {
            id: 'general',
            label: 'General',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            id: 'contact',
            label: 'Contact',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            id: 'social',
            label: 'Social Media',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            )
        },
        {
            id: 'shipping',
            label: 'Shipping',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            )
        },
        {
            id: 'payment',
            label: 'Payment',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            )
        },
        {
            id: 'domain',
            label: 'Domain',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
            )
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Configure your store preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-500/25 disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Saving...
                        </>
                    ) : saveSuccess ? (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Saved!
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-100 p-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">General Settings</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                                        <input
                                            type="text"
                                            value={settings.store_name}
                                            onChange={(e) => handleChange('store_name', e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                                        <input
                                            type="text"
                                            value={settings.tagline}
                                            onChange={(e) => handleChange('tagline', e.target.value)}
                                            placeholder="A short slogan for your store"
                                            className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
                                        <textarea
                                            value={settings.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all resize-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                            <select
                                                value={settings.currency}
                                                onChange={(e) => handleChange('currency', e.target.value)}
                                                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-gray-900"
                                            >
                                                <option value="PKR">Pakistani Rupee (PKR)</option>
                                                <option value="USD">US Dollar (USD)</option>
                                                <option value="GBP">British Pound (GBP)</option>
                                                <option value="EUR">Euro (EUR)</option>
                                                <option value="AED">UAE Dirham (AED)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Currency Symbol</label>
                                            <input
                                                type="text"
                                                value={settings.currency_symbol}
                                                onChange={(e) => handleChange('currency_symbol', e.target.value)}
                                                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-gray-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'contact' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={settings.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-gray-900 transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={settings.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                                            <input
                                                type="tel"
                                                value={settings.whatsapp}
                                                onChange={(e) => handleChange('whatsapp', e.target.value)}
                                                placeholder="923001234567"
                                                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                                        <textarea
                                            value={settings.address}
                                            onChange={(e) => handleChange('address', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-gray-900 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'social' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-900">Social Media Links</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">facebook.com/</span>
                                            <input
                                                type="text"
                                                value={settings.facebook}
                                                onChange={(e) => handleChange('facebook', e.target.value)}
                                                placeholder="yourpage"
                                                className="w-full h-11 pl-32 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">instagram.com/</span>
                                            <input
                                                type="text"
                                                value={settings.instagram}
                                                onChange={(e) => handleChange('instagram', e.target.value)}
                                                placeholder="yourhandle"
                                                className="w-full h-11 pl-36 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">X (Twitter)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">x.com/</span>
                                            <input
                                                type="text"
                                                value={settings.twitter}
                                                onChange={(e) => handleChange('twitter', e.target.value)}
                                                placeholder="yourhandle"
                                                className="w-full h-11 pl-20 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp (Social)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">wa.me/</span>
                                            <input
                                                type="text"
                                                value={settings.whatsapp_social}
                                                onChange={(e) => handleChange('whatsapp_social', e.target.value)}
                                                placeholder="923001234567"
                                                className="w-full h-11 pl-20 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-900"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Use international format without + (e.g., 923001234567)</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'shipping' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-900">Shipping Settings</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Fee</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{settings.currency_symbol}</span>
                                                <input
                                                    type="number"
                                                    value={settings.shipping_fee}
                                                    onChange={(e) => handleChange('shipping_fee', parseFloat(e.target.value) || 0)}
                                                    className="w-full h-11 pl-12 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-gray-900"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Above</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{settings.currency_symbol}</span>
                                                <input
                                                    type="number"
                                                    value={settings.free_shipping_threshold}
                                                    onChange={(e) => handleChange('free_shipping_threshold', parseFloat(e.target.value) || 0)}
                                                    className="w-full h-11 pl-12 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-gray-900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-indigo-50 rounded-xl">
                                        <p className="text-sm text-indigo-700">
                                            💡 Orders above <strong>{settings.currency_symbol}{settings.free_shipping_threshold?.toLocaleString()}</strong> get free shipping.
                                            Otherwise, <strong>{settings.currency_symbol}{settings.shipping_fee?.toLocaleString()}</strong> shipping fee applies.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'payment' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-900">Payment Settings</h2>
                                <div className="space-y-4">
                                    <div className="p-4 border border-gray-200 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Cash on Delivery</p>
                                                    <p className="text-sm text-gray-500">Accept payment when order is delivered</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.cod_enabled}
                                                    onChange={(e) => handleChange('cod_enabled', e.target.checked)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-11 h-6 rounded-full transition-colors ${settings.cod_enabled ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.cod_enabled ? 'translate-x-5' : ''}`}></div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="p-4 border border-gray-200 rounded-xl opacity-60">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Online Payment</p>
                                                    <p className="text-sm text-gray-500">Accept credit/debit cards & wallets</p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">Coming Soon</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'domain' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-900">Domain Settings</h2>

                                {/* Current Store URL */}
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Your Store URL</p>
                                            <p className="text-gray-600 font-mono mt-1">{storeSlug}.{MAIN_DOMAIN}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Change Store URL */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">Change Store URL</label>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={newSlug}
                                                onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s/g, '-'))}
                                                placeholder="your-store-name"
                                                className={`w-full h-11 px-4 pr-10 rounded-xl bg-gray-50 border text-gray-900 focus:bg-white transition-all
                                                    ${slugStatus === 'available' ? 'border-emerald-500 focus:border-emerald-500' :
                                                        slugStatus === 'taken' || slugStatus === 'invalid' ? 'border-red-500 focus:border-red-500' :
                                                            'border-gray-200 focus:border-gray-900'}`}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {slugStatus === 'checking' && <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />}
                                                {slugStatus === 'available' && <span className="text-emerald-500">✓</span>}
                                                {(slugStatus === 'taken' || slugStatus === 'invalid') && <span className="text-red-500">✕</span>}
                                            </div>
                                        </div>
                                        <span className="h-11 flex items-center text-gray-500">.{MAIN_DOMAIN}</span>
                                        <button
                                            onClick={handleSaveSlug}
                                            disabled={slugSaving || (slugStatus !== 'available' && newSlug !== storeSlug) || !newSlug}
                                            className="px-4 h-11 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {slugSaving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                    {slugError && <p className="text-sm text-red-500">{slugError}</p>}
                                </div>

                                {/* Custom Domain */}
                                <div className="pt-4 border-t border-gray-100 space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">Custom Domain (Optional)</label>
                                    <p className="text-sm text-gray-500">Connect your own domain to your store</p>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={newDomain}
                                                onChange={(e) => setNewDomain(e.target.value.toLowerCase().replace(/^(https?:\/\/|www\.)/i, ''))}
                                                placeholder="example.com"
                                                className={`w-full h-11 px-4 pr-10 rounded-xl bg-gray-50 border text-gray-900 focus:bg-white transition-all
                                                    ${domainStatus === 'available' ? 'border-emerald-500 focus:border-emerald-500' :
                                                        domainStatus === 'taken' || domainStatus === 'invalid' ? 'border-red-500 focus:border-red-500' :
                                                            'border-gray-200 focus:border-gray-900'}`}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {domainStatus === 'checking' && <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />}
                                                {domainStatus === 'available' && <span className="text-emerald-500">✓</span>}
                                                {(domainStatus === 'taken' || domainStatus === 'invalid') && <span className="text-red-500">✕</span>}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSaveDomain}
                                            disabled={domainSaving || (domainStatus !== 'available' && domainStatus !== 'idle') || newDomain === customDomain}
                                            className="px-4 h-11 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {domainSaving ? 'Saving...' : newDomain ? 'Save' : 'Remove'}
                                        </button>
                                    </div>
                                    {domainError && <p className="text-sm text-red-500">{domainError}</p>}

                                    {customDomain && (
                                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <p className="text-sm text-emerald-700">✓ Custom domain active: <strong>{customDomain}</strong></p>
                                        </div>
                                    )}

                                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                        <p className="text-sm text-amber-700 font-medium">DNS Setup Required</p>
                                        <p className="text-xs text-amber-600 mt-1">Point your domain&apos;s A record to our server IP or add a CNAME pointing to {MAIN_DOMAIN}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SettingsIndex() {
    return (
        <DashboardLayout title="Settings" pageTitle="Settings">
            <SettingsPage />
        </DashboardLayout>
    );
}
