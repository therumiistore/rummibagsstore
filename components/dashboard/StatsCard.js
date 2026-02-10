/**
 * Stats Card Component
 * Displays a metric with icon, value, trend indicator
 */

export default function StatsCard({
    title,
    value,
    icon,
    trend,
    trendValue,
    color = 'indigo',
    prefix = '',
    suffix = ''
}) {
    const colorClasses = {
        indigo: {
            bg: 'bg-indigo-50',
            icon: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
            trend: 'text-indigo-600',
        },
        purple: {
            bg: 'bg-purple-50',
            icon: 'bg-gradient-to-br from-purple-500 to-purple-600',
            trend: 'text-purple-600',
        },
        emerald: {
            bg: 'bg-emerald-50',
            icon: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
            trend: 'text-emerald-600',
        },
        amber: {
            bg: 'bg-amber-50',
            icon: 'bg-gradient-to-br from-amber-500 to-amber-600',
            trend: 'text-amber-600',
        },
        rose: {
            bg: 'bg-rose-50',
            icon: 'bg-gradient-to-br from-rose-500 to-rose-600',
            trend: 'text-rose-600',
        },
        blue: {
            bg: 'bg-blue-50',
            icon: 'bg-gradient-to-br from-blue-500 to-blue-600',
            trend: 'text-blue-600',
        },
    };

    const colors = colorClasses[color] || colorClasses.indigo;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group">
            <div className="flex items-start justify-between">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>

                {/* Trend */}
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-gray-500'
                        }`}>
                        {trend === 'up' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                            </svg>
                        )}
                        {trend === 'down' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                            </svg>
                        )}
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>

            {/* Value & Title */}
            <div className="mt-4">
                <p className="text-3xl font-bold text-gray-900">
                    {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                </p>
                <p className="text-sm text-gray-500 mt-1">{title}</p>
            </div>
        </div>
    );
}

// Icon components for convenience
export const StatsIcons = {
    sales: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    orders: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    products: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    ),
    visitors: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    revenue: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    cart: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
};
