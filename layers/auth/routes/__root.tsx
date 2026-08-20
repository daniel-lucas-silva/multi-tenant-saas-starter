import * as React from 'react';
import { createRootRoute, Outlet, Link } from '@tanstack/react-router';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const Route = createRootRoute({
  component: AuthRootLayout,
});

function AuthRootLayout() {
  return (
    <div className="min-h-dvh flex flex-col justify-between bg-background text-foreground selection:bg-primary selection:text-primary-foreground p-4 sm:p-8">
      {/* Top Bar */}
      <header className="flex items-center justify-between w-full max-w-5xl mx-auto py-2">
        <a
          href="/"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Voltar para o App</span>
        </a>

        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary border border-primary/20 p-1.5 rounded-lg">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="font-semibold text-xs tracking-tight text-foreground">
            Payload 3.88 Auth
          </span>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center py-4 border-t border-border/50 text-[11px] text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Fullstack Payload · Template Multi-Tenant Ready</span>
        <div className="flex items-center gap-4">
          <a href="/admin" className="hover:text-foreground transition-colors">
            Painel Admin
          </a>
          <a href="/" className="hover:text-foreground transition-colors">
            Frontend PWA
          </a>
        </div>
      </footer>
    </div>
  );
}
