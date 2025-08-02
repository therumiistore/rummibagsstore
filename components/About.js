import Image from 'next/image';

const About = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-brand-secondary bg-opacity-10">
                <span className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">
                  ✨ About Us
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold leading-tight text-brand-primary">
                Premium Fashion Collections Since
                <span className="text-brand-accent"> Day One</span>
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                At <span className="font-semibold text-brand-accent">ZOHA'S ATTIRE</span>,
                we believe that every garment should combine beautiful design with uncompromising quality.
                Our passion is creating premium fashion collections that families trust and love.
                From our signature shirts and dresses to stylish accessories and traditional wear,
                every item is crafted with attention to detail using premium fabrics and the latest trends.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-brand-primary">Why Choose ZOHA'S ATTIRE?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-accent">
                    <span className="text-2xl">👔</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-brand-primary">Premium Quality</h4>
                    <p className="text-sm text-gray-600">High-quality fabrics and materials that deliver comfort and style every time.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-accent">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-brand-primary">Latest Trends</h4>
                    <p className="text-sm text-gray-600">We follow the latest fashion trends to ensure you stay stylish and modern.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-accent">
                    <span className="text-2xl">👗</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-brand-primary">Complete Fashion Range</h4>
                    <p className="text-sm text-gray-600">A wide range of garments for men, women, babies, and accessories for all occasions.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-accent">
                    <span className="text-2xl">🇵🇰</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-brand-primary">Made in Pakistan</h4>
                    <p className="text-sm text-gray-600">Proudly serving our nation with high-quality fashion garments.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <a
                href="/shop"
                className="bg-gradient-to-r from-brand-primary to-brand-accent text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 text-center transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                👔 Shop Collection
              </a>
              <a
                href="/contact"
                className="bg-transparent border-2 border-brand-accent text-brand-accent px-8 py-3 rounded-lg font-semibold transition-all duration-300 text-center transform hover:scale-105"
              >
                📞 Contact Us
              </a>
            </div>
          </div>

          {/* Right Content - Brand Visual & Stats */}
          <div className="relative">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              {/* Brand Visual */}
              <div className="w-full h-64 rounded-xl flex items-center justify-center mb-8 relative overflow-hidden bg-gradient-to-br from-brand-primary to-brand-accent">
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                <div className="relative z-10 text-center">
                  <div className="text-6xl mb-4">👗</div>
                  <div className="text-white font-bold text-xl">
                    <span className="text-white">ZOHA'S ATTIRE</span>
                  </div>
                  <div className="text-white text-sm opacity-90 mt-2">FASHION COLLECTION</div>
                  <div className="text-white text-xs opacity-75 mt-1">Premium Quality Fashion Garments</div>
                </div>
                {/* Floating Sweet Icons */}
                <div className="absolute top-4 left-4 text-2xl animate-bounce">👔</div>
                <div className="absolute top-4 right-4 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
                <div className="absolute bottom-4 left-4 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>👗</div>
                <div className="absolute bottom-4 right-4 text-2xl animate-bounce" style={{ animationDelay: '1.5s' }}>👜</div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold mb-1 text-brand-accent">5000+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold mb-1 text-brand-accent">50+</div>
                  <div className="text-sm text-gray-600">Product Varieties</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold mb-1 text-brand-accent">100%</div>
                  <div className="text-sm text-gray-600">Quality Assured</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold mb-1 text-brand-accent">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-brand-accent opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-brand-primary opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 -left-4 w-12 h-12 rounded-full bg-brand-secondary opacity-30 animate-bounce" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        {/* Brand Story Section */}
        <div className="mt-20 text-center">
          <div className="rounded-2xl p-8 text-white bg-gradient-to-r from-brand-primary to-brand-accent">
            <h3 className="text-3xl font-bold mb-4">
              🏆 Your Trusted Fashion Partner
            </h3>
            <p className="text-lg mb-6 opacity-90 max-w-3xl mx-auto">
              At ZOHA'S ATTIRE, we understand that fashion is essential for expressing your personality and confidence.
              Our carefully curated collection of premium garments brings together latest trends with
              quality fabrics to create stylish and comfortable solutions for every occasion.
              <br /><br />
              <span className="font-semibold">From elegant dresses and formal shirts to casual wear and stylish accessories</span> –
              we offer a complete range of fashion garments for men, women, and babies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:0310-3503309"
                className="bg-white text-brand-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>📞 Call Now: 0310-3503309</span>
              </a>
              <a
                href="mailto:info@zohasattire.com"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>📧 Email Us</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About; 