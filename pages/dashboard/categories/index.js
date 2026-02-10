/**
 * Categories Management Page
 * Manage product categories with API integration
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Modal, { ConfirmModal } from '@/components/dashboard/Modal';
import api from '@/lib/api';

function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteCategory, setDeleteCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        show_on_home: true,
        sort_order: 0,
        subcategories: [] // Array of subcategory names
    });
    const [saving, setSaving] = useState(false);
    const [newSubcategory, setNewSubcategory] = useState(''); // For adding new subcategory

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.getCategories();
            if (response.success) {
                // Ensure each category has subcategories array
                const categoriesWithSubcats = response.data.map(cat => ({
                    ...cat,
                    subcategories: cat.subcategories || []
                }));
                setCategories(categoriesWithSubcats);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                image: category.image || '',
                show_on_home: category.show_on_home,
                sort_order: category.sort_order || 0,
                subcategories: category.subcategories || []
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                image: '',
                show_on_home: true,
                sort_order: categories.length, // Auto-set to last position
                subcategories: []
            });
        }
        setNewSubcategory('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', image: '', show_on_home: true, sort_order: 0, subcategories: [] });
        setNewSubcategory('');
    };

    // Add subcategory to form
    const handleAddSubcategory = () => {
        if (newSubcategory.trim() && !formData.subcategories.includes(newSubcategory.trim())) {
            setFormData({
                ...formData,
                subcategories: [...formData.subcategories, newSubcategory.trim()]
            });
            setNewSubcategory('');
        }
    };

    // Remove subcategory from form
    const handleRemoveSubcategory = (subcatToRemove) => {
        setFormData({
            ...formData,
            subcategories: formData.subcategories.filter(sub => sub !== subcatToRemove)
        });
    };

    const handleSaveCategory = async () => {
        if (!formData.name.trim()) return;

        try {
            setSaving(true);
            if (editingCategory) {
                const response = await api.updateCategory(editingCategory.id, formData);
                if (response.success) {
                    setCategories(categories.map(cat =>
                        cat.id === editingCategory.id ? { ...cat, ...formData } : cat
                    ));
                }
            } else {
                const response = await api.createCategory(formData);
                if (response.success) {
                    setCategories([...categories, { ...response.data, subcategories: formData.subcategories }]);
                }
            }
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save category:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCategory = async () => {
        if (deleteCategory) {
            try {
                await api.deleteCategory(deleteCategory.id);
                setCategories(categories.filter(cat => cat.id !== deleteCategory.id));
                setDeleteCategory(null);
            } catch (error) {
                console.error('Failed to delete category:', error);
            }
        }
    };

    const toggleShowOnHome = async (category) => {
        try {
            const newValue = !category.show_on_home;
            await api.updateCategory(category.id, { show_on_home: newValue });
            setCategories(categories.map(cat =>
                cat.id === category.id ? { ...cat, show_on_home: newValue } : cat
            ));
        } catch (error) {
            console.error('Failed to update category:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-500 mt-1">Organize your products into categories</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Category
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                            <p className="text-sm text-gray-500">Total Categories</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{categories.filter(c => c.show_on_home).length}</p>
                            <p className="text-sm text-gray-500">Visible on Homepage</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{categories.reduce((sum, c) => sum + (parseInt(c.product_count) || 0), 0)}</p>
                            <p className="text-sm text-gray-500">Total Products</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading categories...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categories.map(category => (
                        <div
                            key={category.id}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300"
                        >
                            <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 relative flex items-center justify-center">
                                {category.image ? (
                                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}
                                <button
                                    onClick={() => toggleShowOnHome(category)}
                                    className={`absolute top-3 right-3 p-2 rounded-lg transition-colors ${category.show_on_home
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-white/90 text-gray-400'
                                        }`}
                                    title={category.show_on_home ? 'Visible on homepage' : 'Hidden from homepage'}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {category.show_on_home ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        )}
                                    </svg>
                                </button>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-sm text-gray-500">{category.product_count || 0} products</p>
                                    {category.subcategories && category.subcategories.length > 0 && (
                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                            {category.subcategories.length} subcategories
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <button
                                        onClick={() => handleOpenModal(category)}
                                        className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleteCategory(category)}
                                        className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add Category Card */}
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-white rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                            <svg className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <p className="mt-3 font-medium text-gray-500 group-hover:text-indigo-600 transition-colors">Add Category</p>
                    </button>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingCategory ? 'Edit Category' : 'Add Category'}
                size="sm"
                footer={
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={handleCloseModal}
                            className="px-4 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveCategory}
                            disabled={!formData.name.trim() || saving}
                            className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Add Category'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {/* Basic Info */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Handbags"
                            className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Category Image */}
                    <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                        <h4 className="font-medium text-blue-900 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Category Image
                        </h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Image URL
                                <span className="text-xs text-gray-500 ml-2">Recommended: Square 400x400px</span>
                            </label>
                            <input
                                type="text"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                placeholder="https://example.com/category.jpg"
                                className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                            {formData.image && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 w-24 h-24">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                            <input
                                type="number"
                                value={formData.sort_order}
                                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                min="0"
                                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer pt-2">
                        <input
                            type="checkbox"
                            checked={formData.show_on_home}
                            onChange={(e) => setFormData({ ...formData, show_on_home: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500/20"
                        />
                        <div>
                            <p className="font-medium text-gray-900">Show on Homepage</p>
                            <p className="text-sm text-gray-500">Display this category on the storefront homepage</p>
                        </div>
                    </label>

                    {/* Subcategories Section */}
                    <div className="bg-purple-50 rounded-xl p-4 space-y-3">
                        <h4 className="font-medium text-purple-900 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Subcategories
                        </h4>
                        <p className="text-xs text-purple-700">Add subcategories to organize products better</p>

                        {/* Add subcategory input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSubcategory}
                                onChange={(e) => setNewSubcategory(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubcategory())}
                                placeholder="e.g. Leather Bags"
                                className="flex-1 h-9 px-3 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                            <button
                                type="button"
                                onClick={handleAddSubcategory}
                                disabled={!newSubcategory.trim()}
                                className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Add
                            </button>
                        </div>

                        {/* Subcategories list */}
                        {formData.subcategories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.subcategories.map((subcat, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-purple-700 text-sm rounded-lg border border-purple-200"
                                    >
                                        {subcat}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSubcategory(subcat)}
                                            className="ml-1 text-purple-400 hover:text-red-500 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteCategory}
                onClose={() => setDeleteCategory(null)}
                onConfirm={handleDeleteCategory}
                title="Delete Category"
                message={`Are you sure you want to delete "${deleteCategory?.name}"? Products in this category will become uncategorized.`}
                confirmText="Delete"
                confirmVariant="danger"
            />
        </div>
    );
}

export default function CategoriesIndex() {
    return (
        <DashboardLayout title="Categories" pageTitle="Categories">
            <CategoriesPage />
        </DashboardLayout>
    );
}
