import { Search } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

export function Board({
  children,
  hidden,
  collapsed,
  fullWidth,
}: {
  children: React.ReactNode;
  hidden?: boolean;
  collapsed?: boolean;
  fullWidth?: boolean;
}) {
  if (hidden) return null;
  return (
    <section
      className={cn(
        'flex min-w-0 flex-col border-r border-border bg-card transition-[width] duration-300 ease-out',
        fullWidth ? 'w-full flex-1' : collapsed ? 'w-20 shrink-0' : 'w-75 shrink-0 xl:w-90',
      )}
    >
      {children}
    </section>
  );
}

export function BoardHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-border flex min-h-15 items-center justify-between gap-2 border-b px-4">{children}</div>;
}

export function BoardInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="border-border border-b p-3">
      <div className="bg-muted flex items-center gap-2 rounded-lg px-3 py-2">
        <Search className="text-muted-foreground h-4 w-4 shrink-0" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="text-foreground placeholder:text-muted-foreground w-full min-w-0 bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
}

export function BoardContent({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-y-auto">{children}</div>;
}

export function BoardFooter({ children }: { children: React.ReactNode }) {
  return <div className="border-border border-t p-3">{children}</div>;
}
