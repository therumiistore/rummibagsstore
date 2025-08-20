/**
 * Site Configuration
 * Centralized configuration for the entire application
 * Update values here to reflect changes across all pages
 */

const SITE_CONFIG = {
    // Environment Variables
    siteId: process.env.NEXT_PUBLIC_SITE_ID || '',
    nodeEnv: process.env.NODE_ENV || 'development',
    dataSource: process.env.NEXT_PUBLIC_DATA_SOURCE || 'local', // 'local' or 'api'
    storageKey: 'rumiistore-cart',

    // API Configuration
    api: {
        dashboardApiUrl: process.env.NEXT_DASHBOARD_API_URL || '',
        timeout: 30000
    },

    // Schema Slugs for API/Data fetching
    productsSchemaSlug: 'products_rumiistore',
    categoriesSchemaSlug: 'categories_rumiistore',
    bannersSchemaSlug: 'banners_rumiistore',

    // Business Information
    businessName: "Rumiistore",
    businessDescription: 'Premium Bags Collection - Stylish and trendy ladies bags, handbags, and accessories. Quality bags with elegant designs and affordable prices.',
    businessContact: '+66960840271',
    businessEmail: 'therumiistore@gmail.com',
    businessAddress: 'Lahore, Pakistan',

    // SEO Meta Data
    seoTitle: 'Premium Bags Collection - Ladies Bags & Handbags',
    seoDescription: 'Discover stylish bags at Rumiistore Pakistan. Premium ladies bags, handbags, and fashion accessories. Quality bags with elegant designs and affordable prices.',
    seoKeywords: 'bags, handbags, ladies bags, fashion accessories, pakistani bags, trendy bags, rumiistore, quality bags, affordable bags, stylish bags',

    // Assets
    faviconPath: '/assets/rumiistorelogo.jpg',
    faviconSize: '32x32',
    logoPath: '/assets/rumiistorelogo.jpg',

    // Social Media Links (add as needed)
    socialMedia: {
        facebook: '',
        instagram: '',
        twitter: '',
        whatsapp: '66960840271',
    },

    // Site Settings
    currency: 'PKR',
    currencySymbol: 'Rs.',
    locale: 'en-PK',



    // Page-specific configurations
    pages: {
        home: {
            title: 'Premium Bags Collection - Ladies Bags & Handbags',
            description: 'Discover stylish bags at Rumiistore Pakistan. Premium ladies bags, handbags, and fashion accessories.',
        },
        shop: {
            title: 'Shop All Bags',
            description: 'Browse our complete collection of trendy bags and accessories.',
        },
        about: {
            title: 'About Rumiistore',
            description: 'Learn more about Rumiistore and our commitment to quality bags and accessories.',
        },
        contact: {
            title: 'Contact Us',
            description: 'Get in touch with us for any queries or support.',
        },
        checkout: {
            title: 'Checkout',
            description: 'Complete your purchase securely.',
        },
        wishlist: {
            title: 'My Wishlist',
            description: 'Your saved favorite items.',
        },
        payment: {
            title: 'Payment',
            description: 'Complete your payment for premium bags & accessories',
        },
        orderSuccess: {
            title: 'Order Confirmation',
            description: 'Your order for premium bags & accessories has been confirmed',
        },
        orderFailed: {
            title: 'Order Failed',
            description: 'Order processing failed for your bags order',
        },
        category: {
            title: 'Category Products',
            description: 'Browse our collection of bags and accessories in this category',
        },
        product: {
            title: 'Product Details',
            description: 'View detailed information about this bag or accessory',
        }
    },

    // Payment & Orders
    payment: {
        supportPhone: '+66960840271',
        supportHours: '9 AM - 6 PM (Mon-Sat)',
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
        apiTimeout: 30000,
        codTitle: 'Cash on Delivery',
        codDescription: 'Pay when you receive your order',
        returnPolicyDays: 7,
        returnPolicyTitle: '7-Day Quality Guarantee'
    },

    // Shipping & Delivery
    shipping: {
        freeShippingThreshold: 5000,
        shippingFee: 250,
        deliveryDays: {
            karachi: '1-2 days',
            lahore: '2-3 days',
            islamabad: '2-3 days',
            other: '3-5 days'
        }
    },

    // Product Features
    productFeatures: {
        badges: {
            new: 'NEW',
            onSale: 'ON SALE',
            bestseller: 'BESTSELLER',
            outOfStock: 'OUT OF STOCK'
        },
        labels: {
            color: 'Variety',
            size: 'Size',
            quantity: 'Quantity',
            addToCart: 'Add to Cart',
            outOfStock: 'Out of Stock'
        }
    },

    // Development settings
    development: {
        fallbackMessage: 'Development mode - check your data files'
    },

    // Production settings
    production: {
        fallbackMessage: 'Service temporarily unavailable'
    }
};

// Helper function to get page-specific meta data
export const getPageMeta = (pageName, customTitle = '', customDescription = '') => {
    const page = SITE_CONFIG.pages[pageName] || {};

    return {
        title: customTitle || `${SITE_CONFIG.businessName} - ${page.title || SITE_CONFIG.seoTitle}`,
        description: customDescription || page.description || SITE_CONFIG.seoDescription,
        keywords: SITE_CONFIG.seoKeywords
    };
};

// Helper function to get business info
export const getBusinessInfo = () => ({
    businessName: SITE_CONFIG.businessName,
    description: SITE_CONFIG.businessDescription,
    contact: SITE_CONFIG.businessContact,
    email: SITE_CONFIG.businessEmail,
    address: SITE_CONFIG.businessAddress,
    whatsapp: SITE_CONFIG.socialMedia.whatsapp
});

// Helper function to get schema slugs
export const getSchemaConfig = () => ({
    productsSchemaSlug: SITE_CONFIG.productsSchemaSlug,
    categoriesSchemaSlug: SITE_CONFIG.categoriesSchemaSlug,
    bannersSchemaSlug: SITE_CONFIG.bannersSchemaSlug
});

// Helper function to check environment
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isProduction = () => process.env.NODE_ENV === 'production';

// Helper function to check data source (can be controlled independently of NODE_ENV)
export const useApiData = () => SITE_CONFIG.dataSource === 'api';

// Helper function to get environment-specific settings
export const getEnvironmentConfig = () => ({
    siteId: SITE_CONFIG.siteId,
    nodeEnv: process.env.NODE_ENV,
    storageKey: SITE_CONFIG.storageKey,
    isDevelopment: isDevelopment(),
    isProduction: isProduction()
});

// Helper function to get API configuration
export const getApiConfig = () => ({
    dashboardApiUrl: SITE_CONFIG.api.dashboardApiUrl,
    timeout: SITE_CONFIG.api.timeout
});

export default SITE_CONFIG;