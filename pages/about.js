/**
 * About Us Page - Dynamic Storefront
 * Fetches content from store appearance data
 */

import Head from 'next/head';
import Navbar from '@/components/Navbar';
import About from '@/components/About';
import Footer from '@/components/Footer';
import storefrontApi, { resolveStoreSlug } from '@/lib/storefrontApi';

export default function AboutPage({ store }) {
  const storeName = store?.name || 'Store';

  return (
    <>
      <Head>
        <title>{`About Us - ${storeName}`}</title>
        <meta name="description" content={`Learn more about ${storeName}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {store?.favicon && <link rel="icon" href={store.favicon} />}
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar store={store} />
        <About store={store} />
        <Footer store={store} />
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { req, query } = context;
  const host = req.headers.host || '';
  const storeSlug = resolveStoreSlug(host, query);

  if (!storeSlug) {
    return {
      props: { store: null },
    };
  }

  try {
    const storeRes = await storefrontApi.getStore(storeSlug).catch(() => ({ success: false }));

    if (!storeRes.success) {
      return { notFound: true };
    }

    return {
      props: {
        store: storeRes.data || null,
      },
    };
  } catch (error) {
    console.error('Error fetching store data for about page:', error);
    return {
      props: { store: null },
    };
  }
}