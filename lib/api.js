/**
 * API Client for Dashboard
 * Handles all API calls with automatic token management
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.refreshPromise = null;
    }

    /**
     * Get stored tokens
     */
    getTokens() {
        if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
        return {
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken'),
        };
    }

    /**
     * Store tokens
     */
    setTokens(accessToken, refreshToken) {
        if (typeof window === 'undefined') return;
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    }

    /**
     * Clear tokens
     */
    clearTokens() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('dashboard_user');
        localStorage.removeItem('dashboard_store');
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken() {
        // If a refresh is already in progress, return the existing promise
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = (async () => {
            const { refreshToken } = this.getTokens();
            if (!refreshToken) return null;

            try {
                const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });

                if (!response.ok) {
                    this.clearTokens();
                    return null;
                }

                const data = await response.json();
                if (data.success) {
                    this.setTokens(data.data.accessToken, data.data.refreshToken);
                    return data.data.accessToken;
                }
                return null;
            } catch (error) {
                console.error('Token refresh failed:', error);
                return null;
            } finally {
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }

    /**
     * Make API request with automatic token handling
     */
    async request(endpoint, options = {}) {
        const { accessToken } = this.getTokens();

        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        // Add auth header if we have a token (skip for auth endpoints EXCEPT /me)
        const isAuthEndpoint = endpoint.startsWith('/api/auth/') && !endpoint.includes('/me');

        if (accessToken && !isAuthEndpoint) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        try {
            let response = await fetch(`${this.baseUrl}${endpoint}`, config);

            // If 401, try to refresh token (skip for auth endpoints EXCEPT /me)
            const isAuthEndpoint = endpoint.includes('/auth/') && !endpoint.includes('/me');

            if (response.status === 401 && !isAuthEndpoint) {
                console.log('🔄 401 detected, attempting refresh...');
                const newToken = await this.refreshAccessToken();
                console.log('🔄 Refresh result:', newToken ? 'Token received' : 'No token');

                if (newToken) {
                    config.headers['Authorization'] = `Bearer ${newToken}`;
                    console.log('🔄 Retrying request with new token:', endpoint);
                    response = await fetch(`${this.baseUrl}${endpoint}`, config);
                    console.log('🔄 Retry status:', response.status);
                } else {
                    console.log('❌ Refresh failed, redirecting to login');
                    // Redirect to login
                    if (typeof window !== 'undefined') {
                        window.location.href = '/dashboard/login';
                    }
                    throw new Error('Session expired');
                }
            }

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ Request failed:', data);
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    /**
     * Upload file(s)
     */
    async upload(endpoint, formData) {
        const { accessToken } = this.getTokens();

        const config = {
            method: 'POST',
            headers: {},
            body: formData,
        };

        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            return data;
        } catch (error) {
            console.error(`Upload Error [${endpoint}]:`, error);
            throw error;
        }
    }

    // ============ AUTH ============
    async login(email, password) {
        const data = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (data.success) {
            this.setTokens(data.data.accessToken, data.data.refreshToken);
            localStorage.setItem('dashboard_user', JSON.stringify(data.data.user));
            localStorage.setItem('dashboard_store', JSON.stringify(data.data.store));
        }
        return data;
    }

    async signup(storeName, email, password) {
        const data = await this.request('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ storeName, email, password, name: email.split('@')[0] }),
        });
        if (data.success) {
            this.setTokens(data.data.accessToken, data.data.refreshToken);
            localStorage.setItem('dashboard_user', JSON.stringify(data.data.user));
            localStorage.setItem('dashboard_store', JSON.stringify(data.data.store));
        }
        return data;
    }

    async logout() {
        try {
            await this.request('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            // Ignore errors
        }
        this.clearTokens();
    }

    async getMe() {
        return this.request('/api/auth/me');
    }

    // ============ PRODUCTS ============
    async getProducts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/products${query ? `?${query}` : ''}`);
    }

    async getProduct(id) {
        return this.request(`/api/products/${id}`);
    }

    async createProduct(productData) {
        return this.request('/api/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    }

    async updateProduct(id, productData) {
        return this.request(`/api/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    }

    async deleteProduct(id) {
        return this.request(`/api/products/${id}`, { method: 'DELETE' });
    }

    async uploadProductImages(productId, files) {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        return this.upload(`/api/products/${productId}/images`, formData);
    }

    /**
     * Upload product images (standalone - before product creation)
     * Returns array of image URLs
     */
    async uploadProductImagesStandalone(files) {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        return this.upload('/api/products/upload-images', formData);
    }


    // ============ CATEGORIES ============
    async getCategories() {
        return this.request('/api/categories');
    }

    async createCategory(categoryData) {
        return this.request('/api/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData),
        });
    }

    async updateCategory(id, categoryData) {
        return this.request(`/api/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData),
        });
    }

    async deleteCategory(id) {
        return this.request(`/api/categories/${id}`, { method: 'DELETE' });
    }

    // ============ BANNERS ============
    async getBanners() {
        return this.request('/api/banners');
    }

    async createBanner(bannerData) {
        return this.request('/api/banners', {
            method: 'POST',
            body: JSON.stringify(bannerData),
        });
    }

    async updateBanner(id, bannerData) {
        return this.request(`/api/banners/${id}`, {
            method: 'PUT',
            body: JSON.stringify(bannerData),
        });
    }

    async deleteBanner(id) {
        return this.request(`/api/banners/${id}`, { method: 'DELETE' });
    }

    async uploadBannerImage(bannerId, file, isMobile = false) {
        const formData = new FormData();
        formData.append('image', file);
        const endpoint = isMobile
            ? `/api/banners/${bannerId}/mobile-image`
            : `/api/banners/${bannerId}/image`;
        return this.upload(endpoint, formData);
    }

    // ============ ORDERS ============
    async getOrders(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/orders${query ? `?${query}` : ''}`);
    }

    async getOrderStats() {
        return this.request('/api/orders/stats');
    }

    async getOrder(id) {
        return this.request(`/api/orders/${id}`);
    }

    async updateOrderStatus(id, status) {
        return this.request(`/api/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    async deleteOrder(id) {
        return this.request(`/api/orders/${id}`, {
            method: 'DELETE',
        });
    }

    async cancelOrder(id) {
        return this.request(`/api/orders/${id}/cancel`, {
            method: 'PUT',
        });
    }

    async updateOrderNotes(id, internal_notes) {
        return this.request(`/api/orders/${id}/notes`, {
            method: 'PUT',
            body: JSON.stringify({ internal_notes }),
        });
    }

    // ============ SETTINGS ============
    async getSettings() {
        return this.request('/api/settings');
    }

    async updateSettings(settingsData) {
        return this.request('/api/settings', {
            method: 'PUT',
            body: JSON.stringify(settingsData),
        });
    }

    async uploadLogo(file) {
        const formData = new FormData();
        formData.append('logo', file);
        return this.upload('/api/settings/logo', formData);
    }

    async uploadFavicon(file) {
        const formData = new FormData();
        formData.append('favicon', file);
        return this.upload('/api/settings/favicon', formData);
    }

    async uploadAppearanceLogo(file) {
        const formData = new FormData();
        formData.append('logo', file);
        return this.upload('/api/settings/logo', formData);
    }

    // ============ SLUG & DOMAIN ============
    async checkSlugAvailability(nameOrSlug) {
        const param = nameOrSlug.includes(' ') ? 'name' : 'slug';
        return this.request(`/api/auth/check-slug?${param}=${encodeURIComponent(nameOrSlug)}`);
    }

    async updateSlug(slug) {
        return this.request('/api/settings/slug', {
            method: 'PUT',
            body: JSON.stringify({ slug }),
        });
    }

    async checkDomainAvailability(domain) {
        return this.request(`/api/settings/check-domain?domain=${encodeURIComponent(domain)}`);
    }

    async updateCustomDomain(custom_domain) {
        return this.request('/api/settings/domain', {
            method: 'PUT',
            body: JSON.stringify({ custom_domain }),
        });
    }

    // ============ NAVBAR LINKS ============
    async getNavbarLinks() {
        return this.request('/api/settings/navbar');
    }

    async updateNavbarLinks(navbarLinks) {
        return this.request('/api/settings/navbar', {
            method: 'PUT',
            body: JSON.stringify({ navbar_links: navbarLinks }),
        });
    }
    // ============ REVIEWS ============
    async getReviews() {
        return this.request('/api/reviews');
    }

    async createReview(reviewData) {
        return this.request('/api/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
    }

    async updateReview(id, reviewData) {
        return this.request(`/api/reviews/${id}`, {
            method: 'PUT',
            body: JSON.stringify(reviewData),
        });
    }

    async deleteReview(id) {
        return this.request(`/api/reviews/${id}`, { method: 'DELETE' });
    }

    // ============ CONTACT SUBMISSIONS ============
    async getContactSubmissions(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/contact-submissions${query ? `?${query}` : ''}`);
    }

    async getContactSubmission(id) {
        return this.request(`/api/contact-submissions/${id}`);
    }

    async markContactSubmissionRead(id, is_read = true) {
        return this.request(`/api/contact-submissions/${id}/read`, {
            method: 'PUT',
            body: JSON.stringify({ is_read }),
        });
    }

    async deleteContactSubmission(id) {
        return this.request(`/api/contact-submissions/${id}`, { method: 'DELETE' });
    }
}

// Export singleton instance
const api = new ApiClient();
export default api;
