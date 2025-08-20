'use client';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { useNotification } from '@/lib/NotificationContext';
import SITE_CONFIG, { getPageMeta } from '@/config/siteConfig';

// Configuration Variables
const CHECKOUT_CONFIG = {
  // Currency & Pricing
  currency: SITE_CONFIG.currency || 'PKR',
  freeShippingThreshold: SITE_CONFIG.shipping.freeShippingThreshold,
  shippingFee: SITE_CONFIG.shipping.shippingFee,

  // Form Placeholders (Pakistani context)
  placeholders: {
    firstName: 'Ahmad',
    lastName: 'Khan',
    email: 'ahmad@example.com',
    phone: '0300-1234567',
    address: 'House 123, Street 4, Sector F-8/2',
    city: 'Islamabad',
    area: 'F-8 Markaz',
    zipCode: '44000',
    country: 'Pakistan',
    notes: 'Any special instructions for your order... (e.g., preferred delivery time, leave at door, etc.)'
  },

  // UI Text
  emptyCartTitle: 'Your cart is empty',
  emptyCartMessage: 'Add some fashion items to your cart before checking out.',
  browseButtonText: '👗 Browse Products',
  submitButtonText: 'Proceed to Payment',
  processingText: 'Processing...',

  // Icons
  emptyCartIcon: '👗',
  customerIcon: '👤',
  deliveryIcon: '🚚',
  notesIcon: '📝',
  summaryIcon: '🧾',
  paymentIcon: '💳',
  returnIcon: '🔄',

  // Routes
  shopRoute: '/shop',
  paymentRoute: '/payment',

  // Return Policy
  returnPolicyDays: SITE_CONFIG.payment.returnPolicyDays,
  returnPolicyText: 'Shop with confidence! Quality guarantee & returns within 7 days for quality issues.'
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, itemCount, updateQuantity, removeItem } = useCart();
  const { showErrorNotification } = useNotification();

  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    // Customer Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',

    // Delivery Address
    address: '',
    city: '',
    area: '',
    zipCode: '',
    country: '',

    // Additional Information
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const formatPrice = (price) => {
    return `${CHECKOUT_CONFIG.currency} ${price.toFixed(0)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(item.id, item.selectedConfiguration);
    } else {
      updateQuantity(item.id, newQuantity, item.selectedConfiguration);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.area.trim()) newErrors.area = 'Area is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^[\d\s\-\(\)\+]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showErrorNotification('Please fill in all required fields correctly');
      return;
    }

    if (items.length === 0) {
      showErrorNotification('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate shipping fee
      const shippingFee = totalPrice >= CHECKOUT_CONFIG.freeShippingThreshold ? 0 : CHECKOUT_CONFIG.shippingFee;
      const finalTotal = totalPrice + shippingFee;

      // Prepare order data
      const orderData = {
        customer: formData,
        items: items,
        summary: {
          subtotal: totalPrice,
          shippingFee: shippingFee,
          total: finalTotal,
          itemCount
        },
        paymentMethod: 'COD',
        orderDate: new Date().toISOString()
      };

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Store order data in localStorage for the payment page
      localStorage.setItem('pendingOrder', JSON.stringify(orderData));

      // Redirect to payment page
      router.push(CHECKOUT_CONFIG.paymentRoute);

    } catch (error) {
      console.error('Error processing checkout:', error);
      showErrorNotification('An error occurred during checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  // Redirect to shop if cart is empty
  if (items.length === 0) {
    return (
      <>
        <Head>
          <title>{getPageMeta('checkout').title}</title>
          <meta name="description" content={getPageMeta('checkout').description} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href={SITE_CONFIG.faviconPath} type="image/png" sizes={SITE_CONFIG.faviconSize} />
        </Head>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">{CHECKOUT_CONFIG.emptyCartIcon}</span>
            </div>
            <h1 className="text-3xl font-bold text-brand-primary mb-3">{CHECKOUT_CONFIG.emptyCartTitle}</h1>
            <p className="text-gray-600 mb-6">{CHECKOUT_CONFIG.emptyCartMessage}</p>
            <Link href={CHECKOUT_CONFIG.shopRoute} className="bg-gradient-to-r from-brand-primary to-brand-accent text-white px-8 py-3 rounded-lg font-semibold hover:from-brand-accent hover:to-brand-primary transition-all duration-300">
              {CHECKOUT_CONFIG.browseButtonText}
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{getPageMeta('checkout').title}</title>
        <meta name="description" content={getPageMeta('checkout').description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={SITE_CONFIG.faviconPath} type="image/png" sizes={SITE_CONFIG.faviconSize} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <Link href="/shop" className="hover:text-brand-accent transition-colors">👗 Shop</Link>
              <span>→</span>
              <span className="text-brand-primary font-medium">Checkout</span>
            </nav>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">{getPageMeta('checkout').title}</span>
              </h1>
              <p className="text-gray-600">{getPageMeta('checkout').description}</p>
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-xl font-bold text-brand-primary mb-4 flex items-center">
                    <span className="text-2xl mr-2">{CHECKOUT_CONFIG.customerIcon}</span>
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all duration-200 ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder={CHECKOUT_CONFIG.placeholders.firstName}
                      />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all duration-200 ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder={CHECKOUT_CONFIG.placeholders.lastName}
                      />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all duration-200 ${errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder={CHECKOUT_CONFIG.placeholders.email}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all duration-200 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder={CHECKOUT_CONFIG.placeholders.phone}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h3 className="text-xl font-bold text-brand-primary mb-4 flex items-center">
                    <span className="text-2xl mr-2">{CHECKOUT_CONFIG.deliveryIcon}</span>
                    Delivery Address
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all duration-200 ${errors.address ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder={CHECKOUT_CONFIG.placeholders.address}
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all duration-200 ${errors.city ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder={CHECKOUT_CONFIG.placeholders.city}
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                          Area *
                        </label>
                        <input
                          type="text"
                          id="area"
                          name="area"
                          value={formData.area}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all duration-200 ${errors.area ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder={CHECKOUT_CONFIG.placeholders.area}
                        />
                        {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all duration-200 ${errors.country ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder={CHECKOUT_CONFIG.placeholders.country}
                        />
                        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                      </div>
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all duration-200"
                          placeholder={CHECKOUT_CONFIG.placeholders.zipCode}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-xl font-bold text-brand-primary mb-4 flex items-center">
                    <span className="text-2xl mr-2">{CHECKOUT_CONFIG.notesIcon}</span>
                    Additional Information
                  </h3>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all duration-200"
                      placeholder={CHECKOUT_CONFIG.placeholders.notes}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-accent hover:to-brand-primary transform hover:scale-105'
                      } text-white`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {CHECKOUT_CONFIG.processingText}
                      </div>
                    ) : (
                      CHECKOUT_CONFIG.submitButtonText
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 h-fit">
              <h3 className="text-xl font-bold text-brand-primary mb-6 flex items-center">
                <span className="text-2xl mr-2">{CHECKOUT_CONFIG.summaryIcon}</span>
                Order Summary
              </h3>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item, index) => (
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
                          <p className="text-xs text-gray-600 mb-1">
                            {item.category} {item.selectedConfiguration.size && `• ${item.selectedConfiguration.size}`} {item.selectedConfiguration.color && `• ${item.selectedConfiguration.color}`}
                          </p>
                          <p className="text-sm font-semibold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>

                      {/* Quantity controls - moved to separate row on mobile */}
                      <div className="flex items-center justify-between sm:justify-end">
                        <span className="text-sm text-gray-600 sm:hidden">Quantity:</span>
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
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-brand-primary hover:border-brand-primary transition-all duration-200 text-gray-600 hover:text-white"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-medium text-gray-800">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">
                    {totalPrice >= CHECKOUT_CONFIG.freeShippingThreshold ? 'FREE' : formatPrice(CHECKOUT_CONFIG.shippingFee)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-800">Total</span>
                    <span className="text-base font-semibold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                      {formatPrice(totalPrice >= CHECKOUT_CONFIG.freeShippingThreshold ? totalPrice : totalPrice + CHECKOUT_CONFIG.shippingFee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-6 p-4 bg-gradient-to-r from-brand-primary to-brand-accent rounded-lg">
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-lg">{CHECKOUT_CONFIG.paymentIcon}</span>
                  </div>
                  <div>
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-sm opacity-90">Pay when you receive your order</p>
                  </div>
                </div>
              </div>

              {/* Return Policy Info */}
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-lg">{CHECKOUT_CONFIG.returnIcon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">{CHECKOUT_CONFIG.returnPolicyDays}-Day Quality Guarantee</p>
                    <p className="text-sm text-green-700">{CHECKOUT_CONFIG.returnPolicyText}</p>
                  </div>
                </div>
              </div>

              {/* Free Shipping Info */}
              {totalPrice < CHECKOUT_CONFIG.freeShippingThreshold && (
                <div className="mt-4 p-3 bg-brand-light border border-brand-secondary rounded-lg">
                  <p className="text-brand-primary text-sm text-center">
                    🚚 Add {formatPrice(CHECKOUT_CONFIG.freeShippingThreshold - totalPrice)} more for FREE shipping!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 