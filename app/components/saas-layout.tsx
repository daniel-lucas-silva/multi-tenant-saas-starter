import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Zap,
  Settings,
  CreditCard,
  KeyRound,
  Gift,
  ShieldCheck,
  LogOut,
  Bell,
  Sparkles,
} from 'lucide-react';
import { AppShell } from './app-shell';
import { TopNav } from './top-nav';
import { BottomTabs, type TabItem } from './bottom-tabs';
import { TenantSwitcher } from '@/shared/components/tenant-switcher';
import { useAuth, useTenant } from '@/shared/stores';

interface SaasLayoutProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
}

export function SaasLayout({
  title,
  subtitle,
  onBack,
  rightAction,
  children,
}: SaasLayoutProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { user, logout, status, login } = useAuth();
  const { planId, currentTenant } = useTenant();
  const [loggingIn, setLoggingIn] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);

  const handleDemoLogin = async () => {
    setLoggingIn(true);
    setLoginError(null);
    try {
      await login({ email: 'admin@payload.local', password: 'admin123456' });
      window.location.reload();
    } catch (err: any) {
      setLoginError(err?.message || 'Erro ao autenticar com conta demo');
    } finally {
      setLoggingIn(false);
    }
  };

  React.useEffect(() => {
    if (status === 'ready' && !user) {
      window.location.href = '/auth/login';
    }
  }, [user, status]);

  if (status === 'loading' || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  const isSuperAdmin = Boolean(user?.roles?.includes('admin'));

  const bottomTabs: TabItem[] = [
    {
      id: 'home',
      label: 'Início',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/',
      active: currentPath === '/',
    },
    {
      id: 'projects',
      label: 'Projetos',
      icon: <FolderKanban className="h-5 w-5" />,
      href: '/projects',
      active: currentPath.startsWith('/projects'),
    },
    {
      id: 'team',
      label: 'Times',
      icon: <Users className="h-5 w-5" />,
      href: '/team',
      active: currentPath.startsWith('/team'),
    },
    {
      id: 'automations',
      label: 'Automações',
      icon: <Zap className="h-5 w-5" />,
      href: '/automations',
      active: currentPath.startsWith('/automations'),
    },
    {
      id: 'settings',
      label: 'Ajustes',
      icon: <Settings className="h-5 w-5" />,
      href: '/settings',
      active:
        currentPath.startsWith('/settings') ||
        currentPath.startsWith('/billing') ||
        currentPath.startsWith('/developers') ||
        currentPath.startsWith('/referrals'),
    },
  ];

  const sidebarLinks = [
    { label: 'Visão Geral', href: '/', icon: LayoutDashboard, exact: true },
    { label: 'Projetos & Tarefas', href: '/projects', icon: FolderKanban },
    { label: 'Equipe & Departamentos', href: '/team', icon: Users },
    { label: 'Automações & Filas', href: '/automations', icon: Zap },
    { label: 'Assinatura & Faturamento', href: '/billing', icon: CreditCard },
    { label: 'Chaves de API', href: '/developers', icon: KeyRound },
    { label: 'Indicações & Bônus', href: '/referrals', icon: Gift },
    { label: 'Configurações', href: '/settings', icon: Settings },
  ];

  const desktopSidebar = (
    <div className="flex h-full w-64 flex-col justify-between border-r border-border bg-card/60 p-4 backdrop-blur-md">
      <div className="space-y-6">
        {/* Workspace selector */}
        <div className="pt-2">
          <TenantSwitcher />
        </div>

        {/* Links */}
        <nav className="space-y-1">
          {sidebarLinks.map((item) => {
            const isActive = item.exact
              ? currentPath === item.href
              : currentPath.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Admin shortcut */}
      <div className="space-y-3 pt-4 border-t border-border">
        {/* Tier badge */}
        <div className="flex items-center justify-between rounded-xl bg-accent/60 p-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                Plano {planId}
              </p>
              <p className="text-[10px] text-muted-foreground">Workspace Ativo</p>
            </div>
          </div>
          <Link
            to="/billing"
            className="rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary hover:bg-primary/20"
          >
            Upgrade
          </Link>
        </div>

        {isSuperAdmin && (
          <a
            href="/admin"
            className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
          >
            <ShieldCheck className="h-4 w-4" />
            Painel Super Admin
          </a>
        )}

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="truncate text-xs">
              <p className="font-semibold text-foreground truncate">{user?.name || 'Usuário'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            title="Sair"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AppShell
      header={
        <TopNav
          title={title}
          subtitle={subtitle}
          onBack={onBack}
          leftAction={
            <div className="md:hidden">
              <TenantSwitcher />
            </div>
          }
          rightAction={
            rightAction || (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/billing"
                  className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 uppercase md:hidden"
                >
                  {planId}
                </Link>
                <button
                  type="button"
                  aria-label="Notificações"
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Bell className="h-4 w-4" />
                </button>
              </div>
            )
          }
        />
      }
      sidebar={desktopSidebar}
      bottomNav={<BottomTabs items={bottomTabs} />}
    >
      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full">{children}</div>
    </AppShell>
  );
}
