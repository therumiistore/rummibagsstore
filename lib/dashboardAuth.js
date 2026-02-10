/**
 * Dashboard Authentication Context and Utilities
 * Provides auth state management for the dashboard
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from './api';

// Auth Context
const AuthContext = createContext({
    user: null,
    store: null,
    isLoading: true,
    isAuthenticated: false,
    login: async () => { },
    logout: async () => { },
    signup: async () => { },
    refreshUser: async () => { },
});

// Auth Provider Component
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [store, setStore] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Check for existing session on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const storedUser = localStorage.getItem('dashboard_user');
            const storedStore = localStorage.getItem('dashboard_store');
            const accessToken = localStorage.getItem('accessToken');

            if (storedUser && accessToken) {
                setUser(JSON.parse(storedUser));
                if (storedStore) setStore(JSON.parse(storedStore));

                // Verify token is still valid
                try {
                    const response = await api.getMe();
                    if (response.success) {
                        setUser(response.data.user);
                        setStore(response.data.store);
                        localStorage.setItem('dashboard_user', JSON.stringify(response.data.user));
                        localStorage.setItem('dashboard_store', JSON.stringify(response.data.store));
                    }
                } catch (error) {
                    // Token invalid, clear auth
                    api.clearTokens();
                    setUser(null);
                    setStore(null);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await api.login(email, password);

            if (response.success) {
                setUser(response.data.user);
                setStore(response.data.store);
                return { success: true };
            }

            return { success: false, error: response.error || 'Login failed' };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (storeName, email, password) => {
        setIsLoading(true);
        try {
            const response = await api.signup(storeName, email, password);

            if (response.success) {
                setUser(response.data.user);
                setStore(response.data.store);
                return { success: true };
            }

            return { success: false, error: response.error || 'Signup failed' };
        } catch (error) {
            console.error('Signup failed:', error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch (error) {
            // Ignore
        }
        setUser(null);
        setStore(null);
        router.push('/dashboard/login');
    };

    const refreshUser = async () => {
        try {
            const response = await api.getMe();
            if (response.success) {
                setUser(response.data.user);
                setStore(response.data.store);
            }
        } catch (error) {
            console.error('Refresh user failed:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                store,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
                signup,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// HOC to protect dashboard routes
export function withAuth(Component) {
    return function AuthenticatedComponent(props) {
        const { isAuthenticated, isLoading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!isLoading && !isAuthenticated) {
                router.push('/dashboard/login');
            }
        }, [isLoading, isAuthenticated, router]);

        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-900">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-400">Loading...</p>
                    </div>
                </div>
            );
        }

        if (!isAuthenticated) {
            return null;
        }

        return <Component {...props} />;
    };
}

export default AuthContext;
