import React from 'react';

const Skeleton = ({ className, variant = 'rect', ...props }) => {
    const baseClasses = "animate-pulse bg-slate-800/50 rounded";

    // Variant specific classes
    const variantClasses = {
        circle: "rounded-full",
        rect: "rounded-md",
        text: "h-4 rounded w-3/4",
        card: "p-6 rounded-2xl border border-white/10"
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant] || ''} ${className || ''}`}
            {...props}
        />
    );
};

export const DashboardSkeleton = () => (
    <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
            <Skeleton variant="rect" className="h-10 w-64" />
            <div className="flex gap-4">
                <Skeleton variant="circle" className="h-10 w-10" />
                <Skeleton variant="circle" className="h-10 w-10" />
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} variant="card" className="h-32" />
            ))}
        </div>

        {/* Main Content Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton variant="card" className="h-64" />
                <Skeleton variant="card" className="h-64" />
            </div>
            <div className="space-y-6">
                <Skeleton variant="card" className="h-96" />
            </div>
        </div>
    </div>
);

export default Skeleton;
