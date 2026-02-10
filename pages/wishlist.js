import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import SITE_CONFIG, { getPageMeta } from '@/config/siteConfig';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useWishlist } from '@/lib/WishlistContext';
import { useCart } from '@/lib/CartContext';
import { useNotification } from '@/lib/NotificationContext';
import VariantSelectionPopup from '@/components/VariantSelectionPopup';
import ProductCard from '@/components/ProductCard';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { showCartNotification } = useNotification();
  const [addingToCart, setAddingToCart] = useState({});
  const [sizePopup, setSizePopup] = useState({ isOpen: false, product: null });
  const [selectedColors, setSelectedColors] = useState({}); // Track selected color for each product

  // Format price
  const formatPrice = (price) => {
    return `${SITE_CONFIG.currencySymbol || 'Rs.'} ${price.toLocaleString()}`;
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

  // Handle remove from wishlist
  const handleRemoveFromWishlist = (productId) => {
    const product = wishlistItems.find(item => item.id === productId);
    removeFromWishlist(productId);
    if (product) {
      showCartNotification(product, null, 1, 'removed from wishlist');
    }
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

  return (
    <>
      <Head>
        <title>{getPageMeta('wishlist').title}</title>
        <meta name="description" content={getPageMeta('wishlist').description} />
        <meta name="keywords" content={getPageMeta('wishlist').keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={SITE_CONFIG.faviconPath} type="image/png" sizes={SITE_CONFIG.faviconSize} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-brand-primary mb-2">
                  My Wishlist
                </h1>
                <p className="text-gray-600">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>

              {wishlistItems.length > 0 && (
                <button
                  onClick={clearWishlist}
                  className="text-brand-accent hover:text-brand-primary font-medium transition-colors duration-200"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Wishlist Items */}
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-6 md:gap-6">
              {wishlistItems.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="wishlist"
                  showQuickView={true}
                  onAddToCart={handleAddToCart}
                  onColorSelect={handleColorSelect}
                  selectedColors={selectedColors}
                  addingToCart={addingToCart}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                />
              ))}
            </div>
          ) : (
            /* Empty Wishlist */
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-brand-primary mb-4">Your wishlist is empty</h3>
              <p className="text-gray-600 text-lg mb-8">
                Save items you love to your wishlist and come back to them later!
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-accent hover:to-brand-primary text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Continue Shopping
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </main>

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

export async function getServerSideProps({ req, query }) {
  const { resolveStoreSlug } = await import('@/lib/storefrontApi');
  const storefrontApi = (await import('@/lib/storefrontApi')).default;

  const host = req.headers.host || '';
  const storeSlug = resolveStoreSlug(host, query);

  if (!storeSlug) {
    return { props: { store: null, storeSlug: null } };
  }

  try {
    const storeRes = await storefrontApi.getStore(storeSlug).catch(() => ({ success: false }));
    return {
      props: {
        store: storeRes.data || null,
        storeSlug,
      },
    };
  } catch (error) {
    return { props: { store: null, storeSlug } };
  }
} 