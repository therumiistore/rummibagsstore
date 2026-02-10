/**
 * Dynamic Footer Component
 * Uses store context for branding and contact info
 */

import Link from 'next/link';
import { useStoreOptional } from '@/lib/StoreContext';

const Footer = ({ previewColorScheme = null, previewMode = false }) => {
  const currentYear = new Date().getFullYear();
  const storeContext = useStoreOptional();

  // Color Scheme Application
  const activeColorScheme = previewMode
    ? (previewColorScheme || storeContext?.store?.appearance?.colorScheme)
    : storeContext?.store?.appearance?.colorScheme;

  const primaryColor = activeColorScheme?.colors?.primary || '#4f46e5';
  const secondaryColor = activeColorScheme?.colors?.secondary || '#9333ea';
  const accentColor = activeColorScheme?.colors?.accent || '#4f46e5';
  const buttonTextColor = activeColorScheme?.colors?.buttonText || '#ffffff';

  // Dynamic store info
  const storeName = storeContext?.storeName || 'Store';
  const phone = storeContext?.phone || '';
  const email = storeContext?.email || '';
  const address = storeContext?.address || '';
  const whatsapp = storeContext?.whatsapp || '';
  const logo = storeContext?.logo;
  const socialLinks = storeContext?.socialLinks || {};

  // Appearance settings
  const appearance = storeContext?.store?.appearance?.footer || {};
  const logoType = appearance.logoType || (logo ? 'image' : 'text');
  const logoUrl = appearance.logoUrl || logo;
  const logoText = appearance.logoText || storeName;
  const logoHeight = appearance.logoHeight || 40;
  // Default values match the original design (gray-900 bg, white text)
  const textColor = appearance.textColor || '#FFFFFF';
  const backgroundColor = appearance.backgroundColor || '#111827';

  const quickLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <footer style={{ backgroundColor, color: textColor }} className="transition-colors duration-300">
      {/* Newsletter Section */}
      <div
        className="text-white"
        style={{
          backgroundColor: accentColor,
          color: '#ffffff'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#ffffff' }}>
              Stay Updated
            </h3>
            <p className="mb-6 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
              Subscribe to our newsletter for new arrivals and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                className="px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-sm bg-white"
                style={{
                  color: accentColor
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center mb-4">
              {(() => {
                const appearance = storeContext?.store?.appearance?.footer || {};

                // Desktop Settings
                const logoType = appearance.logoType || (logo ? 'image' : 'text');
                const logoUrl = appearance.logoUrl || logo;
                const logoText = appearance.logoText || storeName;
                const logoHeight = appearance.logoHeight || 40;
                const textSize = appearance.textSize || 20;
                const textColor = appearance.textColor || '#FFFFFF';
                // Mobile Settings
                const mobileLogoType = appearance.mobileLogoType || logoType;
                const mobileLogoHeight = appearance.mobileLogoHeight || 30;
                const mobileTextSize = appearance.mobileTextSize || 18;

                const renderLogo = (type, height, tSize, isMobile) => {
                  if (type === 'image' && logoUrl) {
                    return <img src={logoUrl} alt={storeName} style={{ height: `${height}px` }} className="w-auto object-contain" />;
                  }
                  if (type === 'text') {
                    return <span className="font-bold" style={{ color: textColor, fontSize: `${tSize}px` }}>{logoText}</span>;
                  }
                  if (type === 'both') {
                    return (
                      <div className="flex items-center gap-3">
                        {logoUrl && (
                          <img src={logoUrl} alt={storeName} style={{ height: `${height}px` }} className="w-auto object-contain" />
                        )}
                        <span className="font-bold" style={{ color: textColor, fontSize: `${tSize}px` }}>{logoText}</span>
                      </div>
                    );
                  }
                  return (
                    <div className={`rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}`}>
                      <span className="text-white font-bold text-xl">{storeName.charAt(0)}</span>
                    </div>
                  );
                };

                return (
                  <>
                    {/* Mobile View */}
                    <div className="md:hidden">
                      {renderLogo(mobileLogoType, mobileLogoHeight, mobileTextSize, true)}
                    </div>
                    {/* Desktop View */}
                    <div className="hidden md:block">
                      {renderLogo(logoType, logoHeight, textSize, false)}
                    </div>
                  </>
                );
              })()}
              {(!appearance.logoType || appearance.logoType === 'image') && !logoUrl && !logo && (
                <span className="ml-3 text-xl font-bold">{storeName}</span>
              )}
            </Link>
            <p className="opacity-70 leading-relaxed">
              {appearance.description || "Your one-stop shop for quality products at great prices."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="opacity-70 hover:opacity-100 transition-opacity">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <div className="space-y-3 opacity-70">
              {phone && (
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {phone}
                </p>
              )}
              {email && (
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {email}
                </p>
              )}
              {address && (
                <p className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {address}
                </p>
              )}
            </div>
          </div>

          {/* Follow Us - New Column */}
          <div>
            <h4 className="text-lg font-bold mb-4">Follow Us</h4>
            {(socialLinks.facebook || socialLinks.instagram || socialLinks.twitter || whatsapp) ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  {(() => {
                    const getSocialUrl = (platform, value) => {
                      if (!value) return '';
                      if (value.startsWith('http://') || value.startsWith('https://')) return value;

                      const domains = {
                        facebook: 'https://facebook.com/',
                        instagram: 'https://instagram.com/',
                        twitter: 'https://x.com/',
                        whatsapp: 'https://wa.me/'
                      };

                      return `${domains[platform]}${value}`;
                    };

                    return (
                      <>
                        {socialLinks.facebook && (
                          <a
                            href={getSocialUrl('facebook', socialLinks.facebook)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-70 hover:opacity-100 hover:text-blue-600 transition-all transform hover:scale-110"
                          >
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                          </a>
                        )}
                        {socialLinks.instagram && (
                          <a
                            href={getSocialUrl('instagram', socialLinks.instagram)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-70 hover:opacity-100 hover:text-pink-600 transition-all transform hover:scale-110"
                          >
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                          </a>
                        )}
                        {socialLinks.twitter && (
                          <a
                            href={getSocialUrl('twitter', socialLinks.twitter)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-70 hover:opacity-100 hover:text-gray-900 transition-all transform hover:scale-110"
                          >
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          </a>
                        )}
                        {(socialLinks.whatsapp || whatsapp) && (
                          <a
                            href={getSocialUrl('whatsapp', socialLinks.whatsapp || whatsapp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-70 hover:opacity-100 hover:text-green-500 transition-all transform hover:scale-110"
                          >
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                            </svg>
                          </a>
                        )}
                      </>
                    );
                  })()}
                </div>
                <p className="opacity-70 text-sm leading-relaxed">
                  Stay connected for latest updates, fresh arrivals, and exclusive traditional offers!
                </p>
              </div>
            ) : (
              <p className="opacity-70 italic">Connect with us on social media!</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="opacity-60 text-sm">
            &copy; {currentYear} {storeName}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm opacity-60">
            <Link href="/policies/privacy-policy" className="hover:opacity-100 transition-opacity">
              Privacy Policy
            </Link>
            <Link href="/policies/terms-of-service" className="hover:opacity-100 transition-opacity">
              Terms of Service
            </Link>
            <Link href="/policies/cookie-policy" className="hover:opacity-100 transition-opacity">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;