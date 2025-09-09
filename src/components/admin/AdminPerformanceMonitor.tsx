import React from 'react';
import { PerformanceMonitor } from '@/components/ui/performance-monitor';
import { useAdminRole } from '@/hooks/useAdminRole';

export const AdminPerformanceMonitor: React.FC = () => {
  const { isAdmin, loading } = useAdminRole();

  // Don't render anything while loading or if not admin
  if (loading || !isAdmin) {
    return null;
  }

  return <PerformanceMonitor />;
};