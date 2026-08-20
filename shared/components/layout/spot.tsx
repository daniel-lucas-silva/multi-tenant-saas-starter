import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

export type SpotVariant = 'modal' | 'drawer' | 'sheet' | 'fullscreen';

export function Spot({
  open,
  onClose,
  variant,
  children,
}: {
  open: boolean;
  onClose: () => void;
  variant: SpotVariant;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const panel: Record<SpotVariant, string> = {
    modal: 'm-auto w-full max-w-[560px] rounded-2xl animate-in fade-in zoom-in-95 duration-200',
    drawer: 'ml-auto h-full w-full max-w-[380px] rounded-l-2xl animate-in slide-in-from-right duration-300',
    sheet: 'mt-auto max-h-[80%] min-h-[40%] w-full rounded-t-2xl animate-in slide-in-from-bottom duration-300',
    fullscreen: 'h-full w-full animate-in fade-in duration-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="bg-foreground/40 animate-in fade-in absolute inset-0 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn('relative flex flex-col overflow-hidden border border-border bg-card shadow-2xl', panel[variant])}
      >
        {children}
      </div>
    </div>
  );
}

export function SpotHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div className="border-border flex items-start justify-between gap-4 border-b px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-foreground truncate text-base font-semibold">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>}
      </div>
      <button
        onClick={onClose}
        aria-label="Fechar"
        className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function SpotContent({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>;
}

export function SpotFooter({ children }: { children: React.ReactNode }) {
  return <div className="border-border flex items-center justify-end gap-2 border-t px-5 py-3">{children}</div>;
}
