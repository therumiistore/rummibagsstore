/**
 * Dynamic Navbar Component
 * Uses store context for branding, contact info, and custom navigation links
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { useWishlist } from '@/lib/WishlistContext';
import { useStoreOptional } from '@/lib/StoreContext';
import { useRouter } from 'next/router';

const Navbar = ({
  previewMode = false,
  previewAppearance = null,
  previewLinks = null,
  previewLogo = null,
  previewStoreName = null,
  previewColorScheme = null
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBottomNav, setShowBottomNav] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { itemCount, toggleCart } = useCart();
  const { wishlistCount } = useWishlist();
  const router = useRouter();
  const storeContext = useStoreOptional();

  // Dynamic store info from context OR props
  const storeName = previewMode ? (previewStoreName || 'Store') : (storeContext?.storeName || 'Store');
  const phone = previewMode ? '123-456-7890' : (storeContext?.phone || '');
  const email = previewMode ? 'contact@store.com' : (storeContext?.email || '');
  const address = previewMode ? '123 Store St, City' : (storeContext?.address || '');
  const logo = previewMode ? previewLogo : storeContext?.logo;

  // Appearance: use preview if available, otherwise context
  const navbarAppearance = previewMode
    ? (previewAppearance || {})
    : (storeContext?.store?.appearance?.navbar || {});

  // Helper to convert hex to rgba
  const hexToRgba = (hex, opacity) => {
    if (!hex) return '';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  const backgroundColor = navbarAppearance.backgroundColor || '#ffffff';
  const backgroundOpacity = navbarAppearance.backgroundOpacity ?? 100;
  const navbarBgColor = hexToRgba(backgroundColor, backgroundOpacity);

  const linkColor = navbarAppearance.linkColor || '#374151';
  const linkOpacity = navbarAppearance.linkOpacity ?? 100;
  const navbarLinkColor = hexToRgba(linkColor, linkOpacity);

  const hTextColor = navbarAppearance.hoverTextColor || '#4f46e5';
  const hTextOpacity = navbarAppearance.hoverTextOpacity ?? 100;
  const hoverTextColor = hexToRgba(hTextColor, hTextOpacity);

  const hBgColor = navbarAppearance.hoverBackgroundColor || '#f9fafb';
  const hBgOpacity = navbarAppearance.hoverBackgroundOpacity ?? 100;
  const hoverBackgroundColor = hexToRgba(hBgColor, hBgOpacity);

  const subBgColor = navbarAppearance.submenuBackgroundColor || '#ffffff';
  const subBgOpacity = navbarAppearance.submenuBackgroundOpacity ?? 100;
  const submenuBgColor = hexToRgba(subBgColor, subBgOpacity);

  const subLinkColor = navbarAppearance.submenuLinkColor || '#374151';
  const subLinkOpacity = navbarAppearance.submenuLinkOpacity ?? 100;
  const submenuLinkColor = hexToRgba(subLinkColor, subLinkOpacity);

  const subHoverTextColor = navbarAppearance.submenuHoverTextColor || '#4f46e5';
  const subHoverTextOpacity = navbarAppearance.submenuHoverTextOpacity ?? 100;
  const submenuHoverTextColor = hexToRgba(subHoverTextColor, subHoverTextOpacity);

  const subHoverBgColor = navbarAppearance.submenuHoverBackgroundColor || '#f9fafb';
  const subHoverBgOpacity = navbarAppearance.submenuHoverBackgroundOpacity ?? 100;
  const submenuHoverBackgroundColor = hexToRgba(subHoverBgColor, subHoverBgOpacity);

  // Default nav links (fallback)
  const defaultNavLinks = [
    { id: 'home', label: 'HOME', href: '/', showOnNavbar: true, sublinks: [] },
    { id: 'shop', label: 'SHOP', href: '/shop', showOnNavbar: true, sublinks: [] },
    { id: 'contact', label: 'CONTACT', href: '/contact', showOnNavbar: true, sublinks: [] }
  ];

  // Use custom links if available, otherwise fallback to defaults
  // Filter out links where showOnNavbar is explicitly false
  const allNavLinks = previewMode
    ? (previewLinks || defaultNavLinks)
    : (storeContext?.navbarLinks && storeContext.navbarLinks.length > 0
      ? storeContext.navbarLinks
      : defaultNavLinks);

  const navLinks = allNavLinks.filter(link => link.showOnNavbar !== false);

  useEffect(() => {
    const toggleBottomNavVisibility = () => {
      const scrolled = document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = (scrolled / (documentHeight - windowHeight)) * 100;
      setShowBottomNav(scrollPercentage > 4);
    };

    window.addEventListener('scroll', toggleBottomNavVisibility);
    return () => window.removeEventListener('scroll', toggleBottomNavVisibility);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Dynamic Styles
  const dynamicStyles = `
    .nav-item-custom:hover {
        color: ${hoverTextColor} !important;
        background-color: ${hoverBackgroundColor};
    }
    .dropdown-item-custom:hover {
        color: ${submenuHoverTextColor} !important;
        background-color: ${submenuHoverBackgroundColor};
    }
    /* Mobile Menu Link Hover */
    .mobile-nav-item:hover {
        color: ${hoverTextColor} !important;
        background-color: ${hoverBackgroundColor};
    }
  `;

  // Color Scheme Application
  const activeColorScheme = previewMode
    ? (previewColorScheme || storeContext?.store?.appearance?.colorScheme)
    : storeContext?.store?.appearance?.colorScheme;

  const accentColor = activeColorScheme?.colors?.accent || '#4f46e5'; // Default indigo-600
  const buttonTextColor = activeColorScheme?.colors?.buttonText || '#ffffff';

  return (
    <>
      <style>{dynamicStyles}</style>
      {/* Top Bar with Contact Info - Hidden in Preview Mode */}
      {!previewMode && (phone || email) && (
        <div className="bg-gray-900 text-white text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center space-x-4">
                {phone && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    <span className="hidden sm:inline">{phone}</span>
                  </div>
                )}
                {email && (
                  <div className="hidden md:flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{email}</span>
                  </div>
                )}
              </div>
              {address && (
                <div className="flex items-center space-x-2 text-gray-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="hidden sm:inline">{address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className={`shadow-lg border-b border-gray-200 transition-colors duration-300 ${previewMode ? 'relative' : 'sticky top-0 z-50'}`} style={{ backgroundColor: navbarBgColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button onClick={toggleMenu} className="lg:hidden" style={{ color: navbarLinkColor }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              {(() => {
                // Determine appearance object based on mode
                const appearance = previewMode
                  ? (previewAppearance || {})
                  : (storeContext?.store?.appearance?.navbar || {});

                // Desktop Settings
                const logoType = appearance.logoType || (logo ? 'image' : 'text');
                const logoUrl = appearance.logoUrl || logo;
                const logoText = appearance.logoText || storeName;
                const logoHeight = appearance.logoHeight || 40;
                const textSize = appearance.textSize || 20;
                const textColor = appearance.textColor || '#111827';

                // Mobile Settings
                const mobileLogoType = appearance.mobileLogoType || logoType;
                const mobileLogoHeight = appearance.mobileLogoHeight || 30;
                const mobileTextSize = appearance.mobileTextSize || 18;

                const renderLogo = (type, height, tSize, isMobile) => {
                  if (type === 'image' && logoUrl) {
                    return (
                      <img
                        src={logoUrl}
                        alt={storeName}
                        style={{ height: `${height}px` }}
                        className={`w-auto mr-3 object-contain`}
                      />
                    );
                  }

                  if (type === 'text') {
                    return (
                      <span
                        className="font-bold block truncate max-w-[200px]"
                        style={{ color: textColor, fontSize: `${tSize}px` }}
                      >
                        {logoText}
                      </span>
                    );
                  }

                  if (type === 'both') {
                    return (
                      <div className="flex items-center gap-3">
                        {logoUrl && (
                          <img
                            src={logoUrl}
                            alt={storeName}
                            style={{ height: `${height}px` }}
                            className="w-auto object-contain"
                          />
                        )}
                        <span
                          className="font-bold block truncate max-w-[200px]"
                          style={{ color: textColor, fontSize: `${tSize}px` }}
                        >
                          {logoText}
                        </span>
                      </div>
                    );
                  }

                  // Fallback
                  return (
                    <div className={`rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}>
                      <span className="text-white font-bold" style={{ fontSize: isMobile ? '16px' : '18px' }}>{storeName.charAt(0)}</span>
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
              {(!navbarAppearance?.logoType || navbarAppearance?.logoType === 'image') && !navbarAppearance?.logoUrl && !logo && (
                <span className="text-xl font-bold hidden sm:block ml-3" style={{ color: navbarLinkColor }}>{storeName}</span>
              )}
            </Link>

            {/* Desktop Nav Links with Dropdown Support */}
            <div className="hidden lg:flex items-center space-x-6">
              {navLinks.map((link) => {
                const hasSublinks = link.sublinks && link.sublinks.length > 0;
                const linkLabel = link.label || link.name;
                const isActive = router.pathname === link.href;

                return (
                  <div
                    key={link.id || linkLabel}
                    className="relative group"
                    onMouseEnter={() => hasSublinks && setActiveDropdown(link.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      href={link.href}
                      className={`font-medium px-3 py-2 rounded-md transition-colors flex items-center gap-1 nav-item-custom ${isActive ? 'active-link' : ''}`}
                      style={{
                        color: isActive ? hoverTextColor : navbarLinkColor,
                        backgroundColor: isActive ? hoverBackgroundColor : undefined
                      }}
                    >
                      {linkLabel}
                      {hasSublinks && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </Link>
                    {/* Dropdown Menu */}
                    {hasSublinks && (
                      <div className={`absolute top-full left-0 mt-1 w-48 rounded-lg shadow-xl border border-gray-100 py-2 transition-all z-50 ${activeDropdown === link.id ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`} style={{ backgroundColor: submenuBgColor }}>
                        {link.sublinks.map((sub) => (
                          <Link
                            key={sub.id || sub.label}
                            href={sub.href}
                            className="block px-4 py-2 text-sm transition-colors dropdown-item-custom"
                            style={{ color: submenuLinkColor }}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2 hover:text-indigo-600 hidden sm:block" style={{ color: navbarLinkColor }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-sm hover:opacity-90 active:scale-95 transform duration-100"
                style={{
                  backgroundColor: accentColor,
                  color: buttonTextColor
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                </svg>
                <span className="hidden sm:inline font-medium">Cart</span>
                {itemCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold border-2"
                    style={{
                      backgroundColor: buttonTextColor,
                      color: accentColor,
                      borderColor: accentColor
                    }}
                  >
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={toggleMenu}>
          <div
            className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl transform transition-transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <span className="text-lg font-bold text-gray-900">{storeName}</span>
              <button onClick={toggleMenu} className="text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="py-4 px-4 space-y-2">
              {navLinks.map((link) => {
                const linkLabel = link.label || link.name;
                const hasSublinks = link.sublinks && link.sublinks.length > 0;
                return (
                  <div key={link.id || linkLabel}>
                    <Link
                      href={link.href}
                      className={`block px-4 py-3 rounded-lg font-medium mobile-nav-item transition-colors ${router.pathname === link.href ? 'active-link' : ''}`}
                      style={{
                        color: router.pathname === link.href ? hoverTextColor : navbarLinkColor,
                        backgroundColor: router.pathname === link.href ? hoverBackgroundColor : undefined
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {linkLabel}
                    </Link>
                    {hasSublinks && (
                      <div className="pl-4 space-y-1">
                        {link.sublinks.map((sub) => (
                          <Link
                            key={sub.id || sub.label}
                            href={sub.href}
                            className="block px-4 py-2 rounded-lg text-sm text-gray-500 mobile-nav-item transition-colors"
                            style={{ color: navbarLinkColor }}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <Link
                href="/wishlist"
                className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium flex justify-between"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{wishlistCount}</span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 transition-transform ${showBottomNav ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="grid grid-cols-4 h-16">
          <Link href="/" className={`flex flex-col items-center justify-center`}
            style={{ color: router.pathname === '/' ? hoverTextColor : '#6b7280' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/shop" className={`flex flex-col items-center justify-center transition-colors`}
            style={{
              color: router.pathname === '/shop' ? hoverTextColor : '#6b7280',
              backgroundColor: router.pathname === '/shop' ? hoverBackgroundColor : undefined
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs mt-1">Shop</span>
          </Link>
          <Link href="/wishlist" className={`flex flex-col items-center justify-center relative transition-colors`}
            style={{
              color: router.pathname === '/wishlist' ? hoverTextColor : '#6b7280',
              backgroundColor: router.pathname === '/wishlist' ? hoverBackgroundColor : undefined
            }}
          >
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{wishlistCount}</span>}
            </div>
            <span className="text-xs mt-1">Wishlist</span>
          </Link>
          <button onClick={toggleCart} className="flex flex-col items-center justify-center text-gray-500 relative">
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold"
                  style={{
                    backgroundColor: accentColor,
                    color: buttonTextColor
                  }}
                >
                  {itemCount}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">Cart</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;