import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Shield,
  Layers,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

export const ADMIN_NAV: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Posts',
    to: '/posts',
    icon: FileText,
  },
  {
    label: 'Usuários',
    to: '/users',
    icon: Users,
  },
  {
    label: 'Configurações',
    to: '/settings',
    icon: Settings,
  },
];
