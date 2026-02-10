import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import storefrontApi, { resolveStoreSlug } from '@/lib/storefrontApi';

const policyTitles = {
    'privacy-policy': 'Privacy Policy',
    'terms-of-service': 'Terms of Service',
    'cookie-policy': 'Cookie Policy'
};

const policyKeys = {
    'privacy-policy': 'privacyPolicy',
    'terms-of-service': 'termsOfService',
    'cookie-policy': 'cookiePolicy'
};

// Default generic legal content for ecommerce stores
const defaultLegalContent = {
    privacyPolicy: `<h2 style="font-size:1.75rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Privacy Policy</h2>
<p style="color:#6b7280;margin-bottom:1.5rem;">Last updated: February 10, 2026</p>
<p style="margin-bottom:1.5rem;line-height:1.8;">Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our online store.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Information We Collect</h3>
<p style="margin-bottom:0.75rem;line-height:1.8;">We may collect personal information that you voluntarily provide to us when you:</p>
<ul style="margin-bottom:1.5rem;padding-left:1.5rem;line-height:2;">
<li>Register an account on our store</li>
<li>Place an order or make a purchase</li>
<li>Subscribe to our newsletter</li>
<li>Contact us with inquiries or feedback</li>
</ul>
<p style="margin-bottom:1.5rem;line-height:1.8;">This information may include your name, email address, phone number, shipping address, billing address, and payment information.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">How We Use Your Information</h3>
<p style="margin-bottom:0.75rem;line-height:1.8;">We use the information we collect to:</p>
<ul style="margin-bottom:1.5rem;padding-left:1.5rem;line-height:2;">
<li>Process and fulfill your orders</li>
<li>Send you order confirmations and shipping updates</li>
<li>Respond to your inquiries and provide customer support</li>
<li>Send promotional communications (with your consent)</li>
<li>Improve our website, products, and services</li>
<li>Prevent fraudulent transactions and protect against illegal activity</li>
</ul>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Information Sharing</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website, processing payments, and delivering orders.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Data Security</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Your Rights</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">You have the right to access, correct, or delete your personal information. You may also opt out of receiving marketing communications at any time by using the unsubscribe link in our emails.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Contact Us</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">If you have any questions about this Privacy Policy, please contact us through our Contact page.</p>`,

    termsOfService: `<h2 style="font-size:1.75rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Terms of Service</h2>
<p style="color:#6b7280;margin-bottom:1.5rem;">Last updated: February 10, 2026</p>
<p style="margin-bottom:1.5rem;line-height:1.8;">Please read these Terms of Service carefully before using our online store. By accessing or using our website, you agree to be bound by these terms.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">General Terms</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">We reserve the right to refuse service to anyone for any reason at any time. You agree not to reproduce, duplicate, copy, sell, or exploit any portion of our service without express written permission.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Products &amp; Services</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">We have made every effort to display the colors, images, and descriptions of our products as accurately as possible. We do not guarantee that your monitor's display of any color will be accurate. We reserve the right to limit the quantities of any products or services that we offer.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Pricing</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">All prices are listed in the currency displayed on the website and are subject to change without notice. We reserve the right to modify or discontinue any product without notice. We shall not be liable to you or any third party for any modification, price change, or discontinuance of a product.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Orders &amp; Payment</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">We reserve the right to refuse any order you place with us. Payment must be received in full before an order is shipped. We accept Cash on Delivery (COD) and other payment methods as displayed at checkout.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Shipping &amp; Delivery</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">Shipping times are estimates and are not guaranteed. We are not responsible for delays caused by the shipping carrier or customs. Risk of loss and title for items pass to you upon delivery to the carrier.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Returns &amp; Refunds</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">If you are not satisfied with your purchase, please contact us within 7 days of receiving your order. Items must be returned in their original condition and packaging. Refunds will be processed within 5-10 business days after we receive the returned item.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Limitation of Liability</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">We shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of our services or products.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Changes to Terms</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">We reserve the right to update or modify these Terms of Service at any time without prior notice. Your continued use of the website after any changes constitutes acceptance of the new terms.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Contact Us</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">If you have any questions about these Terms of Service, please contact us through our Contact page.</p>`,

    cookiePolicy: `<h2 style="font-size:1.75rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Cookie Policy</h2>
<p style="color:#6b7280;margin-bottom:1.5rem;">Last updated: February 10, 2026</p>
<p style="margin-bottom:1.5rem;line-height:1.8;">This Cookie Policy explains how we use cookies and similar technologies when you visit our online store.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">What Are Cookies?</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help the website remember your preferences and improve your browsing experience.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">How We Use Cookies</h3>
<p style="margin-bottom:0.75rem;line-height:1.8;">We use the following types of cookies:</p>
<ul style="margin-bottom:1.5rem;padding-left:1.5rem;line-height:2;">
<li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They enable core features like shopping cart functionality, secure checkout, and account authentication.</li>
<li style="margin-top:0.5rem;"><strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact with our website by collecting information about pages visited, time spent on the site, and any errors encountered.</li>
<li style="margin-top:0.5rem;"><strong>Functional Cookies:</strong> These cookies allow our website to remember choices you make (such as your language or region) and provide enhanced, personalized features.</li>
<li style="margin-top:0.5rem;"><strong>Marketing Cookies:</strong> These cookies are used to deliver relevant advertisements and track the effectiveness of our marketing campaigns.</li>
</ul>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Managing Cookies</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">Most web browsers allow you to control cookies through their settings. You can choose to block or delete cookies, but please note that doing so may affect the functionality of our website and your shopping experience.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Third-Party Cookies</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">Some cookies on our website are set by third-party services such as analytics providers and payment processors. We do not control these cookies and recommend reviewing the privacy policies of these third parties.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Updates to This Policy</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this policy periodically.</p>

<h3 style="font-size:1.35rem;font-weight:700;margin-top:2rem;margin-bottom:0.75rem;color:#111827;">Contact Us</h3>
<p style="margin-bottom:1.5rem;line-height:1.8;">If you have any questions about our use of cookies, please contact us through our Contact page.</p>`
};

export default function PolicyPage({ store, content, title }) {
    if (!store) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Head>
                <title>{`${title} - ${store.name}`}</title>
            </Head>

            <Navbar store={store} />

            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">{title}</h1>
                    <div
                        className="policy-content text-gray-700"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </main>

            <Footer store={store} />

            <style jsx global>{`
                .policy-content h2 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                    color: #111827;
                }
                .policy-content h3 {
                    font-size: 1.35rem;
                    font-weight: 700;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                    color: #111827;
                }
                .policy-content p {
                    margin-bottom: 1rem;
                    line-height: 1.8;
                    color: #374151;
                }
                .policy-content ul {
                    padding-left: 1.5rem;
                    margin-bottom: 1.5rem;
                    list-style-type: disc;
                }
                .policy-content ul li {
                    margin-bottom: 0.5rem;
                    line-height: 1.8;
                    color: #374151;
                }
                .policy-content strong {
                    font-weight: 600;
                    color: #111827;
                }
            `}</style>
        </div>
    );
}

export async function getServerSideProps(context) {
    const { req, query, params } = context;
    const host = req.headers.host || '';
    const type = params.type;

    const storeSlug = resolveStoreSlug(host, query);

    if (!storeSlug || !policyKeys[type]) {
        return { notFound: true };
    }

    try {
        const storeRes = await storefrontApi.getStore(storeSlug).catch(() => ({ success: false }));

        if (!storeRes.success) {
            return { notFound: true };
        }

        const store = storeRes.data;
        let appearance = store.appearance || {};
        if (typeof appearance === 'string') {
            try {
                appearance = JSON.parse(appearance);
            } catch (e) {
                appearance = {};
            }
        }

        const policyKey = policyKeys[type];
        // Use saved content, or fall back to default generic content
        const content = appearance.footer?.legal?.[policyKey] || defaultLegalContent[policyKey] || '';
        const title = policyTitles[type] || 'Legal';

        return {
            props: {
                store,
                content,
                title,
            },
        };
    } catch (error) {
        console.error('Error fetching policy page:', error);
        return { notFound: true };
    }
}
