'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import FullPageLoader from './loader';
import { type ReactNode } from 'react';

const PUBLIC_ROUTES = ['/login', '/register'];

export default function AuthGuard({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    if (loading) {
        return <FullPageLoader />;
    }

    const pathIsPublic = PUBLIC_ROUTES.includes(pathname);

    // If user is not logged in and trying to access a protected route, redirect to login
    if (!user && !pathIsPublic) {
        router.replace('/login');
        return <FullPageLoader />;
    }
    
    // If user is logged in and trying to access a public route (login/register), redirect to home
    if (user && pathIsPublic) {
        router.replace('/');
        return <FullPageLoader />;
    }

    // If the route is public and there's no user, render the public page (login/register)
    if (!user && pathIsPublic) {
        return <>{children}</>;
    }

    // If user is logged in and on a protected route, render the page with its layout
    if (user && !pathIsPublic) {
        return <>{children}</>;
    }
    
    // Fallback loader
    return <FullPageLoader />;
}
