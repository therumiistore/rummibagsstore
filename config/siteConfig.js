/**
 * Site Configuration
 * Core config for frontend + compatibility functions for legacy pages
 */

const SITE_CONFIG = {
    // API Configuration
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    defaultStore: process.env.NEXT_PUBLIC_DEFAULT_STORE || null,
    currencySymbol: 'Rs. ',

    // App settings
    appName: 'StoreBuilder',

    // Development settings
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',

    // Legacy support: placeholder values for pages still using old config
    faviconPath: '/favicon.ico',
    faviconSize: '32x32',

    // Product features (used by product detail page)
    productFeatures: {
        labels: {
            selectSize: 'Select Size',
            selectColor: 'Select Color',
            quantity: 'Quantity',
            addToCart: 'Add to Cart',
            buyNow: 'Buy Now'
        },
        badges: {
            new: 'New',
            sale: 'Sale',
            bestseller: 'Bestseller'
        }
    },

    // Development fallback messages
    development: {
        fallbackMessage: 'Development mode - using static data'
    },
    production: {
        fallbackMessage: 'Unable to load store data'
    }
};

// ==================== Core Exports ====================
export const getApiUrl = () => SITE_CONFIG.apiUrl;
export const getDefaultStore = () => SITE_CONFIG.defaultStore;
export const isDevelopment = () => SITE_CONFIG.isDevelopment;
export const isProduction = () => SITE_CONFIG.isProduction;

// ==================== Legacy Compatibility Exports ====================
// These functions maintain backward compatibility with existing pages

/**
 * Get schema config (legacy)
 * Returns empty slugs since we now use store-based API
 */
export const getSchemaConfig = () => ({
    productsSchemaSlug: '',
    categoriesSchemaSlug: '',
    bannersSchemaSlug: ''
});

/**
 * Get page meta (legacy)
 * Returns basic meta for pages until store-based meta is implemented
 */
export const getPageMeta = (page = '') => ({
    title: SITE_CONFIG.appName + (page ? ` - ${page.charAt(0).toUpperCase() + page.slice(1)}` : ''),
    description: 'Welcome to our online store',
    keywords: 'store, shop, products'
});

/**
 * Get business info (legacy)
 * Returns placeholder until store info is fetched
 */
export const getBusinessInfo = () => ({
    name: SITE_CONFIG.appName,
    description: 'Your online store',
    email: '',
    phone: ''
});

/**
 * Check if using API data (legacy)
 * Always returns false since the new fetchProducts.js handles this internally
 */
export const useApiData = () => {
    // The new fetchProducts.js will use API if store slug is available
    // This is kept for any imports that still reference it
    return false;
};

/**
 * Get API config (legacy)
 * Returns empty config since we use storefrontApi now
 */
export const getApiConfig = () => ({
    dashboardApiUrl: null,
    storefrontApiUrl: SITE_CONFIG.apiUrl
});

export default SITE_CONFIG;