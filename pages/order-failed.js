'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';
import SITE_CONFIG, { getPageMeta } from '@/config/siteConfig';

// Configuration Variables
const ORDER_FAILED_CONFIG = {
  // Currency & Formatting
  locale: SITE_CONFIG.locale,
  currency: SITE_CONFIG.currency,

  // Contact Information
  supportEmail: SITE_CONFIG.businessEmail,
  supportPhone: SITE_CONFIG.businessContact,
  supportHours: SITE_CONFIG.payment.supportHours,

  // UI Text
  loadingText: 'Loading...',
  mainTitle: 'Order Processing Failed',
  mainSubtitle: 'We encountered an issue while processing your order. Don\'t worry, we\'re here to help!',
  tryAgainButtonText: 'Try Again',
  backToShopText: 'Back to Shop',

  // Error Messages
  errorMessages: {
    payment_failed: {
      title: 'Payment Issue',
      description: 'There was a problem processing your payment. Please try again with a different payment method or contact support.',
      suggestions: ['Try again with the same payment method', 'Contact your bank if using a card', 'Try a different payment method']
    },
    address_invalid: {
      title: 'Address Issue',
      description: 'We couldn\'t validate your delivery address. Please check your address details and try again.',
      suggestions: ['Double-check your address details', 'Ensure all required fields are filled', 'Try a different delivery address']
    },
    inventory_unavailable: {
      title: 'Item Unavailable',
      description: 'One or more bags in your cart are currently out of stock.',
      suggestions: ['Remove out-of-stock items and try again', 'Check for similar available products', 'Contact us for restock information']
    },
    system_error: {
      title: 'System Error',
      description: 'We\'re experiencing technical difficulties. Our team has been notified and is working to resolve this.',
      suggestions: ['Try again in a few minutes', 'Clear your browser cache and cookies', 'Contact our support team for assistance']
    },
    default: {
      title: 'Order Failed',
      description: 'Something went wrong while processing your order. Please try again or contact our support team.',
      suggestions: ['Try placing your order again', 'Check your internet connection', 'Contact our support team if the problem persists']
    }
  },

  // Help Section
  helpTitle: 'Need More Help?',
  helpDescription: 'Our customer support team is ready to assist you.',
  emailSupportText: 'Email Support',
  phoneSupportText: 'Phone Support',

  // Icons
  errorIcon: '⚠️',
  suggestionIcon: '💡',
  emailIcon: '📧',
  phoneIcon: '📞',

  // Routes
  shopRoute: '/shop',
  checkoutRoute: '/checkout',
  contactRoute: '/contact'
};

export default function OrderFailedPage() {
  const router = useRouter();
  const { showInfoNotification } = useNotification();

  const [reason, setReason] = useState(null);
  const [errorReason, setErrorReason] = useState('unknown');
  const [retryCount, setRetryCount] = useState(0);
  const [failedOrderData, setFailedOrderData] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing router
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !router.isReady) return;

    const { reason: queryReason } = router.query;
    setReason(queryReason);
  }, [mounted, router.isReady, router.query]);

  useEffect(() => {
    if (reason) {
      setErrorReason(reason);
    }

    // Load failed order data if available
    if (typeof window !== 'undefined') {
      const lastFailedOrder = localStorage.getItem('lastFailedOrder');
      if (lastFailedOrder) {
        try {
          setFailedOrderData(JSON.parse(lastFailedOrder));
        } catch (error) {
          console.error('Error parsing failed order data:', error);
        }
      }
    }
  }, [reason]);

  const formatPrice = (price) => {
    return `${SITE_CONFIG.currencySymbol} ${price.toLocaleString(ORDER_FAILED_CONFIG.locale)}`;
  };

  const getErrorDetails = (reason) => {
    return ORDER_FAILED_CONFIG.errorMessages[reason] || ORDER_FAILED_CONFIG.errorMessages.default;
  };

  const handleRetryOrder = () => {
    if (!mounted) return;

    setRetryCount(prev => prev + 1);
    if (showInfoNotification) {
      showInfoNotification('Redirecting to checkout...');
    }

    // Add a small delay to show the notification
    setTimeout(() => {
      if (router.isReady) {
        router.push(ORDER_FAILED_CONFIG.checkoutRoute);
      }
    }, 1000);
  };

  const handleContactSupport = () => {
    if (!mounted) return;

    if (showInfoNotification) {
      showInfoNotification('Redirecting to contact page...');
    }

    setTimeout(() => {
      if (router.isReady) {
        router.push(ORDER_FAILED_CONFIG.contactRoute);
      }
    }, 1000);
  };

  // Don't render anything until component is mounted
  if (!mounted) {
    return (
      <>
        <Head>
          <title>{getPageMeta('orderFailed').title}</title>
          <meta name="description" content={getPageMeta('orderFailed').description} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href={SITE_CONFIG.faviconPath} type="image/png" sizes={SITE_CONFIG.faviconSize} />
        </Head>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
            <p className="text-gray-600">{ORDER_FAILED_CONFIG.loadingText}</p>
          </div>
        </div>
      </>
    );
  }

  const errorDetails = getErrorDetails(errorReason);

  return (
    <>
      <Head>
        <title>{getPageMeta('orderFailed').title}</title>
        <meta name="description" content={getPageMeta('orderFailed').description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={SITE_CONFIG.faviconPath} type="image/png" sizes={SITE_CONFIG.faviconSize} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Error Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">{ORDER_FAILED_CONFIG.errorIcon}</span>
              </div>
              <h1 className="text-3xl font-bold text-brand-primary mb-2">{ORDER_FAILED_CONFIG.mainTitle}</h1>
              <p className="text-lg text-gray-600 mb-4">
                {ORDER_FAILED_CONFIG.mainSubtitle}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
                <h3 className="font-semibold text-red-800 mb-2">{errorDetails.title}</h3>
                <p className="text-sm text-red-700">{errorDetails.description}</p>
              </div>
              {retryCount > 0 && (
                <div className="bg-brand-light border border-brand-secondary rounded-lg p-3 inline-block mt-4">
                  <p className="text-sm text-gray-800">
                    Retry attempts: {retryCount}
                  </p>
                </div>
              )}
            </div>

            {/* Failed Order Details */}
            {failedOrderData && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Customer</p>
                      <p className="text-sm text-gray-600">
                        {failedOrderData.customer?.firstName} {failedOrderData.customer?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-sm text-gray-600">{failedOrderData.customer?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Total Amount</p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(failedOrderData.summary?.total || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Payment Method</p>
                      <p className="text-sm text-gray-600">{failedOrderData.paymentMethod || 'COD'}</p>
                    </div>
                  </div>

                  {failedOrderData.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                      <p className="text-sm font-medium text-red-800">Error Details:</p>
                      <p className="text-sm text-red-700 mt-1">
                        {failedOrderData.error.message || 'Unknown error occurred'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Details and Solutions */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-brand-primary mb-4 flex items-center">
                <span className="text-xl mr-2">{ORDER_FAILED_CONFIG.suggestionIcon}</span>
                What can you do?
              </h3>
              <div className="space-y-3">
                {errorDetails.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-brand-light rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-brand-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleRetryOrder}
                  className="w-full bg-brand-primary hover:bg-brand-dark text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {ORDER_FAILED_CONFIG.tryAgainButtonText}
                </button>

                <button
                  onClick={handleContactSupport}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contact Support
                </button>
              </div>

              <div className="text-center">
                <Link href={ORDER_FAILED_CONFIG.shopRoute} className="text-brand-accent hover:text-brand-primary font-medium">
                  ← {ORDER_FAILED_CONFIG.backToShopText}
                </Link>
              </div>
            </div>

            {/* Additional Help */}
            <div className="mt-8 bg-brand-light border border-brand-secondary rounded-lg p-6">
              <h3 className="text-lg font-semibold text-brand-primary mb-4">{ORDER_FAILED_CONFIG.helpTitle}</h3>
              <p className="text-sm text-brand-dark mb-4">{ORDER_FAILED_CONFIG.helpDescription}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">{ORDER_FAILED_CONFIG.emailIcon}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{ORDER_FAILED_CONFIG.emailSupportText}</p>
                    <p className="text-sm text-gray-700">{ORDER_FAILED_CONFIG.supportEmail}</p>
                    <p className="text-xs text-gray-600">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">{ORDER_FAILED_CONFIG.phoneIcon}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{ORDER_FAILED_CONFIG.phoneSupportText}</p>
                    <p className="text-sm text-gray-700">{ORDER_FAILED_CONFIG.supportPhone}</p>
                    <p className="text-xs text-gray-600">{ORDER_FAILED_CONFIG.supportHours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Visit our{' '}
                <Link href={ORDER_FAILED_CONFIG.contactRoute} className="text-brand-accent hover:text-brand-primary font-medium">
                  Contact Page
                </Link>
                {' '}for more support options or check our delivery areas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 