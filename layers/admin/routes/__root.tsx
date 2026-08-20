import * as React from 'react';
import { createRootRoute, Outlet, useSearch } from '@tanstack/react-router';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { AdaptiveLayout } from '@/components/layout/adaptive-layout';
import { AdminDock } from '../components/admin-dock';
import { AdminSpot } from '../components/admin-spot';

export interface AdminSearch {
  spot?: 'action' | 'drawer' | 'create-post';
}

export const Route = createRootRoute({
  validateSearch: (search: Record<string, unknown>): AdminSearch => {
    return {
      spot: search.spot as AdminSearch['spot'],
    };
  },
  component: AdminRootLayout,
});

function AdminRootLayout() {
  const { device, isMobile } = useBreakpoint();
  const search = useSearch({ from: '__root__' }) as AdminSearch;
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <AdaptiveLayout
      device={device}
      dock={
        <AdminDock
          isMobile={isMobile}
          collapsed={collapsed}
          onToggle={setCollapsed}
        />
      }
      stage={<Outlet />}
      spot={<AdminSpot spot={search.spot} />}
    />
  );
}
