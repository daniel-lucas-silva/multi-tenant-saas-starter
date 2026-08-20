export function Stage({ children }: { children: React.ReactNode }) {
  return <main className="bg-background flex min-w-0 flex-1 flex-col transition-all duration-300">{children}</main>;
}

export function StageHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-background/80 grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-4 py-3 backdrop-blur sm:px-6">
      {children}
    </div>
  );
}

export function StageContent({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>;
}

export function StageFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-card flex items-center justify-end gap-2 border-t px-4 py-3 sm:px-6">
      {children}
    </div>
  );
}
