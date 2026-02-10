import Head from 'next/head';
import SITE_CONFIG, { getPageMeta, getBusinessInfo } from '@/config/siteConfig';
import { useStore } from '@/lib/StoreContext';
import Navbar from '@/components/Navbar';
import Products from '@/components/Products';
import Footer from '@/components/Footer';

export default function ShopPage({ products: ssrProducts, categories: ssrCategories, clientInfo }) {
  const pageMeta = getPageMeta('shop');
  const { products: contextProducts, categories: contextCategories } = useStore();

  // Use SSR data if available, otherwise fall back to context
  const products = ssrProducts?.length > 0 ? ssrProducts : contextProducts;
  const categories = ssrCategories?.length > 0 ? ssrCategories : contextCategories;

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
        <Products products={products} categories={categories} />
        <Footer />
      </div>
    </>
  );
}

export async function getServerSideProps({ req, query }) {
  // Import storefront utilities for SSR
  const { resolveStoreSlug } = await import('@/lib/storefrontApi');
  const storefrontApi = (await import('@/lib/storefrontApi')).default;

  const host = req.headers.host || '';
  const storeSlug = resolveStoreSlug(host, query);

  if (!storeSlug) {
    return {
      props: {
        store: null,
        storeSlug: null,
        products: [],
        categories: [],
        banners: [],
        clientInfo: getBusinessInfo(),
      },
    };
  }

  try {
    console.log('Fetching all store data for shop page...');

    // Fetch all data for StoreContext
    const [storeRes, productsRes, categoriesRes, bannersRes] = await Promise.all([
      storefrontApi.getStore(storeSlug).catch(() => ({ success: false })),
      storefrontApi.getProducts(storeSlug, { limit: 100 }).catch(() => ({ success: false, data: { products: [] } })),
      storefrontApi.getCategories(storeSlug).catch(() => ({ success: false, data: [] })),
      storefrontApi.getBanners(storeSlug).catch(() => ({ success: false, data: [] })),
    ]);

    console.log(`Shop page: Fetched ${productsRes.data?.products?.length || 0} products`);

    return {
      props: {
        store: storeRes.data || null,
        storeSlug,
        products: productsRes.data?.products || [],
        categories: categoriesRes.data || [],
        banners: bannersRes.data || [],
        clientInfo: getBusinessInfo(),
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps (shop page):', error);
    return {
      props: {
        store: null,
        storeSlug,
        products: [],
        categories: [],
        banners: [],
        clientInfo: getBusinessInfo(),
      },
    };
  }
}