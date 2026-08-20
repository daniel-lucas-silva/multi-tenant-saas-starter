import * as React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

import {
  Dock,
  DockHeader,
  DockContent,
  DockFooter,
} from '@/shared/components/layout/dock';
import { ADMIN_NAV } from './nav';
import { useAuth } from '@/shared/stores';
import { cn } from '@/shared/lib/utils';

export function AdminDock({
  isMobile,
  collapsed,
  onToggle,
}: {
  isMobile: boolean;
  collapsed: boolean;
  onToggle: (v: boolean) => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (isMobile) {
    return (
      <Dock variant="bottom">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className="text-muted-foreground [&.active]:text-primary [&.active]:font-medium flex flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors py-1"
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </Dock>
    );
  }

  return (
    <Dock variant="sidebar" collapsed={collapsed}>
      <DockHeader>
        <div className="bg-primary/10 text-primary border border-primary/20 grid h-9 w-9 shrink-0 place-items-center rounded-xl font-semibold">
          <ShieldCheck className="h-5 w-5" />
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tracking-tight">Admin Console</p>
              <p className="text-muted-foreground truncate text-[11px]">Payload 3.88 API</p>
            </div>
            <button
              onClick={() => onToggle(true)}
              aria-label="Minimizar Dock"
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-colors"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        )}
      </DockHeader>

      <DockContent>
        {collapsed && (
          <button
            onClick={() => onToggle(false)}
            aria-label="Expandir Dock"
            className="text-muted-foreground hover:bg-muted hover:text-foreground mb-2 flex w-full items-center justify-center rounded-lg p-2.5 transition-colors"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}

        <div className="space-y-1">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                activeOptions={{ exact: item.exact }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground',
                  collapsed && 'justify-center px-0',
                  '[&.active]:bg-primary/10 [&.active]:text-primary [&.active]:font-semibold',
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {!collapsed && (
          <div className="pt-6 pb-2">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
              Atalhos Rápidos
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>App Principal (PWA)</span>
              </span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
            <a
              href="/auth"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>Portal Auth</span>
              </span>
              <ChevronRight className="h-3 w-3 opacity-60" />
            </a>
          </div>
        )}
      </DockContent>

      <DockFooter>
        <div className={cn('flex items-center gap-3 p-1.5', collapsed && 'justify-center p-0')}>
          {!collapsed ? (
            <div className="flex flex-1 items-center justify-between min-w-0">
              <div className="min-w-0 pr-2">
                <p className="truncate text-xs font-medium text-foreground">
                  {user?.email || 'admin@payload.local'}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">
                  {user ? 'Admin Conectado' : 'Modo Demonstração'}
                </p>
              </div>
              <button
                onClick={() => {
                  logout?.();
                  navigate({ to: '/' });
                }}
                title="Sair"
                className="text-muted-foreground hover:bg-muted hover:text-destructive rounded-md p-1.5 transition-colors shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                logout?.();
                navigate({ to: '/' });
              }}
              title="Sair"
              className="text-muted-foreground hover:bg-muted hover:text-destructive flex w-full justify-center rounded-md p-2 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </DockFooter>
    </Dock>
  );
}
