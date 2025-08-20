import { fetchClientProducts, fetchClientCategories, fetchClientBanners } from '@/lib/fetchProducts';
import SITE_CONFIG, { getPageMeta, getBusinessInfo, getSchemaConfig, isDevelopment } from '@/config/siteConfig';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import Products from '@/components/Products';
import Reviews from '@/components/Reviews';

import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home({ products, categories, banners, clientInfo }) {
  const pageMeta = getPageMeta('home');

  return (
    <>
      <Head>
        <title>{pageMeta.title}</title>
        <meta name="description" content={pageMeta.description} />
        <meta name="keywords" content={pageMeta.keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={SITE_CONFIG.faviconPath} type="image/png" sizes={SITE_CONFIG.faviconSize} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Hero banners={banners} />
        <Categories categories={categories} />
        <Products products={products} categories={categories} />
        <Reviews />
        <Footer />
        {/* Add bottom padding for mobile navigation bar */}
        <div className="lg:hidden h-16"></div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    console.log('Fetching products and categories for homepage...');

    const schemaConfig = getSchemaConfig();
    const businessInfo = getBusinessInfo();

    // Fetch products and categories at build time
    const [products, categories, banners] = await Promise.all([
      fetchClientProducts(schemaConfig.productsSchemaSlug),
      fetchClientCategories(schemaConfig.categoriesSchemaSlug),
      fetchClientBanners(schemaConfig.bannersSchemaSlug)
    ]);

    // Client info from configuration
    const clientInfo = businessInfo;

    console.log(`Homepage: Successfully fetched ${products.length} products, ${categories.length} categories, and ${banners.length} banners`);

    return {
      props: {
        products,
        categories,
        banners,
        clientInfo,
      },
      // Pure SSG - no revalidation (compatible with static export)
    };
  } catch (error) {
    console.error('Error in getStaticProps (homepage):', error);

    // In development, this might be expected if using local JSON
    // In production, this indicates an API issue
    const isDevMode = isDevelopment();

    return {
      props: {
        products: [],
        categories: [],
        banners: [],
        clientInfo: {
          ...getBusinessInfo(),
          description: isDevMode
            ? SITE_CONFIG.development.fallbackMessage + ' - check your data/products.json, data/categories.json, and data/banners.json files'
            : SITE_CONFIG.production.fallbackMessage
        }
      },
      // Pure SSG - no revalidation
    };
  }
} 