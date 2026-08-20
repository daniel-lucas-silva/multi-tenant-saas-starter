import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Sliders,
  Save,
  Building,
  Key,
  Database,
  Cloud,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

import {
  Stage,
  StageHeader,
  StageContent,
  StageFooter,
} from '@/components/layout/stage';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const Route = createFileRoute('/settings')({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Stage>
      <StageHeader>
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-foreground tracking-tight truncate">
            Configurações & Tenant Multi-Organização
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            Gerenciamento do ambiente SaaS, banco de dados e integrações
          </p>
        </div>

        <Button size="sm" onClick={handleSave} className="h-8 gap-1.5 text-xs">
          <Save className="h-3.5 w-3.5" />
          <span>{saved ? 'Salvo!' : 'Salvar Alterações'}</span>
        </Button>
      </StageHeader>

      <StageContent className="space-y-6 max-w-4xl">
        {/* Tenant Configuration */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              Identidade do Tenant (Multi-Tenant Starter Ready)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Nome da Organização / Tenant
                </label>
                <input
                  type="text"
                  defaultValue="Minha Organização SaaS"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Tenant Slug / Domínio
                </label>
                <input
                  type="text"
                  defaultValue="minha-empresa"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground font-mono focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database & Storage */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Database className="h-4 w-4 text-sky-500" />
              Armazenamento & Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Driver de Banco
                </label>
                <input
                  type="text"
                  readOnly
                  value="MongoDB Memory Server / Mongo Cloud"
                  className="w-full rounded-lg border border-border bg-muted/50 px-3.5 py-2 text-sm text-muted-foreground font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Bucket Google Cloud Storage
                </label>
                <input
                  type="text"
                  defaultValue="meu-applet-media-bucket"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground font-mono focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-500" />
              Credenciais da API & Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Chave da API (Payload API-Key Auth)
              </label>
              <input
                type="password"
                readOnly
                value="payload_sec_99388271817293817"
                className="w-full rounded-lg border border-border bg-muted/50 px-3.5 py-2 text-sm text-muted-foreground font-mono focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>
      </StageContent>

      <StageFooter>
        <span className="text-[11px] text-muted-foreground">
          Preparado para remix multi-tenant no Google AI Studio
        </span>
      </StageFooter>
    </Stage>
  );
}
