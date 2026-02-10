/**
 * Banners Management Page
 * Manage hero/promotional banners with API integration
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Modal, { ConfirmModal } from '@/components/dashboard/Modal';
import api from '@/lib/api';

function BannersPage() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [deleteBanner, setDeleteBanner] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        image: '',
        mobile_image: '',
        link: '',
        is_active: true,
        sort_order: 0
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await api.getBanners();
            if (response.success) {
                setBanners(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (banner = null) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
                title: banner.title || '',
                subtitle: banner.subtitle || '',
                image: banner.image || '',
                mobile_image: banner.mobile_image || '',
                link: banner.link || '',
                is_active: banner.is_active,
                sort_order: banner.sort_order || 0
            });
        } else {
            setEditingBanner(null);
            setFormData({
                title: '',
                subtitle: '',
                image: '',
                mobile_image: '',
                link: '',
                is_active: true,
                sort_order: banners.length // Auto-set to last position
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBanner(null);
        setFormData({ title: '', subtitle: '', image: '', mobile_image: '', link: '', is_active: true, sort_order: 0 });
    };

    const handleSaveBanner = async () => {
        if (!formData.title.trim()) return;

        try {
            setSaving(true);
            if (editingBanner) {
                const response = await api.updateBanner(editingBanner.id, formData);
                if (response.success) {
                    setBanners(banners.map(ban =>
                        ban.id === editingBanner.id ? { ...ban, ...formData } : ban
                    ));
                }
            } else {
                const response = await api.createBanner(formData);
                if (response.success) {
                    setBanners([...banners, response.data]);
                }
            }
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save banner:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteBanner = async () => {
        if (deleteBanner) {
            try {
                await api.deleteBanner(deleteBanner.id);
                setBanners(banners.filter(ban => ban.id !== deleteBanner.id));
                setDeleteBanner(null);
            } catch (error) {
                console.error('Failed to delete banner:', error);
            }
        }
    };

    const toggleActive = async (banner) => {
        try {
            const newValue = !banner.is_active;
            await api.updateBanner(banner.id, { is_active: newValue });
            setBanners(banners.map(ban =>
                ban.id === banner.id ? { ...ban, is_active: newValue } : ban
            ));
        } catch (error) {
            console.error('Failed to update banner:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
                    <p className="text-gray-500 mt-1">Manage your hero banners and promotional slides</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Banner
                </button>
            </div>

            {/* Banners List */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading banners...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {banners.map((banner, index) => (
                        <div
                            key={banner.id}
                            className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${banner.is_active ? 'border-gray-100 hover:shadow-lg' : 'border-gray-200 opacity-60'}`}
                        >
                            <div className="flex flex-col lg:flex-row">
                                <div className="lg:w-96 aspect-video lg:aspect-auto bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative flex items-center justify-center">
                                    {banner.image ? (
                                        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-6">
                                            <h3 className="text-xl font-bold text-gray-800">{banner.title}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{banner.subtitle}</p>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center font-bold text-gray-700 shadow">
                                        {index + 1}
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${banner.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {banner.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 p-6">
                                    <div className="flex flex-col h-full">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900">{banner.title}</h3>
                                            <p className="text-gray-500 mt-1">{banner.subtitle}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={banner.is_active}
                                                        onChange={() => toggleActive(banner)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-11 h-6 rounded-full transition-colors ${banner.is_active ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                                                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${banner.is_active ? 'translate-x-5' : ''}`}></div>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-600">Active</span>
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(banner)}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteBanner(banner)}
                                                    className="p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {banners.length === 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No banners yet</h3>
                            <p className="text-gray-500 mb-4">Add your first banner to showcase promotions.</p>
                            <button
                                onClick={() => handleOpenModal()}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-colors"
                            >
                                Add Banner
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingBanner ? 'Edit Banner' : 'Add Banner'}
                size="md"
                footer={
                    <div className="flex items-center justify-end gap-3">
                        <button onClick={handleCloseModal} className="px-4 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveBanner}
                            disabled={!formData.title.trim() || saving}
                            className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'Saving...' : editingBanner ? 'Save Changes' : 'Add Banner'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {/* Basic Info Section */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                        <h4 className="font-medium text-gray-900 text-sm">Basic Information</h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Banner Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Summer Sale"
                                className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                            <input
                                type="text"
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="e.g. Up to 50% off on selected items"
                                className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Images Section */}
                    <div className="bg-blue-50 rounded-xl p-4 space-y-4">
                        <h4 className="font-medium text-blue-900 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Banner Images
                        </h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Desktop Image URL *
                                <span className="text-xs text-gray-500 ml-2">Recommended: 1920x600px</span>
                            </label>
                            <input
                                type="text"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                placeholder="https://example.com/banner.jpg"
                                className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                            {formData.image && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                                    <img src={formData.image} alt="Preview" className="w-full h-32 object-cover" onError={(e) => e.target.style.display = 'none'} />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Image URL
                                <span className="text-xs text-gray-500 ml-2">Optional, recommended: 800x600px</span>
                            </label>
                            <input
                                type="text"
                                value={formData.mobile_image}
                                onChange={(e) => setFormData({ ...formData, mobile_image: e.target.value })}
                                placeholder="https://example.com/banner-mobile.jpg"
                                className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">If empty, desktop image will be used on mobile</p>
                        </div>
                    </div>

                    {/* Link & Settings Section */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                        <h4 className="font-medium text-gray-900 text-sm">Link & Settings</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Click URL</label>
                                <input
                                    type="text"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="/shop or https://..."
                                    className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">Where to navigate when clicked</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                                <input
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                    min="0"
                                    className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                            </div>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer pt-2">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500/20"
                            />
                            <div>
                                <p className="font-medium text-gray-900">Active</p>
                                <p className="text-sm text-gray-500">Show this banner on your storefront</p>
                            </div>
                        </label>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteBanner}
                onClose={() => setDeleteBanner(null)}
                onConfirm={handleDeleteBanner}
                title="Delete Banner"
                message={`Are you sure you want to delete "${deleteBanner?.title}"?`}
                confirmText="Delete"
                confirmVariant="danger"
            />
        </div>
    );
}

export default function BannersIndex() {
    return (
        <DashboardLayout title="Banners" pageTitle="Banners">
            <BannersPage />
        </DashboardLayout>
    );
}
