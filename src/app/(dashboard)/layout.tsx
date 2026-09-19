'use client';

import type { ReactNode } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRequireRole } from '@/hooks/useRequireRole';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  useRequireRole();
  return <DashboardLayout>{children}</DashboardLayout>;
}
