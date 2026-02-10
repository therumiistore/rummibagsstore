'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import SITE_CONFIG, { getPageMeta } from '@/config/siteConfig';
import { useCart } from '@/lib/CartContext';
import { useWishlist } from '@/lib/WishlistContext';
import { useNotification } from '@/lib/NotificationContext';
import { useStore } from '@/lib/StoreContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VariantSelectionPopup from '@/components/VariantSelectionPopup';
import ProductCard from '@/components/ProductCard';

export default function CategoryPage({
  products = [],
  category,
  allCategories = [],
  categoryHierarchy = [],
  currentSubcategory
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showCartNotification } = useNotification();

  const [addingToCart, setAddingToCart] = useState({});
  const [sortBy, setSortBy] = useState('default');
  const [filteredProducts, setFilteredProducts] = useState(products || []);
  const [sizePopup, setSizePopup] = useState({ isOpen: false, product: null });
  const [selectedColors, setSelectedColors] = useState({});
  const [visibleProducts, setVisibleProducts] = useState(9); // Show 9 products initially
  // Get unique brands and price range from products first
  const brands = products.length > 0 ? [...new Set(products.map(product => product.brand))] : [];
  const minPrice = products.length > 0 ? Math.min(...products.map(product => product.price)) : 0;
  const maxPrice = products.length > 0 ? Math.max(...products.map(product => product.price)) : 50000;

  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update price range and initial filtered products when products change
  useEffect(() => {
    if (products.length > 0) {
      const newMinPrice = Math.min(...products.map(product => product.price));
      const newMaxPrice = Math.max(...products.map(product => product.price));
      setPriceRange([newMinPrice, newMaxPrice]);
    }
  }, [products]);

  // Reset filters when category changes
  useEffect(() => {
    resetFilters();
  }, [category]);

  // Handle loading state
  if (router.isFallback) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  // Handle category not found
  if (!category || products === undefined) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-accent hover:to-brand-primary text-white font-semibold rounded-lg transition-all duration-300"
            >
              Browse All Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Get current category's subcategories
  console.log("DEBUG - Category from URL:", category);
  console.log("DEBUG - Full categoryHierarchy:", JSON.stringify(categoryHierarchy, null, 2));
  const currentCategoryData = categoryHierarchy?.find(cat => cat.slug === category);
  console.log("DEBUG - Found currentCategoryData:", currentCategoryData);
  const subcategories = currentCategoryData?.subcategories || [];
  console.log("DEBUG - Subcategories to display:", subcategories);

  // Get current subcategory from URL
  const currentSubcategoryFromUrl = router.query.subcategory ?
    [...new Set(products
      .filter(product => product.subcategory)
      .map(product => product.subcategory)
    )].find(subcat =>
      subcat.toLowerCase().replace(/\s+/g, '-') === router.query.subcategory
    ) : null;

  console.log("Current Subcategory From Url", currentSubcategoryFromUrl);

  // Format price for Pakistani Rupees
  const formatPrice = (price) => {
    return `${SITE_CONFIG.currencySymbol} ${price.toLocaleString()}`;
  };

  // Handle color selection
  const handleColorSelect = (productId, colorIndex) => {
    setSelectedColors(prev => ({
      ...prev,
      [productId]: colorIndex
    }));
  };

  // Get current image for a product
  const getCurrentImage = (product) => {
    const productId = product.id;
    const selectedColorIndex = selectedColors[productId];

    // If a color is selected, show the corresponding gallery image
    if (selectedColorIndex !== undefined && product.gallery && product.gallery[selectedColorIndex]) {
      return product.gallery[selectedColorIndex];
    }

    // Default to main product image
    return product.image;
  };

  // Handle add to cart - always show size selection popup for configuration
  const handleAddToCart = async (product) => {
    // Always show the configuration popup to allow users to customize their product
    setSizePopup({ isOpen: true, product });
  };

  // Close size popup
  const closeSizePopup = () => {
    setSizePopup({ isOpen: false, product: null });
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showCartNotification(product, null, 1, 'removed from wishlist');
    } else {
      addToWishlist(product);
      showCartNotification(product, null, 1, 'added to wishlist');
    }
  };

  // Handle subcategory filter toggle
  const handleSubcategoryToggle = (subcategory) => {
    setSelectedSubcategories(prev =>
      prev.includes(subcategory)
        ? prev.filter(s => s !== subcategory)
        : [...prev, subcategory]
    );
  };

  // Handle URL-based subcategory filtering from query params
  useEffect(() => {
    if (router.isReady && router.query.subcategory) {
      const subcategorySlug = router.query.subcategory;

      // Find the exact subcategory name by matching the slug
      const allSubcategories = [...new Set(products
        .filter(product => product.subcategory)
        .map(product => product.subcategory)
      )];

      const subcategoryName = allSubcategories.find(subcat =>
        subcat.toLowerCase().replace(/\s+/g, '-') === subcategorySlug
      );

      if (subcategoryName && !selectedSubcategories.includes(subcategoryName)) {
        setSelectedSubcategories([subcategoryName]);
      }
    } else if (router.isReady && !router.query.subcategory) {
      // Clear subcategory selection if no subcategory in URL
      setSelectedSubcategories([]);
    }
  }, [router.isReady, router.query.subcategory, products]);

  // Handle filtering and sorting
  useEffect(() => {
    let filtered = [...products];

    // Apply price filter
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        selectedBrands.includes(product.brand)
      );
    }

    // Apply subcategory filter
    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedSubcategories.includes(product.subcategory)
      );
    }

    // Apply stock filter
    if (inStockOnly) {
      filtered = filtered.filter(product => product.inStock);
    }

    // Apply sale filter
    if (onSaleOnly) {
      filtered = filtered.filter(product => product.onSale);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filtered.sort((a, b) => b.isNew - a.isNew);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Default sorting: new items first, then by rating
        filtered.sort((a, b) => {
          if (a.isNew !== b.isNew) return b.isNew - a.isNew;
          return b.rating - a.rating;
        });
    }

    setFilteredProducts(filtered);
  }, [sortBy, products, priceRange, selectedBrands, selectedSubcategories, inStockOnly, onSaleOnly]);

  // Handle brand filter toggle
  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  // Load more products
  const handleLoadMore = () => {
    setVisibleProducts(prev => prev + 9);
  };

  // Reset filters
  const resetFilters = () => {
    const newMinPrice = products.length > 0 ? Math.min(...products.map(product => product.price)) : 0;
    const newMaxPrice = products.length > 0 ? Math.max(...products.map(product => product.price)) : 50000;
    setPriceRange([newMinPrice, newMaxPrice]);
    setSelectedBrands([]);
    setSelectedSubcategories([]);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSortBy('default');
  };

  // Get category display name
  const getCategoryDisplayName = (slug) => {

    console.log("Slug", slug);
    // Handle special categories
    if (slug === 'new-arrivals') return 'New Arrivals';
    if (slug === 'on-sale') return 'On Sale';

    // For regular categories, find the proper name from allCategories
    const foundCategory = allCategories.find(cat => cat.slug === slug);
    if (foundCategory) {
      return foundCategory.name;
    }

    // Fallback: convert slug to title case
    return slug.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const categoryDisplayName = getCategoryDisplayName(category);

  // Generate subcategory slug
  const generateSubcategorySlug = (subcategory) => {
    return subcategory.toLowerCase().replace(/\s+/g, '-');
  };

  // Using the imported ProductCard component

  console.log("Filtered Products Before Slice", filteredProducts);
  const productsToShow = filteredProducts.slice(0, visibleProducts);
  console.log("Products To Show", productsToShow);

  return (
    <>
      <Head>
        <title>{categoryDisplayName} - {SITE_CONFIG?.appName || 'Store'}</title>
        <meta name="description" content={getPageMeta('category').description} />
        <meta name="keywords" content={SITE_CONFIG?.seoKeywords || 'store, shop, category'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={SITE_CONFIG.faviconPath} type="image/png" sizes={SITE_CONFIG.faviconSize} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link href="/" className="hover:text-brand-accent">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-brand-accent">Shop</Link>
            <span>/</span>
            <span className="text-brand-primary font-semibold">{categoryDisplayName}</span>
            {(currentSubcategory || currentSubcategoryFromUrl) && (
              <>
                <span>/</span>
                <span className="text-brand-primary font-semibold">{currentSubcategory || currentSubcategoryFromUrl}</span>
              </>
            )}
          </nav>

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-primary mb-4">
              {currentSubcategory || currentSubcategoryFromUrl || categoryDisplayName}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} in this collection
            </p>
          </div>

          {/* Category Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Link
                href="/shop"
                className="px-4 py-2 rounded-lg border border-gray-300 hover:border-brand-accent hover:bg-brand-light transition-all duration-200 text-sm font-medium"
              >
                All Products
              </Link>
              {allCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${cat.slug === category
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'border-gray-300 hover:border-brand-accent hover:bg-brand-light'
                    }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="w-full lg:w-80 xl:w-96">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-300 hover:border-brand-accent transition-all duration-200"
                >
                  <span className="font-medium text-brand-primary">Filters</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Filter Panel */}
              <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-brand-primary">Filters</h3>
                    <button
                      onClick={resetFilters}
                      className="text-sm text-brand-accent hover:text-brand-primary font-medium"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Categories */}
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-brand-primary mb-4">Categories</h4>
                    <div className="space-y-2">
                      {categoryHierarchy?.map((cat) => (
                        <div key={cat.slug}>
                          {/* Main Category */}
                          <Link
                            href={`/category/${cat.slug}`}
                            className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors duration-200 ${cat.slug === category
                              ? 'bg-brand-light text-brand-primary font-medium'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                          >
                            <span>{cat.name}</span>
                            {(cat.subcategories?.length || 0) > 0 && (
                              <span className="text-xs text-gray-400">({cat.subcategories.length})</span>
                            )}
                          </Link>

                          {/* Subcategories - Show when main category is selected */}
                          {cat.slug === category && (cat.subcategories?.length || 0) > 0 && (
                            <div className="ml-4 mt-2 space-y-1">
                              {cat.subcategories?.map((subcat) => (
                                <Link
                                  key={subcat.slug}
                                  href={`/category/${cat.slug}?subcategory=${subcat.slug}`}
                                  className={`block px-3 py-1 rounded-md text-xs transition-colors duration-200 ${(currentSubcategory === subcat.name || currentSubcategoryFromUrl === subcat.name)
                                    ? 'bg-brand-light text-brand-primary font-medium'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                    }`}
                                >
                                  {subcat.name} ({subcat.count})
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )) || (
                          <div className="text-gray-500 text-sm py-4">Loading categories...</div>
                        )}
                    </div>
                  </div>



                  {/* Price Range */}
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-brand-primary mb-4">Price Range</h4>
                    <div className="space-y-3">
                      <div>
                        <input
                          type="range"
                          min={minPrice}
                          max={maxPrice}
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{formatPrice(minPrice)}</span>
                        <span>{formatPrice(priceRange[1])}</span>
                        <span>{formatPrice(maxPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Brands */}
                  {brands.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-sm font-semibold text-brand-primary mb-4">Brands</h4>
                      <div className="space-y-3">
                        {brands.map((brand) => (
                          <label key={brand} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand)}
                              onChange={() => handleBrandToggle(brand)}
                              className="w-4 h-4 text-brand-primary bg-gray-100 border-gray-300 rounded focus:ring-brand-accent focus:ring-2"
                            />
                            <span className="ml-3 text-sm text-gray-700">{brand}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-brand-primary mb-4">Availability</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={inStockOnly}
                          onChange={(e) => setInStockOnly(e.target.checked)}
                          className="w-4 h-4 text-brand-primary bg-gray-100 border-gray-300 rounded focus:ring-brand-accent focus:ring-2"
                        />
                        <span className="ml-3 text-sm text-gray-700">In Stock Only</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={onSaleOnly}
                          onChange={(e) => setOnSaleOnly(e.target.checked)}
                          className="w-4 h-4 text-brand-primary bg-gray-100 border-gray-300 rounded focus:ring-brand-accent focus:ring-2"
                        />
                        <span className="ml-3 text-sm text-gray-700">On Sale Only</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Sort Options */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <p className="text-gray-600">
                  Showing {Math.min(visibleProducts, filteredProducts.length)} of {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </p>

                <div className="flex items-center space-x-4">
                  <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                    Sort by:
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
                  >
                    <option value="default">Default</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="price-low">Price (Low to High)</option>
                    <option value="price-high">Price (High to Low)</option>
                    <option value="newest">Newest First</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {productsToShow.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-2 gap-y-6 md:gap-6 mb-12">
                    {productsToShow.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        showQuickView={true}
                        onAddToCart={handleAddToCart}
                        onColorSelect={handleColorSelect}
                        selectedColors={selectedColors}
                        addingToCart={addingToCart}
                      />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {visibleProducts < filteredProducts.length && (
                    <div className="text-center">
                      <button
                        onClick={handleLoadMore}
                        className="inline-flex items-center px-8 py-3 bg-brand-primary hover:bg-brand-dark text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Load More Products
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">⚕️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-brand-primary mb-4">No Products Found</h3>
                  <p className="text-gray-600 text-lg mb-8">
                    Try adjusting your filters or browse our other categories.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-accent hover:to-brand-primary text-white font-semibold rounded-lg transition-all duration-300"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Size Selection Popup */}
      <VariantSelectionPopup
        product={sizePopup.product}
        isOpen={sizePopup.isOpen}
        onClose={closeSizePopup}
      />
    </>
  );
}

export async function getServerSideProps({ params, req, query }) {
  // Import storefront utilities for SSR
  const { resolveStoreSlug } = await import('@/lib/storefrontApi');
  const storefrontApi = (await import('@/lib/storefrontApi')).default;

  const host = req.headers.host || '';
  const storeSlug = resolveStoreSlug(host, query);
  const { slug } = params;

  if (!storeSlug) {
    return {
      props: {
        products: [],
        category: slug,
        allCategories: [],
        categoryHierarchy: [],
        currentSubcategory: null,
        store: null,
        storeSlug: null,
        banners: [],
      },
    };
  }

  try {
    console.log(`Fetching all data for category page: ${slug}`);

    // Fetch all data for StoreContext
    const [storeRes, productsRes, categoriesRes, bannersRes] = await Promise.all([
      storefrontApi.getStore(storeSlug).catch(() => ({ success: false })),
      storefrontApi.getProducts(storeSlug, { limit: 100 }).catch(() => ({ success: false, data: { products: [] } })),
      storefrontApi.getCategories(storeSlug).catch(() => ({ success: false, data: [] })),
      storefrontApi.getBanners(storeSlug).catch(() => ({ success: false, data: [] })),
    ]);

    const allProducts = productsRes.data?.products || [];
    const allCategories = categoriesRes.data || [];

    // DEBUG: Log what we got from the API
    console.log("SERVER DEBUG - categoriesRes.data:", JSON.stringify(categoriesRes.data, null, 2));
    console.log("SERVER DEBUG - allCategories:", JSON.stringify(allCategories, null, 2));

    // Filter products for this category
    let products = [];
    let category = slug;
    let currentSubcategory = null;

    if (slug === 'new-arrivals') {
      products = allProducts.filter(product => product.isNew);
    } else if (slug === 'on-sale') {
      products = allProducts.filter(product => product.onSale);
    } else {
      // Dynamic category matching
      const dashboardCategory = allCategories.find(cat =>
        (cat.name || cat.categoryname || '').toLowerCase().replace(/\s+/g, '-') === slug
      );

      const categoryName = dashboardCategory?.name || dashboardCategory?.categoryname ||
        slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      products = allProducts.filter(product =>
        product.category?.toLowerCase() === categoryName.toLowerCase()
      );
    }

    // Build category navigation
    const productCategories = [...new Set(allProducts.map(product => product.category).filter(Boolean))];
    const dashboardCategoryNames = allCategories.map(cat => cat.name || cat.categoryname).filter(Boolean);
    const combinedCategories = [...new Set([...productCategories, ...dashboardCategoryNames])];

    const categoriesForNavigation = combinedCategories.map(cat => ({
      name: cat,
      slug: cat.toLowerCase().replace(/\s+/g, '-')
    }));

    // Build category hierarchy - get subcategories from category data (database)
    const categoryHierarchy = combinedCategories.map(cat => {
      // Get category data from database first to get proper slug
      const categoryData = allCategories.find(c =>
        (c.name || c.categoryname || '').toLowerCase() === cat.toLowerCase()
      );

      // Use database slug if available, otherwise generate from name
      const categorySlug = categoryData?.slug || cat.toLowerCase().replace(/\s+/g, '-');

      const categoryProducts = allProducts.filter(product =>
        product.category?.toLowerCase() === cat.toLowerCase()
      );

      // Parse subcategories from database (stored as JSONB array)
      let rawSubcategories = categoryData?.subcategories || [];
      if (typeof rawSubcategories === 'string') {
        try {
          rawSubcategories = JSON.parse(rawSubcategories);
        } catch (e) {
          rawSubcategories = [];
        }
      }

      const subcategories = rawSubcategories.map(subcat => ({
        name: subcat,
        slug: subcat.toLowerCase().replace(/\s+/g, '-'),
        count: categoryProducts.filter(product => product.subcategory === subcat).length
      }));

      return { name: cat, slug: categorySlug, subcategories };
    });

    return {
      props: {
        products,
        category,
        allCategories: categoriesForNavigation,
        categoryHierarchy,
        currentSubcategory,
        // For StoreContext
        store: storeRes.data || null,
        storeSlug,
        categories: allCategories,
        banners: bannersRes.data || [],
      },
    };
  } catch (error) {
    console.error('Error fetching category products:', error);
    return {
      props: {
        products: [],
        category: slug,
        allCategories: [],
        categoryHierarchy: [],
        currentSubcategory: null,
        store: null,
        storeSlug,
        categories: [],
        banners: [],
        error: 'Failed to load category data'
      },
    };
  }
} 