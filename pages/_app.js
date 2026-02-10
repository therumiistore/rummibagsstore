import '@/styles/globals.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { CartProvider } from '@/lib/CartContext';
import { WishlistProvider } from '@/lib/WishlistContext';
import { NotificationProvider } from '@/lib/NotificationContext';
import { AuthProvider } from '@/lib/dashboardAuth';
import { StoreProvider } from '@/lib/StoreContext';
import Cart from '@/components/Cart';
import Notification from '@/components/Notification';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isDashboardRoute = router.pathname.startsWith('/dashboard');

  // Extract store data from pageProps (passed by getServerSideProps)
  const { store, storeSlug, products, categories, banners, ...restPageProps } = pageProps;

  // For storefront pages, wrap with StoreProvider
  if (!isDashboardRoute) {
    // Parse appearance if it's a string (from database)
    let appearance = store?.appearance;
    if (typeof appearance === 'string') {
      try {
        appearance = JSON.parse(appearance);
      } catch (e) {
        console.error('Failed to parse appearance:', e);
        appearance = null;
      }
    }

    // Generate CSS custom properties from color scheme
    const colorScheme = appearance?.colorScheme;

    // Debug logging
    console.log('Store appearance:', appearance);
    console.log('Color scheme:', colorScheme);

    const colorSchemeStyles = colorScheme?.colors ? `
      :root {
        --color-primary: ${colorScheme.colors.primary} !important;
        --color-secondary: ${colorScheme.colors.secondary} !important;
        --color-accent: ${colorScheme.colors.accent} !important;
        --color-background: ${colorScheme.colors.background} !important;
        --color-text: ${colorScheme.colors.text} !important;
        --color-button-text: ${colorScheme.colors.buttonText} !important;
      }
    ` : '';

    return (
      <StoreProvider
        initialStore={store}
        storeSlug={storeSlug}
        initialProducts={products}
        initialCategories={categories}
        initialBanners={banners}
      >
        <CartProvider storeSlug={storeSlug}>
          <WishlistProvider storeSlug={storeSlug}>
            <NotificationProvider>
              <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {store?.favicon && <link rel="icon" href={store.favicon} />}
                {colorSchemeStyles && <style dangerouslySetInnerHTML={{ __html: colorSchemeStyles }} />}
              </Head>
              <Component {...restPageProps} store={store} storeSlug={storeSlug} products={products} categories={categories} banners={banners} />
              <Cart />
              <Notification />
              <FloatingWhatsApp />
            </NotificationProvider>
          </WishlistProvider>
        </CartProvider>
      </StoreProvider>
    );
  }

  // Dashboard pages - no store provider needed
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <NotificationProvider>
            <Head>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <Component {...pageProps} />
          </NotificationProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}