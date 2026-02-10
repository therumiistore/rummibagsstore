/**
 * Store Context
 * Provides store data, products, categories, and banners to all storefront components
 * Centralizes data fetching to avoid duplicate API calls across pages
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import storefrontApi from './storefrontApi';

const StoreContext = createContext(null);

export function StoreProvider({ children, initialStore, storeSlug, initialProducts, initialCategories, initialBanners }) {
    const [store, setStore] = useState(initialStore || null);
    const [products, setProducts] = useState(initialProducts || []);
    const [categories, setCategories] = useState(initialCategories || []);
    const [banners, setBanners] = useState(initialBanners || []);
    const [loading, setLoading] = useState(!initialStore);
    const [dataLoaded, setDataLoaded] = useState(!!initialProducts?.length);
    const [error, setError] = useState(null);

    // Fetch all store data if not provided initially
    useEffect(() => {
        if (storeSlug && !dataLoaded) {
            fetchAllData();
        }
    }, [storeSlug, dataLoaded]);

    const fetchAllData = async () => {
        if (!storeSlug) return;

        try {
            setLoading(true);
            console.log('StoreContext: Fetching all store data for', storeSlug);

            const [storeRes, productsRes, categoriesRes, bannersRes] = await Promise.all([
                !store ? storefrontApi.getStore(storeSlug).catch(() => ({ success: false })) : Promise.resolve({ success: true, data: store }),
                storefrontApi.getProducts(storeSlug, { limit: 100 }).catch(() => ({ success: false, data: { products: [] } })),
                storefrontApi.getCategories(storeSlug).catch(() => ({ success: false, data: [] })),
                storefrontApi.getBanners(storeSlug).catch(() => ({ success: false, data: [] })),
            ]);

            if (storeRes.success && storeRes.data) {
                setStore(storeRes.data);
            }

            setProducts(productsRes.data?.products || []);
            setCategories(categoriesRes.data || []);
            setBanners(bannersRes.data || []);
            setDataLoaded(true);

            console.log(`StoreContext: Loaded ${productsRes.data?.products?.length || 0} products, ${categoriesRes.data?.length || 0} categories`);
        } catch (err) {
            console.error('StoreContext: Failed to fetch data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Refresh data (useful after dashboard updates)
    const refreshData = useCallback(async () => {
        setDataLoaded(false);
        await fetchAllData();
    }, [storeSlug]);

    // Get a single product by ID
    const getProductById = useCallback((id) => {
        return products.find(p => p.id.toString() === id.toString());
    }, [products]);

    // Get a single product by slug
    const getProductBySlug = useCallback((slug) => {
        return products.find(p => p.slug === slug);
    }, [products]);

    // Get products by category
    const getProductsByCategory = useCallback((categorySlug) => {
        if (categorySlug === 'new-arrivals') {
            return products.filter(p => p.isNew);
        }
        if (categorySlug === 'on-sale') {
            return products.filter(p => p.onSale);
        }
        return products.filter(p =>
            p.category_slug === categorySlug ||
            p.category?.toLowerCase().replace(/\s+/g, '-') === categorySlug
        );
    }, [products]);

    // Get related products
    const getRelatedProducts = useCallback((product, limit = 4) => {
        if (!product) return [];
        return products
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, limit);
    }, [products]);

    // Get category by slug
    const getCategoryBySlug = useCallback((slug) => {
        return categories.find(c => c.slug === slug);
    }, [categories]);

    const value = {
        // Core data
        store,
        storeSlug,
        products,
        categories,
        banners,

        // Status
        loading,
        dataLoaded,
        error,

        // Methods
        refreshData,
        getProductById,
        getProductBySlug,
        getProductsByCategory,
        getRelatedProducts,
        getCategoryBySlug,

        // Store helper getters
        storeName: store?.name || 'Store',
        logo: store?.logo,
        favicon: store?.favicon,
        currency: store?.currency || 'PKR',
        currencySymbol: store?.currency_symbol || 'Rs.',
        phone: store?.phone,
        email: store?.email,
        whatsapp: store?.whatsapp,
        address: store?.address,
        socialLinks: store?.social_links || {},
        shippingFee: store?.shipping_fee || 0,
        freeShippingThreshold: store?.free_shipping_threshold || 0,
        codEnabled: store?.cod_enabled ?? true,
        navbarLinks: store?.navbar_links || null,
        appearance: store?.appearance || {},
        colorScheme: store?.appearance?.colorScheme || null,
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
}

// Safe hook for components that might be outside provider
export function useStoreOptional() {
    return useContext(StoreContext);
}

export default StoreContext;
