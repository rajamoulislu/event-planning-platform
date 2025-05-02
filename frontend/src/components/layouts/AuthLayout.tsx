'use client';
import { useEffect } from 'react';
import { AuthLayoutProps } from '@/interface';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthLayout({ children, requireAuth = true }: AuthLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (requireAuth && !token) {
            router.replace('/login');
        } else if (!requireAuth && token && ['/login', '/register'].includes(pathname as string)) {
            router.replace('/dashboard');
        }
    }, [requireAuth, pathname]);

    return <>{children}</>;
}