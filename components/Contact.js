import { useState } from 'react';

const Contact = ({ store }) => {
  // Parse appearance data
  let appearance = store?.appearance || {};
  if (typeof appearance === 'string') {
    try { appearance = JSON.parse(appearance); } catch (e) { appearance = {}; }
  }

  const contactUs = appearance.contactUs || {};
  const storeName = store?.name || 'Our Store';

  // Customizable content from appearance.contactUs
  const heading = contactUs.heading || 'Get In Touch';
  const description = contactUs.description || 'Have questions about our products? Need help with an order? We\'re here to help!';
  const bannerText = contactUs.bannerText || 'We\'d love to hear from you! Whether you need help with an order, have questions about our products, or just want to say hello, our team is here to assist you.';
  const businessHours = contactUs.businessHours || 'Mon-Sat: 9:00 AM - 6:00 PM';
  const subjects = contactUs.subjects || ['Product Inquiry', 'Order Status', 'Returns & Refunds', 'Bulk Order', 'General Inquiry'];
  const showForm = contactUs.showForm !== false;
  const showBanner = contactUs.showBanner !== false;

  // Store data from Settings
  const phone = store?.phone || '';
  const email = store?.email || '';
  const whatsapp = store?.whatsapp || '';
  const address = store?.address || '';

  // Parse social links
  let socialLinks = store?.social_links || {};
  if (typeof socialLinks === 'string') {
    try { socialLinks = JSON.parse(socialLinks); } catch (e) { socialLinks = {}; }
  }

  // Color scheme
  const colors = appearance.colorScheme?.colors || {};
  const primaryColor = colors.primary || '#1f2937';
  const secondaryColor = colors.secondary || '#374151';
  const accentColor = colors.accent || '#6366f1';
  const buttonTextColor = colors.buttonText || '#ffffff';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/storefront/${store?.slug}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        setSubmitError(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setSubmitError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: secondaryColor }}
          >
            {heading}
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: primaryColor }}>
            Contact <span style={{ color: accentColor }}>{storeName}</span>
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className={`grid grid-cols-1 ${showForm ? 'lg:grid-cols-3' : 'lg:grid-cols-1 max-w-2xl mx-auto'} gap-12`}>

          {/* Contact Information Cards */}
          <div className={`space-y-6 ${!showForm ? 'grid grid-cols-1 sm:grid-cols-3 gap-6 space-y-0' : ''}`}>
            {/* Phone */}
            {phone && (
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
                >
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">Call Us</h4>
                <div className="text-center space-y-2">
                  <a href={`tel:${phone}`} className="text-2xl font-bold block" style={{ color: primaryColor }}>{phone}</a>
                  <p className="text-gray-600">Available for orders & inquiries</p>
                  <div className="text-sm text-gray-500">
                    <p>📞 {businessHours}</p>
                    {whatsapp && <p>💬 WhatsApp support available</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            {email && (
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">Email Us</h4>
                <div className="text-center space-y-2">
                  <a href={`mailto:${email}`} className="text-lg font-bold block" style={{ color: primaryColor }}>{email}</a>
                  <p className="text-gray-600">For orders, inquiries & support</p>
                  <div className="text-sm text-gray-500">
                    <p>📧 We reply within 24 hours</p>
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            {address && (
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">Our Location</h4>
                <div className="text-center space-y-2">
                  <p className="text-gray-700 font-medium">{storeName}<br />{address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          {showForm && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <h4 className="text-3xl font-bold mb-6" style={{ color: primaryColor }}>Send Us a Message</h4>

                {submitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    ✅ Thank you! Your message has been sent. We'll get back to you soon.
                  </div>
                )}

                {submitError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    ❌ {submitError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text" id="name" name="name"
                        value={formData.name} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                        style={{ '--tw-ring-color': accentColor }}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email" id="email" name="email"
                        value={formData.email} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel" id="phone" name="phone"
                      value={formData.phone} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                      placeholder="Your phone number"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                    <select
                      id="subject" name="subject"
                      value={formData.subject} onChange={handleChange} required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subject, index) => (
                        <option key={index} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                    <textarea
                      id="message" name="message"
                      value={formData.message} onChange={handleChange} required
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors resize-none"
                      placeholder="Tell us how we can help..."
                    ></textarea>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                        color: buttonTextColor
                      }}
                    >
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-transparent border-2 py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 hover:opacity-80"
                      style={{ borderColor: secondaryColor, color: secondaryColor }}
                      onClick={() => setFormData({ name: '', email: '', phone: '', subject: '', message: '' })}
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        {showBanner && (
          <div className="mt-16 rounded-2xl p-8 md:p-12 text-white text-center"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              💌 We'd Love to Hear From You!
            </h3>
            <p className="text-lg mb-6 opacity-90 max-w-3xl mx-auto">
              {bannerText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2"
                  style={{ backgroundColor: '#fff', color: primaryColor }}
                >
                  <span>💬 WhatsApp: {whatsapp}</span>
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="bg-transparent border-2 border-white text-white hover:bg-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                  style={{ '--hover-color': primaryColor }}
                >
                  <span>📧 Email Us</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Contact;