import { useCart } from '@/lib/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Configuration Variables
const CART_CONFIG = {
  // Currency & Pricing
  currency: 'PKR',
  freeShippingThreshold: 5000,
  shippingFee: 250,

  // UI Text
  title: 'Your Cart',
  emptyCartTitle: 'Your cart is empty',
  emptyCartMessage: 'Looks like you haven\'t added any fashion items yet.\nBrowse our collection to find the perfect styles for you.',
  browseButtonText: 'Browse Products',
  checkoutButtonText: 'Proceed to Checkout',
  continueShoppingText: 'Continue Shopping',
  clearCartText: '🗑️ Clear All Items',

  // Icons
  cartIcon: '🛒',
  emptyCartIcon: '👗',

  // Routes
  checkoutRoute: '/checkout'
};

const Cart = () => {
  const {
    items,
    isOpen,
    itemCount,
    totalPrice,
    originalTotalPrice,
    totalSavings,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart
  } = useCart();

  const [isAnimating, setIsAnimating] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Ensure component is mounted before accessing router
  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price) => {
    return `${CART_CONFIG.currency} ${price.toFixed(0)}`;
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(item.id, item.selectedConfiguration);
    } else {
      updateQuantity(item.id, newQuantity, item.selectedConfiguration);
    }
  };

  const handleCheckout = async () => {
    if (!mounted || !router.isReady) return;

    setIsCheckoutLoading(true);

    // Add a small delay to show the loading animation
    await new Promise(resolve => setTimeout(resolve, 800));

    // Close cart and navigate to checkout
    toggleCart();
    router.push(CART_CONFIG.checkoutRoute);

    // Reset loading state after navigation
    setTimeout(() => {
      setIsCheckoutLoading(false);
    }, 100);
  };

  const handleClearCart = () => {
    setIsAnimating(true);
    setTimeout(() => {
      clearCart();
      setIsAnimating(false);
    }, 300);
  };

  // Don't render cart during SSG
  if (!mounted) {
    return null;
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300"
        onClick={toggleCart}
      />

      {/* Cart Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">{CART_CONFIG.cartIcon}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {CART_CONFIG.title}
                </h2>
                <p className="text-sm text-gray-600">{itemCount} items</p>
              </div>
            </div>
            <button
              onClick={toggleCart}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-6xl">{CART_CONFIG.emptyCartIcon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {CART_CONFIG.emptyCartTitle}
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  {CART_CONFIG.emptyCartMessage}
                </p>
                <button
                  onClick={toggleCart}
                  className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
                >
                  {CART_CONFIG.browseButtonText}
                </button>
              </div>
            ) : (
              <div className={`p-4 space-y-4 ${isAnimating ? 'opacity-50' : ''}`}>
                {items.map((item, index) => (
                  <div key={`${item.id}-${item.selectedSize}-${index}`} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    {/* Product Image */}
                    <div className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-xs text-gray-600">
                          {item.category}
                        </p>
                        {item.selectedConfiguration?.size && (
                          <>
                            <span className="text-xs text-gray-600">•</span>
                            <span className="text-xs text-gray-900 font-medium">
                              {item.selectedConfiguration.size}
                            </span>
                          </>
                        )}
                        {item.selectedConfiguration?.color && (
                          <>
                            <span className="text-xs text-gray-600">•</span>
                            <span className="text-xs text-gray-900 font-medium">
                              {item.selectedConfiguration.color}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(item.price)}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 text-gray-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-900 hover:border-gray-900 transition-all duration-200 text-gray-600 hover:text-white"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id, item.selectedConfiguration)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Clear Cart Button */}
                {items.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="w-full text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 py-3 rounded-lg transition-all duration-200 border border-gray-200 hover:border-red-300"
                  >
                    {CART_CONFIG.clearCartText}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer with totals and checkout */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-white">
              {/* Totals */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-800">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">
                    {totalPrice >= CART_CONFIG.freeShippingThreshold ? 'FREE' : `${CART_CONFIG.currency} ${CART_CONFIG.shippingFee}`}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-800">Total</span>
                    <span className="text-base font-semibold text-gray-900">
                      {formatPrice(totalPrice >= CART_CONFIG.freeShippingThreshold ? totalPrice : totalPrice + CART_CONFIG.shippingFee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  disabled={isCheckoutLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${isCheckoutLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-brand-primary hover:bg-brand-dark'
                    } text-white`}
                >
                  {isCheckoutLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    CART_CONFIG.checkoutButtonText
                  )}
                </button>

              </div>

              {totalPrice < CART_CONFIG.freeShippingThreshold && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 text-xs text-center">
                    🚚 Add {CART_CONFIG.currency} {(CART_CONFIG.freeShippingThreshold - totalPrice).toFixed(0)} more for FREE shipping!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart; 