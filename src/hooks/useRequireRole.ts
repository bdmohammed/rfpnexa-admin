'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/features/auth/hooks/useAuth';

export function useRequireRole() {
  const router = useRouter();
  const pathname = usePathname();

  // Replace this with your actual auth hook/store
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // Not authenticated
    if (!user) {
      router.replace(`/403`);
      return;
    }

    // Admin has no role
    if (
      user.accountType === 'admin' &&
      user.roles.length === 0
    ) {
      router.replace('/403');
    }
  }, [user, isLoading, pathname, router]);
}