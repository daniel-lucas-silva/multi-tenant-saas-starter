import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  FileText,
  Users,
  Activity,
  Server,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Clock,
  Sparkles,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

import {
  Stage,
  StageHeader,
  StageContent,
  StageFooter,
} from '@/components/layout/stage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useCollection } from '@/shared/stores';
import { useBreakpoint } from '@/hooks/use-breakpoint';

export const Route = createFileRoute('/')({
  component: AdminDashboardPage,
});

const activityData = [
  { name: 'Seg', apiCalls: 1240, syncs: 410 },
  { name: 'Ter', apiCalls: 1980, syncs: 620 },
  { name: 'Qua', apiCalls: 2400, syncs: 890 },
  { name: 'Qui', apiCalls: 2100, syncs: 780 },
  { name: 'Sex', apiCalls: 3200, syncs: 1150 },
  { name: 'Sáb', apiCalls: 1800, syncs: 530 },
  { name: 'Dom', apiCalls: 1450, syncs: 480 },
];

const distributionData = [
  { status: 'Publicados', count: 48, fill: '#10b981' },
  { status: 'Rascunhos', count: 14, fill: '#f59e0b' },
  { status: 'Arquivados', count: 6, fill: '#64748b' },
  { status: 'Agendados', count: 9, fill: '#6366f1' },
];

function AdminDashboardPage() {
  const { data: posts, isFetching: isFetchingPosts, refetch: refetchPosts } = useCollection('posts');
  const { device, width } = useBreakpoint();

  const totalPosts = posts?.totalDocs ?? 0;

  return (
    <Stage>
      <StageHeader>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-foreground truncate">
              Painel Geral Administrativo
            </h1>
            <Badge variant="outline" className="hidden sm:inline-flex text-[11px] font-mono">
              Payload 3.88 API
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            Monitoramento de coleções, jobs em background e estado de sincronização
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchPosts()}
            disabled={isFetchingPosts}
            className="gap-1.5 text-xs hidden sm:inline-flex"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isFetchingPosts && 'animate-spin')} />
            Atualizar
          </Button>

          <Link
            to="."
            search={(prev: Record<string, unknown>) => ({ ...prev, spot: 'create-post' })}
          >
            <Button size="sm" className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              <span>Novo Post</span>
            </Button>
          </Link>
        </div>
      </StageHeader>

      <StageContent className="space-y-6">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total de Publicações
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isFetchingPosts && !posts ? '...' : totalPosts > 0 ? totalPosts : '28'}
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                <span className="text-emerald-500 font-medium">+12%</span> em relação à semana passada
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Usuários & Equipe
              </CardTitle>
              <Users className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12</div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                <span className="text-sky-500 font-medium">3 administradores</span> ativos hoje
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Jobs & Workflows
              </CardTitle>
              <Server className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">100%</div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                <span className="text-emerald-500 font-medium">Operacional</span> · Fila limpa
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Sync Engine Offline-First
              </CardTitle>
              <Activity className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">Ativo</div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                IndexedDB + Workbox BackgroundSync
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Traffic Chart */}
          <Card className="lg:col-span-2 border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Tráfego da API & Sincronizações
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Requisições REST e syncs executados nos últimos 7 dias
                  </p>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  Tempo Real
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="apiColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="syncColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="apiCalls"
                      name="Chamadas API"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#apiColor)"
                    />
                    <Area
                      type="monotone"
                      dataKey="syncs"
                      name="Syncs"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#syncColor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Distribution Bar Chart */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Status dos Conteúdos
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Distribuição de artigos por estado
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="status" stroke="#888888" fontSize={10} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" name="Quantidade" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Management & Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/posts"
            className="group block p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Gerenciar Posts</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Criar, editar e publicar artigos na collection de posts do Payload.
            </p>
          </Link>

          <Link
            to="/users"
            className="group block p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
                <Users className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-sky-500 transition-colors" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Controle de Usuários</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Gerenciar permissões de acesso, roles RBAC e contas do sistema.
            </p>
          </Link>

          <Link
            to="/settings"
            className="group block p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <Sliders className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Configurações & Tenant</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Ajustes de integrações, chaves de API, webhook e storage do sistema.
            </p>
          </Link>
        </div>

        {/* System Health Check */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Status dos Serviços do Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              <div className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-foreground font-medium">Servidor Bun + Payload 3.88 REST API</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                  Online
                </Badge>
              </div>
              <div className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-foreground font-medium">MongoDB / In-Memory Instance</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                  Conectado
                </Badge>
              </div>
              <div className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-foreground font-medium">Google Cloud Storage Adapter</span>
                <Badge variant="outline" className="bg-sky-500/10 text-sky-500 border-sky-500/20 text-[10px]">
                  Configurado
                </Badge>
              </div>
              <div className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-foreground font-medium">PWA Offline & Background Sync</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                  Registrado
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </StageContent>

      <StageFooter>
        <span className="text-muted-foreground mr-auto text-xs">
          Viewport: {width}px · Modo {device}
        </span>
        <span className="text-xs text-muted-foreground">
          Fullstack Payload 3.88 · TanStack
        </span>
      </StageFooter>
    </Stage>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
