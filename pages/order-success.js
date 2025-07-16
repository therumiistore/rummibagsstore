'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing router
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !router.isReady) return;
    
    const { orderId: queryOrderId } = router.query;
    setOrderId(queryOrderId);
  }, [mounted, router.isReady, router.query]);

  useEffect(() => {
    if (!orderId) return;
    
    // Load order data from localStorage
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const order = orders.find(o => o.orderId === orderId);
      
      if (order) {
        setOrderData(order);
      } else {
        // Redirect to shop if order not found
        setTimeout(() => {
          router.push('/shop');
        }, 3000);
      }
    } catch (error) {
      console.error('Error loading order data:', error);
      setTimeout(() => {
        router.push('/shop');
      }, 3000);
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedDelivery = () => {
    const orderDate = new Date(orderData.processedAt);
    const deliveryDate = new Date(orderDate.getTime() + (2 * 24 * 60 * 60 * 1000)); // 2 days from order
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading state while mounting or loading order data
  if (!mounted || loading) {
    return (
      <>
        <Head>
          <title>Order Confirmation - Comfort Sofa</title>
          <meta name="description" content="Order confirmation" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!orderData) {
    return (
      <>
        <Head>
          <title>Order Not Found - Comfort Sofa</title>
          <meta name="description" content="Order not found" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
            <p className="text-gray-600 mb-6">The order you're looking for could not be found.</p>
            <Link href="/shop" className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
              Continue Shopping
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Order Confirmation - Comfort Sofa</title>
        <meta name="description" content="Your order has been confirmed" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-lg text-gray-600 mb-4">
              Thank you for shopping with Comfort Sofa! Your beautiful order is being processed.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-800">
                <strong>Order ID:</strong> {orderData.orderId}
              </p>
              {orderData.backendOrderNumber && (
                <p className="text-sm text-gray-800 mt-1">
                  <strong>Store Order #:</strong> {orderData.backendOrderNumber}
                </p>
              )}
              <p className="text-sm text-gray-700 mt-1">
                Order placed on {formatDate(orderData.processedAt)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <div className="space-y-6">
              {/* Delivery Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Delivery Address</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {orderData.customer.firstName} {orderData.customer.lastName}<br />
                        {orderData.customer.address}<br />
                        {orderData.customer.city}, {orderData.customer.area} {orderData.customer.zipCode}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Estimated Delivery</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {getEstimatedDelivery()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Standard delivery within 2-3 business days
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Payment Method</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Cash on Delivery (COD)
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Pay {formatPrice(orderData.summary.total)} when you receive your order
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-600">{orderData.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-sm text-gray-600">{orderData.customer.phone}</p>
                  </div>
                  {orderData.customer.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Special Instructions</p>
                      <p className="text-sm text-gray-600">{orderData.customer.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* What's Next */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">What happens next?</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-white">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order Confirmed</p>
                      <p className="text-xs text-gray-700">Your order has been received and is being processed</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-black">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Packaging in Progress</p>
                      <p className="text-xs text-gray-700">Your beautiful items are being carefully packaged</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-white">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Out for Delivery</p>
                      <p className="text-xs text-gray-700">Your order is on its way to you</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {orderData.items.map((item, index) => (
                  <div key={`${item.id}-${item.selectedSize || item.selectedColor}-${index}`} className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                        {item.selectedSize && ` (${item.selectedSize})`}
                      </h4>
                      {item.selectedColor && (
                        <p className="text-xs text-gray-500">
                          Color: {item.selectedColor}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <p className="text-xs text-gray-500 line-through">
                          {formatPrice(item.originalPrice * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({orderData.summary.itemCount} items)</span>
                  <span className="font-medium text-gray-900">{formatPrice(orderData.summary.subtotal)}</span>
                </div>
                {orderData.summary.savings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Original Price</span>
                    <span className="text-gray-500 line-through">{formatPrice(orderData.summary.originalTotal)}</span>
                  </div>
                )}
                {orderData.summary.savings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">You Saved</span>
                    <span className="font-medium text-green-600">{formatPrice(orderData.summary.savings)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">
                    {orderData.summary.shippingFee === 0 ? 'FREE' : formatPrice(orderData.summary.shippingFee)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">Total (COD)</span>
                    <span className="text-base font-semibold text-gray-900">{formatPrice(orderData.summary.total)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Link href="/shop" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white block text-center py-3 rounded-lg font-medium transition-colors duration-200">
                  Shop More Items
                </Link>
                <button 
                  onClick={() => window.print()}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Print Order Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 