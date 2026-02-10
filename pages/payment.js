'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import storefrontApi from '@/lib/storefrontApi';
import { useCart } from '@/lib/CartContext';
import { useNotification } from '@/lib/NotificationContext';
import { useStore } from '@/lib/StoreContext';
import SITE_CONFIG, { getPageMeta, getApiConfig } from '@/config/siteConfig';

// Configuration Variables
const PAYMENT_CONFIG = {
  // API Configuration
  siteId: SITE_CONFIG?.siteId || 'default-site',
  apiBaseUrl: SITE_CONFIG?.payment?.apiBaseUrl || '/api/orders',
  apiTimeout: getApiConfig().timeout,

  // UI Text
  loadingText: 'Loading order details...',
  placingOrderText: 'Placing Order...',
  placeOrderButtonText: 'Place Order',
  securityText: 'Your order is secure and protected',

  // Payment Method
  codTitle: 'Cash on Delivery',
  codDescription: 'Pay when you receive your order',
  codHowItWorksTitle: 'How it works:',
  codSteps: [
    'Your items will be carefully packaged',
    'Pay the delivery person when your order arrives',
    'Inspect your products before payment',
    'Cash payment only at delivery'
  ],

  // Return Policy
  returnPolicyDays: 7,
  returnPolicyTitle: '7-Day Quality Guarantee',
  returnPolicyPoints: [
    'Quality guarantee & returns within 7 days for quality issues',
    'Items must be in original condition with packaging',
    'Free return pickup for quality issues',
    'Full refund or exchange as per your preference'
  ],

  // Satisfaction Guarantee
  satisfactionTitle: 'Quality Guarantee',
  satisfactionText: 'Not satisfied with quality? Return within 7 days for a full refund!',

  // Icons
  paymentIcon: '💳',
  codIcon: '💰',
  returnIcon: '🔄',
  deliveryIcon: '🚚',
  summaryIcon: '🧾',
  guaranteeIcon: '✓',
  securityIcon: '🔒',

  // Routes
  shopRoute: '/shop',
  checkoutRoute: '/checkout',
  successRoute: '/order-success',
  failureRoute: '/order-failed'
};

export default function PaymentPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const { showErrorNotification, showSuccessNotification } = useNotification();

  const [orderData, setOrderData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const { currencySymbol, storeSlug } = useStore();

  useEffect(() => {
    // Load order data from localStorage
    try {
      const savedOrder = localStorage.getItem('pendingOrder');
      if (savedOrder) {
        setOrderData(JSON.parse(savedOrder));
      } else {
        // Redirect to checkout if no order data
        router.push(PAYMENT_CONFIG.checkoutRoute);
      }
    } catch (error) {
      console.error('Error loading order data:', error);
      router.push(PAYMENT_CONFIG.checkoutRoute);
    }
  }, [router]);

  const formatPrice = (price) => {
    const symbol = currencySymbol || SITE_CONFIG.currencySymbol;
    return `${symbol} ${price.toLocaleString(SITE_CONFIG.locale)}`;
  };

  const generateOrderId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 5);
    return `MK-${timestamp}-${randomStr}`.toUpperCase();
  };

  const handlePlaceOrder = async () => {
    if (!orderData) {
      showErrorNotification('Order data not found. Please try again.');
      return;
    }

    if (!storeSlug) {
      showErrorNotification('Store not found. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      // Build formatted address string
      const fullAddress = [
        orderData.customer.address,
        orderData.customer.area,
        orderData.customer.city,
        orderData.customer.zipCode,
        orderData.customer.country
      ].filter(Boolean).join(', ');

      // Format items for backend
      const formattedItems = orderData.items.map(item => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        qty: item.quantity,
        image: item.image || '',
        selectedConfiguration: item.selectedConfiguration || null
      }));

      // Create order payload for storefront API
      const orderPayload = {
        customer_name: `${orderData.customer.firstName} ${orderData.customer.lastName}`.trim(),
        customer_email: orderData.customer.email,
        customer_phone: orderData.customer.phone,
        shipping_address: fullAddress,
        items: formattedItems,
        notes: orderData.customer.notes || ''
      };

      // Submit order to backend via storefront API
      const response = await storefrontApi.createOrder(storeSlug, orderPayload);

      if (!response.success) {
        throw new Error(response.error || 'Failed to place order');
      }

      console.log('Order submitted successfully:', response.data);

      // Use order number from backend response
      const orderId = response.data.order_number;

      // Prepare final order data for local storage
      const finalOrder = {
        ...orderData,
        orderId,
        backendOrderNumber: response.data.order_number,
        status: 'confirmed',
        paymentMethod,
        paymentStatus: 'pending',
        processedAt: new Date().toISOString(),
        backendResponse: response.data,
        totals: {
          subtotal: orderData.summary.subtotal,
          shipping: orderData.summary.shippingFee || 0,
          total: response.data.total
        }
      };

      // Save order to localStorage for order tracking
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(finalOrder);
      localStorage.setItem('orders', JSON.stringify(existingOrders));

      // Clear pending order
      localStorage.removeItem('pendingOrder');

      // Clear cart
      clearCart();

      // Show success notification
      showSuccessNotification('Order placed successfully!');

      // Redirect to success page
      router.push(`${PAYMENT_CONFIG.successRoute}?orderId=${orderId}`);

    } catch (error) {
      console.error('Order submission failed:', error);

      let errorMessage = 'Failed to place order. Please try again.';

      if (error.message) {
        errorMessage = error.message;
      }

      showErrorNotification(`Order submission failed: ${errorMessage}`);

      // Save failed order attempt for debugging
      const failedOrder = {
        ...orderData,
        error: { message: errorMessage },
        failedAt: new Date().toISOString(),
        paymentMethod
      };

      localStorage.setItem('lastFailedOrder', JSON.stringify(failedOrder));

      // Redirect to failure page
      router.push(`${PAYMENT_CONFIG.failureRoute}?reason=order_failed`);

    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while order data is being loaded
  if (!orderData) {
    return (
      <>
        <Head>
          <title>{getPageMeta('payment').title}</title>
          <meta name="description" content={getPageMeta('payment').description} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href={SITE_CONFIG.faviconPath} type="image/png" sizes={SITE_CONFIG.faviconSize} />
        </Head>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">{PAYMENT_CONFIG.loadingText}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{getPageMeta('payment').title}</title>
        <meta name="description" content={getPageMeta('payment').description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={SITE_CONFIG.faviconPath} type="image/png" sizes={SITE_CONFIG.faviconSize} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <Link href={PAYMENT_CONFIG.shopRoute} className="hover:text-brand-accent transition-colors">👜 Shop</Link>
              <span>→</span>
              <Link href={PAYMENT_CONFIG.checkoutRoute} className="hover:text-brand-accent transition-colors">Checkout</Link>
              <span>→</span>
              <span className="text-brand-primary font-medium">Payment</span>
            </nav>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {getPageMeta('payment').title}
              </h1>
              <p className="text-gray-600">{getPageMeta('payment').description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Method */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="text-2xl mr-2">{PAYMENT_CONFIG.paymentIcon}</span>
                  Payment Method
                </h3>

                <div className="space-y-4">
                  {/* Cash on Delivery */}
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-900">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 w-4 h-4 text-gray-900 border-white focus:ring-gray-700"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <span className="text-lg">{PAYMENT_CONFIG.codIcon}</span>
                          </div>
                          <div>
                            <p className="font-bold text-white">{PAYMENT_CONFIG.codTitle}</p>
                            <p className="text-sm text-white opacity-90">{PAYMENT_CONFIG.codDescription}</p>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-black bg-opacity-20 rounded-lg">
                          <p className="text-sm text-white font-semibold">
                            {PAYMENT_CONFIG.codHowItWorksTitle}
                          </p>
                          <ul className="text-sm text-white opacity-90 mt-1 space-y-1">
                            {PAYMENT_CONFIG.codSteps.map((step, index) => (
                              <li key={index}>• {step}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Future payment methods can be added here */}
                  <div className="border border-gray-300 rounded-lg p-4 opacity-50 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-lg">💳</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Credit/Debit Card</p>
                        <p className="text-sm text-gray-400">Coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Return Policy Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="text-2xl mr-2">{PAYMENT_CONFIG.returnIcon}</span>
                  Quality Guarantee & Return Policy
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-green-800 mb-2">{PAYMENT_CONFIG.returnPolicyTitle}</p>
                        <ul className="text-sm text-green-700 space-y-1">
                          {PAYMENT_CONFIG.returnPolicyPoints.map((point, index) => (
                            <li key={index}>• {point}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Questions about returns?
                      <a href={`tel:${SITE_CONFIG?.businessContact || ''}`} className="text-brand-accent hover:text-brand-primary font-medium ml-1">
                        Call us at {SITE_CONFIG?.businessContact || 'support'}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="text-2xl mr-2">{PAYMENT_CONFIG.deliveryIcon}</span>
                  Delivery Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-brand-primary">Customer</p>
                    <p className="text-sm text-gray-800">
                      {orderData.customer.firstName} {orderData.customer.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-primary">Email</p>
                    <p className="text-sm text-gray-800">{orderData.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-primary">Phone</p>
                    <p className="text-sm text-gray-800">{orderData.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Delivery Address</p>
                    <p className="text-sm text-gray-800">
                      {orderData.customer.address}<br />
                      {orderData.customer.city}, {orderData.customer.area} {orderData.customer.zipCode}<br />
                      {orderData.customer.country}
                    </p>
                  </div>
                  {orderData.customer.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order Notes</p>
                      <p className="text-sm text-gray-800">{orderData.customer.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 h-fit">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl mr-2">{PAYMENT_CONFIG.summaryIcon}</span>
                Order Summary
              </h3>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {orderData.items.map((item, index) => (
                  <div key={`${item.id}-${item.selectedSize}-${index}`} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-800 truncate">
                            {item.name}
                          </h4>

                          {/* Display configuration details if available */}
                          {item.selectedConfiguration && Object.keys(item.selectedConfiguration).length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {/* size */}
                              {item.selectedConfiguration.size && (
                                <span className="inline-block mr-2">Size: {item.selectedConfiguration.size}</span>
                              )}
                              {/* color */}
                              {item.selectedConfiguration.color && (
                                <span className="inline-block mr-2">Color: {item.selectedConfiguration.color}</span>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-gray-600 mt-1">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>

                      {/* Price - separate row on mobile */}
                      <div className="flex justify-between sm:justify-end items-center">
                        <span className="text-sm text-gray-600 sm:hidden">Total:</span>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({orderData.summary.itemCount} items)</span>
                  <span className="font-medium text-gray-800">{formatPrice(orderData.summary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">
                    {orderData.summary.shippingFee === 0 ? 'FREE' : formatPrice(orderData.summary.shippingFee)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-800">Total</span>
                    <span className="text-base font-semibold text-gray-900">{formatPrice(orderData.summary.total)}</span>
                  </div>
                </div>
              </div>

              {/* Satisfaction Guarantee */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">{PAYMENT_CONFIG.guaranteeIcon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">{PAYMENT_CONFIG.satisfactionTitle}</p>
                    <p className="text-sm text-green-700">{PAYMENT_CONFIG.satisfactionText}</p>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <div className="mt-6">
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 hover:bg-gray-800 transform hover:scale-105'
                    } text-white`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {PAYMENT_CONFIG.placingOrderText}
                    </div>
                  ) : (
                    PAYMENT_CONFIG.placeOrderButtonText
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <span className="text-lg">{PAYMENT_CONFIG.securityIcon}</span>
                  <span>{PAYMENT_CONFIG.securityText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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