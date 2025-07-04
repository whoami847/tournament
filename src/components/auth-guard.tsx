'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import FullPageLoader from './loader';
import { type ReactNode, useEffect } from 'react';
import { signOutUser } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';

const PUBLIC_ROUTES = ['/login', '/register'];

export default function AuthGuard({ children }: { children: ReactNode }) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();

    useEffect(() => {
        if (!loading && profile?.status === 'banned') {
            signOutUser();
            toast({
                title: 'Access Denied',
                description: 'Your account has been banned by an administrator.',
                variant: 'destructive'
            });
            // The onAuthStateChanged listener will handle the redirect to /login
        }
    }, [profile, loading, toast]);
    
    if (loading) {
        return <FullPageLoader />;
    }
    
    // Don't render anything if the user is banned and we're waiting for sign out/redirect
    if (profile?.status === 'banned') {
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
