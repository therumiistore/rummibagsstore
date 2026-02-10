import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { useWishlist } from '@/lib/WishlistContext';
import { useNotification } from '@/lib/NotificationContext';
import { useStoreOptional } from '@/lib/StoreContext';
import VariantSelectionPopup from './VariantSelectionPopup';
import ProductCard from './ProductCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel, Navigation } from 'swiper/modules';
import SITE_CONFIG from '@/config/siteConfig';

// Configuration Variables
const PRODUCTS_CONFIG = {
  // Layout & Display
  initialItemsPerCategory: 8,
  itemsToLoadMore: 8,
  newArrivalsLimit: 8,
  onSaleProductsLimit: 8,

  // Currency & Pricing
  currency: 'PKR',

  // Section Titles & Text
  shopCollectionText: 'Shop Collection',
  itemsAvailableText: 'items available in this collection',
  viewMoreText: 'View More',
  viewAllText: 'View All',

  // Special Sections
  specialOffersSection: {
    subtitle: 'Special Offers',
    title: 'On Sale',
    titleHighlight: 'Sale',
    description: "Don't miss out on these amazing deals on premium fashion garments",
    viewAllLink: '/category/on-sale',
    viewAllText: 'View All Sale Items'
  },

  newArrivalsSection: {
    subtitle: 'Latest Products',
    title: 'New Arrivals',
    titleHighlight: 'Arrivals',
    description: 'Discover our latest collection of fashion garments with premium fabrics and trendy designs',
    viewAllLink: '/category/new-arrivals',
    viewAllText: 'View All New Arrivals'
  },

  // Product Cards
  badges: {
    sale: 'SALE',
    new: 'NEW',
    bestseller: 'BESTSELLER'
  },

  buttons: {
    addToCart: 'ADD TO CART',
    addedToCart: 'Added to Cart',
    added: 'Added',
    viewProduct: 'VIEW PRODUCT',
    viewDetails: 'View Details'
  },

  // Empty State
  emptyState: {
    icon: '👕',
    title: 'No Products Available',
    message: 'Our premium fashion collection is being updated. Check back soon for amazing garments and accessories!'
  },

  // Messages & Text
  messages: {
    addedToWishlist: 'added to wishlist',
    removedFromWishlist: 'removed from wishlist'
  },

  moreItemsText: '+',

  // Responsive Breakpoints
  breakpoints: {
    mobile: 320,
    mobileLarge: 480,
    tablet: 768,
    desktop: 1024,
    desktopLarge: 1280
  },

  // Slider Settings
  slider: {
    spaceBetween: 24,
    spaceBetweenMobile: 16,
    spaceBetweenTablet: 20,
    autoplay: false,
    navigation: true
  },

  // Product Display
  maxColorsToShow: 3,
  maxSizesToShow: 3,
  moreItemsText: '+',

  // Category Slug Mappings
  categorySlugMappings: {
  }
};

const Products = ({ products = [], categories = [] }) => {
  const [addingToCart, setAddingToCart] = useState({});
  const [screenWidth, setScreenWidth] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [sizePopup, setSizePopup] = useState({ isOpen: false, product: null });
  const [selectedColors, setSelectedColors] = useState({}); // Track selected color for each product
  const [visibleItems, setVisibleItems] = useState({}); // Track how many items are visible per category

  const storeContext = useStoreOptional();
  const activeColorScheme = storeContext?.store?.appearance?.colorScheme;
  const primaryColor = activeColorScheme?.colors?.primary || '#b91c1c'; // Default red-700
  const buttonTextColor = activeColorScheme?.colors?.buttonText || '#ffffff';

  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showCartNotification } = useNotification();

  // Initialize visible items for categories
  useEffect(() => {
    const initialVisibleItems = {};
    categories.forEach(category => {
      initialVisibleItems[category.id] = PRODUCTS_CONFIG.initialItemsPerCategory;
    });
    setVisibleItems(initialVisibleItems);
  }, [categories]);

  // Check screen width for responsive behavior
  useEffect(() => {
    const checkScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      checkScreenWidth();
      window.addEventListener('resize', checkScreenWidth);
      return () => window.removeEventListener('resize', checkScreenWidth);
    }
  }, []);

  // Filter products for different sections
  const newArrivals = products.filter(product => product.isNew).slice(0, PRODUCTS_CONFIG.newArrivalsLimit);
  const onSaleProducts = products.filter(product => product.onSale).slice(0, PRODUCTS_CONFIG.onSaleProductsLimit);

  // Get products by category name
  const getProductsByCategory = (categoryName) => {
    return products.filter(product => product.category === categoryName);
  };

  // Handle View More for categories
  const handleViewMore = (categoryId) => {
    setVisibleItems(prev => ({
      ...prev,
      [categoryId]: prev[categoryId] + PRODUCTS_CONFIG.itemsToLoadMore
    }));
  };

  // Format price for Pakistani Rupees
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
      showCartNotification(product, null, 1, PRODUCTS_CONFIG.messages.removedFromWishlist);
    } else {
      addToWishlist(product);
      showCartNotification(product, null, 1, PRODUCTS_CONFIG.messages.addedToWishlist);
    }
  };

  // Using the imported ProductCard component

  // Category Card Component - Updated to use dynamic categories
  const CategoryCard = ({ category }) => {
    // Convert category name to URL slug
    const getCategorySlug = (categoryName) => {
      let slug = categoryName.toLowerCase().replace(/\s+/g, '-');
      return PRODUCTS_CONFIG.categorySlugMappings[slug] || slug;
    };

    const productsInCategory = getProductsByCategory(category.categoryname);
    const currentVisible = visibleItems[category.id] || 8; // Default to 8 if not set

    return (
      <div key={category.id} className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold text-brand-secondary uppercase tracking-wide mb-4">
            Shop Collection
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-brand-primary mb-4">
            {category.categoryname}
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-6 md:gap-6 mb-8">
          {productsInCategory.slice(0, currentVisible).map((product) => (
            <ProductCard key={product.id} product={product} showQuickView={true} />
          ))}
        </div>

        {currentVisible < productsInCategory.length && (
          <div className="text-center">
            <button
              onClick={() => handleViewMore(category.id)}
              className="inline-flex items-center px-8 py-3 bg-brand-primary hover:bg-brand-dark text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              View More {category.categoryname}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Get slides per view for sliders
  const getSlidesPerView = () => {
    if (screenWidth >= 1280) return 4;
    if (screenWidth >= 1024) return 3;
    if (screenWidth >= 768) return 2;
    if (screenWidth >= 480) return 1.5;
    return 1;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Individual Category Sections - Now at the top with grid layout */}
        {categories.filter(category => category.showonhomepage === true).map((category, index) => {
          const categoryProducts = getProductsByCategory(category.categoryname);
          if (categoryProducts.length === 0) return null;

          // Convert category name to URL slug
          const getCategorySlug = (categoryName) => {
            let slug = categoryName.toLowerCase().replace(/\s+/g, '-');
            return PRODUCTS_CONFIG.categorySlugMappings[slug] || slug;
          };

          const currentVisible = visibleItems[category.id] || 8;
          const productsToShow = categoryProducts.slice(0, currentVisible);

          return (
            <div key={category.id} className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-sm font-semibold uppercase tracking-wide mb-4 text-brand-secondary">
                  {PRODUCTS_CONFIG.shopCollectionText}
                </h2>
                <h3 className="text-4xl md:text-5xl font-bold mb-4 text-brand-primary">
                  {category.categoryname}
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {categoryProducts.length} {PRODUCTS_CONFIG.itemsAvailableText}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-6 md:gap-6 mb-8">
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

              {/* Show View More OR View All button based on products loaded */}
              <div className="text-center">
                {currentVisible < categoryProducts.length ? (
                  <button
                    onClick={() => handleViewMore(category.id)}
                    className="inline-flex items-center px-8 py-3 bg-brand-primary text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {PRODUCTS_CONFIG.viewMoreText} {category.categoryname}
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href={`/category/${getCategorySlug(category.categoryname)}`}
                    className="inline-flex items-center px-8 py-3 bg-brand-primary text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {PRODUCTS_CONFIG.viewAllText} {category.categoryname}
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* On Sale Section - Full width dark background */}
      <div className="mb-20 py-16 bg-brand-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-sm font-semibold uppercase tracking-wide mb-4"
              style={{ color: buttonTextColor }}
            >
              {PRODUCTS_CONFIG.specialOffersSection.subtitle}
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {PRODUCTS_CONFIG.specialOffersSection.title} <span className="text-brand-accent">{PRODUCTS_CONFIG.specialOffersSection.titleHighlight}</span>
            </h3>
            <p className="text-lg text-gray-100 max-w-2xl mx-auto">
              {PRODUCTS_CONFIG.specialOffersSection.description}
            </p>
          </div>

          <div className="relative">
            <Swiper
              modules={[FreeMode, Navigation]}
              spaceBetween={24}
              slidesPerView={getSlidesPerView()}
              freeMode={{
                enabled: true,
                sticky: false,
              }}
              navigation={{
                prevEl: '.onsale-prev',
                nextEl: '.onsale-next',
              }}
              breakpoints={{
                320: { slidesPerView: 1.5, spaceBetween: PRODUCTS_CONFIG.slider.spaceBetweenMobile },
                480: { slidesPerView: 2, spaceBetween: PRODUCTS_CONFIG.slider.spaceBetweenMobile },
                768: { slidesPerView: 2, spaceBetween: PRODUCTS_CONFIG.slider.spaceBetweenTablet },
                1024: { slidesPerView: 3, spaceBetween: PRODUCTS_CONFIG.slider.spaceBetween },
                1280: { slidesPerView: 4, spaceBetween: PRODUCTS_CONFIG.slider.spaceBetween },
              }}
              className="!pb-4"
            >
              {onSaleProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard
                    product={product}
                    showQuickView={true}
                    variant="sale-section"
                    onAddToCart={handleAddToCart}
                    onColorSelect={handleColorSelect}
                    selectedColors={selectedColors}
                    addingToCart={addingToCart}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation Buttons */}
            <button className="onsale-prev absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-10 h-10 bg-brand-light rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 z-10">
              <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="onsale-next absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-10 h-10 bg-brand-light rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 z-10">
              <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="text-center mt-8">
            <Link
              href={PRODUCTS_CONFIG.specialOffersSection.viewAllLink}
              className="inline-flex items-center px-8 py-3 bg-brand-accent text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              style={{ color: buttonTextColor }}
            >
              {PRODUCTS_CONFIG.specialOffersSection.viewAllText}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* New Arrivals Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-4 text-brand-secondary">
              {PRODUCTS_CONFIG.newArrivalsSection.subtitle}
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-4 text-brand-primary">
              New <span className="text-brand-accent">{PRODUCTS_CONFIG.newArrivalsSection.titleHighlight}</span>
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {PRODUCTS_CONFIG.newArrivalsSection.description}
            </p>
          </div>

          <div className="relative">
            <Swiper
              modules={[FreeMode, Navigation]}
              spaceBetween={24}
              slidesPerView={getSlidesPerView()}
              freeMode={{
                enabled: true,
                sticky: false,
              }}
              navigation={{
                prevEl: '.newarrivals-prev',
                nextEl: '.newarrivals-next',
              }}
              breakpoints={{
                320: { slidesPerView: 1.5, spaceBetween: PRODUCTS_CONFIG.slider.spaceBetweenMobile },
                480: { slidesPerView: 2, spaceBetween: PRODUCTS_CONFIG.slider.spaceBetweenMobile },
                768: { slidesPerView: 2, spaceBetween: PRODUCTS_CONFIG.slider.spaceBetweenTablet },
                1024: { slidesPerView: 3, spaceBetween: PRODUCTS_CONFIG.slider.spaceBetween },
                1280: { slidesPerView: 4, spaceBetween: PRODUCTS_CONFIG.slider.spaceBetween },
              }}
              className="!pb-4"
            >
              {newArrivals.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard
                    product={product}
                    showQuickView={true}
                    onAddToCart={handleAddToCart}
                    onColorSelect={handleColorSelect}
                    selectedColors={selectedColors}
                    addingToCart={addingToCart}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation Buttons */}
            <button className="newarrivals-prev absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-10 h-10 bg-brand-light rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 z-10">
              <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="newarrivals-next absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-10 h-10 bg-brand-light rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 z-10">
              <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="text-center mt-8">
            <Link
              href={PRODUCTS_CONFIG.newArrivalsSection.viewAllLink}
              className="inline-flex items-center px-8 py-3 bg-brand-primary text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {PRODUCTS_CONFIG.newArrivalsSection.viewAllText}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* No Products Message */}
        {products.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">{PRODUCTS_CONFIG.emptyState.icon}</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-brand-primary">{PRODUCTS_CONFIG.emptyState.title}</h3>
            <p className="text-gray-600 text-lg">
              {PRODUCTS_CONFIG.emptyState.message}
            </p>
          </div>
        )}
      </div>

      {/* Size Selection Popup */}
      <VariantSelectionPopup
        product={sizePopup.product}
        isOpen={sizePopup.isOpen}
        onClose={closeSizePopup}
      />
    </section>
  );
};

export default Products; 