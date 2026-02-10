/**
 * Website Sections Page
 * Customize storefront website sections like Navbar, Footer, etc.
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Trash2, Plus, Upload, X, Layout, Type, Palette, Smartphone, Menu, MousePointer } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import * as ReactDOM from 'react-dom';

// Polyfill findDOMNode for React 19 compatibility with older libraries like react-quill
if (typeof window !== 'undefined') {
    window.ReactDOM = window.ReactDOM || ReactDOM;
    if (window.ReactDOM && !window.ReactDOM.findDOMNode) {
        window.ReactDOM.findDOMNode = (instance) => {
            if (instance == null) return null;
            if (instance instanceof HTMLElement) return instance;
            return null;
        };
    }
}

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
// Helper to generate category href: lowercase, no spaces
const generateCategoryHref = (categoryName) => {
    return `/category/${categoryName.toLowerCase().replace(/\s+/g, '')}`;
};

function CustomizationPage() {
    const [activeTab, setActiveTab] = useState('navbar');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    // Appearance state
    const [appearance, setAppearance] = useState({
        navbar: {
            logoType: 'image', // 'image' or 'text'
            logoUrl: null,
            logoText: '',
            logoHeight: 40,
            textColor: '#000000',
        },
        footer: {
            logoType: 'image', // 'image' or 'text'
            logoUrl: null,
            logoText: '',
            logoHeight: 40,
            textColor: '#FFFFFF',
            backgroundColor: '#000000',
        },
    });

    const [logoFile, setLogoFile] = useState(null);
    const [footerLogoFile, setFooterLogoFile] = useState(null);

    // Navbar links state
    const [navLinks, setNavLinks] = useState([]);
    const [editingLink, setEditingLink] = useState(null);
    const [categories, setCategories] = useState([]);

    // UI State for Collapsible Sections and Tabs
    const [brandingTab, setBrandingTab] = useState('logo'); // 'logo', 'mobile', 'colors'
    const [footerTab, setFooterTab] = useState('branding'); // 'branding', 'description', 'mobile', 'colors'
    const [expandedSection, setExpandedSection] = useState({ branding: false, nav: false, colorSchemes: false });

    // Custom Variant Types state
    // Each variant type: { id, name, inputType: 'text' | 'select', options: [] }
    const [customVariantTypes, setCustomVariantTypes] = useState([]);
    const [editingVariantType, setEditingVariantType] = useState(null);
    const [newVariantType, setNewVariantType] = useState({ name: '', inputType: 'select', options: '' });

    // Reviews State
    const [reviews, setReviews] = useState([]);
    const [isReviewsLoading, setIsReviewsLoading] = useState(false);
    const [editingReview, setEditingReview] = useState(null); // null = list, 'new' = create, object = edit
    const [reviewForm, setReviewForm] = useState({
        customer_name: '',
        customer_image: '',
        rating: 5,
        title: '',
        review_text: '',
        product_name: '',
        is_verified: false
    });

    // Pre-defined Color Schemes - Dark rich tones for primary/secondary/accent
    const colorSchemes = [
        {
            id: 'ocean-blue',
            name: 'Ocean Blue',
            description: 'Deep ocean vibes',
            colors: {
                primary: '#032d44ff',    // Very dark blue
                secondary: '#0c4a6e',  // Deeper blue
                accent: '#0369a1',     // Rich blue
                background: '#f8fafc',
                text: '#0c4a6e',
                buttonText: '#ffffff',
                onSaleElement: '#e0f2fe' // Sky 100
            }
        },
        {
            id: 'forest-green',
            name: 'Forest Green',
            description: 'Deep natural tones',
            colors: {
                primary: '#0c391dff',    // Very dark green
                secondary: '#14532d',  // Deeper forest
                accent: '#15803d',     // Rich green
                background: '#f8fafc',
                text: '#14532d',
                buttonText: '#ffffff',
                onSaleElement: '#dcfce7' // Green 100
            }
        },
        {
            id: 'sunset-orange',
            name: 'Sunset Orange',
            description: 'Bold and warm',
            colors: {
                primary: '#5e210dff',    // Very dark orange
                secondary: '#7c2d12',  // Deep burnt orange
                accent: '#c2410c',     // Rich orange
                background: '#fffbeb',
                text: '#78350f',
                buttonText: '#ffffff',
                onSaleElement: '#ffedd5' // Orange 100
            }
        },
        {
            id: 'royal-purple',
            name: 'Royal Purple',
            description: 'Elegant and luxurious',
            colors: {
                primary: '#34126cff',    // Very dark purple
                secondary: '#5b21b6',  // Deep violet
                accent: '#7c3aed',     // Rich purple
                background: '#faf5ff',
                text: '#4c1d95',
                buttonText: '#ffffff',
                onSaleElement: '#f3e8ff' // Purple 100
            }
        },
        {
            id: 'rose-pink',
            name: 'Rose Pink',
            description: 'Bold and romantic',
            colors: {
                primary: '#540b28ff',    // Very dark pink
                secondary: '#831843',  // Deep rose
                accent: '#be185d',     // Rich pink
                background: '#fdf2f8',
                text: '#831843',
                buttonText: '#ffffff',
                onSaleElement: '#fce7f3' // Pink 100
            }
        },
        {
            id: 'midnight-dark',
            name: 'Midnight Dark',
            description: 'Sleek dark mode',
            colors: {
                primary: '#1a1557ff',    // Very dark indigo
                secondary: '#3730a3',  // Deep indigo
                accent: '#4f46e5',     // Rich indigo
                background: '#0f172a',
                text: '#e2e8f0',
                buttonText: '#ffffff',
                onSaleElement: '#e0e7ff' // Indigo 100
            }
        },
        {
            id: 'golden-luxury',
            name: 'Golden Luxury',
            description: 'Premium gold tones',
            colors: {
                primary: '#441e06ff',    // Very dark amber
                secondary: '#78350f',  // Deep brown gold
                accent: '#b45309',     // Rich gold
                background: '#fffbeb',
                text: '#78350f',
                buttonText: '#ffffff',
                onSaleElement: '#fef3c7' // Amber 100
            }
        },
        {
            id: 'minimal-gray',
            name: 'Minimal Gray',
            description: 'Clean and professional',
            colors: {
                primary: '#18181b',    // Zinc-900
                secondary: '#27272a',  // Zinc-800
                accent: '#3f3f46',     // Zinc-700
                background: '#fafafa',
                text: '#18181b',
                buttonText: '#ffffff',
                onSaleElement: '#f3f4f6' // Gray 100
            }
        },
        {
            id: 'luxury-maroon',
            name: 'Luxury Maroon',
            description: 'Rich maroon with gold accents',
            colors: {
                primary: '#881313ff',    // Rose-900
                secondary: '#b51111ff',  // Rose-800
                accent: '#fbbf24',     // Amber-400 (Gold)
                background: '#ffffff',
                text: '#1f2937',
                buttonText: '#881337', // Dark Maroon text for Gold buttons
                onSaleElement: '#FEF9C3' // Pale Yellow for Sale Section elements
            }
        },
        {
            id: 'custom',
            name: 'Custom Theme',
            description: 'Create your own color palette',
            colors: {
                primary: '#000000',
                secondary: '#333333',
                accent: '#0066cc',
                background: '#ffffff',
                text: '#000000',
                buttonText: '#ffffff',
                onSaleElement: '#f3f4f6'
            }
        }
    ];

    // Selected color scheme state
    const [selectedColorScheme, setSelectedColorScheme] = useState(null);

    // Custom Colors State
    const [customColors, setCustomColors] = useState({
        primary: '#000000',
        secondary: '#333333',
        accent: '#0066cc',
        background: '#ffffff',
        text: '#000000',
        buttonText: '#ffffff',
        onSaleElement: '#f3f4f6'
    });

    // Saved Custom Schemes State
    const [savedSchemes, setSavedSchemes] = useState([]);
    const [customThemeName, setCustomThemeName] = useState('');

    // Toggle section visibility
    const toggleSection = (section) => {
        setExpandedSection(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Default navbar links with showOnNavbar property
    // If categories exist, each category becomes its own parent link with subcategories as dropdown
    // If no categories, show a fallback "Categories" link pointing to /shop
    const getDefaultNavLinks = (cats = []) => {
        const homeLink = { id: 'home', label: 'Home', href: '/', showOnNavbar: true, sublinks: [] };
        const aboutLink = { id: 'about', label: 'About', href: '/about', showOnNavbar: true, sublinks: [] };
        const contactLink = { id: 'contact', label: 'Contact Us', href: '/contact', showOnNavbar: true, sublinks: [] };

        if (cats.length === 0) {
            // No categories yet - show generic Categories link
            return [
                homeLink,
                { id: 'categories', label: 'Categories', href: '/shop', showOnNavbar: true, sublinks: [] },
                aboutLink,
                contactLink
            ];
        }

        // Categories exist - each category becomes its own parent link
        const categoryLinks = cats.map(cat => ({
            id: `cat-${cat.id || cat.name.toLowerCase().replace(/\s+/g, '')}`,
            label: cat.name,
            href: generateCategoryHref(cat.name),
            showOnNavbar: true,
            sublinks: (cat.subcategories || []).map(subcat => ({
                id: `subcat-${subcat.toLowerCase().replace(/\s+/g, '')}`,
                label: subcat,
                href: `${generateCategoryHref(cat.name)}?subcategory=${subcat.toLowerCase().replace(/\s+/g, '-')}`
            }))
        }));

        return [homeLink, ...categoryLinks, aboutLink, contactLink];
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'reviews') {
            fetchReviews();
        }
    }, [activeTab]);

    const fetchReviews = async () => {
        setIsReviewsLoading(true);
        try {
            const res = await api.getReviews();
            if (res.success) {
                setReviews(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setIsReviewsLoading(false);
        }
    };

    const handleSaveReview = async () => {
        try {
            if (editingReview === 'new') {
                const res = await api.createReview(reviewForm);
                if (res.success) {
                    setReviews([res.data, ...reviews]);
                    setEditingReview(null);
                }
            } else if (editingReview && editingReview.id) {
                const res = await api.updateReview(editingReview.id, reviewForm);
                if (res.success) {
                    setReviews(reviews.map(r => r.id === editingReview.id ? res.data : r));
                    setEditingReview(null);
                }
            }
        } catch (error) {
            alert('Failed to save review: ' + error.message);
        }
    };

    const handleDeleteReview = async (id) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        try {
            const res = await api.deleteReview(id);
            if (res.success) {
                setReviews(reviews.filter(r => r.id !== id));
            }
        } catch (error) {
            alert('Failed to delete review');
        }
    };


    const handleSaveCustomTheme = () => {
        if (!customThemeName.trim()) {
            alert('Please enter a theme name');
            return;
        }

        const newThemeId = `custom-${Date.now()}`;
        const newTheme = {
            id: newThemeId,
            name: customThemeName,
            description: 'Custom saved theme',
            colors: { ...customColors }
        };

        const newSavedSchemes = [...savedSchemes, newTheme];
        setSavedSchemes(newSavedSchemes);

        // Auto-select the new theme
        setSelectedColorScheme(newThemeId);

        // Clear name input? Or keep it? Let's keep it for now or clear it.
        setCustomThemeName('');

        // We probably also want to save the entire appearance settings immediately
        // or let the user click the main "Save Changes" button. 
        // For consistency with other actions, let's just update state and let user click global save.
    };

    const handleDeleteCustomTheme = (themeId, e) => {
        e.stopPropagation(); // Prevent selecting the theme while deleting
        const newSavedSchemes = savedSchemes.filter(s => s.id !== themeId);
        setSavedSchemes(newSavedSchemes);

        // If the deleted theme was selected, revert to default or null
        if (selectedColorScheme === themeId) {
            setSelectedColorScheme(null);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch both navbar links, categories and settings (for appearance) in parallel
            const [navResponse, catResponse, settingsResponse] = await Promise.all([
                api.getNavbarLinks().catch(() => ({ success: false })),
                api.getCategories().catch(() => ({ success: false, data: [] })),
                api.getSettings().catch(() => ({ success: false }))
            ]);

            const fetchedCategories = catResponse.success ? (catResponse.data || []) : [];
            setCategories(fetchedCategories);

            if (navResponse.success && navResponse.data?.navbar_links && navResponse.data.navbar_links.length > 0) {
                // Ensure all links have showOnNavbar property (default true for backwards compatibility)
                const linksWithVisibility = navResponse.data.navbar_links.map(link => ({
                    ...link,
                    showOnNavbar: link.showOnNavbar !== undefined ? link.showOnNavbar : true
                }));
                setNavLinks(linksWithVisibility);
            } else {
                // Use defaults with fetched categories
                setNavLinks(getDefaultNavLinks(fetchedCategories));
            }

            if (settingsResponse.success && settingsResponse.data) {
                const store = settingsResponse.data;
                // Initialize appearance with fetched data or defaults
                // Ensure appearance is an object (handle if it comes as string)
                let fetchedAppearance = store.appearance || {};
                if (typeof fetchedAppearance === 'string') {
                    try {
                        fetchedAppearance = JSON.parse(fetchedAppearance);
                    } catch (e) {
                        console.error('Failed to parse appearance JSON:', e);
                        fetchedAppearance = {};
                    }
                }



                // If existing logo but no strict appearance setting for navbar, use existing logo
                const defaultNavbarLogo = store.logo || null;

                setAppearance({
                    navbar: {
                        logoType: fetchedAppearance.navbar?.logoType || (defaultNavbarLogo ? 'image' : 'text'),
                        logoUrl: fetchedAppearance.navbar?.logoUrl || defaultNavbarLogo,
                        logoText: fetchedAppearance.navbar?.logoText || store.name || 'Store',
                        logoHeight: fetchedAppearance.navbar?.logoHeight || 40,
                        textColor: fetchedAppearance.navbar?.textColor || '#000000',
                        backgroundColor: fetchedAppearance.navbar?.backgroundColor || '#ffffff',
                        linkColor: fetchedAppearance.navbar?.linkColor || '#374151',
                        hoverTextColor: fetchedAppearance.navbar?.hoverTextColor || '#4f46e5', // indigo-600
                        hoverBackgroundColor: fetchedAppearance.navbar?.hoverBackgroundColor || '#f9fafb', // gray-50
                        backgroundOpacity: fetchedAppearance.navbar?.backgroundOpacity ?? 100,
                        linkOpacity: fetchedAppearance.navbar?.linkOpacity ?? 100,
                        hoverTextOpacity: fetchedAppearance.navbar?.hoverTextOpacity ?? 100,
                        hoverBackgroundOpacity: fetchedAppearance.navbar?.hoverBackgroundOpacity ?? 100,
                        submenuBackgroundColor: fetchedAppearance.navbar?.submenuBackgroundColor || '#ffffff',
                        submenuBackgroundOpacity: fetchedAppearance.navbar?.submenuBackgroundOpacity ?? 100,
                        submenuLinkColor: fetchedAppearance.navbar?.submenuLinkColor || '#374151',
                        submenuLinkOpacity: fetchedAppearance.navbar?.submenuLinkOpacity ?? 100,
                        submenuHoverTextColor: fetchedAppearance.navbar?.submenuHoverTextColor || '#4f46e5',
                        submenuHoverTextOpacity: fetchedAppearance.navbar?.submenuHoverTextOpacity ?? 100,
                        submenuHoverBackgroundColor: fetchedAppearance.navbar?.submenuHoverBackgroundColor || '#f9fafb',
                        submenuHoverBackgroundOpacity: fetchedAppearance.navbar?.submenuHoverBackgroundOpacity ?? 100,
                    },
                    footer: {
                        logoType: fetchedAppearance.footer?.logoType || 'text',
                        logoUrl: fetchedAppearance.footer?.logoUrl || null, // Footer might not have a default logo separate from main
                        logoText: fetchedAppearance.footer?.logoText || store.name || 'Store',
                        logoHeight: fetchedAppearance.footer?.logoHeight || 40,
                        description: fetchedAppearance.footer?.description || '', // Added description
                        // Legal Pages
                        legal: {
                            privacyPolicy: fetchedAppearance.footer?.legal?.privacyPolicy || `<h2>Privacy Policy</h2><p>Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p><p>Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our online store.</p><h3>Information We Collect</h3><p>We may collect personal information that you voluntarily provide to us when you:</p><ul><li>Register an account on our store</li><li>Place an order or make a purchase</li><li>Subscribe to our newsletter</li><li>Contact us with inquiries or feedback</li></ul><p>This information may include your name, email address, phone number, shipping address, billing address, and payment information.</p><h3>How We Use Your Information</h3><p>We use the information we collect to:</p><ul><li>Process and fulfill your orders</li><li>Send you order confirmations and shipping updates</li><li>Respond to your inquiries and provide customer support</li><li>Send promotional communications (with your consent)</li><li>Improve our website, products, and services</li><li>Prevent fraudulent transactions and protect against illegal activity</li></ul><h3>Information Sharing</h3><p>We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website, processing payments, and delivering orders.</p><h3>Data Security</h3><p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p><h3>Your Rights</h3><p>You have the right to access, correct, or delete your personal information. You may also opt out of receiving marketing communications at any time by using the unsubscribe link in our emails.</p><h3>Contact Us</h3><p>If you have any questions about this Privacy Policy, please contact us through our Contact page.</p>`,
                            termsOfService: fetchedAppearance.footer?.legal?.termsOfService || `<h2>Terms of Service</h2><p>Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p><p>Please read these Terms of Service carefully before using our online store. By accessing or using our website, you agree to be bound by these terms.</p><h3>General Terms</h3><p>We reserve the right to refuse service to anyone for any reason at any time. You agree not to reproduce, duplicate, copy, sell, or exploit any portion of our service without express written permission.</p><h3>Products & Services</h3><p>We have made every effort to display the colors, images, and descriptions of our products as accurately as possible. We do not guarantee that your monitor's display of any color will be accurate. We reserve the right to limit the quantities of any products or services that we offer.</p><h3>Pricing</h3><p>All prices are listed in the currency displayed on the website and are subject to change without notice. We reserve the right to modify or discontinue any product without notice. We shall not be liable to you or any third party for any modification, price change, or discontinuance of a product.</p><h3>Orders & Payment</h3><p>We reserve the right to refuse any order you place with us. Payment must be received in full before an order is shipped. We accept Cash on Delivery (COD) and other payment methods as displayed at checkout.</p><h3>Shipping & Delivery</h3><p>Shipping times are estimates and are not guaranteed. We are not responsible for delays caused by the shipping carrier or customs. Risk of loss and title for items pass to you upon delivery to the carrier.</p><h3>Returns & Refunds</h3><p>If you are not satisfied with your purchase, please contact us within 7 days of receiving your order. Items must be returned in their original condition and packaging. Refunds will be processed within 5-10 business days after we receive the returned item.</p><h3>Limitation of Liability</h3><p>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of our services or products.</p><h3>Changes to Terms</h3><p>We reserve the right to update or modify these Terms of Service at any time without prior notice. Your continued use of the website after any changes constitutes acceptance of the new terms.</p><h3>Contact Us</h3><p>If you have any questions about these Terms of Service, please contact us through our Contact page.</p>`,
                            cookiePolicy: fetchedAppearance.footer?.legal?.cookiePolicy || `<h2>Cookie Policy</h2><p>Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p><p>This Cookie Policy explains how we use cookies and similar technologies when you visit our online store.</p><h3>What Are Cookies?</h3><p>Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help the website remember your preferences and improve your browsing experience.</p><h3>How We Use Cookies</h3><p>We use the following types of cookies:</p><ul><li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They enable core features like shopping cart functionality, secure checkout, and account authentication.</li><li><strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact with our website by collecting information about pages visited, time spent on the site, and any errors encountered.</li><li><strong>Functional Cookies:</strong> These cookies allow our website to remember choices you make (such as your language or region) and provide enhanced, personalized features.</li><li><strong>Marketing Cookies:</strong> These cookies are used to deliver relevant advertisements and track the effectiveness of our marketing campaigns.</li></ul><h3>Managing Cookies</h3><p>Most web browsers allow you to control cookies through their settings. You can choose to block or delete cookies, but please note that doing so may affect the functionality of our website and your shopping experience.</p><h3>Third-Party Cookies</h3><p>Some cookies on our website are set by third-party services such as analytics providers and payment processors. We do not control these cookies and recommend reviewing the privacy policies of these third parties.</p><h3>Updates to This Policy</h3><p>We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this policy periodically.</p><h3>Contact Us</h3><p>If you have any questions about our use of cookies, please contact us through our Contact page.</p>`
                        },
                        textColor: fetchedAppearance.footer?.textColor || '#FFFFFF',
                        backgroundColor: fetchedAppearance.footer?.backgroundColor || '#111827', // Default gray-900
                    },
                    colorScheme: fetchedAppearance.colorScheme || null,
                    aboutUs: {
                        headline: fetchedAppearance.aboutUs?.headline || 'Welcome to Our Store',
                        highlightText: fetchedAppearance.aboutUs?.highlightText || 'Our Story',
                        description: fetchedAppearance.aboutUs?.description || 'We are passionate about providing high-quality products and exceptional customer service. Our mission is to deliver the best shopping experience with carefully curated products that meet the highest standards of quality and design.',
                        mission: fetchedAppearance.aboutUs?.mission || 'Our mission is to deliver exceptional products and outstanding service to our customers. We believe in quality, integrity, and creating lasting relationships with every customer we serve.',
                        features: fetchedAppearance.aboutUs?.features || [
                            { emoji: '⭐', title: 'Premium Quality', description: 'We source only the finest quality products for our customers.' },
                            { emoji: '🚚', title: 'Fast Delivery', description: 'Quick and reliable shipping to your doorstep.' },
                            { emoji: '💯', title: 'Satisfaction Guaranteed', description: 'Your satisfaction is our top priority.' },
                            { emoji: '🛡️', title: 'Secure Shopping', description: 'Safe and secure checkout for your peace of mind.' }
                        ],
                        stats: fetchedAppearance.aboutUs?.stats || [
                            { value: '1000+', label: 'Happy Customers' },
                            { value: '500+', label: 'Products' },
                            { value: '100%', label: 'Quality Assured' },
                            { value: '24/7', label: 'Support' }
                        ],
                        showFeatures: fetchedAppearance.aboutUs?.showFeatures !== false,
                        showStats: fetchedAppearance.aboutUs?.showStats !== false,
                        showMission: fetchedAppearance.aboutUs?.showMission !== false
                    },
                    contactUs: {
                        heading: fetchedAppearance.contactUs?.heading || 'Get In Touch',
                        description: fetchedAppearance.contactUs?.description || 'Have questions about our products? Need help with an order? We\'re here to help!',
                        bannerText: fetchedAppearance.contactUs?.bannerText || 'We\'d love to hear from you! Whether you need help with an order, have questions about our products, or just want to say hello, our team is here to assist you.',
                        businessHours: fetchedAppearance.contactUs?.businessHours || 'Mon-Sat: 9:00 AM - 6:00 PM',
                        subjects: fetchedAppearance.contactUs?.subjects || [
                            'Product Inquiry',
                            'Order Status',
                            'Returns & Refunds',
                            'Bulk Order',
                            'General Inquiry'
                        ],
                        showForm: fetchedAppearance.contactUs?.showForm !== false,
                        showBanner: fetchedAppearance.contactUs?.showBanner !== false
                    }
                });

                // Load custom variant types
                if (fetchedAppearance.customVariantTypes && Array.isArray(fetchedAppearance.customVariantTypes)) {
                    setCustomVariantTypes(fetchedAppearance.customVariantTypes);
                }

                // Load saved custom schemes
                if (fetchedAppearance.savedSchemes && Array.isArray(fetchedAppearance.savedSchemes)) {
                    setSavedSchemes(fetchedAppearance.savedSchemes);
                }

                // Set selected color scheme from saved settings
                if (fetchedAppearance.colorScheme?.id) {
                    setSelectedColorScheme(fetchedAppearance.colorScheme.id);
                    // If it's the current 'custom' editing state
                    if (fetchedAppearance.colorScheme.id === 'custom' && fetchedAppearance.colorScheme.colors) {
                        setCustomColors(fetchedAppearance.colorScheme.colors);
                    }
                    // If it's one of the saved custom schemes, load its colors into customColors for editing
                    // (Optional: depending on UX, maybe we want to load it into customColors only if we explicitly edit it)
                    // For now, let's keep the logic simple: if the ID matches a saved scheme, we might want to load it.
                    // But 'selectedColorScheme' is just the ID. 
                    const savedScheme = fetchedAppearance.savedSchemes?.find(s => s.id === fetchedAppearance.colorScheme.id);
                    if (savedScheme) {
                        setCustomColors(savedScheme.colors);
                        // Also set the name so it shows up
                        setCustomThemeName(savedScheme.name);
                    }
                }
            }

        } catch (error) {
            console.error('Failed to fetch data:', error);
            setNavLinks(getDefaultNavLinks([]));
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let updatedAppearance = { ...appearance };

            // Upload Navbar Logo if changed
            if (logoFile) {
                const uploadRes = await api.uploadAppearanceLogo(logoFile);
                if (uploadRes.success) {
                    updatedAppearance.navbar.logoUrl = uploadRes.data.logo;
                    // Also update main store logo for consistency if it's the navbar logo
                    // (Optional: depends on if we want to sync them)
                }
            }

            // Upload Footer Logo if changed
            if (footerLogoFile) {
                const uploadRes = await api.uploadAppearanceLogo(footerLogoFile);
                if (uploadRes.success) {
                    updatedAppearance.footer.logoUrl = uploadRes.data.logo;
                }
            }

            // Add color scheme to appearance if selected
            if (selectedColorScheme) {
                if (selectedColorScheme === 'custom') {
                    // This is the "temporary" custom one being edited right now
                    updatedAppearance.colorScheme = {
                        id: 'custom',
                        name: 'Custom Theme',
                        description: 'Your currently edited custom colors',
                        colors: customColors
                    };
                } else {
                    // Check if it's a saved custom scheme
                    const savedScheme = savedSchemes.find(s => s.id === selectedColorScheme);
                    if (savedScheme) {
                        // We can update the saved scheme with current customColors if it's selected
                        // This allows "editing" a saved scheme
                        savedScheme.colors = customColors; // Update the color values in local state ref (be careful with mutation)

                        // Better: Map it in the savedSchemes array to update it
                        const updatedSavedSchemes = savedSchemes.map(s => s.id === selectedColorScheme ? { ...s, colors: customColors } : s);
                        updatedAppearance.savedSchemes = updatedSavedSchemes;
                        setSavedSchemes(updatedSavedSchemes); // Update local state too

                        updatedAppearance.colorScheme = { ...savedScheme, colors: customColors };

                    } else {
                        // It's a preset scheme
                        const scheme = colorSchemes.find(s => s.id === selectedColorScheme);
                        if (scheme) {
                            updatedAppearance.colorScheme = scheme;
                        }
                    }
                }
            } else {
                updatedAppearance.colorScheme = null;
            }

            // Always save the list of saved schemes
            // Ensure we don't overwrite if we didn't update it above
            if (!updatedAppearance.savedSchemes) {
                updatedAppearance.savedSchemes = savedSchemes;
            }



            // Add custom variant types to appearance
            updatedAppearance.customVariantTypes = customVariantTypes;

            // Save Navbar Links
            const navResponse = await api.updateNavbarLinks(navLinks);

            // Save Appearance Settings
            const settingsResponse = await api.updateSettings({
                appearance: updatedAppearance
            });

            if (navResponse.success && settingsResponse.success) {
                setAppearance(updatedAppearance);
                setLogoFile(null);
                setFooterLogoFile(null);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                console.error('Save failed:', navResponse, settingsResponse);
                alert('Failed to save settings. Please try again.');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const generateId = () => `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const addNavLink = () => {
        const newLink = {
            id: generateId(),
            label: 'New Link',
            href: '/',
            showOnNavbar: true,
            sublinks: []
        };
        setNavLinks([...navLinks, newLink]);
        setEditingLink(newLink.id);
    };

    // Sync categories - rebuild all category links from current categories
    const syncCategoriesWithNavbar = () => {
        const homeLink = { id: 'home', label: 'Home', href: '/', showOnNavbar: true, sublinks: [] };
        const aboutLink = { id: 'about', label: 'About', href: '/about', showOnNavbar: true, sublinks: [] };
        const contactLink = { id: 'contact', label: 'Contact Us', href: '/contact', showOnNavbar: true, sublinks: [] };

        if (categories.length === 0) {
            // No categories - show generic Categories link
            setNavLinks([
                homeLink,
                { id: 'categories', label: 'Categories', href: '/shop', showOnNavbar: true, sublinks: [] },
                aboutLink,
                contactLink
            ]);
        } else {
            // Build category links from fetched categories
            const categoryLinks = categories.map(cat => ({
                id: `cat-${cat.id || cat.name.toLowerCase().replace(/\s+/g, '')}`,
                label: cat.name,
                href: generateCategoryHref(cat.name),
                showOnNavbar: true,
                sublinks: (cat.subcategories || []).map(subcat => ({
                    id: `subcat-${subcat.toLowerCase().replace(/\s+/g, '')}`,
                    label: subcat,
                    href: `${generateCategoryHref(cat.name)}?subcategory=${subcat.toLowerCase().replace(/\s+/g, '-')}`
                }))
            }));
            setNavLinks([homeLink, ...categoryLinks, aboutLink, contactLink]);
        }
    };

    const updateNavLink = (id, field, value) => {
        setNavLinks(navLinks.map(link =>
            link.id === id ? { ...link, [field]: value } : link
        ));
    };

    const deleteNavLink = (id) => {
        setNavLinks(navLinks.filter(link => link.id !== id));
        if (editingLink === id) setEditingLink(null);
    };

    const addSublink = (parentId) => {
        setNavLinks(navLinks.map(link => {
            if (link.id === parentId) {
                return {
                    ...link,
                    sublinks: [
                        ...link.sublinks,
                        { id: generateId(), label: 'Submenu Item', href: '/' }
                    ]
                };
            }
            return link;
        }));
    };

    const updateSublink = (parentId, sublinkId, field, value) => {
        setNavLinks(navLinks.map(link => {
            if (link.id === parentId) {
                return {
                    ...link,
                    sublinks: link.sublinks.map(sub =>
                        sub.id === sublinkId ? { ...sub, [field]: value } : sub
                    )
                };
            }
            return link;
        }));
    };

    const deleteSublink = (parentId, sublinkId) => {
        setNavLinks(navLinks.map(link => {
            if (link.id === parentId) {
                return {
                    ...link,
                    sublinks: link.sublinks.filter(sub => sub.id !== sublinkId)
                };
            }
            return link;
        }));
    };

    const moveLink = (index, direction) => {
        const newLinks = [...navLinks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newLinks.length) return;
        [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
        setNavLinks(newLinks);
    };

    // Helper to get current logo for preview
    const getPreviewLogo = () => {
        if (logoFile) return URL.createObjectURL(logoFile);
        return appearance.navbar.logoUrl;
    };

    const tabs = [
        {
            id: 'navbar',
            label: 'Navbar',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
            )
        },
        {
            id: 'footer',
            label: 'Footer',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        },
        {
            id: 'colorSchemes',
            label: 'Color Schemes',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            )
        },
        {
            id: 'customVariants',
            label: 'Custom Variants',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            id: 'reviews',
            label: 'Reviews',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            )
        },
        {
            id: 'aboutUs',
            label: 'About Us',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'contactUs',
            label: 'Contact Us',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading website settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customization</h1>
                    <p className="text-gray-500 mt-1">Customize your storefront appearance and navigation</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-500/25 disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Saving...
                        </>
                    ) : saveSuccess ? (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Saved!
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-100 p-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => !tab.comingSoon && setActiveTab(tab.id)}
                                disabled={tab.comingSoon}
                                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'} ${tab.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </div>
                                {tab.comingSoon && (
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Soon</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        {activeTab === 'navbar' && (
                            <div className="space-y-6">
                                {/* Navbar Logo & Branding Section */}
                                <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                                    <button
                                        onClick={() => toggleSection('branding')}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg border border-gray-200 text-indigo-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-sm font-semibold text-gray-900">Logo & Branding</h3>
                                                <p className="text-xs text-gray-500">Customize logo, mobile settings, and colors</p>
                                            </div>
                                        </div>
                                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection.branding ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {expandedSection.branding && (
                                        <div className="p-6 bg-white border-t border-gray-200">


                                            {/* Tabs */}
                                            <div className="flex border-b border-gray-200 mb-6">
                                                {['logo', 'mobile', 'colors'].map((tab) => (
                                                    <button
                                                        key={tab}
                                                        onClick={() => setBrandingTab(tab)}
                                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${brandingTab === tab
                                                            ? 'border-indigo-500 text-indigo-600'
                                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        {tab === 'logo' && 'Logo Type'}
                                                        {tab === 'mobile' && 'Mobile Setting'}
                                                        {tab === 'colors' && 'Navbar Color'}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Tab Content */}
                                            <div className="pt-2">
                                                {brandingTab === 'logo' && (
                                                    <div className="space-y-6">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Logo Type</label>
                                                            <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                                                                <button
                                                                    onClick={() => setAppearance({ ...appearance, navbar: { ...appearance.navbar, logoType: 'text' } })}
                                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${appearance.navbar.logoType === 'text' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                                >
                                                                    Text
                                                                </button>
                                                                <button
                                                                    onClick={() => setAppearance({ ...appearance, navbar: { ...appearance.navbar, logoType: 'image' } })}
                                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${appearance.navbar.logoType === 'image' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                                >
                                                                    Image
                                                                </button>
                                                                <button
                                                                    onClick={() => setAppearance({ ...appearance, navbar: { ...appearance.navbar, logoType: 'both' } })}
                                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${appearance.navbar.logoType === 'both' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                                >
                                                                    Both
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {appearance.navbar.logoType === 'text' ? (
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo Text</label>
                                                                    <input
                                                                        type="text"
                                                                        value={appearance.navbar.logoText}
                                                                        onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, logoText: e.target.value } })}
                                                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="color"
                                                                            value={appearance.navbar.textColor}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, textColor: e.target.value } })}
                                                                            className="w-10 h-10 rounded border border-gray-300 p-1 cursor-pointer"
                                                                        />
                                                                        <span className="text-sm text-gray-500">{appearance.navbar.textColor}</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Size (px)</label>
                                                                    <div className="flex items-center gap-4">
                                                                        <input
                                                                            type="range"
                                                                            min="12"
                                                                            max="48"
                                                                            value={appearance.navbar.textSize || 20}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, textSize: parseInt(e.target.value) } })}
                                                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                                        />
                                                                        <span className="text-sm font-medium w-12 text-right">{appearance.navbar.textSize || 20}px</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo Image</label>
                                                                    <div className="flex items-start gap-4">
                                                                        {(logoFile || appearance.navbar.logoUrl) && (
                                                                            <div className="w-24 h-24 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                                                                                <img
                                                                                    src={logoFile ? URL.createObjectURL(logoFile) : appearance.navbar.logoUrl}
                                                                                    alt="Logo Preview"
                                                                                    className="max-w-full max-h-full object-contain"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1 space-y-3">
                                                                            <div>
                                                                                <input
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    onChange={(e) => {
                                                                                        if (e.target.files[0]) setLogoFile(e.target.files[0]);
                                                                                    }}
                                                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                                                />
                                                                                <p className="text-xs text-gray-500 mt-1">Recommended: PNG or SVG, max 2MB</p>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-xs font-medium text-gray-500 mb-1">Or enter image URL</label>
                                                                                <input
                                                                                    type="text"
                                                                                    value={appearance.navbar.logoUrl || ''}
                                                                                    onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, logoUrl: e.target.value } })}
                                                                                    placeholder="https://example.com/logo.png"
                                                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {appearance.navbar.logoType === 'both' && (
                                                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo Text</label>
                                                                            <input
                                                                                type="text"
                                                                                value={appearance.navbar.logoText}
                                                                                onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, logoText: e.target.value } })}
                                                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                                                                            <div className="flex items-center gap-2">
                                                                                <input
                                                                                    type="color"
                                                                                    value={appearance.navbar.textColor}
                                                                                    onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, textColor: e.target.value } })}
                                                                                    className="w-10 h-10 rounded border border-gray-300 p-1 cursor-pointer"
                                                                                />
                                                                                <span className="text-sm text-gray-500">{appearance.navbar.textColor}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo Height (px)</label>
                                                                    <div className="flex items-center gap-4">
                                                                        <input
                                                                            type="range"
                                                                            min="20"
                                                                            max="100"
                                                                            value={appearance.navbar.logoHeight}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, logoHeight: parseInt(e.target.value) } })}
                                                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                                        />
                                                                        <span className="text-sm font-medium w-12 text-right">{appearance.navbar.logoHeight}px</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {brandingTab === 'mobile' && (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Logo Type</label>
                                                            <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                                                                <button
                                                                    onClick={() => setAppearance({ ...appearance, navbar: { ...appearance.navbar, mobileLogoType: 'text' } })}
                                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${appearance.navbar.mobileLogoType === 'text' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                                >
                                                                    Text
                                                                </button>
                                                                <button
                                                                    onClick={() => setAppearance({ ...appearance, navbar: { ...appearance.navbar, mobileLogoType: 'image' } })}
                                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${appearance.navbar.mobileLogoType === 'image' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                                >
                                                                    Image
                                                                </button>
                                                                <button
                                                                    onClick={() => setAppearance({ ...appearance, navbar: { ...appearance.navbar, mobileLogoType: 'both' } })}
                                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${appearance.navbar.mobileLogoType === 'both' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                                >
                                                                    Both
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Logo Height (px)</label>
                                                            <div className="flex items-center gap-4">
                                                                <input
                                                                    type="range"
                                                                    min="20"
                                                                    max="80"
                                                                    value={appearance.navbar.mobileLogoHeight || 30}
                                                                    onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, mobileLogoHeight: parseInt(e.target.value) } })}
                                                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                                />
                                                                <span className="text-sm font-medium w-12 text-right">{appearance.navbar.mobileLogoHeight || 30}px</span>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Text Size (px)</label>
                                                            <div className="flex items-center gap-4">
                                                                <input
                                                                    type="range"
                                                                    min="12"
                                                                    max="32"
                                                                    value={appearance.navbar.mobileTextSize || 18}
                                                                    onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, mobileTextSize: parseInt(e.target.value) } })}
                                                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                                />
                                                                <span className="text-sm font-medium w-12 text-right">{appearance.navbar.mobileTextSize || 18}px</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {brandingTab === 'colors' && (
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Main Navbar Colors</h3>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <input
                                                                            type="color"
                                                                            value={appearance.navbar.backgroundColor || '#ffffff'}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, backgroundColor: e.target.value } })}
                                                                            className="w-10 h-10 rounded border border-gray-300 p-1 cursor-pointer"
                                                                        />
                                                                        <span className="text-sm text-gray-500 uppercase">{appearance.navbar.backgroundColor || '#ffffff'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-500 w-12">Opacity</span>
                                                                        <input
                                                                            type="range"
                                                                            min="0"
                                                                            max="100"
                                                                            value={appearance.navbar.backgroundOpacity ?? 100}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, backgroundOpacity: parseInt(e.target.value) } })}
                                                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                                        />
                                                                        <span className="text-xs text-gray-500 w-8 text-right">{appearance.navbar.backgroundOpacity ?? 100}%</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Links Color</label>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <input
                                                                            type="color"
                                                                            value={appearance.navbar.linkColor || '#374151'}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, linkColor: e.target.value } })}
                                                                            className="w-10 h-10 rounded border border-gray-300 p-1 cursor-pointer"
                                                                        />
                                                                        <span className="text-sm text-gray-500 uppercase">{appearance.navbar.linkColor || '#374151'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-500 w-12">Opacity</span>
                                                                        <input
                                                                            type="range"
                                                                            min="0"
                                                                            max="100"
                                                                            value={appearance.navbar.linkOpacity ?? 100}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, linkOpacity: parseInt(e.target.value) } })}
                                                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                                        />
                                                                        <span className="text-xs text-gray-500 w-8 text-right">{appearance.navbar.linkOpacity ?? 100}%</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hover Text Color</label>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <input
                                                                            type="color"
                                                                            value={appearance.navbar.hoverTextColor || '#4f46e5'}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, hoverTextColor: e.target.value } })}
                                                                            className="w-10 h-10 rounded border border-gray-300 p-1 cursor-pointer"
                                                                        />
                                                                        <span className="text-sm text-gray-500 uppercase">{appearance.navbar.hoverTextColor || '#4f46e5'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-500 w-12">Opacity</span>
                                                                        <input
                                                                            type="range"
                                                                            min="0"
                                                                            max="100"
                                                                            value={appearance.navbar.hoverTextOpacity ?? 100}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, hoverTextOpacity: parseInt(e.target.value) } })}
                                                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                                        />
                                                                        <span className="text-xs text-gray-500 w-8 text-right">{appearance.navbar.hoverTextOpacity ?? 100}%</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hover Background Color</label>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <input
                                                                            type="color"
                                                                            value={appearance.navbar.hoverBackgroundColor || '#f9fafb'}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, hoverBackgroundColor: e.target.value } })}
                                                                            className="w-10 h-10 rounded border border-gray-300 p-1 cursor-pointer"
                                                                        />
                                                                        <span className="text-sm text-gray-500 uppercase">{appearance.navbar.hoverBackgroundColor || '#f9fafb'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-500 w-12">Opacity</span>
                                                                        <input
                                                                            type="range"
                                                                            min="0"
                                                                            max="100"
                                                                            value={appearance.navbar.hoverBackgroundOpacity ?? 100}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, hoverBackgroundOpacity: parseInt(e.target.value) } })}
                                                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                                        />
                                                                        <span className="text-xs text-gray-500 w-8 text-right">{appearance.navbar.hoverBackgroundOpacity ?? 100}%</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 border-t border-gray-100">
                                                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Submenu Colors</h3>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <input
                                                                            type="color"
                                                                            value={appearance.navbar.submenuBackgroundColor || '#ffffff'}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, submenuBackgroundColor: e.target.value } })}
                                                                            className="w-10 h-10 rounded border border-gray-300 p-1 cursor-pointer"
                                                                        />
                                                                        <span className="text-sm text-gray-500 uppercase">{appearance.navbar.submenuBackgroundColor || '#ffffff'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-500 w-12">Opacity</span>
                                                                        <input
                                                                            type="range"
                                                                            min="0"
                                                                            max="100"
                                                                            value={appearance.navbar.submenuBackgroundOpacity ?? 100}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, submenuBackgroundOpacity: parseInt(e.target.value) } })}
                                                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                                        />
                                                                        <span className="text-xs text-gray-500 w-8 text-right">{appearance.navbar.submenuBackgroundOpacity ?? 100}%</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Links Color</label>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <input
                                                                            type="color"
                                                                            value={appearance.navbar.submenuLinkColor || '#374151'}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, submenuLinkColor: e.target.value } })}
                                                                            className="w-10 h-10 rounded border border-gray-300 p-1 cursor-pointer"
                                                                        />
                                                                        <span className="text-sm text-gray-500 uppercase">{appearance.navbar.submenuLinkColor || '#374151'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-500 w-12">Opacity</span>
                                                                        <input
                                                                            type="range"
                                                                            min="0"
                                                                            max="100"
                                                                            value={appearance.navbar.submenuLinkOpacity ?? 100}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, submenuLinkOpacity: parseInt(e.target.value) } })}
                                                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                                        />
                                                                        <span className="text-xs text-gray-500 w-8 text-right">{appearance.navbar.submenuLinkOpacity ?? 100}%</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hover Text Color</label>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <input
                                                                            type="color"
                                                                            value={appearance.navbar.submenuHoverTextColor || '#4f46e5'}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, submenuHoverTextColor: e.target.value } })}
                                                                            className="w-10 h-10 rounded border border-gray-300 p-1 cursor-pointer"
                                                                        />
                                                                        <span className="text-sm text-gray-500 uppercase">{appearance.navbar.submenuHoverTextColor || '#4f46e5'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-500 w-12">Opacity</span>
                                                                        <input
                                                                            type="range"
                                                                            min="0"
                                                                            max="100"
                                                                            value={appearance.navbar.submenuHoverTextOpacity ?? 100}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, submenuHoverTextOpacity: parseInt(e.target.value) } })}
                                                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                                        />
                                                                        <span className="text-xs text-gray-500 w-8 text-right">{appearance.navbar.submenuHoverTextOpacity ?? 100}%</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hover background Color</label>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <input
                                                                            type="color"
                                                                            value={appearance.navbar.submenuHoverBackgroundColor || '#f9fafb'}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, submenuHoverBackgroundColor: e.target.value } })}
                                                                            className="w-10 h-10 rounded border border-gray-300 p-1 cursor-pointer"
                                                                        />
                                                                        <span className="text-sm text-gray-500 uppercase">{appearance.navbar.submenuHoverBackgroundColor || '#f9fafb'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-500 w-12">Opacity</span>
                                                                        <input
                                                                            type="range"
                                                                            min="0"
                                                                            max="100"
                                                                            value={appearance.navbar.submenuHoverBackgroundOpacity ?? 100}
                                                                            onChange={(e) => setAppearance({ ...appearance, navbar: { ...appearance.navbar, submenuHoverBackgroundOpacity: parseInt(e.target.value) } })}
                                                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                                        />
                                                                        <span className="text-xs text-gray-500 w-8 text-right">{appearance.navbar.submenuHoverBackgroundOpacity ?? 100}%</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Navigation Links Section */}
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => toggleSection('nav')}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg border border-gray-200 text-indigo-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                                </svg>
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-sm font-semibold text-gray-900">Navigation Links</h3>
                                                <p className="text-xs text-gray-500">Manage storefront menu items</p>
                                            </div>
                                        </div>
                                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection.nav ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {expandedSection.nav && (
                                        <div className="p-6 bg-white border-t border-gray-200">
                                            {/* Actions */}
                                            <div className="flex items-center justify-end gap-2 mb-6">
                                                <button
                                                    onClick={syncCategoriesWithNavbar}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors text-sm"
                                                    title="Rebuild navbar from current store categories"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Sync Categories
                                                </button>
                                                <button
                                                    onClick={addNavLink}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Add Link
                                                </button>
                                            </div>

                                            {/* Nav Links List */}
                                            <div className="space-y-3">
                                                {navLinks.length === 0 ? (
                                                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                        </svg>
                                                        <p className="text-gray-500 mb-4">No navigation links yet</p>
                                                        <button
                                                            onClick={addNavLink}
                                                            className="text-indigo-600 font-medium hover:text-indigo-700"
                                                        >
                                                            Add your first link
                                                        </button>
                                                    </div>
                                                ) : (
                                                    navLinks.map((link, index) => (
                                                        <div
                                                            key={link.id}
                                                            className="border border-gray-200 rounded-xl overflow-hidden"
                                                        >
                                                            {/* Main Link */}
                                                            <div className="p-4 bg-gray-50 flex items-center gap-3 transition-colors hover:bg-gray-100/50">
                                                                {/* Move Buttons */}
                                                                <div className="flex flex-col gap-1">
                                                                    <button
                                                                        onClick={() => moveLink(index, 'up')}
                                                                        disabled={index === 0}
                                                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => moveLink(index, 'down')}
                                                                        disabled={index === navLinks.length - 1}
                                                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                        </svg>
                                                                    </button>
                                                                </div>

                                                                {/* Link Fields */}
                                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                                                                        <input
                                                                            type="text"
                                                                            value={link.label}
                                                                            onChange={(e) => updateNavLink(link.id, 'label', e.target.value)}
                                                                            className="w-full h-9 px-3 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                                                            placeholder="Link Label"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-500 mb-1">URL</label>
                                                                        <input
                                                                            type="text"
                                                                            value={link.href}
                                                                            onChange={(e) => updateNavLink(link.id, 'href', e.target.value)}
                                                                            className="w-full h-9 px-3 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                                                            placeholder="/page-url"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Visibility Toggle */}
                                                                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors" title="Show on Navbar">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={link.showOnNavbar !== false}
                                                                        onChange={(e) => updateNavLink(link.id, 'showOnNavbar', e.target.checked)}
                                                                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                    />
                                                                    <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Show</span>
                                                                </label>

                                                                {/* Actions */}
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => addSublink(link.id)}
                                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                                        title="Add submenu"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteNavLink(link.id)}
                                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Delete link"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Sublinks */}
                                                            {link.sublinks && link.sublinks.length > 0 && (
                                                                <div className="p-4 pl-12 space-y-2 bg-gray-50/50 border-t border-gray-100">
                                                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                                        <span className="w-8 h-px bg-gray-200"></span>
                                                                        Dropdown Items
                                                                    </p>
                                                                    {link.sublinks.map((sublink) => (
                                                                        <div key={sublink.id} className="flex items-center gap-3">
                                                                            <div className="w-6 flex justify-center">
                                                                                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                                </svg>
                                                                            </div>
                                                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                                <input
                                                                                    type="text"
                                                                                    value={sublink.label}
                                                                                    onChange={(e) => updateSublink(link.id, sublink.id, 'label', e.target.value)}
                                                                                    className="w-full h-8 px-3 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                                                                    placeholder="Submenu Label"
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    value={sublink.href}
                                                                                    onChange={(e) => updateSublink(link.id, sublink.id, 'href', e.target.value)}
                                                                                    className="w-full h-8 px-3 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                                                                    placeholder="/submenu-url"
                                                                                />
                                                                            </div>
                                                                            <button
                                                                                onClick={() => deleteSublink(link.id, sublink.id)}
                                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>


                                {/* Consolidated Sticky Preview */}
                                <div className="sticky bottom-6 mt-8 z-10">
                                    <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-lg">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Live Preview</p>
                                        <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
                                            <div style={{ transform: 'scale(0.85)', transformOrigin: 'top left', width: '117.64%', height: '100%' }}>
                                                <Navbar
                                                    previewMode={true}
                                                    previewAppearance={appearance.navbar}
                                                    previewLinks={navLinks}
                                                    previewLogo={getPreviewLogo()}
                                                    previewColorScheme={appearance.colorScheme}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'footer' && (
                            <div className="space-y-6">
                                {/* Footer Tabs */}
                                <div className="flex border-b border-gray-200 mb-6">
                                    <button
                                        onClick={() => setFooterTab('branding')}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${footerTab === 'branding' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Branding
                                    </button>
                                    <button
                                        onClick={() => setFooterTab('description')}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${footerTab === 'description' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Description
                                    </button>
                                    <button
                                        onClick={() => setFooterTab('mobile')}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${footerTab === 'mobile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Mobile
                                    </button>
                                    <button
                                        onClick={() => setFooterTab('legal')}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${footerTab === 'legal' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Legal
                                    </button>
                                    <button
                                        onClick={() => setFooterTab('colors')}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${footerTab === 'colors' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Colors
                                    </button>
                                </div>

                                {/* Branding Tab */}
                                {footerTab === 'branding' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Logo Settings</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo Type</label>
                                                    <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                                                        <button
                                                            onClick={() => setAppearance({ ...appearance, footer: { ...appearance.footer, logoType: 'text' } })}
                                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${appearance.footer.logoType === 'text' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                        >
                                                            Text
                                                        </button>
                                                        <button
                                                            onClick={() => setAppearance({ ...appearance, footer: { ...appearance.footer, logoType: 'image' } })}
                                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${appearance.footer.logoType === 'image' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                        >
                                                            Image
                                                        </button>
                                                        <button
                                                            onClick={() => setAppearance({ ...appearance, footer: { ...appearance.footer, logoType: 'both' } })}
                                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${appearance.footer.logoType === 'both' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                        >
                                                            Both
                                                        </button>
                                                    </div>
                                                </div>

                                                {appearance.footer.logoType === 'text' ? (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo Text</label>
                                                        <input
                                                            type="text"
                                                            value={appearance.footer.logoText}
                                                            onChange={(e) => setAppearance({ ...appearance, footer: { ...appearance.footer, logoText: e.target.value } })}
                                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo Image</label>
                                                            <div className="flex items-start gap-4">
                                                                {(footerLogoFile || appearance.footer.logoUrl) && (
                                                                    <div className="w-24 h-24 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-800 overflow-hidden relative group">
                                                                        <img
                                                                            src={footerLogoFile ? URL.createObjectURL(footerLogoFile) : appearance.footer.logoUrl}
                                                                            alt="Footer Logo Preview"
                                                                            className="max-w-full max-h-full object-contain"
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 space-y-3">
                                                                    <div>
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={(e) => {
                                                                                if (e.target.files[0]) setFooterLogoFile(e.target.files[0]);
                                                                            }}
                                                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                                        />
                                                                        <p className="text-xs text-gray-500 mt-1">Recommended: PNG or SVG, transparent background</p>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Or enter image URL</label>
                                                                        <input
                                                                            type="text"
                                                                            value={appearance.footer.logoUrl || ''}
                                                                            onChange={(e) => setAppearance({ ...appearance, footer: { ...appearance.footer, logoUrl: e.target.value } })}
                                                                            placeholder="https://example.com/logo.png"
                                                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {appearance.footer.logoType === 'both' && (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Text</label>
                                                                <input
                                                                    type="text"
                                                                    value={appearance.footer.logoText}
                                                                    onChange={(e) => setAppearance({ ...appearance, footer: { ...appearance.footer, logoText: e.target.value } })}
                                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo Height (px)</label>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="range"
                                                            min="20"
                                                            max="100"
                                                            value={appearance.footer.logoHeight}
                                                            onChange={(e) => setAppearance({ ...appearance, footer: { ...appearance.footer, logoHeight: parseInt(e.target.value) } })}
                                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                        <span className="text-sm font-medium w-12 text-right">{appearance.footer.logoHeight}px</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Size (px)</label>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="range"
                                                            min="12"
                                                            max="48"
                                                            value={appearance.footer.textSize || 20}
                                                            onChange={(e) => setAppearance({ ...appearance, footer: { ...appearance.footer, textSize: parseInt(e.target.value) } })}
                                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                        <span className="text-sm font-medium w-12 text-right">{appearance.footer.textSize || 20}px</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Description Tab */}
                                {footerTab === 'description' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Brand Description</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Description Text</label>
                                                <textarea
                                                    rows={4}
                                                    value={appearance.footer.description || ''}
                                                    onChange={(e) => setAppearance({ ...appearance, footer: { ...appearance.footer, description: e.target.value } })}
                                                    placeholder="Your one-stop shop for quality products at great prices."
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">This text appears below your logo in the footer. Keep it concise.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Mobile Tab */}
                                {footerTab === 'mobile' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Mobile Settings</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Logo Type</label>
                                                    <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                                                        <button
                                                            onClick={() => setAppearance({ ...appearance, footer: { ...appearance.footer, mobileLogoType: 'text' } })}
                                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${appearance.footer.mobileLogoType === 'text' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                        >
                                                            Text
                                                        </button>
                                                        <button
                                                            onClick={() => setAppearance({ ...appearance, footer: { ...appearance.footer, mobileLogoType: 'image' } })}
                                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${appearance.footer.mobileLogoType === 'image' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                        >
                                                            Image
                                                        </button>
                                                        <button
                                                            onClick={() => setAppearance({ ...appearance, footer: { ...appearance.footer, mobileLogoType: 'both' } })}
                                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${appearance.footer.mobileLogoType === 'both' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                        >
                                                            Both
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Logo Height (px)</label>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="range"
                                                            min="20"
                                                            max="80"
                                                            value={appearance.footer.mobileLogoHeight || 30}
                                                            onChange={(e) => setAppearance({ ...appearance, footer: { ...appearance.footer, mobileLogoHeight: parseInt(e.target.value) } })}
                                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                        <span className="text-sm font-medium w-12 text-right">{appearance.footer.mobileLogoHeight || 30}px</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Text Size (px)</label>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="range"
                                                            min="12"
                                                            max="32"
                                                            value={appearance.footer.mobileTextSize || 18}
                                                            onChange={(e) => setAppearance({ ...appearance, footer: { ...appearance.footer, mobileTextSize: parseInt(e.target.value) } })}
                                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                        <span className="text-sm font-medium w-12 text-right">{appearance.footer.mobileTextSize || 18}px</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Legal Tab */}
                                {footerTab === 'legal' && (
                                    <div className="space-y-8">
                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-blue-700">
                                                        Content added here will be available at <strong>/policies/privacy-policy</strong>, <strong>/policies/terms-of-service</strong>, and <strong>/policies/cookie-policy</strong>.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Privacy Policy */}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Privacy Policy</h3>
                                            <div className="bg-white rounded-lg border border-gray-200">
                                                <ReactQuill
                                                    theme="snow"
                                                    value={appearance.footer.legal?.privacyPolicy || ''}
                                                    onChange={(content) => setAppearance({
                                                        ...appearance,
                                                        footer: {
                                                            ...appearance.footer,
                                                            legal: { ...appearance.footer.legal, privacyPolicy: content }
                                                        }
                                                    })}
                                                    className="h-64 mb-12"
                                                />
                                            </div>
                                        </div>

                                        {/* Terms of Service */}
                                        <div className="pt-6 border-t border-gray-100">
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Terms of Service</h3>
                                            <div className="bg-white rounded-lg border border-gray-200">
                                                <ReactQuill
                                                    theme="snow"
                                                    value={appearance.footer.legal?.termsOfService || ''}
                                                    onChange={(content) => setAppearance({
                                                        ...appearance,
                                                        footer: {
                                                            ...appearance.footer,
                                                            legal: { ...appearance.footer.legal, termsOfService: content }
                                                        }
                                                    })}
                                                    className="h-64 mb-12"
                                                />
                                            </div>
                                        </div>

                                        {/* Cookie Policy */}
                                        <div className="pt-6 border-t border-gray-100">
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Cookie Policy</h3>
                                            <div className="bg-white rounded-lg border border-gray-200">
                                                <ReactQuill
                                                    theme="snow"
                                                    value={appearance.footer.legal?.cookiePolicy || ''}
                                                    onChange={(content) => setAppearance({
                                                        ...appearance,
                                                        footer: {
                                                            ...appearance.footer,
                                                            legal: { ...appearance.footer.legal, cookiePolicy: content }
                                                        }
                                                    })}
                                                    className="h-64 mb-12"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Legal Tab */}
                                {footerTab === 'legal' && (
                                    <div className="space-y-8">
                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-blue-700">
                                                        Content added here will be available at <strong>/policies/privacy-policy</strong>, <strong>/policies/terms-of-service</strong>, and <strong>/policies/cookie-policy</strong>.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Privacy Policy */}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Privacy Policy</h3>
                                            <div className="bg-white rounded-lg border border-gray-200">
                                                <ReactQuill
                                                    theme="snow"
                                                    value={appearance.footer.legal?.privacyPolicy || ''}
                                                    onChange={(content) => setAppearance({
                                                        ...appearance,
                                                        footer: {
                                                            ...appearance.footer,
                                                            legal: { ...appearance.footer.legal, privacyPolicy: content }
                                                        }
                                                    })}
                                                    className="h-64 mb-12"
                                                />
                                            </div>
                                        </div>

                                        {/* Terms of Service */}
                                        <div className="pt-6 border-t border-gray-100">
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Terms of Service</h3>
                                            <div className="bg-white rounded-lg border border-gray-200">
                                                <ReactQuill
                                                    theme="snow"
                                                    value={appearance.footer.legal?.termsOfService || ''}
                                                    onChange={(content) => setAppearance({
                                                        ...appearance,
                                                        footer: {
                                                            ...appearance.footer,
                                                            legal: { ...appearance.footer.legal, termsOfService: content }
                                                        }
                                                    })}
                                                    className="h-64 mb-12"
                                                />
                                            </div>
                                        </div>

                                        {/* Cookie Policy */}
                                        <div className="pt-6 border-t border-gray-100">
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Cookie Policy</h3>
                                            <div className="bg-white rounded-lg border border-gray-200">
                                                <ReactQuill
                                                    theme="snow"
                                                    value={appearance.footer.legal?.cookiePolicy || ''}
                                                    onChange={(content) => setAppearance({
                                                        ...appearance,
                                                        footer: {
                                                            ...appearance.footer,
                                                            legal: { ...appearance.footer.legal, cookiePolicy: content }
                                                        }
                                                    })}
                                                    className="h-64 mb-12"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Colors Tab */}
                                {footerTab === 'colors' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Color Settings</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={appearance.footer.textColor}
                                                            onChange={(e) => setAppearance({ ...appearance, footer: { ...appearance.footer, textColor: e.target.value } })}
                                                            className="w-10 h-10 rounded border border-gray-300 p-1 cursor-pointer"
                                                        />
                                                        <span className="text-sm text-gray-500 uppercase">{appearance.footer.textColor}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={appearance.footer.backgroundColor}
                                                            onChange={(e) => setAppearance({ ...appearance, footer: { ...appearance.footer, backgroundColor: e.target.value } })}
                                                            className="w-10 h-10 rounded border border-gray-300 p-1 cursor-pointer"
                                                        />
                                                        <span className="text-sm text-gray-500 uppercase">{appearance.footer.backgroundColor}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'colorSchemes' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 mb-2">Store Color Schemes</h2>
                                    <p className="text-sm text-gray-500 mb-6">Choose a color scheme that matches your brand. These colors will be applied across your storefront.</p>
                                </div>

                                {/* Custom Color Scheme Section */}
                                <div className="mb-8">
                                    <div
                                        onClick={() => setSelectedColorScheme('custom')}
                                        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${selectedColorScheme === 'custom'
                                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10 bg-indigo-50/10'
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${selectedColorScheme === 'custom' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">Custom Color Scheme</h3>
                                                    <p className="text-sm text-gray-500">Create your own unique color palette for your store</p>
                                                </div>
                                            </div>

                                            {selectedColorScheme === 'custom' && (
                                                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Custom Theme Preview/Editor inside the card if selected */}
                                        {selectedColorScheme === 'custom' && (
                                            <div className="mt-6 pt-6 border-t border-gray-200/60 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="flex items-end gap-3 mb-6">
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Color Scheme Name</label>
                                                        <input
                                                            type="text"
                                                            value={customThemeName}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => setCustomThemeName(e.target.value)}
                                                            placeholder="My Custom Color Scheme"
                                                            className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSaveCustomTheme();
                                                        }}
                                                        className="px-4 h-10 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                                    >
                                                        Save Color Scheme
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                                    {Object.entries(customColors).map(([key, value]) => (
                                                        <div key={key} className="space-y-2">
                                                            <div className="w-full aspect-square rounded-lg shadow-sm border border-gray-200 p-1 relative group overflow-hidden bg-white">
                                                                <div
                                                                    className="w-full h-full rounded bg-transparent transition-colors"
                                                                    style={{ backgroundColor: value }}
                                                                />
                                                                <input
                                                                    type="color"
                                                                    value={value}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onChange={(e) => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                                                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-xs font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                                <p className="text-[10px] text-gray-400 uppercase font-mono bg-gray-50 rounded px-1 py-0.5 inline-block">{value}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Color Scheme Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {/* Saved Custom Schemes */}
                                    {savedSchemes.map((scheme) => (
                                        <button
                                            key={scheme.id}
                                            onClick={() => setSelectedColorScheme(scheme.id)}
                                            className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 text-left ${selectedColorScheme === scheme.id
                                                ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10'
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                {/* Color Preview */}
                                                <div className="flex-1">
                                                    {/* Main color bar */}
                                                    <div
                                                        className="h-16 rounded-xl mb-2 flex items-center justify-center overflow-hidden shadow-inner w-full"
                                                        style={{ backgroundColor: scheme.colors.background }}
                                                    >
                                                        <div
                                                            className="px-4 py-2 rounded-lg font-medium text-sm shadow-md transform group-hover:scale-105 transition-transform"
                                                            style={{
                                                                backgroundColor: scheme.colors.primary,
                                                                color: scheme.colors.buttonText
                                                            }}
                                                        >
                                                            Button
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Delete Button */}
                                                <div
                                                    onClick={(e) => handleDeleteCustomTheme(scheme.id, e)}
                                                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete Theme"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Color swatches */}
                                            <div className="flex gap-1.5 mb-4">
                                                <div
                                                    className="flex-1 h-6 rounded-md shadow-sm ring-1 ring-black/5"
                                                    style={{ backgroundColor: scheme.colors.primary }}
                                                    title="Primary"
                                                />
                                                <div
                                                    className="flex-1 h-6 rounded-md shadow-sm ring-1 ring-black/5"
                                                    style={{ backgroundColor: scheme.colors.secondary }}
                                                    title="Secondary"
                                                />
                                                <div
                                                    className="flex-1 h-6 rounded-md shadow-sm ring-1 ring-black/5"
                                                    style={{ backgroundColor: scheme.colors.accent }}
                                                    title="Accent"
                                                />
                                                <div
                                                    className="flex-1 h-6 rounded-md shadow-sm ring-1 ring-black/5"
                                                    style={{ backgroundColor: scheme.colors.text }}
                                                    title="Text"
                                                />
                                            </div>

                                            {/* Scheme Info */}
                                            <div>
                                                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {scheme.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-0.5">{scheme.description}</p>
                                            </div>

                                            {/* Selected Badge */}
                                            {selectedColorScheme === scheme.id && (
                                                <div className="absolute -top-2 -left-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg pointer-events-none">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}

                                    {/* Preset Schemes */}
                                    {colorSchemes.filter(s => s.id !== 'custom').map((scheme) => (
                                        <button
                                            key={scheme.id}
                                            onClick={() => setSelectedColorScheme(scheme.id)}
                                            className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 text-left ${selectedColorScheme === scheme.id
                                                ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10'
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                                }`}
                                        >
                                            {/* Selected Badge */}
                                            {selectedColorScheme === scheme.id && (
                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Color Preview */}
                                            <div className="mb-4">
                                                {/* Main color bar */}
                                                <div
                                                    className="h-16 rounded-xl mb-2 flex items-center justify-center overflow-hidden shadow-inner"
                                                    style={{ backgroundColor: scheme.colors.background }}
                                                >
                                                    <div
                                                        className="px-4 py-2 rounded-lg font-medium text-sm shadow-md transform group-hover:scale-105 transition-transform"
                                                        style={{
                                                            backgroundColor: scheme.colors.primary,
                                                            color: scheme.colors.buttonText
                                                        }}
                                                    >
                                                        Button
                                                    </div>
                                                </div>

                                                {/* Color swatches */}
                                                <div className="flex gap-1.5">
                                                    <div
                                                        className="flex-1 h-6 rounded-md shadow-sm ring-1 ring-black/5"
                                                        style={{ backgroundColor: scheme.colors.primary }}
                                                        title="Primary"
                                                    />
                                                    <div
                                                        className="flex-1 h-6 rounded-md shadow-sm ring-1 ring-black/5"
                                                        style={{ backgroundColor: scheme.colors.secondary }}
                                                        title="Secondary"
                                                    />
                                                    <div
                                                        className="flex-1 h-6 rounded-md shadow-sm ring-1 ring-black/5"
                                                        style={{ backgroundColor: scheme.colors.accent }}
                                                        title="Accent"
                                                    />
                                                    <div
                                                        className="flex-1 h-6 rounded-md shadow-sm ring-1 ring-black/5"
                                                        style={{ backgroundColor: scheme.colors.text }}
                                                        title="Text"
                                                    />
                                                </div>
                                            </div>

                                            {/* Scheme Info */}
                                            <div>
                                                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {scheme.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-0.5">{scheme.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Selected Scheme Details */}
                                {/* Show editable pickers if it's a saved scheme OR 'custom' (though 'custom' is handled in the top card now, wait...) */}
                                {/* Actually, 'custom' is handled in the top card.
                                   But if we select a SAVED scheme, we probably want to allow editing it too.
                                   Let's re-use the picker UI for saved schemes here in the details panel. */}
                                {selectedColorScheme && selectedColorScheme !== 'custom' && (
                                    <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200">
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {savedSchemes.find(s => s.id === selectedColorScheme)?.name || colorSchemes.find(s => s.id === selectedColorScheme)?.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {savedSchemes.find(s => s.id === selectedColorScheme)?.description || colorSchemes.find(s => s.id === selectedColorScheme)?.description}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedColorScheme(null)}
                                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>

                                        {/* Color Details Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                            {/* Check if it is a saved scheme (editable) or a preset (static) */}
                                            {savedSchemes.some(s => s.id === selectedColorScheme) ? (
                                                /* Editable View for Saved Schemes */
                                                <>
                                                    {Object.entries(customColors).map(([key, value]) => (
                                                        <div key={key} className="space-y-2">
                                                            <div className="w-full aspect-square rounded-lg shadow-sm border border-gray-200 p-1 relative group overflow-hidden bg-white">
                                                                <div
                                                                    className="w-full h-full rounded bg-transparent transition-colors"
                                                                    style={{ backgroundColor: value }}
                                                                />
                                                                <input
                                                                    type="color"
                                                                    value={value}
                                                                    onChange={(e) => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                                                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-xs font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                                <p className="text-[10px] text-gray-400 uppercase font-mono">{value}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                /* Static View for Preset Schemes */
                                                Object.entries(colorSchemes.find(s => s.id === selectedColorScheme)?.colors || {}).map(([colorName, colorValue]) => (
                                                    <div key={colorName} className="text-center">
                                                        <div
                                                            className="w-full h-12 rounded-lg shadow-md ring-1 ring-black/10 mb-2"
                                                            style={{ backgroundColor: colorValue }}
                                                        />
                                                        <p className="text-xs font-medium text-gray-700 capitalize">{colorName.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                        <p className="text-xs text-gray-400 uppercase">{colorValue}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Preview Section */}
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <p className="text-sm font-medium text-gray-700 mb-4">Preview</p>
                                            <div
                                                className="p-6 rounded-xl"
                                                style={{
                                                    backgroundColor: savedSchemes.some(s => s.id === selectedColorScheme)
                                                        ? customColors.background
                                                        : colorSchemes.find(s => s.id === selectedColorScheme)?.colors.background
                                                }}
                                            >
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <h4
                                                        className="text-lg font-bold"
                                                        style={{
                                                            color: savedSchemes.some(s => s.id === selectedColorScheme)
                                                                ? customColors.text
                                                                : colorSchemes.find(s => s.id === selectedColorScheme)?.colors.text
                                                        }}
                                                    >
                                                        Sample Heading
                                                    </h4>
                                                    <button
                                                        className="px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-transform hover:scale-105"
                                                        style={{
                                                            backgroundColor: savedSchemes.some(s => s.id === selectedColorScheme)
                                                                ? customColors.primary
                                                                : colorSchemes.find(s => s.id === selectedColorScheme)?.colors.primary,
                                                            color: savedSchemes.some(s => s.id === selectedColorScheme)
                                                                ? customColors.buttonText
                                                                : colorSchemes.find(s => s.id === selectedColorScheme)?.colors.buttonText
                                                        }}
                                                    >
                                                        Primary Button
                                                    </button>
                                                    <button
                                                        className="px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-transform hover:scale-105"
                                                        style={{
                                                            backgroundColor: savedSchemes.some(s => s.id === selectedColorScheme)
                                                                ? customColors.secondary
                                                                : colorSchemes.find(s => s.id === selectedColorScheme)?.colors.secondary,
                                                            color: savedSchemes.some(s => s.id === selectedColorScheme)
                                                                ? customColors.buttonText
                                                                : colorSchemes.find(s => s.id === selectedColorScheme)?.colors.buttonText
                                                        }}
                                                    >
                                                        Secondary Button
                                                    </button>
                                                    <span
                                                        className="px-3 py-1 rounded-full text-sm font-medium"
                                                        style={{
                                                            backgroundColor: savedSchemes.some(s => s.id === selectedColorScheme)
                                                                ? customColors.accent
                                                                : colorSchemes.find(s => s.id === selectedColorScheme)?.colors.accent,
                                                            color: savedSchemes.some(s => s.id === selectedColorScheme)
                                                                ? customColors.buttonText
                                                                : colorSchemes.find(s => s.id === selectedColorScheme)?.colors.buttonText
                                                        }}
                                                    >
                                                        Accent Tag
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Info Box */}
                                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">How color schemes work</p>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Select a color scheme and save changes to apply it to your storefront. The colors will be used for buttons, links, backgrounds, and text throughout your store.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'customVariants' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 mb-2">Custom Variant Types</h2>
                                    <p className="text-sm text-gray-500 mb-6">
                                        Define custom product variants beyond standard sizes and colors. Examples: Dimensions, Liters, Material, Weight.
                                    </p>
                                </div>

                                {/* Add New Variant Type Form */}
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Add New Variant Type</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Variant Name</label>
                                            <input
                                                type="text"
                                                value={newVariantType.name}
                                                onChange={(e) => setNewVariantType({ ...newVariantType, name: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                                placeholder="e.g., Volume, Material, Weight"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Input Type</label>
                                            <select
                                                value={newVariantType.inputType}
                                                onChange={(e) => setNewVariantType({ ...newVariantType, inputType: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                            >
                                                <option value="select">Dropdown Options</option>
                                                <option value="text">Free Text</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {newVariantType.inputType === 'select' ? 'Options (comma-separated)' : 'Example Value'}
                                            </label>
                                            <input
                                                type="text"
                                                value={newVariantType.options}
                                                onChange={(e) => setNewVariantType({ ...newVariantType, options: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                                placeholder={newVariantType.inputType === 'select' ? "1L, 2L, 5L" : "e.g., 10x20x30cm"}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={() => {
                                                if (!newVariantType.name.trim()) return;
                                                const variantType = {
                                                    id: `variant-${Date.now()}`,
                                                    name: newVariantType.name.trim(),
                                                    inputType: newVariantType.inputType,
                                                    options: newVariantType.inputType === 'select'
                                                        ? newVariantType.options.split(',').map(o => o.trim()).filter(o => o)
                                                        : []
                                                };
                                                setCustomVariantTypes([...customVariantTypes, variantType]);
                                                setNewVariantType({ name: '', inputType: 'select', options: '' });
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-medium rounded-xl hover:bg-black transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add Variant Type
                                        </button>
                                    </div>
                                </div>

                                {/* Existing Variant Types List */}
                                {customVariantTypes.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        <p className="text-gray-500">No custom variant types defined yet.</p>
                                        <p className="text-sm text-gray-400 mt-1">Add a variant type above to get started.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-gray-900">Your Variant Types</h3>
                                        {customVariantTypes.map((variantType, index) => (
                                            <div
                                                key={variantType.id}
                                                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
                                            >
                                                {editingVariantType === variantType.id ? (
                                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                        <input
                                                            type="text"
                                                            value={variantType.name}
                                                            onChange={(e) => {
                                                                const updated = [...customVariantTypes];
                                                                updated[index].name = e.target.value;
                                                                setCustomVariantTypes(updated);
                                                            }}
                                                            className="px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 text-sm"
                                                        />
                                                        <select
                                                            value={variantType.inputType}
                                                            onChange={(e) => {
                                                                const updated = [...customVariantTypes];
                                                                updated[index].inputType = e.target.value;
                                                                setCustomVariantTypes(updated);
                                                            }}
                                                            className="px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 text-sm"
                                                        >
                                                            <option value="select">Dropdown</option>
                                                            <option value="text">Free Text</option>
                                                        </select>
                                                        {variantType.inputType === 'select' && (
                                                            <input
                                                                type="text"
                                                                value={variantType.options?.join(', ') || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...customVariantTypes];
                                                                    updated[index].options = e.target.value.split(',').map(o => o.trim()).filter(o => o);
                                                                    setCustomVariantTypes(updated);
                                                                }}
                                                                className="px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 text-sm"
                                                                placeholder="Options (comma-separated)"
                                                            />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-medium text-gray-900">{variantType.name}</span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${variantType.inputType === 'select' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                {variantType.inputType === 'select' ? 'Dropdown' : 'Text'}
                                                            </span>
                                                        </div>
                                                        {variantType.inputType === 'select' && variantType.options?.length > 0 && (
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                Options: {variantType.options.join(', ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 ml-4">
                                                    {editingVariantType === variantType.id ? (
                                                        <button
                                                            onClick={() => setEditingVariantType(null)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Done"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setEditingVariantType(variantType.id)}
                                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setCustomVariantTypes(customVariantTypes.filter(v => v.id !== variantType.id));
                                                            if (editingVariantType === variantType.id) setEditingVariantType(null);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Info Box */}
                                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">How custom variants work</p>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Custom variant types defined here will appear in the product creation form. When adding products, you can specify values for each variant type. Customers will see and select these variants on the storefront.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Customer Reviews</h2>
                                        <p className="text-sm text-gray-500">Manage reviews that appear on your storefront.</p>
                                    </div>
                                    {!editingReview && (
                                        <button
                                            onClick={() => {
                                                setReviewForm({
                                                    customer_name: '',
                                                    customer_image: '',
                                                    rating: 5,
                                                    title: '',
                                                    review_text: '',
                                                    product_name: '',
                                                    is_verified: true
                                                });
                                                setEditingReview('new');
                                            }}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add Review
                                        </button>
                                    )}
                                </div>

                                {editingReview ? (
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            {editingReview === 'new' ? 'New Review' : 'Edit Review'}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                                                    <input
                                                        type="text"
                                                        value={reviewForm.customer_name}
                                                        onChange={(e) => setReviewForm({ ...reviewForm, customer_name: e.target.value })}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                                                    <select
                                                        value={reviewForm.rating}
                                                        onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                    >
                                                        {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={reviewForm.customer_image || ''}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, customer_image: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Review Title</label>
                                                <input
                                                    type="text"
                                                    value={reviewForm.title}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Review Content</label>
                                                <textarea
                                                    rows={4}
                                                    value={reviewForm.review_text}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={reviewForm.product_name || ''}
                                                        onChange={(e) => setReviewForm({ ...reviewForm, product_name: e.target.value })}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div className="flex items-center pt-6">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={reviewForm.is_verified}
                                                            onChange={(e) => setReviewForm({ ...reviewForm, is_verified: e.target.checked })}
                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700">Verified Purchase</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                                <button
                                                    onClick={() => setEditingReview(null)}
                                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveReview}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                                >
                                                    {editingReview === 'new' ? 'Create Review' : 'Update Review'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {isReviewsLoading ? (
                                            <p className="text-center text-gray-500 py-8">Loading reviews...</p>
                                        ) : reviews.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <p className="text-gray-500">No reviews yet.</p>
                                                <button
                                                    onClick={() => {
                                                        setReviewForm({
                                                            customer_name: '',
                                                            rating: 5,
                                                            title: '',
                                                            review_text: '',
                                                            product_name: '',
                                                            is_verified: true
                                                        });
                                                        setEditingReview('new');
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-700 font-medium mt-2"
                                                >
                                                    Add your first review
                                                </button>
                                            </div>
                                        ) : (
                                            reviews.map(review => (
                                                <div key={review.id} className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4 hover:shadow-sm transition-shadow">
                                                    <div className="flex gap-4 w-full">
                                                        <div className="flex-shrink-0">
                                                            <img
                                                                src={review.customer_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.customer_name)}&background=random`}
                                                                alt={review.customer_name}
                                                                className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.customer_name)}&background=random`;
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                <div className="flex text-yellow-400">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                        </svg>
                                                                    ))}
                                                                </div>
                                                                <span className="font-semibold text-gray-900 truncate">{review.title}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{review.review_text}</p>
                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                                                <span>by {review.customer_name}</span>
                                                                {review.is_verified && (
                                                                    <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                                        Verified
                                                                    </span>
                                                                )}
                                                                {review.product_name && <span>on {review.product_name}</span>}
                                                                <span>• {new Date(review.review_date || review.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                                                        <button
                                                            onClick={() => {
                                                                setReviewForm({
                                                                    customer_name: review.customer_name || '',
                                                                    customer_image: review.customer_image || '',
                                                                    rating: review.rating || 5,
                                                                    title: review.title || '',
                                                                    review_text: review.review_text || '',
                                                                    product_name: review.product_name || '',
                                                                    is_verified: review.is_verified || false
                                                                });
                                                                setEditingReview(review);
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteReview(review.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* END REVIEWS TAB CONTENT */}

                        {/* ABOUT US TAB CONTENT */}
                        {activeTab === 'aboutUs' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900">About Us Page</h2>
                                <p className="text-sm text-gray-500">Customize the content displayed on your About Us page.</p>

                                {/* Hero Section */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Hero Section</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                                        <input
                                            type="text"
                                            value={appearance.aboutUs?.headline || ''}
                                            onChange={(e) => setAppearance({
                                                ...appearance,
                                                aboutUs: { ...appearance.aboutUs, headline: e.target.value }
                                            })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            placeholder="Welcome to Our Store"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Highlight Text</label>
                                        <input
                                            type="text"
                                            value={appearance.aboutUs?.highlightText || ''}
                                            onChange={(e) => setAppearance({
                                                ...appearance,
                                                aboutUs: { ...appearance.aboutUs, highlightText: e.target.value }
                                            })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            placeholder="Our Story"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">This text appears with accent color styling</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={appearance.aboutUs?.description || ''}
                                            onChange={(e) => setAppearance({
                                                ...appearance,
                                                aboutUs: { ...appearance.aboutUs, description: e.target.value }
                                            })}
                                            rows={4}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            placeholder="Tell your customers about your store..."
                                        />
                                    </div>
                                </div>

                                {/* Features Section */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Features</h3>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={appearance.aboutUs?.showFeatures !== false}
                                                onChange={(e) => setAppearance({
                                                    ...appearance,
                                                    aboutUs: { ...appearance.aboutUs, showFeatures: e.target.checked }
                                                })}
                                                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                            />
                                            <span className="text-sm text-gray-600">Show</span>
                                        </label>
                                    </div>
                                    {(appearance.aboutUs?.features || []).map((feature, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Emoji</label>
                                                <input
                                                    type="text"
                                                    value={feature.emoji}
                                                    onChange={(e) => {
                                                        const updated = [...appearance.aboutUs.features];
                                                        updated[index] = { ...updated[index], emoji: e.target.value };
                                                        setAppearance({ ...appearance, aboutUs: { ...appearance.aboutUs, features: updated } });
                                                    }}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-center text-lg"
                                                />
                                            </div>
                                            <div className="col-span-4">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    value={feature.title}
                                                    onChange={(e) => {
                                                        const updated = [...appearance.aboutUs.features];
                                                        updated[index] = { ...updated[index], title: e.target.value };
                                                        setAppearance({ ...appearance, aboutUs: { ...appearance.aboutUs, features: updated } });
                                                    }}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300"
                                                />
                                            </div>
                                            <div className="col-span-6">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                                                <input
                                                    type="text"
                                                    value={feature.description}
                                                    onChange={(e) => {
                                                        const updated = [...appearance.aboutUs.features];
                                                        updated[index] = { ...updated[index], description: e.target.value };
                                                        setAppearance({ ...appearance, aboutUs: { ...appearance.aboutUs, features: updated } });
                                                    }}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Stats Section */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Stats</h3>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={appearance.aboutUs?.showStats !== false}
                                                onChange={(e) => setAppearance({
                                                    ...appearance,
                                                    aboutUs: { ...appearance.aboutUs, showStats: e.target.checked }
                                                })}
                                                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                            />
                                            <span className="text-sm text-gray-600">Show</span>
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(appearance.aboutUs?.stats || []).map((stat, index) => (
                                            <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-2">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                                                    <input
                                                        type="text"
                                                        value={stat.value}
                                                        onChange={(e) => {
                                                            const updated = [...appearance.aboutUs.stats];
                                                            updated[index] = { ...updated[index], value: e.target.value };
                                                            setAppearance({ ...appearance, aboutUs: { ...appearance.aboutUs, stats: updated } });
                                                        }}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-center font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                                                    <input
                                                        type="text"
                                                        value={stat.label}
                                                        onChange={(e) => {
                                                            const updated = [...appearance.aboutUs.stats];
                                                            updated[index] = { ...updated[index], label: e.target.value };
                                                            setAppearance({ ...appearance, aboutUs: { ...appearance.aboutUs, stats: updated } });
                                                        }}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-center"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Mission Banner */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Mission Banner</h3>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={appearance.aboutUs?.showMission !== false}
                                                onChange={(e) => setAppearance({
                                                    ...appearance,
                                                    aboutUs: { ...appearance.aboutUs, showMission: e.target.checked }
                                                })}
                                                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                            />
                                            <span className="text-sm text-gray-600">Show</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mission Statement</label>
                                        <textarea
                                            value={appearance.aboutUs?.mission || ''}
                                            onChange={(e) => setAppearance({
                                                ...appearance,
                                                aboutUs: { ...appearance.aboutUs, mission: e.target.value }
                                            })}
                                            rows={3}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            placeholder="Your mission statement..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* END ABOUT US TAB CONTENT */}

                        {/* CONTACT US TAB CONTENT */}
                        {activeTab === 'contactUs' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900">Contact Us Page</h2>
                                <p className="text-sm text-gray-500">Customize the Contact Us page. Phone, email, WhatsApp, and address are pulled from your <strong>Settings</strong> page.</p>

                                {/* Header Section */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Page Header</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                                        <input
                                            type="text"
                                            value={appearance.contactUs?.heading || ''}
                                            onChange={(e) => setAppearance({
                                                ...appearance,
                                                contactUs: { ...appearance.contactUs, heading: e.target.value }
                                            })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            placeholder="Get In Touch"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={appearance.contactUs?.description || ''}
                                            onChange={(e) => setAppearance({
                                                ...appearance,
                                                contactUs: { ...appearance.contactUs, description: e.target.value }
                                            })}
                                            rows={3}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            placeholder="Have questions? We're here to help!"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
                                        <input
                                            type="text"
                                            value={appearance.contactUs?.businessHours || ''}
                                            onChange={(e) => setAppearance({
                                                ...appearance,
                                                contactUs: { ...appearance.contactUs, businessHours: e.target.value }
                                            })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            placeholder="Mon-Sat: 9:00 AM - 6:00 PM"
                                        />
                                    </div>
                                </div>

                                {/* Contact Form Subjects */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Contact Form</h3>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={appearance.contactUs?.showForm !== false}
                                                onChange={(e) => setAppearance({
                                                    ...appearance,
                                                    contactUs: { ...appearance.contactUs, showForm: e.target.checked }
                                                })}
                                                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                            />
                                            <span className="text-sm text-gray-600">Show</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject Options</label>
                                        <p className="text-xs text-gray-400 mb-3">These appear in the subject dropdown of the contact form.</p>
                                        {(appearance.contactUs?.subjects || []).map((subject, index) => (
                                            <div key={index} className="flex items-center gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={subject}
                                                    onChange={(e) => {
                                                        const updated = [...(appearance.contactUs?.subjects || [])];
                                                        updated[index] = e.target.value;
                                                        setAppearance({ ...appearance, contactUs: { ...appearance.contactUs, subjects: updated } });
                                                    }}
                                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const updated = (appearance.contactUs?.subjects || []).filter((_, i) => i !== index);
                                                        setAppearance({ ...appearance, contactUs: { ...appearance.contactUs, subjects: updated } });
                                                    }}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => {
                                                const updated = [...(appearance.contactUs?.subjects || []), 'New Subject'];
                                                setAppearance({ ...appearance, contactUs: { ...appearance.contactUs, subjects: updated } });
                                            }}
                                            className="mt-2 px-4 py-2 text-sm font-medium text-gray-700 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 w-full"
                                        >
                                            + Add Subject
                                        </button>
                                    </div>
                                </div>

                                {/* Banner Section */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Bottom Banner</h3>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={appearance.contactUs?.showBanner !== false}
                                                onChange={(e) => setAppearance({
                                                    ...appearance,
                                                    contactUs: { ...appearance.contactUs, showBanner: e.target.checked }
                                                })}
                                                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                            />
                                            <span className="text-sm text-gray-600">Show</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Text</label>
                                        <textarea
                                            value={appearance.contactUs?.bannerText || ''}
                                            onChange={(e) => setAppearance({
                                                ...appearance,
                                                contactUs: { ...appearance.contactUs, bannerText: e.target.value }
                                            })}
                                            rows={3}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            placeholder="A friendly message for your customers..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* END CONTACT US TAB CONTENT */}
                    </div>
                </div>
            </div>
        </div >
    );
}

export default function WebsiteIndex() {
    return (
        <DashboardLayout title="Customization" pageTitle="Customization">
            <CustomizationPage />
        </DashboardLayout>
    );
}
