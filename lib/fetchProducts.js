/**
 * Fetch Products, Categories, and Banners
 * Uses storefront API with data transformation for dynamic stores
 * Falls back to static JSON files when no store is available
 */

import storefrontApi, {
  resolveStoreSlug,
  transformApiProduct,
  transformApiCategory,
  transformApiBanner
} from './storefrontApi.js';

// Get store slug for API calls
function getStoreSlug(context = {}) {
  // For server-side: use context passed from getServerSideProps/getStaticProps
  if (context.host || context.query) {
    return resolveStoreSlug(context.host, context.query || {});
  }

  // For client-side: resolve from window
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return resolveStoreSlug(window.location.host, { store: urlParams.get('store') });
  }

  // Fallback to env
  return process.env.NEXT_PUBLIC_DEFAULT_STORE || null;
}

// Check if we should use static data
function useStaticData() {
  const storeSlug = getStoreSlug();
  // Use static data only if no store slug is available
  return !storeSlug;
}

/**
 * Fetch products
 * @param {string} storeSlugOrSchema - Store slug for API, or schema slug for legacy
 * @param {object} options - Query options (page, limit, category, search, etc.)
 */
export async function fetchClientProducts(storeSlugOrSchema = '', options = {}) {
  const storeSlug = storeSlugOrSchema || getStoreSlug();

  // If no store slug, fall back to static data
  if (!storeSlug || useStaticData()) {
    console.log('Using static products data (no store slug)');
    try {
      const products = await import('../data/products.json');
      const productsData = products.default;

      return productsData.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        hoverimage: product.hoverimage,
        gallery: product.gallery || [product.image],
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand || 'Brand Name',
        isNew: product.isNew || false,
        onSale: product.onSale || false,
        salepercentage: product.salepercentage || 0,
        sizes: product.sizes || [],
        colors: product.colors || [],
        rating: product.rating || 4.0,
        reviews: product.reviews || 0,
        inStock: product.inStock !== false,
        bestseller: product.bestseller || false,
        stockLeft: product.stockLeft,
        additionalFeatures: product.additionalFeatures,
        features: product.features || [],
      }));
    } catch (error) {
      console.error('Error loading static products:', error);
      return [];
    }
  }

  // Use storefront API
  try {
    console.log(`Fetching products from API for store: ${storeSlug}`);
    const response = await storefrontApi.getProducts(storeSlug, {
      page: options.page || 1,
      limit: options.limit || 100,
      category: options.category,
      search: options.search,
      featured: options.featured,
      sort: options.sort || 'created_at',
      order: options.order || 'desc'
    });

    if (response.success && response.data?.products) {
      console.log(`Fetched ${response.data.products.length} products from API`);
      return response.data.products;
    }

    return [];
  } catch (error) {
    console.error('Error fetching products from API:', error);
    // Fallback to static data on error
    return fetchClientProducts('', options);
  }
}

/**
 * Fetch categories
 */
export async function fetchClientCategories(storeSlugOrSchema = '', options = {}) {
  const storeSlug = storeSlugOrSchema || getStoreSlug();

  // If no store slug, fall back to static data
  if (!storeSlug || useStaticData()) {
    console.log('Using static categories data (no store slug)');
    try {
      const categories = await import('../data/categories.json');
      const categoriesData = categories.default;

      return categoriesData.map(category => ({
        id: category.id,
        categoryname: category.categoryname,
        categorythumbnail: category.categorythumbnail,
        name: category.categoryname,
        slug: category.categoryname?.toLowerCase().replace(/\s+/g, '-'),
        image: category.categorythumbnail,
        showonhomepage: category.showonhomepage,
      }));
    } catch (error) {
      console.error('Error loading static categories:', error);
      return [];
    }
  }

  // Use storefront API
  try {
    console.log(`Fetching categories from API for store: ${storeSlug}`);
    const response = await storefrontApi.getCategories(storeSlug, options.homeOnly || false);

    if (response.success && response.data) {
      console.log(`Fetched ${response.data.length} categories from API`);
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('Error fetching categories from API:', error);
    return fetchClientCategories('', options);
  }
}

/**
 * Fetch banners
 */
export async function fetchClientBanners(storeSlugOrSchema = '') {
  const storeSlug = storeSlugOrSchema || getStoreSlug();

  // If no store slug, fall back to static data
  if (!storeSlug || useStaticData()) {
    console.log('Using static banners data (no store slug)');
    try {
      const banners = await import('../data/banners.json');
      const bannersData = banners.default;

      return bannersData.map(banner => ({
        id: banner.id,
        image: banner.image,
        mobileImage: banner.mobileImage,
        title: banner.title,
        subtitle: banner.subtitle,
      }));
    } catch (error) {
      console.error('Error loading static banners:', error);
      return [];
    }
  }

  // Use storefront API
  try {
    console.log(`Fetching banners from API for store: ${storeSlug}`);
    const response = await storefrontApi.getBanners(storeSlug);

    if (response.success && response.data) {
      console.log(`Fetched ${response.data.length} banners from API`);
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('Error fetching banners from API:', error);
    return fetchClientBanners('');
  }
}

/**
 * Fetch single product by slug
 */
export async function fetchClientProduct(storeSlug, productSlug) {
  if (!storeSlug || !productSlug) {
    console.warn('Store slug and product slug are required');
    return null;
  }

  try {
    console.log(`Fetching product ${productSlug} from API for store: ${storeSlug}`);
    const response = await storefrontApi.getProduct(storeSlug, productSlug);

    if (response.success && response.data) {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error('Error fetching product from API:', error);
    return null;
  }
}

/**
 * Fetch store info
 */
export async function fetchClientStore(storeSlug) {
  if (!storeSlug) {
    console.warn('Store slug is required');
    return null;
  }

  try {
    console.log(`Fetching store info for: ${storeSlug}`);
    const response = await storefrontApi.getStore(storeSlug);

    if (response.success && response.data) {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error('Error fetching store from API:', error);
    return null;
  }
}

// Re-export utilities
export { resolveStoreSlug, transformApiProduct, transformApiCategory, transformApiBanner };
