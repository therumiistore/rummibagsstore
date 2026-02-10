const About = ({ store }) => {
  // Parse appearance data
  let appearance = store?.appearance || {};
  if (typeof appearance === 'string') {
    try { appearance = JSON.parse(appearance); } catch (e) { appearance = {}; }
  }

  const aboutUs = appearance.aboutUs || {};
  const storeName = store?.name || 'Our Store';
  const headline = aboutUs.headline || `Welcome to ${storeName}`;
  const highlightText = aboutUs.highlightText || 'Our Story';
  const description = aboutUs.description || `We are passionate about providing high-quality products and exceptional customer service. Our mission is to deliver the best shopping experience with carefully curated products that meet the highest standards of quality and design.`;
  const mission = aboutUs.mission || `Our mission is to deliver exceptional products and outstanding service to our customers. We believe in quality, integrity, and creating lasting relationships with every customer we serve.`;
  const features = aboutUs.features || [
    { emoji: '⭐', title: 'Premium Quality', description: 'We source only the finest quality products for our customers.' },
    { emoji: '🚚', title: 'Fast Delivery', description: 'Quick and reliable shipping to your doorstep.' },
    { emoji: '💯', title: 'Satisfaction Guaranteed', description: 'Your satisfaction is our top priority.' },
    { emoji: '🛡️', title: 'Secure Shopping', description: 'Safe and secure checkout for your peace of mind.' }
  ];
  const stats = aboutUs.stats || [
    { value: '1000+', label: 'Happy Customers' },
    { value: '500+', label: 'Products' },
    { value: '100%', label: 'Quality Assured' },
    { value: '24/7', label: 'Support' }
  ];
  const showFeatures = aboutUs.showFeatures !== false;
  const showStats = aboutUs.showStats !== false;
  const showMission = aboutUs.showMission !== false;

  // Get color scheme colors with fallbacks
  const colors = appearance.colorScheme?.colors || {};
  const primaryColor = colors.primary || '#1f2937';
  const secondaryColor = colors.secondary || '#374151';
  const accentColor = colors.accent || '#6366f1';
  const buttonTextColor = colors.buttonText || '#ffffff';

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <span
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: accentColor }}
                >
                  ✨ About Us
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: primaryColor }}>
                {headline}{' '}
                <span style={{ color: accentColor }}>{highlightText}</span>
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Features */}
            {showFeatures && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold" style={{ color: primaryColor }}>
                  Why Choose {storeName}?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
                      >
                        <span className="text-2xl">{feature.emoji}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1" style={{ color: primaryColor }}>{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="/shop"
                className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 text-center transform hover:scale-105 shadow-lg hover:shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                  color: buttonTextColor
                }}
              >
                🛍️ Shop Collection
              </a>
              <a
                href="/contact"
                className="bg-transparent border-2 px-8 py-3 rounded-lg font-semibold transition-all duration-300 text-center transform hover:scale-105"
                style={{
                  borderColor: accentColor,
                  color: accentColor
                }}
              >
                📞 Contact Us
              </a>
            </div>
          </div>

          {/* Right Content - Brand Visual & Stats */}
          <div className="relative">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              {/* Brand Visual */}
              <div
                className="w-full h-64 rounded-xl flex items-center justify-center mb-8 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                <div className="relative z-10 text-center">
                  {store?.logo ? (
                    <img src={store.logo} alt={storeName} className="h-20 mx-auto mb-3 object-contain" />
                  ) : (
                    <div className="text-6xl mb-4">🏪</div>
                  )}
                  <div className="text-white font-bold text-xl">{storeName}</div>
                  {store?.tagline && (
                    <div className="text-white text-sm opacity-90 mt-2">{store.tagline}</div>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              {showStats && (
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-3xl font-bold mb-1" style={{ color: accentColor }}>{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Floating Decorative Elements */}
            <div
              className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20 animate-pulse"
              style={{ backgroundColor: accentColor }}
            ></div>
            <div
              className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full opacity-20 animate-pulse"
              style={{ backgroundColor: primaryColor, animationDelay: '1s' }}
            ></div>
            <div
              className="absolute top-1/2 -left-4 w-12 h-12 rounded-full opacity-30 animate-bounce"
              style={{ backgroundColor: secondaryColor, animationDelay: '2s' }}
            ></div>
          </div>
        </div>

        {/* Mission Banner */}
        {showMission && (
          <div className="mt-16 md:mt-20 text-center">
            <div
              className="rounded-2xl p-8 md:p-12 text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                🏆 Our Mission
              </h3>
              <p className="text-lg mb-6 opacity-90 max-w-3xl mx-auto leading-relaxed">
                {mission}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {store?.phone && (
                  <a
                    href={`tel:${store.phone}`}
                    className="px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2"
                    style={{ backgroundColor: '#fff', color: primaryColor }}
                  >
                    <span>📞 Call Now: {store.phone}</span>
                  </a>
                )}
                {store?.email && (
                  <a
                    href={`mailto:${store.email}`}
                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>📧 Email Us</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default About;