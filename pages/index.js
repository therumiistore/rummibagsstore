/**
 * Homepage - Dynamic Storefront
 * Fetches content based on store domain/subdomain
 */

import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import Products from '@/components/Products';
import Reviews from '@/components/Reviews';
import Footer from '@/components/Footer';
import storefrontApi, { resolveStoreSlug } from '@/lib/storefrontApi';

export default function Home({ store, products, categories, banners, reviews }) {
  const storeName = store?.name || 'Store';
  const description = store?.description || 'Welcome to our online store';

  return (
    <>
      <Head>
        <title>{storeName}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {store?.favicon && <link rel="icon" href={store.favicon} />}
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Hero banners={banners} />
        <Categories categories={categories} />
        <Products products={products} categories={categories} />
        <Reviews reviews={reviews} />
        <Footer />
        {/* Bottom padding for mobile nav */}
        <div className="lg:hidden h-16"></div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { req, query } = context;
  const host = req.headers.host || '';

  // Resolve store slug from domain or query param
  const storeSlug = resolveStoreSlug(host, query);

  if (!storeSlug) {
    return {
      props: {
        store: null,
        storeSlug: null,
        products: [],
        categories: [],
        banners: [],
        error: 'No store found. Use ?store=yourstore in development.',
      },
    };
  }

  try {
    // Fetch all store data in parallel
    const [storeRes, productsRes, categoriesRes, bannersRes, reviewsRes] = await Promise.all([
      storefrontApi.getStore(storeSlug).catch(() => ({ success: false })),
      storefrontApi.getProducts(storeSlug, { limit: 20 }).catch(() => ({ success: false, data: { products: [] } })),
      storefrontApi.getCategories(storeSlug).catch(() => ({ success: false, data: [] })),
      storefrontApi.getBanners(storeSlug).catch(() => ({ success: false, data: [] })),
      storefrontApi.getReviews(storeSlug).catch(() => ({ success: false, data: [] })),
    ]);

    if (!storeRes.success) {
      return {
        notFound: true,
      };
    }


    return {
      props: {
        store: storeRes.data || null,
        storeSlug,
        products: productsRes.data?.products || [],
        categories: categoriesRes.data || [],
        categories: categoriesRes.data || [],
        banners: bannersRes.data || [],
        reviews: reviewsRes?.data || [],
      },
    };
  } catch (error) {
    console.error('Error fetching store data:', error);
    return {
      props: {
        store: null,
        storeSlug,
        products: [],
        categories: [],
        banners: [],
        error: 'Failed to load store data',
      },
    };
  }
}