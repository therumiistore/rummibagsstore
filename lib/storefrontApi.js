/**
 * Storefront API Client
 * Public endpoints for customer-facing store (no auth required)
 * Includes data transformation to map API responses to frontend component format
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==================== Helper Functions ====================

// Parse JSON safely
// Parse JSON safely
function parseJsonSafe(value, defaultValue = []) {
    if (!value) return defaultValue;
    if (Array.isArray(value)) return value;
    if (typeof value === 'object') return value; // Fix: Return object if already parsed
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch {
            return defaultValue;
        }
    }
    return defaultValue;
}

// Calculate sale percentage
function calculateSalePercentage(product) {
    if (!product.original_price || !product.price) return 0;
    const originalPrice = parseFloat(product.original_price);
    const currentPrice = parseFloat(product.price);
    if (originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

// ==================== Data Transformers ====================

/**
 * Transform API product to frontend format
 * Maps: thumbnail → image, images → gallery, original_price → originalPrice, etc.
 */
export function transformApiProduct(apiProduct) {
    const images = parseJsonSafe(apiProduct.images, []);
    const thumbnail = apiProduct.thumbnail || images[0] || '/placeholder.jpg';
    const originalPrice = apiProduct.original_price ? parseFloat(apiProduct.original_price) : null;
    const price = parseFloat(apiProduct.price) || 0;

    // Parse attributes (can be string or object)
    const attributes = parseJsonSafe(apiProduct.attributes, {});

    // Log parsed attributes
    // console.log(`Parsed attributes for ${apiProduct.name}:`, attributes);

    return {
        id: apiProduct.id,
        name: apiProduct.name,
        slug: apiProduct.slug,
        description: apiProduct.description || apiProduct.short_description || '',
        short_description: apiProduct.short_description || '',
        price: price,
        originalPrice: originalPrice || price,
        image: thumbnail,
        hoverimage: images[1] || thumbnail,
        gallery: images.length > 0 ? images : [thumbnail],
        category: apiProduct.category_name || 'Uncategorized',
        category_slug: apiProduct.category_slug,
        subcategory: apiProduct.subcategory || null,
        brand: apiProduct.brand || 'Store Brand',
        isNew: apiProduct.is_featured || false,
        onSale: originalPrice && originalPrice > price,
        salepercentage: calculateSalePercentage(apiProduct),
        salepercentage: calculateSalePercentage(apiProduct),
        sizes: attributes.sizes || parseJsonSafe(apiProduct.sizes, []),
        colors: attributes.colors || parseJsonSafe(apiProduct.colors, []),
        customVariants: attributes.customVariants || null,
        rating: parseFloat(apiProduct.rating) || 4.5,
        reviews: parseInt(apiProduct.reviews) || 0,
        inStock: (apiProduct.stock || 0) > 0,
        bestseller: apiProduct.is_featured || false,
        stockLeft: apiProduct.stock || 0,
        additionalFeatures: apiProduct.additional_features || '',
        features: parseJsonSafe(apiProduct.features, []),
        status: apiProduct.status || 'active',
    };
}

/**
 * Transform API category to frontend format
 * Maps: name → categoryname, image → categorythumbnail
 */
export function transformApiCategory(apiCategory) {
    return {
        id: apiCategory.id,
        // Legacy property names (for backward compatibility)
        categoryname: apiCategory.name,
        categorythumbnail: apiCategory.image || '/placeholder.jpg',
        // Modern property names
        name: apiCategory.name,
        slug: apiCategory.slug,
        image: apiCategory.image || '/placeholder.jpg',
        showonhomepage: apiCategory.show_on_home !== false,
        product_count: parseInt(apiCategory.product_count) || 0,
        // Subcategories (from database)
        subcategories: apiCategory.subcategories || [],
    };
}

/**
 * Transform API banner to frontend format
 * Maps: mobile_image → mobileImage
 */
export function transformApiBanner(apiBanner) {
    return {
        id: apiBanner.id,
        image: apiBanner.image,
        mobileImage: apiBanner.mobile_image || apiBanner.image,
        title: apiBanner.title || '',
        subtitle: apiBanner.subtitle || '',
        link: apiBanner.link || null,
    };
}

// ==================== API Client Class ====================

class StorefrontApi {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async request(endpoint) {
        try {
            console.log(`Storefront API: Fetching ${this.baseUrl}${endpoint}`);
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error(`Storefront API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    async post(endpoint, body) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error(`Storefront API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    // Get store info
    async getStore(storeSlug) {
        return this.request(`/api/storefront/${storeSlug}`);
    }

    // Get products (raw API response)
    async getProductsRaw(storeSlug, params = {}) {
        // Filter out undefined/null values to prevent 'undefined' string in query
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        );
        const query = new URLSearchParams(cleanParams).toString();
        return this.request(`/api/storefront/${storeSlug}/products${query ? `?${query}` : ''}`);
    }

    // Get products (transformed for frontend)
    async getProducts(storeSlug, params = {}) {
        const response = await this.getProductsRaw(storeSlug, params);
        if (response.success && response.data?.products) {
            return {
                ...response,
                data: {
                    ...response.data,
                    products: response.data.products.map(transformApiProduct)
                }
            };
        }
        return response;
    }

    // Get single product by slug (raw)
    async getProductRaw(storeSlug, productSlug) {
        return this.request(`/api/storefront/${storeSlug}/products/${productSlug}`);
    }

    // Get single product by slug (transformed)
    async getProduct(storeSlug, productSlug) {
        const response = await this.getProductRaw(storeSlug, productSlug);
        if (response.success && response.data) {
            return {
                ...response,
                data: transformApiProduct(response.data)
            };
        }
        return response;
    }

    // Get categories (raw)
    async getCategoriesRaw(storeSlug, homeOnly = false) {
        const query = homeOnly ? '?home_only=true' : '';
        return this.request(`/api/storefront/${storeSlug}/categories${query}`);
    }

    // Get categories (transformed)
    async getCategories(storeSlug, homeOnly = false) {
        const response = await this.getCategoriesRaw(storeSlug, homeOnly);
        if (response.success && response.data) {
            return {
                ...response,
                data: response.data.map(transformApiCategory)
            };
        }
        return response;
    }

    // Get banners (raw)
    async getBannersRaw(storeSlug) {
        return this.request(`/api/storefront/${storeSlug}/banners`);
    }

    // Get banners (transformed)
    async getBanners(storeSlug) {
        const response = await this.getBannersRaw(storeSlug);
        if (response.success && response.data) {
            return {
                ...response,
                data: response.data.map(transformApiBanner)
            };
        }
        return response;
    }

    // Create order
    async createOrder(storeSlug, orderData) {
        return this.post(`/api/storefront/${storeSlug}/orders`, orderData);
    }

    // Track order by order number and phone
    async trackOrder(storeSlug, orderNumber, phone) {
        return this.get(`/api/storefront/${storeSlug}/orders/track?order_number=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`);
    }

    // Get reviews
    async getReviews(storeSlug) {
        return this.request(`/api/storefront/${storeSlug}/reviews`);
    }
}

// Singleton instance
const storefrontApi = new StorefrontApi();
export default storefrontApi;

/**
 * Resolve store slug from hostname
 * Supports subdomain format (slug.websitse.com) and custom domains
 * 
 * Examples:
 *   mystore.websitse.com → "mystore"
 *   localhost:3000?store=mystore → "mystore"
 *   mystore.com (custom domain) → "mystore.com" (backend resolves via custom_domain)
 */
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'websitse.com';

export function resolveStoreSlug(host, query = {}) {
    // Check query param first (for development)
    if (query.store) {
        return query.store;
    }

    if (!host) {
        return process.env.NEXT_PUBLIC_DEFAULT_STORE || null;
    }

    // Remove port if present
    const cleanHost = host.split(':')[0];

    // Check if it's a subdomain of our main domain (websitse.com)
    if (cleanHost.endsWith(`.${MAIN_DOMAIN}`)) {
        const subdomain = cleanHost.replace(`.${MAIN_DOMAIN}`, '');
        if (subdomain && subdomain !== 'www') {
            return subdomain;
        }
    }

    // Check for subdomain pattern (subdomain.domain.tld)
    const parts = cleanHost.split('.');
    if (parts.length >= 3 && parts[0] !== 'www') {
        return parts[0];
    }

    // For localhost development with subdomain (subdomain.localhost)
    if (parts.length === 2 && parts[1] === 'localhost') {
        return parts[0];
    }

    // If host doesn't match main domain pattern, it might be a custom domain
    // Return the full host - backend will resolve via custom_domain field
    if (!cleanHost.includes('localhost') && !cleanHost.includes(MAIN_DOMAIN)) {
        return cleanHost;
    }

    // Default fallback
    return process.env.NEXT_PUBLIC_DEFAULT_STORE || null;
}

