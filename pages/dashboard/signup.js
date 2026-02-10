/**
 * Dashboard Signup Page
 * Create a new store account with premium UI
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '@/lib/dashboardAuth';
import api from '@/lib/api';

// Production domain for store URLs
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'websitse.com';

export default function SignupPage() {
    const router = useRouter();
    const { signup, isAuthenticated, isLoading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        storeName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Store name validation state
    const [slugPreview, setSlugPreview] = useState('');
    const [slugStatus, setSlugStatus] = useState('idle'); // idle, checking, available, taken, invalid
    const [slugError, setSlugError] = useState('');
    const [checkTimeout, setCheckTimeout] = useState(null);

    // Convert store name to slug
    const nameToSlug = useCallback((name) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50);
    }, []);

    // Check store name availability with debounce
    useEffect(() => {
        const storeName = formData.storeName.trim();

        if (!storeName) {
            setSlugPreview('');
            setSlugStatus('idle');
            setSlugError('');
            return;
        }

        const slug = nameToSlug(storeName);
        setSlugPreview(slug);

        if (slug.length < 3) {
            setSlugStatus('invalid');
            setSlugError('Store name must be at least 3 characters');
            return;
        }

        // Clear previous timeout
        if (checkTimeout) clearTimeout(checkTimeout);

        // Set status to checking
        setSlugStatus('checking');

        // Debounce the API call
        const timeout = setTimeout(async () => {
            try {
                const response = await api.checkSlugAvailability(slug);
                if (response.success) {
                    if (response.available) {
                        setSlugStatus('available');
                        setSlugError('');
                    } else {
                        setSlugStatus('taken');
                        setSlugError(response.error || 'This name is already taken');
                    }
                }
            } catch (err) {
                setSlugStatus('idle');
            }
        }, 500);

        setCheckTimeout(timeout);

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [formData.storeName, nameToSlug]);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, authLoading, router]);

    // Calculate password strength
    useEffect(() => {
        const password = formData.password;
        let strength = 0;

        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        setPasswordStrength(strength);
    }, [formData.password]);

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 0: return 'bg-gray-600';
            case 1: return 'bg-red-500';
            case 2: return 'bg-amber-500';
            case 3: return 'bg-yellow-500';
            case 4: return 'bg-emerald-500';
            default: return 'bg-gray-600';
        }
    };

    const getPasswordStrengthText = () => {
        switch (passwordStrength) {
            case 0: return '';
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Strong';
            default: return '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!formData.acceptTerms) {
            setError('Please accept the terms and conditions');
            return;
        }

        setIsLoading(true);

        try {
            const result = await signup(formData.storeName, formData.email, formData.password);

            if (result.success) {
                router.push('/dashboard');
            } else {
                setError(result.error || 'Signup failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Create Your Store | StoreBuilder</title>
                <meta name="description" content="Create your online store with StoreBuilder" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 relative overflow-hidden">
                {/* Animated Background Orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl"></div>
                </div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2MmgxMnptMC04di0ySDI0djJoMTJ6bTAtNC4wMDBWMTZIMjR2Mi4wMDBoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>

                {/* Signup Card */}
                <div className="relative w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-2xl shadow-purple-500/25 mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-white">Create your store</h1>
                        <p className="text-gray-400 mt-2">Start selling online in minutes</p>
                    </div>

                    {/* Card */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Error Message */}
                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {/* Store Name Input */}
                            <div>
                                <label htmlFor="storeName" className="block text-sm font-medium text-gray-300 mb-2">
                                    Store name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="storeName"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        placeholder="My Awesome Store"
                                        required
                                        className={`w-full h-12 px-4 pl-11 pr-11 rounded-xl bg-white/5 border text-white placeholder-gray-500
                             focus:ring-2 focus:bg-white/10 transition-all duration-200
                             ${slugStatus === 'available' ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20' :
                                                slugStatus === 'taken' || slugStatus === 'invalid' ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' :
                                                    'border-white/10 focus:border-purple-500 focus:ring-purple-500/20'}`}
                                    />
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    {/* Status indicator */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        {slugStatus === 'checking' && (
                                            <svg className="w-5 h-5 animate-spin text-purple-400" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        )}
                                        {slugStatus === 'available' && (
                                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                        {(slugStatus === 'taken' || slugStatus === 'invalid') && (
                                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                {/* URL Preview & Error */}
                                {slugPreview && (
                                    <div className="mt-2">
                                        <p className={`text-sm ${slugStatus === 'available' ? 'text-emerald-400' : slugStatus === 'taken' || slugStatus === 'invalid' ? 'text-red-400' : 'text-gray-400'}`}>
                                            {slugStatus === 'available' && '✓ '}
                                            {slugError || `Your store URL: ${slugPreview}.${MAIN_DOMAIN}`}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full h-12 px-4 pl-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500
                             focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:bg-white/10
                             transition-all duration-200"
                                    />
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
                                        className="w-full h-12 px-4 pl-11 pr-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500
                             focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:bg-white/10
                             transition-all duration-200"
                                    />
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1 flex-1 rounded-full transition-colors ${level <= passwordStrength ? getPasswordStrengthColor() : 'bg-gray-700'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-xs mt-1 ${getPasswordStrengthColor().replace('bg-', 'text-')}`}>
                                            {getPasswordStrengthText()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Input */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                    Confirm password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="w-full h-12 px-4 pl-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500
                             focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:bg-white/10
                             transition-all duration-200"
                                    />
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <div>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="acceptTerms"
                                        checked={formData.acceptTerms}
                                        onChange={handleChange}
                                        required
                                        className="w-4 h-4 mt-1 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/20 focus:ring-offset-0"
                                    />
                                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                        I agree to the{' '}
                                        <a href="#" className="text-purple-400 hover:text-purple-300">Terms of Service</a>
                                        {' '}and{' '}
                                        <a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold
                         hover:from-purple-600 hover:to-indigo-700 focus:ring-4 focus:ring-purple-500/30
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                         shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating your store...
                                    </span>
                                ) : (
                                    'Create store'
                                )}
                            </button>
                        </form>

                        {/* Sign In Link */}
                        <p className="text-center text-gray-400 text-sm mt-8">
                            Already have an account?{' '}
                            <Link href="/dashboard/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {/* Features */}
                    <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-2xl mb-1">🚀</div>
                            <p className="text-xs text-gray-400">Launch in minutes</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-2xl mb-1">💳</div>
                            <p className="text-xs text-gray-400">Accept payments</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-2xl mb-1">📦</div>
                            <p className="text-xs text-gray-400">Easy management</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
