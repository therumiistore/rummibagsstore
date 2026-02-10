/**
 * Dashboard Layout Component
 * Wraps all dashboard pages with sidebar and header
 */

import { useState } from 'react';
import Head from 'next/head';
import Sidebar from './Sidebar';
import Header from './Header';
import { withAuth } from '@/lib/dashboardAuth';

function DashboardLayout({ children, title = 'Dashboard', pageTitle }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fullTitle = pageTitle ? `${pageTitle} | StoreBuilder` : 'StoreBuilder Dashboard';

    return (
        <>
            <Head>
                <title>{fullTitle}</title>
                <meta name="description" content="Manage your online store" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="min-h-screen bg-gray-50">
                {/* Sidebar */}
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Main Content Area */}
                <div className="lg:ml-64 min-h-screen flex flex-col">
                    {/* Header */}
                    <Header
                        onMenuClick={() => setIsSidebarOpen(true)}
                        title={title}
                    />

                    {/* Page Content */}
                    <main className="flex-1 p-4 lg:p-6">
                        {children}
                    </main>

                    {/* Footer */}
                    <footer className="px-4 lg:px-6 py-4 border-t border-gray-200 bg-white">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
                            <p>© 2024 StoreBuilder. All rights reserved.</p>
                            <div className="flex items-center gap-4">
                                <a href="#" className="hover:text-gray-700 transition-colors">Help</a>
                                <a href="#" className="hover:text-gray-700 transition-colors">Documentation</a>
                                <a href="#" className="hover:text-gray-700 transition-colors">Support</a>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}

// Export wrapped with auth protection
export default withAuth(DashboardLayout);

// Also export unwrapped version for custom use
export { DashboardLayout as DashboardLayoutUnwrapped };
