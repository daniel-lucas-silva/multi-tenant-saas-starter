import { cn } from '@/shared/lib/utils';

export function Dock({
  children,
  collapsed,
  variant,
}: {
  children: React.ReactNode;
  collapsed?: boolean;
  variant: 'sidebar' | 'bottom';
}) {
  if (variant === 'bottom') {
    return (
      <nav className="border-border bg-sidebar text-sidebar-foreground z-30 flex h-16 shrink-0 items-stretch border-t transition-all duration-300">
        {children}
      </nav>
    );
  }
  return (
    <aside
      className={cn(
        'z-30 flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-out',
        collapsed ? 'w-18' : 'w-66',
      )}
    >
      {children}
    </aside>
  );
}

export function DockHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-sidebar-border flex h-16 items-center gap-3 border-b px-3">{children}</div>;
}

export function DockContent({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-y-auto p-2">{children}</div>;
}

export function DockFooter({ children }: { children: React.ReactNode }) {
  return <div className="border-sidebar-border border-t p-2">{children}</div>;
}
